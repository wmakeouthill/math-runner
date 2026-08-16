import { describe, expect, it } from 'vitest';

describe('ambiente de testes', () => {
  it('roda TypeScript e tem DOM disponível', () => {
    const div: HTMLDivElement = document.createElement('div');
    div.textContent = 'Math Runner';
    expect(div.textContent).toBe('Math Runner');
  });
});
