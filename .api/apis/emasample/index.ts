import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core'
import Oas from 'oas';
import APICore from 'api/dist/core';
import definition from './openapi.json';

class SDK {
  spec: Oas;
  core: APICore;

  constructor() {
    this.spec = Oas.init(definition);
    this.core = new APICore(this.spec, 'emasample/3.4.3_FINAL (api/6.1.3)');
  }

  /**
   * Optionally configure various options that the SDK allows.
   *
   * @param config Object of supported SDK options and toggles.
   * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
   * should be represented in milliseconds.
   */
  config(config: ConfigOptions) {
    this.core.setConfig(config);
  }

  /**
   * If the API you're using requires authentication you can supply the required credentials
   * through this method and the library will magically determine how they should be used
   * within your API request.
   *
   * With the exception of OpenID and MutualTLS, it supports all forms of authentication
   * supported by the OpenAPI specification.
   *
   * @example <caption>HTTP Basic auth</caption>
   * sdk.auth('username', 'password');
   *
   * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
   * sdk.auth('myBearerToken');
   *
   * @example <caption>API Keys</caption>
   * sdk.auth('myApiKey');
   *
   * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
   * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
   * @param values Your auth credentials for the API; can specify up to two strings or numbers.
   */
  auth(...values: string[] | number[]) {
    this.core.setAuth(...values);
    return this;
  }

  /**
   * If the API you're using offers alternate server URLs, and server variables, you can tell
   * the SDK which one to use with this method. To use it you can supply either one of the
   * server URLs that are contained within the OpenAPI definition (along with any server
   * variables), or you can pass it a fully qualified URL to use (that may or may not exist
   * within the OpenAPI definition).
   *
   * @example <caption>Server URL with server variables</caption>
   * sdk.server('https://{region}.api.example.com/{basePath}', {
   *   name: 'eu',
   *   basePath: 'v14',
   * });
   *
   * @example <caption>Fully qualified server URL</caption>
   * sdk.server('https://eu.api.example.com/v14');
   *
   * @param url Server URL
   * @param variables An object of variables to replace into the server URL.
   */
  server(url: string, variables = {}) {
    this.core.setServer(url, variables);
  }

  /**
   * Obtain an OAuth2 access token using password grant type.
   *
   * @summary Obtain OAuth2 Token
   */
  postWsOauth2Grant(body: types.PostWsOauth2GrantFormDataParam): Promise<FetchResponse<200, types.PostWsOauth2GrantResponse200>> {
    return this.core.fetch('/ws/oauth2/grant', 'post', body);
  }

  /**
   * server-capabilities: Fetch the server FHIR CapabilityStatement
   *
   */
  getFhirV2Metadata(): Promise<FetchResponse<200, types.GetFhirV2MetadataResponse200>> {
    return this.core.fetch('/fhir/v2/metadata', 'get');
  }

  /**
   * read-instance: Read Patient instance
   *
   */
  getFhirV2PatientId(metadata: types.GetFhirV2PatientIdMetadataParam): Promise<FetchResponse<200, types.GetFhirV2PatientIdResponse200>> {
    return this.core.fetch('/fhir/v2/Patient/{id}', 'get', metadata);
  }

  /**
   * Updates Patient Resource
   *
   */
  putFhirV2PatientId(body: types.PutFhirV2PatientIdBodyParam, metadata: types.PutFhirV2PatientIdMetadataParam): Promise<FetchResponse<200, types.PutFhirV2PatientIdResponse200>> {
    return this.core.fetch('/fhir/v2/Patient/{id}', 'put', body, metadata);
  }

  /**
   * This is a search type
   *
   * @summary search-type: Search for Patient instances
   */
  getFhirV2Patient(metadata?: types.GetFhirV2PatientMetadataParam): Promise<FetchResponse<200, types.GetFhirV2PatientResponse200>> {
    return this.core.fetch('/fhir/v2/Patient', 'get', metadata);
  }

  /**
   * Creates Patient Resource
   *
   */
  postFhirV2Patient(body: types.PostFhirV2PatientBodyParam): Promise<FetchResponse<200, types.PostFhirV2PatientResponse200>> {
    return this.core.fetch('/fhir/v2/Patient', 'post', body);
  }

