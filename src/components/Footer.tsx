import React from 'react';
import {
  Box,
  Container,
  Typography,
  useTheme,
  alpha,
  Link,
} from '@mui/material';
import { 
  Language,
  Email,
  Phone,
  LocationOn,
  LinkedIn,
} from '@mui/icons-material';

export default function Footer() {
  const theme = useTheme();

  return (
    <Box 
      sx={{ 
        bgcolor: theme.palette.primary.main, 
        color: 'white',
        py: 4,
        mt: 8
      }}
    >
      <Container maxWidth="lg">
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(3, 1fr)'
            },
            gap: 4
          }}
        >
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Globlink
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
               Trusted provider of global eSIM solutions.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone fontSize="small" />
              <Typography variant="body2">
                +88017130494275, +8801719086713
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn fontSize="small" />
              <Typography variant="body2">
                Plot-1, Road-6, Block-A, Section-10
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn fontSize="small" />
              <Typography variant="body2">
                Mirpur, Dhaka-1216, Bangladesh
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Language fontSize="small" />
              <Typography variant="body2">
                A concern of Intricate Lab
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Language fontSize="small" />
              <Typography variant="body2">
                (www.intricatlab.com)
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="inherit" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Home
              </Link>
              <Link href="/about" color="inherit" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                About Us
              </Link>
              <Link href="/agreement" color="inherit" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Terms of Service
              </Link>
              <Link href="/privacy-policy" color="inherit" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Privacy Policy
              </Link>
            </Box>
          </Box>
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Social
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" />
                <Link 
                  href="mailto:info.globlink.online" 
                  color="inherit" 
                  sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  globlinksolution@gmail.com
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" />
                <Link 
                  href="mailto:info.globlink.online" 
                  color="inherit" 
                  sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  asifrahman@intricatlab.com
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinkedIn fontSize="small" />
                <Link 
                  href="https://www.linkedin.com/company/intricatelab/" 
                  color="inherit" 
                  sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  https://www.linkedin.com/company/intricatelab/
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Language fontSize="small" />
                <Typography variant="body2">
                  English
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box 
          sx={{ 
            mt: 4, 
            pt: 2, 
            borderTop: `1px solid ${alpha('#FFFFFF', 0.1)}`, 
            textAlign: 'center' 
          }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} Globlink. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
} 