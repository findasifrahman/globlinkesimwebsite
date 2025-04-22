import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, Typography, Button, Box, Chip, Divider } from '@mui/material';
import { Order } from '@/types/order';
import RefreshIcon from '@mui/icons-material/Refresh';

interface EsimCardProps {
  order: Order;
  onRefresh: () => void;
}

interface PackageDetails {
  packageCode: string;
  packageName: string;
  duration: number;
  dataSize: number;
  location: string;
  speed: string;
}

export default function EsimCard({ order, onRefresh }: EsimCardProps) {
  const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isActive = order.status === 'ACTIVE' || order.status === 'PROCESSING' || order.status === 'READY_FOR_DOWNLOAD' || order.status === 'GOT_RESOURCE';
  
  // Use useCallback to prevent unnecessary re-renders
  const fetchPackageDetails = useCallback(async () => {
    if (!order.packageCode) {
      console.log('No package_code available for order:', order.orderNo);
      return;
    }
    
    console.log('Fetching package details for order:', order.orderNo, 'with package_code:', order.package_code);
    
    try {
      // First try to get from localStorage
      const storedPackages = localStorage.getItem('packages');
      if (storedPackages) {
        try {
          const parsedPackages = JSON.parse(storedPackages);
          console.log('Parsed packages from localStorage:', parsedPackages);
          
          // Find the package that matches the order's packageCode
          const foundPackage = parsedPackages.find((pkg: any) => {
            const matches = pkg.packageCode === order.packageCode || 
                           pkg.packageCode === order.packageCode;
            //console.log(`Comparing ${pkg.package_code || pkg.packageCode} with ${order.package_code}: ${matches}`);
            return matches;
          });
          
          console.log('Found package:', foundPackage);
          
          if (foundPackage) {
            const packageDetails = {
              packageCode: foundPackage.package_code || foundPackage.packageCode,
              packageName: foundPackage.packageName || foundPackage.packageName,
              duration: foundPackage.duration,
              dataSize: foundPackage.data_size || foundPackage.dataSize || 0,
              location: foundPackage.location,
              speed: foundPackage.speed
            };
            console.log('Setting package details:', packageDetails);
            setPackageDetails(packageDetails);
            return;
          } else {
            console.log('Package not found in localStorage for code:', order.package_code);
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Only log once when component mounts or order changes
  useEffect(() => {
    console.log('Order data:', order);
  }, [order.orderNo]); // Only log when order number changes

  return (
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
        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              color: '#1976d2',
              mb: 1
            }}
          >
            {packageDetails?.packageName || 'Loading...'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Order: {order.orderNo}
          </Typography>
          <Chip 
            label={order.status} 
            color={isActive ? 'success' : 'default'}
            size="small"
            sx={{ 
              mt: 1,
              fontWeight: 'bold',
              px: 1
            }}
          />
        </Box>

        {isActive && order.qrCode && (
          <Box sx={{ 
            textAlign: 'center', 
            mb: 3,
            p: 2,
            bgcolor: '#f5f5f5',
            borderRadius: '8px'
          }}>
            <img 
              src={order.qrCode}
              alt="eSIM QR Code"
              style={{ 
                maxWidth: '100%', 
                height: 'auto',
                borderRadius: '4px'
              }}
            />
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                mt: 1, 
                display: 'block',
                fontWeight: 'medium'
              }}
            >
              Scan to install eSIM
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: 2 
          }}>
            <Box sx={{ 
              p: 1.5, 
              bgcolor: '#f5f5f5', 
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <Typography variant="body2" color="text.secondary">
                Data Remaining
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold',
                  color: '#d32f2f'
                }}
              >
                {formatDataSize(order.dataRemaining)}
              </Typography>
            </Box>
            <Box sx={{ 
              p: 1.5, 
              bgcolor: '#f5f5f5', 
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <Typography variant="body2" color="text.secondary">
                Data Used
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {formatDataSize(order.dataUsed)}
              </Typography>
            </Box>
            {order.daysRemaining !== undefined && (
              <Box sx={{ 
                p: 1.5, 
                bgcolor: '#f5f5f5', 
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}>
                <Typography variant="body2" color="text.secondary">
                  Days Remaining
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {order.daysRemaining} days
                </Typography>
              </Box>
            )}
            {order.expiryDate && (
              <Box sx={{ 
                p: 1.5, 
                bgcolor: '#f5f5f5', 
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}>
                <Typography variant="body2" color="text.secondary">
                  Expiry Date
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: '#d32f2f'
                  }}
                >
                  {new Date(order.expiryDate).toLocaleDateString()}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Button 
          variant="contained" 
          onClick={handleRefresh}
          fullWidth
          startIcon={<RefreshIcon />}
          disabled={isRefreshing}
          sx={{ 
            mt: 2,
            py: 1.2,
            borderRadius: '8px',
            fontWeight: 'bold'
          }}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
        </Button>
      </CardContent>
    </Card>
  );
} 