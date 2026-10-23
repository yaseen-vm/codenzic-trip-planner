import type { ExpoConfig } from 'expo/config';

export default ({ config }: { config: ExpoConfig }): ExpoConfig => {
  // Native Maps SDK keys must be separate from Places and Routes web-service keys.
  const androidKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
  const iosKey = process.env.GOOGLE_MAPS_IOS_API_KEY;

  return {
    ...config,
    plugins: [
      ...(config.plugins ?? []).filter(
        (plugin) => (typeof plugin === 'string' ? plugin : plugin[0]) !== 'react-native-maps',
      ),
      [
        'react-native-maps',
        {
          ...(androidKey ? { androidGoogleMapsApiKey: androidKey } : {}),
          ...(iosKey ? { iosGoogleMapsApiKey: iosKey } : {}),
        },
      ],
    ],
    android: {
      ...config.android,
      ...(androidKey
        ? {
            config: {
              ...config.android?.config,
              googleMaps: { apiKey: androidKey },
            },
          }
        : {}),
    },
    ios: {
      ...config.ios,
      ...(iosKey
        ? {
            config: {
              ...config.ios?.config,
              googleMapsApiKey: iosKey,
            },
          }
        : {}),
    },
  };
};
