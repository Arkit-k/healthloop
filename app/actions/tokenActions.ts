'use server';

export async function generateTokens() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const oauthEndpoint = process.env.FHIR_OAUTH_ENDPOINT;
    const apiKey = process.env.API_KEY;
    const username = process.env.OAUTH_USERNAME;
    const password = process.env.OAUTH_PASSWORD;

    if (!baseUrl || !oauthEndpoint || !apiKey || !username || !password) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}${oauthEndpoint}`, {
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

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
  }
}