#!/bin/bash

# Fix WatermelonDB simdjson header issues
echo "Fixing WatermelonDB simdjson headers..."

# Get the current directory where the script is running
CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$( cd "$CURRENT_DIR/.." && pwd )"

# Create the shared directory if it doesn't exist
mkdir -p "$ROOT_DIR/node_modules/@nozbe/watermelondb/native/shared/"

# Copy the simdjson files
cp "$ROOT_DIR/node_modules/@nozbe/simdjson/src/simdjson.cpp" "$ROOT_DIR/node_modules/@nozbe/watermelondb/native/shared/simdjson.cpp"
cp "$ROOT_DIR/node_modules/@nozbe/simdjson/src/simdjson.h" "$ROOT_DIR/node_modules/@nozbe/watermelondb/native/shared/simdjson.h"

echo "WatermelonDB simdjson headers fixed successfully!" 