import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User,
  Dog,
  Walk,
  Invitation,
  Rate,
  CreateDogRequest,
  UpdateDogRequest,
  CreateWalkRequest,
  UpdateWalkRequest,
  UpdateAttendanceRequest,
  CreateInvitationRequest,
  CreateRateRequest,
  BillingReportRequest
} from '@dogwalking/shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api';

class ApiClient {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
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

  // Auth endpoints
  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<void> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<AuthResponse> {
    return this.request('/auth/me');
  }

  // Invitation endpoints
  async getInvitations(): Promise<Invitation[]> {
    return this.request('/invitations');
  }

  async createInvitation(data: CreateInvitationRequest): Promise<Invitation> {
    return this.request('/invitations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteInvitation(id: string): Promise<void> {
    return this.request(`/invitations/${id}`, {
      method: 'DELETE',
    });
  }

  async validateInvitation(token: string): Promise<{ valid: boolean; email: string }> {
    return this.request(`/invitations/validate/${token}`);
  }

  // User endpoints
  async getUsers(): Promise<User[]> {
    return this.request('/users');
  }

  async getUser(id: string): Promise<User> {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Dog endpoints
  async getDogs(ownerId?: string): Promise<Dog[]> {
    const query = ownerId ? `?ownerId=${ownerId}` : '';
    return this.request(`/dogs${query}`);
  }

  async getDog(id: string): Promise<Dog> {
    return this.request(`/dogs/${id}`);
  }

  async createDog(data: CreateDogRequest): Promise<Dog> {
    return this.request('/dogs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDog(id: string, data: UpdateDogRequest): Promise<Dog> {
    return this.request(`/dogs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDog(id: string): Promise<void> {
    return this.request(`/dogs/${id}`, {
      method: 'DELETE',
    });
  }

  // Walk endpoints
  async getWalks(params?: { startDate?: string; endDate?: string; dogId?: string }): Promise<Walk[]> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/walks${query ? `?${query}` : ''}`);
  }

  async getWalk(id: string): Promise<Walk> {
    return this.request(`/walks/${id}`);
  }

  async createWalk(data: CreateWalkRequest): Promise<Walk> {
    return this.request('/walks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWalk(id: string, data: UpdateWalkRequest): Promise<Walk> {
    return this.request(`/walks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteWalk(id: string): Promise<void> {
    return this.request(`/walks/${id}`, {
      method: 'DELETE',
    });
  }

  async startWalk(id: string): Promise<Walk> {
    return this.request(`/walks/${id}/start`, {
      method: 'POST',
    });
  }

  async endWalk(id: string): Promise<Walk> {
    return this.request(`/walks/${id}/end`, {
      method: 'POST',
    });
  }

  async updateAttendance(walkId: string, dogId: string, attended: boolean): Promise<void> {
    return this.request(`/walks/${walkId}/attendance/${dogId}`, {
      method: 'PATCH',
      body: JSON.stringify({ attended }),
    });
  }

  // Rate endpoints
  async getRates(dogId?: string): Promise<Rate[]> {
    const query = dogId ? `?dogId=${dogId}` : '';
    return this.request(`/rates${query}`);
  }

  async createRate(data: CreateRateRequest): Promise<Rate> {
    return this.request('/rates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRate(id: string, data: Partial<CreateRateRequest>): Promise<Rate> {
    return this.request(`/rates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteRate(id: string): Promise<void> {
    return this.request(`/rates/${id}`, {
      method: 'DELETE',
    });
  }

  // Billing endpoints
  async getBillingReport(params: BillingReportRequest): Promise<any> {
    return this.request('/billing/report', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async exportBillingCSV(params: BillingReportRequest): Promise<Blob> {
    const response = await fetch(`${API_URL}/billing/export/csv`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }
}

export const api = new ApiClient();

