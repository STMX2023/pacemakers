#!/bin/bash

# Fix WatermelonDB simdjson header issues
echo "Fixing WatermelonDB simdjson headers..."

# Create the shared directory if it doesn't exist
mkdir -p "${PROJECT_DIR}/../node_modules/@nozbe/watermelondb/native/shared/"

# Copy the simdjson files
cp "${PROJECT_DIR}/../node_modules/@nozbe/simdjson/src/simdjson.cpp" "${PROJECT_DIR}/../node_modules/@nozbe/watermelondb/native/shared/simdjson.cpp"
cp "${PROJECT_DIR}/../node_modules/@nozbe/simdjson/src/simdjson.h" "${PROJECT_DIR}/../node_modules/@nozbe/watermelondb/native/shared/simdjson.h"

echo "WatermelonDB simdjson headers fixed successfully!" 