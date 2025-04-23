'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { EsimModal } from '@/components/EsimModal';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNo = searchParams.get('orderNo');
  const [showEsimModal, setShowEsimModal] = useState(false);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderNo) {
      checkOrderStatus();
    }
  }, [orderNo]);

  const checkOrderStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/esim/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNo })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to check order status');
      }

      if (data.data?.profiles?.[0]) {
        setOrderStatus(data.data.profiles[0].esimStatus);
        if (data.data.profiles[0].esimStatus === 'IN_USE') {
          setShowEsimModal(true);
        }
      } else {
        // If no profile is found, check the order status in our database
        const orderResponse = await fetch(`/api/orders/${orderNo}`);
        const orderData = await orderResponse.json();
        
        if (orderData.success && orderData.order) {
          setOrderStatus(orderData.order.status);
        } else {
          setError('Order not found');
        }
      }
    } catch (error) {
      console.error('Error checking order status:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Error</h1>
          </CardHeader>
          <CardContent>
            <div className="text-center text-red-500 mb-4">{error}</div>
            <div className="text-center">
              <Button onClick={checkOrderStatus} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">Order Confirmation</h1>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-lg">Order Number: {orderNo}</p>
              <p className="text-lg">Status: {orderStatus}</p>
            </div>

            {orderStatus === 'IN_USE' && (
              <div className="text-center">
                <Button
                  onClick={() => setShowEsimModal(true)}
                  className="mt-4"
                >
                  View eSIM Details
                </Button>
              </div>
            )}

            {orderStatus === 'PENDING' && (
              <div className="text-center p-4 bg-muted rounded-md">
                <p className="text-muted-foreground">
                  Your eSIM is being processed. This may take a few minutes.
                </p>
                <Button
                  onClick={checkOrderStatus}
                  className="mt-4"
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Check Status
                </Button>
              </div>
            )}

            {orderStatus === 'FAILED' && (
              <div className="text-center p-4 bg-red-50 rounded-md">
                <p className="text-red-500">
                  There was an issue with your order. Please contact support.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {orderNo && (
        <EsimModal
          isOpen={showEsimModal}
          onClose={() => setShowEsimModal(false)}
          orderNo={orderNo}
        />
      )}
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
} 