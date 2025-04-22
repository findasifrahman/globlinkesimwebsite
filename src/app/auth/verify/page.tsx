'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setError('Invalid verification link');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed');
        }

        setStatus('success');
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push('/auth/signin');
        }, 3000);
      } catch (error) {
        setStatus('error');
        setError(error instanceof Error ? error.message : 'Verification failed');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            textAlign: 'center',
          }}
        >
          {status === 'verifying' && (
            <>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Verifying your email...
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Please wait while we verify your email address.
              </Typography>
            </>
          )}

          {status === 'success' && (
            <>
              <Typography variant="h5" color="success.main" gutterBottom>
                Email Verified Successfully!
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Your email has been verified. You will be redirected to the login page...
              </Typography>
              <Alert severity="success" sx={{ mt: 2 }}>
                You can now log in with your email and password.
              </Alert>
            </>
          )}

          {status === 'error' && (
            <>
              <Typography variant="h5" color="error" gutterBottom>
                Verification Failed
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {error}
              </Typography>
              <Alert severity="error" sx={{ mt: 2 }}>
                Please try requesting a new verification link or contact support if the problem persists.
              </Alert>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
} 