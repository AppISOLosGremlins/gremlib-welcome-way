import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShop } from "@/components/shop-provider";
import { emptyCatalogFilters } from "@/lib/catalog-search";
import { money, quantityLimit, totalCents, unitCents } from "@/lib/shop";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/_authenticated/cesta")({ head: () => pageMeta("Cesta", "Revisa tus libros y prepara tu pedido en GremLib."), component: CestaPage });
function CestaPage() {
  const { shop, ready, busy, quantity, remove, error } = useShop();
  const count = shop.items.reduce((sum, item) => sum + item.quantity, 0);
  return <>
    <p className="welcome-eyebrow">HISTORIAS POR DESCUBRIR</p>
    <h1 className="member-title">Cesta</h1>
    {!ready ? <p role="status">{error ? "La cesta no está disponible en este momento." : "Preparando tu cesta…"}</p> : !shop.items.length ?
      <section className="member-empty" aria-labelledby="cesta-empty-title"><ShoppingBasket aria-hidden="true" /><h2 id="cesta-empty-title">Tu cesta está esperando su primera historia.</h2><p>Todavía no hay libros en tu cesta. Explora el catálogo y encuentra tu próxima lectura.</p><Button variant="welcome" asChild><Link to="/catalogo" search={emptyCatalogFilters}>Explorar catálogo<ArrowRight aria-hidden="true" /></Link></Button></section> : <>
        <p className="shop-note" role="status">{count} {count === 1 ? "libro en tu cesta" : "libros en tu cesta"}</p>
        <ul className="catalog-results">{shop.items.map(item => <li key={item.id} className="catalog-book basket-book">
          <Link to="/libro/$bookId" params={{ bookId: item.id }} className="catalog-book-link" aria-label={`Ver ficha de ${item.title}`}>
            <div className="catalog-book-info"><span className="catalog-book-genre">{item.genre}</span><h3>{item.title}</h3><p className="catalog-book-author">{item.author}</p><div className="catalog-book-meta"><span>{item.format}</span><span>{money(unitCents(item.price))} / unidad</span></div></div>
            <span className="catalog-book-price">{money(unitCents(item.price) * item.quantity)}</span>
          </Link>
          <div className="basket-item-actions">
            <div className="basket-quantity" role="group" aria-label={`Cantidad de ${item.title}`}>
              <Button variant="outline" size="icon" disabled={busy || item.quantity <= 1} aria-label={`Quitar un ejemplar de ${item.title}`} onClick={() => quantity(item.id, item.quantity - 1)}><Minus aria-hidden="true" /></Button>
              <span aria-live="polite">{item.quantity}</span>
              <Button variant="outline" size="icon" disabled={busy || item.quantity >= quantityLimit(item)} aria-label={`Añadir un ejemplar de ${item.title}`} onClick={() => quantity(item.id, item.quantity + 1)}><Plus aria-hidden="true" /></Button>
            </div>
            <Button variant="quiet" disabled={busy} aria-label={`Eliminar ${item.title} de la cesta`} onClick={() => remove(item.id)}><Trash2 aria-hidden="true" /> Eliminar</Button>
          </div>
        </li>)}</ul>
        <section className="shop-summary" aria-label="Resumen de la cesta"><p className="shop-total"><span>Total</span><strong>{money(totalCents(shop.items))}</strong></p><p className="shop-note">Compra de demostración, sin cobro ni gastos de envío.</p><div className="shop-actions"><Button variant="welcome" asChild><Link to="/finalizar-compra">Continuar con el pedido<ArrowRight aria-hidden="true" /></Link></Button><Button variant="outline" asChild><Link to="/catalogo" search={emptyCatalogFilters}>Seguir comprando</Link></Button></div></section>
      </>}
  </>;
}
