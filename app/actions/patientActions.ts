'use server';

// Helper function to get API credentials
function getApiCredentials() {
  // Check for user-configured credentials first, fallback to .env
  const savedCredentials = typeof window !== 'undefined' ? localStorage.getItem('api_credentials') : null;

  if (savedCredentials) {
    return JSON.parse(savedCredentials);
  } else {
    return {
      baseUrl: process.env.NEXT_PUBLIC_FHIR_BASE_URL,
      firmPrefix: process.env.FIRM_URL_PREFIX,
      apiKey: process.env.API_KEY
    };
  }
}

interface PatientSearchParams {
  count?: string; 
  _lastUpdated?: string; 
  'address-postalcode'?: string; 
  active?: string;
  birthdate?: string; 
  email?: string; 
  family?: string; 
  gender?: string; 
  'general-practitioner'?: string; 
  given?: string;
  identifier?: string; 
  language?: string; 
  page?: string; 
  phone?: string; 
  'us-core-ethnicity'?: string; 
  'us-core-race'?: string; 
  'referral-source'?: string;
}

export async function fetchPatientById(patientId: string, accessToken: string) {
  try {
    const { baseUrl, firmPrefix, apiKey } = getApiCredentials();

    if (!baseUrl || !firmPrefix || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}${firmPrefix}/ema/fhir/v2/Patient/${patientId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Patient fetch failed: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    if (!text.trim()) {
      throw new Error('Empty response from patient endpoint');
    }

    try {
      const data = JSON.parse(text);
      return { success: true, data };
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch patient' };
  }
}

export async function fetchPatients(accessToken: string, customCredentials?: { baseUrl?: string; apiKey?: string }) {
  try {
    const { baseUrl: defaultBaseUrl, firmPrefix, apiKey: defaultApiKey } = getApiCredentials();
    const baseUrl = customCredentials?.baseUrl || defaultBaseUrl;
    const apiKey = customCredentials?.apiKey || defaultApiKey;

    if (!baseUrl || !firmPrefix || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}${firmPrefix}/ema/fhir/v2/Patient`, {
      method: 'GET',
      headers: {
        'accept': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Patient fetch failed: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    if (!text.trim()) {
      throw new Error('Empty response from patient endpoint');
    }

    try {
      const data = JSON.parse(text);
      return { success: true, data };
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch patients' };
  }
}


export async function updatePatient(patientId: string, patientData: Record<string, unknown>, accessToken: string) {
  try {
    const { baseUrl, firmPrefix, apiKey } = getApiCredentials();

    if (!baseUrl || !firmPrefix || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}${firmPrefix}/ema/fhir/v2/Patient/${patientId}`, {
      method: 'PUT',
      headers: {
        'accept': 'application/fhir+json',
        'content-type': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      },
      body: JSON.stringify(patientData)
    });

    if (!response.ok) {
      throw new Error(`Patient update failed: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    if (!text.trim()) {
      throw new Error('Empty response from patient endpoint');
    }

    try {
      const data = JSON.parse(text);
      return { success: true, data };
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update patient' };
  }
}

export async function searchPatients(searchParams: PatientSearchParams, accessToken: string) {
  try {
    const { baseUrl, firmPrefix, apiKey } = getApiCredentials();

    if (!baseUrl || !firmPrefix || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    // Construct query string from search parameters
    const queryParams = new URLSearchParams();

    // Add search parameters to query string
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString
      ? `${baseUrl}${firmPrefix}/ema/fhir/v2/Patient?${queryString}`
      : `${baseUrl}${firmPrefix}/ema/fhir/v2/Patient`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Patient search failed: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    if (!text.trim()) {
      throw new Error('Empty response from patient endpoint');
    }

    try {
      const data = JSON.parse(text);
      return { success: true, data };
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to search patients' };
  }
}