  /**
   * Retrieve Provider by ID
   *
   */
  getFhirV2PractitionerId(metadata: types.GetFhirV2PractitionerIdMetadataParam): Promise<FetchResponse<200, types.GetFhirV2PractitionerIdResponse200>> {
    return this.core.fetch('/fhir/v2/Practitioner/{id}', 'get', metadata);
  }

  /**
   * This is a search type
   *
   * @summary search-type: Search for Practitioner instances
   */
  getFhirV2Practitioner(metadata?: types.GetFhirV2PractitionerMetadataParam): Promise<FetchResponse<200, types.GetFhirV2PractitionerResponse200>> {
    return this.core.fetch('/fhir/v2/Practitioner', 'get', metadata);
  }

  /**
   * Create Referring Practitioner
   *
   */
  postFhirV2Practitioner(body: types.PostFhirV2PractitionerBodyParam): Promise<FetchResponse<200, types.PostFhirV2PractitionerResponse200>> {
    return this.core.fetch('/fhir/v2/Practitioner', 'post', body);
  }

  /**
   * Get a specific Encounter
   *
   */
  getFhirV2EncounterId(metadata: types.GetFhirV2EncounterIdMetadataParam): Promise<FetchResponse<200, types.GetFhirV2EncounterIdResponse200>> {
    return this.core.fetch('/fhir/v2/Encounter/{id}', 'get', metadata);
  }

  /**
   * Get All Encounters for a Practice
   *
   */
  getFhirV2Encounter(metadata?: types.GetFhirV2EncounterMetadataParam): Promise<FetchResponse<200, types.GetFhirV2EncounterResponse200>> {
    return this.core.fetch('/fhir/v2/Encounter', 'get', metadata);
  }

  /**
   * Retrieve Coverage details for an ID (Note: this is the specific coverage ID, not the
   * Patient ID) In order to get this ID, you’d want to do a Coverage search with the
   * ‘patient=value’ parameter.
   *
   */
  getFhirV2CoverageId(metadata: types.GetFhirV2CoverageIdMetadataParam): Promise<FetchResponse<200, types.GetFhirV2CoverageIdResponse200>> {
    return this.core.fetch('/fhir/v2/Coverage/{id}', 'get', metadata);
  }

  /**
   * Updates Coverage Resource
   *
   */
  putFhirV2CoverageId(body: types.PutFhirV2CoverageIdBodyParam, metadata: types.PutFhirV2CoverageIdMetadataParam): Promise<FetchResponse<200, types.PutFhirV2CoverageIdResponse200>> {
    return this.core.fetch('/fhir/v2/Coverage/{id}', 'put', body, metadata);
  }

  /**
   * Retrieve Coverage resources meeting the specified search criteria
   *
   */
  getFhirV2Coverage(metadata?: types.GetFhirV2CoverageMetadataParam): Promise<FetchResponse<200, types.GetFhirV2CoverageResponse200>> {
    return this.core.fetch('/fhir/v2/Coverage', 'get', metadata);
  }

  /**
   * Creates Coverage Resource
   *
   */
  postFhirV2Coverage(body: types.PostFhirV2CoverageBodyParam): Promise<FetchResponse<200, types.PostFhirV2CoverageResponse200>> {
    return this.core.fetch('/fhir/v2/Coverage', 'post', body);
  }

  /**
   * Retrieve information by ID
   *
   */
  getFhirV2OrganizationId(metadata: types.GetFhirV2OrganizationIdMetadataParam): Promise<FetchResponse<200, types.GetFhirV2OrganizationIdResponse200>> {
    return this.core.fetch('/fhir/v2/Organization/{id}', 'get', metadata);
  }

  /**
   * Search Organization by certain parameters
   *
   */
  getFhirV2Organization(metadata: types.GetFhirV2OrganizationMetadataParam): Promise<FetchResponse<200, types.GetFhirV2OrganizationResponse200>> {
    return this.core.fetch('/fhir/v2/Organization', 'get', metadata);
  }

