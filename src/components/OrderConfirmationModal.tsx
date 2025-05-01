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
  discountCode?: string;
  finalAmountPaid: number;
}

export default function OrderConfirmationModal({
  open,
  onClose,
  packageDetails,
  quantity,
  discountCode,
  finalAmountPaid
}: OrderConfirmationModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const theme = useTheme();

  // Function to initiate payment
  const handleConfirmOrder = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);
    setStatus('Creating order...');
    console.log("initiating payment...")
    try {
      // Generate a unique order ID
      const timestamp = Date.now();
      const newOrderId = `${packageDetails.packageCode}-${timestamp}`;
      console.log("order id created at payment initiation", newOrderId);
      console.log("package details is", packageDetails);

      // Create order before payment
      const orderResponse = await fetch('/api/esimorderbeforepayment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentOrderNo: newOrderId,
          packageCode: packageDetails.packageCode,
          count: quantity,
          amount: packageDetails.retailPrice,
          currency: packageDetails.currencyCode,
          discountCode: discountCode || "none",
          finalAmountPaid: finalAmountPaid
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        console.log("order response esimorderbeforepayment is not ok--", orderData);
        setStatus('Failed to create order. Please contact system administrator.');
        setLoading(false);
        return;
      }

      setStatus('Initiating payment...');

      // Create payment with Payssion
      const paymentResponse = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: newOrderId,
          amount: finalAmountPaid, //(packageDetails.retailPrice * quantity / 10000).toFixed(2), // Convert to actual currency amount
          currency: packageDetails.currencyCode,
          description: `eSIM Order: ${packageDetails.packageName} (${quantity} units)`
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        setStatus('Failed to create payment. Please contact system administrator.');
        setLoading(false);
        return;
      }

      if (paymentData.redirect_url) {
        setStatus(`Redirecting to payment page...`);
        // Redirect to payment page in the same window
        window.location.href = paymentData.redirect_url;
      } else {
        throw new Error('No redirect URL received from payment provider');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment');
      setLoading(false);
    }
  };

  const totalPrice = (packageDetails.retailPrice * quantity) / 10000;

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
        
        {status && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {status}
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
          <Typography><strong>Price per unit:</strong> {packageDetails.currencyCode} {(packageDetails.retailPrice / 10000).toFixed(2)}</Typography>
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
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Total Amount: {packageDetails.currencyCode} {finalAmountPaid.toFixed(2)}
            {discountCode && discountCode !== "none" && (
              <Typography variant="body2" color="success.main">
                (Discount code: {discountCode})
              </Typography>
            )}
          </Typography>
        </Paper>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          By confirming this order, you agree to purchase the eSIM package. The eSIM will be delivered to your email once the payment is completed and the order is processed.
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