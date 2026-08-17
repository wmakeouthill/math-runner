import { useEffect, useState } from 'react';
import { isCoarsePointer } from '@/platform/device';
import { useCoarsePointer } from '@/platform/useCoarsePointer';
import {
  clearInstallDismiss,
  installKind,
  isIosDevice,
  isStandalone,
  readIosStandalone,
} from '@/platform/install';
import type { BeforeInstallPromptEvent } from './InstallBanner.types';

const PROMPT_WAIT_MS = 2000;

export function useInstallBanner(allowed: boolean) {
  const coarsePointer = useCoarsePointer();
  const [canPrompt, setCanPrompt] = useState(false);
  const [waited, setWaited] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    clearInstallDismiss(localStorage);
  }, []);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      if (!isCoarsePointer()) return;
      event.preventDefault();
      const promptable = event as BeforeInstallPromptEvent;
      setPromptEvent(promptable);
      setCanPrompt(true);
    };
    const onInstalled = () => {
      setPromptEvent(null);
      setCanPrompt(false);
      setDismissed(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!allowed || dismissed) return;
    const id = window.setTimeout(() => setWaited(true), PROMPT_WAIT_MS);
    return () => window.clearTimeout(id);
  }, [allowed, dismissed]);

  const standalone = isStandalone(
    typeof window.matchMedia === 'function' &&
      window.matchMedia('(display-mode: standalone)').matches,
    readIosStandalone(navigator),
  );
  const ios = isIosDevice(navigator.userAgent, navigator.maxTouchPoints);
  const kind = allowed
    ? installKind({ coarsePointer, standalone, dismissed, canPrompt, ios, waited })
    : 'none';

  const install = async () => {
    if (promptEvent === null) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    setPromptEvent(null);
    setCanPrompt(false);
    if (choice.outcome === 'accepted') {
      setDismissed(true);
    }
  };

  const dismiss = () => {
    setDismissed(true);
  };

  return { kind, install, dismiss };
}
