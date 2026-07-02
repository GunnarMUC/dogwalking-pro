export enum UserRole {
  ADMIN = 'ADMIN',
  OWNER = 'OWNER'
}

export enum WalkStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

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

export interface DogFilter {
  ownerId?: string;
  breed?: string;
  searchText?: string;
}

// Walker Profile types
export interface WalkerProfile {
  id: string;
  userId: string;
  user?: User;
  bio: string;
  experienceYears: number;
  hourlyRate: number;
  serviceAreas: string[];
  availability?: string[];
  isAvailable: boolean;
  certifications?: string[];
  averageRating: number;
  totalWalks: number;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalkerProfileFormData {
  bio: string;
  experienceYears: number;
  hourlyRate: number;
  serviceAreas: string[];
  availability?: string[];
  isAvailable: boolean;
  certifications?: string[];
  latitude?: number;
  longitude?: number;
}

export interface WalkerSearchFilters {
  serviceArea?: string;
  minRate?: number;
  maxRate?: number;
  minExperience?: number;
  minRating?: number;
  isAvailable?: boolean;
  sortBy?: 'hourlyRate' | 'experienceYears' | 'averageRating' | 'totalWalks';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Recurring Walk types
export interface RecurringWalkPlan {
  id: string;
  dogId: string;
  dog?: Dog;
  ownerId: string;
  owner?: User;
  dayOfWeek: number;
  time: string;
  duration: number;
  active: boolean;
  createdAt: Date;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
  duration?: number;
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

// Invoice types
export interface InvoiceLineItem {
  dogId: string;
  dogName: string;
  durationMinutes: number;
  hourlyRate: number;
  netAmount: number;
  taxAmount: number;
  grossAmount: number;
}

export interface Invoice {
  invoiceNumber: string;
  date: string;
  lineItems: InvoiceLineItem[];
  totalNet: number;
  totalTax: number;
  totalGross: number;
  currency: string;
  taxRate: number;
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

export interface CreateWalkerProfileRequest {
  userId: string;
  bio: string;
  experienceYears: number;
  hourlyRate: number;
  serviceAreas: string[];
  availability?: string[];
  isAvailable: boolean;
  certifications?: string[];
  latitude?: number;
  longitude?: number;
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

export interface BillingReportResponse {
  records: BillingRecord[];
  summary: {
    totalRecords: number;
    totalDuration: number;
    totalAmount: number;
    totalNet: number;
    totalTax: number;
    totalGross: number;
    startDate: string;
    endDate: string;
    taxRate: number;
  };
}

export interface WalkStats {
  scheduled: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  total: number;
}

export interface DashboardStats {
  totalDogs: number;
  totalOwners: number;
  totalWalkers: number;
  upcomingWalks: number;
  activeWalks: number;
  monthlyRevenue: number;
}
