'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  const router = useRouter();

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

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Card className="flex-1 max-w-sm hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/patient')}>
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

            <Card className="flex-1 max-w-sm hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/appointments')}>
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
          </div>
        </div>
      </main>
    </div>
  );
}

