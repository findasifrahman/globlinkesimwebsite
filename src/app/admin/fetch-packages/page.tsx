'use client';

import { useState } from 'react';
import { Box, Paper, Typography, Button, CircularProgress, Alert, Grid } from '@mui/material';
import { CloudDownload as FetchIcon } from '@mui/icons-material';

interface PackageCount {
  created: number;
  updated: number;
  deleted: number;
}

export default function FetchPackagesPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; count?: PackageCount } | null>(null);
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
          This will fetch all available packages from the eSIM API and update the database.
          Existing packages will be updated, new packages will be created, and packages that no longer exist in the API
          (and have no associated orders) will be deleted.
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
            {result.count && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={4}>
                  <Typography variant="body2">
                    <strong>Created:</strong> {result.count.created}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2">
                    <strong>Updated:</strong> {result.count.updated}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2">
                    <strong>Deleted:</strong> {result.count.deleted}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </Alert>
        )}
      </Paper>
    </Box>
  );
} 