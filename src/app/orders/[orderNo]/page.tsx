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

import { formatDataSize, formatDate} from '@/lib/utils';

export default function OrderDetails() {
  const { orderNo } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderNo) return;
    
    try {
      setLoading(true);
      // Single API call that includes all order data including eSIM profile
      const response = await fetch(`/api/orders/${orderNo}/details`, {
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }
      
      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order');
    } finally {
      setLoading(false);
    }
  }, [orderNo]);

  // Initial fetch when component mounts
  useEffect(() => {
    if (orderNo && session?.user) {
      fetchOrder();
    }
  }, [orderNo, session?.user, fetchOrder]);

  // Handle payment status from URL
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container sx={{ flex: 1, py: 4, overflow: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          Order Details
        </Typography>
        
        <Grid container spacing={3}>
          {/* Order Information */}
          <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
            <Card sx={{ width: '100%' }}>
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
            <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
              <Card sx={{ width: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>eSIM Details</Typography>
                  <Typography><strong>ICCID:</strong> {order.iccid}</Typography>
                  <Typography><strong>Data Remaining:</strong> {formatDataSize(order.dataRemaining)}</Typography>
                  <Typography><strong>Data Used:</strong> {formatDataSize(order.dataUsed)}</Typography>
                  <Typography><strong>Expiry Date:</strong> {order.expiryDate ? formatDate(order.expiryDate) : 'N/A'}</Typography>
                  <Typography><strong>Days Remaining:</strong> {order.daysRemaining}</Typography>
                  <Typography><strong>SMDP Status:</strong> {order.smdpStatus}</Typography>
                  <Typography><strong>eSIM Status:</strong> {order.esimStatus}</Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* QR Code */}
          {order.qrCode && (
            <Grid item xs={12} sx={{ display: 'flex' }}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center', width: '100%' }}>
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
