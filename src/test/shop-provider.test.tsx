import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ShopProvider, useShop } from "@/components/shop-provider";
import type { Delivery } from "@/lib/shop";
const { getCatalogBooks } = vi.hoisted(() => ({ getCatalogBooks: vi.fn() }));
vi.mock("@/lib/member.functions", () => ({ getCatalogBooks }));
vi.mock("@tanstack/react-router", () => ({ Link: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a> }));
const book = { id: "one", title: "Libro de prueba", author: "Autor", isbn: "123", genre: "Fantasía", format: "Tapa blanda", price: 10.1, stock: 3 };
const delivery: Delivery = { name: "Ana Prueba", email: "ana@example.com", phone: "600123456", address: "Calle Prueba 1", postalCode: "02001", city: "Albacete", province: "Albacete", country: "España" };
let shop: ReturnType<typeof useShop>;
function Probe() { shop = useShop(); return <button onClick={() => shop.add(book)}>Añadir</button>; }
function mount(id = "user-a") { return render(<ShopProvider key={id} userId={id}><Probe /></ShopProvider>); }
beforeEach(() => { localStorage.clear(); getCatalogBooks.mockResolvedValue([book]); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
describe("Persistencia y confirmación simulada", () => {
  it("ofrece ir a la cesta o seguir comprando y conserva la cesta al recargar", async () => {
    const view = mount(); await waitFor(() => expect(shop.ready).toBe(true));
    fireEvent.click(screen.getByText("Añadir"));
    expect(screen.getByRole("link", { name: /Ir a la cesta/ })).toHaveAttribute("href", "/cesta");
    fireEvent.click(screen.getByRole("button", { name: "Seguir comprando" }));
    view.unmount(); mount(); await waitFor(() => expect(shop.shop.items[0]?.quantity).toBe(1));
  });
  it("guarda un pedido realizado y vacía la cesta; no mezcla cuentas", async () => {
    const view = mount(); await waitFor(() => expect(shop.ready).toBe(true));
    act(() => shop.add(book));
    await act(async () => { const order = await shop.checkout(delivery); expect(order.status).toBe("realizado"); expect(order.totalCents).toBe(1010); });
    expect(shop.shop.items).toHaveLength(0); expect(shop.shop.orders).toHaveLength(1);
    view.unmount(); const other = mount("user-b"); await waitFor(() => expect(shop.ready).toBe(true));
    expect(shop.shop.orders).toHaveLength(0);
    other.unmount(); mount(); await waitFor(() => expect(shop.shop.orders).toHaveLength(1));
  });
  it("impide una doble confirmación simultánea", async () => {
    mount(); await waitFor(() => expect(shop.ready).toBe(true)); act(() => shop.add(book));
    let release!: (value: typeof book[]) => void;
    getCatalogBooks.mockImplementation(() => new Promise(resolve => { release = resolve; }));
    let pending!: ReturnType<typeof shop.checkout>;
    act(() => { pending = shop.checkout(delivery); });
    await expect(shop.checkout(delivery)).rejects.toThrow(/operación/);
    await act(async () => { release([book]); await pending; });
    expect(shop.shop.orders).toHaveLength(1);
  });
  it("conserva la cesta si falla la escritura del pedido", async () => {
    mount(); await waitFor(() => expect(shop.ready).toBe(true)); act(() => shop.add(book));
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Quota", "QuotaExceededError"); });
    await act(async () => { await expect(shop.checkout(delivery)).rejects.toThrow(/guardar el pedido/); });
    expect(shop.shop.items).toHaveLength(1); expect(shop.shop.orders).toHaveLength(0);
  });
  it("no confirma si el catálogo ha cambiado", async () => {
    mount(); await waitFor(() => expect(shop.ready).toBe(true)); act(() => shop.add(book));
    getCatalogBooks.mockResolvedValue([{ ...book, stock: 0 }]);
    await act(async () => { await expect(shop.checkout(delivery)).rejects.toThrow(/ejemplares/); });
    expect(shop.shop.items).toHaveLength(1); expect(shop.shop.orders).toHaveLength(0);
  });
});
