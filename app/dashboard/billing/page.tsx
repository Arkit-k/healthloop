'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { generateTokens } from '../../actions/tokenActions';
import {
  fetchInsuranceCoverage,
  checkInsuranceEligibility,
  searchBilling,
  generateBillingReport
} from '../../actions/billingActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { useToast, successToast, errorToast } from '@/components/toast';
import { Pagination } from '@/components/ui/pagination';
import { ChevronDown, ChevronRight, Settings } from 'lucide-react';

interface TokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

interface Coverage {
  id: string;
  status: string;
  beneficiary?: {
    reference: string;
  };
  payor?: Array<{
    reference: string;
    display?: string;
  }>;
  class?: Array<{
    type: {
      coding: Array<{
        code: string;
        display: string;
      }>;
    };
    value: string;
  }>;
}

interface BundleEntry {
  resource: Coverage;
}

interface Bundle {
  entry?: BundleEntry[];
}

export default function BillingDashboard() {
  const { addToast } = useToast();
  const router = useRouter();
  const [tokens, setTokens] = useState<TokenData | null>(null);
  const [coverages, setCoverages] = useState<Coverage[]>([]);
  const [allCoverages, setAllCoverages] = useState<Coverage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEligibilityDialog, setShowEligibilityDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [currentView, setCurrentView] = useState<'coverage'>('coverage');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Search parameters state
  const [searchParams, setSearchParams] = useState({
    patient: '',
    date: '',
    status: 'any',
    _count: '',
    _sort: 'default'
  });

  // Eligibility check state
  const [eligibilityPatientId, setEligibilityPatientId] = useState('');
  const [eligibilityResult, setEligibilityResult] = useState<Bundle | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  // Report state
  const [reportData, setReportData] = useState<{
    accounts: Bundle;
    charges: Bundle;
    payments: Bundle;
    generatedAt: string;
  } | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Credentials state for production API testing
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState({
    baseUrl: '',
    apiKey: '',
    useProduction: false
  });

  const loadInsuranceCoverage = async (tokenData: TokenData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchInsuranceCoverage(tokenData.access_token);
      if (result.success && result.data) {
        const bundle = result.data as Bundle;
        const allCoverageData = bundle.entry?.map((e) => e.resource) || [];
        setAllCoverages(allCoverageData);
        setCurrentPage(1);
        updatePaginatedCoverages(allCoverageData, 1);
      } else if (!result.success && result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch insurance coverage');
    } finally {
      setLoading(false);
    }
  };

  const updatePaginatedCoverages = (coverageList: Coverage[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCoverages(coverageList.slice(startIndex, endIndex));
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    updatePaginatedCoverages(allCoverages, page);
  }, [allCoverages]);

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
        // Automatically fetch coverage data after token generation
        await loadInsuranceCoverage(tokenData);
      } else if (!result.success && result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckEligibility = async () => {
    if (!tokens || !eligibilityPatientId.trim()) {
      addToast(errorToast('Error', 'Please enter a patient ID'));
      return;
    }

    setCheckingEligibility(true);
    setEligibilityResult(null);

    try {
      const result = await checkInsuranceEligibility(eligibilityPatientId, tokens.access_token);
      if (result.success && result.data) {
        setEligibilityResult(result.data);
        addToast(successToast('Success', 'Eligibility check completed'));
      } else {
        addToast(errorToast('Error', result.error || 'Failed to check eligibility'));
      }
    } catch (err) {
      addToast(errorToast('Error', 'Failed to check eligibility'));
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!tokens) {
      addToast(errorToast('Error', 'No tokens available'));
      return;
    }

    setGeneratingReport(true);
    setReportData(null);

    try {
      const result = await generateBillingReport(tokens.access_token);
      if (result.success && result.data) {
        setReportData(result.data);
        addToast(successToast('Success', 'Report generated successfully'));
      } else {
        addToast(errorToast('Error', result.error || 'Failed to generate report'));
      }
    } catch (err) {
      addToast(errorToast('Error', 'Failed to generate report'));
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleViewChange = (view: 'coverage') => {
    setCurrentView(view);
    setCurrentPage(1);
    if (view === 'coverage' && allCoverages.length === 0 && tokens) {
      loadInsuranceCoverage(tokens);
    }
  };

  useEffect(() => {
    // Try to load tokens from localStorage and automatically fetch data
    const savedTokens = localStorage.getItem('oauth_tokens');
    if (savedTokens) {
      try {
        const tokenData = JSON.parse(savedTokens);
        setTokens(tokenData);
        // Automatically fetch coverage data when tokens are loaded
        loadInsuranceCoverage(tokenData);
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

  useEffect(() => {
    // Load saved credentials from localStorage
    const savedCredentials = localStorage.getItem('dashboard_credentials');
    if (savedCredentials) {
      try {
        const parsedCredentials = JSON.parse(savedCredentials);
        setCredentials(parsedCredentials);
      } catch (err) {
        console.error('Failed to parse saved credentials');
      }
    }
  }, []);

  useEffect(() => {
    // Save credentials to localStorage when they change
    localStorage.setItem('dashboard_credentials', JSON.stringify(credentials));
  }, [credentials]);

  const totalPages = useMemo(() => {
    return Math.ceil(allCoverages.length / itemsPerPage);
  }, [allCoverages.length, itemsPerPage]);

  const formatCurrency = useCallback((value?: number, currency?: string) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(value);
  }, []);


  return (
    <div className="font-sans min-h-screen p-4 pb-20 gap-16 sm:p-6 lg:p-8 bg-background text-foreground">
      <main className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <h1 className="text-2xl lg:text-3xl font-bold">Billing & Administrative Dashboard</h1>
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
              onClick={() => setShowEligibilityDialog(true)}
              size="sm"
              className="whitespace-nowrap"
            >
              Check Eligibility
            </Button>
            <Button
              onClick={() => setShowReportDialog(true)}
              variant="outline"
              size="sm"
              className="whitespace-nowrap"
            >
              Generate Report
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Production Credentials Section */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto"
              onClick={() => setShowCredentials(!showCredentials)}
            >
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="font-medium">Production API Credentials</span>
                <span className="text-sm text-muted-foreground">(For testing official APIs)</span>
              </div>
              {showCredentials ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            {showCredentials && (
              <div className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="baseUrl">Base URL</Label>
                    <Input
                      id="baseUrl"
                      type="url"
                      value={credentials.baseUrl}
                      onChange={(e) => setCredentials(prev => ({ ...prev, baseUrl: e.target.value }))}
                      placeholder="https://api.example.com/fhir/v2"
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={credentials.apiKey}
                      onChange={(e) => setCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="Your API key"
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="flex items-center space-x-2 md:col-span-2">
                    <input
                      type="checkbox"
                      id="useProduction"
                      checked={credentials.useProduction}
                      onChange={(e) => setCredentials(prev => ({ ...prev, useProduction: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="useProduction" className="text-sm">
                      Use production credentials for API calls
                    </Label>
                  </div>
                </div>
                {credentials.useProduction && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Production mode enabled. API calls will use the credentials above instead of environment variables.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardHeader>
        </Card>

        <div className="mb-4 space-y-4">
          {!tokens && (
            <button
              onClick={handleGenerateAndFetch}
              disabled={loading}
              className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 text-lg"
            >
              {loading ? 'Authenticating...' : 'Authenticate & Load Billing Data'}
            </button>
          )}

          {tokens && (
            <div className="flex gap-2 mb-4">
              <Button
                onClick={() => handleViewChange('coverage')}
                variant={currentView === 'coverage' ? 'default' : 'outline'}
                size="sm"
              >
                Insurance Coverage
              </Button>
            </div>
          )}

          {error && <p className="text-red-500 mt-4">Error: {error}</p>}
        </div>

        {/* Insurance Eligibility Check Dialog */}
        <Dialog open={showEligibilityDialog} onOpenChange={setShowEligibilityDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Check Insurance Eligibility</DialogTitle>
              <DialogDescription>
                Verify patient insurance coverage and eligibility status.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="eligibility-patient-id">Patient ID</Label>
                <Input
                  id="eligibility-patient-id"
                  type="text"
                  value={eligibilityPatientId}
                  onChange={(e) => setEligibilityPatientId(e.target.value)}
                  placeholder="Patient/123"
                  className="bg-background border-border w-full"
                />
              </div>
            </div>

            {eligibilityResult && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <h4 className="text-green-800 font-medium mb-2">Eligibility Results:</h4>
                <pre className="text-green-700 text-sm whitespace-pre-wrap">
                  {JSON.stringify(eligibilityResult, null, 2)}
                </pre>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                onClick={() => {
                  setShowEligibilityDialog(false);
                  setEligibilityResult(null);
                  setEligibilityPatientId('');
                }}
                variant="outline"
              >
                Close
              </Button>
              <Button
                onClick={handleCheckEligibility}
                disabled={checkingEligibility || !eligibilityPatientId.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {checkingEligibility ? 'Checking...' : 'Check Eligibility'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>



        {/* Generate Report Dialog */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Generate Billing Report</DialogTitle>
              <DialogDescription>
                Generate comprehensive billing reports and analytics.
              </DialogDescription>
            </DialogHeader>

            {reportData && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="text-blue-800 font-medium mb-2">Report Generated:</h4>
                <div className="text-blue-700 text-sm space-y-2">
                  <p><strong>Accounts:</strong> {reportData.accounts?.entry?.length || 0} records</p>
                  <p><strong>Charges:</strong> {reportData.charges?.entry?.length || 0} records</p>
                  <p><strong>Payments:</strong> {reportData.payments?.entry?.length || 0} records</p>
                  <p><strong>Generated At:</strong> {new Date(reportData.generatedAt).toLocaleString()}</p>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                onClick={() => {
                  setShowReportDialog(false);
                  setReportData(null);
                }}
                variant="outline"
              >
                Close
              </Button>
              <Button
                onClick={handleGenerateReport}
                disabled={generatingReport}
                className="bg-green-600 hover:bg-green-700"
              >
                {generatingReport ? 'Generating...' : 'Generate Report'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Main Content Display */}
        {currentView === 'coverage' && coverages.length > 0 && (
          <div className="mt-4">
            <h2 className="text-2xl font-bold mb-6">Insurance Coverage ({allCoverages.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {coverages.map((coverage) => (
                <Card key={coverage.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">Coverage {coverage.id}</CardTitle>
                    <CardDescription>
                      Status: <span className="capitalize font-medium">{coverage.status}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-muted-foreground flex-shrink-0 mr-2">Beneficiary:</span>
                        <span className="text-muted-foreground truncate text-right flex-1 min-w-0">
                          {coverage.beneficiary?.reference || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-muted-foreground flex-shrink-0 mr-2">Payor:</span>
                        <span className="text-muted-foreground truncate text-right flex-1 min-w-0">
                          {coverage.payor?.[0]?.display || coverage.payor?.[0]?.reference || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-muted-foreground flex-shrink-0 mr-2">Plan:</span>
                        <span className="text-muted-foreground truncate text-right flex-1 min-w-0">
                          {coverage.class?.[0]?.value || 'N/A'}
                        </span>
                      </div>
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


        {(currentView === 'coverage' && coverages.length === 0 && !loading && tokens) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No insurance coverage data found.</p>
          </div>
        )}

      </main>
    </div>
  );
}