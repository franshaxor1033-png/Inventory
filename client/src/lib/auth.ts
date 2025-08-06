import { apiRequest } from "./queryClient";

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('auth_user');
      if (userData) {
        this.user = JSON.parse(userData);
      }
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/login', credentials);
    const data: AuthResponse = await response.json();
    
    this.setAuthData(data.token, data.user);
    return data;
  }

  async register(userData: { email: string; password: string; role?: string }): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/register', userData);
    const data: AuthResponse = await response.json();
    
    this.setAuthData(data.token, data.user);
    return data;
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) return null;
    
    try {
      const response = await apiRequest('GET', '/api/auth/me');
      const data = await response.json();
      this.user = data.user;
      return data.user;
    } catch (error) {
      this.logout();
      return null;
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  private setAuthData(token: string, user: User) {
    this.token = token;
    this.user = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
  }
}

export const authService = new AuthService();
