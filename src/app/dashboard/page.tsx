'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  SimCard,
  SignalCellular4Bar,
  AccessTime,
  QrCode2,
  AddCircleOutline,
} from '@mui/icons-material';
import Image from 'next/image';

interface Order {
  id: number;
  orderNo: string;
  packageCode: string;
  count: number;
  price: number;
  periodNum: number;
  status: string;
  createdAt: string;
}

interface ESIMDetails {
  status: string;
  qrCode: string;
  iccid: string;
  expiry: string;
  dataUsage: {
    used: number;
    total: number;
  };
  canTopUp: boolean;
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [esimDetails, setEsimDetails] = useState<Record<string, ESIMDetails>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/my-orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.orders);
      
      // Fetch eSIM details for each order
      data.orders.forEach(fetchESIMDetails);
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchESIMDetails = async (order: Order) => {
    try {
      const response = await fetch(`/api/esim/query/${order.orderNo}`);
      if (!response.ok) throw new Error('Failed to fetch eSIM details');
      const data = await response.json();
      setEsimDetails(prev => ({
        ...prev,
        [order.orderNo]: data
      }));
    } catch (err) {
      console.error(`Failed to fetch eSIM details for order ${order.orderNo}:`, err);
    }
  };

  const handleTopUp = async (orderNo: string) => {
    try {
      const response = await fetch(`/api/esim/topup/${orderNo}`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to initiate top-up');
      // Refresh eSIM details after top-up
      const order = orders.find(o => o.orderNo === orderNo);
      if (order) fetchESIMDetails(order);
    } catch (err) {
      console.error('Top-up failed:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My eSIMs
      </Typography>

      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}

      <Grid container spacing={3}>
        {orders.map((order) => {
          const esim = esimDetails[order.orderNo];
          return (
            <Grid item xs={12} md={6} key={order.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" component="div">
                      Order #{order.orderNo}
                    </Typography>
                    <Chip
                      label={order.status}
                      color={order.status === 'ACTIVE' ? 'success' : 'default'}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <SimCard />
                        <Typography variant="body2">
                          ICCID: {esim?.iccid || 'Loading...'}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <AccessTime />
                        <Typography variant="body2">
                          Expires: {esim?.expiry ? new Date(esim.expiry).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>

                    {esim?.dataUsage && (
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <SignalCellular4Bar />
                          <Typography variant="body2">
                            Data Usage: {esim.dataUsage.used}GB / {esim.dataUsage.total}GB
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>

                  {esim?.qrCode && (
                    <Box mt={2} display="flex" justifyContent="center">
                      <Image
                        src={esim.qrCode}
                        alt="eSIM QR Code"
                        width={200}
                        height={200}
                      />
                    </Box>
                  )}
                </CardContent>

                <Divider />

                <CardActions>
                  <Button
                    startIcon={<QrCode2 />}
                    size="small"
                    onClick={() => window.open(esim?.qrCode, '_blank')}
                    disabled={!esim?.qrCode}
                  >
                    View QR Code
                  </Button>
                  
                  {esim?.canTopUp && (
                    <Button
                      startIcon={<AddCircleOutline />}
                      size="small"
                      color="primary"
                      onClick={() => handleTopUp(order.orderNo)}
                    >
                      Top Up
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
} 