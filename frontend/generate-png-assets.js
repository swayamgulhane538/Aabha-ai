import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // RGBA color type
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  const ihdrChunk = createChunk('IHDR', ihdr);
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height * 0.46; // slight top offset like icon design

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData.writeUInt8(0, rowOffset);

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxR = width * 0.35;

      let r = 10, g = 17, b = 40, a = 255;

      // Squircle background corner radius
      const cornerR = width * 0.22;
      const boxW = width * 0.92;
      const boxH = height * 0.92;
      const bx = Math.abs(x - width / 2);
      const by = Math.abs(y - height / 2);

      if (bx > boxW / 2 || by > boxH / 2) {
        // Transparent outside squircle
        r = 0; g = 0; b = 0; a = 0;
      } else if (dist < maxR * 0.55) {
        // Luminous 3D AI Core
        const ratio = dist / (maxR * 0.55);
        r = Math.floor(16 + ratio * 10);
        g = Math.floor(185 - ratio * 30);
        b = Math.floor(212 + ratio * 40);
        // Specular highlight top-left
        if (dx < 0 && dy < 0 && dist < maxR * 0.25) {
          r = Math.min(255, r + 90);
          g = Math.min(255, g + 80);
          b = Math.min(255, b + 60);
        }
      } else if (dist < maxR * 0.95) {
        // Outer glowing orbital aura
        const ratio = (dist - maxR * 0.55) / (maxR * 0.4);
        r = Math.floor(6 + (1 - ratio) * 20);
        g = Math.floor(182 * (1 - ratio * 0.8));
        b = Math.floor(212 * (1 - ratio * 0.6));
      } else {
        // Dark Obsidian glass surface
        const gradY = y / height;
        r = Math.floor(10 - gradY * 5);
        g = Math.floor(17 - gradY * 8);
        b = Math.floor(40 - gradY * 18);
      }

      rawData.writeUInt8(r, pixelOffset);
      rawData.writeUInt8(g, pixelOffset + 1);
      rawData.writeUInt8(b, pixelOffset + 2);
      rawData.writeUInt8(a, pixelOffset + 3);
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(8 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + length));
  chunk.writeUInt32BE(crc, 8 + length);
  return chunk;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ -1) >>> 0;
}

const publicDir = path.resolve('public');

// Write new luxury PNGs
const icon512 = createPng(512, 512);
fs.writeFileSync(path.join(publicDir, 'aabha-icon-512.png'), icon512);

const icon192 = createPng(192, 192);
fs.writeFileSync(path.join(publicDir, 'aabha-icon-192.png'), icon192);

// Copy new SVG
fs.copyFileSync(path.join(publicDir, 'aabha-icon.svg'), path.join(publicDir, 'aabha-icon-192.svg'));
fs.copyFileSync(path.join(publicDir, 'aabha-icon.svg'), path.join(publicDir, 'aabha-icon-512.svg'));

console.log('✅ Luxury Logo PNG and SVG assets generated!');
