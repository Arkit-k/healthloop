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
    const firmPrefix = process.env.FIRM_URL_PREFIX;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !firmPrefix || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}${firmPrefix}/fhir/v2/Coverage`, {
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

    const text = await response.text();
    if (!text.trim()) {
      throw new Error('Empty response from coverage endpoint');
    }

    try {
      const data = JSON.parse(text);
      return { success: true, data };
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch insurance coverage' };
  }
}

export async function checkInsuranceEligibility(patientId: string, accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const firmPrefix = process.env.FIRM_URL_PREFIX;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !firmPrefix || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}${firmPrefix}/fhir/v2/Coverage?beneficiary=${patientId}`, {
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

    const text = await response.text();
    if (!text.trim()) {
      throw new Error('Empty response from eligibility endpoint');
    }

    try {
      const data = JSON.parse(text);
      return { success: true, data };
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to check insurance eligibility' };
  }
}

export async function fetchPatientBalances(accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const firmPrefix = process.env.FIRM_URL_PREFIX;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !firmPrefix || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    // Try ExplanationOfBenefit first (more commonly supported for billing)
    try {
      const response = await fetch(`${baseUrl}${firmPrefix}/fhir/v2/ExplanationOfBenefit`, {
        method: 'GET',
        headers: {
          'accept': 'application/fhir+json',
          'authorization': `Bearer ${accessToken}`,
          'x-api-key': apiKey
        }
      });

      if (response.ok) {
        const text = await response.text();
        if (!text.trim()) {
          throw new Error('Empty response from ExplanationOfBenefit endpoint');
        }

        try {
          const data = JSON.parse(text);
          return { success: true, data };
        } catch (parseError) {
          throw new Error(`Invalid JSON response from ExplanationOfBenefit: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
        }
      }
    } catch (eobError) {
      console.warn('ExplanationOfBenefit not available, trying Account resource');
    }

    // Fallback to Account if ExplanationOfBenefit fails
    const response = await fetch(`${baseUrl}${firmPrefix}/fhir/v2/Account`, {
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
        const claimResponse = await fetch(`${baseUrl}${firmPrefix}/fhir/v2/Claim`, {
          method: 'GET',
          headers: {
            'accept': 'application/fhir+json',
            'authorization': `Bearer ${accessToken}`,
            'x-api-key': apiKey
          }
        });

        if (claimResponse.ok) {
          const text = await claimResponse.text();
          if (!text.trim()) {
            throw new Error('Empty response from Claim endpoint');
          }

          try {
            const data = JSON.parse(text);
            return { success: true, data };
          } catch (parseError) {
            throw new Error(`Invalid JSON response from Claim: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
          }
        }
      } catch (claimError) {
        console.warn('Claim resource also not available');
      }

      throw new Error(`Balance fetch failed: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    if (!text.trim()) {
      throw new Error('Empty response from Account endpoint');
    }

    try {
      const data = JSON.parse(text);
      return { success: true, data };
    } catch (parseError) {
      throw new Error(`Invalid JSON response from Account: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch patient balances' };
  }
}

export async function fetchPaymentHistory(patientId: string, accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const firmPrefix = process.env.FIRM_URL_PREFIX;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !firmPrefix || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}${firmPrefix}/fhir/v2/PaymentNotice?requestor=${patientId}`, {
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

    const text = await response.text();
    if (!text.trim()) {
      throw new Error('Empty response from PaymentNotice endpoint');
    }

    try {
      const data = JSON.parse(text);
      return { success: true, data };
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch payment history' };
  }
}

export async function fetchBillingCodes(accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const firmPrefix = process.env.FIRM_URL_PREFIX;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !firmPrefix || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const response = await fetch(`${baseUrl}${firmPrefix}/fhir/v2/ChargeItem`, {
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

    const text = await response.text();
    if (!text.trim()) {
      throw new Error('Empty response from ChargeItem endpoint');
    }

    try {
      const data = JSON.parse(text);
      return { success: true, data };
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch billing codes' };
  }
}

export async function searchBilling(searchParams: BillingSearchParams, accessToken: string) {
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

    // Try ExplanationOfBenefit first
    try {
      const url = queryString
        ? `${baseUrl}${firmPrefix}/fhir/v2/ExplanationOfBenefit?${queryString}`
        : `${baseUrl}${firmPrefix}/fhir/v2/ExplanationOfBenefit`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/fhir+json',
          'authorization': `Bearer ${accessToken}`,
          'x-api-key': apiKey
        }
      });

      if (response.ok) {
        const text = await response.text();
        if (!text.trim()) {
          throw new Error('Empty response from ExplanationOfBenefit endpoint');
        }

        try {
          const data = JSON.parse(text);
          return { success: true, data };
        } catch (parseError) {
          throw new Error(`Invalid JSON response from ExplanationOfBenefit: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
        }
      }
    } catch (eobError) {
      console.warn('ExplanationOfBenefit search not available, trying Account');
    }

    // Fallback to Account
    const url = queryString
      ? `${baseUrl}${firmPrefix}/fhir/v2/Account?${queryString}`
      : `${baseUrl}${firmPrefix}/fhir/v2/Account`;

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

    const text = await response.text();
    if (!text.trim()) {
      throw new Error('Empty response from Account endpoint');
    }

    try {
      const data = JSON.parse(text);
      return { success: true, data };
    } catch (parseError) {
      throw new Error(`Invalid JSON response from Account: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to search billing records' };
  }
}

export async function generateBillingReport(accessToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FHIR_BASE_URL;
    const firmPrefix = process.env.FIRM_URL_PREFIX;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !firmPrefix || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    // Try to fetch accounts/balances with fallback logic
    let accounts = { entry: [] };
    try {
      const accountsRes = await fetch(`${baseUrl}${firmPrefix}/fhir/v2/ExplanationOfBenefit`, {
        method: 'GET',
        headers: {
          'accept': 'application/fhir+json',
          'authorization': `Bearer ${accessToken}`,
          'x-api-key': apiKey
        }
      });

      if (accountsRes.ok) {
        const text = await accountsRes.text();
        if (text.trim()) {
          try {
            accounts = JSON.parse(text);
          } catch (parseError) {
            console.warn(`Invalid JSON response from ExplanationOfBenefit: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
          }
        }
      } else {
        // Fallback to Account
        const accountRes = await fetch(`${baseUrl}${firmPrefix}/fhir/v2/Account`, {
          method: 'GET',
          headers: {
            'accept': 'application/fhir+json',
            'authorization': `Bearer ${accessToken}`,
            'x-api-key': apiKey
          }
        });
        if (accountRes.ok) {
          const text = await accountRes.text();
          if (text.trim()) {
            try {
              accounts = JSON.parse(text);
            } catch (parseError) {
              console.warn(`Invalid JSON response from Account: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
            }
          }
        }
      }
    } catch (accountError) {
      console.warn('Could not fetch account/billing data for report');
    }

    // Fetch charges (ChargeItem)
    let charges = { entry: [] };
    try {
      const chargesRes = await fetch(`${baseUrl}${firmPrefix}/fhir/v2/ChargeItem`, {
        method: 'GET',
        headers: {
          'accept': 'application/fhir+json',
          'authorization': `Bearer ${accessToken}`,
          'x-api-key': apiKey
        }
      });

      if (chargesRes.ok) {
        const text = await chargesRes.text();
        if (text.trim()) {
          try {
            charges = JSON.parse(text);
          } catch (parseError) {
            console.warn(`Invalid JSON response from ChargeItem: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
          }
        }
      }
    } catch (chargeError) {
      console.warn('Could not fetch charge data for report');
    }

    // Fetch payments (PaymentNotice)
    let payments = { entry: [] };
    try {
      const paymentsRes = await fetch(`${baseUrl}${firmPrefix}/fhir/v2/PaymentNotice`, {
        method: 'GET',
        headers: {
          'accept': 'application/fhir+json',
          'authorization': `Bearer ${accessToken}`,
          'x-api-key': apiKey
        }
      });

      if (paymentsRes.ok) {
        const text = await paymentsRes.text();
        if (text.trim()) {
          try {
            payments = JSON.parse(text);
          } catch (parseError) {
            console.warn(`Invalid JSON response from PaymentNotice: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
          }
        }
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