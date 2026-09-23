import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AuthResponse,
  Gender,
  User,
  loginWithDeviceIdApi,
  saveGenderApi,
} from '../services/authService';

const SESSION_STORAGE_KEY = '@stream/anonymous_session';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  deviceId: string | null;
  isLoading: boolean;
  isInitializing: boolean;
  loginWithDeviceId: () => Promise<void>;
  saveGender: (gender: Gender) => Promise<void>;
  updateCoinBalance: (balance: number) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  accessToken: null,
  deviceId: null,
  isLoading: false,
  isInitializing: true,
  loginWithDeviceId: async () => {},
  saveGender: async () => {},
  updateCoinBalance: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const applySession = (session: AuthResponse) => {
    setUser(session.user);
    setAccessToken(session.accessToken);
    setDeviceId(session.deviceId);
    setIsAuthenticated(true);
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedSession = await AsyncStorage.getItem(SESSION_STORAGE_KEY);

        if (!savedSession) {
          return;
        }

        const session = JSON.parse(savedSession) as AuthResponse;

        if (!session?.deviceId || !session?.user?.id) {
          await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
          return;
        }

        applySession(session);

        // Refresh mutable profile/balance data without showing Welcome again.
        loginWithDeviceIdApi()
          .then(async refreshedSession => {
            applySession(refreshedSession);
            await AsyncStorage.setItem(
              SESSION_STORAGE_KEY,
              JSON.stringify(refreshedSession),
            );
          })
          .catch(() => {
            // Keep the last valid local session when the device is offline.
          });
      } catch {
        await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
      } finally {
        setIsInitializing(false);
      }
    };

    restoreSession();
  }, []);

  const loginWithDeviceId = async () => {
    try {
      setIsLoading(true);
      const res = await loginWithDeviceIdApi();
      await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(res));
      applySession(res);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const persistUser = async (nextUser: User) => {
    setUser(nextUser);

    if (deviceId) {
      await AsyncStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({accessToken, deviceId, user: nextUser}),
      );
    }
  };

  const saveGender = async (gender: Gender) => {
    if (!deviceId || !user) {
      throw new Error('Anonymous session is unavailable.');
    }

    const savedGender = await saveGenderApi(deviceId, gender);
    await persistUser({...user, gender: savedGender});
  };

  const updateCoinBalance = async (balance: number) => {
    if (!user) {
      return;
    }

    await persistUser({...user, coinBalance: balance});
  };

  const logout = async () => {
    await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
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
        isInitializing,
        loginWithDeviceId,
        saveGender,
        updateCoinBalance,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
