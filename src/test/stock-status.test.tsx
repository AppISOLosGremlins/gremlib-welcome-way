import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StockStatus } from "@/components/stock-status";

afterEach(cleanup);
describe("Stock information without color", () => {
  it.each([[0, "Crítico"], [5, "Crítico"], [6, "Bajo"], [10, "Bajo"], [11, "Normal"]])(
    "keeps status and units readable for stock %s", (stock, label) => {
      const { container } = render(<StockStatus stock={Number(stock)} />);
      expect(screen.getByText(`${label} · ${stock} uds.`)).toBeVisible();
      expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    },
  );
  it("uses different shapes for the three statuses", () => {
    const { container } = render(<><StockStatus stock={0} /><StockStatus stock={8} /><StockStatus stock={12} /></>);
    const shapes = [...container.querySelectorAll("svg")].map(icon => icon.innerHTML);
    expect(new Set(shapes).size).toBe(3);
  });
});
