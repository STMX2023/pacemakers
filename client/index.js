// Import Buffer polyfill at the entry point
import { Buffer } from 'buffer';
// Ensure global Buffer is available
global.Buffer = Buffer;

import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import { LogBox } from 'react-native';

// Ignore specific warnings that might appear during development
LogBox.ignoreLogs([
  'Warning: Failed prop type',
  'Sending `onAnimatedValueUpdate`',
  'Non-serializable values were found in the navigation state',
]);

// Must be exported or Fast Refresh won't update the context
export function App() {
  const ctx = require.context('./app');
  
  // Add error handling for the context
  if (!ctx) {
    console.error('Failed to load app context');
  }
  
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App); 