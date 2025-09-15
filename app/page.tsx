'use client';

import { useState, Suspense, lazy } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';

// Lazy load dashboard components for code splitting
const PatientDashboard = lazy(() => import('./dashboard/patient/page'));
const AppointmentsDashboard = lazy(() => import('./dashboard/appointments/page'));
const BillingDashboard = lazy(() => import('./dashboard/billing/page'));
const DocumentationPage = lazy(() => import('./documentation/page'));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export default function Home() {
  const [currentView, setCurrentView] = useState<'home' | 'patients' | 'appointments' | 'billing' | 'documentation'>('home');

  // Render different views based on currentView state
  if (currentView === 'patients') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <PatientDashboard />
      </Suspense>
    );
  }

  if (currentView === 'appointments') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AppointmentsDashboard />
      </Suspense>
    );
  }

  if (currentView === 'billing') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <BillingDashboard />
      </Suspense>
    );
  }

  if (currentView === 'documentation') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <DocumentationPage />
      </Suspense>
    );
  }



  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <header className="row-start-1 flex justify-end w-full max-w-4xl">
        <ThemeToggle />
      </header>
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-center space-y-8">
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to HealthBlob
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Your comprehensive healthcare management platform for patients and appointments.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <Card className="flex-1 max-w-sm hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView('patients')}>
              <CardHeader>
                <CardTitle className="text-xl">Patient Dashboard</CardTitle>
                <CardDescription>
                  Manage patient records, view details, and search through patient information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg">
                  Access Patients
                </Button>
              </CardContent>
            </Card>

            <Card className="flex-1 max-w-sm hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView('appointments')}>
              <CardHeader>
                <CardTitle className="text-xl">Appointments Dashboard</CardTitle>
                <CardDescription>
                  Book, reschedule, and manage appointments with conflict detection.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" size="lg">
                  Manage Appointments
                </Button>
              </CardContent>
            </Card>

            <Card className="flex-1 max-w-sm hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView('billing')}>
              <CardHeader>
                <CardTitle className="text-xl">Billing & Administrative</CardTitle>
                <CardDescription>
                  Check insurance eligibility and generate reports.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" size="lg">
                  Access Billing
                </Button>
              </CardContent>
            </Card>

            <Card className="flex-1 max-w-sm hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView('documentation')}>
              <CardHeader>
                <CardTitle className="text-xl">API Documentation</CardTitle>
                <CardDescription>
                  Complete integration guide, API discovery, and Postman collections.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" size="lg">
                  View Documentation
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}

