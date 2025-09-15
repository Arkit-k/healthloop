'use server';

export async function generateTokens() {
  try {
    // Check for user-configured credentials first, fallback to .env
    const savedCredentials = typeof window !== 'undefined' ? localStorage.getItem('api_credentials') : null;
    let credentials;

    if (savedCredentials) {
      credentials = JSON.parse(savedCredentials);
    } else {
      credentials = {
        baseUrl: process.env.NEXT_PUBLIC_FHIR_BASE_URL,
        firmPrefix: process.env.FIRM_URL_PREFIX,
        apiKey: process.env.API_KEY,
        username: process.env.OAUTH_USERNAME,
        password: process.env.OAUTH_PASSWORD
      };
    }

    const { baseUrl, firmPrefix, apiKey, username, password } = credentials;
    const oauthEndpoint = process.env.FHIR_OAUTH_ENDPOINT;

    if (!baseUrl || !firmPrefix || !oauthEndpoint || !apiKey || !username || !password) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}${firmPrefix}${oauthEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-api-key': apiKey
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username: username,
        password: password
      })
    });

    if (!response.ok) {
      throw new Error(`OAuth request failed: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    if (!text.trim()) {
      throw new Error('Empty response from OAuth endpoint');
    }

    try {
      const data = JSON.parse(text);
      return { success: true, data };
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
  }
}

export async function refreshAccessToken(refreshToken: string) {
  try {
    // Check for user-configured credentials first, fallback to .env
    const savedCredentials = typeof window !== 'undefined' ? localStorage.getItem('api_credentials') : null;
    let credentials;

    if (savedCredentials) {
      credentials = JSON.parse(savedCredentials);
    } else {
      credentials = {
        baseUrl: process.env.NEXT_PUBLIC_FHIR_BASE_URL,
        firmPrefix: process.env.FIRM_URL_PREFIX,
        apiKey: process.env.API_KEY
      };
    }

    const { baseUrl, firmPrefix, apiKey } = credentials;
    const oauthEndpoint = process.env.FHIR_OAUTH_ENDPOINT;

   if (!baseUrl || !firmPrefix || !oauthEndpoint || !apiKey || !refreshToken) {
     throw new Error('Missing required environment variables or refresh token');
   }

   const response = await fetch(`${baseUrl}${firmPrefix}${oauthEndpoint}`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/x-www-form-urlencoded',
       'x-api-key': apiKey
     },
     body: new URLSearchParams({
       grant_type: 'refresh_token',
       refresh_token: refreshToken
     })
   });

   if (!response.ok) {
     throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
   }

   const text = await response.text();
   if (!text.trim()) {
     throw new Error('Empty response from OAuth endpoint');
   }

   try {
     const data = JSON.parse(text);
     return { success: true, data };
   } catch (parseError) {
     throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
   }
 } catch (err) {
   return { success: false, error: err instanceof Error ? err.message : 'Failed to refresh access token' };
 }
}