'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CircularProgress, Typography, Box, Alert, Button } from '@mui/material';
import { sendCreateEsimFailedEmail } from '@/lib/email';

export default function PaymentSuccess() {
  const { orderId } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    const processAndCheckStatus = async () => {
      try {
        // 1. First, trigger the order processing
        const processResponse = await fetch(`/api/process-order/${orderId}`, {
          method: 'POST'
        });
        
        if (!processResponse.ok) {
          throw new Error('Failed to start order processing');
        }

        // 2. Then start polling for status
        const checkStatus = async () => {
          try {
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
              setError(data.error);
            }
          } catch (error) {
            console.error('Error checking status:', error);
          }
        };

        // Check status every 5 seconds
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
      } catch (error) {
        setStatus('failed');
        setError('Failed to process order');
      }
    };

    processAndCheckStatus();
  }, [orderId, router]);

  // ... rest of the component remains the same ...

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