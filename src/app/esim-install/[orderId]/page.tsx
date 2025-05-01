'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import  Footer  from '@/components/Footer';
import  FAQ  from '@/components/FAQ';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface EsimDetails {
  orderNo: string;
  packageCode: string;
  qrCode: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export default function EsimInstallPage({ params }: { params: { orderId: string } }) {
  const router = useRouter();
  const [esimDetails, setEsimDetails] = useState<EsimDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEsimDetails = async () => {
      try {
        const response = await fetch(`/api/esim/order/${params.orderId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch eSIM details');
        }
        const data = await response.json();
        setEsimDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEsimDetails();
  }, [params.orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !esimDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error || 'Failed to load eSIM details'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your eSIM is Ready!</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Package Details</h2>
                <div className="space-y-2">
                  <p><span className="font-medium">Order Number:</span> {esimDetails.orderNo}</p>
                  <p><span className="font-medium">Package Code:</span> {esimDetails.packageCode}</p>
                  <p><span className="font-medium">Amount:</span> {esimDetails.amount} {esimDetails.currency}</p>
                  <p><span className="font-medium">Status:</span> {esimDetails.status}</p>
                  <p><span className="font-medium">Purchase Date:</span> {new Date(esimDetails.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-semibold mb-4">QR Code</h2>
                {esimDetails.qrCode ? (
                  <img 
                    src={`data:image/png;base64,${esimDetails.qrCode}`} 
                    alt="eSIM QR Code" 
                    className="w-64 h-64 object-contain"
                  />
                ) : (
                  <div className="text-gray-500">QR Code not available</div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">How to Install Your eSIM</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Open your device's camera and scan the QR code</li>
              <li>Follow the on-screen instructions to add the eSIM</li>
              <li>Once installed, go to Settings &gt; Cellular/Mobile Data to activate your eSIM</li>
              <li>Select your new eSIM as the primary line or for data</li>
            </ol>
          </div>

          <FAQ />
        </div>
      </main>
      <Footer />
    </div>
  );
} 