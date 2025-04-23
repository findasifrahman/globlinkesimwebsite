'use client';

import React, { useState } from 'react';
import { Container, Typography, Box, Grid, Paper, Button, Modal, List, ListItem, ListItemText, Divider, Tabs, Tab } from '@mui/material';
import Image from 'next/image';
import HowToGetEsim from '@/components/HowToGetEsim';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import AndroidIcon from '@mui/icons-material/Android';
import DevicesIcon from '@mui/icons-material/Devices';
import LaptopIcon from '@mui/icons-material/Laptop';

// Modal style
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: '800px',
  maxHeight: '80vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  overflow: 'auto',
};

// Phone models data
const phoneModels = {
  apple: [
    "iPhone XR", "iPhone XS", "iPhone XS Max", "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max",
    "iPhone SE 2 (2020)", "iPhone 12", "iPhone 12 Mini", "iPhone 12 Pro", "iPhone 12 Pro Max",
    "iPhone 13", "iPhone 13 Mini", "iPhone 13 Pro", "iPhone 13 Pro Max", "iPhone SE 3 (2022)",
    "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max", "iPhone 15", "iPhone 15 Plus",
    "iPhone 15 Pro", "iPhone 15 Pro Max", "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max"
  ],
  samsung: [
    "Galaxy S20", "Galaxy S20+", "Galaxy S20+ 5g", "Galaxy S20 Ultra", "Galaxy S20 Ultra 5G",
    "Galaxy S21", "Galaxy S21+ 5G", "Galaxy S21+ Ultra 5G", "Galaxy S22", "Galaxy S22+",
    "Galaxy S22 Ultra", "Galaxy S23", "Galaxy S23+", "Galaxy S23 Ultra", "Galaxy S23 FE*",
    "Galaxy S24", "Galaxy S24+", "Galaxy S24 Ultra", "Galaxy Note 20", "Galaxy Note 20 Ultra 5G",
    "Galaxy Fold", "Galaxy Z Fold2 5G", "Galaxy Z Fold3 5G", "Galaxy Z Fold4", "Galaxy Z Fold5 5G",
    "Galaxy Z Flip", "Galaxy Z Flip3 5G", "Galaxy Z Flip4", "Galaxy Z Flip5 5G", "Galaxy A54", "Galaxy A55 5G"
  ],
  oppo: [
    "Oppo Find X3", "Oppo Find X3 Pro", "Find N2 Flip", "Oppo Reno 5A", "Oppo Reno 6 Pro 5G",
    "Oppo Reno 9A", "Oppo Find X5", "Oppo Find X5 Pro", "Oppo A55s 5G"
  ],
  google: [
    "Google Pixel 2", "Google Pixel 2 XL", "Google Pixel 3", "Google Pixel 3 XL", "Google Pixel 3a",
    "Google Pixel 3a XL", "Google Pixel 4", "Google Pixel 4a", "Google Pixel 4 XL", "Google Pixel 5",
    "Google Pixel 5a", "Google Pixel 6", "Google pixel 6a", "Google Pixel 6 Pro", "Google Pixel 7a",
    "Google Pixel 7", "Google Pixel 7 Pro", "Google Pixel 8", "Google Pixel 8 Pro", "Google Pixel Fold",
    "Google Pixel 9", "Google Pixel 9 Pro", "Google Pixel 9 Pro XL", "Pixel 9 Pro Fold"
  ],
  huawei: [
    "Huawei P40", "Huawei P40 Pro", "Huawei Mate 40 Pro", "Huawei Pura 70 Pro"
  ],
  motorola: [
    "Motorola Razr 2019", "Motorola Razr 2022", "Motorola Razr 5G", "Motorola Razr 40", "Motorola Razr 40 Ultra",
    "Motorola Razr+", "Motorola Edge 2022", "Motorola Edge 2023", "Motorola Edge+ (2023)", "Motorola Edge 40",
    "Motorola Edge 40 Pro", "Motorola Edge 40 Neo", "Motorola Edge 50 Pro", "Motorola Edge 50 Ultra",
    "Motorola Edge 50 Fusion", "Motorola Moto G Power 5G (2024)", "Motorola G52J 5G", "Motorola G52J 5G Ⅱ",
    "Motorola G53J 5G", "Moto G54 5G", "Motorola G84", "Motorola G34", "Motorola Moto G53", "Motorola Moto G54",
    "Motorola Razr+ 2024", "Motorola Razr 2024", "Motorola Moto G Stylus 5G 2024"
  ]
};

