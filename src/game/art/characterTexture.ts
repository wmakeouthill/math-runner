import Phaser from 'phaser';
import { PALETTE } from '@/theme/palette';
import type { CharacterId } from '@/store/useGameStore.types';

export const PLAYER_WIDTH = 32;
export const PLAYER_HEIGHT = 48;

export const CHARACTER_POSES = ['idle', 'walkA', 'walkB', 'jump', 'fall'] as const;
export type CharacterPose = (typeof CHARACTER_POSES)[number];

/** `hem` é onde a barra termina — a Ana usa short, o Junior usa calça. */
const LOOK = {
  ana: { skin: PALETTE.skinAna, hair: PALETTE.hairAna, hem: 36 },
  junior: { skin: PALETTE.skinJunior, hair: PALETTE.hairJunior, hem: 43 },
} as const;

type Limb = {
  leftLegX: number;
  rightLegX: number;
  legTop: number;
  leftShoeY: number;
  rightShoeY: number;
  leftArmX: number;
  rightArmX: number;
  armY: number;
};

const LIMB: Record<CharacterPose, Limb> = {
  idle: {
    leftLegX: 9, rightLegX: 18, legTop: 30,
    leftShoeY: 44, rightShoeY: 44,
    leftArmX: 5, rightArmX: 23, armY: 19,
  },
  walkA: {
    leftLegX: 4, rightLegX: 20, legTop: 30,
    leftShoeY: 44, rightShoeY: 41,
    leftArmX: 3, rightArmX: 24, armY: 18,
  },
  walkB: {
    leftLegX: 13, rightLegX: 22, legTop: 30,
    leftShoeY: 41, rightShoeY: 44,
    leftArmX: 6, rightArmX: 22, armY: 20,
  },
  jump: {
    leftLegX: 10, rightLegX: 17, legTop: 34,
    leftShoeY: 40, rightShoeY: 40,
    leftArmX: 4, rightArmX: 24, armY: 14,
  },
  fall: {
    leftLegX: 5, rightLegX: 22, legTop: 30,
    leftShoeY: 44, rightShoeY: 44,
    leftArmX: 2, rightArmX: 26, armY: 20,
  },
};

export const characterTextureKey = (id: CharacterId): string => `player-${id}-poses`;

/**
 * Folha de poses 32 × 48. Em pixel tão baixo o brasão vira mancha; o uniforme
 * lê por silhueta e cor (SPEC 5b).
 */
export function ensureCharacterTexture(scene: Phaser.Scene, id: CharacterId): string {
  const key = characterTextureKey(id);
  if (scene.textures.exists(key)) return key;

  const texture = scene.textures.createCanvas(key, PLAYER_WIDTH * CHARACTER_POSES.length, PLAYER_HEIGHT);
  if (!texture) return key;

  const ctx = texture.getContext();
  ctx.clearRect(0, 0, PLAYER_WIDTH * CHARACTER_POSES.length, PLAYER_HEIGHT);

  for (const [index, pose] of CHARACTER_POSES.entries()) {
    const ox = index * PLAYER_WIDTH;
    drawCharacter(ctx, id, pose, ox);
    texture.add(pose, 0, ox, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
  }

  texture.refresh();
  return key;
}

function drawCharacter(
  ctx: CanvasRenderingContext2D,
  id: CharacterId,
  pose: CharacterPose,
  ox: number,
): void {
  const look = LOOK[id];
  const limb = LIMB[pose];

  drawLeg(ctx, ox, look, limb.leftLegX, limb.legTop, limb.leftShoeY);
  drawLeg(ctx, ox, look, limb.rightLegX, limb.legTop, limb.rightShoeY);

  ctx.fillStyle = PALETTE.shirt;
  ctx.fillRect(ox + 8, 18, 16, 13);
  drawArm(ctx, ox, look.skin, limb.leftArmX, limb.armY);
  drawArm(ctx, ox, look.skin, limb.rightArmX, limb.armY);

  ctx.fillStyle = PALETTE.navy;
  ctx.fillRect(ox + 11, 18, 10, 3);

  ctx.fillStyle = look.skin;
  ctx.fillRect(ox + 10, 6, 12, 12);

  ctx.fillStyle = look.hair;
  ctx.fillRect(ox + 9, 3, 14, 5);
  if (id === 'ana') {
    ctx.fillRect(ox + 8, 6, 2, 10);
    ctx.fillRect(ox + 22, 6, 2, 10);
    ctx.fillRect(ox + 13, 0, 6, 3);
  }

  ctx.fillStyle = PALETTE.night;
  ctx.fillRect(ox + 13, 11, 2, 2);
  ctx.fillRect(ox + 18, 11, 2, 2);

  ctx.fillStyle = PALETTE.cyan;
  ctx.fillRect(ox + 11, 18, 2, 12);
  if (id === 'ana') ctx.fillRect(ox + 19, 18, 2, 12);
}

function drawLeg(
  ctx: CanvasRenderingContext2D,
  ox: number,
  look: (typeof LOOK)[CharacterId],
  x: number,
  top: number,
  shoeY: number,
): void {
  const bar = Math.min(look.hem, shoeY);
  ctx.fillStyle = PALETTE.deep;
  const pant = Math.max(0, bar - top);
  if (pant > 0) ctx.fillRect(ox + x, top, 5, pant);
  ctx.fillStyle = look.skin;
  const skin = Math.max(0, shoeY - bar);
  if (skin > 0) ctx.fillRect(ox + x, bar, 5, skin);
  ctx.fillStyle = PALETTE.sneaker;
  ctx.fillRect(ox + x - 1, shoeY, 7, 4);
}

function drawArm(
  ctx: CanvasRenderingContext2D,
  ox: number,
  skin: string,
  x: number,
  y: number,
): void {
  ctx.fillStyle = PALETTE.shirt;
  ctx.fillRect(ox + x, y, 4, 8);
  ctx.fillStyle = PALETTE.navy;
  ctx.fillRect(ox + x, y + 8, 4, 3);
  ctx.fillStyle = skin;
  ctx.fillRect(ox + x, y + 11, 4, 4);
}
