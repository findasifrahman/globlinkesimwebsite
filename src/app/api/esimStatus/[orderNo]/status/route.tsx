'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CircularProgress, Typography, Box, Alert, Button } from '@mui/material';

export default function PaymentSuccess() {
  const { orderNo } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [pollCount, setPollCount] = useState(0);
  const MAX_POLLS = 12; // 1 minute of polling (5s * 12)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/orders/${orderNo}/status`);
        const data = await response.json();
        console.log("data from esim status route----------", data);
        if (data.status === 'COMPLETED') {
          setStatus('completed');
          setOrderDetails(data);
          // Show success for 3 seconds before redirecting
          setTimeout(() => {
            router.push(`/orders/${data.orderNo}`);
          }, 3000);
        } else if (data.status === 'FAILED') {
          setStatus('failed');
          setError(data.error);
        } else if (data.status === 'PROCESSING' || data.status === 'PENDING') {
          setPollCount(prev => prev + 1);
          if (pollCount >= MAX_POLLS) {
            // After 1 minute, redirect to order page with processing status
            router.push(`/orders/${orderNo}?status=processing`);
          }
        }
      } catch (error) {
        console.error('Error checking status:', error);
        setPollCount(prev => prev + 1);
        if (pollCount >= MAX_POLLS) {
          router.push(`/orders/${orderNo}?status=processing`);
        }
      }
    };

    // Initial check
    checkStatus();

    // Check status every 5 seconds
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [orderNo, router, pollCount]);

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