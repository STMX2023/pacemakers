import { ExpoConfig, ConfigContext } from 'expo/config';
import 'dotenv/config';

// Access environment variables
const {
  // App configuration
  APP_NAME,
  APP_SLUG,
  APP_VERSION,
  APP_SCHEME,
  APP_ORIENTATION,
  APP_ICON,
  APP_USER_INTERFACE_STYLE,
  
  // Android configuration
  ANDROID_PACKAGE,
  ANDROID_FOREGROUND_IMAGE,
  ANDROID_BACKGROUND_COLOR,
  
  // iOS configuration
  IOS_BUNDLE_IDENTIFIER,
  IOS_SUPPORTS_TABLET,
  
  // Web configuration
  WEB_BUNDLER,
  WEB_OUTPUT,
  WEB_FAVICON,
  
  // Splash screen configuration
  SPLASH_IMAGE,
  SPLASH_IMAGE_WIDTH,
  SPLASH_RESIZE_MODE,
  SPLASH_BACKGROUND_COLOR,
  
  // API Keys
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  
  // Default fallbacks
  DEFAULT_APP_NAME,
  DEFAULT_APP_SLUG,
  DEFAULT_APP_VERSION,
  DEFAULT_APP_SCHEME,
  DEFAULT_IOS_BUNDLE_ID,
  DEFAULT_ANDROID_PACKAGE
} = process.env;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: (APP_NAME || config.name || DEFAULT_APP_NAME) as string,
  slug: (APP_SLUG || config.slug || DEFAULT_APP_SLUG) as string,
  version: (APP_VERSION || config.version || DEFAULT_APP_VERSION) as string,
  orientation: (APP_ORIENTATION || 'portrait') as 'portrait' | 'landscape',
  icon: (APP_ICON || './assets/images/icon.png') as string,
  scheme: (APP_SCHEME || DEFAULT_APP_SCHEME) as string,
  userInterfaceStyle: (APP_USER_INTERFACE_STYLE || 'automatic') as 'automatic' | 'light' | 'dark',
  ios: {
    ...config.ios,
    bundleIdentifier: (IOS_BUNDLE_IDENTIFIER || DEFAULT_IOS_BUNDLE_ID) as string,
    supportsTablet: IOS_SUPPORTS_TABLET === 'true'
  },
  android: {
    ...config.android,
    package: (ANDROID_PACKAGE || DEFAULT_ANDROID_PACKAGE) as string,
    adaptiveIcon: {
      ...(config.android?.adaptiveIcon || {}),
      foregroundImage: (ANDROID_FOREGROUND_IMAGE || './assets/images/adaptive-icon.png') as string,
      backgroundColor: (ANDROID_BACKGROUND_COLOR || '#ffffff') as string
    }
  },
  web: {
    ...config.web,
    bundler: (WEB_BUNDLER || 'metro') as 'webpack' | 'metro',
    output: (WEB_OUTPUT || 'static') as 'single' | 'static' | 'server',
    favicon: (WEB_FAVICON || './assets/images/favicon.png') as string
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: (SPLASH_IMAGE || './assets/images/splash-icon.png') as string,
        imageWidth: parseInt(SPLASH_IMAGE_WIDTH || '200', 10),
        resizeMode: (SPLASH_RESIZE_MODE || 'contain') as string,
        backgroundColor: (SPLASH_BACKGROUND_COLOR || '#ffffff') as string
      }
    ],
    "expo-secure-store",
    "expo-sqlite",
    "react-native-background-fetch"
  ],
  extra: {
    ...config.extra,
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY
  }
});
