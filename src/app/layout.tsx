import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import { NotificationProvider } from '@/contexts/NotificationContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.globlinksolution.com'),
  title: {
    default: 'Globlink - Global eSIM Solutions for Business Travelers',
    template: '%s | Globlink eSIM'
  },
  description: 'Stay connected worldwide with Globlink eSIM. Instant activation, no physical SIM needed. Perfect for business travelers, digital nomads, and international professionals. Get data plans for 200+ countries.',
  keywords: [
    'eSIM',
    'business travel',
    'international data',
    'global connectivity',
    'digital nomad',
    'travel SIM',
    'roaming free',
    'business data plans',
    'international business',
    'travel technology',
    'eSIM for business',
    'eSIM for travel',
    'eSIM for digital nomads',
    'eSIM for international professionals',
    'eSIM for business travelers',
    'eSIM for global travelers',
    'eSIM for global travelers',
    'eSIM for business travelers',
    'eSIM for global travelers',
    'IOT eSIM',
    'IOT eSIM for business',
    'IOT eSIM for travel',
    'IOT eSIM for digital nomads',
    'IOT eSIM for international professionals',
    'IOT eSIM for business travelers',
    'IOT eSIM for global travelers',
    'SIM for business',
    'SIM for travel',
    'SIM for digital nomads',
    'SIM for international professionals',
    'SIM for business travelers',
    'SIM for global travelers',
    'seamless travel',
    'travel SIM',
    'travel SIM for business',
    'travel SIM for travel',
    'travel SIM for digital nomads',
    'travel SIM for international professionals',
    'travel SIM for business travelers',
    'travel SIM for global travelers',
  ],
  authors: [{ name: 'Globlink Solutions' }],
  creator: 'Globlink Solutions',
  publisher: 'Globlink Solutions',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.globlinksolution.com',
    siteName: 'Globlink',
    title: 'Globlink - Global eSIM Solutions for Business Travelers',
    description: 'Stay connected worldwide with Globlink eSIM. Instant activation, no physical SIM needed. Perfect for business travelers, digital nomads, and international professionals.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Globlink eSIM - Global Connectivity Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Globlink - Global eSIM Solutions for Business Travelers',
    description: 'Stay connected worldwide with Globlink eSIM. Instant activation, no physical SIM needed.',
    images: ['/twitter-image.jpg'],
    creator: '@globlink',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification',
    yandex: 'your-yandex-verification',
    yahoo: 'your-yahoo-verification',
  },
  alternates: {
    canonical: 'https://www.globlinksolution.com',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/apple-touch-icon-precomposed.png',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={inter.className}>
        <NotificationProvider>
          <Providers>{children}</Providers>
        </NotificationProvider>
      </body>
    </html>
  )
} 