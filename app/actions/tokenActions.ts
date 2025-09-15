'use server';

export async function generateTokens() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const firmPrefix = process.env.FIRM_URL_PREFIX;
    const oauthEndpoint = process.env.FHIR_OAUTH_ENDPOINT;
    const apiKey = process.env.API_KEY;
    const username = process.env.OAUTH_USERNAME;
    const password = process.env.OAUTH_PASSWORD;

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
        grant_type: 'client_credentials',
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