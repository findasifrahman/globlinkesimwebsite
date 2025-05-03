'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  Divider,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Order } from '@/types/order';
import { ProcessedPackage } from '@/types/package';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import { formatDataSize, formatDate, formatCurrency } from '@/lib/utils';
import { prisma } from '@/lib/prisma';

export default function OrderDetails() {
  const { orderNo } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [packageDetails, setPackageDetails] = useState<ProcessedPackage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const fetchOrder = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/${orderNo}`, {
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }
      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orderNo]);

  useEffect(() => {
    if (orderNo) {
      fetchOrder();
    }
  }, [orderNo, fetchOrder]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && orderNo) {
        fetchOrder();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [orderNo, fetchOrder]);

  // Get payment status from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    if (status === 'failed' || status === 'expired' || status === 'cancelled' || status === 'rejected') {
      setPaymentStatus(status);
      setError('Payment failed. Please try again or contact support if the issue persists.');
      setLoading(false);
    } else if (status === 'pending') {
      setPaymentStatus('pending');
      setError('Payment is still processing. Please wait or refresh the page.');
      setLoading(false);
    }
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/orders/' + orderNo);
    }
  }, [status, router, orderNo]);

  // Fetch order details when component mounts, but only if payment was successful
  useEffect(() => {
    if (session?.user && !paymentStatus) {
      fetchOrder();
    }
  }, [session?.user, orderNo, paymentStatus]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderNo}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      
      const data = await response.json();
      setOrder(data.order);
      
      // Fetch package details if we have a package code
      if (data.order.packageCode) {
        fetchPackageDetails(data.order.packageCode);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const fetchPackageDetails = async (packageCode: string) => {
    try {
      const storedPackages = localStorage.getItem('packages');
      if (storedPackages) {
        const packages = JSON.parse(storedPackages);
        if (Array.isArray(packages)) {
          const foundPackage = packages.find(pkg => pkg.packageCode === packageCode);
          if (foundPackage) {
            setPackageDetails(foundPackage);
            setError(null);
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

  const handleBack = () => {
    router.push('/account');
  };

  if (status === 'loading' || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Container sx={{ flex: 1, py: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
        <Footer />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Container sx={{ flex: 1, py: 4 }}>
          <Typography>Order not found</Typography>
        </Container>
        <Footer />
      </Box>
    );
  }

  const isActive = order.status === 'ACTIVE' || order.status === 'PROCESSING' || 
                  order.status === 'READY_FOR_DOWNLOAD' || order.status === 'GOT_RESOURCE';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container sx={{ flex: 1, py: 4, overflow: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          Order Details
        </Typography>
        
        <Grid container spacing={3}>
          {/* Order Information */}
          <Grid columns={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Order Information</Typography>
                <Typography><strong>Order Number:</strong> {order.orderNo}</Typography>
                <Typography><strong>Status:</strong> {order.status}</Typography>
                <Typography><strong>Amount:</strong> {order.finalAmountPaid} {order.currency}</Typography>
                <Typography><strong>Payment Method:</strong> {order.pmName}</Typography>
                <Typography><strong>Transaction ID:</strong> {order.transactionId}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* eSIM Details */}
          {order.status === 'GOT_RESOURCE' && (
            <Grid columns={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>eSIM Details</Typography>
                  <Typography><strong>ICCID:</strong> {order.iccid}</Typography>
                  <Typography><strong>Data Remaining:</strong> {order.dataRemaining} bytes</Typography>
                  <Typography><strong>Data Used:</strong> {order.dataUsed} bytes</Typography>
                  <Typography><strong>Expiry Date:</strong> {new Date(order.expiryDate).toLocaleDateString()}</Typography>
                  <Typography><strong>Days Remaining:</strong> {order.daysRemaining}</Typography>
                  <Typography><strong>SMDP Status:</strong> {order.smdpStatus}</Typography>
                  <Typography><strong>eSIM Status:</strong> {order.esimStatus}</Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* QR Code */}
          {order.qrCode && (
            <Grid columns={{ xs: 12 }}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>eSIM QR Code</Typography>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  p: 2,
                  bgcolor: '#f5f5f5',
                  borderRadius: 1
                }}>
                  <img 
                    src={order.qrCode} 
                    alt="eSIM QR Code" 
                    style={{ 
                      maxWidth: '300px', 
                      height: 'auto',
                      borderRadius: '4px'
                    }} 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Scan this QR code to install your eSIM
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
      <Footer />
    </Box>
  );
}
