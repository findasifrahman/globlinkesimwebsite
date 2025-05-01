import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Modal,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { Search, Public } from '@mui/icons-material';
import ReactCountryFlag from 'react-country-flag';

// Define country lists
const SingleRegionCountry = [
  "Mexico", "Albania", "South Korea", "Vietnam", "Malaysia", "Singapore",
  "Thailand", "Japan", "Indonesia", "Jamaica", "United States",
  "United Arab Emirates", "Spain", "Egypt", "India", "Italy", "France",
  "Germany", "Turkey", "Norway", "Tunisia", "Portugal", "Belgium",
  "United Kingdom", "Argentina", "Chile", "Canada", "Australia",
  "Philippines", "Colombia", "Brazil", "Pakistan", "New Zealand",
  "Nigeria", "Morocco", "Switzerland", "Kuwait", "Uzbekistan", "Kenya",
  "Uruguay", "Kazakhstan", "Tanzania", "Sri Lanka", "Honduras", "Serbia",
  "Senegal", "Algeria", "Russia", "Reunion", "Qatar", "Puerto Rico",
  "Guatemala", "Peru", "Paraguay", "China mainland","china", "Hong Kong", "Ireland",
  "Ukraine", "Mauritius", "South Africa", "Guam", "Iraq",
  "Brunei Darussalam", "Bahrain", "Macao", "Slovenia", "Slovakia", "Romania",
  "Poland", "Netherlands", "Israel", "Bulgaria", "Luxembourg", "Iceland",
  "Finland", "Estonia", "Cyprus", "Lithuania", "Latvia", "Hungary",
  "Denmark", "Czech Republic", "Croatia", "Greece", "Belarus", "Bolivia",
  "Mozambique", "Guadeloupe", "Bangladesh", "Oman", "Saudi Arabia",
  "Jordan", "Guernsey", "Dominican Republic", "Cambodia", "Armenia",
  "Kyrgyzstan", "Jersey", "Isle of Man", "Georgia", "Aaland Islands",
  "Malta", "Cameroon", "Bosnia and Herzegovina", "Nepal", "Mongolia",
  "Montenegro", "Monaco", "Moldova", "North Macedonia", "Liechtenstein",
  "Kosovo", "Burkina Faso", "Gibraltar", "Zambia", "Sudan", "Seychelles",
  "Liberia", "Cote d'Ivoire", "Congo", "Chad", "Central African Republic",
  "Malawi", "Uganda", "Swaziland", "Niger", "Mali", "Gabon", "Botswana",
  "Madagascar", "Panama", "Nicaragua", "El Salvador", "Ecuador",
  "Costa Rica", "Yemen", "Azerbaijan", "Austria"
];

const MultiRegionCountry = [
  "Asia",
  "Asia-20",
  "China mainland & Japan & South Korea",
  "Singapore & Malaysia & Thailand",
  "Asia (7 areas)",
  "Asia (12 areas)",
  "China (mainland HK Macao)",
  "Caribbean",
  "Gulf Region",
  "Central Asia",
  "Europe",
  "Global",
  "North America",
  "Asia Pacific",
  "European Union",
  "South America",
  "Europe Plus",
  "Middle East",
  "South America Plus",
  "USA & Canada",
  "New Zealand & Australia",
  "Africa"
];

interface Package {
  packageName: string;
  packageCode: string;
  retailPrice: number;
  multiregion: boolean;
}

