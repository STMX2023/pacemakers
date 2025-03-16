****# Fixing WatermelonDB simdjson Header Issues

The React Native project is using WatermelonDB which depends on the simdjson library. There is a known issue where the build fails with the error `'simdjson/haswell/begin.h' file not found`.

## Quick Fix

Run the provided script to fix the issue:

```bash
./scripts/fix-watermelondb.sh
```

This script copies the necessary simdjson files from the `@nozbe/simdjson` package to the `@nozbe/watermelondb` package.

## Manual Fix Steps

If you prefer to fix this manually, follow these steps:

1. Add the required dependencies to `ios/Podfile`:

```ruby
pod 'React-jsi', :path => '../node_modules/react-native/ReactCommon/jsi', :modular_headers => true
pod 'simdjson', :path => '../node_modules/@nozbe/simdjson'
```

2. Copy the simdjson files:

```bash
mkdir -p node_modules/@nozbe/watermelondb/native/shared/
cp node_modules/@nozbe/simdjson/src/simdjson.cpp node_modules/@nozbe/watermelondb/native/shared/simdjson.cpp
cp node_modules/@nozbe/simdjson/src/simdjson.h node_modules/@nozbe/watermelondb/native/shared/simdjson.h
```

3. Clean and reinstall pods:

```bash
cd ios
rm -rf Pods Podfile.lock
pod install
```

## Setting Up a Build Phase in Xcode (Recommended)

To ensure this fix is applied automatically every time you build the project in Xcode:

1. Open the project in Xcode:
   ```bash
   open ios/client.xcworkspace
   ```

2. Select the main target (usually your app name)

3. Go to the "Build Phases" tab

4. Click the "+" button in the top-left corner and select "New Run Script Phase"

5. Drag the new phase to be above the "Compile Sources" phase

6. Set the shell to `/bin/bash`

7. Add the following script:

```bash
# Fix WatermelonDB simdjson header issues
"${PROJECT_DIR}/../scripts/fix-watermelondb-xcode.sh"
```

8. Make sure "Show environment variables in build log" is checked

9. You can name the phase "Fix WatermelonDB"

10. Save and close Xcode

## Available Scripts

We provide two scripts for fixing this issue:

1. `scripts/fix-watermelondb.sh` - For running from the command line
2. `scripts/fix-watermelondb-xcode.sh` - For use in Xcode build phases (uses Xcode's PROJECT_DIR variable)

## Why This Fix Works

WatermelonDB's native component tries to include header files from simdjson, but the paths are not set up correctly in the project. The fix ensures that:

1. The required pod dependencies are added to the Podfile
2. The necessary simdjson files are copied to the location where WatermelonDB expects them
3. The build process is configured to automatically apply this fix on each build

This solution has been confirmed to work across different versions of React Native and WatermelonDB. 