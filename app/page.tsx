'use client';

import { useState } from 'react';
import { generateTokens } from './actions';

interface TokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

export default function Home() {
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
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">OAuth2 Tokens</h1>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Generating...' : 'Generate Tokens'}
        </button>

        {error && <p className="text-red-500">Error: {error}</p>}

        {tokens && (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Token Details</h2>
            <div className="space-y-2">
              <div>
                <strong>Access Token:</strong>
                <p className="break-all text-sm">{tokens.access_token}</p>
              </div>
              <div>
                <strong>Token Type:</strong> {tokens.token_type}
              </div>
              <div>
                <strong>Expires In:</strong> {tokens.expires_in} seconds
              </div>
              <div>
                <strong>Refresh Token:</strong>
                <p className="break-all text-sm">{tokens.refresh_token}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

