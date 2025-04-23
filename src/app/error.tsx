'use client';

import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Typography variant="h1" component="h1" gutterBottom>
        500
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom>
        Something went wrong!
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {error.message || 'An unexpected error occurred.'}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button
          variant="contained"
          onClick={() => reset()}
        >
          Try again
        </Button>
        <Button
          variant="outlined"
          onClick={() => router.push('/')}
        >
          Go to Home
        </Button>
      </Box>
    </Box>
  );
} 