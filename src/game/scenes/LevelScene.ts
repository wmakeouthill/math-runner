import Phaser from 'phaser';
import { GAME_FEEL, GAME_SIZE } from '@/game/constants';
import { JumpController } from '@/game/systems/JumpController';
import { InputSystem } from '@/game/systems/InputSystem';
import { levelById, LEVEL_ORDER } from '@/game/levels';
import type { LevelSpec, PlatformSpec, Point } from '@/game/levels/reach';
import { ensureCharacterTexture } from '@/game/art/characterTexture';
import { createBackdrop } from '@/game/art/backdrop';
import { CalcPanel } from '@/game/mechanisms/CalcPanel';
import { Bridge } from '@/game/mechanisms/Bridge';
import { Blocks } from '@/game/mechanisms/Blocks';
import { GoldenDigit } from '@/game/mechanisms/GoldenDigit';
import { Checkpoint } from '@/game/mechanisms/Checkpoint';
import { generateQuestion } from '@/game/math/mathEngine';
import { PALETTE, toPhaserColor } from '@/theme/palette';
import { useGameStore } from '@/store/useGameStore';
import { useRunStore } from '@/store/useRunStore';
import { useChallengeStore } from '@/store/useChallengeStore';
import type { ChallengeOutcome } from '@/store/useChallengeStore.types';
import { shouldHandleOutcome } from './challengeOutcome';
import { playSfx } from '@/game/audio/audio';
import { burst } from '@/game/art/spark';

/** Tempo que a porta leva para abrir antes de a tela de resultado subir. */
const DOOR_MS = 620;

export class LevelScene extends Phaser.Scene {
  private level: LevelSpec = LEVEL_ORDER[0];
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private controls!: InputSystem;
  private readonly jump = new JumpController();
  private readonly panels: CalcPanel[] = [];
  private readonly bridges = new Map<string, Bridge>();
  private readonly blocks = new Map<string, Blocks>();
  private readonly digits: GoldenDigit[] = [];
  private readonly checkpoints: Checkpoint[] = [];
  /** Anda para a última bandeira tocada. */
  private spawnPoint: Point = LEVEL_ORDER[0].spawn;
  private unsubscribe: (() => void) | null = null;

  constructor() {
    super('LevelScene');
  }