  /**
   * Create Referring Institution
   *
   */
  postFhirV2Organization(body: types.PostFhirV2OrganizationBodyParam): Promise<FetchResponse<200, types.PostFhirV2OrganizationResponse200>> {
    return this.core.fetch('/fhir/v2/Organization', 'post', body);
  }

  /**
   * Retrieve InsurancePlan by ID
   *
   */
  getFhirV2InsuranceplanId(metadata: types.GetFhirV2InsuranceplanIdMetadataParam): Promise<FetchResponse<200, types.GetFhirV2InsuranceplanIdResponse200>> {
    return this.core.fetch('/fhir/v2/InsurancePlan/{id}', 'get', metadata);
  }

  /**
   * Retrieve all InsurancePlan information for a Firm
   *
   */
  getFhirV2Insuranceplan(metadata?: types.GetFhirV2InsuranceplanMetadataParam): Promise<FetchResponse<200, types.GetFhirV2InsuranceplanResponse200>> {
    return this.core.fetch('/fhir/v2/InsurancePlan', 'get', metadata);
  }

  /**
   * Retrieve Location by ID
   *
   */
  getFhirV2LocationId(metadata: types.GetFhirV2LocationIdMetadataParam): Promise<FetchResponse<200, types.GetFhirV2LocationIdResponse200>> {
    return this.core.fetch('/fhir/v2/Location/{id}', 'get', metadata);
  }

  /**
   * Retrieve List of all locations for that firm
   *
   */
  getFhirV2Location(metadata?: types.GetFhirV2LocationMetadataParam): Promise<FetchResponse<200, types.GetFhirV2LocationResponse200>> {
    return this.core.fetch('/fhir/v2/Location', 'get', metadata);
  }

  /**
   * Retrieve Document by ID
   *
   */
  getFhirV2DocumentreferenceId(metadata: types.GetFhirV2DocumentreferenceIdMetadataParam): Promise<FetchResponse<200, types.GetFhirV2DocumentreferenceIdResponse200>> {
    return this.core.fetch('/fhir/v2/DocumentReference/{id}', 'get', metadata);
  }

  /**
   * Retrieve Document resources meeting the specified search criteria
   *
   */
  getFhirV2Documentreference(metadata: types.GetFhirV2DocumentreferenceMetadataParam): Promise<FetchResponse<200, types.GetFhirV2DocumentreferenceResponse200>> {
    return this.core.fetch('/fhir/v2/DocumentReference', 'get', metadata);
  }

  /**
   * Upload document from S3 URL to EMA
   *
   */
  postFhirV2Documentreference(body: types.PostFhirV2DocumentreferenceBodyParam): Promise<FetchResponse<200, types.PostFhirV2DocumentreferenceResponse200>> {
    return this.core.fetch('/fhir/v2/DocumentReference', 'post', body);
  }

  /**
   * Retrieve details for a specific Appointment by ID
   *
   */
  getFhirV2AppointmentId(metadata: types.GetFhirV2AppointmentIdMetadataParam): Promise<FetchResponse<200, types.GetFhirV2AppointmentIdResponse200>> {
    return this.core.fetch('/fhir/v2/Appointment/{id}', 'get', metadata);
  }

  /**
   * Update an Appointment
   *
   */
  putFhirV2AppointmentId(body: types.PutFhirV2AppointmentIdBodyParam, metadata: types.PutFhirV2AppointmentIdMetadataParam): Promise<FetchResponse<200, types.PutFhirV2AppointmentIdResponse200>> {
    return this.core.fetch('/fhir/v2/Appointment/{id}', 'put', body, metadata);
  }

  /**
   * Retrieve All Appointments for a Practice/Firm
   *
   */
  getFhirV2Appointment(metadata?: types.GetFhirV2AppointmentMetadataParam): Promise<FetchResponse<200, types.GetFhirV2AppointmentResponse200>> {
    return this.core.fetch('/fhir/v2/Appointment', 'get', metadata);
  }

  /**
   * Create an Appointment
   *
   */
  postFhirV2Appointment(body: types.PostFhirV2AppointmentBodyParam): Promise<FetchResponse<200, types.PostFhirV2AppointmentResponse200>> {
    return this.core.fetch('/fhir/v2/Appointment', 'post', body);
  }

