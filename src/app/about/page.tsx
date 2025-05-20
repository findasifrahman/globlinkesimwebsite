'use client';

import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  TextField, 
  Button, 
  MenuItem, 
  Grid,
  Snackbar,
  Alert,
  Divider,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HowToGetEsim from '@/components/HowToGetEsim';
import FAQ from '@/components/FAQ';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
}));

const ContactInfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  '& svg': {
    marginRight: theme.spacing(2),
    color: theme.palette.primary.main,
    fontSize: '1.5rem',
  },
}));

const subjectOptions = [
  { value: 'esim_query', label: 'Query regarding eSIM' },
  { value: 'service_complaint', label: 'Service Complaint' },
  { value: 'refund', label: 'Refund' },
];

export default function AboutPage() {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Here you would typically send the email using your backend API
      // For now, we'll simulate a successful submission
      
      // Example of how you might send the email (commented out as it requires backend setup)
      /*
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          to: 'globlinksolution@gmail.com',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      */
      
      // Simulate successful submission
      console.log('Form submitted:', formData);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Your message has been sent successfully!',
        severity: 'success',
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setSnackbar({
        open: true,
        message: 'Failed to send message. Please try again later.',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <main>
      <Navbar />
      
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            About Globlink
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Connecting the world with seamless eSIM solutions
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: '800px', mx: 'auto', opacity: 0.8 }}>
            Globlink is a leading provider of eSIM solutions, offering travelers and businesses 
            worldwide the ability to stay connected without the hassle of physical SIM cards.
          </Typography>
        </Container>
      </Box>
      
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Mission & Vision */}
        <Box sx={{ mb: 8 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6} component="div">
              <StyledPaper sx={{ height: '100%', borderTop: '4px solid #4CAF50' }}>
                <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                  Our Mission
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  To provide seamless connectivity solutions that empower people to stay connected 
                  wherever they go, eliminating the barriers of traditional SIM cards and making 
                  international travel and business communication effortless.
                </Typography>
              </StyledPaper>
            </Grid>
            <Grid item xs={12} md={6} component="div">
              <StyledPaper sx={{ height: '100%', borderTop: '4px solid #2196F3' }}>
                <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#1976D2' }}>
                  Our Vision
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  To become the global leader in eSIM technology, revolutionizing how people connect 
                  across borders and creating a world where connectivity is seamless, affordable, and 
                  accessible to everyone.
                </Typography>
              </StyledPaper>
            </Grid>
          </Grid>
        </Box>
        
        {/* Contact Form Section */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom 
            sx={{ 
              textAlign: 'center',
              fontWeight: 'bold',
              mb: 4,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Contact Us
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={5} component="div">
              <StyledPaper sx={{ height: '100%', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)' }}>
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                  Get in Touch
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.7 }}>
                  Have questions or need assistance? Our team is here to help you with any inquiries 
                  about our eSIM services, technical support, or general information.
                </Typography>
                
                <Divider sx={{ my: 3 }} />
                
                <ContactInfoItem>
                  <EmailIcon />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">globlinksolution@gmail.com</Typography>
                  </Box>
                </ContactInfoItem>
                
                <ContactInfoItem>
                  <PhoneIcon />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1">+8618989410063</Typography>
                  </Box>
                </ContactInfoItem>
                
                <ContactInfoItem>
                  <LocationOnIcon />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                    <Typography variant="body1">Room 13D, 13th Floor, Rongjian Building,No. 29, Construction Six Road, Yuexiu District, Guangzhou</Typography>
                  </Box>
                </ContactInfoItem>
              </StyledPaper>
            </Grid>
            
            <Grid item xs={12} md={12} component="div">
              <StyledPaper sx={{ p: 4, width: '100%' }}>
                <Typography variant="h5" component="h3" gutterBottom sx={{ 
                  fontWeight: 'bold', 
                  color: theme.palette.primary.main,
                  mb: 4,
                  textAlign: 'center'
                }}>
                  Send Us a Message
                </Typography>
                
                <form onSubmit={handleSubmit}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '800px', mx: 'auto' }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
                      <TextField
                        required
                        fullWidth
                        label="Your Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        required
                        fullWidth
                        label="Your Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ flex: 1 }}
                      />
                    </Box>
                    
                    <TextField
                      required
                      fullWidth
                      select
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      variant="outlined"
                    >
                      {subjectOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    
                    <TextField
                      required
                      fullWidth
                      label="Message"
                      name="message"
                      multiline
                      rows={8}
                      value={formData.message}
                      onChange={handleChange}
                      variant="outlined"
                      placeholder="Please provide details about your inquiry..."
                      sx={{ mb: 2 }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        endIcon={<SendIcon />}
                        sx={{
                          py: 1.5,
                          px: 6,
                          borderRadius: 2,
                          fontWeight: 'bold',
                          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                          boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #1976D2 30%, #1E88E5 90%)',
                          },
                        }}
                      >
                        Send Message
                      </Button>
                    </Box>
                  </Box>
                </form>
              </StyledPaper>
            </Grid>
          </Grid>
        </Box>
        
        {/* How to Get eSIM Section */}
        <HowToGetEsim />
        
        {/* FAQ Section */}
        <FAQ />
      </Container>
      
      <Footer />
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </main>
  );
} 