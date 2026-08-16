import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const BG = [0x0b, 0x10, 0x20, 0xff];
const FG = [0x6e, 0xe7, 0xff, 0xff];

const FONT = {
  4: ['#  # ', '#  # ', '#  # ', '#####', '   # ', '   # ', '   # '],
  2: ['#####', '    #', '#####', '#    ', '#####', '#    ', '#####'],
};

function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([length, typeBuf, data, crc]);
}

function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const dest = y * (width * 4 + 1);
    raw[dest] = 0;
    rgba.copy(raw, dest + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function paint(size, inset) {
  const rgba = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) rgba.set(BG, i * 4);

  const inner = size - inset * 2;
  const scale = Math.floor(inner / 18);
  const glyphW = 5 * scale;
  const glyphH = 7 * scale;
  const gap = scale;
  const totalW = glyphW * 2 + gap;
  const originX = Math.floor((size - totalW) / 2);
  const originY = Math.floor((size - glyphH) / 2);

  const drawDigit = (digit, offsetX) => {
    const rows = FONT[digit];
    if (!rows) return;
    for (let gy = 0; gy < 7; gy++) {
      const row = rows[gy];
      if (!row) continue;
      for (let gx = 0; gx < 5; gx++) {
        if (row[gx] !== '#') continue;
        for (let py = 0; py < scale; py++) {
          for (let px = 0; px < scale; px++) {
            const x = originX + offsetX + gx * scale + px;
            const y = originY + gy * scale + py;
            rgba.set(FG, (y * size + x) * 4);
          }
        }
      }
    }
  };

  drawDigit('4', 0);
  drawDigit('2', glyphW + gap);
  return encodePng(size, size, rgba);
}

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/icon-192.png', paint(192, 0));
writeFileSync('public/icons/icon-512.png', paint(512, 0));
writeFileSync('public/icons/icon-maskable-512.png', paint(512, Math.round(512 * 0.1)));
