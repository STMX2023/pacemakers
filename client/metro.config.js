const { getDefaultConfig } = require('expo/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

// Get the default metro config
const config = getDefaultConfig(__dirname, {
  // Enable experimental features for expo-router
  isCSSEnabled: true,
});

// Import support for require.context
config.resolver.enableRequireContext = true;

// Enable file-system routing
config.watchFolders = [...(config.watchFolders || []), './.expo/web/cache'];

// Export the combined configuration
module.exports = wrapWithReanimatedMetroConfig(config); 