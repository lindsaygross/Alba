#!/usr/bin/env node
/**
 * Alba Extension Build Script
 *
 * Copies the extension files into dist/ and creates a distributable ZIP.
 *
 * No secrets are injected: AI calls go through a server-side proxy (see proxy/),
 * so no token ever ships inside the extension.
 *
 * Usage:
 *   node scripts/build.cjs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

// Files to include in the extension package
const EXTENSION_FILES = [
  'manifest.json',
  'content.js',
  'aiClient.js',
  'energyConfig.js',
  'popup.html',
  'popup.js',
  'styles.css',
  'icons'
];

function log(message) {
  console.log(`[Alba Build] ${message}`);
}

function error(message) {
  console.error(`[Alba Build ERROR] ${message}`);
  process.exit(1);
}

function cleanDist() {
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });
  log('Cleaned dist directory');
}

function copyFile(src, dest) {
  const srcPath = path.join(ROOT_DIR, src);
  const destPath = path.join(DIST_DIR, src);

  if (!fs.existsSync(srcPath)) {
    log(`Skipping ${src} (not found)`);
    return;
  }

  const stat = fs.statSync(srcPath);
  if (stat.isDirectory()) {
    fs.cpSync(srcPath, destPath, { recursive: true });
  } else {
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(srcPath, destPath);
  }
  log(`Copied ${src}`);
}

function createZip() {
  const zipName = 'alba-extension.zip';
  const zipPath = path.join(DIST_DIR, zipName);

  // Remove old zip if exists
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  // Create zip using system zip command
  try {
    const filesToZip = EXTENSION_FILES.filter(f => {
      const fullPath = path.join(DIST_DIR, f);
      return fs.existsSync(fullPath);
    }).join(' ');

    execSync(`cd "${DIST_DIR}" && zip -r "${zipName}" ${filesToZip}`, {
      stdio: 'inherit'
    });

    log(`Created ${zipName}`);
    return zipPath;
  } catch (err) {
    log('zip command not available, skipping ZIP creation');
    return null;
  }
}

function main() {
  log('Starting Alba extension build...');
  log(`Root directory: ${ROOT_DIR}`);
  log(`Dist directory: ${DIST_DIR}`);

  // Step 1: Clean dist directory
  cleanDist();

  // Step 2: Copy extension files
  log('Copying extension files...');
  for (const file of EXTENSION_FILES) {
    copyFile(file);
  }

  // Step 3: Create ZIP for distribution
  log('Creating distribution ZIP...');
  const zipPath = createZip();

  log('');
  log('Build complete!');
  log(`Output directory: ${DIST_DIR}`);
  if (zipPath) {
    log(`ZIP package: ${zipPath}`);
  }
  log('');
  log('To test locally:');
  log('  1. Go to chrome://extensions/');
  log('  2. Enable Developer mode');
  log('  3. Click "Load unpacked"');
  log(`  4. Select: ${DIST_DIR}`);
}

main();
