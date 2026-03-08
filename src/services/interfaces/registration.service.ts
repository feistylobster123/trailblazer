// Registration service interface

export type RegistrationStep = 'personal_info' | 'emergency_contact' | 'medical' | 'waivers' | 'drop_bags' | 'crew' | 'payment' | 'confirmation';
export type RegistrationStatus = 'draft' | 'pending_payment' | 'confirmed' | 'waitlisted' | 'cancelled' | 'transferred';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface MedicalInfo {
  bloodType?: string;
  allergies?: string;
  medications?: string;
  medicalConditions?: string;
  physicianName?: string;
  physicianPhone?: string;
}

export interface Waiver {
  id: string;
  title: string;
  version: string;
  content: string;
  required: boolean;
  signedAt?: string;
}

export interface DropBagLocation {
  id: string;
  aidStationId: string;
  aidStationName: string;
  distanceMi: number;
  bagLimit: number;
  weightLimitLb?: number;
  notes?: string;
}

export interface DropBagSelection {
  aidStationId: string;
  bagCount: number;
  notes?: string;
}

export interface CrewAccess {
  crewCount: number;
  vehiclePlate?: string;
  crewMembers: Array<{ name: string; phone: string }>;
}

export interface RegistrationStepData {
  personalInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact?: EmergencyContact;
  medical?: MedicalInfo;
  waivers?: Record<string, boolean>; // waiverId -> signed
  dropBags?: DropBagSelection[];
  crew?: CrewAccess;
}

export interface Registration {
  id: string;
  raceId: string;
  editionId: string;
  runnerId: string;
  status: RegistrationStatus;
  currentStep: RegistrationStep;
  completedSteps: RegistrationStep[];
  data: RegistrationStepData;
  confirmationCode?: string;
  entryFee: number;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationSummary {
  id: string;
  raceId: string;
  raceName: string;
  editionId: string;
  editionYear: number;
  startDate: string;
  status: RegistrationStatus;
  confirmationCode?: string;
  bibNumber?: string;
  createdAt: string;
}

export interface IRegistrationService {
  startRegistration(raceId: string, editionId: string): Promise<Registration>;
  saveStep(registrationId: string, step: RegistrationStep, data: RegistrationStepData): Promise<Registration>;
  getRegistration(registrationId: string): Promise<Registration>;
  submitRegistration(registrationId: string): Promise<Registration>;
  getWaivers(raceId: string, editionId: string): Promise<Waiver[]>;
  getDropBagOptions(raceId: string, editionId: string): Promise<DropBagLocation[]>;
  getMyRegistrations(): Promise<RegistrationSummary[]>;
}
