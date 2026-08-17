import { showsHint, useChallengeStore } from '@/store/useChallengeStore';
import { OP_LABEL } from '@/game/math/mathEngine';
import { useAnswerKeys } from './MathCard.hooks';
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
          <button key={option} type="button" style={styles.option} onClick={() => answer(option)}>
            <span style={styles.optionKey}>{index + 1}</span>
            {option}
          </button>
        ))}
      </div>

      {challenge.wrongStreak > 0 ? <p style={styles.retry}>Quase! Tente de novo.</p> : null}
    </section>
  );
}