  /**
   * Search for a slot
   *
   */
  getFhirV2Slot(metadata: types.GetFhirV2SlotMetadataParam): Promise<FetchResponse<200, types.GetFhirV2SlotResponse200>> {
    return this.core.fetch('/fhir/v2/Slot', 'get', metadata);
  }

  /**
   * Retrieve MedicationStatement details for a Medication Statement ID
   *
   */
  getFhirV2MedicationstatementId(metadata: types.GetFhirV2MedicationstatementIdMetadataParam): Promise<FetchResponse<200, types.GetFhirV2MedicationstatementIdResponse200>> {
    return this.core.fetch('/fhir/v2/MedicationStatement/{id}', 'get', metadata);
  }

  /**
   * Update MedicationStatement resource
   *
   */
  putFhirV2MedicationstatementId(body: types.PutFhirV2MedicationstatementIdBodyParam, metadata: types.PutFhirV2MedicationstatementIdMetadataParam): Promise<FetchResponse<200, types.PutFhirV2MedicationstatementIdResponse200>> {
    return this.core.fetch('/fhir/v2/MedicationStatement/{id}', 'put', body, metadata);
  }

  /**
   * Retrieve MedicationStatement resources by the specified search criteria
   *
   */
  getFhirV2Medicationstatement(metadata?: types.GetFhirV2MedicationstatementMetadataParam): Promise<FetchResponse<200, types.GetFhirV2MedicationstatementResponse200>> {
    return this.core.fetch('/fhir/v2/MedicationStatement', 'get', metadata);
  }

  /**
   * Create MedicationStatement resource
   *
   */
  postFhirV2Medicationstatement(body: types.PostFhirV2MedicationstatementBodyParam): Promise<FetchResponse<200, types.PostFhirV2MedicationstatementResponse200>> {
    return this.core.fetch('/fhir/v2/MedicationStatement', 'post', body);
  }

  /**
   * Retrieve AllergyIntolerance details for an AllergyIntolerance ID
   *
   */
  getFhirV2AllergyintoleranceId(metadata: types.GetFhirV2AllergyintoleranceIdMetadataParam): Promise<FetchResponse<200, types.GetFhirV2AllergyintoleranceIdResponse200>> {
    return this.core.fetch('/fhir/v2/AllergyIntolerance/{id}', 'get', metadata);
  }

  /**
   * Update AllergyIntolerance resource
   *
   */
  putFhirV2AllergyintoleranceId(body: types.PutFhirV2AllergyintoleranceIdBodyParam, metadata: types.PutFhirV2AllergyintoleranceIdMetadataParam): Promise<FetchResponse<200, types.PutFhirV2AllergyintoleranceIdResponse200>> {
    return this.core.fetch('/fhir/v2/AllergyIntolerance/{id}', 'put', body, metadata);
  }

  /**
   * Retrieve AllergyIntolerance resources by the specified search criteria
   *
   */
  getFhirV2Allergyintolerance(metadata?: types.GetFhirV2AllergyintoleranceMetadataParam): Promise<FetchResponse<200, types.GetFhirV2AllergyintoleranceResponse200>> {
    return this.core.fetch('/fhir/v2/AllergyIntolerance', 'get', metadata);
  }

  /**
   * Create AllergyIntolerance resource
   *
   */
  postFhirV2Allergyintolerance(body: types.PostFhirV2AllergyintoleranceBodyParam): Promise<FetchResponse<200, types.PostFhirV2AllergyintoleranceResponse200>> {
    return this.core.fetch('/fhir/v2/AllergyIntolerance', 'post', body);
  }

  /**
   * Retrieve Condition details for an ID
   *
   */
  getFhirV2ConditionId(metadata: types.GetFhirV2ConditionIdMetadataParam): Promise<FetchResponse<200, types.GetFhirV2ConditionIdResponse200>> {
    return this.core.fetch('/fhir/v2/Condition/{id}', 'get', metadata);
  }

  /**
   * Update Condition resource
   *
   */
  putFhirV2ConditionId(body: types.PutFhirV2ConditionIdBodyParam, metadata: types.PutFhirV2ConditionIdMetadataParam): Promise<FetchResponse<200, types.PutFhirV2ConditionIdResponse200>> {
    return this.core.fetch('/fhir/v2/Condition/{id}', 'put', body, metadata);
  }

