import Phaser from 'phaser';
import { PALETTE } from '@/theme/palette';
import type { CharacterId } from '@/store/useGameStore.types';

const WIDTH = 32;
const HEIGHT = 48;

/** `hem` é onde a barra termina — a Ana usa short, o Junior usa calça. */
const LOOK = {
  ana: { skin: PALETTE.skinAna, hair: PALETTE.hairAna, hem: 36 },
  junior: { skin: PALETTE.skinJunior, hair: PALETTE.hairJunior, hem: 43 },
} as const;

export const characterTextureKey = (id: CharacterId): string => `player-${id}`;

/**
 * Desenha o uniforme direto num canvas do Phaser — sem asset externo, sem
 * pipeline de arte. Em 32 × 48 o brasão viraria uma mancha de 4 pixels, então
 * aqui o uniforme é lido por silhueta e cor: corpo branco, gola e punho
 * marinho, pernas marinho. O detalhe fino mora no retrato SVG (SPEC 5b).
 */
export function ensureCharacterTexture(scene: Phaser.Scene, id: CharacterId): string {
  const key = characterTextureKey(id);
  if (scene.textures.exists(key)) return key;

  const texture = scene.textures.createCanvas(key, WIDTH, HEIGHT);
  if (!texture) return key;

  const ctx = texture.getContext();
  const look = LOOK[id];
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // pernas
  ctx.fillStyle = PALETTE.deep;
  ctx.fillRect(9, 30, 5, look.hem - 30);
  ctx.fillRect(18, 30, 5, look.hem - 30);

  // pele abaixo da barra
  ctx.fillStyle = look.skin;
  ctx.fillRect(9, look.hem, 5, 44 - look.hem);
  ctx.fillRect(18, look.hem, 5, 44 - look.hem);

  // tênis
  ctx.fillStyle = PALETTE.sneaker;
  ctx.fillRect(8, 44, 7, 4);
  ctx.fillRect(17, 44, 7, 4);

  // camisa e braços
  ctx.fillStyle = PALETTE.shirt;
  ctx.fillRect(8, 18, 16, 13);
  ctx.fillRect(5, 19, 4, 8);
  ctx.fillRect(23, 19, 4, 8);

  // gola e punhos — é isto que faz ler como uniforme
  ctx.fillStyle = PALETTE.navy;
  ctx.fillRect(11, 18, 10, 3);
  ctx.fillRect(5, 27, 4, 3);
  ctx.fillRect(23, 27, 4, 3);

  // mãos
  ctx.fillStyle = look.skin;
  ctx.fillRect(5, 30, 4, 4);
  ctx.fillRect(23, 30, 4, 4);

  // cabeça
  ctx.fillRect(10, 6, 12, 12);

  // cabelo
  ctx.fillStyle = look.hair;
  ctx.fillRect(9, 3, 14, 5);
  if (id === 'ana') {
    ctx.fillRect(8, 6, 2, 10);
    ctx.fillRect(22, 6, 2, 10);
    ctx.fillRect(13, 0, 6, 3);
  }

  // olhos
  ctx.fillStyle = PALETTE.night;
  ctx.fillRect(13, 11, 2, 2);
  ctx.fillRect(18, 11, 2, 2);

  // alça da mochila: uma para o Junior, duas para a Ana
  ctx.fillStyle = PALETTE.cyan;
  ctx.fillRect(11, 18, 2, 12);
  if (id === 'ana') ctx.fillRect(19, 18, 2, 12);

  texture.refresh();
  return key;
}
