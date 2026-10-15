export const accessibilityStorageKey = "gremlib-accessibility";
export const colorModes = [
  { value: "none", label: "Sin adaptación" },
  { value: "protanopia", label: "Protanopía · rojo" },
  { value: "deuteranopia", label: "Deuteranopía · verde" },
  { value: "tritanopia", label: "Tritanopía · azul" },
] as const;
export type ColorMode = typeof colorModes[number]["value"];
export type AccessibilitySettings = {
  colorMode: ColorMode;
  highContrast: boolean;
  largeText: boolean;
  readOnTouch: boolean;
};
export const defaultAccessibilitySettings: AccessibilitySettings = {
  colorMode: "none", highContrast: false, largeText: false, readOnTouch: false,
};
export function parseAccessibilitySettings(value: unknown): AccessibilitySettings {
  if (!value || typeof value !== "object") return { ...defaultAccessibilitySettings };
  const data = value as Record<string, unknown>;
  return {
    colorMode: colorModes.find(mode => mode.value === data["colorMode"])?.value ?? "none",
    highContrast: data["highContrast"] === true,
    largeText: data["largeText"] === true,
    readOnTouch: data["readOnTouch"] === true,
  };
}

// Read visible content and accessible names, never typed input or password values.
export function readableTouchText(target: EventTarget | null): string {
  if (!(target instanceof Element)) return "";
  if (target.closest('[data-accessibility-settings], input, textarea, select, [contenteditable="true"], [aria-hidden="true"]')) return "";
  const element = target.closest('button, a, [role="button"], [role="switch"], p, h1, h2, h3, h4, h5, h6, label, legend, dt, dd, li, img, strong, time');
  if (!element) return "";
  const text = element.getAttribute("aria-label") || (element instanceof HTMLImageElement ? element.alt : element.textContent);
  return (text ?? "").replace(/\s+/g, " ").trim().slice(0, 1800);
}