export default function GuidePage() {
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const brands = [
    { name: 'Apple', icon: <PhoneIphoneIcon />, models: phoneModels.apple },
    { name: 'Samsung', icon: <AndroidIcon />, models: phoneModels.samsung },
    { name: 'OPPO', icon: <DevicesIcon />, models: phoneModels.oppo },
    { name: 'Google', icon: <DevicesIcon />, models: phoneModels.google },
    { name: 'Huawei', icon: <DevicesIcon />, models: phoneModels.huawei },
    { name: 'Motorola', icon: <DevicesIcon />, models: phoneModels.motorola }
  ];

  return (
    <main>
      <Navbar />
      {/* Hero Image */}
      <Box sx={{ position: 'relative', width: '100%', height: '400px' }}>
        <Image
          src="/images/hero1.png"
          alt="eSIM Guide Hero"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* What is an eSIM Section */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center',
              mb: 4,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              letterSpacing: '0.5px',
            }}
          >
            What is an eSIM?
          </Typography>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
              border: '1px solid rgba(33, 150, 243, 0.2)',
            }}
          >
            <List>
              <ListItem sx={{ display: 'block', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <CheckCircleIcon sx={{ color: '#2196F3', mr: 2, mt: 0.5 }} />
                  <ListItemText 
                    primary={
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1976D2' }}>
                        Digital SIM Card
                      </Typography>
                    }
                    secondary="An eSIM (embedded SIM) is a digital SIM card that allows you to activate a cellular plan from your carrier without having to use a physical SIM card."
                    sx={{ textAlign: 'justify' }}
                  />
                </Box>
              </ListItem>
              <ListItem sx={{ display: 'block', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <CheckCircleIcon sx={{ color: '#2196F3', mr: 2, mt: 0.5 }} />
                  <ListItemText 
                    primary={
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1976D2' }}>
                        Built into Your Device
                      </Typography>
                    }
                    secondary="It's built into your device and can be reprogrammed with new carrier information, eliminating the need to swap physical SIM cards."
                    sx={{ textAlign: 'justify' }}
                  />
                </Box>
              </ListItem>
              <ListItem sx={{ display: 'block' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <CheckCircleIcon sx={{ color: '#2196F3', mr: 2, mt: 0.5 }} />
                  <ListItemText 
                    primary={
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1976D2' }}>
                        Perfect for Travelers
                      </Typography>
                    }
                    secondary="This technology is ideal for international travelers who need to switch carriers or plans without the hassle of physical SIM cards."
                    sx={{ textAlign: 'justify' }}
                  />
                </Box>
              </ListItem>
            </List>
          </Paper>
        </Box>

        {/* Uses of eSIM Section */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center',
              mb: 4,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              letterSpacing: '0.5px',
            }}
          >
            Uses of eSIM
          </Typography>
          <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
            <Box sx={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.333% - 16px)' }, minWidth: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.333% - 16px)' } }}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 4, 
                    width: '100%',
                    height: '100%',
                    borderRadius: 2,
                    borderTop: '4px solid #4CAF50',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
                    },
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography 
                    variant="h5" 
                    component="h3" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 'bold',
                      color: '#2E7D32'
                    }}
                  >
                    International Travel
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7, flexGrow: 1 }}>
                    Users can use eSIM when traveling abroad to avoid expensive roaming charges or the hassle of purchasing local SIM cards.
                  </Typography>
                </Paper>
              </Box>
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.333% - 16px)' }, minWidth: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.333% - 16px)' } }}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 4, 
                    width: '100%',
                    height: '100%',
                    borderRadius: 2,
                    borderTop: '4px solid #FF9800',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
                    },
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography 
                    variant="h5" 
                    component="h3" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 'bold',
                      color: '#F57C00'
                    }}
                  >
                    Business Trips
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7, flexGrow: 1 }}>
                    Professionals on business trips can stay connected with their colleagues, clients, and emails without relying on insecure public Wi-Fi networks.
                  </Typography>
                </Paper>
              </Box>
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.333% - 16px)' }, minWidth: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.333% - 16px)' } }}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 4, 
                    width: '100%',
                    height: '100%',
                    borderRadius: 2,
                    borderTop: '4px solid #9C27B0',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
                    },
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography 
                    variant="h5" 
                    component="h3" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 'bold',
                      color: '#7B1FA2'
                    }}
                  >
                    Call & Text Service
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7, flexGrow: 1 }}>
                    Globlink eSIM also supports call and text services, providing users with a complete communication solution that includes phone numbers. Get it now!
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </Grid>
          
          {/* Compatible Phones Button */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: 6,
            mb: 2
          }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={handleOpen}
              startIcon={<LaptopIcon sx={{ fontSize: '2rem' }} />}
              sx={{ 
                borderRadius: 3,
                py: 2,
                px: 5,
                fontSize: '1.2rem',
                fontWeight: 'bold',
                boxShadow: '0 6px 20px rgba(33, 150, 243, 0.5)',
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #1E88E5 90%)',
                  boxShadow: '0 8px 25px rgba(33, 150, 243, 0.7)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease-in-out',
                maxWidth: { xs: '90%', sm: '80%', md: '60%' },
                width: '100%',
              }}
            >
              Check Compatible Phone Models for eSIM
            </Button>
          </Box>
        </Box>

        {/* How to Get eSIM Section */}
        <HowToGetEsim />

        {/* FAQ Section */}
        <FAQ />
      </Container>

      {/* Compatible Phones Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="compatible-phones-modal"
        aria-describedby="compatible-phones-list"
      >
        <Box sx={modalStyle}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              color: 'primary.main',
              textAlign: 'center',
              mb: 3
            }}
          >
            Compatible Phone Models for eSIM
          </Typography>
          
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            {brands.map((brand, index) => (
              <Tab 
                key={index} 
                label={brand.name} 
                icon={brand.icon} 
                iconPosition="start"
                sx={{ 
                  fontWeight: 'bold',
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    color: 'primary.main',
                  }
                }}
              />
            ))}
          </Tabs>
          
          <Box sx={{ maxHeight: '50vh', overflow: 'auto' }}>
            {brands.map((brand, index) => (
              <div
                key={index}
                role="tabpanel"
                hidden={tabValue !== index}
                id={`phone-tabpanel-${index}`}
                aria-labelledby={`phone-tab-${index}`}
              >
                {tabValue === index && (
                  <List>
                    {brand.models.map((model, modelIndex) => (
                      <React.Fragment key={modelIndex}>
                        <ListItem>
                          <ListItemText 
                            primary={model} 
                            sx={{ 
                              '& .MuiListItemText-primary': {
                                fontWeight: 'medium',
                              }
                            }}
                          />
                        </ListItem>
                        {modelIndex < brand.models.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </div>
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button 
              variant="contained" 
              onClick={handleClose}
              sx={{ 
                borderRadius: 2,
                px: 4,
                fontWeight: 'bold',
              }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      <Footer />
    </main>
  );
} 