'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
import { Pagination } from '@/components/ui/pagination';
import { ChevronDown, ChevronRight } from 'lucide-react';

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
  const router = useRouter();
  const [tokens, setTokens] = useState<TokenData | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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
    active: 'any',
    birthdate: '',
    email: '',
    family: '',
    gender: 'any',
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
        const allPatientData = bundle.entry?.map((e) => e.resource) || [];
        setAllPatients(allPatientData);
        setCurrentPage(1); // Reset to first page when loading new data
        updatePaginatedPatients(allPatientData, 1);
      } else if (!result.success && result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const updatePaginatedPatients = (patientList: Patient[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPatients(patientList.slice(startIndex, endIndex));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updatePaginatedPatients(allPatients, page);
  };

  const totalPages = Math.ceil(allPatients.length / itemsPerPage);

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

      // Filter out empty search parameters and "any" values
      const filteredParams: Record<string, string> = {};
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value.trim() !== '' && value !== 'any') {
          filteredParams[key] = value.trim();
        }
      });

      const result = await searchPatients(filteredParams, tokens.access_token);
      if (result.success && result.data) {
        const bundle = result.data as Bundle;
        const searchResults = bundle.entry?.map((e) => e.resource) || [];
        setAllPatients(searchResults);
        setCurrentPage(1); // Reset to first page when searching
        updatePaginatedPatients(searchResults, 1);
      } else if (!result.success && result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to search patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchParamChange = useCallback((key: string, value: string) => {
    setSearchParams(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

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

  const handleEditFormChange = useCallback((field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

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
        // Automatically fetch patients after token generation
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
    // Try to load tokens from localStorage and automatically fetch patients
    const savedTokens = localStorage.getItem('oauth_tokens');
    if (savedTokens) {
      try {
        const tokenData = JSON.parse(savedTokens);
        setTokens(tokenData);
        // Automatically fetch patients when tokens are loaded
        loadPatients(tokenData);
      } catch (err) {
        console.error('Failed to parse saved tokens');
      }
    }
    // Clear any old dashboard credentials from localStorage
    localStorage.removeItem('dashboard_credentials');
  }, []);

  useEffect(() => {
    // Save tokens to localStorage when they change
    if (tokens) {
      localStorage.setItem('oauth_tokens', JSON.stringify(tokens));
    }
  }, [tokens]);


  return (
    <div className="font-sans min-h-screen p-4 pb-20 gap-16 sm:p-6 lg:p-8 bg-background text-foreground">
      <main className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <h1 className="text-2xl lg:text-3xl font-bold">Patient Dashboard</h1>
          <div className="flex items-center gap-2 lg:gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
              >
                ← Back to Home
              </Button>
            </div>
            {tokens && (
              <div className="flex items-center gap-2">
                <Input
                  id="patientId"
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="Patient ID"
                  className="w-28 lg:w-32 h-8 text-sm"
                />
                <Button
                  onClick={() => loadPatientById(patientId)}
                  disabled={loading || !patientId.trim()}
                  size="sm"
                  className="h-8 px-3"
                >
                  {loading ? '...' : 'Fetch'}
                </Button>
              </div>
            )}
            <Button
              onClick={() => setShowSearchDialog(true)}
              variant="outline"
              size="sm"
              className="whitespace-nowrap"
            >
              Advanced Search
            </Button>
            <ThemeToggle />
          </div>
        </div>


        <div className="mb-4 space-y-4">
          {!tokens && (
            <button
              onClick={handleGenerateAndFetch}
              disabled={loading}
              className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 text-lg"
            >
              {loading ? 'Authenticating...' : 'Authenticate & Load Patients'}
            </button>
          )}



          {error && <p className="text-red-500 mt-4">Error: {error}</p>}
        </div>

        <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Advanced Patient Search</DialogTitle>
              <DialogDescription>
                Search patients using multiple criteria including demographics, contact information, and clinical data.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="count">Count (max 50)</Label>
                <Input
                  id="count"
                  type="number"
                  value={searchParams.count}
                  onChange={(e) => handleSearchParamChange('count', e.target.value)}
                  placeholder="50"
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastUpdated" className="text-gray-300">Last Updated</Label>
                <Input
                  id="lastUpdated"
                  type="text"
                  value={searchParams._lastUpdated}
                  onChange={(e) => handleSearchParamChange('_lastUpdated', e.target.value)}
                  placeholder="gt2024-01-01"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="active" className="text-gray-300">Active Status</Label>
                <Select value={searchParams.active} onValueChange={(value) => handleSearchParamChange('active', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-gray-300">Gender</Label>
                <Select value={searchParams.gender} onValueChange={(value) => handleSearchParamChange('gender', value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="family" className="text-gray-300">Family Name</Label>
                <Input
                  id="family"
                  type="text"
                  value={searchParams.family}
                  onChange={(e) => handleSearchParamChange('family', e.target.value)}
                  placeholder="Last name"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="given" className="text-gray-300">Given Name</Label>
                <Input
                  id="given"
                  type="text"
                  value={searchParams.given}
                  onChange={(e) => handleSearchParamChange('given', e.target.value)}
                  placeholder="First name"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthdate" className="text-gray-300">Birth Date</Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={searchParams.birthdate}
                  onChange={(e) => handleSearchParamChange('birthdate', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={searchParams.email}
                  onChange={(e) => handleSearchParamChange('email', e.target.value)}
                  placeholder="patient@example.com"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={searchParams.phone}
                  onChange={(e) => handleSearchParamChange('phone', e.target.value)}
                  placeholder="Phone number"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-gray-300">Identifier</Label>
                <Input
                  id="identifier"
                  type="text"
                  value={searchParams.identifier}
                  onChange={(e) => handleSearchParamChange('identifier', e.target.value)}
                  placeholder="Patient ID or MRN"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="page" className="text-gray-300">Page</Label>
                <Input
                  id="page"
                  type="number"
                  value={searchParams.page}
                  onChange={(e) => handleSearchParamChange('page', e.target.value)}
                  placeholder="1"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                onClick={() => setSearchParams({
                  count: '',
                  _lastUpdated: '',
                  'address-postalcode': '',
                  active: 'any',
                  birthdate: '',
                  email: '',
                  family: '',
                  gender: 'any',
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
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                Clear Search
              </Button>
              <Button
                onClick={() => {
                  handleSearch();
                  setShowSearchDialog(false);
                }}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading ? 'Searching...' : 'Search Patients'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


        {patients.length > 0 && (
          <div className="mt-4">
            <h2 className="text-2xl font-bold mb-6">Patients ({allPatients.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {patients.map((patient) => (
                <div key={patient.id} className="bg-card p-4 rounded-lg border border-border hover:bg-accent transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg">
                      {patient.name?.[0]?.given?.join(' ') || 'Unknown'} {patient.name?.[0]?.family || ''}
                    </h3>
                    <Button
                      onClick={() => handleEditPatient(patient)}
                      size="sm"
                      variant="outline"
                      className="bg-gray-600 border-gray-500 text-white hover:bg-gray-500"
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-muted-foreground">ID:</span>
                    <span className="text-muted-foreground">{patient.id}</span>
                    </div>
                    {patient.birthDate && (
                      <div className="flex justify-between">
                        <span className="font-medium text-muted-foreground">Birth Date:</span>
                        <span className="text-muted-foreground">{patient.birthDate}</span>
                      </div>
                    )}
                    {patient.gender && (
                      <div className="flex justify-between">
                        <span className="font-medium text-muted-foreground">Gender:</span>
                        <span className="text-muted-foreground capitalize">{patient.gender}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <Button asChild size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Link href={`/patient/${patient.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {patients.length === 0 && !loading && tokens && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No patients found.</p>
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