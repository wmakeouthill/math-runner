import type { DrumStep, MusicTrack, NoteStep } from './tracks';
import { trackSteps } from './trackLength';

let sharedContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let filterNode: BiquadFilterNode | null = null;
let noiseBuffer: AudioBuffer | null = null;

let currentTrack: MusicTrack | null = null;
let isPlaying = false;
let isMuted = false;
let isMuffled = false;
let schedulerTimer: number | null = null;

// Ponteiros do sequenciador
let nextStepTime = 0;
let leadStepIdx = 0;
let leadNoteTimeLeft = 0;
let bassStepIdx = 0;
let bassNoteTimeLeft = 0;
let arpStepIdx = 0;
let arpNoteTimeLeft = 0;
let drumStepIdx = 0;
let stepsPlayed = 0;

function getAudioContext(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null;
  if (!sharedContext) {
    sharedContext = new AudioContext();
    filterNode = sharedContext.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(20000, sharedContext.currentTime);

    masterGain = sharedContext.createGain();
    masterGain.gain.setValueAtTime(isMuted ? 0.0001 : 0.22, sharedContext.currentTime);

    filterNode.connect(masterGain);
    masterGain.connect(sharedContext.destination);

    // Buffer de ruído para percussão (caixa / triângulo / pandeiro)
    const bufferSize = sharedContext.sampleRate * 0.5;
    noiseBuffer = sharedContext.createBuffer(1, bufferSize, sharedContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }

  if (sharedContext.state === 'suspended') {
    void sharedContext.resume();
  }
  return sharedContext;
}

/** Toca uma nota melódica (onda quadrada ou dente de serra com envelope limpo). */
function playNote(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  durationSec: number,
  type: OscillatorType = 'square',
  volume = 0.16,
): void {
  if (freq <= 0 || !filterNode) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.max(0.02, durationSec * 0.9));

  osc.connect(gain);
  gain.connect(filterNode);

  osc.start(startTime);
  osc.stop(startTime + durationSec);
}

/** Toca som de percussão procedural. */
function playDrum(ctx: AudioContext, type: DrumStep, startTime: number): void {
  if (type === '.' || !filterNode) return;

  if (type === 'k' || type === 'a') {
    // Bumbo / Zabumba / Alfaia
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const isAlfaia = type === 'a';
    const startFreq = isAlfaia ? 140 : 160;
    const endFreq = isAlfaia ? 35 : 45;
    const duration = isAlfaia ? 0.14 : 0.1;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(startFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);

    gain.gain.setValueAtTime(isAlfaia ? 0.28 : 0.22, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(filterNode);

    osc.start(startTime);
    osc.stop(startTime + duration);
  } else if (type === 's') {
    // Caixa / Snare (Ruído filtrado)
    if (!noiseBuffer) return;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, startTime);
    filter.Q.setValueAtTime(1.2, startTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(filterNode);

    noise.start(startTime);
    noise.stop(startTime + 0.09);
  } else if (type === 't') {
    // Triângulo / Hi-hat (Metálico agudo)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(4800, startTime);
    gain.gain.setValueAtTime(0.05, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.04);

    osc.connect(gain);
    gain.connect(filterNode);

    osc.start(startTime);
    osc.stop(startTime + 0.05);
  } else if (type === 'p') {
    // Pandeiro / Agogô
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1600, startTime);
    gain.gain.setValueAtTime(0.12, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.05);

    osc.connect(gain);
    gain.connect(filterNode);

    osc.start(startTime);
    osc.stop(startTime + 0.06);
  }
}

