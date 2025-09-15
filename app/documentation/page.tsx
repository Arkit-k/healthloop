'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// Using simple div-based tabs instead of shadcn tabs component
import { ThemeToggle } from '@/components/theme-toggle';
import { ExternalLink, Code, Database, Zap, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function DocumentationPage() {
  const [activeTab, setActiveTab] = useState('discovery');

  return (
    <div className="font-sans min-h-screen p-4 pb-20 gap-16 sm:p-6 lg:p-8 bg-background text-foreground">
      <main className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">API Documentation</h1>
            <p className="text-muted-foreground text-lg">
              Complete integration guide for HealthLoop EHR API
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline">
              <Link href="/">
                ← Back to Home
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeTab === 'discovery' ? 'default' : 'outline'}
            onClick={() => setActiveTab('discovery')}
            className="flex-1 min-w-0"
          >
            API Discovery
          </Button>
          <Button
            variant={activeTab === 'implementation' ? 'default' : 'outline'}
            onClick={() => setActiveTab('implementation')}
            className="flex-1 min-w-0"
          >
            Implementation Guide
          </Button>
          <Button
            variant={activeTab === 'postman' ? 'default' : 'outline'}
            onClick={() => setActiveTab('postman')}
            className="flex-1 min-w-0"
          >
            Postman Collections
          </Button>
        </div>

        {/* Content Sections */}
        {activeTab === 'discovery' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  API Discovery Document
                </CardTitle>
                <CardDescription>
                  Complete analysis of discovered endpoints, capabilities, and integration architecture
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* FHIR Server Information */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">FHIR Server Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Primary FHIR Server</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Base URL:</span>
                            <code className="bg-muted px-2 py-1 rounded text-xs">https://stage.ema-api.com/ema-dev/firm/apiportal/ema/fhir/v2</code>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Version:</span>
                            <span>FHIR R4</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Authentication:</span>
                            <span>OAuth 2.0 + API Key</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Server Capabilities</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">RESTful API</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">JSON Format</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Search Parameters</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm">GraphQL Support</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Discovered Endpoints */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Discovered Endpoints</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Patient Endpoints */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          Patient Resources
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <code className="text-sm font-mono">GET /Patient</code>
                              <Badge variant="secondary">Active</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Retrieve all patients with search/filtering</p>
                            <div className="mt-2 text-xs text-muted-foreground">
                              <strong>Parameters:</strong> _count, _lastUpdated, active, gender, family, given, birthdate, identifier
                            </div>
                          </div>

                          <div className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <code className="text-sm font-mono">GET /Patient/{'{id}'}</code>
                              <Badge variant="secondary">Active</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Retrieve specific patient by ID</p>
                          </div>

                          <div className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <code className="text-sm font-mono">PUT /Patient/{'{id}'}</code>
                              <Badge variant="secondary">Active</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Update patient information</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Appointment Endpoints */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          Appointment Resources
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <code className="text-sm font-mono">GET /Appointment</code>
                              <Badge variant="secondary">Active</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Retrieve all appointments with filtering</p>
                            <div className="mt-2 text-xs text-muted-foreground">
                              <strong>Parameters:</strong> date, patient, practitioner, status, _count, _sort
                            </div>
                          </div>

                          <div className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <code className="text-sm font-mono">POST /Appointment</code>
                              <Badge variant="secondary">Active</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Create new appointment</p>
                          </div>

                          <div className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <code className="text-sm font-mono">PUT /Appointment/{'{id}'}</code>
                              <Badge variant="secondary">Active</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Update existing appointment</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Billing Endpoints */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          Billing Resources
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <code className="text-sm font-mono">GET /Coverage</code>
                              <Badge variant="secondary">Active</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Retrieve insurance coverage information</p>
                          </div>

                          <div className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <code className="text-sm font-mono">GET /ExplanationOfBenefit</code>
                              <Badge variant="outline">Limited</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Retrieve billing explanations (limited support)</p>
                          </div>

                          <div className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <code className="text-sm font-mono">GET /ChargeItem</code>
                              <Badge variant="outline">Limited</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Retrieve billing codes (limited support)</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Other Endpoints */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          Other Resources
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <code className="text-sm font-mono">GET /PaymentNotice</code>
                              <Badge variant="outline">Limited</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Retrieve payment notifications (limited support)</p>
                          </div>

                          <div className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <code className="text-sm font-mono">GET /Account</code>
                              <Badge variant="destructive">Not Available</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Patient account balances (not supported)</p>
                          </div>

                          <div className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <code className="text-sm font-mono">GET /Claim</code>
                              <Badge variant="outline">Limited</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Insurance claims (limited support)</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Capabilities and Limitations */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Capabilities & Limitations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg text-green-600 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          Capabilities
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>Full CRUD operations for Patient and Appointment resources</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>Advanced search and filtering capabilities</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>OAuth 2.0 authentication with API key support</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>Real-time data synchronization</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>Comprehensive error handling and validation</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg text-orange-600 flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          Limitations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span>Account resource not available (400 Bad Request)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span>Limited support for billing-related resources</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span>No GraphQL support available</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span>Rate limiting may apply (not documented)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span>Some advanced FHIR operations not supported</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Integration Architecture */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Integration Architecture</h3>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Frontend Architecture</h4>
                          <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                            <li>• Next.js 14 with App Router for optimal performance</li>
                            <li>• React Server Components for server-side rendering</li>
                            <li>• Client-side state management with React hooks</li>
                            <li>• Responsive design with Tailwind CSS</li>
                            <li>• TypeScript for type safety and better DX</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">API Integration Strategy</h4>
                          <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                            <li>• Server Actions for secure API calls</li>
                            <li>• Dynamic credential support for production testing</li>
                            <li>• Comprehensive error handling and retry logic</li>
                            <li>• Request/response caching for performance</li>
                            <li>• Fallback mechanisms for unsupported resources</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Data Flow Architecture</h4>
                          <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                            <li>• Unidirectional data flow with React state</li>
                            <li>• Local storage for credential persistence</li>
                            <li>• Optimistic updates for better UX</li>
                            <li>• Real-time synchronization with server state</li>
                            <li>• Pagination for large datasets</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Implementation Guide */}
        {activeTab === 'implementation' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Implementation Guide
                </CardTitle>
                <CardDescription>
                  Detailed guide on how the integration works, including command processing, state management, and performance optimizations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* How Integration Works */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">How the Integration Works</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Authentication Flow</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">1</div>
                            <div>
                              <h4 className="font-medium">OAuth Token Generation</h4>
                              <p className="text-sm text-muted-foreground">Client credentials flow with API key authentication</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">2</div>
                            <div>
                              <h4 className="font-medium">Token Storage</h4>
                              <p className="text-sm text-muted-foreground">Secure localStorage with automatic refresh</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">3</div>
                            <div>
                              <h4 className="font-medium">API Requests</h4>
                              <p className="text-sm text-muted-foreground">Bearer token + x-api-key headers</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Data Processing Pipeline</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">1</div>
                            <div>
                              <h4 className="font-medium">Request Formation</h4>
                              <p className="text-sm text-muted-foreground">Dynamic URL construction with query parameters</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">2</div>
                            <div>
                              <h4 className="font-medium">Response Parsing</h4>
                              <p className="text-sm text-muted-foreground">FHIR Bundle processing and data extraction</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">3</div>
                            <div>
                              <h4 className="font-medium">State Updates</h4>
                              <p className="text-sm text-muted-foreground">React state synchronization with UI updates</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Command Processing Logic */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Command Processing Logic</h3>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Server Actions Architecture</h4>
                          <div className="bg-muted p-4 rounded-lg">
                            <pre className="text-sm overflow-x-auto">
{`'use server'

export async function fetchPatients(accessToken: string, customCredentials?: { baseUrl?: string; apiKey?: string }) {
  // 1. Environment variable validation
  const baseUrl = customCredentials?.baseUrl || process.env.NEXT_PUBLIC_FHIR_BASE_URL;
  const apiKey = customCredentials?.apiKey || process.env.API_KEY;

  // 2. Request construction
  const response = await fetch(\`\${baseUrl}/ema/fhir/v2/Patient\`, {
    method: 'GET',
    headers: {
      'accept': 'application/fhir+json',
      'authorization': \`Bearer \${accessToken}\`,
      'x-api-key': apiKey
    }
  });

  // 3. Response processing
  if (!response.ok) {
    throw new Error(\`Patient fetch failed: \${response.status} \${response.statusText}\`);
  }

  // 4. Data transformation
  const data = await response.json();
  return { success: true, data };
}`}
                            </pre>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Error Handling Strategy</h4>
                          <ul className="space-y-2 text-sm ml-4">
                            <li className="flex items-start gap-2">
                              <Shield className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span><strong>Network Errors:</strong> Automatic retry with exponential backoff</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Shield className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span><strong>Authentication Errors:</strong> Token refresh and re-authentication</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Shield className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span><strong>Validation Errors:</strong> Client-side validation with user feedback</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Shield className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span><strong>Rate Limiting:</strong> Request throttling and queue management</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* State Management */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">State Management Approach</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Client State Management</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm">React Hooks Strategy</h4>
                            <ul className="text-xs text-muted-foreground space-y-1 mt-1">
                              <li>• useState for component-level state</li>
                              <li>• useEffect for side effects and data fetching</li>
                              <li>• useCallback for memoized event handlers</li>
                              <li>• useMemo for expensive computations</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Data Flow Pattern</h4>
                            <ul className="text-xs text-muted-foreground space-y-1 mt-1">
                              <li>• Unidirectional data flow</li>
                              <li>• Props drilling for shared state</li>
                              <li>• Context API for global state</li>
                              <li>• Local storage for persistence</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Server State Management</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm">API State Handling</h4>
                            <ul className="text-xs text-muted-foreground space-y-1 mt-1">
                              <li>• Server Actions for secure API calls</li>
                              <li>• Request deduplication</li>
                              <li>• Response caching strategies</li>
                              <li>• Background synchronization</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Error Boundaries</h4>
                            <ul className="text-xs text-muted-foreground space-y-1 mt-1">
                              <li>• Component-level error isolation</li>
                              <li>• Graceful degradation</li>
                              <li>• Error reporting and logging</li>
                              <li>• User-friendly error messages</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Performance Optimizations */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Performance Optimizations</h3>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                          <h4 className="font-semibold mb-1">Caching Strategy</h4>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            <li>• Response caching</li>
                            <li>• Request deduplication</li>
                            <li>• Local storage persistence</li>
                            <li>• Background sync</li>
                          </ul>
                        </div>

                        <div className="text-center">
                          <Zap className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                          <h4 className="font-semibold mb-1">Lazy Loading</h4>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            <li>• Code splitting</li>
                            <li>• Component lazy loading</li>
                            <li>• Image optimization</li>
                            <li>• Bundle analysis</li>
                          </ul>
                        </div>

                        <div className="text-center">
                          <Zap className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <h4 className="font-semibold mb-1">Optimization Techniques</h4>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            <li>• Memoization</li>
                            <li>• Virtual scrolling</li>
                            <li>• Debounced search</li>
                            <li>• Pagination</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Postman Collections */}
        {activeTab === 'postman' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Postman Collections
                </CardTitle>
                <CardDescription>
                  Complete API collections with example requests, responses, and error scenarios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Collection Overview */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Collection Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Patient APIs</CardTitle>
                        <Badge variant="secondary">12 requests</Badge>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-sm space-y-1">
                          <li>• Get all patients</li>
                          <li>• Get patient by ID</li>
                          <li>• Search patients</li>
                          <li>• Update patient</li>
                          <li>• Error scenarios</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Appointment APIs</CardTitle>
                        <Badge variant="secondary">15 requests</Badge>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-sm space-y-1">
                          <li>• Get all appointments</li>
                          <li>• Create appointment</li>
                          <li>• Update appointment</li>
                          <li>• Cancel appointment</li>
                          <li>• Conflict detection</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Billing APIs</CardTitle>
                        <Badge variant="secondary">10 requests</Badge>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-sm space-y-1">
                          <li>• Insurance coverage</li>
                          <li>• Eligibility checks</li>
                          <li>• Billing reports</li>
                          <li>• Payment history</li>
                          <li>• Error handling</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Authentication Setup */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Authentication Setup</h3>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Environment Variables</h4>
                          <div className="bg-muted p-4 rounded-lg">
                            <pre className="text-sm text-foreground">
{`{
  "baseUrl": "https://stage.ema-api.com/ema-dev/firm/apiportal/ema/fhir/v2",
  "apiKey": "your-api-key-here",
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret"
}`}
                            </pre>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Authorization Headers</h4>
                          <div className="bg-muted p-4 rounded-lg">
                            <pre className="text-sm text-foreground">
{`Headers:
Authorization: Bearer {{access_token}}
x-api-key: {{api_key}}
Content-Type: application/fhir+json
Accept: application/fhir+json`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sample Requests */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Sample API Requests</h3>
                  <div className="space-y-4">
                    {/* Patient Request */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Get All Patients</CardTitle>
                        <Badge variant="secondary">GET</Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm">Request URL</h4>
                            <code className="block bg-muted p-2 rounded text-sm">
                              {'{{baseUrl}}'}/Patient?_count=10
                            </code>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Success Response (200)</h4>
                            <div className="bg-primary/10 border border-primary/20 p-3 rounded">
                              <pre className="text-xs overflow-x-auto text-foreground">
{`{
  "resourceType": "Bundle",
  "type": "searchset",
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "id": "12345",
        "name": [{"family": "Doe", "given": ["John"]}],
        "birthDate": "1980-01-01",
        "gender": "male"
      }
    }
  ]
}`}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Appointment Request */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Create Appointment</CardTitle>
                        <Badge variant="default">POST</Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm">Request URL</h4>
                            <code className="block bg-muted p-2 rounded text-sm">
                              {'{{baseUrl}}'}/Appointment
                            </code>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Request Body</h4>
                            <div className="bg-muted p-3 rounded">
                              <pre className="text-xs overflow-x-auto text-foreground">
{`{
  "resourceType": "Appointment",
  "status": "booked",
  "description": "Regular checkup",
  "start": "2024-01-15T10:00:00Z",
  "end": "2024-01-15T11:00:00Z",
  "participant": [
    {
      "actor": {"reference": "Patient/12345"},
      "status": "accepted"
    },
    {
      "actor": {"reference": "Practitioner/67890"},
      "status": "accepted"
    }
  ]
}`}
                              </pre>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Success Response (201)</h4>
                            <div className="bg-primary/10 border border-primary/20 p-3 rounded">
                              <pre className="text-xs overflow-x-auto text-foreground">
{`{
  "resourceType": "Appointment",
  "id": "appt-123",
  "status": "booked",
  "description": "Regular checkup",
  "start": "2024-01-15T10:00:00Z",
  "end": "2024-01-15T11:00:00Z"
}`}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Error Scenarios */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Error Scenarios</CardTitle>
                        <Badge variant="destructive">Error Handling</Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-sm text-red-600">401 Unauthorized</h4>
                            <div className="bg-destructive/10 border border-destructive/20 p-3 rounded">
                              <pre className="text-xs overflow-x-auto text-foreground">
{`{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "security",
      "details": {
        "text": "Authentication failed"
      }
    }
  ]
}`}
                              </pre>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-sm text-orange-600">400 Bad Request</h4>
                            <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded">
                              <pre className="text-xs overflow-x-auto text-foreground">
{`{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "invalid",
      "details": {
        "text": "Invalid resource type or parameters"
      }
    }
  ]
}`}
                              </pre>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-sm text-blue-600">404 Not Found</h4>
                            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded">
                              <pre className="text-xs overflow-x-auto text-foreground">
{`{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "not-found",
      "details": {
        "text": "Resource not found"
      }
    }
  ]
}`}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Download Section */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Download Collections</h3>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <Button variant="outline" className="w-full">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Patient APIs
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">12 requests • v2.1</p>
                        </div>

                        <div className="text-center">
                          <Button variant="outline" className="w-full">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Appointment APIs
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">15 requests • v2.1</p>
                        </div>

                        <div className="text-center">
                          <Button variant="outline" className="w-full">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Billing APIs
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">10 requests • v2.1</p>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2">Import Instructions</h4>
                        <ol className="text-sm space-y-1 text-muted-foreground ml-4">
                          <li>1. Download the collection files above</li>
                          <li>2. Open Postman and click &quot;Import&quot;</li>
                          <li>3. Select the downloaded JSON files</li>
                          <li>4. Set up environment variables</li>
                          <li>5. Configure authentication headers</li>
                          <li>6. Start testing the APIs</li>
                        </ol>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}