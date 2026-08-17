export type InstallBannerProps = {
  /** Some durante a fase para não cobrir o jogo. */
  allowed: boolean;
};

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};
