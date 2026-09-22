import React, { createContext, useContext, useState } from 'react';
import { User, loginWithDeviceIdApi } from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  deviceId: string | null;
  isLoading: boolean;
  loginWithDeviceId: (deviceIdProps?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  accessToken: null,
  deviceId: null,
  isLoading: false,
  loginWithDeviceId: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loginWithDeviceId = async (deviceIdProps?: string) => {
    try {
      setIsLoading(true);
      const res = await loginWithDeviceIdApi(deviceIdProps);
      setUser(res.user);
      setAccessToken(res.accessToken);
      setDeviceId(res.deviceId);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to authenticate device:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setDeviceId(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        accessToken,
        deviceId,
        isLoading,
        loginWithDeviceId,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
