'use client';

import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  CircularProgress
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const discountSchema = z.object({
  refererId: z.string().min(1, 'Referer ID is required'),
  refererName: z.string().min(1, 'Referer Name is required'),
  discountCode: z.string().min(1, 'Discount Code is required'),
  discountPercentage: z.number()
    .min(0, 'Discount percentage must be at least 0')
    .max(100, 'Discount percentage cannot exceed 100'),
  expireDate: z.string().min(1, 'Expiry date is required'),
});

type DiscountFormData = z.infer<typeof discountSchema>;

export default function CreateDiscountCode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<DiscountFormData>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      refererId: '',
      refererName: '',
      discountCode: '',
      discountPercentage: 0,
      expireDate: '',
    },
  });

  const onSubmit = async (data: DiscountFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Format the data for submission
      const submitData = {
        ...data,
        discountPercentage: Number(data.discountPercentage),
        expireDate: new Date(data.expireDate).toISOString(),
      };

      console.log('Submitting data:', submitData);

      const response = await fetch('/api/admin/discount-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create discount code');
      }

      setSuccess('Discount code created successfully');
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Create New Discount Code
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
        <Controller
          name="refererId"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Referer ID"
              fullWidth
              margin="normal"
              error={!!errors.refererId}
              helperText={errors.refererId?.message}
            />
          )}
        />

        <Controller
          name="refererName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Referer Name"
              fullWidth
              margin="normal"
              error={!!errors.refererName}
              helperText={errors.refererName?.message}
            />
          )}
        />

        <Controller
          name="discountCode"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Discount Code"
              fullWidth
              margin="normal"
              error={!!errors.discountCode}
              helperText={errors.discountCode?.message}
            />
          )}
        />

        <Controller
          name="discountPercentage"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              type="number"
              label="Discount Percentage"
              fullWidth
              margin="normal"
              error={!!errors.discountPercentage}
              helperText={errors.discountPercentage?.message}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          )}
        />

        <Controller
          name="expireDate"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              type="datetime-local"
              label="Expiry Date"
              fullWidth
              margin="normal"
              error={!!errors.expireDate}
              helperText={errors.expireDate?.message}
              InputLabelProps={{
                shrink: true,
              }}
            />
          )}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Discount Code'}
        </Button>
      </Box>
    </Box>
  );
} 