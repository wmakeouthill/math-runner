import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '@/store/useGameStore';

const get = () => useGameStore.getState();

describe('useGameStore', () => {
  beforeEach(() => {
    localStorage.clear();
    get().resetProgress();
    get().goToScreen('title');
    get().setCharacter('ana');
    get().setMode('aventura');
  });

  it('começa na tela de título sem fase ativa', () => {
    expect(get().screen).toBe('title');
    expect(get().currentLevel).toBeNull();
  });

  it('startLevel muda para a tela de jogo e marca a fase atual', () => {
    get().startLevel('1-1');
    expect(get().screen).toBe('game');
    expect(get().currentLevel).toBe('1-1');
  });

  it('a fase 1-1 já começa desbloqueada', () => {
    expect(get().isUnlocked('1-1')).toBe(true);
  });

  it('a fase 1-2 só desbloqueia depois de completar a 1-1', () => {
    expect(get().isUnlocked('1-2')).toBe(false);
    get().completeLevel('1-1', { stars: 1, errors: 3, timeMs: 40_000 });
    expect(get().isUnlocked('1-2')).toBe(true);
  });

  it('guarda o melhor resultado, nunca piora o já conquistado', () => {
    get().completeLevel('1-1', { stars: 3, errors: 0, timeMs: 30_000 });
    get().completeLevel('1-1', { stars: 1, errors: 5, timeMs: 90_000 });

    const best = get().progress['1-1'];
    expect(best).toEqual({ stars: 3, errors: 0, timeMs: 30_000 });
  });

  it('melhora o resultado quando o jogador vai melhor', () => {
    get().completeLevel('1-1', { stars: 1, errors: 4, timeMs: 80_000 });
    get().completeLevel('1-1', { stars: 3, errors: 0, timeMs: 25_000 });

    expect(get().progress['1-1']).toEqual({ stars: 3, errors: 0, timeMs: 25_000 });
  });

  it('persiste o progresso em localStorage', () => {
    get().completeLevel('1-1', { stars: 2, errors: 1, timeMs: 50_000 });
    const raw = localStorage.getItem('math-runner-progress');
    expect(raw).toContain('1-1');
  });

  it('troca o personagem escolhido', () => {
    get().setCharacter('junior');
    expect(get().character).toBe('junior');
  });

  it('começa no modo aventura, com guardiões ligados', () => {
    expect(get().mode).toBe('aventura');
  });

  it('troca para o modo explorador, sem guardiões', () => {
    get().setMode('explorador');
    expect(get().mode).toBe('explorador');
  });

  it('persiste personagem e modo em localStorage', () => {
    get().setCharacter('junior');
    get().setMode('explorador');

    const raw = localStorage.getItem('math-runner-progress');
    expect(raw).toContain('junior');
    expect(raw).toContain('explorador');
  });

  it('resetProgress não apaga a escolha de personagem e modo', () => {
    get().setCharacter('junior');
    get().setMode('explorador');
    get().resetProgress();

    expect(get().character).toBe('junior');
    expect(get().mode).toBe('explorador');
  });

  it('abre as trilhas bônus a partir do título', () => {
    get().goToScreen('bonus');
    expect(get().screen).toBe('bonus');
  });
});
