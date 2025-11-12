// User roles
export enum UserRole {
  ADMIN = 'ADMIN',
  OWNER = 'OWNER'
}

// Walk status
export enum WalkStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// User types
export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: Date;
}

export interface UserWithPassword extends User {
  password: string;
}

// Dog types
export interface Dog {
  id: string;
  name: string;
  breed?: string;
  age?: number;
  weight?: number;
  ownerId: string;
  owner?: User;
  medicalNotes?: string;
  emergencyContact?: string;
  photoUrl?: string;
  createdAt: Date;
}

// Invitation types
export interface Invitation {
  id: string;
  email: string;
  token: string;
  createdById: string;
  createdBy?: User;
  usedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
}

// Walk types
export interface Walk {
  id: string;
  date: string;
  startTime?: Date;
  endTime?: Date;
  status: WalkStatus;
  adminId: string;
  admin?: User;
  notes?: string;
  createdAt: Date;
  attendances?: Attendance[];
  dogs?: Dog[];
}

// Attendance types
export interface Attendance {
  id: string;
  walkId: string;
  walk?: Walk;
  dogId: string;
  dog?: Dog;
  attended: boolean;
  duration?: number; // in minutes
  createdAt: Date;
}

// Rate types
export interface Rate {
  id: string;
  dogId: string;
  dog?: Dog;
  hourlyRate: number;
  effectiveFrom: Date;
  createdAt: Date;
}

// API Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  token: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
}

export interface CreateInvitationRequest {
  email: string;
}

export interface CreateDogRequest {
  name: string;
  breed?: string;
  age?: number;
  weight?: number;
  ownerId: string;
  medicalNotes?: string;
  emergencyContact?: string;
  photoUrl?: string;
}

export interface UpdateDogRequest extends Partial<CreateDogRequest> {
  id: string;
}

export interface CreateWalkRequest {
  date: string;
  dogIds: string[];
  notes?: string;
}

export interface UpdateWalkRequest {
  id: string;
  date?: string;
  dogIds?: string[];
  notes?: string;
  status?: WalkStatus;
  startTime?: Date;
  endTime?: Date;
}

export interface UpdateAttendanceRequest {
  walkId: string;
  dogId: string;
  attended: boolean;
}

export interface CreateRateRequest {
  dogId: string;
  hourlyRate: number;
  effectiveFrom: Date;
}

export interface BillingRecord {
  dogId: string;
  dogName: string;
  ownerName: string;
  date: string;
  duration: number;
  hourlyRate: number;
  amount: number;
}

export interface BillingReportRequest {
  startDate: string;
  endDate: string;
  dogId?: string;
  ownerId?: string;
}

