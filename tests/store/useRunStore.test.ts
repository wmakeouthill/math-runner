import { beforeEach, describe, expect, it } from 'vitest';
import { MAX_HEARTS, starsFor, useRunStore } from '@/store/useRunStore';
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

describe('corações do modo Aventura', () => {
  beforeEach(() => {
    useRunStore.getState().clear();
  });

  it('a partida começa com os três corações', () => {
    useRunStore.getState().begin('1-2', 4);
    expect(useRunStore.getState().hearts).toBe(MAX_HEARTS);
  });

  /**
   * O booleano é o que decide se o jogador volta para a bandeira. Enquanto
   * sobrar coração ele continua de pé; no último, a cena precisa saber.
   */
  it('sobrando coração, a resposta é que dá para continuar', () => {
    useRunStore.getState().begin('1-2', 0);
    expect(useRunStore.getState().loseHeart()).toBe(true);
    expect(useRunStore.getState().loseHeart()).toBe(true);
    expect(useRunStore.getState().hearts).toBe(1);
  });

  it('o terceiro erro seguido zera e avisa a cena', () => {
    useRunStore.getState().begin('1-2', 0);
    useRunStore.getState().loseHeart();
    useRunStore.getState().loseHeart();
    expect(useRunStore.getState().loseHeart()).toBe(false);
    expect(useRunStore.getState().hearts).toBe(0);
  });

  it('errar de novo no zero não deixa o coração negativo', () => {
    useRunStore.getState().begin('1-2', 0);
    for (let i = 0; i < 5; i += 1) useRunStore.getState().loseHeart();
    expect(useRunStore.getState().hearts).toBe(0);
  });

  it('voltar para a bandeira devolve os corações cheios', () => {
    useRunStore.getState().begin('1-2', 0);
    useRunStore.getState().loseHeart();
    useRunStore.getState().refillHearts();
    expect(useRunStore.getState().hearts).toBe(MAX_HEARTS);
  });

  it('uma fase nova não herda os corações da anterior', () => {
    useRunStore.getState().begin('1-2', 0);
    useRunStore.getState().loseHeart();
    useRunStore.getState().begin('1-3', 0);
    expect(useRunStore.getState().hearts).toBe(MAX_HEARTS);
  });
});
