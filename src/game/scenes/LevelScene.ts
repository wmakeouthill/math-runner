import Phaser from 'phaser';
import { GAME_FEEL, GAME_SIZE } from '@/game/constants';
import { JumpController } from '@/game/systems/JumpController';
import { InputSystem } from '@/game/systems/InputSystem';
import { levelById, LEVEL_ORDER } from '@/game/levels';
import type { LevelSpec, PlatformSpec, Point } from '@/game/levels/reach';
import { FLIGHT } from '@/game/levels/reach';
import type { Op } from '@/game/math/mathEngine.types';
import { PLAYER_HEIGHT, PLAYER_WIDTH } from '@/game/art/characterTexture';
import { ensurePlayerAnims, ensureWingAnims, syncPlayerVisuals } from '@/game/art/characterAnims';
import type { CharacterId } from '@/store/useGameStore.types';
import { createBackdrop } from '@/game/art/backdrop';
import { THEMES } from '@/game/art/themes';
import { CalcPanel } from '@/game/mechanisms/CalcPanel';
import { Bridge } from '@/game/mechanisms/Bridge';
import { Blocks } from '@/game/mechanisms/Blocks';
import { GoldenDigit } from '@/game/mechanisms/GoldenDigit';
import { Checkpoint } from '@/game/mechanisms/Checkpoint';
import { Guardian } from '@/game/mechanisms/Guardian';
import { Whirlwind } from '@/game/mechanisms/Whirlwind';
import { buildLevel } from './buildLevel';
import { generateQuestion } from '@/game/math/mathEngine';
import { effectiveTier } from '@/game/math/difficulty';
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

/** As operações que a fase usa. O chefe cobra do que a fase ensinou. */
function pickOp(level: LevelSpec): Op {
  const ops = [...new Set(level.mechanisms.map((m) => m.op))];
  return ops[Math.floor(Math.random() * ops.length)] ?? '+';
}

export class LevelScene extends Phaser.Scene {
  private level: LevelSpec = LEVEL_ORDER[0];
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private controls!: InputSystem;
  private readonly jump = new JumpController();
  private panels: CalcPanel[] = [];
  private bridges = new Map<string, Bridge>();
  private blocks = new Map<string, Blocks>();
  private digits: GoldenDigit[] = [];
  private flags: Checkpoint[] = [];
  private guardians = new Map<string, Guardian>();
  private winds = new Map<string, Whirlwind>();
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  /** Timestamp em que a ventania para de sustentar o jogador. */
  private flightUntil = 0;
  /** Anda para a última bandeira tocada. */
  private spawnPoint: Point = LEVEL_ORDER[0].spawn;
  private unsubscribe: (() => void) | null = null;
  /** Entre a porta abrir e o card subir o jogador não controla mais nada. */
  private finishing = false;
  private characterId: CharacterId = 'ana';
  private facing: 1 | -1 = 1;
  private wings!: Phaser.GameObjects.Sprite;

  constructor() {
    super('LevelScene');
  }

  create(): void {
    this.flightUntil = 0;
    this.finishing = false;
    this.facing = 1;

    this.level = levelById(useGameStore.getState().currentLevel) ?? LEVEL_ORDER[0];
    this.spawnPoint = this.level.spawn;
    useRunStore.getState().begin(this.level.id, this.level.digits.length);

    this.cameras.main.setBackgroundColor(THEMES[this.level.theme].sky);
    createBackdrop(this, this.level.worldWidth, this.level.theme);

    this.platforms = this.physics.add.staticGroup();
    for (const spec of this.level.platforms) this.addPlatform(this.platforms, spec);

    const parts = buildLevel(
      this,
      this.level,
      useGameStore.getState().mode,
      useGameStore.getState().difficulty,
      this.platforms,
    );
    this.panels = parts.panels;
    this.bridges = parts.bridges;
    this.blocks = parts.blocks;
    this.winds = parts.winds;
    this.guardians = parts.guardians;
    this.digits = parts.digits;
    this.flags = parts.flags;

    this.characterId = useGameStore.getState().character;
    const textureKey = ensurePlayerAnims(this, this.characterId);
    const { spawn, worldWidth } = this.level;

    this.player = this.physics.add.sprite(spawn.x, spawn.y, textureKey, 'idle');
    this.player.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
    this.player.setSize(PLAYER_WIDTH, PLAYER_HEIGHT);
    this.player.setDepth(2);
    this.player.setCollideWorldBounds(false);

    this.wings = this.add.sprite(spawn.x, spawn.y, ensureWingAnims(this), 'up');
    this.wings.setVisible(false);
    this.wings.setDepth(1);
    this.physics.add.collider(this.player, this.platforms);

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
    const guardian = this.guardians.get(outcome.source);
    if (guardian) {
      const spec = this.level.guardians.find((item) => item.id === outcome.source);
      // A dificuldade adaptativa vale para a conta do guardião também.
      if (spec) useGameStore.getState().recordAnswer(spec.op, outcome.correct);

      if (outcome.correct) {
        playSfx('certo');
        useChallengeStore.getState().close();

        if (!guardian.scoreRound()) {
          // Chefe ainda de pé: a próxima conta vem na hora, sem sair do lugar.
          burst(this, guardian.at.x, guardian.at.y - 20, toPhaserColor(PALETTE.gold), 10);
          this.time.delayedCall(420, () => this.askGuardian(guardian.id));
          return;
        }

        guardian.defeat();
        burst(this, guardian.at.x, guardian.at.y, toPhaserColor(PALETTE.cyan), 24);
        return;
      }

      playSfx('errado');
      guardian.taunt();
      this.cameras.main.shake(140, 0.005);
      useRunStore.getState().addError();

      // Sem corações o jogador volta para a bandeira — e recomeça inteiro.
      if (!useRunStore.getState().loseHeart()) {
        useChallengeStore.getState().close();
        useRunStore.getState().refillHearts();
        this.respawn();
      }
      return;
    }

    const mechanism = this.level.mechanisms.find((item) => item.id === outcome.source);
    if (mechanism) useGameStore.getState().recordAnswer(mechanism.op, outcome.correct);

    if (!outcome.correct) {
      playSfx('errado');
      this.cameras.main.shake(140, 0.005);
      useRunStore.getState().addError();
      return;
    }

    playSfx('certo');

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
        this.blocks.get(mechanism.id)?.raise(mechanism.steps);
        break;
      case 'porta':
        this.celebrate(mechanism.panel);
        break;
      case 'ventania':
        playSfx('blocos');
        this.winds.get(mechanism.id)?.release();
        break;
    }

