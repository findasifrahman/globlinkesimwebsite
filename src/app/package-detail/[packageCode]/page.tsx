'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress, 
  Alert, 
  Paper, 
  Chip, 
  Button, 
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import { 
  Public, 
  Flag, 
  AccessTime, 
  Speed, 
  Language, 
  LocalOffer, 
  Favorite, 
  FavoriteBorder,
  ShoppingCart,
  CheckCircle,
  Info,
  Refresh,
  LocationOn,
  Wifi,
  Message,
  CalendarToday,
  ArrowBack,
} from '@mui/icons-material';
import { ProcessedPackage } from '@/types/package';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAQ from '@/components/FAQ';
import OrderConfirmationModal from '@/components/OrderConfirmationModal';
import HowToGetEsim from '@/components/HowToGetEsim';
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
    'AL': 'Albania',
    'AD': 'Andorra',
    'AT': 'Austria',
    'BY': 'Belarus',
    'BE': 'Belgium',
    'BA': 'Bosnia and Herzegovina',
    'BG': 'Bulgaria',
    'HR': 'Croatia',
    'CY': 'Cyprus',
    'CZ': 'Czech Republic',
    'DK': 'Denmark',
    'EE': 'Estonia',
    'FI': 'Finland',
    'GR': 'Greece',
    'HU': 'Hungary',
    'IS': 'Iceland',
    'IE': 'Ireland',
    'IL': 'Israel',
    'LV': 'Latvia',
    'LI': 'Liechtenstein',
    'LT': 'Lithuania',
    'LU': 'Luxembourg',
    'MC': 'Monaco',
    'ME': 'Montenegro',
    'NL': 'Netherlands',
    'NO': 'Norway',
    'PL': 'Poland',
    'PT': 'Portugal',
    'RO': 'Romania',
    'SM': 'San Marino',
    'RS': 'Serbia',
    'SK': 'Slovakia',
    'SI': 'Slovenia',
    'SE': 'Sweden',
    'CH': 'Switzerland',
    'UA': 'Ukraine',
    'VA': 'Vatican City',
    'MO': 'Macau',
    'KH': 'Cambodia',
    'AX': 'Aaland Islands',
    'BB': 'Barbados',
    'PR': 'Puerto Rico',
    'JM': 'Jamaica',
    'PY': 'Paraguay',
    'DM': 'Dominica',
    'DO': 'Dominican Republic',
    'GD': 'Grenada',
    'GF': 'French Guiana',
    'KN': 'Saint Kitts and Nevis',
    'UY': 'Uruguay',
    'AG': 'Antigua and Barbuda',
    'MS': 'Montserrat',
    'AI': 'Anguilla',
    'GP': 'Guadeloupe',
    'CO': 'Colombia',
    'AN': 'Netherlands Antilles',
    'VC': 'Saint Vincent and the Grenadines',
    'KY': 'Cayman Islands',
    'TC': 'Turks and Caicos Islands',
    'AR': 'Argentina',
    'VG': 'Virgin Islands (British)',
    'PE': 'Peru',
    'LC': 'Saint Lucia',
    'BO': 'Bolivia',
    'MK': 'North Macedonia',
    'GG': 'Guernsey',
    'GI': 'Gibraltar',
    'IM': 'Isle of Man',
    'MT': 'Malta',
    'JE': 'Jersey',
    'TR': 'Turkey',
    'QA': 'Qatar',
    'BH': 'Bahrain',
    'IQ': 'Iraq',
    'KW': 'Kuwait',
    'SV': 'El Salvador',
    'MQ': 'Martinique',
    'HN': 'Honduras',
    'CL': 'Chile',
    'GT': 'Guatemala',
    'CR': 'Costa Rica',
    'PA': 'Panama',
    'NI': 'Nicaragua',
    'EC': 'Ecuador',
    'JO': 'Jordan',
    'AZ': 'Azerbaijan',
    'AM': 'Armenia',
    'OM': 'Oman',
    'BD': 'Bangladesh',
    'YE': 'Yemen',
    'RE': 'Réunion',
    'ZM': 'Zambia',
    'BF': 'Burkina Faso',
    'BN': 'Brunei',
    'SC': 'Seychelles',
    'SD': 'Sudan',
    'BW': 'Botswana',
    'KE': 'Kenya',
    'SN': 'Senegal',
    'KG': 'Kyrgyzstan',
    'KI': 'Kiribati',
    'CD': 'Democratic Republic of the Congo',
    'CG': 'Republic of the Congo',
    'CI': 'Côte d\'Ivoire',
    'SZ': 'Eswatini',
    'CM': 'Cameroon',
    'KZ': 'Kazakhstan',
    'TD': 'Chad',
    'TN': 'Tunisia',
    'LK': 'Sri Lanka',
    'LR': 'Liberia',
    'TZ': 'Tanzania',
    'UG': 'Uganda',
    'MA': 'Morocco',
    'DZ': 'Algeria',
    'MD': 'Moldova',
    'MG': 'Madagascar',
    'ML': 'Mali',
    'EG': 'Egypt',
    'UZ': 'Uzbekistan',
    'MW': 'Malawi',
    'NE': 'Niger',
    'NG': 'Nigeria',
    'GA': 'Gabon',
    'WS': 'Samoa',
    'GE': 'Georgia',
    'GH': 'Ghana',
    'GL': 'Greenland',
    'GW': 'Guinea-Bissau',
    'XK': 'Kosovo',
    'PK': 'Pakistan'
  };
  
  return countries[code] || code;
};

