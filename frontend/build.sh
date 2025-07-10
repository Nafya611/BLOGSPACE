#!/bin/bash

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building the application..."
npm run build

# Output build info
echo "Build completed!"
echo "Files in dist directory:"
ls -la dist/
