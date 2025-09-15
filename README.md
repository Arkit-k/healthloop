# MedMok - Healthcare Management Platform

A comprehensive healthcare management platform built with Next.js, providing patient management, appointment scheduling, and billing & administrative features.

## Features

### 🏥 Patient Management
- View and search patient records
- Patient demographics and contact information
- Patient history and details

### 📅 Appointment Management
- Schedule and manage appointments
- Conflict detection and resolution
- Appointment status tracking
- Reschedule and cancel appointments

### 💰 Billing & Administrative
- **Insurance Eligibility Checking**: Verify patient insurance coverage and eligibility status
- **Reports & Analytics**: Generate comprehensive billing reports

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
# or
yarn install
yarn dev
# or
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Dashboard Access

### Main Navigation
The application provides four main dashboards accessible from the home page:

1. **Patient Dashboard** - `/dashboard/patient`
2. **Appointments Dashboard** - `/dashboard/appointments`
3. **Billing & Administrative Dashboard** - `/dashboard/billing`
4. **Medication Statements Dashboard** - `/dashboard/medications`

### Billing Features Documentation

#### 🔍 Insurance Eligibility Checking
- **Location**: Billing Dashboard → "Check Eligibility" button
- **Functionality**: Verify patient insurance coverage by entering Patient ID
- **Supported Resources**: Coverage, ExplanationOfBenefit
- **Output**: Eligibility status and coverage details

#### 📊 Reports & Analytics
- **Location**: Billing Dashboard → "Generate Report" button
- **Functionality**: Create comprehensive billing reports
- **Features**:
  - Combined data from accounts, charges, and payments
  - Timestamped reports
  - Export-ready format

#### 📈 Reports & Analytics
- **Location**: Billing Dashboard → "Generate Report" button
- **Functionality**: Create comprehensive billing reports
- **Features**:
  - Combined data from accounts, charges, and payments
  - Timestamped reports
  - Export-ready format

## Technical Architecture

### Server Actions
- **Patient Actions**: `app/actions/patientActions.ts`
- **Appointment Actions**: `app/actions/appointmentActions.ts`
- **Billing Actions**: `app/actions/billingActions.ts`
- **Medication Actions**: `app/actions/medicationActions.ts`
- **Token Management**: `app/actions/tokenActions.ts`

### FHIR Integration
The application integrates with FHIR servers for healthcare data:
- **Base URL**: Configured via `NEXT_PUBLIC_FHIR_BASE_URL`
- **Authentication**: OAuth2 token-based authentication
- **Supported Resources**:
  - Patient, Appointment, Coverage
  - Account, ExplanationOfBenefit, Claim
  - ChargeItem, PaymentNotice

### Error Handling
- Graceful fallback for unsupported FHIR resources
- User-friendly error messages
- Automatic retry mechanisms

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Deployment Prerequisites

Before deploying to Vercel, ensure the following:

1. **Fix ESLint Errors**: The build will fail if there are unescaped quotes in JSX. Check `app/documentation/page.tsx` line 979.

2. **🔒 CRITICAL: Environment Variables Security**:
   - **DO NOT** deploy with secrets in `.env` - this is a major security risk
   - Move ALL sensitive credentials to Vercel's environment variables dashboard:
     - `OAUTH_USERNAME`
     - `OAUTH_PASSWORD`
     - `API_KEY`
     - `FHIR_PATIENT_ENDPOINT`
     - `FHIR_OAUTH_ENDPOINT`
   - Keep only `NEXT_PUBLIC_*` variables in `.env` for local development
   - Ensure `.env` is in `.gitignore` to prevent accidental commits

3. **Lockfile Cleanup**: Remove duplicate lockfiles. Keep `package-lock.json` and remove `bun.lockb` if present.

4. **Local File Dependencies**: Ensure the `.api` directory is included in your repository or publish the `@api/emasample` package to npm.

### Potential Deployment Issues

#### Build Errors
- **ESLint Errors**: Unescaped quotes in JSX will prevent deployment
- **Multiple Lockfiles**: Can cause package manager conflicts
- **Missing Dependencies**: Local file dependencies may not be included

#### Runtime Issues
- **Server Action Timeouts**: External API calls may exceed Vercel's 10s limit
- **Environment Variables**: Missing or incorrect environment variables
- **Network Errors**: FHIR API connectivity issues

#### Configuration
- **Next.js Config**: Consider adding `output: 'standalone'` for better compatibility
- **Build Settings**: Ensure Node.js version matches your local environment

### Troubleshooting

If deployment fails:

1. Run `npm run build` locally to identify build errors
2. Check Vercel build logs for specific error messages
3. Verify all environment variables are set in Vercel dashboard
4. Ensure `.env` is not committed to repository (add to `.gitignore`)
5. Test API endpoints locally before deployment
