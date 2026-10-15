import { describe, expect, it } from "vitest";
import { defaultAccessibilitySettings, parseAccessibilitySettings, readableTouchText } from "@/lib/accessibility";

describe("Accessibility preferences", () => {
  it("uses safe defaults for missing or malformed data", () => {
    expect(parseAccessibilitySettings(null)).toEqual(defaultAccessibilitySettings);
    expect(parseAccessibilitySettings({ colorMode: "invalid", largeText: "true", highContrast: 1 })).toEqual(defaultAccessibilitySettings);
  });
  it("retains every valid preference", () => {
    const saved = { colorMode: "tritanopia", largeText: true, highContrast: true, readOnTouch: true };
    expect(parseAccessibilitySettings(saved)).toEqual(saved);
  });
});
describe("Touch reading", () => {
  it("reads text and accessible button names", () => {
    const heading = document.createElement("h1"); heading.textContent = "Hola, lector.";
    expect(readableTouchText(heading)).toBe("Hola, lector.");
    const button = document.createElement("button"); button.setAttribute("aria-label", "Cerrar");
    const icon = document.createElement("span"); button.append(icon);
    expect(readableTouchText(icon)).toBe("Cerrar");
  });
  it("never speaks entered values or hidden content", () => {
    const input = document.createElement("input"); input.value = "private";
    expect(readableTouchText(input)).toBe("");
    const heading = document.createElement("h2"); heading.textContent = "Hidden"; heading.setAttribute("aria-hidden", "true");
    expect(readableTouchText(heading)).toBe("");
  });
});