import { useEffect, useState } from 'react';
import { coarsePointerQuery, isCoarsePointer } from './device';

/** Reage se o aluno virar o tablet ou plugar um mouse. */
export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(isCoarsePointer);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia(coarsePointerQuery());
    const sync = () => setCoarse(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  return coarse;
}
