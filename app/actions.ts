'use server';

import emasample from '@api/emasample';

export async function generateTokens() {
  try {
    emasample.auth('Zt9tXPIgz17uxEU6gkZPWa3ZAFhZOqm04oEDHC1f');
    const response = await emasample.postWsOauth2Grant({grant_type: 'password', username: 'fhir_QfLlo', password: '925X3LZ505'});
    return { success: true, data: response.data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
  }
}