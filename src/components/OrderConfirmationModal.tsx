import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ProcessedPackage } from '@/types/package';
import { Public, Flag, AccessTime, Speed, Info } from '@mui/icons-material';

// Helper function to get country name from code
const getCountryName = (code: string): string => {
  const countries: Record<string, string> = {
    'AU': 'Australia',
    'US': 'United States',
    'GB': 'United Kingdom',
    'CA': 'Canada',
    'DE': 'Germany',
    'FR': 'France',
    'IT': 'Italy',
    'ES': 'Spain',
    'JP': 'Japan',
    'CN': 'China',
    'IN': 'India',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'RU': 'Russia',
    'ZA': 'South Africa',
    'AE': 'United Arab Emirates',
    'SG': 'Singapore',
    'MY': 'Malaysia',
    'TH': 'Thailand',
    'VN': 'Vietnam',
    'ID': 'Indonesia',
    'PH': 'Philippines',
    'KR': 'South Korea',
    'HK': 'Hong Kong',
    'TW': 'Taiwan',
    'NZ': 'New Zealand',
    'EU': 'European Union',
    'AS': 'Asia',
    'AF': 'Africa',
    'NA': 'North America',
    'SA': 'South America',
    'OC': 'Oceania',
    'MO': 'Macau',
    'KH': 'Cambodia',
    'BB': 'Barbados',
    'PR': 'Puerto Rico',
    'AR': 'Argentina',
    // ... add all other country codes here
  };
  
  return countries[code] || code;
};

interface OrderConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  packageDetails: ProcessedPackage;
  quantity: number;
}

export default function OrderConfirmationModal({
  open,
  onClose,
  packageDetails,
  quantity
}: OrderConfirmationModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollingStatus, setPollingStatus] = useState<string>('');
  const theme = useTheme();

  // Function to poll the order status using the server-side API
  const pollOrderStatus = async (orderNo: string, maxAttempts = 30, intervalMs = 2000) => {
    console.log(`[pollOrderStatus] Starting to poll for order: ${orderNo}`);
    setPollingStatus(`Checking order status for ${orderNo}...`);
    
    try {
      const response = await fetch('/api/esim/poll-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNo,
          maxAttempts,
          intervalMs
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to poll order status');
      }

      const data = await response.json();
      console.log(`[pollOrderStatus] Response:`, data);

      if (data.isReady) {
        setPollingStatus(`Order ${orderNo} is ready!`);
        return true;
      } else {
        setPollingStatus(`Order status not ready yet. You can check your order status later.`);
        return false;
      }
    } catch (error) {
      console.error(`[pollOrderStatus] Error:`, error);
      setPollingStatus(`Error checking order status: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const handleConfirmOrder = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);
    setPollingStatus('Creating order...');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageCode: packageDetails.packageCode,
          count: quantity,
          price: packageDetails.price * quantity
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      setPollingStatus(`Order created: ${data.order.orderNo}. Checking status...`);
      console.log(`[handleConfirmOrder] Order created: ${data.order.orderNo}`);
      
      // Start polling for order status
      const orderNo = data.order.orderNo;
      
      // Poll for order status
      const isReady = await pollOrderStatus(orderNo);
      
      if (isReady) {
        // If the order is ready, redirect to the order details page
        router.push(`/orders/${orderNo}`);
      } else {
        // If polling times out, still redirect but show a message
        setPollingStatus(`Order created but not yet ready. Redirecting to order details...`);
        setTimeout(() => {
          router.push(`/orders/${orderNo}`);
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = (packageDetails.price * quantity) / 10000;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          boxShadow: theme.shadows[24],
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        fontWeight: 'bold',
        borderBottom: `1px solid ${alpha(theme.palette.primary.dark, 0.2)}`,
      }}>
        Confirm Order
      </DialogTitle>
      <DialogContent sx={{ mt: 2, bgcolor: theme.palette.background.paper }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {pollingStatus && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {pollingStatus}
          </Alert>
        )}
        
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2, 
            mb: 2,
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
          }}
        >
          <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
            Package Details
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {packageDetails.multiregion ? (
              <Public color="primary" sx={{ mr: 1 }} />
            ) : (
              <Flag color="primary" sx={{ mr: 1 }} />
            )}
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
              {packageDetails.packageName}
            </Typography>
          </Box>
          <Typography><strong>Location:</strong> {getCountryName(packageDetails.location)}</Typography>
          <Typography><strong>Duration:</strong> {packageDetails.duration} days</Typography>
          <Typography><strong>Speed:</strong> {packageDetails.speed}</Typography>
          <Typography><strong>Quantity:</strong> {quantity}</Typography>
          <Typography><strong>Price per unit:</strong> {packageDetails.currencyCode} {(packageDetails.price / 10000).toFixed(2)}</Typography>
          {packageDetails.operators && (
            <Typography><strong>Operators:</strong> {packageDetails.operators}</Typography>
          )}
        </Paper>

        <Paper 
          elevation={1} 
          sx={{ 
            p: 2,
            bgcolor: theme.palette.primary.light,
            borderRadius: 2,
            border: `1px solid ${theme.palette.error.main}`
          }}
        >
          <Typography variant="h6"  sx={{ fontWeight: 'bold' }}>
            Total Amount: {packageDetails.currencyCode} {totalPrice.toFixed(2)}
          </Typography>
        </Paper>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          By confirming this order, you agree to purchase the eSIM package. The eSIM will be delivered to your email once the order is processed.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ 
        p: 2,
        bgcolor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`
      }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          sx={{ 
            color: theme.palette.text.secondary,
            '&:hover': {
              bgcolor: alpha(theme.palette.text.secondary, 0.1)
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirmOrder}
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ 
            fontWeight: 'bold',
            px: 3,
            '&:hover': {
              bgcolor: theme.palette.primary.dark
            }
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Confirm Order'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 