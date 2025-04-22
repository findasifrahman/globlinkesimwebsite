import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

interface EsimProfileProps {
  orderNo: string;
}

export function EsimProfile({ orderNo }: EsimProfileProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, [orderNo]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/esim/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNo }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch eSIM profile');
      }

      if (data.data?.profiles?.[0]) {
        setProfile(data.data.profiles[0]);
      } else {
        setError('No eSIM profile found');
      }
    } catch (err) {
      console.error('Error fetching eSIM profile:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Error</h3>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
          <Button 
            onClick={fetchProfile} 
            className="mt-4"
            variant="outline"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">No Profile Found</h3>
        </CardHeader>
        <CardContent>
          <p>The eSIM profile is not yet available. Please check back later.</p>
          <Button 
            onClick={fetchProfile} 
            className="mt-4"
            variant="outline"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <h3 className="text-lg font-semibold">eSIM Profile</h3>
        <Button 
          onClick={fetchProfile} 
          size="sm"
          variant="outline"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {profile.qrCode ? (
            <div className="flex flex-col items-center">
              <img 
                src={profile.qrCode} 
                alt="eSIM QR Code" 
                className="max-w-full h-auto mb-4"
              />
              <p className="text-sm text-muted-foreground">
                Scan this QR code with your device to install the eSIM
              </p>
            </div>
          ) : (
            <div className="text-center p-4 bg-muted rounded-md">
              <p className="text-muted-foreground">
                QR code is not yet available. Please check back later.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">ICCID</p>
              <p className="font-medium">{profile.iccid || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">EID</p>
              <p className="font-medium">{profile.eid || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">SM-DP+ Status</p>
              <p className="font-medium">{profile.smdpStatus || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">eSIM Status</p>
              <p className="font-medium">{profile.esimStatus || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data Used</p>
              <p className="font-medium">
                {profile.dataUsed ? `${Math.round(profile.dataUsed / 1024 / 1024)} MB` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data Remaining</p>
              <p className="font-medium">
                {profile.dataRemaining ? `${Math.round(profile.dataRemaining / 1024 / 1024)} MB` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Expiry Date</p>
              <p className="font-medium">
                {profile.expiryDate ? new Date(profile.expiryDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Days Remaining</p>
              <p className="font-medium">{profile.daysRemaining || 'N/A'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 