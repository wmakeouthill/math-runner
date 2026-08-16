import Phaser from 'phaser';
import { GAME_FEEL, GAME_SIZE } from '@/game/constants';
import { JumpController } from '@/game/systems/JumpController';
import { InputSystem } from '@/game/systems/InputSystem';

const GROUND_Y = GAME_SIZE.height - 40;
const PLAYER_TEXTURE = 'player-rect';

export class LevelScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private controls!: InputSystem;
  private readonly jump = new JumpController();

  constructor() {
    super('LevelScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0b1020');
    this.ensurePlayerTexture();

    const platforms = this.physics.add.staticGroup();
    this.addPlatform(platforms, 480, GROUND_Y, 700, 40);
    this.addPlatform(platforms, 1250, GROUND_Y, 500, 40);
    this.addPlatform(platforms, 900, GROUND_Y - 150, 160, 24);
    this.addPlatform(platforms, 1150, GROUND_Y - 280, 160, 24);

    this.player = this.physics.add.sprite(120, GROUND_Y - 120, PLAYER_TEXTURE);
    this.player.setDisplaySize(32, 48);
    this.player.setTintFill(0x6ee7ff);
    this.player.setCollideWorldBounds(false);
    this.physics.add.collider(this.player, platforms);

    this.physics.world.setBounds(0, 0, 1600, GAME_SIZE.height);
    this.cameras.main.setBounds(0, 0, 1600, GAME_SIZE.height);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setFollowOffset(-80, 0);

    this.controls = new InputSystem(this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.controls.destroy());
  }

  /** Retângulo estático simples — sem textura, só cor. */
  private addPlatform(
    group: Phaser.Physics.Arcade.StaticGroup,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    const rect = this.add.rectangle(x, y, width, height, 0x2b3a67);
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

  private ensurePlayerTexture(): void {
    if (this.textures.exists(PLAYER_TEXTURE)) return;
    const texture = this.textures.createCanvas(PLAYER_TEXTURE, 32, 48);
    if (!texture) return;
    const context = texture.getContext();
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 32, 48);
    texture.refresh();
  }

  private respawn(): void {
    this.player.setPosition(120, GROUND_Y - 120);
    this.player.setVelocity(0, 0);
    this.jump.reset();
  }
}
