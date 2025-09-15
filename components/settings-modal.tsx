'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast, successToast, errorToast } from '@/components/toast';
import { Settings, Key, User, Globe } from 'lucide-react';

interface ApiCredentials {
  baseUrl: string;
  firmPrefix: string;
  apiKey: string;
  username: string;
  password: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (credentials: ApiCredentials) => void;
}

const defaultCredentials: ApiCredentials = {
  baseUrl: 'https://stage.ema-api.com/ema-dev/firm',
  firmPrefix: 'entpmsandbox393',
  apiKey: 'f69902ad-c2bc-4b30-aa89-e136d26a04b3',
  username: 'fhir_pmOYS',
  password: 'NmrxdT7I34'
};

export default function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  const { addToast } = useToast();
  const [credentials, setCredentials] = useState<ApiCredentials>(defaultCredentials);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved credentials from localStorage on mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('api_credentials');
    if (savedCredentials) {
      try {
        const parsed = JSON.parse(savedCredentials);
        setCredentials(parsed);
      } catch {
        console.error('Failed to parse saved credentials');
      }
    }
  }, []);

  const handleInputChange = (field: keyof ApiCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    // Validate required fields
    if (!credentials.baseUrl.trim() || !credentials.firmPrefix.trim() ||
        !credentials.apiKey.trim() || !credentials.username.trim() || !credentials.password.trim()) {
      addToast(errorToast('Validation Error', 'All fields are required'));
      return;
    }

    setIsLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem('api_credentials', JSON.stringify(credentials));

      // Call the onSave callback
      onSave(credentials);

      addToast(successToast('Success', 'API credentials saved successfully!'));

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {
      addToast(errorToast('Error', 'Failed to save credentials'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCredentials(defaultCredentials);
    addToast(successToast('Reset', 'Credentials reset to defaults'));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            API Configuration Settings
          </DialogTitle>
          <DialogDescription>
            Configure your Modernizing Medicine API credentials. These settings will be saved locally and used for all API requests.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Base URL */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Base Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="baseUrl" className="text-sm font-medium">
                  Base URL *
                </Label>
                <Input
                  id="baseUrl"
                  type="url"
                  value={credentials.baseUrl}
                  onChange={(e) => handleInputChange('baseUrl', e.target.value)}
                  placeholder="https://stage.ema-api.com/ema-dev/firm"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  The base URL for the Modernizing Medicine API
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="firmPrefix" className="text-sm font-medium">
                  Firm URL Prefix *
                </Label>
                <Input
                  id="firmPrefix"
                  type="text"
                  value={credentials.firmPrefix}
                  onChange={(e) => handleInputChange('firmPrefix', e.target.value)}
                  placeholder="entpmsandbox393"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Your practice&#39;s unique identifier (without leading slash)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* API Key */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="h-4 w-4" />
                API Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-sm font-medium">
                  API Key *
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={credentials.apiKey}
                  onChange={(e) => handleInputChange('apiKey', e.target.value)}
                  placeholder="Your API key"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  The API key provided by Modernizing Medicine
                </p>
              </div>
            </CardContent>
          </Card>

          {/* User Credentials */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                User Credentials
              </CardTitle>
              <CardDescription>
                OAuth 2.0 credentials for API authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username *
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Your username"
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Your password"
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Example Values */}
          <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-blue-900 dark:text-blue-100">
                Example Values
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <div><strong>Base URL:</strong> https://stage.ema-api.com/ema-dev/firm</div>
              <div><strong>Firm Prefix:</strong> entpmsandbox393</div>
              <div><strong>API Key:</strong> f69902ad-c2bc-4b30-aa89-e136d26a04b3</div>
              <div><strong>Username:</strong> fhir_pmOYS</div>
              <div><strong>Password:</strong> NmrxdT7I34</div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
          >
            Reset to Defaults
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}