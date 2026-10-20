import { z } from "zod";
import type { CatalogBook } from "@/lib/catalog-search";

export const deliverySchema = z.object({
  name: z.string().trim().min(2, "Indica el nombre completo.").max(120),
  email: z.string().trim().email("Revisa el correo electrónico.").max(254),
  phone: z.string().trim().regex(/^[+\d\s().-]{7,25}$/, "Revisa el teléfono de contacto."),
  address: z.string().trim().min(5, "Indica la calle, el número y, si procede, el piso.").max(200),
  postalCode: z.string().trim().min(3, "Revisa el código postal.").max(12),
  city: z.string().trim().min(2, "Indica la localidad.").max(100),
  province: z.string().trim().min(2, "Indica la provincia o región.").max(100),
  country: z.string().trim().min(2, "Indica el país.").max(100),
});
export type Delivery = z.infer<typeof deliverySchema>;
const itemSchema = z.object({
  id: z.string(), title: z.string(), author: z.string(), genre: z.string(), format: z.string(),
  isbn: z.string(), description: z.string().optional(), price: z.number().finite().nonnegative(),
  stock: z.number().int().nonnegative().optional(), quantity: z.number().int().min(1).max(99),
});
export type BasketItem = z.infer<typeof itemSchema>;
const orderSchema = z.object({
  id: z.string(), createdAt: z.string(), status: z.literal("realizado"),
  items: z.array(itemSchema).min(1), delivery: deliverySchema,
  totalCents: z.number().int().nonnegative(),
});
export type Order = z.infer<typeof orderSchema>;
export const shopSchema = z.object({ version: z.literal(1), items: z.array(itemSchema), orders: z.array(orderSchema) });
export type Shop = z.infer<typeof shopSchema>;
export const emptyShop = (): Shop => ({ version: 1, items: [], orders: [] });
export const unitCents = (price: number) => Math.round(price * 100);
export const totalCents = (items: BasketItem[]) => items.reduce((sum, item) => sum + unitCents(item.price) * item.quantity, 0);
export const money = (cents: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(cents / 100);
export const quantityLimit = (book: { stock?: number | undefined }) => Math.max(0, Math.min(99, book.stock ?? 99));

export function addBook(items: BasketItem[], book: CatalogBook): BasketItem[] {
  if (!Number.isFinite(book.price) || book.price < 0) throw new Error("No se puede añadir este libro en este momento.");
  const existing = items.find(item => item.id === book.id);
  const quantity = (existing?.quantity ?? 0) + 1;
  if (quantity > quantityLimit(book)) throw new Error("No hay más ejemplares disponibles de este libro.");
  const item = { ...book, quantity };
  return existing ? items.map(old => old.id === book.id ? item : old) : [...items, item];
}

// Validate against the current catalog before saving the simulated order.
export function validateCheckout(items: BasketItem[], books: CatalogBook[]) {
  if (!items.length) throw new Error("Tu cesta está vacía.");
  for (const item of items) {
    const current = books.find(book => book.id === item.id);
    if (!current) throw new Error(`«${item.title}» ya no está disponible. Elimínalo de la cesta para continuar.`);
    if (item.quantity > quantityLimit(current)) throw new Error(`No hay suficientes ejemplares de «${item.title}». Revisa la cantidad en la cesta.`);
    if (unitCents(current.price) !== unitCents(item.price)) throw new Error(`El precio de «${item.title}» ha cambiado. Elimínalo y añádelo de nuevo desde el catálogo para revisar el nuevo importe.`);
  }
}
