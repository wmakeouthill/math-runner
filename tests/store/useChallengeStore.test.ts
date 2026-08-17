import { beforeEach, describe, expect, it } from 'vitest';
import { showsHint, useChallengeStore } from '@/store/useChallengeStore';
import type { Question } from '@/game/math/mathEngine.types';

const QUESTION: Question = { a: 3, b: 4, op: '+', answer: 7, options: [5, 7, 8, 12] };

const get = () => useChallengeStore.getState();

describe('useChallengeStore', () => {
  beforeEach(() => get().close());

  it('começa sem conta aberta', () => {
    expect(get().challenge).toBeNull();
    expect(get().outcome).toBeNull();
  });

  it('open mostra a conta com o contador de erros zerado', () => {
    get().open('ponte-1', QUESTION);
    expect(get().challenge?.source).toBe('ponte-1');
    expect(get().challenge?.question).toEqual(QUESTION);
    expect(get().challenge?.wrongStreak).toBe(0);
  });

  it('acertar fecha a conta e avisa o mecanismo com o valor da resposta', () => {
    get().open('ponte-1', QUESTION);
    get().answer(7);
    expect(get().challenge).toBeNull();
    expect(get().outcome).toEqual({ source: 'ponte-1', correct: true, answer: 7 });
  });

  it('errar num mecanismo não fecha a conta e não pune', () => {
    get().open('ponte-1', QUESTION);
    get().answer(5);
    expect(get().challenge?.wrongStreak).toBe(1);
    expect(get().outcome?.correct).toBe(false);
  });

  it('a conta continua a mesma depois do erro — a dica ensina esta, não outra', () => {
    get().open('ponte-1', QUESTION);
    get().answer(5);
    expect(get().challenge?.question).toEqual(QUESTION);
  });

  it('a dica aparece a partir do segundo erro seguido', () => {
    get().open('ponte-1', QUESTION);

    get().answer(5);
    const afterOne = get().challenge;
    expect(afterOne).not.toBeNull();
    expect(afterOne ? showsHint(afterOne) : null).toBe(false);

    get().answer(8);
    const afterTwo = get().challenge;
    expect(afterTwo).not.toBeNull();
    expect(afterTwo ? showsHint(afterTwo) : null).toBe(true);
  });

  it('responder sem conta aberta não faz nada', () => {
    get().answer(7);
    expect(get().outcome).toBeNull();
  });

  it('cada erro gera um outcome novo, para o mecanismo reagir de novo', () => {
    get().open('ponte-1', QUESTION);
    get().answer(5);
    const first = get().outcome;
    get().answer(8);
    expect(get().outcome).not.toBe(first);
  });

  it('a conta aberta não é salva em localStorage', () => {
    get().open('ponte-1', QUESTION);
    expect(localStorage.getItem('math-runner-challenge')).toBeNull();
  });
});
