'use client';

import { Box, Grid, Paper, Typography, useTheme } from '@mui/material';
import {
  Inventory as InventoryIcon,
  LocalOffer as DiscountIcon,
  ShoppingCart as OrdersIcon,
  Payment as PaymentIcon,
  People as UsersIcon
} from '@mui/icons-material';

export default function AdminDashboard() {
  const theme = useTheme();

  const stats = [
    {
      title: 'Total Packages',
      value: '0',
      icon: <InventoryIcon fontSize="large" color="primary" />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Active Discounts',
      value: '0',
      icon: <DiscountIcon fontSize="large" color="secondary" />,
      color: theme.palette.secondary.main,
    },
    {
      title: 'Total Orders',
      value: '0',
      icon: <OrdersIcon fontSize="large" color="success" />,
      color: theme.palette.success.main,
    },
    {
      title: 'Total Revenue',
      value: '$0',
      icon: <PaymentIcon fontSize="large" color="info" />,
      color: theme.palette.info.main,
    },
    {
      title: 'Total Users',
      value: '0',
      icon: <UsersIcon fontSize="large" color="warning" />,
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard Overview
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: 'repeat(5, 1fr)' }, gap: 3, mt: 2 }}>
        {stats.map((stat, index) => (
          <Paper
            key={index}
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            <Box sx={{ mb: 2 }}>{stat.icon}</Box>
            <Typography variant="h5" component="h2" gutterBottom>
              {stat.value}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {stat.title}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Recent Orders
          </Typography>
          <Typography variant="body1" color="text.secondary">
            No recent orders
          </Typography>
        </Paper>
        <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Recent Users
          </Typography>
          <Typography variant="body1" color="text.secondary">
            No recent users
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
} 