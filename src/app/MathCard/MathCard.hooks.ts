import { useEffect } from 'react';

/**
 * Teclas 1–4 respondem, como manda o SPEC 8. Passe `null` quando não houver
 * conta aberta — o hook não pode ser chamado condicionalmente.
 */
export function useAnswerKeys(
  options: readonly number[] | null,
  answer: (option: number) => void,
): void {
  useEffect(() => {
    if (options === null) return;

    const onKeyDown = (event: KeyboardEvent): void => {
      const option = options[Number(event.key) - 1];
      if (option === undefined) return;
      event.preventDefault();
      answer(option);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [options, answer]);
}
