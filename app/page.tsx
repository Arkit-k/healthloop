'use client';

import { useState } from 'react';
import { generateTokens } from './actions/tokenActions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { useToast, errorToast } from '@/components/toast';

interface TokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

export default function Home() {
  const { addToast } = useToast();
  const [tokens, setTokens] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateTokens();
      if (result.success && result.data) {
        setTokens(result.data as TokenData);
      } else if (!result.success && result.error) {
        setError(result.error);
        addToast(errorToast('Error', result.error));
      }
    } catch (err) {
      const errorMessage = 'An error occurred';
      setError(errorMessage);
      addToast(errorToast('Error', errorMessage));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <header className="row-start-1 flex justify-end w-full max-w-4xl">
        <ThemeToggle />
      </header>
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">OAuth2 Tokens</h1>

        <Button
          onClick={handleGenerate}
          disabled={loading}
          size="lg"
        >
          {loading ? 'Generating...' : 'Generate Tokens'}
        </Button>

        {error && <p className="text-red-500">Error: {error}</p>}

        {tokens && (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Token Details</CardTitle>
              <CardDescription>
                OAuth 2.0 access token for FHIR API authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Access Token:</label>
                  <p className="break-all text-sm mt-1 font-mono bg-muted p-2 rounded">{tokens.access_token}</p>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Token Type:</span>
                  <span className="text-sm text-muted-foreground">{tokens.token_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Expires In:</span>
                  <span className="text-sm text-muted-foreground">{tokens.expires_in} seconds</span>
                </div>
                <div>
                  <label className="text-sm font-medium">Refresh Token:</label>
                  <p className="break-all text-sm mt-1 font-mono bg-muted p-2 rounded">{tokens.refresh_token}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {tokens && (
          <div className="mt-8">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link href="/dashboard/patient">
                View Patient Dashboard →
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