    for (const panel of this.panels) {
      if (panel.source === outcome.source) panel.markSolved();
    }
    useChallengeStore.getState().close();
  }

  /** Câmera fecha na porta, o personagem entra, confete, fanfarra, resultado. */
  private celebrate(door: Point): void {
    this.finishing = true;
    this.player.setVelocity(0, 0);
    this.player.body.setAllowGravity(false);

    const camera = this.cameras.main;
    camera.stopFollow();
    camera.pan(door.x, door.y - 30, 420, 'Sine.easeInOut');
    camera.zoomTo(1.3, 620, 'Sine.easeInOut');

    this.tweens.add({
      targets: this.player,
      x: door.x,
      y: door.y - 20,
      alpha: 0,
      duration: 520,
      delay: 160,
      ease: 'Quad.easeIn',
    });

    this.time.delayedCall(DOOR_MS + 200, () => {
      burst(this, door.x, door.y - 50, toPhaserColor(PALETTE.gold), 34);
      burst(this, door.x - 40, door.y - 60, toPhaserColor(PALETTE.cyan), 22);
      playSfx('fase');
      useRunStore.getState().finish();
    });
  }

  private openChallenge(panel: CalcPanel): void {
    const mechanism = this.level.mechanisms.find((item) => item.id === panel.source);
    if (!mechanism) return;

    const { playerTier, difficulty } = useGameStore.getState();
    const player = playerTier[mechanism.op];
    if (player === undefined) return;
    const tier = effectiveTier(mechanism.tier, player, difficulty);

    useChallengeStore.getState().open(mechanism.id, generateQuestion(mechanism.op, tier));
  }

  /** Abre a conta de um monstro. O chefe sorteia a operação a cada rodada. */
  private askGuardian(id: string): void {
    const spec = this.level.guardians.find((item) => item.id === id);
    if (!spec) return;

    const { playerTier, difficulty } = useGameStore.getState();
    // O Curupira cobra as quatro operações; o resto cobra a sua.
    const op = spec.kind === 'curupira' ? pickOp(this.level) : spec.op;
    const player = playerTier[op];
    if (player === undefined) return;
    const tier = effectiveTier(spec.tier, player, difficulty);

    useChallengeStore.getState().open(spec.id, generateQuestion(op, tier));
  }

  override update(_time: number, delta: number): void {
    const state = this.controls.read();

    // Com a conta aberta, ou a fase já vencida, o mundo para.
    if (
      this.finishing ||
      useChallengeStore.getState().challenge !== null ||
      useRunStore.getState().result !== null
    ) {
      this.player.setVelocityX(0);
      this.syncVisuals(false);
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

    for (const flag of this.flags) {
      if (flag.tryActivate(this.player.x, this.player.y)) {
        playSfx('bandeira');
        burst(this, flag.at.x, flag.at.y - 20, toPhaserColor(PALETTE.cyan), 12);
        this.spawnPoint = { x: flag.at.x, y: flag.at.y - 40 };
      }
    }

    for (const guardian of this.guardians.values()) {
      if (!guardian.isBlocking(this.player.x, this.player.y)) continue;
      this.askGuardian(guardian.id);
      break;
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

    // Dentro do redemoinho o relógio do voo reinicia; fora dele, o que sobrou
    // ainda vale — quem sai voando não cai no meio do caminho.
    for (const wind of this.winds.values()) {
      if (wind.holds(this.player.x, this.player.y)) {
        this.flightUntil = this.time.now + Whirlwind.durationMs;
        break;
      }
    }

    if (this.time.now < this.flightUntil && state.jumpHeld) {
      this.player.setVelocityY(-FLIGHT.riseSpeed);
    }

    if (command.type === 'start') {
      playSfx('pulo');
      this.player.setVelocityY(GAME_FEEL.jumpVelocity);
    } else if (command.type === 'cut') {
      this.player.setVelocityY(body.velocity.y * GAME_FEEL.jumpCutMultiplier);
    }

    if (this.player.y > GAME_SIZE.height + 200) this.respawn();

    this.syncVisuals(this.time.now < this.flightUntil && state.jumpHeld);
    this.controls.endFrame();
  }

  private syncVisuals(flying: boolean): void {
    const body = this.player.body;
    this.facing = syncPlayerVisuals(
      this.player,
      this.wings,
      this.characterId,
      {
        grounded: body.blocked.down || body.touching.down,
        vx: body.velocity.x,
        vy: body.velocity.y,
        flying,
      },
      this.facing,
    );
  }

  private respawn(): void {
    this.player.setPosition(this.spawnPoint.x, this.spawnPoint.y);
    this.player.setVelocity(0, 0);
    this.jump.reset();
    this.cameras.main.flash(180, 20, 30, 70);
  }
}
