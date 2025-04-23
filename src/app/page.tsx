'use client';

import React from 'react';
import { Container } from '@mui/material';
import Navbar from '@/components/Navbar';
import HeroCarousel from '@/components/HeroCarousel';
import PackageList from '@/components/PackageList';
import HowToGetEsim from '@/components/HowToGetEsim';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroCarousel />
      <Container maxWidth="xl">
        <PackageList />
        <HowToGetEsim />
      </Container>
      <FAQ />
      <Footer />
    </>
  );
} 