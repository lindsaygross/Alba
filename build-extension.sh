#!/bin/bash

# Alba Chrome Extension Build Script
# Creates a production-ready ZIP file for Chrome Web Store submission

set -e

echo "🏗️  Building Alba Chrome Extension..."

# Create build directory
BUILD_DIR="alba-extension-build"
ZIP_NAME="alba-extension-v$(grep -o '"version": "[^"]*' manifest.json | cut -d'"' -f4).zip"

# Clean previous build
rm -rf "$BUILD_DIR"
rm -f alba-extension-v*.zip

# Create fresh build directory
mkdir -p "$BUILD_DIR"

echo "📦 Copying extension files..."

# Copy essential extension files
cp manifest.json "$BUILD_DIR/"
cp content.js "$BUILD_DIR/"
cp energyConfig.js "$BUILD_DIR/"
cp popup.html "$BUILD_DIR/"
cp popup.js "$BUILD_DIR/"
cp styles.css "$BUILD_DIR/"

# Copy icons directory
cp -r icons "$BUILD_DIR/"

# Copy documentation
cp README.md "$BUILD_DIR/"
cp PRIVACY.md "$BUILD_DIR/"

echo "🗜️  Creating ZIP archive..."

# Create ZIP file (excluding .DS_Store and other hidden files)
cd "$BUILD_DIR"
zip -r "../$ZIP_NAME" . -x "*.DS_Store" -x "__MACOSX/*"
cd ..

# Show package info
PACKAGE_SIZE=$(du -h "$ZIP_NAME" | cut -f1)

echo "✅ Build complete!"
echo ""
echo "📊 Package Information:"
echo "   Name: $ZIP_NAME"
echo "   Size: $PACKAGE_SIZE"
echo "   Location: $(pwd)/$ZIP_NAME"
echo ""
echo "📋 Files included:"
cd "$BUILD_DIR"
find . -type f | sed 's|^\./|   - |' | sort
cd ..
echo ""
echo "🚀 Ready to upload to Chrome Web Store!"
echo "   https://chrome.google.com/webstore/devconsole"

# Cleanup build directory
rm -rf "$BUILD_DIR"
