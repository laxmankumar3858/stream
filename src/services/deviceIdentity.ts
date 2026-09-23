import AsyncStorage from '@react-native-async-storage/async-storage';

const INSTALLATION_ID_KEY = '@stream/installation_id';

const createInstallationId = (): string =>
  `inst_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;

/** No device permission is required. The ID resets if app data is cleared. */
export const getDeviceId = async (): Promise<string | null> => {
  try {
    const storedId = await AsyncStorage.getItem(INSTALLATION_ID_KEY);

    if (storedId) {
      return storedId;
    }

    const installationId = createInstallationId();
    await AsyncStorage.setItem(INSTALLATION_ID_KEY, installationId);

    return installationId;
  } catch {
    return null;
  }
};
