import type React from "react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { accessibilityStorageKey, defaultAccessibilitySettings, parseAccessibilitySettings, readableTouchText, type AccessibilitySettings } from "@/lib/accessibility";

type AccessibilityContextValue = {
  settings: AccessibilitySettings;
  update: (patch: Partial<AccessibilitySettings>) => void;
  reset: () => void;
  speechSupported: boolean;
  speechError: string;
  stopReading: () => void;
};
// Keep one context instance across hot reloads so the root provider and consumers always match.
const contextStore = globalThis as typeof globalThis & { __gremlibAccessibilityContext?: React.Context<AccessibilityContextValue | null> };
const AccessibilityContext = contextStore.__gremlibAccessibilityContext ??= createContext<AccessibilityContextValue | null>(null);
export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState({ ...defaultAccessibilitySettings });
  const [ready, setReady] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState("");
  useEffect(() => {
    const supported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    setSpeechSupported(supported);
    try {
      const saved = parseAccessibilitySettings(JSON.parse(localStorage.getItem(accessibilityStorageKey) ?? "null"));
      setSettings({ ...saved, readOnTouch: supported && saved.readOnTouch });
    } catch { /* Retain defaults if storage is unavailable or invalid. */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.dataset["colorVision"] = settings.colorMode;
    root.dataset["highContrast"] = String(settings.highContrast);
    root.dataset["largeText"] = String(settings.largeText);
    try { localStorage.setItem(accessibilityStorageKey, JSON.stringify(settings)); } catch { /* Settings still apply for this visit. */ }
  }, [ready, settings]);
  useEffect(() => {
    if (!settings.readOnTouch || !speechSupported) return;
    const read = (event: MouseEvent) => {
      const text = readableTouchText(event.target);
      if (!text) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.rate = 0.95;
      utterance.onerror = event => {
        if (event.error !== "canceled" && event.error !== "interrupted") setSpeechError("No se ha podido leer el texto en este dispositivo.");
      };
      setSpeechError("");
      window.speechSynthesis.speak(utterance);
    };
    document.addEventListener("click", read, true);
    return () => {
      document.removeEventListener("click", read, true);
      window.speechSynthesis.cancel();
    };
  }, [settings.readOnTouch, speechSupported]);
  return <AccessibilityContext.Provider value={{
    settings,
    update: patch => setSettings(previous => ({ ...previous, ...patch })),
    reset: () => { setSettings({ ...defaultAccessibilitySettings }); setSpeechError(""); },
    speechSupported, speechError,
    stopReading: () => { if (speechSupported) window.speechSynthesis.cancel(); },
  }}>{children}</AccessibilityContext.Provider>;
}
export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error("AccessibilityProvider is required");
  return context;
}