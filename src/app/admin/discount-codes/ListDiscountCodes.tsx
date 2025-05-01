'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

interface DiscountCode {
  id: string;
  refererId: string;
  refererName: string;
  discountCode: string;
  discountPercentage: number;
  isActive: boolean;
  expireDate: string;
  createdAt: string;
}

export default function ListDiscountCodes() {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscountCodes = async () => {
    try {
      const response = await fetch('/api/admin/discount-codes');
      if (!response.ok) {
        throw new Error('Failed to fetch discount codes');
      }
      const data = await response.json();
      setDiscountCodes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this discount code?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/discount-codes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete discount code');
      }

      setDiscountCodes(discountCodes.filter(code => code.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  useEffect(() => {
    fetchDiscountCodes();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Discount Codes
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Referer ID</TableCell>
              <TableCell>Referer Name</TableCell>
              <TableCell>Discount Code</TableCell>
              <TableCell>Discount %</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {discountCodes.map((code) => (
              <TableRow key={code.id}>
                <TableCell>{code.refererId}</TableCell>
                <TableCell>{code.refererName}</TableCell>
                <TableCell>{code.discountCode}</TableCell>
                <TableCell>{code.discountPercentage}%</TableCell>
                <TableCell>
                  <Chip
                    label={code.isActive ? 'Active' : 'Inactive'}
                    color={code.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(code.expireDate).toLocaleString()}</TableCell>
                <TableCell>{new Date(code.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(code.id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 