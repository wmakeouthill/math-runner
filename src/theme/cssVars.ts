import { PALETTE } from './palette';

const VARS = {
  '--night': PALETTE.night,
  '--navy': PALETTE.navy,
  '--gold': PALETTE.gold,
  '--cyan': PALETTE.cyan,
} as const;

/** Espelha a paleta em custom properties para :hover/:active no CSS. */
export function applyCssVars(
  target: Pick<CSSStyleDeclaration, 'setProperty'> = document.documentElement.style,
): void {
  for (const [name, value] of Object.entries(VARS)) {
    target.setProperty(name, value);
  }
}
