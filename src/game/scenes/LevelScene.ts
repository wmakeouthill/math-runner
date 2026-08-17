import Phaser from 'phaser';
import { GAME_FEEL, GAME_SIZE } from '@/game/constants';
import { JumpController } from '@/game/systems/JumpController';
import { InputSystem } from '@/game/systems/InputSystem';
import { levelById, LEVEL_ORDER } from '@/game/levels';
import type { LevelSpec, PlatformSpec, Point } from '@/game/levels/reach';
import { FLIGHT } from '@/game/levels/reach';
import { PLAYER_HEIGHT, PLAYER_WIDTH } from '@/game/art/characterTexture';
import { ensurePlayerAnims, ensureWingAnims, syncPlayerVisuals } from '@/game/art/characterAnims';
import type { CharacterId } from '@/store/useGameStore.types';
import { createBackdrop } from '@/game/art/backdrop';
import { CalcPanel } from '@/game/mechanisms/CalcPanel';
import { Bridge } from '@/game/mechanisms/Bridge';
import { Blocks } from '@/game/mechanisms/Blocks';
import { GoldenDigit } from '@/game/mechanisms/GoldenDigit';
import { Checkpoint } from '@/game/mechanisms/Checkpoint';
import { Guardian } from '@/game/mechanisms/Guardian';
import { Whirlwind } from '@/game/mechanisms/Whirlwind';
import { generateQuestion } from '@/game/math/mathEngine';
import type { Tier } from '@/game/math/mathEngine.types';
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
  private readonly guardians = new Map<string, Guardian>();
  private readonly winds = new Map<string, Whirlwind>();
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
    // create() roda de novo em scene.restart(); sem isto os painéis duplicam.
    this.panels.length = 0;
    this.bridges.clear();
    this.blocks.clear();
    this.digits.length = 0;
    this.checkpoints.length = 0;
    this.guardians.clear();
    this.winds.clear();
    this.flightUntil = 0;
    this.finishing = false;
    this.facing = 1;

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
      } else if (mechanism.kind === 'ventania') {
        this.winds.set(mechanism.id, new Whirlwind(this, mechanism.origin));
      }
    }

    for (const at of this.level.checkpoints) this.checkpoints.push(new Checkpoint(this, at));
    // Guardiões só existem no modo Aventura — é o botão da tela de título.
    if (useGameStore.getState().mode === 'aventura') {
      for (const spec of this.level.guardians) {
        this.guardians.set(spec.id, new Guardian(this, spec.id, spec.at));
      }
    }
    this.level.digits.forEach((at, index) => {
      this.digits.push(new GoldenDigit(this, at, String(index + 1)));
    });

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
    const guardian = this.guardians.get(outcome.source);
    if (guardian) {
      const spec = this.level.guardians.find((item) => item.id === outcome.source);
      // A dificuldade adaptativa vale para a conta do guardião também.
      if (spec) useGameStore.getState().recordAnswer(spec.op, outcome.correct);

      if (outcome.correct) {
        playSfx('certo');
        guardian.defeat();
        burst(this, guardian.at.x, guardian.at.y, toPhaserColor(PALETTE.cyan), 24);
        useChallengeStore.getState().close();
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
        this.blocks.get(mechanism.id)?.raise(outcome.answer);
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

    const { playerTier } = useGameStore.getState();
    // O tier da fase é o piso; quem já domina a operação recebe conta maior.
    const tier = Math.max(mechanism.tier, playerTier[mechanism.op]) as Tier;

    useChallengeStore.getState().open(mechanism.id, generateQuestion(mechanism.op, tier));
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

    for (const flag of this.checkpoints) {
      if (flag.tryActivate(this.player.x, this.player.y)) {
        playSfx('bandeira');
        burst(this, flag.at.x, flag.at.y - 20, toPhaserColor(PALETTE.cyan), 12);
        this.spawnPoint = { x: flag.at.x, y: flag.at.y - 40 };
      }
    }

    for (const guardian of this.guardians.values()) {
      if (!guardian.isBlocking(this.player.x, this.player.y)) continue;
      const spec = this.level.guardians.find((item) => item.id === guardian.id);
      if (!spec) continue;
      const { playerTier } = useGameStore.getState();
      const tier = Math.max(spec.tier, playerTier[spec.op]) as Tier;
      useChallengeStore.getState().open(spec.id, generateQuestion(spec.op, tier));
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
