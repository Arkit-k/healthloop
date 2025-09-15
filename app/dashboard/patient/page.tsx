'use client';

import { useState, useEffect } from 'react';
import { generateTokens } from '../../actions/tokenActions';
import { fetchPatients, fetchPatientById, searchPatients, updatePatient } from '../../actions/patientActions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ThemeToggle } from '@/components/theme-toggle';
import { useToast, successToast, errorToast } from '@/components/toast';

interface TokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

interface Patient {
  id: string;
  name?: Array<{ given?: string[]; family?: string }>;
  birthDate?: string;
  gender?: string;
}

interface BundleEntry {
  resource: Patient;
}

interface Bundle {
  entry?: BundleEntry[];
}

export default function PatientDashboard() {
  const { addToast } = useToast();
  const [tokens, setTokens] = useState<TokenData | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  // Edit functionality state
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editFormData, setEditFormData] = useState({
    given: '',
    family: '',
    birthDate: '',
    gender: '',
    phone: '',
    email: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);

  // Search parameters state
  const [searchParams, setSearchParams] = useState({
    count: '',
    _lastUpdated: '',
    'address-postalcode': '',
    active: '',
    birthdate: '',
    email: '',
    family: '',
    gender: '',
    'general-practitioner': '',
    given: '',
    identifier: '',
    language: '',
    page: '',
    phone: '',
    'us-core-ethnicity': '',
    'us-core-race': '',
    'referral-source': ''
  });

  const loadPatients = async (tokenData: TokenData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPatients(tokenData.access_token);
      if (result.success && result.data) {
        const bundle = result.data as Bundle;
        setPatients(bundle.entry?.map((e) => e.resource) || []);
      } else if (!result.success && result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const loadPatientById = async (id: string) => {
    if (!id.trim()) {
      setError('Please enter a patient ID');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (!tokens) {
        setError('No tokens available. Please generate tokens first.');
        return;
      }
      const result = await fetchPatientById(id, tokens.access_token);
      if (result.success && result.data) {
        setPatients([result.data as unknown as Patient]); // Single patient in array for consistent UI
      } else if (!result.success && result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch patient');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!tokens) {
        setError('No tokens available. Please generate tokens first.');
        return;
      }

      // Filter out empty search parameters
      const filteredParams: Record<string, string> = {};
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value.trim() !== '') {
          filteredParams[key] = value.trim();
        }
      });

      const result = await searchPatients(filteredParams, tokens.access_token);
      if (result.success && result.data) {
        const bundle = result.data as Bundle;
        setPatients(bundle.entry?.map((e) => e.resource) || []);
      } else if (!result.success && result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to search patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchParamChange = (key: string, value: string) => {
    setSearchParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Edit functionality functions
  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setEditFormData({
      given: patient.name?.[0]?.given?.join(' ') || '',
      family: patient.name?.[0]?.family || '',
      birthDate: patient.birthDate || '',
      gender: patient.gender || '',
      phone: '',
      email: ''
    });
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdatePatient = async () => {
    if (!editingPatient || !tokens) return;

    setUpdateLoading(true);

    try {
      // Create FHIR Patient resource for update
      const patientData = {
        resourceType: 'Patient',
        id: editingPatient.id,
        name: [{
          given: editFormData.given.split(' ').filter(name => name.trim()),
          family: editFormData.family
        }],
        birthDate: editFormData.birthDate,
        gender: editFormData.gender,
        telecom: [
          ...(editFormData.phone ? [{ system: 'phone', value: editFormData.phone }] : []),
          ...(editFormData.email ? [{ system: 'email', value: editFormData.email }] : [])
        ].filter(contact => contact.value)
      };

      const result = await updatePatient(editingPatient.id, patientData, tokens.access_token);

      if (result.success) {
        addToast(successToast('Success', 'Patient updated successfully!'));
        // Refresh the patient list
        await loadPatients(tokens);
        // Close the dialog after a short delay
        setTimeout(() => {
          setEditingPatient(null);
        }, 1500);
      } else {
        addToast(errorToast('Error', result.error || 'Failed to update patient'));
      }
    } catch (err) {
      addToast(errorToast('Error', 'Failed to update patient'));
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleGenerateAndFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateTokens();
      if (result.success && result.data) {
        const tokenData = result.data as TokenData;
        setTokens(tokenData);
        await loadPatients(tokenData);
      } else if (!result.success && result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Try to load tokens from localStorage or generate new ones
    const savedTokens = localStorage.getItem('oauth_tokens');
    if (savedTokens) {
      try {
        const tokenData = JSON.parse(savedTokens);
        setTokens(tokenData);
        loadPatients(tokenData);
      } catch (err) {
        console.error('Failed to parse saved tokens');
      }
    }
  }, []);

  useEffect(() => {
    // Save tokens to localStorage when they change
    if (tokens) {
      localStorage.setItem('oauth_tokens', JSON.stringify(tokens));
    }
  }, [tokens]);

  return (
    <div className="font-sans min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold">Patient Dashboard</h1>
          </div>
          <ThemeToggle />
        </div>

        <div className="mb-8 space-y-4">
          {!tokens && (
            <button
              onClick={handleGenerateAndFetch}
              disabled={loading}
              className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 text-lg"
            >
              {loading ? 'Authenticating...' : 'Authenticate & Load Patients'}
            </button>
          )}

          {tokens && (
            <div className="flex gap-4">
              <Button
                onClick={() => loadPatients(tokens)}
                disabled={loading}
                size="lg"
                className="mr-4"
              >
                {loading ? 'Loading...' : 'Fetch All Patients'}
              </Button>

              <Button
                onClick={() => setShowSearch(!showSearch)}
                variant="outline"
                size="lg"
              >
                {showSearch ? 'Hide Search' : 'Advanced Search'}
              </Button>
            </div>
          )}

          {tokens && (
            <div className="flex gap-4 items-end">
              <div>
                <label htmlFor="patientId" className="block text-sm font-medium mb-2">
                  Patient ID
                </label>
                <input
                  id="patientId"
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="Enter patient ID"
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                onClick={() => loadPatientById(patientId)}
                disabled={loading || !patientId.trim()}
                className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                {loading ? 'Loading...' : 'Fetch Patient by ID'}
              </button>
            </div>
          )}

          {error && <p className="text-red-500 mt-4">Error: {error}</p>}
        </div>

        {showSearch && tokens && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Advanced Patient Search</CardTitle>
              <CardDescription>
                Search patients using multiple criteria including demographics, contact information, and clinical data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="count">Count (max 50)</Label>
                  <Input
                    id="count"
                    type="number"
                    value={searchParams.count}
                    onChange={(e) => handleSearchParamChange('count', e.target.value)}
                    placeholder="50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastUpdated">Last Updated</Label>
                  <Input
                    id="lastUpdated"
                    type="text"
                    value={searchParams._lastUpdated}
                    onChange={(e) => handleSearchParamChange('_lastUpdated', e.target.value)}
                    placeholder="gt2024-01-01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="active">Active Status</Label>
                  <Select value={searchParams.active} onValueChange={(value) => handleSearchParamChange('active', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={searchParams.gender} onValueChange={(value) => handleSearchParamChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="family">Family Name</Label>
                  <Input
                    id="family"
                    type="text"
                    value={searchParams.family}
                    onChange={(e) => handleSearchParamChange('family', e.target.value)}
                    placeholder="Last name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="given">Given Name</Label>
                  <Input
                    id="given"
                    type="text"
                    value={searchParams.given}
                    onChange={(e) => handleSearchParamChange('given', e.target.value)}
                    placeholder="First name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthdate">Birth Date</Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={searchParams.birthdate}
                    onChange={(e) => handleSearchParamChange('birthdate', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={searchParams.email}
                    onChange={(e) => handleSearchParamChange('email', e.target.value)}
                    placeholder="patient@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={searchParams.phone}
                    onChange={(e) => handleSearchParamChange('phone', e.target.value)}
                    placeholder="Phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="identifier">Identifier</Label>
                  <Input
                    id="identifier"
                    type="text"
                    value={searchParams.identifier}
                    onChange={(e) => handleSearchParamChange('identifier', e.target.value)}
                    placeholder="Patient ID or MRN"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="page">Page</Label>
                  <Input
                    id="page"
                    type="number"
                    value={searchParams.page}
                    onChange={(e) => handleSearchParamChange('page', e.target.value)}
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? 'Searching...' : 'Search Patients'}
                </Button>

                <Button
                  onClick={() => setSearchParams({
                    count: '',
                    _lastUpdated: '',
                    'address-postalcode': '',
                    active: '',
                    birthdate: '',
                    email: '',
                    family: '',
                    gender: '',
                    'general-practitioner': '',
                    given: '',
                    identifier: '',
                    language: '',
                    page: '',
                    phone: '',
                    'us-core-ethnicity': '',
                    'us-core-race': '',
                    'referral-source': ''
                  })}
                  variant="outline"
                >
                  Clear Search
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {tokens && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Authentication successful - Ready to fetch patient data
                </p>
              </div>
            </div>
          </div>
        )}

        {patients.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-2xl">Patients ({patients.length})</CardTitle>
              <CardDescription>
                Complete patient records with demographics and clinical information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {patients.map((patient) => (
                  <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg">
                          {patient.name?.[0]?.given?.join(' ') || 'Unknown'} {patient.name?.[0]?.family || ''}
                        </h3>
                        <Button
                          onClick={() => handleEditPatient(patient)}
                          size="sm"
                          variant="outline"
                        >
                          Edit
                        </Button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">ID:</span>
                          <span className="text-muted-foreground">{patient.id}</span>
                        </div>
                        {patient.birthDate && (
                          <div className="flex justify-between">
                            <span className="font-medium">Birth Date:</span>
                            <span className="text-muted-foreground">{patient.birthDate}</span>
                          </div>
                        )}
                        {patient.gender && (
                          <div className="flex justify-between">
                            <span className="font-medium">Gender:</span>
                            <span className="text-muted-foreground capitalize">{patient.gender}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <Button asChild size="sm" className="w-full">
                          <Link href={`/patient/${patient.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {patients.length === 0 && !loading && tokens && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No patients found.</p>
          </div>
        )}

        {/* Edit Patient Dialog */}
        <Dialog open={!!editingPatient} onOpenChange={() => setEditingPatient(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Patient</DialogTitle>
              <DialogDescription>
                Update patient information. Changes will be saved to the FHIR server.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-given" className="text-right">
                  First Name(s)
                </Label>
                <Input
                  id="edit-given"
                  value={editFormData.given}
                  onChange={(e) => handleEditFormChange('given', e.target.value)}
                  className="col-span-3"
                  placeholder="John Michael"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-family" className="text-right">
                  Last Name
                </Label>
                <Input
                  id="edit-family"
                  value={editFormData.family}
                  onChange={(e) => handleEditFormChange('family', e.target.value)}
                  className="col-span-3"
                  placeholder="Doe"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-birthDate" className="text-right">
                  Birth Date
                </Label>
                <Input
                  id="edit-birthDate"
                  type="date"
                  value={editFormData.birthDate}
                  onChange={(e) => handleEditFormChange('birthDate', e.target.value)}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-gender" className="text-right">
                  Gender
                </Label>
                <Select value={editFormData.gender} onValueChange={(value) => handleEditFormChange('gender', value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => handleEditFormChange('phone', e.target.value)}
                  className="col-span-3"
                  placeholder="+1-555-0123"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => handleEditFormChange('email', e.target.value)}
                  className="col-span-3"
                  placeholder="patient@example.com"
                />
              </div>
            </div>


            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingPatient(null)}
                disabled={updateLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleUpdatePatient}
                disabled={updateLoading}
              >
                {updateLoading ? 'Updating...' : 'Update Patient'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}