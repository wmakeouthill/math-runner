export function trackSteps(track: {
  lead: readonly { d: number }[];
  bass: readonly { d: number }[];
  arp?: readonly { d: number }[];
  drums: readonly unknown[];
}): number {
  const duration = (notes: readonly { d: number }[]) =>
    notes.reduce((total, note) => total + note.d, 0);

  return Math.max(
    duration(track.lead),
    duration(track.bass),
    duration(track.arp ?? []),
    track.drums.length,
  );
}
