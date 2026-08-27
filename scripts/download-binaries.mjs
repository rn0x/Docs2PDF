#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const VERSION = '0.6.7';
const BASE_URL = `https://github.com/developer0hye/office2pdf/releases/download/v${VERSION}`;

const PLATFORMS = [
  {
    name: 'linux-x64',
    target: 'x86_64-unknown-linux-gnu',
    archive: 'tar.gz',
    binary: 'office2pdf'
  },
  {
    name: 'linux-arm64',
    target: 'aarch64-unknown-linux-gnu',
    archive: 'tar.gz',
    binary: 'office2pdf'
  },
  {
    name: 'mac-x64',
    target: 'x86_64-apple-darwin',
    archive: 'tar.gz',
    binary: 'office2pdf'
  },
  {
    name: 'mac-arm64',
    target: 'aarch64-apple-darwin',
    archive: 'tar.gz',
    binary: 'office2pdf'
  },
  {
    name: 'win-x64',
    target: 'x86_64-pc-windows-msvc',
    archive: 'zip',
    binary: 'office2pdf.exe'
  }
];

const VENDOR_DIR = join(process.cwd(), 'vendor', 'office2pdf');
const BINARIES_DIR = join(VENDOR_DIR, 'binaries');

async function downloadBinaries(platforms = null) {
  const targets = platforms || PLATFORMS;
  
  for (const platform of targets) {
    console.log(`Downloading ${platform.name}...`);
    
    const archiveName = `office2pdf-v${VERSION}-${platform.target}.${platform.archive}`;
    const url = `${BASE_URL}/${archiveName}`;
    const archivePath = join(VENDOR_DIR, archiveName);
    
    try {
      execSync(`curl -L -o "${archivePath}" "${url}"`, { stdio: 'inherit' });
      
      const platformDir = join(BINARIES_DIR, platform.name);
      mkdirSync(platformDir, { recursive: true });
      
      if (platform.archive === 'tar.gz') {
        execSync(`tar xzf "${archivePath}" -C "${platformDir}" --strip-components=1`, { stdio: 'inherit' });
      } else {
        execSync(`unzip -o "${archivePath}" -d "${platformDir}"`, { stdio: 'inherit' });
        const nestedDirs = existsSync(join(platformDir, platform.binary)) ? [] :
          execSync(`find "${platformDir}" -name "${platform.binary}" -type f`, { encoding: 'utf-8' }).trim().split('\n').filter(Boolean);
        for (const found of nestedDirs) {
          if (found !== join(platformDir, platform.binary)) {
            execSync(`mv "${found}" "${platformDir}/${platform.binary}"`);
          }
        }
        execSync(`find "${platformDir}" -mindepth 1 -maxdepth 1 -type d -exec rm -rf {} +`, { stdio: 'ignore' });
      }

      const binaryPath = join(platformDir, platform.binary);
      if (existsSync(binaryPath)) {
        execSync(`chmod +x "${binaryPath}"`);
        console.log(`  ✓ ${platform.name} downloaded`);
      } else {
        console.error(`  ✗ Binary not found: ${binaryPath}`);
      }
      
      if (existsSync(archivePath)) {
        execSync(`rm "${archivePath}"`);
      }
    } catch (err) {
      console.error(`  ✗ Failed to download ${platform.name}: ${err.message}`);
    }
  }
  
  writeFileSync(join(VENDOR_DIR, 'VERSION'), VERSION);
  console.log(`\nDone! Version: ${VERSION}`);
}

const args = process.argv.slice(2);
if (args.length > 0) {
  const platformNames = args;
  const selected = PLATFORMS.filter(p => platformNames.includes(p.name));
  downloadBinaries(selected.length > 0 ? selected : null);
} else {
  downloadBinaries();
}
