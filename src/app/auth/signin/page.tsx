'use client';

import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Divider, 
  Alert,
  CircularProgress
} from '@mui/material';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GoogleIcon from '@mui/icons-material/Google';

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowVerificationMessage(false);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        if (result.error === 'Please verify your email before logging in') {
          setShowVerificationMessage(true);
          setError('Please verify your email address before logging in. Check your inbox for the verification link.');
        } else {
          setError('Invalid email or password');
        }
      } else {
        router.push(callbackUrl);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResendingVerification(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification email');
      }

      setError('A new verification email has been sent. Please check your inbox.');
    } catch (error) {
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signIn('google', {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      setError('An error occurred during sign in.');
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight="bold">
            Sign In
          </Typography>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              action={
                showVerificationMessage && (
                  <Button
                    color="inherit"
                    size="small"
                    onClick={handleResendVerification}
                    disabled={isResendingVerification}
                  >
                    {isResendingVerification ? 'Sending...' : 'Resend Verification Email'}
                  </Button>
                )
              }
            >
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                variant="text"
                onClick={() => router.push('/auth/forgot-password')}
              >
                Forgot Password?
              </Button>
              <Button
                variant="text"
                onClick={() => router.push('/auth/signup')}
              >
                Don't have an account? Sign Up
              </Button>
            </Box>
          </form>
          
          <Divider sx={{ my: 3 }}>OR</Divider>
          
          <Button
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={loading}
            fullWidth
            sx={{ mb: 3 }}
          >
            Sign in with Google
          </Button>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" color="primary">
                Sign up
              </Link>
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
            Forgot your password?{' '}
            <Link href="/auth/forgot-password" color="primary">
              Reset it here
            </Link>
          </Typography>
        </Paper>
      </Container>
      <Footer />
    </>
  );
} 