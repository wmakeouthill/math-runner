import Phaser from 'phaser';
import type { CharacterId } from '@/store/useGameStore.types';
import { ensureCharacterTexture } from '@/game/art/characterTexture';
import { ensureWingTexture } from '@/game/art/wingTexture';
import { facingFor, visualFor } from '@/game/art/playerPose';
import type { Motion } from '@/game/art/playerPose';

const WING_ANIM = 'asas';

export function ensurePlayerAnims(scene: Phaser.Scene, id: CharacterId): string {
  const key = ensureCharacterTexture(scene, id);
  if (scene.anims.exists(`${id}-walk`)) return key;

  scene.anims.create({
    key: `${id}-idle`,
    frames: [{ key, frame: 'idle' }],
  });
  scene.anims.create({
    key: `${id}-walk`,
    frames: [
      { key, frame: 'walkA' },
      { key, frame: 'walkB' },
    ],
    frameRate: 8,
    repeat: -1,
  });
  scene.anims.create({
    key: `${id}-jump`,
    frames: [{ key, frame: 'jump' }],
  });
  scene.anims.create({
    key: `${id}-fall`,
    frames: [{ key, frame: 'fall' }],
  });
  return key;
}

export function ensureWingAnims(scene: Phaser.Scene): string {
  const key = ensureWingTexture(scene);
  if (!scene.anims.exists(WING_ANIM)) {
    scene.anims.create({
      key: WING_ANIM,
      frames: [
        { key, frame: 'up' },
        { key, frame: 'down' },
      ],
      frameRate: 14,
      repeat: -1,
    });
  }
  return key;
}

export function syncPlayerVisuals(
  player: Phaser.Physics.Arcade.Sprite,
  wings: Phaser.GameObjects.Sprite,
  characterId: CharacterId,
  motion: Motion,
  facing: 1 | -1,
): 1 | -1 {
  const next = facingFor(motion.vx, facing);
  const visual = visualFor(motion);
  const anim = `${characterId}-${visual.anim}`;

  player.setFlipX(next === -1);
  player.play(anim, true);

  wings.setVisible(visual.wings);
  wings.setPosition(player.x + (next === 1 ? -10 : 10), player.y - 2);
  wings.setFlipX(next === -1);
  if (visual.wings) wings.play(WING_ANIM, true);

  return next;
}