  /**
   * Retrieve Condition resources by the specified search criteria
   *
   */
  getFhirV2Condition(metadata?: types.GetFhirV2ConditionMetadataParam): Promise<FetchResponse<200, types.GetFhirV2ConditionResponse200>> {
    return this.core.fetch('/fhir/v2/Condition', 'get', metadata);
  }

  /**
   * Create Condition resource
   *
   */
  postFhirV2Condition(body: types.PostFhirV2ConditionBodyParam): Promise<FetchResponse<200, types.PostFhirV2ConditionResponse200>> {
    return this.core.fetch('/fhir/v2/Condition', 'post', body);
  }

  /**
   * Retrieve FamilyMemberHistory details for an ID
   *
   */
  getFhirV2FamilymemberhistoryId(metadata: types.GetFhirV2FamilymemberhistoryIdMetadataParam): Promise<FetchResponse<200, types.GetFhirV2FamilymemberhistoryIdResponse200>> {
    return this.core.fetch('/fhir/v2/FamilyMemberHistory/{id}', 'get', metadata);
  }

  /**
   * Retrieve FamilyMemberHistory resources by the specified search criteria
   *
   */
  getFhirV2Familymemberhistory(metadata?: types.GetFhirV2FamilymemberhistoryMetadataParam): Promise<FetchResponse<200, types.GetFhirV2FamilymemberhistoryResponse200>> {
    return this.core.fetch('/fhir/v2/FamilyMemberHistory', 'get', metadata);
  }

  /**
   * Retrieve ServiceRequest for an ID
   *
   */
  getFhirV2ServicerequestId(metadata: types.GetFhirV2ServicerequestIdMetadataParam): Promise<FetchResponse<200, types.GetFhirV2ServicerequestIdResponse200>> {
    return this.core.fetch('/fhir/v2/ServiceRequest/{id}', 'get', metadata);
  }

  /**
   * Search ServiceRequests by certain parameters
   *
   */
  getFhirV2Servicerequest(metadata?: types.GetFhirV2ServicerequestMetadataParam): Promise<FetchResponse<200, types.GetFhirV2ServicerequestResponse200>> {
    return this.core.fetch('/fhir/v2/ServiceRequest', 'get', metadata);
  }

  /**
   * Retrieve DiagnosticReport for an ID
   *
   */
  getFhirV2DiagnosticreportId(metadata: types.GetFhirV2DiagnosticreportIdMetadataParam): Promise<FetchResponse<200, types.GetFhirV2DiagnosticreportIdResponse200>> {
    return this.core.fetch('/fhir/v2/DiagnosticReport/{id}', 'get', metadata);
  }

  /**
   * Search DiagnosticReport by certain parameters
   *
   */
  getFhirV2Diagnosticreport(metadata?: types.GetFhirV2DiagnosticreportMetadataParam): Promise<FetchResponse<200, types.GetFhirV2DiagnosticreportResponse200>> {
    return this.core.fetch('/fhir/v2/DiagnosticReport', 'get', metadata);
  }

  /**
   * Get a specific ChargeItem
   *
   */
  getFhirV2ChargeitemChgId(metadata: types.GetFhirV2ChargeitemChgIdMetadataParam): Promise<FetchResponse<200, types.GetFhirV2ChargeitemChgIdResponse200>> {
    return this.core.fetch('/fhir/v2/ChargeItem/CHG|{id}', 'get', metadata);
  }

  /**
   * Get a specific inbound Charge for a Practice
   *
   */
  getFhirV2ChargeitemInboundId(metadata: types.GetFhirV2ChargeitemInboundIdMetadataParam): Promise<FetchResponse<200, types.GetFhirV2ChargeitemInboundIdResponse200>> {
    return this.core.fetch('/fhir/v2/ChargeItem/INBOUND|{id}', 'get', metadata);
  }

  /**
   * Get all Inbound Charges for a Practice
   *
   */
  getFhirV2ChargeitemInbound(): Promise<FetchResponse<200, types.GetFhirV2ChargeitemInboundResponse200>> {
    return this.core.fetch('/fhir/v2/ChargeItem/INBOUND', 'get');
  }

