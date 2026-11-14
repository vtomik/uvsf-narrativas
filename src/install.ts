import { useCallback, useEffect, useState } from "react";

type InstallChoice = "accepted" | "dismissed";
export type InstallResult = InstallChoice | "unavailable";

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: InstallChoice; platform: string }>;
}

function inAppWindow() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

function onIOS() {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/** Optional browser installation. Never prompts automatically or stores a choice. */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(inAppWindow);
  const [isIOS] = useState(onIOS);

  useEffect(() => {
    const mode = window.matchMedia("(display-mode: standalone)");
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    const onModeChange = () => setInstalled(inAppWindow());
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    mode.addEventListener("change", onModeChange);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      mode.removeEventListener("change", onModeChange);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<InstallResult> => {
    if (!deferred || installed) return "unavailable";
    // A beforeinstallprompt event is single-use, including a dismissal.
    setDeferred(null);
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      return choice.outcome;
    } catch {
      return "unavailable";
    }
  }, [deferred, installed]);

  return {
    canInstall: deferred !== null && !installed,
    installed,
    isIOS,
    promptInstall,
  };
}
