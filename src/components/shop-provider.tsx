import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { CatalogBook } from "@/lib/catalog-search";
import { getCatalogBooks } from "@/lib/member.functions";
import { addBook, deliverySchema, emptyShop, quantityLimit, shopSchema, totalCents, validateCheckout, type Delivery, type Order, type Shop } from "@/lib/shop";

type ShopContextValue = {
  shop: Shop; ready: boolean; error: string; busy: boolean;
  add: (book: CatalogBook) => void; quantity: (id: string, quantity: number) => void;
  remove: (id: string) => void; checkout: (delivery: Delivery) => Promise<Order>;
};
const ShopContext = createContext<ShopContextValue | null>(null);
export function ShopProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const key = `gremlib-shop-v1:${userId}`;
  const [shop, setShop] = useState<Shop>(emptyShop);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const [added, setAdded] = useState("");
  const trigger = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem(key);
        const next = raw ? shopSchema.parse(JSON.parse(raw)) : emptyShop();
        setShop(next); setError(""); setReady(true);
      } catch {
        setError("No se pueden leer tus compras guardadas en este navegador. Comprueba que el almacenamiento esté disponible."); setReady(false);
      }
    };
    read();
    const sync = (event: StorageEvent) => { if (event.key === key || event.key === null) read(); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [key]);
  const readLatest = () => {
    const raw = localStorage.getItem(key);
    return raw ? shopSchema.parse(JSON.parse(raw)) : emptyShop();
  };
  function save(next: Shop) {
    localStorage.setItem(key, JSON.stringify(next));
    setShop(next); setError("");
  }
  function change(fn: (state: Shop) => Shop) {
    if (!ready || submitting.current) return false;
    try { save(fn(readLatest())); return true; }
    catch (e) { setError(e instanceof Error && !(e instanceof DOMException) ? e.message : "No se han podido guardar los cambios. Comprueba el almacenamiento del navegador."); return false; }
  }
  function add(book: CatalogBook) {
    trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (change(state => ({ ...state, items: addBook(state.items, book) }))) setAdded(book.title);
  }
  function quantity(id: string, quantity: number) {
    change(state => {
      const item = state.items.find(item => item.id === id);
      if (!item || !Number.isInteger(quantity) || quantity < 1 || quantity > quantityLimit(item)) throw new Error("Revisa la cantidad de ejemplares.");
      return { ...state, items: state.items.map(item => item.id === id ? { ...item, quantity } : item) };
    });
  }
  function remove(id: string) { change(state => ({ ...state, items: state.items.filter(item => item.id !== id) })); }
  async function checkout(delivery: Delivery) {
    if (!ready || submitting.current) throw new Error("Espera a que termine la operación actual.");
    submitting.current = true; setBusy(true);
    try {
      const address = deliverySchema.parse(delivery);
      const before = readLatest();
      const books = await getCatalogBooks();
      const latest = readLatest();
      if (JSON.stringify(before.items) !== JSON.stringify(latest.items)) throw new Error("La cesta ha cambiado en otra ventana. Vuelve a la cesta y revisa el pedido.");
      validateCheckout(latest.items, books);
      const order: Order = { id: typeof crypto.randomUUID === "function" ? crypto.randomUUID() : Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, "0")).join(""), createdAt: new Date().toISOString(), status: "realizado", items: latest.items.map(item => ({ ...item })), delivery: address, totalCents: totalCents(latest.items) };
      // One write records the order and empties the basket together.
      save({ ...latest, items: [], orders: [order, ...latest.orders] });
      return order;
    } catch (e) {
      if (e instanceof DOMException) throw new Error("No se ha podido guardar el pedido. Tu cesta sigue disponible; comprueba el almacenamiento del navegador.");
      throw e;
    } finally { submitting.current = false; setBusy(false); }
  }
  return <ShopContext.Provider value={{ shop, ready, error, busy, add, quantity, remove, checkout }}>
    {error && <div className="shop-storage-error auth-message is-error" role="alert">{error}</div>}
    {children}
    <Dialog open={!!added} onOpenChange={open => { if (!open) setAdded(""); }}>
      <DialogContent className="shop-dialog" onCloseAutoFocus={event => { event.preventDefault(); trigger.current?.focus(); }}>
        <DialogHeader>
          <DialogTitle><Check aria-hidden="true" /> Añadido a tu cesta</DialogTitle>
          <DialogDescription>«{added}» ya está en tu cesta. ¿Seguimos descubriendo historias?</DialogDescription>
        </DialogHeader>
        <div className="shop-actions">
          <Button variant="welcome" asChild><Link to="/cesta" onClick={() => { trigger.current = null; setAdded(""); }}><ShoppingBasket aria-hidden="true" /> Ir a la cesta</Link></Button>
          <Button variant="outline" onClick={() => setAdded("")}>Seguir comprando</Button>
        </div>
      </DialogContent>
    </Dialog>
  </ShopContext.Provider>;
}
export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error("ShopProvider is required");
  return context;
}
