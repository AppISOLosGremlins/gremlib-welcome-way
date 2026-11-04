import { z } from "zod";
export const stockLevel = (stock: number) => stock <= 5 ? "Crítico" : stock <= 10 ? "Bajo" : "Normal";
export const restockRequest = z.object({
  requestId: z.string().uuid(),
  items: z.array(z.object({ id: z.string().uuid(), quantity: z.number().int().min(1).max(9999) })).min(1).max(100)
    .refine(items => new Set(items.map(item => item.id)).size === items.length),
});
