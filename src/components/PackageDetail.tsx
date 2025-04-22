"use client";

import { Card, CardContent, Typography, Box, Chip, Button } from '@mui/material';
import { AllPackage } from '@prisma/client';
import { useRouter } from 'next/navigation';

interface PackageDetailProps {
  packageData: AllPackage;
}

export default function PackageDetail({ packageData }: PackageDetailProps) {
  const router = useRouter();

  const handlePurchase = () => {
    // TODO: Implement purchase flow
    console.log('Purchase package:', packageData.packageCode);
  };

  return (
    <Card sx={{ mb: 4, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {packageData.packageName}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Package Code: {packageData.packageCode}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Package Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body1">
                  <strong>Duration:</strong> {packageData.duration} days
                </Typography>
                <Typography variant="body1">
                  <strong>Location:</strong> {packageData.location}
                </Typography>
                <Typography variant="body1">
                  <strong>Speed:</strong> {packageData.speed}
                </Typography>
                <Typography variant="body1">
                  <strong>SMS Status:</strong> {packageData.smsStatus ? 'Enabled' : 'Disabled'}
                </Typography>
                <Typography variant="body1">
                  <strong>Active Type:</strong> {packageData.activeType}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Pricing
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h4" color="primary" gutterBottom>
                  {packageData.currencyCode} {packageData.price.toString()}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  <strong>Retail Price:</strong> {packageData.currencyCode} {packageData.retailPrice.toString()}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={handlePurchase}
              sx={{ 
                py: 1.5, 
                fontSize: '1.1rem',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3)',
                }
              }}
            >
              Purchase Now
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
} 