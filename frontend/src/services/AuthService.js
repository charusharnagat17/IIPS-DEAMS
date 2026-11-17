import { HttpService } from './HttpService';
import { User } from '../models/User';

export class AuthService extends HttpService {
  constructor() {
    super('/api/auth');
  }

  async login(usernameOrEmail, password) {
    const res = await this.post('/login', { usernameOrEmail, password });
    if (res && res.success && res.data) {
      return new User(res.data);
    }
    throw new Error(res?.message || 'Login failed');
  }

  async register(registerData) {
    const res = await this.post('/register', registerData);
    if (res && res.success && res.data) {
      return new User(res.data);
    }
    throw new Error(res?.message || 'Registration failed');
  }

  async getCurrentUser() {
    const res = await this.get('/me');
    if (res && res.success && res.data) {
      return new User(res.data);
    }
    return null;
  }

}

export const authService = new AuthService();
