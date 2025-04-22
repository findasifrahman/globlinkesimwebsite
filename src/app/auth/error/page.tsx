'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
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
          <Typography variant="h4" component="h1" gutterBottom>
            Authentication Error
          </Typography>
          
          <Typography variant="body1" color="error" sx={{ mb: 3 }}>
            {error === 'Configuration'
              ? 'There is a problem with the server configuration.'
              : error === 'AccessDenied'
              ? 'You do not have permission to sign in.'
              : error === 'Verification'
              ? 'The verification token has expired or has already been used.'
              : 'An error occurred during authentication.'}
          </Typography>

          <Button
            component={Link}
            href="/auth/signin"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Back to Sign In
          </Button>
        </Paper>
      </Box>
    </Container>
  );
} 