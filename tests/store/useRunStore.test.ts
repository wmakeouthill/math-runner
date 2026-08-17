import { beforeEach, describe, expect, it } from 'vitest';
import { starsFor, useRunStore } from '@/store/useRunStore';
import { useGameStore } from '@/store/useGameStore';

describe('starsFor', () => {
  it('só terminar já vale uma estrela', () => {
    expect(starsFor({ digitsTaken: 0, digitsTotal: 4, errors: 3 })).toBe(1);
  });

  it('todos os números dourados valem a segunda', () => {
    expect(starsFor({ digitsTaken: 4, digitsTotal: 4, errors: 3 })).toBe(2);
  });

  it('sem errar nenhuma conta vale a terceira', () => {
    expect(starsFor({ digitsTaken: 4, digitsTotal: 4, errors: 0 })).toBe(3);
  });

  it('uma fase sem números dourados não castiga o jogador', () => {
    expect(starsFor({ digitsTaken: 0, digitsTotal: 0, errors: 0 })).toBe(3);
  });
});

describe('partida', () => {
  beforeEach(() => {
    useRunStore.getState().clear();
    useGameStore.getState().resetProgress();
  });

  it('grava o resultado no progresso ao terminar', () => {
    const run = useRunStore.getState();
    run.begin('1-1', 2);
    useRunStore.getState().takeDigit();
    useRunStore.getState().takeDigit();
    useRunStore.getState().finish();

    expect(useRunStore.getState().result?.stars).toBe(3);
    expect(useGameStore.getState().progress['1-1']?.stars).toBe(3);
  });

  it('errar uma conta custa a estrela do acerto limpo', () => {
    useRunStore.getState().begin('1-1', 1);
    useRunStore.getState().addError();
    useRunStore.getState().takeDigit();
    useRunStore.getState().finish();

    expect(useRunStore.getState().result?.stars).toBe(2);
    expect(useRunStore.getState().result?.errors).toBe(1);
  });

  it('terminar duas vezes não sobrescreve o resultado da partida', () => {
    useRunStore.getState().begin('1-1', 1);
    useRunStore.getState().finish();
    const primeiro = useRunStore.getState().result;

    useRunStore.getState().addError();
    useRunStore.getState().finish();

    expect(useRunStore.getState().result).toBe(primeiro);
  });

  it('a fase 1-2 destrava quando a 1-1 termina', () => {
    expect(useGameStore.getState().isUnlocked('1-2')).toBe(false);
    useRunStore.getState().begin('1-1', 0);
    useRunStore.getState().finish();
    expect(useGameStore.getState().isUnlocked('1-2')).toBe(true);
  });
});
