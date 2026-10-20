import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderSummary } from "@/components/order-summary";
import { useShop } from "@/components/shop-provider";
import { emptyCatalogFilters } from "@/lib/catalog-search";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/_authenticated/mis-pedidos")({ head: () => pageMeta("Mis pedidos", "Consulta tus pedidos realizados en GremLib."), component: OrdersPage });
function OrdersPage() {
  const { shop, ready, error } = useShop();
  return <><Button variant="quiet" asChild><Link to="/perfil"><ArrowLeft aria-hidden="true" /> Volver al perfil</Link></Button><p className="welcome-eyebrow">TUS HISTORIAS</p><h1 className="member-title">Mis pedidos</h1><p className="shop-note">Pedidos de demostración guardados para tu cuenta en este navegador.</p>
    {!ready ? <p role="status">{error ? "No se pueden consultar los pedidos guardados." : "Cargando tus pedidos…"}</p> : shop.orders.length ? <div className="shop-orders">{shop.orders.map(order => <OrderSummary key={order.id} order={order} />)}</div> : <div className="member-empty"><PackageCheck aria-hidden="true" /><h2>Todavía no has realizado ningún pedido.</h2><p>Tu próxima lectura te espera en el catálogo.</p><Button variant="welcome" asChild><Link to="/catalogo" search={emptyCatalogFilters}>Explorar catálogo</Link></Button></div>}
  </>;
}
