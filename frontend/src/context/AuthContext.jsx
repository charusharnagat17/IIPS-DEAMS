import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/AuthService';
import { User } from '../models/User';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('iips_user');
    return saved ? new User(JSON.parse(saved)) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('iips_token'));

  useEffect(() => {
    if (user) {
      localStorage.setItem('iips_user', JSON.stringify(user.toJson()));
    } else {
      localStorage.removeItem('iips_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('iips_token', token);
    } else {
      localStorage.removeItem('iips_token');
    }
  }, [token]);

  const login = async (usernameOrEmail, password) => {
    const userModel = await authService.login(usernameOrEmail, password);
    setUser(userModel);
    setToken(userModel.token);
    return userModel;
  };

  const register = async (registerData) => {
    const userModel = await authService.register(registerData);
    setUser(userModel);
    setToken(userModel.token);
    return userModel;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('iips_user');
    localStorage.removeItem('iips_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      role: user?.role,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