  create(): void {
    // create() roda de novo em scene.restart(); sem isto os painéis duplicam.
    this.panels.length = 0;
    this.bridges.clear();
    this.blocks.clear();
    this.digits.length = 0;
    this.checkpoints.length = 0;

    this.level = levelById(useGameStore.getState().currentLevel) ?? LEVEL_ORDER[0];
    this.spawnPoint = this.level.spawn;
    useRunStore.getState().begin(this.level.id, this.level.digits.length);

    this.cameras.main.setBackgroundColor(PALETTE.sky);
    createBackdrop(this, this.level.worldWidth);

    const platforms = this.physics.add.staticGroup();
    for (const spec of this.level.platforms) this.addPlatform(platforms, spec);

    for (const mechanism of this.level.mechanisms) {
      this.panels.push(
        new CalcPanel(
          this,
          mechanism.id,
          mechanism.panel.x,
          mechanism.panel.y,
          mechanism.kind === 'porta' ? 'porta' : 'painel',
        ),
      );

      if (mechanism.kind === 'ponte') {
        this.bridges.set(mechanism.id, new Bridge(this, platforms, mechanism.platform));
      } else if (mechanism.kind === 'blocos') {
        this.blocks.set(mechanism.id, new Blocks(this, platforms, mechanism.origin));
      }
    }

    for (const at of this.level.checkpoints) this.checkpoints.push(new Checkpoint(this, at));
    this.level.digits.forEach((at, index) => {
      this.digits.push(new GoldenDigit(this, at, String(index + 1)));
    });

    const textureKey = ensureCharacterTexture(this, useGameStore.getState().character);
    const { spawn, worldWidth } = this.level;

    this.player = this.physics.add.sprite(spawn.x, spawn.y, textureKey);
    this.player.setDisplaySize(32, 48);
    this.player.setCollideWorldBounds(false);
    this.physics.add.collider(this.player, platforms);

    this.physics.world.setBounds(0, 0, worldWidth, GAME_SIZE.height);
    this.cameras.main.setBounds(0, 0, worldWidth, GAME_SIZE.height);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setFollowOffset(-80, 0);

    this.controls = new InputSystem(this);
    this.unsubscribe?.();
    this.unsubscribe = useChallengeStore.subscribe((state, previous) => {
      if (!shouldHandleOutcome(this.sys.isActive(), state.outcome, previous.outcome)) {
        return;
      }
      this.applyOutcome(state.outcome);
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

  /** O destroy do Phaser é no próximo frame; o subscribe precisa sair agora. */
  detachChallengeListener(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  private applyOutcome(outcome: ChallengeOutcome): void {
    if (!outcome.correct) {
      playSfx('errado');
      this.cameras.main.shake(140, 0.005);
      useRunStore.getState().addError();
      return;
    }

    playSfx('certo');

    // Mecanismo primeiro: se o setText do painel explodir numa cena
    // destruída, a ponte da cena viva ainda precisa descer.
    const mechanism = this.level.mechanisms.find((item) => item.id === outcome.source);
    switch (mechanism?.kind) {
      case 'ponte':
        playSfx('ponte');
        this.bridges.get(mechanism.id)?.lower();
        this.time.delayedCall(560, () =>
          burst(this, mechanism.platform.x, mechanism.platform.y, toPhaserColor(PALETTE.dirt), 20),
        );
        break;
      case 'blocos':
        playSfx('blocos');
        this.blocks.get(mechanism.id)?.raise(outcome.answer);
        break;
      case 'porta':
        playSfx('porta');
        this.time.delayedCall(DOOR_MS, () => useRunStore.getState().finish());
        break;
    }

    for (const panel of this.panels) {
      if (panel.source === outcome.source) panel.markSolved();
    }
    useChallengeStore.getState().close();
  }

  private openChallenge(panel: CalcPanel): void {
    const mechanism = this.level.mechanisms.find((item) => item.id === panel.source);
    if (!mechanism) return;

    useChallengeStore
      .getState()
      .open(mechanism.id, generateQuestion(mechanism.op, mechanism.tier));
  }

  override update(_time: number, delta: number): void {
    const state = this.controls.read();

    // Com a conta aberta, ou a fase já vencida, o mundo para.
    if (
      useChallengeStore.getState().challenge !== null ||
      useRunStore.getState().result !== null
    ) {
      this.player.setVelocityX(0);
      this.controls.endFrame();
      return;
    }

    for (const digit of this.digits) {
      if (digit.tryCollect(this.player.x, this.player.y)) {
        playSfx('moeda');
        burst(this, digit.at.x, digit.at.y, toPhaserColor(PALETTE.gold), 18);
        useRunStore.getState().takeDigit();
      }
    }

    for (const flag of this.checkpoints) {
      if (flag.tryActivate(this.player.x, this.player.y)) {
        playSfx('bandeira');
        burst(this, flag.at.x, flag.at.y - 20, toPhaserColor(PALETTE.cyan), 12);
        this.spawnPoint = { x: flag.at.x, y: flag.at.y - 40 };
      }
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
      playSfx('pulo');
      this.player.setVelocityY(GAME_FEEL.jumpVelocity);
    } else if (command.type === 'cut') {
      this.player.setVelocityY(body.velocity.y * GAME_FEEL.jumpCutMultiplier);
    }

    if (this.player.y > GAME_SIZE.height + 200) this.respawn();

    this.controls.endFrame();
  }

  private respawn(): void {
    this.player.setPosition(this.spawnPoint.x, this.spawnPoint.y);
    this.player.setVelocity(0, 0);
    this.jump.reset();
    this.cameras.main.flash(180, 20, 30, 70);
  }
}
