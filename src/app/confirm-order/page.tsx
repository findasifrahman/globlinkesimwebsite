"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Button, Container, Typography, Paper, Grid, CircularProgress } from '@mui/material';
import { useSession } from 'next-auth/react';
import { formatCurrency } from '@/lib/utils';

// Define interfaces
interface Package {
  packageCode: string;
  packageName: string;
  price: number;
  currencyCode: string;
  location: string;
}

interface Order {
  orderNo: string;
  status: string;
  createdAt: string;
}

// Helper function to get country name from code
const getCountryName = (code: string): string => {
  const countries: { [key: string]: string } = {
    'US': 'United States',
    'GB': 'United Kingdom',
    'FR': 'France',
    'DE': 'Germany',
    'IT': 'Italy',
    'ES': 'Spain',
    // Add more country codes as needed
  };
  return countries[code] || code;
};

export default function ConfirmOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [orderData, setOrderData] = useState<Order | null>(null);

  useEffect(() => {
    const packageCode = searchParams.get('packageCode');
    const orderNo = searchParams.get('orderNo');

    if (!packageCode || !orderNo) {
      setError('Missing package or order information');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch package details
        const packageResponse = await fetch(`/api/packages/${packageCode}`);
        if (!packageResponse.ok) {
          throw new Error('Failed to fetch package details');
        }
        const packageResult = await packageResponse.json();
        setPackageData(packageResult.package);

        // Fetch order details
        const orderResponse = await fetch(`/api/orders/${orderNo}`);
        if (!orderResponse.ok) {
          throw new Error('Failed to fetch order details');
        }
        const orderResult = await orderResponse.json();
        setOrderData(orderResult.order);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  const handleConfirmOrder = async () => {
    if (!packageData || !orderData) return;

    try {
      setLoading(true);
      const response = await fetch('/api/orders/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNo: orderData.orderNo,
          packageCode: packageData.packageCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to confirm order');
      }

      const result = await response.json();
      router.push(`/order/confirmation?orderNo=${result.order.orderNo}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading order details...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Error
        </Typography>
        <Typography variant="body1" paragraph>
          {error}
        </Typography>
        <Button variant="contained" onClick={() => router.push('/')}>
          Return to Home
        </Button>
      </Container>
    );
  }

  if (!packageData || !orderData) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Order Not Found
        </Typography>
        <Typography variant="body1" paragraph>
          The requested order could not be found.
        </Typography>
        <Button variant="contained" onClick={() => router.push('/')}>
          Return to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Confirm Your Order
        </Typography>
        
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Package Details
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" id="package-name">
                {packageData.packageName}
              </Typography>
              <Typography variant="body1" id="package-price">
                {formatCurrency(packageData.price, packageData.currencyCode)}
              </Typography>
              <Typography variant="body1" id="package-location">
                Location: {getCountryName(packageData.location)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                Order Number: {orderData.orderNo}
              </Typography>
              <Typography variant="body1">
                Status: {orderData.status}
              </Typography>
              <Typography variant="body1">
                Created: {new Date(orderData.createdAt).toLocaleString()}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={handleConfirmOrder}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirm Order'}
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => router.push('/')}
            disabled={loading}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 