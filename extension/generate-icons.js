#!/usr/bin/env node
// Gera os ícones PNG da extensão TOGA Blocker.
// Execute: node generate-icons.js
// Não requer dependências externas.

'use strict';
const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

// ── Helpers PNG ───────────────────────────────────────────────────────────────
function u32be(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n >>> 0, 0);
  return b;
}

function crc32(buf) {
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      t[i] = c;
    }
    return t;
  })());
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const c = Buffer.concat([t, data]);
  return Buffer.concat([u32be(data.length), c, u32be(crc32(c))]);
}

function makePNG(pixels, size) {
  // pixels: Uint8Array of RGBA, row-major
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4);
    row[0] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const pi = (y * size + x) * 4;
      row[1 + x * 4]     = pixels[pi];
      row[1 + x * 4 + 1] = pixels[pi + 1];
      row[1 + x * 4 + 2] = pixels[pi + 2];
      row[1 + x * 4 + 3] = pixels[pi + 3];
    }
    rows.push(row);
  }
  const raw        = Buffer.concat(rows);
  const compressed = zlib.deflateSync(raw, { level: 9 });
  const sig  = Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]);
  const ihdr = chunk('IHDR', Buffer.concat([u32be(size), u32be(size), Buffer.from([8,6,0,0,0])]));
  const idat = chunk('IDAT', compressed);
  const iend = chunk('IEND', Buffer.alloc(0));
  return Buffer.concat([sig, ihdr, idat, iend]);
}

// ── Desenho do escudo TOGA ────────────────────────────────────────────────────
function drawShield(size, active) {
  const pixels = new Uint8Array(size * size * 4); // transparent

  // Cores
  const BG   = active ? [91, 184, 71, 255]  : [91, 71, 184, 255];  // violeta (inativo) ou verde (ativo)
  const GLOW = active ? [0, 212, 140, 180]  : [123, 103, 216, 140];
  const FG   = [255, 255, 255, 240];

  const pad = size * 0.06;

  function setPixel(x, y, r, g, b, a) {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const i = (Math.round(y) * size + Math.round(x)) * 4;
    // Alpha blend
    const fa = a / 255;
    pixels[i]   = Math.round(pixels[i]   * (1 - fa) + r * fa);
    pixels[i+1] = Math.round(pixels[i+1] * (1 - fa) + g * fa);
    pixels[i+2] = Math.round(pixels[i+2] * (1 - fa) + b * fa);
    pixels[i+3] = Math.min(255, pixels[i+3] + a);
  }

  // Anti-aliased circle fill helper
  function fillCircle(cx, cy, r, color) {
    for (let y = Math.floor(cy - r - 1); y <= cy + r + 1; y++) {
      for (let x = Math.floor(cx - r - 1); x <= cx + r + 1; x++) {
        const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        const alpha = Math.max(0, Math.min(1, r - d + 0.5));
        if (alpha > 0) setPixel(x, y, ...color.slice(0,3), Math.round(color[3] * alpha));
      }
    }
  }

  // Draw shield shape
  const cx   = size / 2;
  const top  = pad;
  const bot  = size - pad * 0.5;
  const w    = size - pad * 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x - cx) / (w / 2);  // -1 to 1
      const ny = (y - top) / (bot - top); // 0 to 1

      let inside = false;
      if (ny >= 0 && ny <= 1) {
        if (ny < 0.65) {
          // Top rounded part
          const maxW = 1.0;
          const cornerR = 0.35;
          if (Math.abs(nx) <= maxW) {
            const cornerDist = Math.max(0, Math.abs(nx) - (maxW - cornerR));
            const topDist    = Math.max(0, -ny);
            if (cornerDist ** 2 + topDist ** 2 <= cornerR ** 2 || (cornerDist === 0 || topDist === 0)) {
              inside = Math.abs(nx) <= maxW && ny >= 0;
            }
          }
        }
        if (ny >= 0.45 && ny <= 1) {
          // Bottom pointed part
          const maxW = 1.0 - (ny - 0.45) / (1.0 - 0.45) * 1.0;
          if (Math.abs(nx) <= maxW) inside = true;
        }
      }

      if (inside) {
        // Gradient: lighter at top
        const lightness = 1 - ny * 0.25;
        const alpha     = ny < 0.02 ? ny / 0.02 : (ny > 0.97 ? (1 - ny) / 0.03 : 1);
        setPixel(x, y,
          Math.round(BG[0] * lightness),
          Math.round(BG[1] * lightness),
          Math.round(BG[2] * lightness),
          Math.round(255 * alpha)
        );
      }
    }
  }

  // Draw "S" (shield letter) for larger sizes
  if (size >= 48) {
    const lx = cx;
    const ly = size * 0.45;
    const r  = size * 0.18;
    // Simple "S" via two arcs approximated with circles + rectangles
    // Top arc of S
    fillCircle(lx, ly - r * 0.6, r * 0.75, [...FG.slice(0,3), 220]);
    fillCircle(lx, ly - r * 0.6, r * 0.40, [...BG.slice(0,3), 255]);
    // Bottom arc of S
    fillCircle(lx, ly + r * 0.6, r * 0.75, [...FG.slice(0,3), 220]);
    fillCircle(lx, ly + r * 0.6, r * 0.40, [...BG.slice(0,3), 255]);
    // Middle bar
    for (let y = Math.round(ly - r * 0.15); y <= Math.round(ly + r * 0.15); y++) {
      for (let x = Math.round(lx - r * 0.75); x <= Math.round(lx + r * 0.75); x++) {
        setPixel(x, y, FG[0], FG[1], FG[2], 200);
      }
    }
  }

  return pixels;
}

// ── Gerar ────────────────────────────────────────────────────────────────────
const dir = path.join(__dirname, 'icons');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

[16, 48, 128].forEach(size => {
  // Inactive icon (violet)
  const pxNormal = drawShield(size, false);
  fs.writeFileSync(path.join(dir, `icon${size}.png`), makePNG(pxNormal, size));
  console.log(`✓ icons/icon${size}.png`);

  // Active icon (brighter — for when blocking is on)
  const pxActive = drawShield(size, true);
  fs.writeFileSync(path.join(dir, `icon${size}_active.png`), makePNG(pxActive, size));
  console.log(`✓ icons/icon${size}_active.png`);
});

console.log('\nÍcones gerados com sucesso!');
