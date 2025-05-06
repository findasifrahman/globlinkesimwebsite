'use client';

import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  alpha,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Language,
  Notifications,
  Settings,
  Logout,
  Home as HomeIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD'];

export default function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currencyAnchor, setCurrencyAnchor] = useState<null | HTMLElement>(null);
  const [accountAnchor, setAccountAnchor] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Add debugging logs
  useEffect(() => {
    //console.log('Navbar Session Status:', status);
    //console.log('Navbar Session Data:', session);
  }, [status, session]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCurrencyClick = (event: React.MouseEvent<HTMLElement>) => {
    setCurrencyAnchor(event.currentTarget);
  };

  const handleAccountClick = (event: React.MouseEvent<HTMLElement>) => {
    setAccountAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setCurrencyAnchor(null);
    setAccountAnchor(null);
  };

  const handleFAQClick = () => {
    const faqSection = document.getElementById('faq');
    if (faqSection) {
      faqSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSignOut = async () => {
    handleClose();
    await signOut({ redirect: false });
    router.push('/');
  };

  const handleInstallEsimClick = () => {
    const esimSection = document.getElementById('install-esim');
    if (esimSection) {
      esimSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/');
  };

  const menuItems = [
    { label: 'Quick Guide', href: '/guide' },
    { label: 'Install eSIM', onClick: handleInstallEsimClick },
    { label: 'FAQ', onClick: handleFAQClick },
    { label: 'About Globlink', href: '/about' }
  ];

  const drawer = (
    <List>
      {menuItems.map((item) => (
        <ListItem 
          component={item.href ? Link : 'div'}
          href={item.href}
          sx={{ cursor: 'pointer' }}
          key={item.label}
          onClick={(e) => {
            if (item.onClick) {
              item.onClick();
            }
            if (item.href) {
              router.push(item.href);
            }
            setMobileOpen(false); // Close drawer after navigation
          }}
        >
          <ListItemText primary={item.label} />
        </ListItem>
      ))}
    </List>
  );

  // Show loading state while session is being checked
  if (status === 'loading') {
    return (
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Loading...
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant="h6"
          component="div"
          onClick={handleHomeClick}
          sx={{ 
            flexGrow: isMobile ? 0 : 1, 
            fontWeight: 'bold',
            color: 'white',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            '&:hover': {
              color: alpha('#fff', 0.8),
            }
          }}
        >
          <HomeIcon fontSize="small" />
          Globlink
        </Typography>

        {!isMobile && (
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 2, ml: 4 }}>
            {menuItems.map((item) => (
              <Button 
                color="inherit" 
                key={item.label}
                onClick={item.onClick}
                href={item.href}
                sx={{
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.1),
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            onClick={handleCurrencyClick}
            sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: alpha('#fff', 0.1),
              }
            }}
          >
            <Language />
          </IconButton>
          <Menu
            anchorEl={currencyAnchor}
            open={Boolean(currencyAnchor)}
            onClose={handleClose}
          >
            {currencies.map((currency) => (
              <MenuItem key={currency} onClick={handleClose}>
                {currency}
              </MenuItem>
            ))}
          </Menu>

          {status === 'authenticated' && session?.user ? (
            <>
              <IconButton 
                sx={{
                  color: 'white',
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.1),
                  }
                }}
              >
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
              
              <Button
                onClick={handleAccountClick}
                sx={{
                  color: 'white',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.1),
                  }
                }}
              >
                {session.user.name || session.user.email?.split('@')[0] || 'Account'}
              </Button>
              
              <Menu
                anchorEl={accountAnchor}
                open={Boolean(accountAnchor)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => { handleClose(); router.push('/account'); }}>
                  <AccountCircle fontSize="small" sx={{ mr: 1 }} />
                  My Account
                </MenuItem>
                <MenuItem onClick={handleSignOut}>
                  <Logout fontSize="small" sx={{ mr: 1 }} />
                  Sign Out
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button 
              color="inherit" 
              component={Link} 
              href="/auth/signin"
              sx={{
                '&:hover': {
                  backgroundColor: alpha('#fff', 0.1),
                }
              }}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>

      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
} 