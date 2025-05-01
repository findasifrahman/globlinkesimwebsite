'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Typography, 
  useTheme, 
  Button,
  IconButton,
  useMediaQuery,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  LocalOffer as DiscountIcon,
  ShoppingCart as OrdersIcon,
  Payment as PaymentIcon,
  People as UsersIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import Link from 'next/link';
import Cookies from 'js-cookie';

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const checkAuth = () => {
      const adminAuth = Cookies.get('adminAuth');
      if (!adminAuth) {
        router.push('/admin/login');
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('adminAuth');
    router.push('/admin/login');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Don't render the layout for the login page
  if (pathname === '/admin/login') {
    return children;
  }

  if (!isAuthenticated) {
    return null;
  }

  const drawer = (
    <>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="primary">
          Admin Dashboard
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem>
          <Button
            component={Link}
            href="/admin/dashboard"
            fullWidth
            startIcon={<DashboardIcon />}
            sx={{ justifyContent: 'flex-start' }}
          >
            Dashboard
          </Button>
        </ListItem>
        <ListItem>
          <Button
            component={Link}
            href="/admin/fetch-packages"
            fullWidth
            startIcon={<InventoryIcon />}
            sx={{ justifyContent: 'flex-start' }}
          >
            Fetch All Packages
          </Button>
        </ListItem>
        <ListItem>
          <Button
            component={Link}
            href="/admin/discount-codes"
            fullWidth
            startIcon={<DiscountIcon />}
            sx={{ justifyContent: 'flex-start' }}
          >
            Discount Codes
          </Button>
        </ListItem>
        <ListItem>
          <Button
            component={Link}
            href="/admin/orders"
            fullWidth
            startIcon={<OrdersIcon />}
            sx={{ justifyContent: 'flex-start' }}
          >
            Orders
          </Button>
        </ListItem>
        <ListItem>
          <Button
            component={Link}
            href="/admin/payments"
            fullWidth
            startIcon={<PaymentIcon />}
            sx={{ justifyContent: 'flex-start' }}
          >
            Payments
          </Button>
        </ListItem>
        <ListItem>
          <Button
            component={Link}
            href="/admin/users"
            fullWidth
            startIcon={<UsersIcon />}
            sx={{ justifyContent: 'flex-start' }}
          >
            Users
          </Button>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem>
          <Button
            onClick={handleLogout}
            fullWidth
            startIcon={<LogoutIcon />}
            sx={{ justifyContent: 'flex-start' }}
          >
            Logout
          </Button>
        </ListItem>
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - 240px)` },
          ml: { md: '240px' },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {pathname.split('/').pop()?.replace(/-/g, ' ').toUpperCase() || 'DASHBOARD'}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: 240 }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 240px)` },
          mt: '64px',
        }}
      >
        {children}
      </Box>
    </Box>
  );
} 