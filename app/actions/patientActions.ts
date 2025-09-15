'use server';



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
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const patientEndpoint = process.env.FHIR_PATIENT_ENDPOINT;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !patientEndpoint || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}${patientEndpoint}/${patientId}`, {
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

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch patient' };
  }
}

export async function fetchPatients(accessToken: string, customCredentials?: { baseUrl?: string; apiKey?: string }) {
  try {
    const baseUrl = customCredentials?.baseUrl || process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const patientEndpoint = process.env.FHIR_PATIENT_ENDPOINT;
    const apiKey = customCredentials?.apiKey || process.env.API_KEY;

    if (!baseUrl || !patientEndpoint || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}${patientEndpoint}`, {
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

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch patients' };
  }
}


export async function updatePatient(patientId: string, patientData: Record<string, unknown>, accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const patientEndpoint = process.env.FHIR_PATIENT_ENDPOINT;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !patientEndpoint || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}${patientEndpoint}/${patientId}`, {
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

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update patient' };
  }
}

export async function searchPatients(searchParams: PatientSearchParams, accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const patientEndpoint = process.env.FHIR_PATIENT_ENDPOINT;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !patientEndpoint || !apiKey) {
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
      ? `${baseUrl}${patientEndpoint}?${queryString}`
      : `${baseUrl}${patientEndpoint}`;

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

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to search patients' };
  }
}
