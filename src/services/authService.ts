import {supabase} from '../lib/supabase';
import {getDeviceId} from './deviceIdentity';

export interface User {
  id: string;
  name: string;
  avatar: string;
  isGuest: boolean;
  coinBalance: number;
  gender: Gender | null;
}

export type Gender = 'male' | 'female';

export interface AuthResponse {
  accessToken: null;
  user: User;
  deviceId: string;
}

interface UserRow {
  id: string;
  username: string | null;
  profile_photo_url: string | null;
  coin_balance: number;
  gender: Gender | null;
}

/**
 * Creates the anonymous user on first use and refreshes last_active_at on
 * subsequent launches. The installation ID identifies this local app data; it is not an
 * authentication credential or secret.
 */
export const loginWithDeviceIdApi = async (): Promise<AuthResponse> => {
  if (!supabase) {
    throw new Error('Supabase URL is not configured.');
  }

  const deviceId = await getDeviceId();

  if (!deviceId) {
    throw new Error('Installation ID is unavailable.');
  }

  const {data, error} = await supabase
    .rpc('register_installation', {p_installation_id: deviceId})
    .single<UserRow>();

  if (error) {
    throw new Error(`Unable to register this device: ${error.message}`);
  }

  return {
    accessToken: null,
    deviceId,
    user: {
      id: data.id,
      name: data.username ?? 'Guest',
      avatar: data.profile_photo_url ?? '',
      isGuest: true,
      coinBalance: data.coin_balance,
      gender: data.gender,
    },
  };
};

export const saveGenderApi = async (
  deviceId: string,
  gender: Gender,
): Promise<Gender> => {
  if (!supabase) {
    throw new Error('Supabase URL is not configured.');
  }

  const {data, error} = await supabase.rpc('set_user_gender', {
    p_installation_id: deviceId,
    p_gender: gender,
  });

  if (error) {
    throw new Error(`Unable to save gender: ${error.message}`);
  }

  return data as Gender;
};