  /**
   * Get All ChargeItems for a Practice
   *
   */
  getFhirV2Chargeitem(metadata?: types.GetFhirV2ChargeitemMetadataParam): Promise<FetchResponse<200, types.GetFhirV2ChargeitemResponse200>> {
    return this.core.fetch('/fhir/v2/ChargeItem', 'get', metadata);
  }

  /**
   * Create Charges Into ModMedPM
   *
   */
  postFhirV2Chargeitem(body: types.PostFhirV2ChargeitemBodyParam): Promise<FetchResponse<200, types.PostFhirV2ChargeitemResponse200>> {
    return this.core.fetch('/fhir/v2/ChargeItem', 'post', body);
  }

  /**
   * Search for a patient’s account
   *
   */
  getFhirV2Account(metadata: types.GetFhirV2AccountMetadataParam): Promise<FetchResponse<200, types.GetFhirV2AccountResponse200>> {
    return this.core.fetch('/fhir/v2/Account', 'get', metadata);
  }

  /**
   * Retrieve RelatedPerson for an ID
   *
   */
  getFhirV2RelatedpersonId(metadata: types.GetFhirV2RelatedpersonIdMetadataParam): Promise<FetchResponse<200, types.GetFhirV2RelatedpersonIdResponse200>> {
    return this.core.fetch('/fhir/v2/RelatedPerson/{id}', 'get', metadata);
  }

  /**
   * Retrieve Task for an ID
   *
   */
  getFhirV2TaskId(metadata: types.GetFhirV2TaskIdMetadataParam): Promise<FetchResponse<200, types.GetFhirV2TaskIdResponse200>> {
    return this.core.fetch('/fhir/v2/Task/{id}', 'get', metadata);
  }

  /**
   * Search Tasks by certain parameters
   *
   */
  getFhirV2Task(metadata?: types.GetFhirV2TaskMetadataParam): Promise<FetchResponse<200, types.GetFhirV2TaskResponse200>> {
    return this.core.fetch('/fhir/v2/Task', 'get', metadata);
  }

  /**
   * Create Composition
   *
   */
  postFhirV2Composition(body: types.PostFhirV2CompositionBodyParam): Promise<FetchResponse<200, types.PostFhirV2CompositionResponse200>> {
    return this.core.fetch('/fhir/v2/Composition', 'post', body);
  }
}

const createSDK = (() => { return new SDK(); })()
;

export default createSDK;