/** Agenda o próximo passo (semicolcheia / 16th note) */
function scheduleStep(ctx: AudioContext, time: number, stepSec: number): void {
  if (!currentTrack) return;

  // 1. Lead
  if (leadNoteTimeLeft <= 0) {
    const currentNote: NoteStep | undefined = currentTrack.lead[leadStepIdx];
    if (currentNote) {
      playNote(
        ctx,
        currentNote.n,
        time,
        currentNote.d * stepSec,
        'square',
        (currentNote.v ?? 0.8) * 0.16,
      );
      leadNoteTimeLeft = currentNote.d;
      leadStepIdx = (leadStepIdx + 1) % currentTrack.lead.length;
    }
  }
  leadNoteTimeLeft--;

  // 2. Bass
  if (bassNoteTimeLeft <= 0) {
    const currentBass: NoteStep | undefined = currentTrack.bass[bassStepIdx];
    if (currentBass) {
      playNote(
        ctx,
        currentBass.n,
        time,
        currentBass.d * stepSec,
        'triangle',
        (currentBass.v ?? 0.8) * 0.24,
      );
      bassNoteTimeLeft = currentBass.d;
      bassStepIdx = (bassStepIdx + 1) % currentTrack.bass.length;
    }
  }
  bassNoteTimeLeft--;

  // 3. Arp / Harmony (se houver)
  if (currentTrack.arp && currentTrack.arp.length > 0) {
    if (arpNoteTimeLeft <= 0) {
      const currentArp: NoteStep | undefined = currentTrack.arp[arpStepIdx];
      if (currentArp) {
        playNote(
          ctx,
          currentArp.n,
          time,
          currentArp.d * stepSec,
          'square',
          (currentArp.v ?? 0.8) * 0.08,
        );
        arpNoteTimeLeft = currentArp.d;
        arpStepIdx = (arpStepIdx + 1) % currentTrack.arp.length;
      }
    }
    arpNoteTimeLeft--;
  }

  // 4. Drums
  if (currentTrack.drums.length > 0) {
    const drum = currentTrack.drums[drumStepIdx];
    if (drum) {
      playDrum(ctx, drum, time);
    }
    drumStepIdx = (drumStepIdx + 1) % currentTrack.drums.length;
  }

  stepsPlayed += 1;
  if (currentTrack.loop === false && stepsPlayed >= trackSteps(currentTrack)) {
    isPlaying = false;
    if (schedulerTimer !== null) {
      clearInterval(schedulerTimer);
      schedulerTimer = null;
    }
  }
}

/** Loop do agendador com lookahead para precisão de milissegundos */
function runScheduler(): void {
  const ctx = getAudioContext();
  if (!ctx || !isPlaying || !currentTrack) return;

  const stepSec = 60 / currentTrack.bpm / 4; // 1 semicolcheia
  const lookAheadSec = 0.15;

  while (nextStepTime < ctx.currentTime + lookAheadSec && isPlaying) {
    scheduleStep(ctx, nextStepTime, stepSec);
    nextStepTime += stepSec;
  }
}

export const ChiptuneSynth = {
  play(track: MusicTrack): void {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (currentTrack?.id === track.id && isPlaying) {
      return;
    }

    currentTrack = track;
    isPlaying = true;

    // Reset sequenciador
    nextStepTime = ctx.currentTime + 0.05;
    leadStepIdx = 0;
    leadNoteTimeLeft = 0;
    bassStepIdx = 0;
    bassNoteTimeLeft = 0;
    arpStepIdx = 0;
    arpNoteTimeLeft = 0;
    drumStepIdx = 0;
    stepsPlayed = 0;

    if (schedulerTimer !== null) {
      clearInterval(schedulerTimer);
    }
    schedulerTimer = window.setInterval(runScheduler, 40);
  },

  stop(): void {
    isPlaying = false;
    currentTrack = null;
    if (schedulerTimer !== null) {
      clearInterval(schedulerTimer);
      schedulerTimer = null;
    }
  },

  setMuted(muted: boolean): void {
    isMuted = muted;
    if (masterGain && sharedContext) {
      const targetGain = muted ? 0.0001 : 0.22;
      masterGain.gain.cancelScheduledValues(sharedContext.currentTime);
      masterGain.gain.linearRampToValueAtTime(targetGain, sharedContext.currentTime + 0.05);
    }
  },

  /** Abafa a música (Low-Pass Filter) quando o card de conta estiver aberto */
  setMuffled(muffled: boolean): void {
    isMuffled = muffled;
    if (filterNode && sharedContext) {
      const targetFreq = isMuffled ? 500 : 20000;
      filterNode.frequency.cancelScheduledValues(sharedContext.currentTime);
      filterNode.frequency.exponentialRampToValueAtTime(
        targetFreq,
        sharedContext.currentTime + 0.12,
      );
    }
  },
};
