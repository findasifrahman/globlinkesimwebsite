'use client';

import { Suspense } from 'react';
import { Typography, Box, CircularProgress } from '@mui/material';
import { useSearchParams } from 'next/navigation';

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

function ConfirmOrderContent() {
  const searchParams = useSearchParams();
  const packageCode = searchParams.get('packageCode');
  const location = searchParams.get('location') || 'US';
  const price = searchParams.get('price') ? parseInt(searchParams.get('price')!) : 100000;
  const currencyCode = searchParams.get('currencyCode') || 'USD';

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Confirm Your Order
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" color="primary">
          {currencyCode} {(price / 10000).toFixed(2)}
        </Typography>
        <Typography variant="body1">
          Location: {getCountryName(location)}
        </Typography>
        {packageCode && (
          <Typography variant="body1">
            Package Code: {packageCode}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default function ConfirmOrderPage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    }>
      <ConfirmOrderContent />
    </Suspense>
  );
} 