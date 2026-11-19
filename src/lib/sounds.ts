import { accessibilityStorageKey, parseAccessibilitySettings } from "@/lib/accessibility";

export type SoundName = "add" | "remove" | "order" | "review" | "error";
// Soft sine notes: [frequency Hz, start s, duration s].
const tunes: Record<SoundName, [number, number, number][]> = {
  add: [[660, 0, 0.12], [880, 0.07, 0.16]],
  remove: [[440, 0, 0.12], [330, 0.08, 0.16]],
  review: [[587, 0, 0.14], [784, 0.1, 0.2]],
  error: [[220, 0, 0.14], [196, 0.16, 0.2]],
  order: [[523, 0, 0.18], [659, 0.12, 0.18], [784, 0.24, 0.18], [1047, 0.36, 0.35]],
};
const vibrations: Record<SoundName, number[]> = {
  add: [40], remove: [30, 40, 30], review: [60], order: [60, 50, 80, 50, 120], error: [100, 60, 100, 60, 100],
};
let ctx: AudioContext | null = null;

export function playSound(name: SoundName) {
  try {
    if (typeof window === "undefined") return;
    const settings = parseAccessibilitySettings(JSON.parse(localStorage.getItem(accessibilityStorageKey) ?? "null"));
    if (settings.vibration && typeof navigator !== "undefined" && "vibrate" in navigator) {
      try { navigator.vibrate(vibrations[name]); } catch { /* optional */ }
    }
    if (!settings.soundEffects) return;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    ctx ??= new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    const now = ctx.currentTime;
    for (const [freq, start, dur] of tunes[name]) {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = "sine"; osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.12, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + start); osc.stop(now + start + dur + 0.05);
    }
  } catch { /* sound is optional */ }
}
