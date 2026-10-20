import { useRef, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useShop } from "@/components/shop-provider";
import { useAuth } from "@/components/auth-provider";
import { OrderSummary } from "@/components/order-summary";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deliverySchema, money, totalCents, type Delivery, type Order } from "@/lib/shop";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/_authenticated/finalizar-compra")({ head: () => pageMeta("Confirmar pedido", "Revisa la entrega y confirma tu pedido de demostración."), component: CheckoutPage });
const fields: { key: keyof Delivery; label: string; autocomplete: string; type?: string; max: number }[] = [
  { key: "name", label: "Nombre y apellidos", autocomplete: "name", max: 120 },
  { key: "email", label: "Correo electrónico", autocomplete: "email", type: "email", max: 254 },
  { key: "phone", label: "Teléfono de contacto", autocomplete: "tel", type: "tel", max: 25 },
  { key: "address", label: "Dirección (calle, número y piso)", autocomplete: "street-address", max: 200 },
  { key: "postalCode", label: "Código postal", autocomplete: "postal-code", max: 12 },
  { key: "city", label: "Localidad", autocomplete: "address-level2", max: 100 },
  { key: "province", label: "Provincia o región", autocomplete: "address-level1", max: 100 },
  { key: "country", label: "País", autocomplete: "country-name", max: 100 },
];
function CheckoutPage() {
  const { user } = useAuth();
  const { shop, ready, busy, checkout } = useShop();
  const [delivery, setDelivery] = useState<Delivery>({ name: typeof user?.user_metadata?.['display_name'] === "string" ? user.user_metadata['display_name'] : "", email: user?.email ?? "", phone: "", address: "", postalCode: "", city: "", province: "", country: "España" });
  const [errors, setErrors] = useState<Partial<Record<keyof Delivery, string>>>({});
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const reviewButton = useRef<HTMLButtonElement>(null);
  function review(event: FormEvent) {
    event.preventDefault(); setError("");
    const result = deliverySchema.safeParse(delivery);
    if (!result.success) {
      const next: Partial<Record<keyof Delivery, string>> = {};
      result.error.issues.forEach(issue => { next[issue.path[0] as keyof Delivery] = issue.message; });
      setErrors(next);
      document.getElementById(`delivery-${result.error.issues[0]?.path[0]}`)?.focus(); return;
    }
    setDelivery(result.data); setErrors({}); setConfirm(true);
  }
  async function submit() {
    setError("");
    try { const saved = await checkout(delivery); setOrder(saved); setConfirm(false); }
    catch (e) { setError(e instanceof Error ? e.message : "No se ha podido confirmar el pedido. Inténtalo de nuevo."); }
  }
  if (order) return <><p className="welcome-eyebrow">UNA NUEVA HISTORIA</p><h1 className="member-title" tabIndex={-1} ref={node => node?.focus()}>¡Pedido realizado!</h1><p className="shop-note" role="status">Tu confirmación de pago simulada ha sido aceptada. No se ha realizado ningún cargo.</p><OrderSummary order={order} /><div className="shop-actions"><Button variant="welcome" asChild><Link to="/mis-pedidos">Ver mis pedidos<PackageCheck aria-hidden="true" /></Link></Button><Button variant="outline" asChild><Link to="/catalogo" search={{ q: "", genre: "", min: "", max: "", format: "" }}>Seguir comprando</Link></Button></div></>;
  if (!ready) return <p role="status">Preparando tu pedido…</p>;
  if (!shop.items.length) return <div className="member-empty"><h1>Tu cesta está vacía.</h1><Button variant="welcome" asChild><Link to="/cesta">Volver a la cesta</Link></Button></div>;
  return <>
    <Button variant="quiet" asChild><Link to="/cesta"><ArrowLeft aria-hidden="true" /> Volver a la cesta</Link></Button>
    <p className="welcome-eyebrow">CASI EN TUS MANOS</p><h1 className="member-title">Preparar pedido</h1>
    <p className="shop-note">Todos los campos son obligatorios. Esta compra es una demostración: no se cobra ni se realiza un envío.</p>
    <form className="auth-form checkout-form" onSubmit={review}>
      <fieldset disabled={busy}><legend>Datos de entrega</legend><div className="checkout-fields">
        {fields.map(field => <div key={field.key} className={field.key === "address" ? "checkout-wide" : ""}>
          <label htmlFor={`delivery-${field.key}`}>{field.label}</label>
          <Input id={`delivery-${field.key}`} name={field.key} type={field.type ?? "text"} autoComplete={field.autocomplete} required maxLength={field.max} value={delivery[field.key]} aria-invalid={!!errors[field.key]} aria-describedby={errors[field.key] ? `error-${field.key}` : undefined} onChange={event => { setDelivery({ ...delivery, [field.key]: event.target.value }); setErrors({ ...errors, [field.key]: undefined }); }} />
          {errors[field.key] && <p id={`error-${field.key}`} className="auth-message is-error">{errors[field.key]}</p>}
        </div>)}
      </div></fieldset>
      <section className="shop-summary" aria-label="Resumen del pedido"><h2>Tu pedido</h2><ul className="shop-order-lines">{shop.items.map(item => <li key={item.id}><span>{item.quantity} × {item.title}</span></li>)}</ul><p className="shop-total"><span>Total</span><strong>{money(totalCents(shop.items))}</strong></p></section>
      <Button ref={reviewButton} variant="welcome" type="submit" disabled={busy}>Revisar y confirmar<Check aria-hidden="true" /></Button>
    </form>
    <Dialog open={confirm} onOpenChange={open => { if (!busy) { setConfirm(open); setError(""); } }}>
      <DialogContent className="shop-dialog" onEscapeKeyDown={event => { if (busy) event.preventDefault(); }} onInteractOutside={event => { if (busy) event.preventDefault(); }} onCloseAutoFocus={event => { if (order) event.preventDefault(); else { event.preventDefault(); reviewButton.current?.focus(); } }}>
        <DialogHeader><DialogTitle>Confirmar pedido y pago simulado</DialogTitle><DialogDescription>Al confirmar, tu pedido quedará como realizado. No se solicitarán datos bancarios ni se efectuará ningún cargo.</DialogDescription></DialogHeader>
        <p>{delivery.name}<br />{delivery.address}<br />{delivery.postalCode} · {delivery.city}, {delivery.province}<br />{delivery.country}</p>
        <p className="shop-total"><span>Total simulado</span><strong>{money(totalCents(shop.items))}</strong></p>
        {error && <p className="auth-message is-error" role="alert">{error}</p>}
        <div className="shop-actions"><Button variant="welcome" disabled={busy} onClick={() => void submit()}>{busy ? "Confirmando…" : "Confirmar pedido"}<Check aria-hidden="true" /></Button><Button variant="outline" disabled={busy} onClick={() => setConfirm(false)}>Volver y revisar</Button></div>
      </DialogContent>
    </Dialog>
  </>;
}
