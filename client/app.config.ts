import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name || "Pacemakers",
  slug: config.slug || "pacemakers",
  android: {
    ...config.android,
    package: "com.x779wv3.client"
  }
});
