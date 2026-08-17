import type Phaser from 'phaser';
import type { LevelSpec } from '@/game/levels/reach';
import type { GameMode } from '@/store/useGameStore.types';
import { CalcPanel } from '@/game/mechanisms/CalcPanel';
import { Bridge } from '@/game/mechanisms/Bridge';
import { Blocks } from '@/game/mechanisms/Blocks';
import { Whirlwind } from '@/game/mechanisms/Whirlwind';
import { Guardian } from '@/game/mechanisms/Guardian';
import { GoldenDigit } from '@/game/mechanisms/GoldenDigit';
import { Checkpoint } from '@/game/mechanisms/Checkpoint';

/** Tudo que a fase põe no mundo. A cena guarda isto e cuida do resto. */
export type LevelParts = {
  panels: CalcPanel[];
  bridges: Map<string, Bridge>;
  blocks: Map<string, Blocks>;
  winds: Map<string, Whirlwind>;
  guardians: Map<string, Guardian>;
  digits: GoldenDigit[];
  flags: Checkpoint[];
};

/**
 * Monta o mundo da fase. Só construção: nada aqui lê input, roda tween de
 * resultado ou fala com store — isso é da cena.
 */
export function buildLevel(
  scene: Phaser.Scene,
  level: LevelSpec,
  mode: GameMode,
  platforms: Phaser.Physics.Arcade.StaticGroup,
): LevelParts {
  const parts: LevelParts = {
    panels: [],
    bridges: new Map(),
    blocks: new Map(),
    winds: new Map(),
    guardians: new Map(),
    digits: [],
    flags: [],
  };

  for (const mechanism of level.mechanisms) {
    parts.panels.push(
      new CalcPanel(
        scene,
        mechanism.id,
        mechanism.panel.x,
        mechanism.panel.y,
        mechanism.kind === 'porta' ? 'porta' : 'painel',
      ),
    );

    switch (mechanism.kind) {
      case 'ponte':
        parts.bridges.set(mechanism.id, new Bridge(scene, platforms, mechanism.platform));
        break;
      case 'blocos':
        parts.blocks.set(mechanism.id, new Blocks(scene, platforms, mechanism.origin));
        break;
      case 'ventania':
        parts.winds.set(mechanism.id, new Whirlwind(scene, mechanism.origin));
        break;
      case 'porta':
        break;
    }
  }

  // Guardiões só existem no modo Aventura — é o botão da tela de título.
  if (mode === 'aventura') {
    for (const spec of level.guardians) {
      parts.guardians.set(spec.id, new Guardian(scene, spec.id, spec.at));
    }
  }

  level.digits.forEach((at, index) => {
    parts.digits.push(new GoldenDigit(scene, at, String(index + 1)));
  });
  for (const at of level.checkpoints) parts.flags.push(new Checkpoint(scene, at));

  return parts;
}
