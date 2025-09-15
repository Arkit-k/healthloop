'use server';

interface BillingSearchParams {
  patient?: string;
  date?: string;
  status?: string;
  _count?: string;
  _sort?: string;
}

export async function fetchInsuranceCoverage(accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}/ema/fhir/v2/Coverage`, {
      method: 'GET',
      headers: {
        'accept': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Coverage fetch failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch insurance coverage' };
  }
}

export async function checkInsuranceEligibility(patientId: string, accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}/ema/fhir/v2/Coverage?beneficiary=${patientId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Eligibility check failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to check insurance eligibility' };
  }
}

export async function fetchPatientBalances(accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    // Try ExplanationOfBenefit first (more commonly supported for billing)
    try {
      const response = await fetch(`${baseUrl}/ema/fhir/v2/ExplanationOfBenefit`, {
        method: 'GET',
        headers: {
          'accept': 'application/fhir+json',
          'authorization': `Bearer ${accessToken}`,
          'x-api-key': apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      }
    } catch (eobError) {
      console.warn('ExplanationOfBenefit not available, trying Account resource');
    }

    // Fallback to Account if ExplanationOfBenefit fails
    const response = await fetch(`${baseUrl}/ema/fhir/v2/Account`, {
      method: 'GET',
      headers: {
        'accept': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      }
    });

    if (!response.ok) {
      // If Account also fails, try Claim as another fallback
      try {
        const claimResponse = await fetch(`${baseUrl}/ema/fhir/v2/Claim`, {
          method: 'GET',
          headers: {
            'accept': 'application/fhir+json',
            'authorization': `Bearer ${accessToken}`,
            'x-api-key': apiKey
          }
        });

        if (claimResponse.ok) {
          const data = await claimResponse.json();
          return { success: true, data };
        }
      } catch (claimError) {
        console.warn('Claim resource also not available');
      }

      throw new Error(`Balance fetch failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch patient balances' };
  }
}

export async function fetchPaymentHistory(patientId: string, accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}/ema/fhir/v2/PaymentNotice?requestor=${patientId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Payment history fetch failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch payment history' };
  }
}

export async function fetchBillingCodes(accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}/ema/fhir/v2/ChargeItem`, {
      method: 'GET',
      headers: {
        'accept': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Billing codes fetch failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch billing codes' };
  }
}

export async function searchBilling(searchParams: BillingSearchParams, accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !apiKey) {
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

    // Try ExplanationOfBenefit first
    try {
      const url = queryString
        ? `${baseUrl}/ema/fhir/v2/ExplanationOfBenefit?${queryString}`
        : `${baseUrl}/ema/fhir/v2/ExplanationOfBenefit`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/fhir+json',
          'authorization': `Bearer ${accessToken}`,
          'x-api-key': apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      }
    } catch (eobError) {
      console.warn('ExplanationOfBenefit search not available, trying Account');
    }

    // Fallback to Account
    const url = queryString
      ? `${baseUrl}/ema/fhir/v2/Account?${queryString}`
      : `${baseUrl}/ema/fhir/v2/Account`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/fhir+json',
        'authorization': `Bearer ${accessToken}`,
        'x-api-key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Billing search failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to search billing records' };
  }
}

export async function generateBillingReport(accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    // Try to fetch accounts/balances with fallback logic
    let accounts = { entry: [] };
    try {
      const accountsRes = await fetch(`${baseUrl}/ema/fhir/v2/ExplanationOfBenefit`, {
        method: 'GET',
        headers: {
          'accept': 'application/fhir+json',
          'authorization': `Bearer ${accessToken}`,
          'x-api-key': apiKey
        }
      });

      if (accountsRes.ok) {
        accounts = await accountsRes.json();
      } else {
        // Fallback to Account
        const accountRes = await fetch(`${baseUrl}/ema/fhir/v2/Account`, {
          method: 'GET',
          headers: {
            'accept': 'application/fhir+json',
            'authorization': `Bearer ${accessToken}`,
            'x-api-key': apiKey
          }
        });
        if (accountRes.ok) {
          accounts = await accountRes.json();
        }
      }
    } catch (accountError) {
      console.warn('Could not fetch account/billing data for report');
    }

    // Fetch charges (ChargeItem)
    let charges = { entry: [] };
    try {
      const chargesRes = await fetch(`${baseUrl}/ema/fhir/v2/ChargeItem`, {
        method: 'GET',
        headers: {
          'accept': 'application/fhir+json',
          'authorization': `Bearer ${accessToken}`,
          'x-api-key': apiKey
        }
      });

      if (chargesRes.ok) {
        charges = await chargesRes.json();
      }
    } catch (chargeError) {
      console.warn('Could not fetch charge data for report');
    }

    // Fetch payments (PaymentNotice)
    let payments = { entry: [] };
    try {
      const paymentsRes = await fetch(`${baseUrl}/ema/fhir/v2/PaymentNotice`, {
        method: 'GET',
        headers: {
          'accept': 'application/fhir+json',
          'authorization': `Bearer ${accessToken}`,
          'x-api-key': apiKey
        }
      });

      if (paymentsRes.ok) {
        payments = await paymentsRes.json();
      }
    } catch (paymentError) {
      console.warn('Could not fetch payment data for report');
    }

    const report = {
      accounts: accounts,
      charges: charges,
      payments: payments,
      generatedAt: new Date().toISOString()
    };

    return { success: true, data: report };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to generate billing report' };
  }
}