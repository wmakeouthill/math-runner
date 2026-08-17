import Phaser from 'phaser';
import { GAME_FEEL, GAME_SIZE } from '@/game/constants';
import { JumpController } from '@/game/systems/JumpController';
import { InputSystem } from '@/game/systems/InputSystem';
import { LEVEL_1_1 } from '@/game/levels/level-1-1';
import type { PlatformSpec } from '@/game/levels/reach';
import { ensureCharacterTexture } from '@/game/art/characterTexture';
import { useGameStore } from '@/store/useGameStore';

export class LevelScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private controls!: InputSystem;
  private readonly jump = new JumpController();

  constructor() {
    super('LevelScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0b1020');

    const platforms = this.physics.add.staticGroup();
    for (const spec of LEVEL_1_1.platforms) this.addPlatform(platforms, spec);

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
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.controls.destroy());
  }

  /** Retângulo estático simples — sem textura, só cor. */
  private addPlatform(
    group: Phaser.Physics.Arcade.StaticGroup,
    spec: PlatformSpec,
  ): void {
    const rect = this.add.rectangle(
      spec.x,
      spec.y,
      spec.width,
      spec.height,
      0x2b3a67,
    );
    group.add(rect);
  }

  override update(_time: number, delta: number): void {
    const state = this.controls.read();
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
