'use client';

import { useState, useEffect } from 'react';
import { generateTokens } from '../../actions/tokenActions';
import { fetchAppointments, searchAppointments } from '../../actions/appointmentActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { useToast, errorToast } from '@/components/toast';

interface TokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

interface Appointment {
  id: string;
  status: string;
  start?: string;
  end?: string;
  description?: string;
  participant?: Array<{
    actor: {
      reference: string;
      display?: string;
    };
    status: string;
  }>;
}

interface BundleEntry {
  resource: Appointment;
}

interface Bundle {
  entry?: BundleEntry[];
}

export default function AppointmentDashboard() {
  const { addToast } = useToast();
  const [tokens, setTokens] = useState<TokenData | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSearchDialog, setShowSearchDialog] = useState(false);

  // Search parameters state
  const [searchParams, setSearchParams] = useState({
    date: '',
    patient: '',
    practitioner: '',
    status: 'any',
    _count: '',
    _sort: ''
  });

  const loadAppointments = async (tokenData: TokenData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAppointments(tokenData.access_token);
      if (result.success && result.data) {
        const bundle = result.data as Bundle;
        setAppointments(bundle.entry?.map((e) => e.resource) || []);
      } else if (!result.success && result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch appointments');
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

      const result = await searchAppointments(filteredParams, tokens.access_token);
      if (result.success && result.data) {
        const bundle = result.data as Bundle;
        setAppointments(bundle.entry?.map((e) => e.resource) || []);
      } else if (!result.success && result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to search appointments');
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

  const handleGenerateAndFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateTokens();
      if (result.success && result.data) {
        const tokenData = result.data as TokenData;
        setTokens(tokenData);
        // Automatically fetch appointments after token generation
        await loadAppointments(tokenData);
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
    // Try to load tokens from localStorage and automatically fetch appointments
    const savedTokens = localStorage.getItem('oauth_tokens');
    if (savedTokens) {
      try {
        const tokenData = JSON.parse(savedTokens);
        setTokens(tokenData);
        // Automatically fetch appointments when tokens are loaded
        loadAppointments(tokenData);
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

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getParticipantDisplay = (appointment: Appointment, type: 'Patient' | 'Practitioner') => {
    const participant = appointment.participant?.find(p =>
      p.actor.reference?.startsWith(type + '/')
    );
    return participant?.actor.display || participant?.actor.reference || 'N/A';
  };

  return (
    <div className="font-sans min-h-screen p-4 pb-20 gap-16 sm:p-6 lg:p-8 bg-background text-foreground">
      <main className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <h1 className="text-2xl lg:text-3xl font-bold">Appointment Dashboard</h1>
          <div className="flex items-center gap-2 lg:gap-4 flex-wrap">
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
              {loading ? 'Authenticating...' : 'Authenticate & Load Appointments'}
            </button>
          )}

          {error && <p className="text-red-500 mt-4">Error: {error}</p>}
        </div>

        <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Advanced Appointment Search</DialogTitle>
              <DialogDescription>
                Search appointments by date, patient, provider, or status.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={searchParams.date}
                  onChange={(e) => handleSearchParamChange('date', e.target.value)}
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="patient">Patient ID</Label>
                <Input
                  id="patient"
                  type="text"
                  value={searchParams.patient}
                  onChange={(e) => handleSearchParamChange('patient', e.target.value)}
                  placeholder="Patient/123"
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="practitioner">Practitioner ID</Label>
                <Input
                  id="practitioner"
                  type="text"
                  value={searchParams.practitioner}
                  onChange={(e) => handleSearchParamChange('practitioner', e.target.value)}
                  placeholder="Practitioner/456"
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={searchParams.status} onValueChange={(value) => handleSearchParamChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="booked">Booked</SelectItem>
                    <SelectItem value="fulfilled">Fulfilled</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="noshow">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="count">Count (max 50)</Label>
                <Input
                  id="count"
                  type="number"
                  value={searchParams._count}
                  onChange={(e) => handleSearchParamChange('_count', e.target.value)}
                  placeholder="50"
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort">Sort</Label>
                <Select value={searchParams._sort} onValueChange={(value) => handleSearchParamChange('_sort', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Default</SelectItem>
                    <SelectItem value="date">By Date</SelectItem>
                    <SelectItem value="-date">By Date (Desc)</SelectItem>
                    <SelectItem value="status">By Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                onClick={() => setSearchParams({
                  date: '',
                  patient: '',
                  practitioner: '',
                  status: 'any',
                  _count: '',
                  _sort: ''
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
                {loading ? 'Searching...' : 'Search Appointments'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {appointments.length > 0 && (
          <div className="mt-4">
            <h2 className="text-2xl font-bold mb-6">Appointments ({appointments.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">Appointment {appointment.id}</CardTitle>
                    <CardDescription>
                      Status: <span className="capitalize font-medium">{appointment.status}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-muted-foreground">Start:</span>
                        <span className="text-muted-foreground">{formatDateTime(appointment.start)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-muted-foreground">End:</span>
                        <span className="text-muted-foreground">{formatDateTime(appointment.end)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-muted-foreground">Patient:</span>
                        <span className="text-muted-foreground">{getParticipantDisplay(appointment, 'Patient')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-muted-foreground">Provider:</span>
                        <span className="text-muted-foreground">{getParticipantDisplay(appointment, 'Practitioner')}</span>
                      </div>
                      {appointment.description && (
                        <div className="mt-2">
                          <span className="font-medium text-muted-foreground">Description:</span>
                          <p className="text-muted-foreground mt-1">{appointment.description}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {appointments.length === 0 && !loading && tokens && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No appointments found.</p>
          </div>
        )}
      </main>
    </div>
  );
}