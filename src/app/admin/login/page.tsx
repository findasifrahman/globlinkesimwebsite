'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Container, 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Cookies from 'js-cookie';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const theme = useTheme();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === process.env.NEXT_PUBLIC_ADMIN_USERNAME && 
        password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      // Set cookie that expires in 1 day
      Cookies.set('adminAuth', 'true', { expires: 1 });
      router.push('/admin/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

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
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
            Admin Login
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3 }}
            >
              Login
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 