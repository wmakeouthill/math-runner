import Phaser from 'phaser';
import { GAME_FEEL, GAME_SIZE } from '@/game/constants';
import { JumpController } from '@/game/systems/JumpController';
import { InputSystem } from '@/game/systems/InputSystem';
import { LEVEL_1_1 } from '@/game/levels/level-1-1';
import type { PlatformSpec } from '@/game/levels/reach';
import { ensureCharacterTexture } from '@/game/art/characterTexture';
import { createBackdrop } from '@/game/art/backdrop';
import { CalcPanel } from '@/game/mechanisms/CalcPanel';
import { Bridge } from '@/game/mechanisms/Bridge';
import { generateQuestion } from '@/game/math/mathEngine';
import { PALETTE, toPhaserColor } from '@/theme/palette';
import { useGameStore } from '@/store/useGameStore';
import { useChallengeStore } from '@/store/useChallengeStore';
import type { ChallengeOutcome } from '@/store/useChallengeStore.types';

export class LevelScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private controls!: InputSystem;
  private readonly jump = new JumpController();
  private readonly panels: CalcPanel[] = [];
  private readonly bridges = new Map<string, Bridge>();
  private unsubscribe: (() => void) | null = null;

  constructor() {
    super('LevelScene');
  }

  create(): void {
    // create() roda de novo em scene.restart(); sem isto os painéis duplicam.
    this.panels.length = 0;
    this.bridges.clear();

    this.cameras.main.setBackgroundColor(PALETTE.sky);
    createBackdrop(this, LEVEL_1_1.worldWidth);

    const platforms = this.physics.add.staticGroup();
    for (const spec of LEVEL_1_1.platforms) this.addPlatform(platforms, spec);

    for (const mechanism of LEVEL_1_1.mechanisms) {
      this.panels.push(new CalcPanel(this, mechanism.id, mechanism.panel.x, mechanism.panel.y));
      this.bridges.set(mechanism.id, new Bridge(this, platforms, mechanism.platform));
    }

    const textureKey = ensureCharacterTexture(this, useGameStore.getState().character);
    const { spawn, worldWidth } = LEVEL_1_1;

    this.player = this.physics.add.sprite(spawn.x, spawn.y, textureKey);
    this.player.setDisplaySize(32, 48);
    this.player.setCollideWorldBounds(false);
    this.physics.add.collider(this.player, platforms);

    this.physics.world.setBounds(0, 0, worldWidth, GAME_SIZE.height);
    this.cameras.main.setBounds(0, 0, worldWidth, GAME_SIZE.height);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setFollowOffset(-80, 0);

    this.controls = new InputSystem(this);
    this.unsubscribe = useChallengeStore.subscribe((state, previous) => {
      if (state.outcome !== null && state.outcome !== previous.outcome) {
        this.applyOutcome(state.outcome);
      }
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.controls.destroy();
      this.unsubscribe?.();
      useChallengeStore.getState().close();
    });
  }

  /** Corpo de terra com capim em cima. Só o corpo entra na colisão. */
  private addPlatform(group: Phaser.Physics.Arcade.StaticGroup, spec: PlatformSpec): void {
    const body = this.add.rectangle(
      spec.x,
      spec.y,
      spec.width,
      spec.height,
      toPhaserColor(PALETTE.dirt),
    );
    group.add(body);

    this.add.rectangle(
      spec.x,
      spec.y - spec.height / 2 + 4,
      spec.width,
      8,
      toPhaserColor(PALETTE.grass),
    );
  }

  private applyOutcome(outcome: ChallengeOutcome): void {
    if (!outcome.correct) {
      this.cameras.main.shake(140, 0.005);
      return;
    }

    this.bridges.get(outcome.source)?.lower();
    for (const panel of this.panels) {
      if (panel.source === outcome.source) panel.markSolved();
    }
    useChallengeStore.getState().close();
  }

  private openChallenge(panel: CalcPanel): void {
    const mechanism = LEVEL_1_1.mechanisms.find((item) => item.id === panel.source);
    if (!mechanism) return;

    useChallengeStore
      .getState()
      .open(mechanism.id, generateQuestion(mechanism.op, mechanism.tier));
  }

  override update(_time: number, delta: number): void {
    const state = this.controls.read();

    // Com a conta aberta o mundo para: o card é do rodapé, mas o foco é dele.
    if (useChallengeStore.getState().challenge !== null) {
      this.player.setVelocityX(0);
      this.controls.endFrame();
      return;
    }

    const nearby = this.panels.filter((panel) =>
      panel.updateProximity(this.player.x, this.player.y),
    );
    const target = nearby[0];
    if (target && state.interactJustPressed) this.openChallenge(target);

    const body = this.player.body;
    const direction = Number(state.right) - Number(state.left);
    this.player.setVelocityX(direction * GAME_FEEL.moveSpeed);

    const command = this.jump.update(
      delta,
      body.blocked.down || body.touching.down,
      { justPressed: state.jumpJustPressed, justReleased: state.jumpJustReleased },
      body.velocity.y,
    );

    if (command.type === 'start') {
      this.player.setVelocityY(GAME_FEEL.jumpVelocity);
    } else if (command.type === 'cut') {
      this.player.setVelocityY(body.velocity.y * GAME_FEEL.jumpCutMultiplier);
    }

    if (this.player.y > GAME_SIZE.height + 200) this.respawn();

    this.controls.endFrame();
  }

  private respawn(): void {
    this.player.setPosition(LEVEL_1_1.spawn.x, LEVEL_1_1.spawn.y);
    this.player.setVelocity(0, 0);
    this.jump.reset();
  }
}
