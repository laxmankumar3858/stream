export interface User {
  id: string;
  name: string;
  avatar: string;
  isGuest: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
  deviceId: string;
}

/**
 * Generates a mock or real device ID if one is not provided.
 */
export const getDeviceId = (): string => {
  const randomHex = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `DEV_${randomHex}`;
};

/**
 * Simulates hitting an Auth API passing deviceId and receiving an accessToken & random userId.
 */
export const loginWithDeviceIdApi = async (deviceIdProps?: string): Promise<AuthResponse> => {
  const deviceId = deviceIdProps || getDeviceId();
  
  // Simulate network request delay (1.2s)
  await new Promise((resolve) => setTimeout(() => resolve(true), 1200));

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const userId = `USER_${randomNum}`;
  const accessToken = `st_tok_${Math.random().toString(36).substring(2)}${Date.now()}`;

  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  ];

  const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

  return {
    accessToken,
    deviceId,
    user: {
      id: userId,
      name: `Streamer #${randomNum}`,
      avatar: randomAvatar,
      isGuest: true,
    },
  };
};
