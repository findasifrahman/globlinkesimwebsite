'use client';

import { Box, Container, Paper, Typography } from '@mui/material';

export default function VerifyRequest() {
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
            Check your email
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            A sign in link has been sent to your email address.
            Please check your inbox and follow the link to sign in.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
} 