import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface SignUpData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    createdAt: string;
  };
  token: string;
}

class AuthService {
  async signUp(data: SignUpData): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/signup`, data);
    return response.data;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/login`, data);
    return response.data;
  }

  async getCurrentUser(token: string): Promise<AuthResponse['user']> {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  removeToken(): void {
    localStorage.removeItem('token');
  }
}

export default new AuthService(); 