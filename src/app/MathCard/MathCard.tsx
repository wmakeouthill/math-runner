import { useRef } from 'react';
import { showsHint, useChallengeStore } from '@/store/useChallengeStore';
import { OP_LABEL } from '@/game/math/mathEngine';
import { isIntentionalAnswerClick, useAnswerKeys } from './MathCard.hooks';
import { shouldBlockAnswerPointer } from '@/platform/interactGesture';
import { Hint } from './Hint';
import { styles } from './MathCard.styles';

export function MathCard() {
  const challenge = useChallengeStore((state) => state.challenge);
  const answer = useChallengeStore((state) => state.answer);

  // Antes de qualquer return: React não permite hook depois de saída condicional.
  useAnswerKeys(challenge?.question.options ?? null, answer);

  if (challenge === null) return null;

  const { a, b, op, options } = challenge.question;

  return (
    <section style={styles.card} aria-live="polite">
      <p style={styles.question}>{`${a} ${OP_LABEL[op]} ${b} = ?`}</p>

      {showsHint(challenge) ? <Hint question={challenge.question} /> : null}

      <div style={styles.options}>
        {options.map((option, index) => (
          <AnswerOption key={option} option={option} index={index} onAnswer={answer} />
        ))}
      </div>

      {challenge.wrongStreak > 0 ? <p style={styles.retry}>Quase! Tente de novo.</p> : null}
    </section>
  );
}

function AnswerOption({
  option,
  index,
  onAnswer,
}: {
  option: number;
  index: number;
  onAnswer: (option: number) => void;
}) {
  const downHere = useRef(false);

  return (
    <button
      type="button"
      className="arcade-press"
      style={styles.option}
      onPointerDown={() => {
        downHere.current = true;
      }}
      onPointerCancel={() => {
        downHere.current = false;
      }}
      onClick={(event) => {
        if (!isIntentionalAnswerClick(event.detail, downHere.current, shouldBlockAnswerPointer())) return;
        downHere.current = false;
        onAnswer(option);
      }}
    >
      <span style={styles.optionKey}>{index + 1}</span>
      {option}
    </button>
  );
}
