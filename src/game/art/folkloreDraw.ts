import Phaser from 'phaser';
import { PALETTE, toPhaserColor } from '@/theme/palette';
import type { FolkKind } from '@/game/art/folklore';

const cor = toPhaserColor;

/**
 * Um monstro montado: a poeira que fica no chão e a figura que flutua.
 *
 * A separação existe porque as duas animam diferente — a figura sobe e desce,
 * a poeira gira e estica. É a estrutura que o Saci já usa.
 */
export type FolkArt = {
  dust: Phaser.GameObjects.GameObject[];
  figure: Phaser.GameObjects.Container;
};

/** Cada monstro em primitivas do Phaser. Nenhum arquivo de imagem. */
export function drawFolk(scene: Phaser.Scene, kind: FolkKind): FolkArt {
  switch (kind) {
    case 'saci': {
      const foot = scene.add.ellipse(3, 20, 16, 7, cor(PALETTE.night));
      const leg = scene.add.rectangle(0, 10, 8, 18, cor(PALETTE.night));
      const torso = scene.add.ellipse(0, -6, 26, 30, cor(PALETTE.hairJunior));
      const head = scene.add.circle(0, -24, 11, cor(PALETTE.skinAna));
      const eyeL = scene.add.rectangle(-4, -26, 3, 3, cor(PALETTE.night));
      const eyeR = scene.add.rectangle(4, -26, 3, 3, cor(PALETTE.night));
      const smile = scene.add.rectangle(0, -20, 7, 2, cor(PALETTE.night));
      const cap = scene.add.triangle(1, -36, 0, 18, 16, -8, 28, 18, cor(PALETTE.saci));
      const pompom = scene.add.circle(16, -46, 5, cor(PALETTE.shirt));
      const pipe = scene.add.rectangle(13, -18, 11, 3, cor(PALETTE.wall));
      const bowl = scene.add.circle(19, -18, 3, cor(PALETTE.steel));

      return {
        dust: [
          scene.add.ellipse(0, 20, 52, 16, cor(PALETTE.faint), 0.5),
          scene.add.ellipse(0, 22, 34, 10, cor(PALETTE.dirt), 0.55),
        ],
        figure: scene.add.container(0, 0, [
          leg, foot, torso, head, eyeL, eyeR, smile, cap, pompom, pipe, bowl,
        ]),
      };
    }

    case 'cuca': {
      const corpo = scene.add.ellipse(0, -2, 34, 40, cor(PALETTE.cucaGreen));
      const focinho = scene.add.rectangle(16, -6, 26, 12, cor(PALETTE.cucaGreen));
      const dente = scene.add.triangle(22, -1, 0, -4, 5, -4, 2, 3, cor(PALETTE.shirt));
      const cabelo = scene.add.ellipse(-6, -30, 40, 22, cor(PALETTE.cucaHair));
      const olhoL = scene.add.circle(8, -18, 4, cor(PALETTE.ink));
      const olhoR = scene.add.circle(19, -18, 4, cor(PALETTE.ink));
      const garra = scene.add.rectangle(-16, 12, 10, 6, cor(PALETTE.cucaGreen));

      return {
        dust: [scene.add.ellipse(0, 20, 48, 14, cor(PALETTE.cucaGreen), 0.35)],
        figure: scene.add.container(0, 0, [corpo, garra, focinho, dente, cabelo, olhoL, olhoR]),
      };
    }

    case 'boitata': {
      const anelA = scene.add.ellipse(-14, 8, 30, 18, cor(PALETTE.boitataFire));
      const anelB = scene.add.ellipse(4, -6, 30, 18, cor(PALETTE.boitataFire));
      const cabeca = scene.add.ellipse(18, -22, 28, 17, cor(PALETTE.boitataFire));
      const chama = scene.add.triangle(18, -36, 0, 10, 7, -10, 14, 10, cor(PALETTE.boitataGlow));
      const olho = scene.add.circle(26, -24, 3.5, cor(PALETTE.ink));

      return {
        dust: [scene.add.ellipse(0, 20, 60, 18, cor(PALETTE.boitataGlow), 0.4)],
        figure: scene.add.container(0, 0, [anelA, anelB, cabeca, chama, olho]),
      };
    }

    case 'boto': {
      const corpo = scene.add.ellipse(0, -4, 46, 26, cor(PALETTE.botoPink));
      const bico = scene.add.triangle(26, -2, 0, -5, 18, 0, 0, 5, cor(PALETTE.botoPink));
      const nadadeira = scene.add.triangle(-4, -20, 0, 8, 9, -9, 18, 8, cor(PALETTE.botoPink));
      const aba = scene.add.rectangle(-4, -24, 32, 5, cor(PALETTE.wall));
      const copa = scene.add.rectangle(-4, -32, 18, 13, cor(PALETTE.wall));
      const olho = scene.add.circle(12, -7, 3, cor(PALETTE.ink));

      return {
        dust: [scene.add.ellipse(0, 20, 52, 14, cor(PALETTE.cyan), 0.3)],
        figure: scene.add.container(0, 0, [nadadeira, corpo, bico, aba, copa, olho]),
      };
    }

    case 'curupira': {
      const peL = scene.add.triangle(-11, 20, 0, 0, 17, 0, 17, -8, cor(PALETTE.curupiraSkin));
      const peR = scene.add.triangle(11, 20, 0, 0, -17, 0, -17, -8, cor(PALETTE.curupiraSkin));
      const corpo = scene.add.ellipse(0, -2, 32, 42, cor(PALETTE.curupiraSkin));
      const cabelo = scene.add.circle(0, -32, 21, cor(PALETTE.curupiraHair));
      const rosto = scene.add.circle(0, -26, 12, cor(PALETTE.curupiraSkin));
      const olhoL = scene.add.circle(-5, -28, 3, cor(PALETTE.ink));
      const olhoR = scene.add.circle(5, -28, 3, cor(PALETTE.ink));

      return {
        dust: [scene.add.ellipse(0, 22, 62, 16, cor(PALETTE.grassDark), 0.45)],
        figure: scene.add.container(0, 0, [peL, peR, corpo, cabelo, rosto, olhoL, olhoR]),
      };
    }
  }
}
