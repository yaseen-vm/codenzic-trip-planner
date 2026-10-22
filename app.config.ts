import type { ExpoConfig } from 'expo/config';

export default ({ config }: { config: ExpoConfig }): ExpoConfig => {
  const androidKey =
    process.env.GOOGLE_MAPS_ANDROID_API_KEY ||
    process.env.EXPO_PUBLIC_GOOGLE_ROUTES_API_KEY ||
    process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ||
    '';
  const iosKey =
    process.env.GOOGLE_MAPS_IOS_API_KEY ||
    process.env.EXPO_PUBLIC_GOOGLE_ROUTES_API_KEY ||
    process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ||
    '';

  return {
    ...config,
    plugins: [
      ...(config.plugins ?? []).filter(
        (plugin) => (typeof plugin === 'string' ? plugin : plugin[0]) !== 'react-native-maps',
      ),
      [
        'react-native-maps',
        {
          androidGoogleMapsApiKey: androidKey,
          iosGoogleMapsApiKey: iosKey,
        },
      ],
    ],
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          apiKey: androidKey,
        },
      },
    },
    ios: {
      ...config.ios,
      config: {
        ...config.ios?.config,
        googleMapsApiKey: iosKey,
      },
    },
  };
};
