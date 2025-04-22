// Helper function to get country name from code
const getCountryName = (code: string): string => {
  const countries: Record<string, string> = {
    'AU': 'Australia',
    'US': 'United States',
    'GB': 'United Kingdom',
    'CA': 'Canada',
    'DE': 'Germany',
    'FR': 'France',
    'IT': 'Italy',
    'ES': 'Spain',
    'JP': 'Japan',
    'CN': 'China',
    'IN': 'India',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'RU': 'Russia',
    'ZA': 'South Africa',
    'AE': 'United Arab Emirates',
    'SG': 'Singapore',
    'MY': 'Malaysia',
    'TH': 'Thailand',
    'VN': 'Vietnam',
    'ID': 'Indonesia',
    'PH': 'Philippines',
    'KR': 'South Korea',
    'HK': 'Hong Kong',
    'TW': 'Taiwan',
    'NZ': 'New Zealand',
    'EU': 'European Union',
    'AS': 'Asia',
    'AF': 'Africa',
    'NA': 'North America',
    'SA': 'South America',
    'OC': 'Oceania',
    'MO': 'Macau',
    'KH': 'Cambodia',
    'BB': 'Barbados',
    'PR': 'Puerto Rico',
    'AR': 'Argentina',
    // ... add all other country codes here
  };
  
  return countries[code] || code;
};

// Update the price display in the component
<Typography variant="h6" color="primary">
  {packageData.currencyCode} {(packageData.price / 10000).toFixed(2)}
</Typography>

// Update the location display
<Typography variant="body1">
  Location: {getCountryName(packageData.location)}
</Typography> 