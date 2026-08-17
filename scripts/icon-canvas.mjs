/** Fundo da noite do jogo — o mesmo `#0b1020` da paleta. */
export const NIGHT = Uint8Array.from([0x0b, 0x10, 0x20, 255]);

export function contentBox(canvasSize, paddingRatio) {
  const pad = Math.round(canvasSize * paddingRatio);
  return { x: pad, y: pad, size: canvasSize - pad * 2 };
}

/** O PNG do brasão vem com fundo preto; no título isso some com mix-blend. */
export function knockoutNearBlack(rgba, threshold = 28) {
  const out = Uint8Array.from(rgba);
  for (let i = 0; i < out.length; i += 4) {
    if (out[i] <= threshold && out[i + 1] <= threshold && out[i + 2] <= threshold) {
      out[i + 3] = 0;
    }
  }
  return out;
}

function sampleNearest(src, srcW, srcH, x, y) {
  const sx = Math.min(srcW - 1, Math.max(0, Math.round(x)));
  const sy = Math.min(srcH - 1, Math.max(0, Math.round(y)));
  const i = (sy * srcW + sx) * 4;
  return src.subarray(i, i + 4);
}

export function paintContain(canvasSize, src, srcW, srcH, paddingRatio) {
  const canvas = new Uint8Array(canvasSize * canvasSize * 4);
  for (let i = 0; i < canvas.length; i += 4) canvas.set(NIGHT, i);

  const box = contentBox(canvasSize, paddingRatio);
  const scale = Math.min(box.size / srcW, box.size / srcH);
  const destW = Math.max(1, Math.round(srcW * scale));
  const destH = Math.max(1, Math.round(srcH * scale));
  const originX = box.x + Math.floor((box.size - destW) / 2);
  const originY = box.y + Math.floor((box.size - destH) / 2);

  for (let y = 0; y < destH; y++) {
    for (let x = 0; x < destW; x++) {
      const pixel = sampleNearest(
        src,
        srcW,
        srcH,
        ((x + 0.5) / destW) * srcW - 0.5,
        ((y + 0.5) / destH) * srcH - 0.5,
      );
      const alpha = pixel[3] / 255;
      if (alpha === 0) continue;
      const dest = ((originY + y) * canvasSize + (originX + x)) * 4;
      canvas[dest] = Math.round(pixel[0] * alpha + canvas[dest] * (1 - alpha));
      canvas[dest + 1] = Math.round(pixel[1] * alpha + canvas[dest + 1] * (1 - alpha));
      canvas[dest + 2] = Math.round(pixel[2] * alpha + canvas[dest + 2] * (1 - alpha));
      canvas[dest + 3] = 255;
    }
  }
  return canvas;
}
