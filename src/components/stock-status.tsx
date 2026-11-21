import { CircleCheck, OctagonAlert, TriangleAlert } from "lucide-react";
import { stockLevel } from "@/lib/stock";

const icons = { Crítico: OctagonAlert, Bajo: TriangleAlert, Normal: CircleCheck };

/** Redundant shape + label + count: the status never depends on color alone. */
export function StockStatus({ stock }: { stock: number }) {
  const level = stockLevel(stock);
  const Icon = icons[level];
  return <span className="stock-label" data-level={level}>
    <Icon aria-hidden="true" /><span>{level} · {stock} uds.</span>
  </span>;
}
