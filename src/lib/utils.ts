import countries from 'i18n-iso-countries';
import crypto from 'crypto';
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Checks if a string is a valid 2-character ISO country code
 */
export function isValidCountryCode(code: string): boolean {
  return code.length === 2 && countries.isValid(code.toUpperCase());
}

/**
 * Checks if a package name contains any country name
 */
export function containsCountryName(packageName: string): boolean {
  const lowercaseName = packageName.toLowerCase();
  const countryNames = Object.values(countries.getNames('en'));
  return countryNames.some(country => 
    lowercaseName.includes(country.toLowerCase())
  );
}

/**
 * Generates an HMAC signature for API authentication
 * @param data The data to sign
 * @param secretKey The secret key to use for signing
 * @returns The HMAC signature as a hex string
 */
export function generateHmacSignature(data: string, secretKey: string): string {
  return crypto
    .createHmac('sha256', secretKey)
    .update(data)
    .digest('hex');
}

/**
 * Determines if a package is multiregion based on its name and location
 * @param packageName The name of the package
 * @param location The location field from the package (can contain country codes)
 * @returns true if the package is multiregion, false otherwise
 */
export function isMultiRegionPackage(packageName: string, location?: string): boolean {
  if (!packageName) return false;
  
  const name = packageName.toLowerCase();
  
  // Special case: South Africa should never be considered multi-region
  if (location === 'ZA' || name.includes('south africa')) {
    return false;
  }
  
  // If location contains multiple country codes (comma-separated), it's multi-region
  if (location) {
    const countryCodes = location.split(',').map(code => code.trim().toUpperCase());
    if (countryCodes.length > 1 && countryCodes.every(code => isValidCountryCode(code))) {
      return true;
    }
  }
  
  // Check for continent names (with word boundaries to avoid matching country names)
  const continents = [
    '\\b(asia)\\b', 
    '\\b(europe)\\b', 
    '\\b(africa)\\b', 
    '\\b(north america)\\b', 
    '\\b(south america)\\b', 
    '\\b(oceania)\\b', 
    '\\b(central america)\\b'
  ];
  if (continents.some(continent => new RegExp(continent).test(name))) {
    return true;
  }
  
  // Check for multi-country indicators
  const multiCountryIndicators = ['&', 'multiple', 'multi', 'global', 'worldwide', 'international'];
  if (multiCountryIndicators.some(indicator => name.includes(indicator))) {
    return true;
  }
  
  // Check for specific multi-region packages
  const multiRegionPackages = [
    'middle-east', 'middle east', 'gulf', 'baltics', 'nordic', 'scandinavia', 
    'caribbean', 'mediterranean', 'balkans', 'central america', 'southeast asia'
  ];
  if (multiRegionPackages.some(region => name.includes(region))) {
    return true;
  }
  
  // If location is a single valid country code, it's not multi-region
  if (location && isValidCountryCode(location.trim().toUpperCase())) {
    return false;
  }
  
  // If none of the above, it's likely a single-region package
  return false;
}

/**
 * Gets a country name from a 2-character ISO code
 * @param code The 2-character ISO country code
 * @returns The country name or null if not found
 */
