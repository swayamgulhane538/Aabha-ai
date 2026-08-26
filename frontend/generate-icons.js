// Minimal PNG generator in Node.js
import fs from 'fs';
import path from 'path';

// Create a simple valid 1x1 or raw PNG buffer with emerald gradient or copy SVG
const publicDir = path.resolve('public');

// Write a fallback 192x192 SVG icon and copy to PNG name if needed
fs.copyFileSync(path.join(publicDir, 'aabha-icon.svg'), path.join(publicDir, 'aabha-icon-192.svg'));
fs.copyFileSync(path.join(publicDir, 'aabha-icon.svg'), path.join(publicDir, 'aabha-icon-512.svg'));
console.log('SVG icons generated successfully');
