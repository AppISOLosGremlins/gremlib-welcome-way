import { describe, expect, it } from "vitest";
import { addBook, totalCents, validateCheckout, deliverySchema } from "@/lib/shop";
const book = { id: "one", title: "Libro de prueba", author: "Autor", isbn: "123", genre: "Fantasía", format: "Tapa blanda", price: 10.10, stock: 2 };
describe("Cesta y validación del pedido", () => {
  it("agrupa ejemplares y calcula en céntimos", () => {
    const items = addBook(addBook([], book), book);
    expect(items).toHaveLength(1); expect(items[0]?.quantity).toBe(2); expect(totalCents(items)).toBe(2020);
  });
  it("no permite añadir más ejemplares que el stock", () => {
    expect(() => addBook(addBook(addBook([], book), book), book)).toThrow();
    expect(() => addBook([], { ...book, stock: 0 })).toThrow();
  });
  it("no admite una compra vacía o un libro retirado", () => {
    expect(() => validateCheckout([], [book])).toThrow();
    expect(() => validateCheckout(addBook([], book), [])).toThrow(/disponible/);
  });
  it("comprueba el stock y precio actuales antes de confirmar", () => {
    const items = addBook(addBook([], book), book);
    expect(() => validateCheckout(items, [{ ...book, stock: 1 }])).toThrow(/ejemplares/);
    expect(() => validateCheckout(items, [{ ...book, price: 12 }])).toThrow(/precio/);
    expect(() => validateCheckout(items, [book])).not.toThrow();
  });
  it("rechaza datos de entrega incompletos y espacios en blanco", () => {
    expect(deliverySchema.safeParse({ name: " ", email: "invalid" }).success).toBe(false);
  });
});