export type { GetFhirV2AccountMetadataParam, GetFhirV2AccountResponse200, GetFhirV2AllergyintoleranceIdMetadataParam, GetFhirV2AllergyintoleranceIdResponse200, GetFhirV2AllergyintoleranceMetadataParam, GetFhirV2AllergyintoleranceResponse200, GetFhirV2AppointmentIdMetadataParam, GetFhirV2AppointmentIdResponse200, GetFhirV2AppointmentMetadataParam, GetFhirV2AppointmentResponse200, GetFhirV2ChargeitemChgIdMetadataParam, GetFhirV2ChargeitemChgIdResponse200, GetFhirV2ChargeitemInboundIdMetadataParam, GetFhirV2ChargeitemInboundIdResponse200, GetFhirV2ChargeitemInboundResponse200, GetFhirV2ChargeitemMetadataParam, GetFhirV2ChargeitemResponse200, GetFhirV2ConditionIdMetadataParam, GetFhirV2ConditionIdResponse200, GetFhirV2ConditionMetadataParam, GetFhirV2ConditionResponse200, GetFhirV2CoverageIdMetadataParam, GetFhirV2CoverageIdResponse200, GetFhirV2CoverageMetadataParam, GetFhirV2CoverageResponse200, GetFhirV2DiagnosticreportIdMetadataParam, GetFhirV2DiagnosticreportIdResponse200, GetFhirV2DiagnosticreportMetadataParam, GetFhirV2DiagnosticreportResponse200, GetFhirV2DocumentreferenceIdMetadataParam, GetFhirV2DocumentreferenceIdResponse200, GetFhirV2DocumentreferenceMetadataParam, GetFhirV2DocumentreferenceResponse200, GetFhirV2EncounterIdMetadataParam, GetFhirV2EncounterIdResponse200, GetFhirV2EncounterMetadataParam, GetFhirV2EncounterResponse200, GetFhirV2FamilymemberhistoryIdMetadataParam, GetFhirV2FamilymemberhistoryIdResponse200, GetFhirV2FamilymemberhistoryMetadataParam, GetFhirV2FamilymemberhistoryResponse200, GetFhirV2InsuranceplanIdMetadataParam, GetFhirV2InsuranceplanIdResponse200, GetFhirV2InsuranceplanMetadataParam, GetFhirV2InsuranceplanResponse200, GetFhirV2LocationIdMetadataParam, GetFhirV2LocationIdResponse200, GetFhirV2LocationMetadataParam, GetFhirV2LocationResponse200, GetFhirV2MedicationstatementIdMetadataParam, GetFhirV2MedicationstatementIdResponse200, GetFhirV2MedicationstatementMetadataParam, GetFhirV2MedicationstatementResponse200, GetFhirV2MetadataResponse200, GetFhirV2OrganizationIdMetadataParam, GetFhirV2OrganizationIdResponse200, GetFhirV2OrganizationMetadataParam, GetFhirV2OrganizationResponse200, GetFhirV2PatientIdMetadataParam, GetFhirV2PatientIdResponse200, GetFhirV2PatientMetadataParam, GetFhirV2PatientResponse200, GetFhirV2PractitionerIdMetadataParam, GetFhirV2PractitionerIdResponse200, GetFhirV2PractitionerMetadataParam, GetFhirV2PractitionerResponse200, GetFhirV2RelatedpersonIdMetadataParam, GetFhirV2RelatedpersonIdResponse200, GetFhirV2ServicerequestIdMetadataParam, GetFhirV2ServicerequestIdResponse200, GetFhirV2ServicerequestMetadataParam, GetFhirV2ServicerequestResponse200, GetFhirV2SlotMetadataParam, GetFhirV2SlotResponse200, GetFhirV2TaskIdMetadataParam, GetFhirV2TaskIdResponse200, GetFhirV2TaskMetadataParam, GetFhirV2TaskResponse200, PostFhirV2AllergyintoleranceBodyParam, PostFhirV2AllergyintoleranceResponse200, PostFhirV2AppointmentBodyParam, PostFhirV2AppointmentResponse200, PostFhirV2ChargeitemBodyParam, PostFhirV2ChargeitemResponse200, PostFhirV2CompositionBodyParam, PostFhirV2CompositionResponse200, PostFhirV2ConditionBodyParam, PostFhirV2ConditionResponse200, PostFhirV2CoverageBodyParam, PostFhirV2CoverageResponse200, PostFhirV2DocumentreferenceBodyParam, PostFhirV2DocumentreferenceResponse200, PostFhirV2MedicationstatementBodyParam, PostFhirV2MedicationstatementResponse200, PostFhirV2OrganizationBodyParam, PostFhirV2OrganizationResponse200, PostFhirV2PatientBodyParam, PostFhirV2PatientResponse200, PostFhirV2PractitionerBodyParam, PostFhirV2PractitionerResponse200, PostWsOauth2GrantFormDataParam, PostWsOauth2GrantResponse200, PutFhirV2AllergyintoleranceIdBodyParam, PutFhirV2AllergyintoleranceIdMetadataParam, PutFhirV2AllergyintoleranceIdResponse200, PutFhirV2AppointmentIdBodyParam, PutFhirV2AppointmentIdMetadataParam, PutFhirV2AppointmentIdResponse200, PutFhirV2ConditionIdBodyParam, PutFhirV2ConditionIdMetadataParam, PutFhirV2ConditionIdResponse200, PutFhirV2CoverageIdBodyParam, PutFhirV2CoverageIdMetadataParam, PutFhirV2CoverageIdResponse200, PutFhirV2MedicationstatementIdBodyParam, PutFhirV2MedicationstatementIdMetadataParam, PutFhirV2MedicationstatementIdResponse200, PutFhirV2PatientIdBodyParam, PutFhirV2PatientIdMetadataParam, PutFhirV2PatientIdResponse200 } from './types';
