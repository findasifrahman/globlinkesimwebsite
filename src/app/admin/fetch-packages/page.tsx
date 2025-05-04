'use client';

import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { CloudDownload as FetchIcon } from '@mui/icons-material';

interface PackageCount {
  created: number;
  updated: number;
  deleted: number;
}

interface Package {
  packageName: string;
  packageCode: string;
  slug: string;
  price: number;
  currencyCode: string;
  smsStatus: boolean;
  duration: number;
  location: string;
  activeType: number;
  retailPrice: number;
  speed: string;
  multiregion: boolean;
  favourite: boolean;
  operators: string;
}

export default function FetchPackagesPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; count?: PackageCount } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const processPackages = async (packages: Package[]) => {
    const batchSize = 10;
    let totalCreated = 0;
    let totalUpdated = 0;
    let totalDeleted = 0;

    // Store packages in localStorage for processing
    localStorage.setItem('packageSync', JSON.stringify({
      packages,
      processed: 0,
      total: packages.length
    }));

    // Process packages in batches
    for (let i = 0; i < packages.length; i += batchSize) {
      setProgress({ current: i, total: packages.length });

      try {
        const response = await fetch('/api/fetch-packages/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            packages,
            startIndex: i,
            batchSize
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          totalCreated += data.counts.created;
          totalUpdated += data.counts.updated;
          totalDeleted += data.counts.deleted;

          // Update progress in localStorage
          const syncData = JSON.parse(localStorage.getItem('packageSync') || '{}');
          syncData.processed = data.progress.current;
          localStorage.setItem('packageSync', JSON.stringify(syncData));
        } else {
          throw new Error(data.message || 'Failed to process batch');
        }
      } catch (error) {
        console.error('Error processing batch:', error);
        throw error;
      }
    }

    return {
      created: totalCreated,
      updated: totalUpdated,
      deleted: totalDeleted
    };
  };

  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setProgress(null);

    try {
      // Start the job
      const startResponse = await fetch('/api/fetch-packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!startResponse.ok) {
        throw new Error(`HTTP error! status: ${startResponse.status}`);
      }

      const startData = await startResponse.json();
      
      if (!startData.success) {
        throw new Error(startData.message || 'Failed to fetch packages');
      }

      const packages = startData.packages;
      setResult({ 
        success: true, 
        message: 'Starting package sync...',
        count: { created: 0, updated: 0, deleted: 0 }
      });

      // Process packages
      const counts = await processPackages(packages);
      
      setResult({
        success: true,
        message: 'Package sync completed successfully',
        count: counts
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
      setProgress(null);
      localStorage.removeItem('packageSync');
    }
  };

  // Check for existing sync progress on component mount
  useEffect(() => {
    const syncData = localStorage.getItem('packageSync');
    if (syncData) {
      const { processed, total } = JSON.parse(syncData);
      setProgress({ current: processed, total });
    }
  }, []);

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

        {progress && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Processing packages: {progress.current}/{progress.total}
          </Alert>
        )}

        {result && (
          <Alert 
            severity={result.success ? "success" : "error"} 
            sx={{ mb: 2 }}
          >
            {result.message}
            {result.count && (
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2">
                    <strong>Created:</strong> {result.count.created}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2">
                    <strong>Updated:</strong> {result.count.updated}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2">
                    <strong>Deleted:</strong> {result.count.deleted}
                  </Typography>
                </Box>
              </Box>
            )}
          </Alert>
        )}
      </Paper>
    </Box>
  );
} 