'use client';

import { useState } from 'react';

export default function FetchPackagesPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/fetch-packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);

      if (!data.success) {
        setError(data.message || 'Failed to fetch packages');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Fetch Packages from API</h1>
        <p className="text-gray-600 mb-4">
          This will fetch all available packages from the eSIM API and save them to the database.
        </p>
        
        <button 
          onClick={fetchPackages} 
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded disabled:opacity-50 mb-4"
        >
          {loading ? 'Fetching...' : 'Fetch Packages'}
        </button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className={`${result.success ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'} border px-4 py-3 rounded mb-4`}>
            <p>{result.message}</p>
            {result.count !== undefined && (
              <div className="mt-2">
                <strong>Packages fetched:</strong> {result.count}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 