import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User,
  Dog,
  Walk,
  Invitation,
  Rate,
  WalkerProfile,
  WalkerSearchFilters,
  PaginatedResponse,
  CreateDogRequest,
  UpdateDogRequest,
  CreateWalkRequest,
  UpdateWalkRequest,
  UpdateAttendanceRequest,
  CreateInvitationRequest,
  CreateRateRequest,
  CreateWalkerProfileRequest,
  BillingReportRequest,
  BillingReportResponse,
  RecurringWalkPlan,
  DashboardStats,
} from '@dogwalking/shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify(data) });
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.request('/auth/register', { method: 'POST', body: JSON.stringify(data) });
  }

  async logout(): Promise<void> {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getCurrentUser(): Promise<AuthResponse> {
    return this.request('/auth/me');
  }

  // Invitations
  async getInvitations(): Promise<Invitation[]> {
    return this.request('/invitations');
  }

  async createInvitation(data: CreateInvitationRequest): Promise<Invitation> {
    return this.request('/invitations', { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteInvitation(id: string): Promise<void> {
    return this.request(`/invitations/${id}`, { method: 'DELETE' });
  }

  async validateInvitation(token: string): Promise<{ valid: boolean; email: string }> {
    return this.request(`/invitations/validate/${token}`);
  }

  // Users
  async getUsers(): Promise<User[]> {
    return this.request('/users');
  }

  async getUser(id: string): Promise<User> {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return this.request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request(`/users/${id}`, { method: 'DELETE' });
  }

  // Dogs
  async getDogs(ownerId?: string): Promise<Dog[]> {
    const query = ownerId ? `?ownerId=${ownerId}` : '';
    return this.request(`/dogs${query}`);
  }

  async getDog(id: string): Promise<Dog> {
    return this.request(`/dogs/${id}`);
  }

  async createDog(data: CreateDogRequest): Promise<Dog> {
    return this.request('/dogs', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateDog(id: string, data: UpdateDogRequest): Promise<Dog> {
    return this.request(`/dogs/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteDog(id: string): Promise<void> {
    return this.request(`/dogs/${id}`, { method: 'DELETE' });
  }

  // Walks
  async getWalks(params?: { startDate?: string; endDate?: string; dogId?: string; status?: string }): Promise<Walk[]> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/walks${query ? `?${query}` : ''}`);
  }

  async getWalk(id: string): Promise<Walk> {
    return this.request(`/walks/${id}`);
  }

  async createWalk(data: CreateWalkRequest): Promise<Walk> {
    return this.request('/walks', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateWalk(id: string, data: UpdateWalkRequest): Promise<Walk> {
    return this.request(`/walks/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteWalk(id: string): Promise<void> {
    return this.request(`/walks/${id}`, { method: 'DELETE' });
  }

  async startWalk(id: string): Promise<Walk> {
    return this.request(`/walks/${id}/start`, { method: 'POST' });
  }

  async endWalk(id: string): Promise<Walk> {
    return this.request(`/walks/${id}/end`, { method: 'POST' });
  }

  async confirmWalk(id: string): Promise<Walk> {
    return this.request(`/walks/${id}/confirm`, { method: 'POST' });
  }

  async cancelWalk(id: string): Promise<Walk> {
    return this.request(`/walks/${id}/cancel`, { method: 'POST' });
  }

  async completeWalk(id: string): Promise<Walk> {
    return this.request(`/walks/${id}/complete`, { method: 'POST' });
  }

  async updateAttendance(walkId: string, dogId: string, attended: boolean): Promise<void> {
    return this.request(`/walks/${walkId}/attendance/${dogId}`, {
      method: 'PATCH',
      body: JSON.stringify({ attended }),
    });
  }

  // Walker Profiles
  async getWalkers(): Promise<WalkerProfile[]> {
    return this.request('/walkers');
  }

  async getWalker(id: string): Promise<WalkerProfile> {
    return this.request(`/walkers/${id}`);
  }

  async searchWalkers(filters: WalkerSearchFilters): Promise<PaginatedResponse<WalkerProfile>> {
    const query = new URLSearchParams(filters as any).toString();
    return this.request(`/walkers/search?${query}`);
  }

  async createWalker(data: CreateWalkerProfileRequest): Promise<WalkerProfile> {
    return this.request('/walkers', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateWalker(id: string, data: Partial<CreateWalkerProfileRequest>): Promise<WalkerProfile> {
    return this.request(`/walkers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteWalker(id: string): Promise<void> {
    return this.request(`/walkers/${id}`, { method: 'DELETE' });
  }

  // Rates
  async getRates(dogId?: string): Promise<Rate[]> {
    const query = dogId ? `?dogId=${dogId}` : '';
    return this.request(`/rates${query}`);
  }

  async createRate(data: CreateRateRequest): Promise<Rate> {
    return this.request('/rates', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateRate(id: string, data: Partial<CreateRateRequest>): Promise<Rate> {
    return this.request(`/rates/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteRate(id: string): Promise<void> {
    return this.request(`/rates/${id}`, { method: 'DELETE' });
  }

  // Billing
  async getBillingReport(params: BillingReportRequest): Promise<BillingReportResponse> {
    return this.request('/billing/report', { method: 'POST', body: JSON.stringify(params) });
  }

  async exportBillingCSV(params: BillingReportRequest): Promise<Blob> {
    const response = await fetch(`${API_URL}/billing/export/csv`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error('Export failed');
    return response.blob();
  }

  // Recurring Walks
  async getRecurringPlans(): Promise<RecurringWalkPlan[]> {
    return this.request('/walks/recurring');
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request('/dashboard/stats');
  }
}

export const api = new ApiClient();
