let heldPointerId: number | null = null;
let cooling = false;
let coolTimer: ReturnType<typeof setTimeout> | null = null;

function clearCoolTimer(): void {
  if (coolTimer === null) return;
  clearTimeout(coolTimer);
  coolTimer = null;
}

/** O E do pad: o mesmo dedo ainda vai soltar em cima da carta. */
export function beginInteractGesture(pointerId: number): void {
  clearCoolTimer();
  heldPointerId = pointerId;
  cooling = false;
}

export function shouldBlockAnswerPointer(): boolean {
  return heldPointerId !== null || cooling;
}

export function resetInteractGesture(): void {
  clearCoolTimer();
  heldPointerId = null;
  cooling = false;
}

function releaseIfMatch(event: PointerEvent): void {
  if (heldPointerId === null || event.pointerId !== heldPointerId) return;
  heldPointerId = null;
  cooling = true;
  coolTimer = setTimeout(() => {
    cooling = false;
    coolTimer = null;
  }, 0);
}

if (typeof window !== 'undefined') {
  window.addEventListener('pointerup', releaseIfMatch);
  window.addEventListener('pointercancel', releaseIfMatch);
}
