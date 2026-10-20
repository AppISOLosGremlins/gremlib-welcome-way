import { Link } from "@tanstack/react-router";
import { Check, PackageCheck } from "lucide-react";
import { money, unitCents, type Order } from "@/lib/shop";

export function OrderSummary({ order }: { order: Order }) {
  return <article className="shop-order">
    <div className="shop-order-heading"><h2><PackageCheck aria-hidden="true" /> Pedido {order.id.slice(0, 8).toUpperCase()}</h2><span className="shop-status"><Check aria-hidden="true" /> Realizado</span></div>
    <p><time dateTime={order.createdAt}>{new Date(order.createdAt).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}</time></p>
    <ul className="shop-order-lines">{order.items.map(item => <li key={item.id}>
      <Link to="/libro/$bookId" params={{ bookId: item.id }}>{item.title}<span>{item.author} · {item.format}</span></Link>
      <span>{item.quantity} × {money(unitCents(item.price))}</span>
    </li>)}</ul>
    <p className="shop-total"><span>Total</span><strong>{money(order.totalCents)}</strong></p>
    <details className="shop-delivery-details"><summary>Ver datos de entrega</summary>
      <address>{order.delivery.name}<br />{order.delivery.address}<br />{order.delivery.postalCode} · {order.delivery.city}<br />{order.delivery.province}, {order.delivery.country}<br />{order.delivery.email}<br />{order.delivery.phone}</address>
    </details>
    <p className="shop-note">Pedido de demostración. Confirmación simulada, sin cobro ni envío real.</p>
  </article>;
}
