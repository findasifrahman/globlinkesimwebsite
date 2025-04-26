'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EsimCard from '@/components/EsimCard';
import { Order } from '@/types/order';
import { queryEsimProfile } from '@/lib/esim';
// We'll use the existing Session type from next-auth instead of extending it
// This avoids the type conflict

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const lastFetchTime = useRef<number>(0);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/account');
    }
  }, [status, router]);

  // Fetch orders when component mounts or session changes
  useEffect(() => {
    if (session?.user) {
      // Debounce the fetch to prevent multiple calls
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      
      fetchTimeoutRef.current = setTimeout(() => {
        const now = Date.now();
        // Only fetch if it's been more than 5 seconds since the last fetch
        if (now - lastFetchTime.current > 5000) {
          fetchOrders();
          lastFetchTime.current = now;
        }
      }, 500);
    }
    
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [session?.user?.email]); // Only depend on the email, not the entire session object

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      
      // Process each order and fetch its profile data
      const processedOrders = await Promise.all(data.orders.map(async (order: any) => {
        try {
          // Fetch the eSIM profile for this order using the correct API endpoint
          //${order.orderNo}
          const profileResponse = await fetch(`/api/orders/${order.orderNo}/profile`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!profileResponse.ok) {
            console.error(`Failed to fetch profile for order ${order.orderNo}:`, profileResponse.statusText);
            return order; // Return original order if profile fetch failed
          }
          
          const profileData = await profileResponse.json();
          console.log("profileData---",profileData);
          if (!profileData.success) {
            console.error(`Profile fetch failed for order ${order.orderNo}:`, profileData.error);
            return order; // Return original order if profile fetch failed
          }
          
          // Extract the updated values
          const updatedStatus = profileData.data.esimStatus;
          const updatedDataRemaining = profileData.data.dataRemaining;
          const updatedDataUsed = profileData.data.dataUsed;
          const updatedSmdpStatus = profileData.data.smdpStatus;
          const updatedQrCode = profileData.data.qrCode;
          
          // Update the database with the new values
          try {
            const updateResponse = await fetch('/api/update-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderNo: order.orderNo,
                status: updatedStatus,
                dataRemaining: updatedDataRemaining,
                dataUsed: updatedDataUsed,
                smdpStatus: updatedSmdpStatus,
                qrCode: updatedQrCode
              }),
            });

            if (!updateResponse.ok) {
              console.error(`Failed to update order ${order.orderNo} in database:`, await updateResponse.text());
            }
          } catch (updateError) {
            console.error(`Error updating order ${order.orderNo} in database:`, updateError);
          }
          
          // Update the order with profile data
          return {
            ...order,
            status: updatedStatus,
            dataRemaining: updatedDataRemaining,
            dataUsed: updatedDataUsed,
            expiryDate: profileData.data.expiryDate,
            package_code: order.package_code || profileData.data.packageCode || 'unknown',
            packageCode: order.package_code || profileData.data.packageCode || 'unknown', // For backward compatibility
            esimStatus: updatedStatus,
            smdpStatus: updatedSmdpStatus,
            qrCode: updatedQrCode,
            iccid: profileData.data.iccid
          };
        } catch (error) {
          console.error(`Error processing order ${order.orderNo}:`, error);
          return order; // Return original order if any error occurs
        }
      }));
      
      // Update state with processed orders
      setOrders(processedOrders);
    } catch (err) {
      console.error('Error in fetchOrders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut({ redirect: false });
    router.push('/');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const isInactive = (order: Order) => {
    return order.esimStatus === 'Depleted' || 
           order.esimStatus === 'Deleted' || 
           order.esimStatus === 'CANCEL';
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 0) {
      return !isInactive(order);
    } else {
      return isInactive(order);
    }
  });

  if (status === 'loading') {
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

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            My Account
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                <Typography variant="body1">{session.user?.name || 'Not provided'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{session.user?.email}</Typography>
              </Box>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              My eSIMs
            </Typography>
            
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
              <Tab label="Active" />
              <Tab label="Inactive" />
            </Tabs>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredOrders.length === 0 ? (
              <Alert severity="info">
                No {activeTab === 0 ? 'active' : 'inactive'} eSIMs found
              </Alert>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                {filteredOrders.map((order) => (
                  <Box key={order.orderNo}>
                    <EsimCard order={order} onRefresh={fetchOrders} />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Account Actions
            </Typography>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={handleSignOut}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign Out'}
            </Button>
          </Box>
        </Paper>
      </Container>
      <Footer />
    </>
  );
} 