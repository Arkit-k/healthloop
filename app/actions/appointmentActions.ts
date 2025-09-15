'use server';

interface AppointmentSearchParams {
  date?: string;
  patient?: string;
  practitioner?: string;
  status?: string;
  _count?: string;
  _sort?: string;
}

export async function fetchAppointments(accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const firmPrefix = process.env.FIRM_URL_PREFIX;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !firmPrefix || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}${firmPrefix}/fhir/v2/Appointment`, {
      method: 'GET',
      headers: {
        'accept': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Appointment fetch failed: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    if (!text.trim()) {
      throw new Error('Empty response from appointment endpoint');
    }

    try {
      const data = JSON.parse(text);
      return { success: true, data };
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch appointments' };
  }
}

export async function searchAppointments(searchParams: AppointmentSearchParams, accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const firmPrefix = process.env.FIRM_URL_PREFIX;
    const apiKey = process.env.API_KEY;

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
      ? `${baseUrl}${firmPrefix}/fhir/v2/Appointment?${queryString}`
      : `${baseUrl}${firmPrefix}/fhir/v2/Appointment`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Appointment search failed: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    if (!text.trim()) {
      throw new Error('Empty response from appointment endpoint');
    }

    try {
      const data = JSON.parse(text);
      return { success: true, data };
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to search appointments' };
  }
}


export async function createAppointment(appointmentData: Record<string, unknown>, accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const firmPrefix = process.env.FIRM_URL_PREFIX;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !firmPrefix || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}${firmPrefix}/fhir/v2/Appointment`, {
      method: 'POST',
      headers: {
        'accept': 'application/fhir+json',
        'content-type': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      },
      body: JSON.stringify(appointmentData)
    });

    if (!response.ok) {
      throw new Error(`Appointment creation failed: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    if (!text.trim()) {
      throw new Error('Empty response from appointment endpoint');
    }

    try {
      const data = JSON.parse(text);
      return { success: true, data };
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create appointment' };
  }
}

export async function updateAppointment(appointmentId: string, appointmentData: Record<string, unknown>, accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const firmPrefix = process.env.FIRM_URL_PREFIX;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !firmPrefix || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}${firmPrefix}/fhir/v2/Appointment/${appointmentId}`, {
      method: 'PUT',
      headers: {
        'accept': 'application/fhir+json',
        'content-type': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      },
      body: JSON.stringify(appointmentData)
    });

    if (!response.ok) {
      throw new Error(`Appointment update failed: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    if (!text.trim()) {
      throw new Error('Empty response from appointment endpoint');
    }

    try {
      const data = JSON.parse(text);
      return { success: true, data };
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update appointment' };
  }
}

export async function cancelAppointment(appointmentId: string, accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const firmPrefix = process.env.FIRM_URL_PREFIX;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !firmPrefix || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    // Create minimal appointment data with cancelled status
    const appointmentData = {
      resourceType: 'Appointment',
      id: appointmentId,
      status: 'cancelled'
    };

    const response = await fetch(`${baseUrl}${firmPrefix}/fhir/v2/Appointment/${appointmentId}`, {
      method: 'PUT',
      headers: {
        'accept': 'application/fhir+json',
        'content-type': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      },
      body: JSON.stringify(appointmentData)
    });

    if (!response.ok) {
      throw new Error(`Appointment cancellation failed: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    if (!text.trim()) {
      throw new Error('Empty response from appointment endpoint');
    }

    try {
      const data = JSON.parse(text);
      return { success: true, data };
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to cancel appointment' };
  }
}


export async function checkAppointmentConflicts(providerId: string, patientId: string, startTime: string, endTime: string, excludeAppointmentId?: string, accessToken?: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const firmPrefix = process.env.FIRM_URL_PREFIX;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !firmPrefix || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    // Check for overlapping appointments for the provider
    const providerConflicts = await fetch(`${baseUrl}${firmPrefix}/fhir/v2/Appointment?practitioner=${providerId}&date=${startTime.split('T')[0]}`, {
      method: 'GET',
      headers: {
        'accept': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      }
    });

    // Check for overlapping appointments for the patient
    const patientConflicts = await fetch(`${baseUrl}${firmPrefix}/fhir/v2/Appointment?patient=${patientId}&date=${startTime.split('T')[0]}`, {
      method: 'GET',
      headers: {
        'accept': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      }
    });

    if (!providerConflicts.ok || !patientConflicts.ok) {
      throw new Error('Conflict check failed');
    }

    const providerText = await providerConflicts.text();
    const patientText = await patientConflicts.text();

    if (!providerText.trim()) {
      throw new Error('Empty response from provider conflicts endpoint');
    }
    if (!patientText.trim()) {
      throw new Error('Empty response from patient conflicts endpoint');
    }

    let providerData, patientData;
    try {
      providerData = JSON.parse(providerText);
    } catch (parseError) {
      throw new Error(`Invalid JSON response from provider conflicts: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }
    try {
      patientData = JSON.parse(patientText);
    } catch (parseError) {
      throw new Error(`Invalid JSON response from patient conflicts: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }

    const conflicts = [];

    // Check provider conflicts
    if (providerData.entry) {
      for (const entry of providerData.entry) {
        const appointment = entry.resource;
        if (excludeAppointmentId && appointment.id === excludeAppointmentId) continue;

        if (hasTimeOverlap(startTime, endTime, appointment.start, appointment.end)) {
          conflicts.push({
            type: 'provider',
            appointment: appointment,
            message: `Provider has conflicting appointment: ${appointment.description || 'Appointment'}`
          });
        }
      }
    }

    // Check patient conflicts
    if (patientData.entry) {
      for (const entry of patientData.entry) {
        const appointment = entry.resource;
        if (excludeAppointmentId && appointment.id === excludeAppointmentId) continue;

        if (hasTimeOverlap(startTime, endTime, appointment.start, appointment.end)) {
          conflicts.push({
            type: 'patient',
            appointment: appointment,
            message: `Patient has conflicting appointment: ${appointment.description || 'Appointment'}`
          });
        }
      }
    }

    return { success: true, conflicts, hasConflicts: conflicts.length > 0 };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to check appointment conflicts' };
  }
}

function hasTimeOverlap(start1: string, end1: string, start2?: string, end2?: string): boolean {
  if (!start2 || !end2) return false;

  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime();

  return (s1 < e2 && e1 > s2);
}