// Helper function to parse location string and get all country names
const getAllCountryNames = (location: string): string[] => {
  // If location is a single country code
  if (location.length === 2) {
    return [getCountryName(location)];
  }
  
  // If location contains multiple country codes
  const countryCodes = location.split(',').map(code => code.trim());
  return countryCodes.map(code => getCountryName(code));
};

export default function PackageDetailPage() {
  const params = useParams();
  const packageCode = params.packageCode as string;
  const router = useRouter();
  const theme = useTheme();
  
  const [packageData, setPackageData] = useState<ProcessedPackage | null>(null);
  const [relatedPackages, setRelatedPackages] = useState<ProcessedPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { data: session, status } = useSession();
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  useEffect(() => {
    // Try to get package data from localStorage first
    const findPackageFromLocalStorage = () => {
      try {
        const storedPackages = localStorage.getItem('packages');
        if (storedPackages) {
          const packages = JSON.parse(storedPackages);
          if (Array.isArray(packages)) {
            const foundPackage = packages.find(pkg => pkg.packageCode === packageCode);
            if (foundPackage) {
              setPackageData(foundPackage);
              
              // Find related packages (same country but different options)
              if (!foundPackage.multiregion) {
                const related = packages.filter(pkg => 
                  pkg.packageCode !== packageCode && 
                  !pkg.multiregion && 
                  pkg.location === foundPackage.location
                );
                setRelatedPackages(related);
              }
              
              setError(null);
              setLoading(false);
              return true;
            }
          }
        }
        return false;
      } catch (e) {
        console.error('Error parsing stored packages:', e);
        return false;
      }
    };

    // If not found in localStorage, fetch from API
    const fetchPackageFromAPI = async () => {
    try {
      setLoading(true);
        setError(null);
        
      const response = await fetch(`/api/packages/${packageCode}`);
        const data = await response.json();
      
      if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch package data');
        }
        
        if (!data.package) {
          throw new Error('Package data not found');
        }
        
      setPackageData(data.package);
        
        // Fetch related packages
        if (!data.package.multiregion) {
          const relatedResponse = await fetch('/api/packages');
          const relatedData = await relatedResponse.json();
          
          if (relatedData && Array.isArray(relatedData)) {
            const related = relatedData.filter(pkg => 
              pkg.packageCode !== packageCode && 
              !pkg.multiregion && 
              pkg.location === data.package.location
            );
            setRelatedPackages(related);
          }
        }
    } catch (err) {
        console.error('Error fetching package:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

    // Try localStorage first, then API if needed
    if (!findPackageFromLocalStorage()) {
      fetchPackageFromAPI();
    }
  }, [packageCode]);

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(`/package-detail/${params.packageCode}`));
      return;
    }
    
    // Add to cart logic would go here
    console.log(`Adding ${quantity} of ${packageData?.packageCode} to cart`);
  };

  const handleBuyNow = () => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(`/package-detail/${params.packageCode}`));
      return;
    }

    if (packageData) {
      setOrderModalOpen(true);
    }
  };

  const formatPackageName = (name: string) => {
    // Extract country/continent name (assuming it's in parentheses)
    const match = name.match(/\((.*?)\)/);
    if (match) {
      const countryName = match[1];
      const restOfName = name.replace(/\(.*?\)/, '').trim();
      return (
        <>
          {restOfName}{' '}
          <Typography component="span" color="primary" fontWeight="bold">
            ({countryName})
          </Typography>
        </>
      );
    }
    return name;
  };

  const handlePackageClick = (code: string) => {
    router.push(`/package-detail/${code}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error || !packageData) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert 
          severity="error"
          action={
            <Button 
              color="inherit" 
              size="small" 
              startIcon={<Refresh />}
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          }
        >
          {error || 'Package not found'}
        </Alert>
        
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Package Information
          </Typography>
          <Typography paragraph>
            We couldn't find the package you're looking for. This could be due to:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <Info color="info" />
              </ListItemIcon>
              <ListItemText primary="The package code may be incorrect" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Info color="info" />
              </ListItemIcon>
              <ListItemText primary="The package may have been removed" />
            </ListItem>
          </List>
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => router.push('/')}
              startIcon={<ArrowBack />}
            >
              Return to Home
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <>
      <Navbar />
    <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
            gap: 4 
          }}
        >
          {/* Left Column - Package Details */}
          <Box>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                mb: 3,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}
            >
              {/* Package Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {packageData.multiregion ? (
                  <Avatar 
                    sx={{ 
                      bgcolor: theme.palette.primary.main, 
                      mr: 2,
                      width: 56,
                      height: 56
                    }}
                  >
                    <Public sx={{ fontSize: 32 }} />
                  </Avatar>
                ) : (
                  <Avatar 
                    sx={{ 
                      bgcolor: theme.palette.secondary.main, 
                      mr: 2,
                      width: 56,
                      height: 56
                    }}
                  >
                    <Flag sx={{ fontSize: 32 }} />
                  </Avatar>
                )}
                <Box>
                  <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    {formatPackageName(packageData.packageName)}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {packageData.multiregion ? "Multi-Region Package" : `Single Country Package - ${getCountryName(packageData.location)}`}
                  </Typography>
                </Box>
                {packageData.favourite && (
                  <Favorite color="error" sx={{ ml: 2, fontSize: 28 }} />
                )}
              </Box>
              
              {/* Package Chips */}
              <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                <Chip 
                  label={packageData.multiregion ? "Multi-Region" : "Single Country"} 
                  color={packageData.multiregion ? "primary" : "secondary"} 
                  sx={{ fontWeight: 'bold' }}
                />
                <Chip 
                  label={`${packageData.duration} days`} 
                  variant="outlined" 
                  icon={<AccessTime />} 
                  sx={{ fontWeight: 'bold' }}
                />
                <Chip 
                  label={packageData.speed} 
                  variant="outlined" 
                  icon={<Speed />} 
                  sx={{ fontWeight: 'bold' }}
                />
                <Chip 
                  label={packageData.smsStatus ? "SMS Enabled" : "SMS Disabled"} 
                  variant="outlined" 
                  icon={packageData.smsStatus ? <Message /> : <Info />} 
                  color={packageData.smsStatus ? "success" : "default"}
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              {/* Package Details */}
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                Package Details
      </Typography>
      
              <Box 
                sx={{ 
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)'
                  },
                  gap: 2
                }}
              >
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Package Name:</strong> {formatPackageName(packageData.packageName)}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Package Code:</strong> {packageData.packageCode}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Location:</strong> {packageData.multiregion ? (
                      <Box component="span">
                        Multiple Countries:
                        <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                          {getAllCountryNames(packageData.location).map((country, index) => (
                            <Typography component="li" key={index} variant="body2">
                              {country}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    ) : getCountryName(packageData.location)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Data Speed:</strong> {packageData.speed}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Duration:</strong> {packageData.duration} days
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>SMS:</strong> {packageData.smsStatus ? "Enabled" : "Disabled"}
                  </Typography>
                </Box>
              </Box>
              
              {packageData.operators && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Supported Operators
                  </Typography>
                  <Typography variant="body1">
                    {packageData.operators}
                  </Typography>
                </Box>
              )}
            </Paper>
            
            {/* Package Description */}
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3,
                mb: 3,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                Package Description
              </Typography>
              <Typography paragraph>
                This {packageData.multiregion ? "multi-region" : "single-country"} package provides {packageData.speed} connectivity for {packageData.duration} days.
                {packageData.smsStatus ? " SMS messaging is included." : " SMS messaging is not included."}
              </Typography>
              <Typography paragraph>
                Perfect for {packageData.multiregion 
                  ? "travelers visiting multiple countries" 
                  : `travelers visiting ${getCountryName(packageData.location)}`}.
              </Typography>
            </Paper>

            {/* Purchase Options - Now appears here in mobile view */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  mb: 3,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              >
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                  Purchase Options
      </Typography>
      
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h4" color="primary" sx={{ mr: 2, fontWeight: 'bold' }}>
                    {packageData.currencyCode} {(packageData.retailPrice / 10000).toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    per package
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Typography variant="body1" sx={{ mr: 2, fontWeight: 'bold' }}>
                    Quantity:
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => handleQuantityChange(-1)}
                    sx={{ minWidth: 40 }}
                  >
                    -
                  </Button>
                  <Typography variant="body1" sx={{ mx: 2, minWidth: 30, textAlign: 'center', fontWeight: 'bold' }}>
                    {quantity}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => handleQuantityChange(1)}
                    sx={{ minWidth: 40 }}
                  >
                    +
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    size="large"
                    onClick={handleBuyNow}
                    sx={{ 
                      py: 1.5,
                      fontWeight: 'bold',
                      borderRadius: 2
                    }}
                  >
                    Buy Now
                  </Button>
                </Box>
                
                <Box 
                  sx={{ 
                    mt: 3, 
                    p: 2, 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                  }}
                >
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    Total: {packageData.currencyCode} {((packageData.retailPrice / 10000) * quantity).toFixed(2)}
                  </Typography>
                </Box>
              </Paper>
      </Box>
      
            {/* Related Packages Section */}
            {!packageData.multiregion && relatedPackages.length > 0 && (
              <Box sx={{ mt: 6 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                  More {getCountryName(packageData.location)} Packages
                </Typography>
                <Typography variant="body1" paragraph>
                  Check out these other packages for {getCountryName(packageData.location)}:
                </Typography>
                
                <Box 
                  sx={{ 
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)'
                    },
                    gap: 3
                  }}
                >
                  {relatedPackages.map((pkg) => (
                    <Card 
                key={pkg.packageCode} 
                      elevation={2} 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: 6,
                          cursor: 'pointer'
                        }
                      }}
                      onClick={() => handlePackageClick(pkg.packageCode)}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Flag color="secondary" sx={{ mr: 1 }} />
                          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                            {formatPackageName(pkg.packageName)}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          <Chip 
                            label={`${pkg.duration} days`} 
                            size="small"
                            variant="outlined" 
                          />
                          <Chip 
                            label={pkg.speed} 
                            size="small"
                            variant="outlined" 
                          />
                          {pkg.smsStatus && (
                            <Chip 
                              label="SMS" 
                              size="small"
                              color="success" 
                            />
                          )}
                        </Box>
                        
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                          {pkg.currencyCode} {(pkg.retailPrice / 10000).toFixed(2)}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          color="primary"
                          endIcon={<ArrowBack />}
                        >
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
            ))}
          </Box>
              </Box>
            )}
          </Box>
          
          {/* Right Column - Purchase Options (Desktop only) */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                position: 'sticky', 
                top: 20,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                Purchase Options
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" color="primary" sx={{ mr: 2, fontWeight: 'bold' }}>
                  {packageData.currencyCode} {(packageData.retailPrice / 10000).toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  per package
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography variant="body1" sx={{ mr: 2, fontWeight: 'bold' }}>
                  Quantity:
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => handleQuantityChange(-1)}
                  sx={{ minWidth: 40 }}
                >
                  -
                </Button>
                <Typography variant="body1" sx={{ mx: 2, minWidth: 30, textAlign: 'center', fontWeight: 'bold' }}>
                  {quantity}
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => handleQuantityChange(1)}
                  sx={{ minWidth: 40 }}
                >
                  +
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  size="large"
                  onClick={handleBuyNow}
                  sx={{ 
                    py: 1.5,
                    fontWeight: 'bold',
                    borderRadius: 2
                  }}
                >
                  Buy Now
                </Button>
              </Box>
              
              <Box 
                sx={{ 
                  mt: 3, 
                  p: 2, 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                }}
              >
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                  Total: {packageData.currencyCode} {((packageData.retailPrice / 10000) * quantity).toFixed(2)}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
        <HowToGetEsim />
      </Container>

      <FAQ />
      <Footer />
      
      {packageData && (
        <OrderConfirmationModal
          open={orderModalOpen}
          onClose={() => setOrderModalOpen(false)}
          packageDetails={packageData}
          quantity={quantity}
        />
      )}
    </>
  );
} 