// Helper function to get country code
const getCountryCode = (countryName: string): string => {
  const countryMap: { [key: string]: string } = {
    'Mexico': 'MX',
    'Albania': 'AL',
    'South Korea': 'KR',
    'Vietnam': 'VN',
    'Malaysia': 'MY',
    'Singapore': 'SG',
    'Thailand': 'TH',
    'Japan': 'JP',
    'Indonesia': 'ID',
    'Jamaica': 'JM',
    'United States': 'US',
    'United Arab Emirates': 'AE',
    'Spain': 'ES',
    'Egypt': 'EG',
    'India': 'IN',
    'Italy': 'IT',
    'France': 'FR',
    'Germany': 'DE',
    'Turkey': 'TR',
    'Norway': 'NO',
    'Tunisia': 'TN',
    'Portugal': 'PT',
    'Belgium': 'BE',
    'United Kingdom': 'GB',
    'Argentina': 'AR',
    'Chile': 'CL',
    'Canada': 'CA',
    'Australia': 'AU',
    'Philippines': 'PH',
    'Colombia': 'CO',
    'Brazil': 'BR',
    'Pakistan': 'PK',
    'New Zealand': 'NZ',
    'Nigeria': 'NG',
    'Morocco': 'MA',
    'Switzerland': 'CH',
    'Kuwait': 'KW',
    'Uzbekistan': 'UZ',
    'Kenya': 'KE',
    'Uruguay': 'UY',
    'Kazakhstan': 'KZ',
    'Tanzania': 'TZ',
    'Sri Lanka': 'LK',
    'Honduras': 'HN',
    'Serbia': 'RS',
    'Senegal': 'SN',
    'Algeria': 'DZ',
    'Russia': 'RU',
    'Reunion': 'RE',
    'Qatar': 'QA',
    'Puerto Rico': 'PR',
    'Guatemala': 'GT',
    'Peru': 'PE',
    'Paraguay': 'PY',
    'China mainland': 'CN',
    'china': 'CN',
    'Hong Kong': 'HK',
    'Ireland': 'IE',
    'Ukraine': 'UA',
    'Mauritius': 'MU',
    'South Africa': 'ZA',
    'Guam': 'GU',
    'Iraq': 'IQ',
    'Brunei Darussalam': 'BN',
    'Bahrain': 'BH',
    'Macao': 'MO',
    'Slovenia': 'SI',
    'Slovakia': 'SK',
    'Romania': 'RO',
    'Poland': 'PL',
    'Netherlands': 'NL',
    'Israel': 'IL',
    'Bulgaria': 'BG',
    'Luxembourg': 'LU',
    'Iceland': 'IS',
    'Finland': 'FI',
    'Estonia': 'EE',
    'Cyprus': 'CY',
    'Lithuania': 'LT',
    'Latvia': 'LV',
    'Hungary': 'HU',
    'Denmark': 'DK',
    'Czech Republic': 'CZ',
    'Croatia': 'HR',
    'Greece': 'GR',
    'Belarus': 'BY',
    'Bolivia': 'BO',
    'Mozambique': 'MZ',
    'Guadeloupe': 'GP',
    'Bangladesh': 'BD',
    'Oman': 'OM',
    'Saudi Arabia': 'SA',
    'Jordan': 'JO',
    'Guernsey': 'GG',
    'Dominican Republic': 'DO',
    'Cambodia': 'KH',
    'Armenia': 'AM',
    'Kyrgyzstan': 'KG',
    'Jersey': 'JE',
    'Isle of Man': 'IM',
    'Georgia': 'GE',
    'Aaland Islands': 'AX',
    'Malta': 'MT',
    'Cameroon': 'CM',
    'Bosnia and Herzegovina': 'BA',
    'Nepal': 'NP',
    'Mongolia': 'MN',
    'Montenegro': 'ME',
    'Monaco': 'MC',
    'Moldova': 'MD',
    'North Macedonia': 'MK',
    'Liechtenstein': 'LI',
    'Kosovo': 'XK',
    'Burkina Faso': 'BF',
    'Gibraltar': 'GI',
    'Zambia': 'ZM',
    'Sudan': 'SD',
    'Seychelles': 'SC',
    'Liberia': 'LR',
    'Cote d\'Ivoire': 'CI',
    'Congo': 'CG',
    'Chad': 'TD',
    'Central African Republic': 'CF',
    'Malawi': 'MW',
    'Uganda': 'UG',
    'Swaziland': 'SZ',
    'Niger': 'NE',
    'Mali': 'ML',
    'Gabon': 'GA',
    'Botswana': 'BW',
    'Madagascar': 'MG',
    'Panama': 'PA',
    'Nicaragua': 'NI',
    'El Salvador': 'SV',
    'Ecuador': 'EC',
    'Costa Rica': 'CR',
    'Yemen': 'YE',
    'Azerbaijan': 'AZ',
    'Austria': 'AT'
  };
  return countryMap[countryName] || '';
};

