'use client';

import React, { useState, useEffect } from 'react';
import { Box, Paper, IconButton, useTheme } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const items = [
  {
    title: 'Global Connectivity',
    description: 'Stay connected worldwide with our eSIM packages',
    image: '/images/hero1.png',
  },
  {
    title: 'Easy Activation',
    description: 'Activate your eSIM in minutes, no physical SIM required',
    image: '/images/hero2.png',
  },
  {
    title: 'Flexible Plans',
    description: 'Choose from a variety of data plans that suit your needs',
    image: '/images/hero3.svg',
  },
];

export default function HeroCarousel() {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prevStep) => (prevStep + 1) % items.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setActiveStep((prevStep) => (prevStep + 1) % items.length);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => (prevStep - 1 + items.length) % items.length);
  };

  return (
    <Box sx={{ width: '100%', mb: 4, position: 'relative' }}>
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: `url(${items[activeStep].image})`,
          height: '400px',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.2)',
          }}
        />
      </Paper>

      {/* Navigation Buttons */}
      <IconButton
        onClick={handleBack}
        sx={{
          position: 'absolute',
          left: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          },
        }}
      >
        <ChevronLeft />
      </IconButton>
      <IconButton
        onClick={handleNext}
        sx={{
          position: 'absolute',
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          },
        }}
      >
        <ChevronRight />
      </IconButton>

      {/* Indicators */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
        }}
      >
        {items.map((_, index) => (
          <Box
            key={index}
            onClick={() => setActiveStep(index)}
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: index === activeStep ? 'white' : 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: index === activeStep ? 'white' : 'rgba(255, 255, 255, 0.8)',
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
} 