function getCountryNameFromCode(code: string): string | null {
  const countryMap: Record<string, string> = {
    'AX': 'Aaland Islands',
    'AF': 'Afghanistan',
    'AL': 'Albania',
    'DZ': 'Algeria',
    'AS': 'American Samoa',
    'AD': 'Andorra',
    'AO': 'Angola',
    'AI': 'Anguilla',
    'AQ': 'Antarctica',
    'AG': 'Antigua and Barbuda',
    'AR': 'Argentina',
    'AM': 'Armenia',
    'AW': 'Aruba',
    'AU': 'Australia',
    'AT': 'Austria',
    'AZ': 'Azerbaijan',
    'BS': 'Bahamas',
    'BH': 'Bahrain',
    'BD': 'Bangladesh',
    'BB': 'Barbados',
    'BY': 'Belarus',
    'BE': 'Belgium',
    'BZ': 'Belize',
    'BJ': 'Benin',
    'BM': 'Bermuda',
    'BT': 'Bhutan',
    'BO': 'Bolivia',
    'BA': 'Bosnia and Herzegovina',
    'BW': 'Botswana',
    'BR': 'Brazil',
    'BN': 'Brunei',
    'BG': 'Bulgaria',
    'BF': 'Burkina Faso',
    'BI': 'Burundi',
    'KH': 'Cambodia',
    'CM': 'Cameroon',
    'CA': 'Canada',
    'CV': 'Cape Verde',
    'KY': 'Cayman Islands',
    'CF': 'Central African Republic',
    'TD': 'Chad',
    'CL': 'Chile',
    'CN': 'China',
    'CO': 'Colombia',
    'KM': 'Comoros',
    'CD': 'Congo (Democratic Republic)',
    'CG': 'Congo (Republic)',
    'CR': 'Costa Rica',
    'CI': 'Côte d Ivoire',
    'HR': 'Croatia',
    'CU': 'Cuba',
    'CY': 'Cyprus',
    'CZ': 'Czech Republic',
    'DK': 'Denmark',
    'DJ': 'Djibouti',
    'DM': 'Dominica',
    'DO': 'Dominican Republic',
    'EC': 'Ecuador',
    'EG': 'Egypt',
    'SV': 'El Salvador',
    'GQ': 'Equatorial Guinea',
    'ER': 'Eritrea',
    'EE': 'Estonia',
    'ET': 'Ethiopia',
    'FJ': 'Fiji',
    'FI': 'Finland',
    'FR': 'France',
    'GA': 'Gabon',
    'GM': 'Gambia',
    'GE': 'Georgia',
    'DE': 'Germany',
    'GH': 'Ghana',
    'GR': 'Greece',
    'GD': 'Grenada',
    'GT': 'Guatemala',
    'GN': 'Guinea',
    'GW': 'Guinea-Bissau',
    'GY': 'Guyana',
    'HT': 'Haiti',
    'HN': 'Honduras',
    'HU': 'Hungary',
    'IS': 'Iceland',
    'IN': 'India',
    'ID': 'Indonesia',
    'IR': 'Iran',
    'IQ': 'Iraq',
    'IE': 'Ireland',
    'IL': 'Israel',
    'IT': 'Italy',
    'JM': 'Jamaica',
    'JP': 'Japan',
    'JO': 'Jordan',
    'KZ': 'Kazakhstan',
    'KE': 'Kenya',
    'KI': 'Kiribati',
    'KR': 'Korea, South',
    'KW': 'Kuwait',
    'KG': 'Kyrgyzstan',
    'LA': 'Laos',
    'LV': 'Latvia',
    'LB': 'Lebanon',
    'LS': 'Lesotho',
    'LR': 'Liberia',
    'LY': 'Libya',
    'LI': 'Liechtenstein',
    'LT': 'Lithuania',
    'LU': 'Luxembourg',
    'MK': 'North Macedonia',
    'MG': 'Madagascar',
    'MW': 'Malawi',
    'MY': 'Malaysia',
    'MV': 'Maldives',
    'ML': 'Mali',
    'MT': 'Malta',
    'MH': 'Marshall Islands',
    'MR': 'Mauritania',
    'MU': 'Mauritius',
    'MX': 'Mexico',
    'FM': 'Micronesia',
    'MD': 'Moldova',
    'MC': 'Monaco',
    'MN': 'Mongolia',
    'ME': 'Montenegro',
    'MA': 'Morocco',
    'MZ': 'Mozambique',
    'MM': 'Myanmar (Burma)',
    'NA': 'Namibia',
    'NR': 'Nauru',
    'NP': 'Nepal',
    'NL': 'Netherlands',
    'NZ': 'New Zealand',
    'NI': 'Nicaragua',
    'NE': 'Niger',
    'NG': 'Nigeria',
    'NO': 'Norway',
    'OM': 'Oman',
    'PK': 'Pakistan',
    'PW': 'Palau',
    'PA': 'Panama',
    'PG': 'Papua New Guinea',
    'PY': 'Paraguay',
    'PE': 'Peru',
    'PH': 'Philippines',
    'PL': 'Poland',
    'PT': 'Portugal',
    'QA': 'Qatar',
    'RO': 'Romania',
    'RU': 'Russia',
    'RW': 'Rwanda',
    'KN': 'Saint Kitts and Nevis',
    'LC': 'Saint Lucia',
    'VC': 'Saint Vincent and the Grenadines',
    'WS': 'Samoa',
    'SM': 'San Marino',
    'ST': 'Sao Tome and Principe',
    'SA': 'Saudi Arabia',
    'SN': 'Senegal',
    'RS': 'Serbia',
    'SC': 'Seychelles',
    'SL': 'Sierra Leone',
    'SG': 'Singapore',
    'SK': 'Slovakia',
    'SI': 'Slovenia',
    'SB': 'Solomon Islands',
    'SO': 'Somalia',
    'ZA': 'South Africa',
    'SS': 'South Sudan',
    'ES': 'Spain',
    'LK': 'Sri Lanka',
    'SD': 'Sudan',
    'SR': 'Suriname',
    'SE': 'Sweden',
    'CH': 'Switzerland',
    'SY': 'Syria',
    'TW': 'Taiwan',
    'TJ': 'Tajikistan',
    'TZ': 'Tanzania',
    'TH': 'Thailand',
    'TL': 'Timor-Leste',
    'TG': 'Togo',
    'TO': 'Tonga',
    'TT': 'Trinidad and Tobago',
    'TN': 'Tunisia',
    'TR': 'Turkey',
    'TM': 'Turkmenistan',
    'TV': 'Tuvalu',
    'UG': 'Uganda',
    'UA': 'Ukraine',
    'AE': 'United Arab Emirates',
    'GB': 'United Kingdom',
    'US': 'United States',
    'UY': 'Uruguay',
    'UZ': 'Uzbekistan',
    'VU': 'Vanuatu',
    'VA': 'Vatican City',
    'VE': 'Venezuela',
    'VN': 'Vietnam',
    'YE': 'Yemen',
    'ZM': 'Zambia',
    'ZW': 'Zimbabwe',
    'EU': 'Europe',
    'UK': 'United Kingdom'

  };
  
  return countryMap[code.toUpperCase()] || null;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format data size in bytes to a human-readable string
 * @param bytes Data size in bytes
 * @returns Formatted string (e.g., "100 MB")
 */
export function formatDataSize(bytes?: number): string {
  if (!bytes) return 'N/A';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

/**
 * Format a date to a localized string
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString();
}

/**
 * Format a currency amount
 * @param amount Amount in cents
 * @param currencyCode Currency code (e.g., "USD")
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount / 100);
} 