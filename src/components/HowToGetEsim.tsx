'use client';

import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EmailIcon from '@mui/icons-material/Email';
import QrCodeIcon from '@mui/icons-material/QrCode';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import AndroidIcon from '@mui/icons-material/Android';
import DevicesIcon from '@mui/icons-material/Devices';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
  },
}));

const StepNumber = styled(Box)(({ theme }) => ({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  fontWeight: 'bold',
  fontSize: '1.2rem',
  color: 'white',
}));

const HowToGetEsim = () => {
  return (
    <Box id="install-esim" sx={{ py: 6, px: { xs: 2, md: 6 } }}>
      <Typography 
        variant="h3" 
        component="h2" 
        align="center" 
        gutterBottom
        sx={{ 
          fontWeight: 'bold',
          mb: 4,
          color: '#2196F3',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          letterSpacing: '0.5px',
        }}
      >
        How to Get a Globlink eSIM?
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: 4,
        justifyContent: 'space-between'
      }}>
        {/* Step 1 */}
        <Box sx={{ flex: 1 }}>
          <StyledPaper 
            sx={{ 
              background: 'white',
              color: '#2E7D32',
              borderTop: '4px solid #4CAF50',
            }}
          >
            <StepNumber sx={{ backgroundColor: '#4CAF50' }}>1</StepNumber>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircleOutlineIcon sx={{ mr: 1, fontSize: '2rem', color: '#4CAF50' }} />
              <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                Choose Your Plan
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: 'text.primary' }}>
              Browse our selection of eSIM plans and choose the one that best fits your travel needs. 
              We offer both single-region and multi-region options with various data amounts and validity periods.
            </Typography>
          </StyledPaper>
        </Box>

        {/* Step 2 */}
        <Box sx={{ flex: 1 }}>
          <StyledPaper 
            sx={{ 
              background: 'white',
              color: '#F57C00',
              borderTop: '4px solid #FF9800',
            }}
          >
            <StepNumber sx={{ backgroundColor: '#FF9800' }}>2</StepNumber>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EmailIcon sx={{ mr: 1, fontSize: '2rem', color: '#FF9800' }} />
              <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', color: '#F57C00' }}>
                Receive Activation Details
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: 'text.primary' }}>
              After your purchase, you'll receive an email with your eSIM activation details, including:
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.primary' }}>
                • QR Code for easy installation
              </Typography>
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.primary' }}>
                • SM-DP+ Address
              </Typography>
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', color: 'text.primary' }}>
                • Activation Code
              </Typography>
            </Box>
          </StyledPaper>
        </Box>

        {/* Step 3 */}
        <Box sx={{ flex: 1 }}>
          <StyledPaper 
            sx={{ 
              background: 'white',
              color: '#7B1FA2',
              borderTop: '4px solid #9C27B0',
            }}
          >
            <StepNumber sx={{ backgroundColor: '#9C27B0' }}>3</StepNumber>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <QrCodeIcon sx={{ mr: 1, fontSize: '2rem', color: '#9C27B0' }} />
              <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', color: '#7B1FA2' }}>
                Activate Your eSIM
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 2, color: 'text.primary' }}>
              You can activate your eSIM in two ways:
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#7B1FA2' }}>
                Method 1: Scan QR Code
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.primary' }}>
                Simply scan the QR code with your device's camera to install the eSIM automatically.
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#7B1FA2' }}>
                Method 2: Manual Entry
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.primary' }}>
                If scanning doesn't work, you can manually enter the activation details following these steps:
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.primary' }}>
                  <PhoneIphoneIcon sx={{ mr: 1, fontSize: '1.2rem', color: '#9C27B0' }} />
                  <strong>iPhone:</strong>
                </Typography>
                <Typography variant="body2" sx={{ pl: 3, mb: 2, color: 'text.primary' }}>
                  • Go to Settings {'>'} Cellular {'>'} Add eSIM {'>'} Enter Details Manually
                  <br />
                  • Enter the "SM-DP+ Address" and "Activation Code", then tap "Next"
                </Typography>
                
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.primary' }}>
                  <AndroidIcon sx={{ mr: 1, fontSize: '1.2rem', color: '#9C27B0' }} />
                  <strong>Samsung:</strong>
                </Typography>
                <Typography variant="body2" sx={{ pl: 3, mb: 2, color: 'text.primary' }}>
                  • Go to Settings {'>'} Network & Internet {'>'} SIM card manager {'>'} Add mobile plan {'>'} Scan carrier QR code or Enter activation code
                  <br />
                  • Enter the long "Activation Code"
                </Typography>
                
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.primary' }}>
                  <DevicesIcon sx={{ mr: 1, fontSize: '1.2rem', color: '#9C27B0' }} />
                  <strong>Pixel:</strong>
                </Typography>
                <Typography variant="body2" sx={{ pl: 3, color: 'text.primary' }}>
                  • Go to Settings {'>'} Network & Internet {'>'} Mobile Network or "+" {'>'} Add more {'>'} Download a SIM instead? {'>'} Need help {'>'} Enter it manually
                  <br />
                  • Enter the long "Activation Code"
                </Typography>
              </Box>
            </Box>
          </StyledPaper>
        </Box>
      </Box>
    </Box>
  );
};

export default HowToGetEsim; 