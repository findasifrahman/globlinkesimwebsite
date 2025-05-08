import React, { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Collapse,
  IconButton,
  Dialog,
  DialogContent,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  QrCode as QrCodeIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { Order } from '@/types/order';
import Image from 'next/image';
import TopUpConfirmationModal from './TopUpConfirmationModal';
import { useTheme } from '@mui/material/styles';

interface EsimCardProps {
  order: Order;
  onTopUp: (order: Order) => Promise<void>;
}

interface PackageDetails {
  packageCode: string;
  packageName: string;
  duration: number;
  dataSize: number;
  location: string;
  speed: string;
  retailPrice: number;
  currencyCode: string;
}

export default function EsimCard({ order, onTopUp }: EsimCardProps) {
  const [packageDetails, setPackageDetails] = useState<{
    packageCode: string;
    packageName: string;
    duration: number;
    dataSize: number;
    location: string;
    speed: string;
    retailPrice: number;
    currencyCode: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQrCode, setShowQrCode] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const isActive = order.status === 'ACTIVE' || 
                  order.status === 'PROCESSING' || 
                  order.status === 'READY_FOR_DOWNLOAD' || 
                  order.status === 'GOT_RESOURCE' ||
                  order.status === 'USED_UP';
  const theme = useTheme();
  
  // Format date to DD/MM/YYYY HH:MM
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    // Format as DD/MM/YYYY HH:MM
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2); // Get last 2 digits of year
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };
  
  // Use useCallback to prevent unnecessary re-renders
  const fetchPackageDetails = useCallback(async () => {
    if (!order.packageCode) {

      console.log('No package_code available for order:', order);
      return;
    }

    
    //console.log('Fetching package details for order:', order.orderNo, 'with package_code:', order.package_code);
    
    try {
      // First try to get from localStorage
      const storedPackages = localStorage.getItem('packages');
      if (storedPackages) {
        try {
          const parsedPackages = JSON.parse(storedPackages);
          //console.log('Parsed packages from localStorage:', parsedPackages);
          
          // Find the package that matches the order's package_code
          const foundPackage = parsedPackages.find((pkg: any) => {
            const matches = pkg.packageCode === order.packageCode || 
                           pkg.packageCode === order.packageCode;
            //console.log(`Comparing ${pkg.package_code || pkg.packageCode} with ${order.package_code}: ${matches}`);
            return matches;
          });
          
          //console.log('Found package:', foundPackage);
          
          if (foundPackage) {
            const packageDetails = {
              packageCode: foundPackage.packageCode,
              packageName: foundPackage.packageName || foundPackage.packageName,
              duration: foundPackage.duration,
              dataSize: foundPackage.data_size || foundPackage.dataSize || 0,
              location: foundPackage.location,
              speed: foundPackage.speed,
              retailPrice: foundPackage.retailPrice || 0,
              currencyCode: foundPackage.currencyCode || 'USD'
            };
            //console.log('Setting package details:', packageDetails);
            setPackageDetails(packageDetails);
            return;
          } else {
            console.log('Package not found in localStorage for code:', order.packageCode);
          }
        } catch (e) {
          console.error('Error parsing stored packages:', e);
        }
      } else {
        console.log('No packages found in localStorage');
      }
      
      // If not in localStorage or parsing failed, fetch from API
      console.log('Fetching package details from API for:', order.packageCode);
      const response = await fetch(`/api/packages/${order.packageCode}`);
      if (response.ok) {
        const data = await response.json();
        console.log('API response:', data);
        setPackageDetails(data.package);
      } else {
        console.error('Failed to fetch package from API:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching package details:', error);
    }
  }, [order.packageCode, order.orderNo]);

  useEffect(() => {
    fetchPackageDetails();
  }, [fetchPackageDetails]);

  const formatDataSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const handleTopUp = async () => {
    try {
      // Get packages from localStorage
      const storedPackages = localStorage.getItem('packages');
      if (!storedPackages) {
        throw new Error('Package details not available');
      }

      const packages = JSON.parse(storedPackages);
      const foundPackage = packages.find((pkg: any) => pkg.packageCode === order.packageCode);
      
      if (!foundPackage) {
        throw new Error('Package not found');
      }

      setPackageDetails(foundPackage);
      setShowTopUpModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate top-up');
    }
  };

  // Only log once when component mounts or order changes
  useEffect(() => {
    //console.log('Order data:', order);
  }, [order.orderNo]); // Only log when order number changes

  // Function to check if eSIM is eligible for top-up
  const isEligibleForTopUp = () => {
    // Check if eSIM is eligible for top-up based on Redtea Mobile API criteria
    const eligibleEsimStatus = ['IN_USE', 'USED_UP', 'GOT_RESOURCE'];
    return (
      eligibleEsimStatus.includes(order.esimStatus || '') && 
      order.smdpStatus === 'ENABLED'
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'GOT_RESOURCE':
        return 'success';
      case 'PROCESSING':
      case 'READY_FOR_DOWNLOAD':
        return 'warning';
      case 'CANCEL':
      case 'FAILED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: isActive ? '0 4px 8px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)',
        border: isActive ? '1px solid #4caf50' : '1px solid #e0e0e0',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="div">
              {packageDetails?.packageName || order.packageCode || 'Unknown Package'}
            </Typography>
            <Chip
              label={order.status}
              color={getStatusColor(order.status)}
              size="small"
            />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Order No: {order.orderNo}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Created: {formatDate(order.createdAt)}
            </Typography>
            {order.iccid && (
              <Typography variant="body2" color="text.secondary">
                ICCID: {order.iccid}
              </Typography>
            )}
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              Data Remaining: {order.dataRemaining ? `${(order.dataRemaining / (1024 * 1024)).toFixed(2)} MB` : 'N/A'}
            </Typography>
            <Typography variant="body2">
              Data Used: {order.dataUsed ? `${(order.dataUsed / (1024 * 1024)).toFixed(2)} MB` : 'N/A'}
            </Typography>
            <Typography variant="body2">
              Days Remaining: {order.daysRemaining || 'N/A'}
            </Typography>
          </Box>

          {isEligibleForTopUp() && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleTopUp}
              disabled={loading}
              sx={{ 
                mt: 2,
                width: '100%',
                fontWeight: 'bold',
                '&:hover': {
                  bgcolor: theme.palette.primary.dark
                }
              }}
            >
              Top Up
            </Button>
          )}

          {order.qrCode && (
            <>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<QrCodeIcon />}
                onClick={() => setShowQrCode(true)}
                sx={{ mt: 2 }}
              >
                Show QR Code
              </Button>

              <Dialog
                open={showQrCode}
                onClose={() => setShowQrCode(false)}
                maxWidth="sm"
                fullWidth
              >
                <DialogContent sx={{ textAlign: 'center' }}>
                  <Image
                    src={order.qrCode}
                    alt="eSIM QR Code"
                    width={300}
                    height={300}
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </DialogContent>
              </Dialog>
            </>
          )}
        </CardContent>
      </Card>

      <TopUpConfirmationModal
        open={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        order={order}
      />
    </>
  );
} 