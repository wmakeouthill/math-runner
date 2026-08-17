import Phaser from 'phaser';
import { isCoarsePointer } from '@/platform/device';
import { usePadStore } from '@/store/usePadStore';
import { padFrame } from './padInput';
import { touchZone, type TouchAction } from './touchZones';

export type InputState = {
  left: boolean;
  right: boolean;
  jumpJustPressed: boolean;
  jumpJustReleased: boolean;
  /** Tecla de pulo segurada agora. É o que sustenta o voo na ventania. */
  jumpHeld: boolean;
  interactJustPressed: boolean;
};

export class InputSystem {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly keyA: Phaser.Input.Keyboard.Key;
  private readonly keyD: Phaser.Input.Keyboard.Key;
  private readonly keySpace: Phaser.Input.Keyboard.Key;
  private readonly keyE: Phaser.Input.Keyboard.Key;
  private readonly keyEnter: Phaser.Input.Keyboard.Key;
  /** pointer.id → ação que aquele dedo está segurando. */
  private readonly touches = new Map<number, TouchAction>();
  private touchJumpPressed = false;
  private touchJumpReleased = false;
  private touchInteractPressed = false;
  private padJumpWasHeld = false;
  private padInteractWasHeld = false;

  private readonly scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const keyboard = scene.input.keyboard;
    if (!keyboard) throw new Error('Teclado indisponível nesta cena');

    this.cursors = keyboard.createCursorKeys();
    this.keyA = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keySpace = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyE = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyEnter = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    scene.input.addPointer(3);
    scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this);
    scene.input.on(Phaser.Input.Events.POINTER_UP, this.onPointerUp, this);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    if (!isCoarsePointer()) return;
    const action = touchZone(pointer.x, pointer.y, {
      width: this.scene.scale.width,
      height: this.scene.scale.height,
    });
    this.touches.set(pointer.id, action);
    if (action === 'jump') this.touchJumpPressed = true;
    if (action === 'action') this.touchInteractPressed = true;
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (this.touches.get(pointer.id) === 'jump') this.touchJumpReleased = true;
    this.touches.delete(pointer.id);
  }

  private isTouching(action: TouchAction): boolean {
    for (const held of this.touches.values()) {
      if (held === action) return true;
    }
    return false;
  }

  read(): InputState {
    const jumpKeys = [this.cursors.up, this.cursors.space, this.keySpace];
    const pad = padFrame(usePadStore.getState(), {
      jump: this.padJumpWasHeld,
      interact: this.padInteractWasHeld,
    });

    return {
      left: this.cursors.left.isDown || this.keyA.isDown || this.isTouching('left') || pad.left,
      right: this.cursors.right.isDown || this.keyD.isDown || this.isTouching('right') || pad.right,
      jumpJustPressed:
        jumpKeys.some((key) => Phaser.Input.Keyboard.JustDown(key)) ||
        this.touchJumpPressed ||
        pad.jumpJustPressed,
      jumpJustReleased:
        jumpKeys.some((key) => Phaser.Input.Keyboard.JustUp(key)) ||
        this.touchJumpReleased ||
        pad.jumpJustReleased,
      jumpHeld: jumpKeys.some((key) => key.isDown) || this.isTouching('jump') || pad.jumpHeld,
      interactJustPressed:
        Phaser.Input.Keyboard.JustDown(this.keyE) ||
        Phaser.Input.Keyboard.JustDown(this.keyEnter) ||
        this.touchInteractPressed ||
        pad.interactJustPressed,
    };
  }

  /** Chame no fim de cada update para limpar os eventos de toque do frame. */
  endFrame(): void {
    const pad = usePadStore.getState();
    this.padJumpWasHeld = pad.jump;
    this.padInteractWasHeld = pad.interact;
    this.touchJumpPressed = false;
    this.touchJumpReleased = false;
    this.touchInteractPressed = false;
  }

  destroy(): void {
    this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this);
    this.scene.input.off(Phaser.Input.Events.POINTER_UP, this.onPointerUp, this);
    this.touches.clear();
  }
}
