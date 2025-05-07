'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CircularProgress, Typography, Box, Alert, Button } from '@mui/material';

export default function PaymentSuccess() {
  const { orderId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [pollCount, setPollCount] = useState(0);
  const MAX_POLLS = 6; // 1 minute of polling (5s * 12)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // First check payment status
        const paymentResponse = await fetch(`/api/payment/status?order_id=${orderId}`);
        const paymentData = await paymentResponse.json();

        if (paymentData.status !== 'completed') {
          setStatus('failed');
          setError('Payment was not successful. Please try again.');
          return;
        }

        // If payment is successful, proceed with eSIM creation
        if (status === 'processing') {
          const createResponse = await fetch(`/api/process-order/${orderId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!createResponse.ok) {
            throw new Error('Failed to create eSIM order');
          }
          
          const createData = await createResponse.json();
          if (!createData.success) {
            setStatus('failed');
            setError(createData.error || 'Failed to create eSIM order');
            return;
          }
        }

        // Check order status
        const response = await fetch(`/api/process-order/${orderId}`);
        const data = await response.json();

        if (data.status === 'GOT_RESOURCE') {
          setStatus('completed');
          setOrderDetails(data);
          // Show success for 3 seconds before redirecting
          setTimeout(() => {
            router.push(`/orders/${data.orderNo}`);
          }, 3000);
        } else if (data.status === 'FAILED') {
          setStatus('failed');
          setError(data.error || 'Failed to process your order');
        } else if (data.status === 'PROCESSING' || data.status === 'PENDING') {
          setPollCount(prev => prev + 1);
          if (pollCount >= MAX_POLLS) {
            // After 1 minute, redirect to order page with processing status
            router.push(`/orders/${orderId}?status=processing`);
          }
        }
      } catch (error) {
        console.error('Error checking status:', error);
        setPollCount(prev => prev + 1);
        if (pollCount >= MAX_POLLS) {
          router.push(`/orders/${orderId}?status=processing`);
        }
      }
    };

    // Initial check
    checkStatus();

    // Check status every 5 seconds
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [orderId, router, pollCount, status]);

  // If payment failed, show error immediately
  if (searchParams.get('status') === 'failed') {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2
      }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Payment was not successful
        </Alert>
        <Typography variant="body2">
          Your payment was not completed. Please try again.
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => router.push('/account')}
        >
          Back to Account
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '60vh',
      gap: 2
    }}>
      {status === 'processing' && (
        <>
          <CircularProgress size={60} />
          <Typography variant="h6">Processing your eSIM order...</Typography>
          <Typography variant="body2" color="text.secondary">
            We're creating your eSIM. This may take a few moments.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You'll be redirected to your order page shortly.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You'll receive an email with your eSIM details once it's ready.
          </Typography>
        </>
      )}
      
      {status === 'completed' && orderDetails && (
        <>
          <Typography variant="h6" color="success.main">
            Your eSIM is ready!
          </Typography>
          <Typography variant="body2">
            We've sent your eSIM details to your email.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => router.push(`/orders/${orderDetails.orderNo}`)}
          >
            View Order Details
          </Button>
        </>
      )}
      
      {status === 'failed' && (
        <>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || 'Failed to process your order'}
          </Alert>
          <Typography variant="body2">
            Don't worry, we've received your payment and will process your order.
          </Typography>
          <Typography variant="body2">
            You'll receive an email once your eSIM is ready.
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => router.push('/support')}
          >
            Contact Support
          </Button>
        </>
      )}
    </Box>
  );
}