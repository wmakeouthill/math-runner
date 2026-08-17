import { PALETTE } from '@/theme/palette';
import type { CharacterId } from '@/store/useGameStore.types';
import { Crest } from './Crest';

type PortraitProps = {
  character: CharacterId;
  size?: number;
};

/** Uniforme igual para os dois (SPEC 5b); muda pele, cabelo, barra e mochila. */
const LOOK = {
  ana: {
    name: 'Ana',
    skin: PALETTE.skinAna,
    hair: PALETTE.hairAna,
    /** Short: a barra da calça termina alto. */
    hem: 124,
  },
  junior: {
    name: 'Junior',
    skin: PALETTE.skinJunior,
    hair: PALETTE.hairJunior,
    hem: 146,
  },
} as const;

const LEG_TOP = 108;
const LEG_X = [46, 62] as const;

/**
 * Retrato de seleção. É SVG e não sprite porque aqui cabe detalhe: em 32 × 48
 * px o brasão vira uma mancha de 4 pixels (SPEC 5b).
 */
export function Portrait({ character, size = 132 }: PortraitProps) {
  const look = LOOK[character];
  const isAna = character === 'ana';

  return (
    <svg
      width={size}
      height={(size * 160) / 120}
      viewBox="0 0 120 160"
      role="img"
      aria-label={`${look.name} de uniforme da Escola Euclides da Cunha`}
    >
      {/* pernas: marinho até a barra, pele daí para baixo */}
      {LEG_X.map((x) => (
        <g key={x}>
          <rect x={x} y={LEG_TOP} width={12} height={look.hem - LEG_TOP} fill={PALETTE.deep} />
          <rect x={x} y={look.hem} width={12} height={150 - look.hem} fill={look.skin} />
          <rect x={x - 2} y={146} width={16} height={9} rx={3} fill={PALETTE.sneaker} />
          <rect x={x - 2} y={152} width={16} height={3} rx={1.5} fill={PALETTE.steel} />
        </g>
      ))}

      {/* mochila: fica atrás, só a borda aparece dos lados */}
      <rect x={32} y={66} width={56} height={40} rx={10} fill={PALETTE.cyan} opacity={0.85} />

      {/* braços */}
      {[26, 82].map((x) => (
        <g key={x}>
          <rect x={x} y={66} width={12} height={20} rx={5} fill={PALETTE.shirt} />
          <rect x={x} y={84} width={12} height={6} fill={PALETTE.navy} />
          <rect x={x} y={90} width={12} height={14} rx={5} fill={look.skin} />
        </g>
      ))}

      {/* torso: camisa branca */}
      <rect x={38} y={62} width={44} height={48} rx={7} fill={PALETTE.shirt} />

      {/* gola ringer */}
      <path
        d="M48 62 Q60 75 72 62"
        fill="none"
        stroke={PALETTE.navy}
        strokeWidth={6}
        strokeLinecap="round"
      />

      {/* alça da mochila: Ana usa as duas, Junior usa uma só (SPEC 5b) */}
      <path d="M46 64 L48 86" stroke={PALETTE.cyan} strokeWidth={4} strokeLinecap="round" />
      {isAna ? (
        <path d="M74 64 L72 86" stroke={PALETTE.cyan} strokeWidth={4} strokeLinecap="round" />
      ) : null}

      <Crest x={54} y={74} size={16} />

      {/* pescoço e cabeça */}
      <rect x={55} y={52} width={10} height={12} fill={look.skin} />
      <circle cx={60} cy={40} r={20} fill={look.skin} />

      {/* cabelo */}
      {isAna ? (
        <>
          <circle cx={60} cy={15} r={9} fill={look.hair} />
          <path
            d="M38 46 Q38 17 60 17 Q82 17 82 46 L75 46 Q75 29 60 29 Q45 29 45 46 Z"
            fill={look.hair}
          />
        </>
      ) : (
        <path d="M40 37 Q41 18 60 18 Q79 18 80 37 Q71 28 60 28 Q49 28 40 37 Z" fill={look.hair} />
      )}

      {/* rosto */}
      <circle cx={53} cy={40} r={2.4} fill={PALETTE.night} />
      <circle cx={67} cy={40} r={2.4} fill={PALETTE.night} />
      <path
        d="M53 48 Q60 54 67 48"
        fill="none"
        stroke={PALETTE.night}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}
