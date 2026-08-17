import { PALETTE } from '@/theme/palette';
import type { Question } from '@/game/math/mathEngine.types';
import { styles } from './MathCard.styles';

/** Acima disso a tela vira um mar de bolinhas e a dica deixa de ajudar. */
const MAX_DOTS = 30;

/** Em quantos grupos e de que tamanho a conta é desenhada. */
function groups(question: Question): readonly number[] {
  const { a, b, op, answer } = question;
  if (op === '+') return [a, b];
  if (op === '-') return [a - b, b];
  if (op === '*') return Array.from({ length: a }, () => b);
  return Array.from({ length: b }, () => answer);
}

const total = (rows: readonly number[]): number => rows.reduce((sum, size) => sum + size, 0);

/**
 * A conta desenhada com fichas. Ver 3 + 4 virar sete bolinhas é o momento mais
 * pedagógico do jogo (SPEC 6) — vale deixar visível na apresentação.
 *
 * Na subtração, o segundo grupo é o que foi tirado, e aparece apagado.
 */
export function Hint({ question }: { question: Question }) {
  const rows = groups(question);
  if (total(rows) > MAX_DOTS) return null;

  const fadedRow = question.op === '-' ? 1 : -1;

  return (
    <div style={styles.hint} aria-hidden="true">
      {rows.map((size, row) => (
        <div key={row} style={styles.hintGroup}>
          {Array.from({ length: size }, (_unused, dot) => (
            <span
              key={dot}
              style={{
                ...styles.dot,
                background: row === fadedRow ? PALETTE.faint : PALETTE.gold,
                opacity: row === fadedRow ? 0.35 : 1,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
