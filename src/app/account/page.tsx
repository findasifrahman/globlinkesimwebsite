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
import TopUpConfirmationModal from '@/components/TopUpConfirmationModal';
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
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
      setError(null);
      
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      console.log('[Account Page] Fetched orders:', data.orders.length);

      if (data.orders.length === 0) {
        setOrders([]);
        return;
      }

      // Filter orders from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentOrders = data.orders.filter((order: any) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= thirtyDaysAgo;
      });

      console.log('[Account Page] Recent orders (last 30 days):', recentOrders.length);

      const processedOrders = await Promise.all(recentOrders.map(async (order: any) => {
        try {
          console.log(`[Account Page] Fetching profile for order: ${order.orderNo}`);
          const profileResponse = await fetch(`/api/orders/${order.orderNo}/profile`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!profileResponse.ok) {
            console.error(`[Account Page] Failed to fetch profile for order ${order.orderNo}:`, profileResponse.statusText);
            return null;
          }
          
          const profileData = await profileResponse.json();
          console.log(`[Account Page] Profile data for ${order.orderNo}:`, profileData);

          // If the order doesn't exist in Redtea Mobile, filter it out
          if (!profileData || profileData.error === 'the batchOrderNo doesn`t exist') {
            console.log(`[Account Page] Order ${order.orderNo} not found in Redtea Mobile, filtering out`);
            return null;
          }

          // Update the database with the new values
          try {
            const updateResponse = await fetch('/api/update-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderNo: order.orderNo,
                status: profileData.status || order.status || 'UNKNOWN',
                dataRemaining: profileData.dataRemaining?.toString() || order.dataRemaining?.toString() || null,
                dataUsed: profileData.dataUsed?.toString() || order.dataUsed?.toString() || null,
                smdpStatus: profileData.smdpStatus || order.smdpStatus,
                qrCode: profileData.qrCode || order.qrCode,
                daysRemaining: profileData.daysRemaining ? parseInt(profileData.daysRemaining) : order.daysRemaining ? parseInt(order.daysRemaining) : null,
                iccid: profileData.iccid || order.iccid,
                expiryDate: profileData.expiryDate || order.expiryDate,
                packageCode: profileData.packageCode || order.packageCode,
                esimStatus: profileData.esimStatus || order.esimStatus
              }),
            });

            if (!updateResponse.ok) {
              console.error(`[Account Page] Failed to update order ${order.orderNo} in database:`, await updateResponse.text());
            }
          } catch (updateError) {
            console.error(`[Account Page] Error updating order ${order.orderNo} in database:`, updateError);
          }

          return {
            ...order,
            status: profileData.status || order.status || 'UNKNOWN',
            dataRemaining: profileData.dataRemaining?.toString() || order.dataRemaining?.toString() || null,
            dataUsed: profileData.dataUsed?.toString() || order.dataUsed?.toString() || null,
            expiryDate: profileData.expiryDate || order.expiryDate,
            package_code: order.package_code || profileData.packageCode || 'unknown',
            packageCode: order.package_code || profileData.packageCode || 'unknown',
            esimStatus: profileData.esimStatus || order.esimStatus,
            smdpStatus: profileData.smdpStatus || order.smdpStatus,
            qrCode: profileData.qrCode || order.qrCode,
            iccid: profileData.iccid || order.iccid,
            error: profileData.error
          };
        } catch (error) {
          console.error(`[Account Page] Error processing order ${order.orderNo}:`, error);
          return null;
        }
      }));

      // Filter out null values (orders that don't exist in Redtea Mobile)
      const validOrders = processedOrders.filter((order): order is Order => order !== null);
      console.log(`[Account Page] Filtered orders: ${validOrders.length} valid out of ${processedOrders.length} total`);
      
      setOrders(validOrders);
    } catch (error) {
      console.error('[Account Page] Error fetching orders:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch orders');
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

  const handleTopUp = async (order: Order) => {
    //setSelectedOrder(order);
    //setShowTopUpModal(true);
  };

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
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Showing eSIMs from the last 30 days. For older eSIMs, please contact support.
            </Alert>
            
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
                No {activeTab === 0 ? 'active' : 'inactive'} eSIMs found in the last 30 days
              </Alert>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                {filteredOrders.map((order) => (
                  <Box key={order.orderNo}>
                    <EsimCard 
                      order={order} 
                      onTopUp={handleTopUp}
                    />
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
      {selectedOrder && (
        <TopUpConfirmationModal
          open={showTopUpModal}
          onClose={() => {
            setShowTopUpModal(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
        />
      )}
    </>
  );
} 