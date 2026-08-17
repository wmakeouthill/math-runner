import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { knockoutNearBlack, paintContain } from './icon-canvas.mjs';

const SOURCE = 'src/assets/brasao-rj.png';

function writeIcon(path, canvas, size) {
  const png = new PNG({ width: size, height: size });
  png.data = Buffer.from(canvas);
  writeFileSync(path, PNG.sync.write(png));
}

const source = PNG.sync.read(readFileSync(SOURCE));
const cleared = knockoutNearBlack(source.data);

mkdirSync('public/icons', { recursive: true });
writeIcon('public/icons/icon-192.png', paintContain(192, cleared, source.width, source.height, 0.12), 192);
writeIcon('public/icons/icon-512.png', paintContain(512, cleared, source.width, source.height, 0.12), 512);
writeIcon(
  'public/icons/icon-maskable-512.png',
  paintContain(512, cleared, source.width, source.height, 0.2),
  512,
);
