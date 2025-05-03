import React, { useState, useEffect } from 'react';
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
  useTheme,
  alpha,
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Order } from '@/types/order';
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
  };
  
  return countries[code] || code;
};

interface TopUpConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  order: Order;
}

export default function TopUpConfirmationModal({
  open,
  onClose,
  order
}: TopUpConfirmationModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [packageDetails, setPackageDetails] = useState<any>(null);
  const theme = useTheme();

  useEffect(() => {
    if (open && order.packageCode) {
      console.log('Fetching package details for:', order.packageCode);
      
      // Get packages from localStorage
      const storedPackages = localStorage.getItem('packages');
      if (storedPackages) {
        try {
          const packages = JSON.parse(storedPackages);
          console.log('Found packages in localStorage:', packages);
          
          const foundPackage = packages.find((pkg: any) => pkg.packageCode === order.packageCode);
          if (foundPackage) {
            console.log('Found matching package:', foundPackage);
            setPackageDetails(foundPackage);
          } else {
            console.log('No matching package found in localStorage');
            setError('Package details not found');
          }
        } catch (err) {
          console.error('Error parsing packages from localStorage:', err);
          setError('Error loading package details');
        }
      } else {
        console.log('No packages found in localStorage');
        setError('Package details not available');
      }
    }
  }, [open, order.packageCode]);

  // Function to initiate top-up payment
  const handleConfirmTopUp = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    if (!packageDetails) {
      setError('Package details not available');
      return;
    }

    setLoading(true);
    setError(null);
    setStatus('Processing top-up...');

    try {
      // Generate a unique order ID for the top-up
      const timestamp = Date.now();
      const newOrderId = `TOPUP-${order.orderNo}-${timestamp}`;
      const transactionId = crypto.randomUUID();

      // Create top-up order before payment
      const orderResponse = await fetch('/api/esimorderafterpayment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentOrderNo: newOrderId,
          packageCode: packageDetails.packageCode,
          count: 1,
          amount: packageDetails.retailPrice,
          currency: packageDetails.currencyCode,
          discountCode: "none",
          finalAmountPaid: packageDetails.retailPrice,
          isTopUp: true,
          originalOrderNo: order.orderNo,
          transactionId: transactionId
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        setStatus('Failed to create top-up order. Please contact system administrator.');
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
          amount: packageDetails.retailPrice,
          currency: packageDetails.currencyCode,
          description: `eSIM Top-up: ${packageDetails.packageName}`,
          isTopUp: true,
          originalOrderNo: order.orderNo,
          transactionId: transactionId
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
        window.location.href = paymentData.redirect_url;
      } else {
        throw new Error('No redirect URL received from payment provider');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process top-up payment');
      setLoading(false);
    }
  };

  if (!packageDetails) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Loading Package Details</DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

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
        Confirm Top-up
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
            {packageDetails.location && packageDetails.location.includes(',') ? (
              <Public color="primary" sx={{ mr: 1 }} />
            ) : (
              <Flag color="primary" sx={{ mr: 1 }} />
            )}
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
              {packageDetails.packageName}
            </Typography>
          </Box>
          <Typography><strong>Location:</strong> {packageDetails.location ? getCountryName(packageDetails.location) : 'Unknown'}</Typography>
          <Typography><strong>Duration:</strong> {packageDetails.duration} days</Typography>
          <Typography><strong>Speed:</strong> {packageDetails.speed || 'Unknown'}</Typography>
          <Typography><strong>Data Size:</strong> {(packageDetails.dataSize / (1024 * 1024)).toFixed(2)} MB</Typography>
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
            Total Amount: {packageDetails.currencyCode} {(packageDetails.retailPrice / 10000).toFixed(2)}
          </Typography>
        </Paper>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          By confirming this top-up, you agree to purchase additional data for your existing eSIM. The top-up will be applied to your eSIM once the payment is completed and the order is processed.
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
          onClick={handleConfirmTopUp}
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
          {loading ? <CircularProgress size={24} /> : 'Confirm Top-up'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 