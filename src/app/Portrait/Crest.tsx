import { PALETTE } from '@/theme/palette';

type CrestProps = {
  size?: number;
  /** Só quando aninhado dentro de outro `<svg>`. */
  x?: number;
  y?: number;
};

/**
 * Brasão do jogo — escudo com um √ estilizado e as iniciais da escola.
 *
 * Não é o brasão oficial do Governo do Estado que aparece na referência: aquele
 * é insígnia pública e não é nossa para usar. Este é melhor mesmo assim, porque
 * coloca a escola literalmente no peito dos personagens.
 */
export function Crest({ size = 28, x, y }: CrestProps) {
  return (
    <svg
      x={x}
      y={y}
      width={size}
      height={size * 1.15}
      viewBox="0 0 40 46"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3 3 H37 V26 Q37 39 20 44 Q3 39 3 26 Z"
        fill={PALETTE.navy}
        stroke={PALETTE.cyan}
        strokeWidth="2.5"
      />
      <path
        d="M10 23 L15 31 L24 11 H32"
        fill="none"
        stroke={PALETTE.cyan}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="20"
        y="40"
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill={PALETTE.shirt}
      >
        EC
      </text>
    </svg>
  );
}
