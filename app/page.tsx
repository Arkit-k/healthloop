'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateTokens } from './actions/tokenActions';
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
  const router = useRouter();
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
        // Automatically redirect to patient dashboard after successful token generation
        setTimeout(() => {
          router.push('/dashboard/patient');
        }, 1000); // Small delay to show success state
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
          <div className="space-y-6">
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

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => router.push('/dashboard/patient')}
                size="lg"
                className="flex-1"
              >
                Patient Dashboard
              </Button>
              <Button
                onClick={() => router.push('/dashboard/appointments')}
                size="lg"
                variant="outline"
                className="flex-1"
              >
                Appointments Dashboard
              </Button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