export default function PackageList() {
  const router = useRouter();
  const [allPackages, setAllPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [regionType, setRegionType] = useState<'single' | 'multi'>('single');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  // Fetch all packages once when component mounts
  useEffect(() => {
    fetchAllPackages();
  }, []);

  const fetchAllPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if packages are already in localStorage
      const storedPackages = localStorage.getItem('packages');
      if (storedPackages) {
        try {
          const parsedPackages = JSON.parse(storedPackages);
          if (Array.isArray(parsedPackages) && parsedPackages.length > 0) {
            setAllPackages(parsedPackages);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error('Error parsing stored packages:', e);
          // If parsing fails, continue to fetch from API
        }
      }
      
      // If not in localStorage or parsing failed, fetch from API
      const response = await fetch('/api/packages');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Store in localStorage for future use
      localStorage.setItem('packages', JSON.stringify(data));
      
      setAllPackages(data);
    } catch (error) {
      console.error('Error fetching packages:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  const handleRegionTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newRegionType: 'single' | 'multi' | null,
  ) => {
    if (newRegionType !== null) {
      setRegionType(newRegionType);
      setSearchQuery(''); // Reset search when changing region type
    }
  };

  const handleRegionClick = (region: string) => {
    setSelectedRegion(region);
    const filtered = allPackages.filter(pkg => {
      // For single region, only show packages that match the region and are not multi-region
      if (regionType === 'single') {
        return pkg.packageName.toLowerCase().includes(region.toLowerCase()) && !pkg.multiregion;
      }
      // For multi region, only show packages that match the region and are multi-region
      return pkg.packageName.toLowerCase().includes(region.toLowerCase()) && pkg.multiregion;
    });
    setFilteredPackages(filtered);
    setModalOpen(true);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  // Filter countries/regions based on the current region type and search query
  const filteredCountries = regionType === 'single' 
    ? SingleRegionCountry.filter(country => 
        country.toLowerCase().includes(searchQuery)
      )
    : MultiRegionCountry.filter(region => 
        region.toLowerCase().includes(searchQuery)
      );

  const handlePackageClick = async (packageCode: string) => {
    setIsNavigating(true);
    setModalOpen(false);
    try {
      await router.push(`/package-detail/${packageCode}`);
    } catch (error) {
      console.error('Navigation error:', error);
      setIsNavigating(false);
    }
  };

  const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxHeight: '80vh',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    overflow: 'auto',
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <ToggleButtonGroup
          value={regionType}
          exclusive
          onChange={handleRegionTypeChange}
          aria-label="region type"
          sx={{
            '& .MuiToggleButton-root': {
              px: 3,
              py: 1,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              },
            },
          }}
        >
          <ToggleButton value="single" aria-label="single-region">
            Single-Region
          </ToggleButton>
          <ToggleButton value="multi" aria-label="multi-region">
            Multi-Region
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder={`Search ${regionType === 'multi' ? 'multi-region' : 'single-region'} packages...`}
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 2,
        justifyContent: 'flex-start',
        maxWidth: '1400px',
        margin: '0 auto',
        px: 2,
        width: '100%'
      }}>
        {filteredCountries.map((country) => (
          <Button
            key={country}
            variant="outlined"
            onClick={() => handleRegionClick(country)}
            sx={{ 
              width: '300px',
              height: '60px',
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '1.2rem',
              fontWeight: 700,
              position: 'relative',
              backgroundColor: 'white',
              color: 'primary.main',
              border: '2px solid',
              borderColor: 'transparent',
              boxShadow: '0 4px 0 rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 2,
              px: 2,
              '&:hover': {
                backgroundColor: 'primary.light',
                transform: 'translateY(2px)',
                boxShadow: '0 2px 0 rgba(0,0,0,0.1)',
                borderColor: 'transparent',
              },
              '&:active': {
                transform: 'translateY(4px)',
                boxShadow: '0 0 0 rgba(0,0,0,0.1)',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '8px',
                background: 'linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0))',
                pointerEvents: 'none',
              }
            }}
          >
            {regionType === 'single' ? (
              <>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  flexShrink: 0
                }}>
                  <ReactCountryFlag
                    countryCode={getCountryCode(country)}
                    svg
                    style={{
                      width: '32px',
                      height: '32px',
                      objectFit: 'cover'
                    }}
                    title={country}
                  />
                </Box>
                <Typography sx={{ 
                  flex: 1,
                  textAlign: 'left',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: 700
                }}>
                  {country}
                </Typography>
              </>
            ) : (
              <>
                <Public sx={{ 
                  fontSize: '1.5rem',
                  flexShrink: 0
                }} />
                <Typography sx={{ 
                  flex: 1,
                  textAlign: 'left',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: 700
                }}>
                  {country}
                </Typography>
              </>
            )}
          </Button>
        ))}
      </Box>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="package-modal-title"
      >
        <Box sx={modalStyle}>
          {isNavigating && (
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 9999,
              }}
            >
              <CircularProgress 
                size={80} 
                thickness={4}
                sx={{
                  color: 'white',
                }}
              />
            </Box>
          )}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            mb: 4,
            width: '100%',
            maxWidth: '1400px',
            flexShrink: 0
          }}>
            {regionType === 'single' && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                flexShrink: 0
              }}>
                <ReactCountryFlag
                  countryCode={getCountryCode(selectedRegion || '')}
                  svg
                  style={{
                    width: '48px',
                    height: '48px',
                    objectFit: 'cover'
                  }}
                  title={selectedRegion}
                />
              </Box>
            )}
            <Typography 
              id="package-modal-title" 
              variant="h4" 
              component="h2" 
              sx={{ 
                fontWeight: 700,
                color: 'primary.main'
              }}
            >
              Packages for {selectedRegion}
            </Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => setModalOpen(false)}
              sx={{ 
                ml: 'auto',
                display: { xs: 'block', sm: 'none' },
                minWidth: 'auto',
                px: 2,
                py: 1
              }}
            >
              Close
            </Button>
          </Box>
          <Box sx={{ 
            width: '100%',
            overflowY: 'auto',
            flexGrow: 1,
            pr: 1,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'rgba(0,0,0,0.3)',
            }
          }}>
            <Box
              sx={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)'
                },
                gap: 2
              }}
            >
              {filteredPackages.map((pkg) => (
                <Box key={pkg.packageCode}>
                  <Card
                    onClick={() => handlePackageClick(pkg.packageCode)}
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      backgroundColor: isNavigating ? 'primary.main' : 'white',
                      color: isNavigating ? 'white' : 'text.primary',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'primary.main',
                        color: 'white',
                        transform: 'translateY(-4px)',
                        boxShadow: 3,
                      },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {isNavigating && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          zIndex: 1,
                        }}
                      >
                        <CircularProgress color="inherit" />
                      </Box>
                    )}
                    <CardContent>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {pkg.packageName}
                      </Typography>
                      <Typography variant="body2" color="inherit">
                        {pkg.packageCode}
                      </Typography>
                      <Typography variant="h6" color="inherit" sx={{ mt: 2 }}>
                        ${(pkg.retailPrice/10000).toFixed(2)  }
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>
          <Box sx={{ 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'center', 
            mt: 3,
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => setModalOpen(false)}
              sx={{ 
                minWidth: '150px',
                py: 1.5,
                borderRadius: '8px',
                fontWeight: 'bold',
                boxShadow: '0 4px 0 rgba(0,0,0,0.1)',
                '&:hover': {
                  transform: 'translateY(2px)',
                  boxShadow: '0 2px 0 rgba(0,0,0,0.1)',
                },
                '&:active': {
                  transform: 'translateY(4px)',
                  boxShadow: '0 0 0 rgba(0,0,0,0.1)',
                }
              }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
} 