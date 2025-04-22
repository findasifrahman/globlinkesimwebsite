'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useNotification } from '@/contexts/NotificationContext';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showNotification } = useNotification();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Email verified successfully! Redirecting to your account...');
          showNotification('Email verified successfully!', 'success');
          // Redirect to account page after 2 seconds
          setTimeout(() => {
            router.push('/account');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to verify email');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred while verifying your email');
      }
    };

    verifyEmail();
  }, [searchParams, router, showNotification]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 3,
      }}
    >
      {status === 'loading' && (
        <>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Verifying your email...</Typography>
        </>
      )}

      {status === 'success' && (
        <Alert severity="success" sx={{ maxWidth: 600 }}>
          {message}
        </Alert>
      )}

      {status === 'error' && (
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          {message}
        </Alert>
      )}
    </Box>
  );
} 