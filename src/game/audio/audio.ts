import { useGameStore } from '@/store/useGameStore';
import { notesFor } from './sfx';
import type { SfxName, Tone } from './sfx.types';

let shared: AudioContext | null = null;

/**
 * O contexto nasce no primeiro som, nunca antes: navegador de celular recusa
 * AudioContext criado fora de um gesto do usuário, e criar cedo demais deixa
 * o jogo mudo a partida inteira.
 */
function context(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null;
  shared ??= new AudioContext();
  if (shared.state === 'suspended') void shared.resume();
  return shared;
}

function schedule(target: AudioContext, tone: Tone): void {
  const start = target.currentTime + (tone.delay ?? 0);
  const end = start + tone.duration;

  const osc = target.createOscillator();
  osc.type = tone.type ?? 'square';
  osc.frequency.setValueAtTime(tone.freq, start);
  if (tone.to !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(tone.to, end);
  }

  // Ataque de 10 ms e queda até quase zero: sem envelope, o começo e o fim
  // da nota estalam no alto-falante.
  const amp = target.createGain();
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(tone.gain ?? 0.14, start + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, end);

  osc.connect(amp);
  amp.connect(target.destination);
  osc.start(start);
  osc.stop(end + 0.02);
}

export function playSfx(name: SfxName): void {
  if (useGameStore.getState().muted) return;
  const target = context();
  if (target === null) return;
  for (const tone of notesFor(name)) schedule(target, tone);
}
