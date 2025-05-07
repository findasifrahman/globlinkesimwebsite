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
        // Use the correct endpoint
        const response = await fetch(`/api/orders/${orderNo}/status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("data from order status route----------", data);
        if (data.status === 'COMPLETED') {
          setStatus('completed');
          setOrderDetails(data);
          // Show success for 3 seconds before redirecting
          setTimeout(() => {
            router.push(`/orders/${data.orderNo}`);
          }, 3000);
        } else if (data.status === 'FAILED') {
          setStatus('failed');
          setError(data.error || 'Order processing failed');
        } else if (data.status === 'PROCESSING' || data.status === 'PENDING') {
          setPollCount(prev => prev + 1);
          if (pollCount >= MAX_POLLS) {
            // After 1 minute, redirect to order page with processing status
            router.push(`/orders/${orderNo}?status=processing`);
          }
        }
      } catch (error) {
        console.error('Error checking order status:', error);
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

  if (status === 'completed') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Typography variant="h5" gutterBottom>Payment Successful!</Typography>
        <Typography>Your eSIM is being processed. Redirecting to order details...</Typography>
      </Box>
    );
  }

  if (status === 'failed') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error || 'Payment failed'}</Alert>
        <Button variant="contained" onClick={() => router.push('/')}>Return to Home</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Processing your payment...</Typography>
    </Box>
  );
}