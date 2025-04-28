'use client';

import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  Divider,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Order } from '@/types/order';
import { ProcessedPackage } from '@/types/package';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import { formatDataSize, formatDate, formatCurrency } from '@/lib/utils';

interface OrderDetailsPageProps {
  params: {
    orderNo: string;
  };
}

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const orderNo = params.orderNo;
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [packageDetails, setPackageDetails] = useState<ProcessedPackage | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/orders/' + orderNo);
    }
  }, [status, router, orderNo]);

  // Fetch order details when component mounts
  useEffect(() => {
    if (session?.user) {
      fetchOrderDetails();
    }
  }, [session, orderNo]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderNo}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      
      const data = await response.json();
      setOrder(data.order);
      
      // Fetch package details if we have a package code
      if (data.order.packageCode) {
        fetchPackageDetails(data.order.packageCode);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const fetchPackageDetails = async (packageCode: string) => {
    try {
      const response = await fetch(`/api/packages/${packageCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch package details');
      }
      
      const data = await response.json();
      setPackageDetails(data.package);
    } catch (err) {
      console.error('Error fetching package details:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchOrderDetails();
    } finally {
      setRefreshing(false);
    }
  };

  const handleBack = () => {
    router.push('/account');
  };

  if (status === 'loading' || loading) {
    return (
      <>
        <Navbar />
        <Container sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={60} />
        </Container>
        <Footer />
      </>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  if (error) {
    return (
      <>
        <Navbar />
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
            variant="contained"
          >
            Back to Account
          </Button>
        </Container>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Order not found
          </Alert>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
            variant="contained"
          >
            Back to Account
          </Button>
        </Container>
        <Footer />
      </>
    );
  }

  const isActive = order.status === 'ACTIVE' || order.status === 'PROCESSING' || 
                  order.status === 'READY_FOR_DOWNLOAD' || order.status === 'GOT_RESOURCE';

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Order Details
            </Typography>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={handleBack}
              variant="outlined"
            >
              Back to Account
            </Button>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Order Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Order Number</Typography>
                <Typography variant="body1" fontWeight="medium">{order.orderNo}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Typography variant="body1" fontWeight="medium">{order.status}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formatDate(order.createdAt)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formatDate(order.updatedAt)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Package Information
            </Typography>
            {packageDetails ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Package Name</Typography>
                  <Typography variant="body1" fontWeight="medium">{packageDetails.packageName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Duration</Typography>
                  <Typography variant="body1" fontWeight="medium">{packageDetails.duration} days</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Data Size</Typography>
                  <Typography variant="body1" fontWeight="medium">{formatDataSize(packageDetails.dataSize)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                  <Typography variant="body1" fontWeight="medium">{packageDetails.location}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Speed</Typography>
                  <Typography variant="body1" fontWeight="medium">{packageDetails.speed}</Typography>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">Package details not available</Alert>
            )}
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              eSIM Details
            </Typography>
            
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
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
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
              </Grid>
              <Grid item xs={12} sm={6}>
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
              </Grid>
              {order.daysRemaining !== undefined && (
                <Grid item xs={12} sm={6}>
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
                </Grid>
              )}
              {order.expiryDate && (
                <Grid item xs={12} sm={6}>
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
                      {formatDate(order.expiryDate)}
                    </Typography>
                  </Box>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <Box sx={{ 
                  p: 1.5, 
                  bgcolor: '#f5f5f5', 
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  <Typography variant="body2" color="text.secondary">
                    eSIM Status
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {order.esimStatus || 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ 
                  p: 1.5, 
                  bgcolor: '#f5f5f5', 
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  <Typography variant="body2" color="text.secondary">
                    SMDP Status
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {order.smdpStatus || 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              {order.iccid && (
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: '#f5f5f5', 
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      ICCID
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {order.iccid}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="outlined" 
              onClick={handleBack}
            >
              Back to Account
            </Button>
            <Button 
              variant="contained" 
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh Status'}
            </Button>
          </Box>
        </Paper>
      </Container>
      <Footer />
    </>
  );
}
