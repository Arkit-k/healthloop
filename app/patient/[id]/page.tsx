'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchPatientById } from '../../actions/patientActions';
import { generateTokens } from '../../actions/tokenActions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { ThemeToggle } from '../../../components/theme-toggle';
import { useToast, errorToast } from '../../../components/toast';
import { ArrowLeft, User, Calendar, Phone, Mail, MapPin, Activity } from 'lucide-react';

interface TokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

interface Patient {
  id: string;
  resourceType?: string;
  name?: Array<{
    given?: string[];
    family?: string;
    use?: string;
  }>;
  birthDate?: string;
  gender?: string;
  telecom?: Array<{
    system: string;
    value: string;
    use?: string;
  }>;
  address?: Array<{
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
  active?: boolean;
  deceasedBoolean?: boolean;
  deceasedDateTime?: string;
  maritalStatus?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  };
  communication?: Array<{
    language: {
      coding?: Array<{
        system?: string;
        code?: string;
        display?: string;
      }>;
    };
  }>;
  identifier?: Array<{
    system?: string;
    value?: string;
    type?: {
      coding?: Array<{
        system?: string;
        code?: string;
        display?: string;
      }>;
    };
  }>;
}

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  const { addToast } = useToast();

  const [tokens, setTokens] = useState<TokenData | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPatientData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to get tokens from localStorage first
        let tokenData = localStorage.getItem('oauth_tokens');

        if (!tokenData) {
          // Generate new tokens if not available
          const result = await generateTokens();
          if (result.success && result.data) {
            tokenData = JSON.stringify(result.data);
            localStorage.setItem('oauth_tokens', tokenData);
          } else {
            throw new Error(result.error || 'Failed to generate tokens');
          }
        }

        const parsedTokens = JSON.parse(tokenData);
        setTokens(parsedTokens);

        // Fetch patient details
        const patientResult = await fetchPatientById(patientId, parsedTokens.access_token);
        if (patientResult.success && patientResult.data) {
          setPatient(patientResult.data as Patient);
        } else {
          throw new Error(patientResult.error || 'Failed to fetch patient details');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load patient data';
        setError(errorMessage);
        addToast(errorToast('Error', errorMessage));
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPrimaryName = (patient: Patient) => {
    const name = patient.name?.[0];
    if (!name) return 'Unknown Patient';

    const given = name.given?.join(' ') || '';
    const family = name.family || '';
    return `${given} ${family}`.trim();
  };

  const getTelecomInfo = (patient: Patient, system: string) => {
    return patient.telecom?.find(contact => contact.system === system)?.value;
  };

  const getAddressInfo = (patient: Patient) => {
    const address = patient.address?.[0];
    if (!address) return null;

    const lines = address.line?.join(', ') || '';
    const city = address.city || '';
    const state = address.state || '';
    const postalCode = address.postalCode || '';
    const country = address.country || '';

    return [lines, city, state, postalCode, country].filter(Boolean).join(', ');
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
            <div className="h-10 w-10 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="space-y-6">
            <div className="h-32 bg-muted rounded animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-48 bg-muted rounded animate-pulse"></div>
              <div className="h-48 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link href="/dashboard/patient">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Patients
              </Button>
            </Link>
            <ThemeToggle />
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-red-500 text-lg font-semibold mb-2">Error Loading Patient</div>
                <p className="text-muted-foreground">{error}</p>
                <Button
                  onClick={() => router.refresh()}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link href="/dashboard/patient">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Patients
              </Button>
            </Link>
            <ThemeToggle />
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-gray-500 text-lg">Patient not found</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/patient">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Patients
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{getPrimaryName(patient)}</h1>
              <p className="text-muted-foreground">Patient ID: {patient.id}</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Patient Status */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span className="font-medium">Status:</span>
                <Badge variant={patient.active !== false ? "default" : "secondary"}>
                  {patient.active !== false ? "Active" : "Inactive"}
                </Badge>
              </div>
              {patient.deceasedBoolean && (
                <Badge variant="destructive">Deceased</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="text-lg font-semibold">{getPrimaryName(patient)}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                  <p className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(patient.birthDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Gender</label>
                  <p className="capitalize mt-1">{patient.gender || 'Not specified'}</p>
                </div>
              </div>

              {patient.maritalStatus && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Marital Status</label>
                    <p className="mt-1">
                      {patient.maritalStatus.coding?.[0]?.display || 'Not specified'}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4" />
                  {getTelecomInfo(patient, 'phone') || 'Not provided'}
                </p>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4" />
                  {getTelecomInfo(patient, 'email') || 'Not provided'}
                </p>
              </div>

              {getAddressInfo(patient) && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <p className="flex items-start gap-2 mt-1">
                      <MapPin className="h-4 w-4 mt-0.5" />
                      {getAddressInfo(patient)}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Identifiers */}
          {patient.identifier && patient.identifier.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Identifiers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patient.identifier.map((identifier, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{identifier.value}</p>
                        <p className="text-sm text-muted-foreground">
                          {identifier.type?.coding?.[0]?.display || identifier.system || 'Identifier'}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {identifier.system?.split('/').pop() || 'ID'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Communication/Language */}
          {patient.communication && patient.communication.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {patient.communication.map((comm, index) => (
                    <div key={index}>
                      <p className="font-medium">
                        {comm.language.coding?.[0]?.display || 'Language'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Code: {comm.language.coding?.[0]?.code}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Additional Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {patient.resourceType}
                </div>
                <div className="text-sm text-muted-foreground">Resource Type</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {patient.id}
                </div>
                <div className="text-sm text-muted-foreground">Patient ID</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {patient.active !== false ? 'Yes' : 'No'}
                </div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {patient.gender || 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Gender</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}