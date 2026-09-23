import {NativeModules, Platform} from 'react-native';

interface AudioRouteNativeModule {
  enableSpeaker(): Promise<void>;
  reset(): Promise<void>;
}

const nativeAudioRoute = NativeModules.AudioRoute as
  | AudioRouteNativeModule
  | undefined;

export const enableCallSpeaker = async (): Promise<void> => {
  if (Platform.OS === 'android' && nativeAudioRoute) {
    await nativeAudioRoute.enableSpeaker();
  }
};

export const resetCallAudioRoute = async (): Promise<void> => {
  if (Platform.OS === 'android' && nativeAudioRoute) {
    await nativeAudioRoute.reset();
  }
};
