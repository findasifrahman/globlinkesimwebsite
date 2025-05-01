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
// this page is served after payment to show esim order details
export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const orderNo = params.orderNo;
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [packageDetails, setPackageDetails] = useState<ProcessedPackage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  // Get payment status from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    if (status === 'failed' || status === 'expired' || status === 'cancelled' || status === 'rejected') {
      setPaymentStatus(status);
      setError('Payment failed. Please try again or contact support if the issue persists.');
      setLoading(false);
    } else if (status === 'pending') {
      setPaymentStatus('pending');
      setError('Payment is still processing. Please wait or refresh the page.');
      setLoading(false);
    }
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/orders/' + orderNo);
    }
  }, [status, router, orderNo]);

  // Fetch order details when component mounts, but only if payment was successful
  useEffect(() => {
    if (session?.user && !paymentStatus) {
      fetchOrderDetails();
    }
  }, [session?.user, orderNo, paymentStatus]);

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
      const storedPackages = localStorage.getItem('packages');
      if (storedPackages) {
        const packages = JSON.parse(storedPackages);
        if (Array.isArray(packages)) {
          const foundPackage = packages.find(pkg => pkg.packageCode === packageCode);
          if (foundPackage) {
            setPackageDetails(foundPackage);
            setError(null);
            return true;
          }
        }
      }
      return false;
    } catch (e) {
      console.error('Error parsing stored packages:', e);
      return false;
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
          <Alert 
            severity={paymentStatus === 'failed' || paymentStatus === 'expired' || paymentStatus === 'canceled' ? 'error' : 'warning'} 
            sx={{ mb: 2 }}
          >
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
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 300 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Order Number</Typography>
                    <Typography variant="body1" fontWeight="medium">{order.orderNo}</Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 300 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                    <Typography variant="body1" fontWeight="medium">{order.status}</Typography>
                  </CardContent>
                </Card>
              </Box>

              {order.discountCode && (
                <>
                  <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 300 }}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">Discount Code</Typography>
                        <Typography variant="body1" fontWeight="medium">{order.discountCode}</Typography>
                      </CardContent>
                    </Card>
                  </Box>
                  <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 300 }}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">Discount Applied</Typography>
                        <Typography variant="body1" fontWeight="medium" color="success.main">
                          {order.discountPercentage}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </>
              )}
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Package Information
            </Typography>
            {packageDetails ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 300 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">Package Name</Typography>
                      <Typography variant="body1" fontWeight="medium" color="error">{packageDetails.packageName}</Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 300 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">Duration</Typography>
                      <Typography variant="body1" fontWeight="medium">{packageDetails.duration} days</Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 300 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">Data Size</Typography>
                      <Typography variant="body1" fontWeight="medium">{formatDataSize(packageDetails.dataSize)}</Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 300 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                      <Typography variant="body1" fontWeight="medium">{packageDetails.location}</Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 300 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">Speed</Typography>
                      <Typography variant="body1" fontWeight="medium">{packageDetails.speed}</Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            ) : (
              <Alert severity="info">Package details not available</Alert>
            )}
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              eSIM Information
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
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 300 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Data Used</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDataSize(order.dataUsed || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 300 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Data Remaining</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDataSize(order.dataRemaining || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              {order.daysRemaining !== undefined && (
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 300 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">Days Remaining</Typography>
                      <Typography variant="body1" fontWeight="medium" color="error">{order.daysRemaining} days</Typography>
                    </CardContent>
                  </Card>
                </Box>
              )}
              {order.expiryDate && (
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 300 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.primary">Expiry Date</Typography>
                      <Typography variant="body1" fontWeight="medium" color="error">
                        {formatDate(order.expiryDate)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              )}

              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 300 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                    <Typography variant="body1" fontWeight="medium">{order.status}</Typography>
                  </CardContent>
                </Card>
              </Box>
              {order.iccid && (
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 300 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">ICCID</Typography>
                      <Typography variant="body1" fontWeight="medium">{order.iccid}</Typography>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Button 
              variant="outlined" 
              onClick={handleBack}
            >
              Back to Account
            </Button>
          </Box>
        </Paper>
      </Container>
      <Footer />
    </>
  );
}
