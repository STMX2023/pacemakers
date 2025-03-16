declare module '@env' {
  export const SUPABASE_URL: string;
  export const SUPABASE_ANON_KEY: string;
  export const APP_REDIRECT_URI: string;
  export const EXPO_REDIRECT_SCHEME: string;
  export const IOS_BUNDLE_IDENTIFIER: string;
  export const ANDROID_PACKAGE: string;
  export const EXPO_DEV_REDIRECT: string;
  export const APP_NAME: string;
  export const APP_SLUG: string;
  export const APP_VERSION: string;
  export const APP_SCHEME: string;
  export const APP_ORIENTATION: string;
  export const APP_ICON: string;
  export const APP_USER_INTERFACE_STYLE: string;
  
  // Android configuration
  export const ANDROID_FOREGROUND_IMAGE: string;
  export const ANDROID_BACKGROUND_COLOR: string;
  
  // iOS configuration
  export const IOS_SUPPORTS_TABLET: string;
  
  // Web configuration
  export const WEB_BUNDLER: string;
  export const WEB_OUTPUT: string;
  export const WEB_FAVICON: string;
  
  // Splash screen configuration
  export const SPLASH_IMAGE: string;
  export const SPLASH_IMAGE_WIDTH: string;
  export const SPLASH_RESIZE_MODE: string;
  export const SPLASH_BACKGROUND_COLOR: string;
  
  // Default fallback values
  export const DEFAULT_APP_NAME: string;
  export const DEFAULT_APP_SLUG: string;
  export const DEFAULT_APP_VERSION: string;
  export const DEFAULT_APP_SCHEME: string;
  export const DEFAULT_IOS_BUNDLE_ID: string;
  export const DEFAULT_ANDROID_PACKAGE: string;
} 