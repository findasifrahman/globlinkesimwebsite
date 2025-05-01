'use client';

import { useState } from 'react';
import { Box, Paper, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { CloudDownload as FetchIcon } from '@mui/icons-material';

export default function FetchPackagesPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/fetch-packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);

      if (!data.success) {
        setError(data.message || 'Failed to fetch packages');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Fetch Packages
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Fetch Packages from API
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          This will fetch all available packages from the eSIM API and save them to the database.
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FetchIcon />}
          onClick={fetchPackages}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {loading ? 'Fetching...' : 'Fetch Packages'}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {result && (
          <Alert 
            severity={result.success ? "success" : "error"} 
            sx={{ mb: 2 }}
          >
            {result.message}
            {result.count !== undefined && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Packages fetched:</strong> {result.count}
              </Typography>
            )}
          </Alert>
        )}
      </Paper>
    </Box>
  );
} 