import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#4f46e5"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="28" fill="url(#bg)"/>
  <g transform="translate(32, 24)" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M44 8H16a4 4 0 0 0-4 4v56a4 4 0 0 0 4 4h48a4 4 0 0 0 4-4V24z"/>
    <polyline points="44 8 44 24 60 24"/>
    <line x1="48" y1="44" x2="16" y2="44"/>
    <line x1="48" y1="56" x2="16" y2="56"/>
    <polyline points="28 32 24 32 20 32"/>
  </g>
  <g transform="translate(28, 68)" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.8">
    <path d="M4 0L4 28"/>
    <path d="M4 28L16 16"/>
    <path d="M4 28L-8 16"/>
    <circle cx="4" cy="0" r="3" fill="white"/>
  </g>
</svg>`;

const publicDir = join(process.cwd(), 'public');
writeFileSync(join(publicDir, 'icon.svg'), svgIcon);
console.log('Icon created');
