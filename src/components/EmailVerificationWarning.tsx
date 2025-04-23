import { Alert, AlertTitle, Button, Box } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function EmailVerificationWarning() {
  const { data: session } = useSession();
  const [isResending, setIsResending] = useState(false);

  if (session?.user?.emailVerified) {
    return null;
  }

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
      });
      
      if (response.ok) {
        alert('Verification email has been resent. Please check your inbox.');
      } else {
        throw new Error('Failed to resend verification email');
      }
    } catch (error) {
      alert('Failed to resend verification email. Please try again later.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Alert severity="warning">
        <AlertTitle>Email Not Verified</AlertTitle>
        Please verify your email address to access all features.
        <Button
          color="inherit"
          size="small"
          onClick={handleResendVerification}
          disabled={isResending}
          sx={{ ml: 2 }}
        >
          {isResending ? 'Sending...' : 'Resend Verification Email'}
        </Button>
      </Alert>
    </Box>
  );
} 