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
  Card,
  CardContent
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Order } from '@/types/order';

import { formatDataSize, formatDate} from '@/lib/utils';

export default function OrderDetails() {
  const { orderId } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}/details`, {
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }
      
      const data = await response.json();
      setOrder(data.order);

      // If order is in processing state, start tracking time
      if (data.order.status === 'PENDING' || data.order.status === 'PROCESSING') {
        const createdAt = new Date(data.order.createdAt);
        const now = new Date();
        const minutesElapsed = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));
        setProcessingTime(minutesElapsed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order');
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [orderId]);

  // Initial fetch when component mounts
  useEffect(() => {
    if (orderId && session?.user && isInitialLoad) {
      fetchOrder();
    }
  }, [orderId, session?.user, isInitialLoad, fetchOrder]);

  // Handle payment status from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    
    switch (status) {
      case 'pending':
        setPaymentStatus('pending');
        setError('Payment is still processing. Please wait or refresh the page.');
        setLoading(false);
        
        // Create eSIM order when status is pending
        const createEsimOrder = async () => {
          try {
            const response = await fetch(`/api/process-order/${orderId}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (!response.ok) {
              throw new Error('Failed to create eSIM order');
            }

            const data = await response.json();
            if (data.success) {
              // Refresh order details after successful creation
              fetchOrder();
            } else {
              setError('Failed to create eSIM order. Please contact support.');
            }
          } catch (err) {
            console.error('Error creating eSIM order:', err);
            setError('Failed to create eSIM order. Please contact support.');
          }
        };

        createEsimOrder();
        break;

      case 'failed':
        setPaymentStatus('failed');
        setError('Payment was not successful. Please try again.');
        setLoading(false);
        break;

      case 'canceled':
        setPaymentStatus('canceled');
        setError('Payment was canceled. Please try again if you wish to complete your purchase.');
        setLoading(false);
        break;

      case 'delayed':
        setPaymentStatus('delayed');
        setError('Payment is delayed. Please wait while we process your payment.');
        setLoading(false);
        break;

      case 'expired':
        setPaymentStatus('expired');
        setError('Payment session has expired. Please try again.');
        setLoading(false);
        break;

      default:
        // For any other status, just set it but don't show an error
        if (status) {
          setPaymentStatus(status);
          setLoading(false);
        }
    }
  }, [orderId, fetchOrder]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/orders/' + orderId);
    }
  }, [status, router, orderId]);

  // Poll for order status if it's in processing state
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (order?.status === 'PENDING' || order?.status === 'PROCESSING') {
      interval = setInterval(() => {
        fetchOrder();
      }, 120000); // Poll every 2 minutes (120 seconds)
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [order?.status, fetchOrder]);

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
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          {paymentStatus === 'failed' || paymentStatus === 'canceled' || paymentStatus === 'expired' ? (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                {paymentStatus === 'failed' && 'Your payment was not completed. Please try again or contact support if you need assistance.'}
                {paymentStatus === 'canceled' && 'Your payment was canceled. You can try again when you\'re ready.'}
                {paymentStatus === 'expired' && 'Your payment session has expired. Please start a new payment to complete your purchase.'}
              </Alert>
              <Button 
                variant="contained" 
                onClick={() => router.push('/account')}
                sx={{ mt: 2, mr: 2 }}
              >
                Back to Account
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => router.push('/support')}
                sx={{ mt: 2 }}
              >
                Contact Support
              </Button>
            </>
          ) : paymentStatus === 'delayed' ? (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                Your payment is being processed. This may take a few minutes.
                Please wait while we confirm your payment.
              </Alert>
              <Button 
                variant="contained" 
                onClick={() => router.push('/account')}
                sx={{ mt: 2 }}
              >
                Back to Account
              </Button>
            </>
          ) : order?.status === 'FAILED' ? (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                We've received your payment but encountered an issue creating your eSIM.
                Our team has been notified and will process your order within 30 minutes.
                You'll receive an email once your eSIM is ready.
              </Alert>
              <Button 
                variant="contained" 
                onClick={() => router.push('/support')}
                sx={{ mt: 2 }}
              >
                Contact Support
              </Button>
            </>
          ) : null}
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
        
        {/* Processing Status Alert */}
        {(order?.status === 'PENDING' || order?.status === 'PROCESSING') && !order.qrCode && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Your eSIM is being processed
            </Typography>
            <Typography variant="body2">
              {processingTime >= 30 
                ? "We're still processing your order. Please wait while we resolve this. You'll receive an email once your eSIM is ready."
                : `Please wait while we create your eSIM. This may take up to 30 minutes. You'll receive an email once it's ready.`}
            </Typography>
            {processingTime >= 30 && (
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => router.push('/support')}
                sx={{ mt: 1 }}
              >
                Contact Support
              </Button>
            )}
          </Alert>
        )}

        {/* Success Alert */}
        {order?.status === 'GOT_RESOURCE' && order.qrCode && (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Your eSIM is ready!
            </Typography>
            <Typography variant="body2">
              We've sent your eSIM details to your email. You can also find your QR code below.
            </Typography>
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Order Information */}
          <Grid item xs={12} md={6}>
            <Card sx={{ width: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Order Information</Typography>
                <Typography><strong>Order Number:</strong> {order.orderNo}</Typography>
                <Typography><strong>Status:</strong> {order.status}</Typography>
                <Typography><strong>Amount:</strong> {order.finalAmountPaid} {order.currency}</Typography>
                <Typography><strong>Payment Method:</strong> {order.pmName}</Typography>
                <Typography><strong>Transaction ID:</strong> {order.transactionId}</Typography>
                {order.status === 'PENDING' || order.status === 'PROCESSING' ? (
                  <Typography color="text.secondary" sx={{ mt: 2 }}>
                    <strong>Processing Time:</strong> {processingTime} minutes
                  </Typography>
                ) : null}
              </CardContent>
            </Card>
          </Grid>

          {/* eSIM Details */}
          {order.status === 'GOT_RESOURCE' && (
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12}>
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
