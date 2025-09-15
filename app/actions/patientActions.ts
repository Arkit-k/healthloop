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

export async function fetchPatients(accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const patientEndpoint = process.env.FHIR_PATIENT_ENDPOINT;
    const apiKey = process.env.API_KEY;

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

export async function createPatient(patientData: Record<string, unknown>, accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const patientEndpoint = process.env.FHIR_PATIENT_ENDPOINT;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !patientEndpoint || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}${patientEndpoint}`, {
      method: 'POST',
      headers: {
        'accept': 'application/fhir+json',
        'content-type': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      },
      body: JSON.stringify(patientData)
    });

    if (!response.ok) {
      throw new Error(`Patient creation failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create patient' };
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

// AllergyIntolerance endpoints
export async function fetchAllergies(patientId: string, accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}/ema/fhir/v2/AllergyIntolerance?patient=${patientId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Allergy fetch failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch allergies' };
  }
}

export async function createAllergy(allergyData: Record<string, unknown>, accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}/ema/fhir/v2/AllergyIntolerance`, {
      method: 'POST',
      headers: {
        'accept': 'application/fhir+json',
        'content-type': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      },
      body: JSON.stringify(allergyData)
    });

    if (!response.ok) {
      throw new Error(`Allergy creation failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create allergy' };
  }
}

export async function updateAllergy(allergyId: string, allergyData: Record<string, unknown>, accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}/ema/fhir/v2/AllergyIntolerance/${allergyId}`, {
      method: 'PUT',
      headers: {
        'accept': 'application/fhir+json',
        'content-type': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      },
      body: JSON.stringify(allergyData)
    });

    if (!response.ok) {
      throw new Error(`Allergy update failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update allergy' };
  }
}

// Condition endpoints
export async function fetchConditions(patientId: string, accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}/ema/fhir/v2/Condition?patient=${patientId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Condition fetch failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch conditions' };
  }
}

export async function createCondition(conditionData: Record<string, unknown>, accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}/ema/fhir/v2/Condition`, {
      method: 'POST',
      headers: {
        'accept': 'application/fhir+json',
        'content-type': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      },
      body: JSON.stringify(conditionData)
    });

    if (!response.ok) {
      throw new Error(`Condition creation failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create condition' };
  }
}

export async function updateCondition(conditionId: string, conditionData: Record<string, unknown>, accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}/ema/fhir/v2/Condition/${conditionId}`, {
      method: 'PUT',
      headers: {
        'accept': 'application/fhir+json',
        'content-type': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      },
      body: JSON.stringify(conditionData)
    });

    if (!response.ok) {
      throw new Error(`Condition update failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update condition' };
  }
}

// MedicationStatement endpoints
export async function fetchMedications(patientId: string, accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}/ema/fhir/v2/MedicationStatement?patient=${patientId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Medication fetch failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch medications' };
  }
}

export async function createMedication(medicationData: Record<string, unknown>, accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}/ema/fhir/v2/MedicationStatement`, {
      method: 'POST',
      headers: {
        'accept': 'application/fhir+json',
        'content-type': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      },
      body: JSON.stringify(medicationData)
    });

    if (!response.ok) {
      throw new Error(`Medication creation failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create medication' };
  }
}

export async function updateMedication(medicationId: string, medicationData: Record<string, unknown>, accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}/ema/fhir/v2/MedicationStatement/${medicationId}`, {
      method: 'PUT',
      headers: {
        'accept': 'application/fhir+json',
        'content-type': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      },
      body: JSON.stringify(medicationData)
    });

    if (!response.ok) {
      throw new Error(`Medication update failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update medication' };
  }
}

// Immunization endpoints
export async function fetchImmunizations(patientId: string, accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}/ema/fhir/v2/Immunization?patient=${patientId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Immunization fetch failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch immunizations' };
  }
}

export async function createImmunization(immunizationData: Record<string, unknown>, accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}/ema/fhir/v2/Immunization`, {
      method: 'POST',
      headers: {
        'accept': 'application/fhir+json',
        'content-type': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      },
      body: JSON.stringify(immunizationData)
    });

    if (!response.ok) {
      throw new Error(`Immunization creation failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create immunization' };
  }
}

export async function updateImmunization(immunizationId: string, immunizationData: Record<string, unknown>, accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}/ema/fhir/v2/Immunization/${immunizationId}`, {
      method: 'PUT',
      headers: {
        'accept': 'application/fhir+json',
        'content-type': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      },
      body: JSON.stringify(immunizationData)
    });

    if (!response.ok) {
      throw new Error(`Immunization update failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update immunization' };
  }
}