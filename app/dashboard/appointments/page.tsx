'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { generateTokens } from '../../actions/tokenActions';
import { fetchAppointments, searchAppointments, createAppointment, updateAppointment, cancelAppointment, checkAppointmentConflicts } from '../../actions/appointmentActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { useToast, successToast, errorToast } from '@/components/toast';
import { Pagination } from '@/components/ui/pagination';

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


interface Conflict {
  type: string;
  appointment: Appointment;
  message: string;
}

export default function AppointmentDashboard() {
  const { addToast } = useToast();
  const router = useRouter();
  const [tokens, setTokens] = useState<TokenData | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [showBookDialog, setShowBookDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Search parameters state
  const [searchParams, setSearchParams] = useState({
    date: '',
    patient: '',
    practitioner: '',
    status: 'any',
    _count: '',
    _sort: 'default'
  });

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    patientId: '',
    practitionerId: '',
    date: '',
    startTime: '',
    endTime: '',
    description: '',
    type: 'Routine'
  });

  const loadAppointments = async (tokenData: TokenData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAppointments(tokenData.access_token);
      if (result.success && result.data) {
        const bundle = result.data as Bundle;
        const allAppointmentData = bundle.entry?.map((e) => e.resource) || [];
        setAllAppointments(allAppointmentData);
        setCurrentPage(1); // Reset to first page when loading new data
        updatePaginatedAppointments(allAppointmentData, 1);
      } else if (!result.success && result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const updatePaginatedAppointments = (appointmentList: Appointment[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setAppointments(appointmentList.slice(startIndex, endIndex));
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    updatePaginatedAppointments(allAppointments, page);
  }, [allAppointments]);


  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!tokens) {
        setError('No tokens available. Please generate tokens first.');
        return;
      }

      // Filter out empty search parameters and "any"/"default" values
      const filteredParams: Record<string, string> = {};
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value.trim() !== '' && value !== 'any' && value !== 'default') {
          filteredParams[key] = value.trim();
        }
      });

      const result = await searchAppointments(filteredParams, tokens.access_token);
      if (result.success && result.data) {
        const bundle = result.data as Bundle;
        const searchResults = bundle.entry?.map((e) => e.resource) || [];
        setAllAppointments(searchResults);
        setCurrentPage(1); // Reset to first page when searching
        updatePaginatedAppointments(searchResults, 1);
      } else if (!result.success && result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to search appointments');
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

  const formatDateTime = useCallback((dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  }, []);

  const getParticipantDisplay = useCallback((appointment: Appointment, type: 'Patient' | 'Practitioner') => {
    const participant = appointment.participant?.find(p =>
      p.actor.reference?.startsWith(type + '/')
    );
    return participant?.actor.display || participant?.actor.reference || 'N/A';
  }, []);

  const totalPages = useMemo(() => Math.ceil(allAppointments.length / itemsPerPage), [allAppointments.length, itemsPerPage]);

  const handleBookAppointment = async () => {
    if (!tokens) {
      addToast(errorToast('Error', 'No tokens available'));
      return;
    }

    setBookingLoading(true);
    setConflicts([]);

    try {
      // Check for conflicts first
      const startDateTime = `${bookingForm.date}T${bookingForm.startTime}:00`;
      const endDateTime = `${bookingForm.date}T${bookingForm.endTime}:00`;

      const conflictResult = await checkAppointmentConflicts(
        bookingForm.practitionerId,
        bookingForm.patientId,
        startDateTime,
        endDateTime,
        undefined,
        tokens.access_token
      );

      if (!conflictResult.success) {
        addToast(errorToast('Error', conflictResult.error || 'Failed to check conflicts'));
        return;
      }

      if (conflictResult.hasConflicts) {
        setConflicts(conflictResult.conflicts);
        addToast(errorToast('Conflicts Detected', 'Please resolve conflicts before booking'));
        return;
      }

      // Create appointment data
      const appointmentData = {
        resourceType: 'Appointment',
        status: 'booked',
        description: bookingForm.description,
        start: startDateTime,
        end: endDateTime,
        participant: [
          {
            actor: { reference: `Patient/${bookingForm.patientId}` },
            status: 'accepted'
          },
          {
            actor: { reference: `Practitioner/${bookingForm.practitionerId}` },
            status: 'accepted'
          }
        ],
        appointmentType: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v2-0276',
            code: bookingForm.type,
            display: bookingForm.type
          }]
        }
      };

      const result = await createAppointment(appointmentData, tokens.access_token);

      if (result.success) {
        addToast(successToast('Success', 'Appointment booked successfully!'));
        setShowBookDialog(false);
        // Reset form
        setBookingForm({
          patientId: '',
          practitionerId: '',
          date: '',
          startTime: '',
          endTime: '',
          description: '',
          type: 'Routine'
        });
        // Refresh appointments list
        await loadAppointments(tokens);
      } else {
        addToast(errorToast('Error', result.error || 'Failed to book appointment'));
      }
    } catch (err) {
      addToast(errorToast('Error', 'Failed to book appointment'));
    } finally {
      setBookingLoading(false);
    }
  };

  const handleRescheduleAppointment = async () => {
    if (!selectedAppointment || !tokens) return;

    setBookingLoading(true);
    setConflicts([]);

    try {
      const startDateTime = `${bookingForm.date}T${bookingForm.startTime}:00`;
      const endDateTime = `${bookingForm.date}T${bookingForm.endTime}:00`;

      // Check for conflicts (excluding current appointment)
      const conflictResult = await checkAppointmentConflicts(
        bookingForm.practitionerId,
        bookingForm.patientId,
        startDateTime,
        endDateTime,
        selectedAppointment.id,
        tokens.access_token
      );

      if (!conflictResult.success) {
        addToast(errorToast('Error', conflictResult.error || 'Failed to check conflicts'));
        return;
      }

      if (conflictResult.hasConflicts) {
        setConflicts(conflictResult.conflicts);
        addToast(errorToast('Conflicts Detected', 'Please resolve conflicts before rescheduling'));
        return;
      }

      // Update appointment data
      const appointmentData = {
        ...selectedAppointment,
        start: startDateTime,
        end: endDateTime,
        description: bookingForm.description
      };

      const result = await updateAppointment(selectedAppointment.id, appointmentData, tokens.access_token);

      if (result.success) {
        addToast(successToast('Success', 'Appointment rescheduled successfully!'));
        setShowRescheduleDialog(false);
        setSelectedAppointment(null);
        // Refresh appointments list
        await loadAppointments(tokens);
      } else {
        addToast(errorToast('Error', result.error || 'Failed to reschedule appointment'));
      }
    } catch (err) {
      addToast(errorToast('Error', 'Failed to reschedule appointment'));
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!tokens) {
      addToast(errorToast('Error', 'No tokens available'));
      return;
    }

    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      const result = await cancelAppointment(appointmentId, tokens.access_token);

      if (result.success) {
        addToast(successToast('Success', 'Appointment cancelled successfully!'));
        // Refresh appointments list
        await loadAppointments(tokens);
      } else {
        addToast(errorToast('Error', result.error || 'Failed to cancel appointment'));
      }
    } catch (err) {
      addToast(errorToast('Error', 'Failed to cancel appointment'));
    }
  };

  const handleRescheduleClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    // Extract patient and practitioner IDs from participants
    const patientParticipant = appointment.participant?.find(p =>
      p.actor.reference?.startsWith('Patient/')
    );
    const practitionerParticipant = appointment.participant?.find(p =>
      p.actor.reference?.startsWith('Practitioner/')
    );

    const patientId = patientParticipant?.actor.reference?.split('/')[1] || '';
    const practitionerId = practitionerParticipant?.actor.reference?.split('/')[1] || '';

    setBookingForm({
      patientId,
      practitionerId,
      date: appointment.start?.split('T')[0] || '',
      startTime: appointment.start?.split('T')[1]?.substring(0, 5) || '',
      endTime: appointment.end?.split('T')[1]?.substring(0, 5) || '',
      description: appointment.description || '',
      type: 'Routine'
    });
    setShowRescheduleDialog(true);
  };

  const handleBookingFormChange = useCallback((field: string, value: string) => {
    setBookingForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  return (
    <div className="font-sans min-h-screen p-4 pb-20 gap-16 sm:p-6 lg:p-8 bg-background text-foreground">
      <main className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <h1 className="text-2xl lg:text-3xl font-bold">Appointment Dashboard</h1>
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
            <Button
              onClick={() => setShowBookDialog(true)}
              size="sm"
              className="whitespace-nowrap"
            >
              Book Appointment
            </Button>
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
                    <SelectItem value="default">Default</SelectItem>
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
                  _sort: 'default'
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

        {/* Book New Appointment Dialog */}
        <Dialog open={showBookDialog} onOpenChange={setShowBookDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
              <DialogDescription>
                Schedule a new appointment with availability checking and conflict detection.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient ID</Label>
                <Input
                  id="patientId"
                  type="text"
                  value={bookingForm.patientId}
                  onChange={(e) => handleBookingFormChange('patientId', e.target.value)}
                  placeholder="Patient/123"
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="practitionerId">Practitioner ID</Label>
                <Input
                  id="practitionerId"
                  type="text"
                  value={bookingForm.practitionerId}
                  onChange={(e) => handleBookingFormChange('practitionerId', e.target.value)}
                  placeholder="Practitioner/456"
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) => handleBookingFormChange('date', e.target.value)}
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Appointment Type</Label>
                <Select value={bookingForm.type} onValueChange={(value) => handleBookingFormChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Routine">Routine</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={bookingForm.startTime}
                  onChange={(e) => handleBookingFormChange('startTime', e.target.value)}
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={bookingForm.endTime}
                  onChange={(e) => handleBookingFormChange('endTime', e.target.value)}
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={bookingForm.description}
                  onChange={(e) => handleBookingFormChange('description', e.target.value)}
                  placeholder="Appointment description"
                  className="bg-background border-border"
                />
              </div>
            </div>

            {conflicts.length > 0 && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <h4 className="text-red-800 font-medium mb-2">Conflicts Detected:</h4>
                <ul className="text-red-700 text-sm">
                  {conflicts.map((conflict, index) => (
                    <li key={index}>• {conflict.message}</li>
                  ))}
                </ul>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                onClick={() => {
                  setShowBookDialog(false);
                  setConflicts([]);
                  setBookingForm({
                    patientId: '',
                    practitionerId: '',
                    date: '',
                    startTime: '',
                    endTime: '',
                    description: '',
                    type: 'Routine'
                  });
                }}
                variant="outline"
                disabled={bookingLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBookAppointment}
                disabled={bookingLoading || !bookingForm.patientId || !bookingForm.practitionerId || !bookingForm.date || !bookingForm.startTime || !bookingForm.endTime}
                className="bg-green-600 hover:bg-green-700"
              >
                {bookingLoading ? 'Booking...' : 'Book Appointment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reschedule Appointment Dialog */}
        <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Reschedule Appointment</DialogTitle>
              <DialogDescription>
                Update the date, time, or details of this appointment.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="reschedule-date">Date</Label>
                <Input
                  id="reschedule-date"
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) => handleBookingFormChange('date', e.target.value)}
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reschedule-startTime">Start Time</Label>
                <Input
                  id="reschedule-startTime"
                  type="time"
                  value={bookingForm.startTime}
                  onChange={(e) => handleBookingFormChange('startTime', e.target.value)}
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reschedule-endTime">End Time</Label>
                <Input
                  id="reschedule-endTime"
                  type="time"
                  value={bookingForm.endTime}
                  onChange={(e) => handleBookingFormChange('endTime', e.target.value)}
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="reschedule-description">Description</Label>
                <Textarea
                  id="reschedule-description"
                  value={bookingForm.description}
                  onChange={(e) => handleBookingFormChange('description', e.target.value)}
                  placeholder="Appointment description"
                  className="bg-background border-border"
                />
              </div>
            </div>

            {conflicts.length > 0 && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <h4 className="text-red-800 font-medium mb-2">Conflicts Detected:</h4>
                <ul className="text-red-700 text-sm">
                  {conflicts.map((conflict, index) => (
                    <li key={index}>• {conflict.message}</li>
                  ))}
                </ul>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                onClick={() => {
                  setShowRescheduleDialog(false);
                  setSelectedAppointment(null);
                  setConflicts([]);
                }}
                variant="outline"
                disabled={bookingLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRescheduleAppointment}
                disabled={bookingLoading || !bookingForm.date || !bookingForm.startTime || !bookingForm.endTime}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {bookingLoading ? 'Rescheduling...' : 'Reschedule Appointment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {appointments.length > 0 && (
          <div className="mt-4">
            <h2 className="text-2xl font-bold mb-6">Appointments ({allAppointments.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                    <div className="mt-4 pt-4 border-t border-border flex gap-2">
                      <Button
                        onClick={() => handleRescheduleClick(appointment)}
                        size="sm"
                        variant="outline"
                        className="flex-1"
                      >
                        Reschedule
                      </Button>
                      <Button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
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