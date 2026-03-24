import Constants from 'expo-constants';
import { Platform } from 'react-native';

type ExpoManifestLike = {
  debuggerHost?: string;
  hostUri?: string;
};

type ExpoConstantsLike = typeof Constants & {
  manifest?: ExpoManifestLike;
  manifest2?: {
    extra?: {
      expoClient?: {
        hostUri?: string;
      };
    };
  };
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function getExpoHostUri() {
  const constants = Constants as ExpoConstantsLike;
  const expoConfig = constants.expoConfig as { hostUri?: string } | null | undefined;
  const candidates = [
    expoConfig?.hostUri,
    constants.manifest2?.extra?.expoClient?.hostUri,
    constants.manifest?.debuggerHost,
    constants.manifest?.hostUri,
  ];

  return candidates.find((candidate) => typeof candidate === 'string' && candidate.trim().length > 0) ?? null;
}

export function getMatchingApiBaseUrl() {
  const envUrl = process.env.EXPO_PUBLIC_MATCHING_API_BASE_URL?.trim();

  if (envUrl) {
    return trimTrailingSlash(envUrl);
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }

  const hostUri = getExpoHostUri();

  if (hostUri) {
    const [host] = hostUri.split(':');

    if (host) {
      return `http://${host}:3001`;
    }
  }

  return 'http://localhost:3001';
}
