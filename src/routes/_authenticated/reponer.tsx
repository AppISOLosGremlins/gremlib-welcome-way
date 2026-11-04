import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { ShieldX, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStaffMode } from "@/components/staff-mode";
import { confirmRestock, getCatalogBooks } from "@/lib/member.functions";
import { stockLevel } from "@/lib/stock";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/_authenticated/reponer")({
  beforeLoad: ({ context }) => { if (!context.staff) throw redirect({ to: "/inicio" }); },
  head: () => pageMeta("Gestión de stock", "Consulta las existencias y prepara una reposición."),
  component: Restock,
});

function Restock() {
  const { admin } = useStaffMode();
  const { user } = Route.useRouteContext();
  if (!admin) return <div className="member-empty"><ShieldX /><h1>Vista de lectura</h1><Button asChild><Link to="/inicio">Cambiar de modo en Inicio</Link></Button></div>;
  return <Inventory key={user.id} userId={user.id} />;
}

type Draft = { requestId: string; lines: Record<string, string> };
function fresh(): Draft {
  // getRandomValues also works on HTTP during mobile LAN development.
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6]! & 15) | 64; b[8] = (b[8]! & 63) | 128;
  const h = Array.from(b, x => x.toString(16).padStart(2, "0")).join("");
  return { requestId: [h.slice(0,8),h.slice(8,12),h.slice(12,16),h.slice(16,20),h.slice(20)].join("-"), lines: {} };
}
function Inventory({ userId }: { userId: string }) {
  const cache = useQueryClient();
  const catalog = useQuery({ queryKey: ["catalog-books"], queryFn: () => getCatalogBooks(), refetchInterval: 8000 });
  const key = "gremlib-restock:" + userId;
  const [draft, setDraft] = useState<Draft>(() => {
    try { const saved = JSON.parse(sessionStorage.getItem(key) || "null");
      if (saved && typeof saved.requestId === "string" && saved.lines && typeof saved.lines === "object" && !Array.isArray(saved.lines) && Object.values(saved.lines).every(v => typeof v === "string")) return saved;
    } catch { /* Start a fresh draft if storage is unavailable. */ }
    return fresh();
  });
  const [busy, setBusy] = useState(false);
  const sending = useRef(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  function save(next: Draft) {
    setDraft(next);
    try { sessionStorage.setItem(key, JSON.stringify(next)); } catch { /* Still usable in this view. */ }
  }
  function edit(id: string, value?: string) {
    if (sending.current) return;
    const lines = { ...draft.lines };
    if (value === undefined) delete lines[id]; else lines[id] = value;
    save({ ...fresh(), lines }); setMessage(""); setError("");
  }
  const books = [...(catalog.data ?? [])].sort((a,b) => a.stock-b.stock || a.title.localeCompare(b.title,"es"));
  const selected = Object.entries(draft.lines);
  const valid = selected.length > 0 && selected.length <= 100 && selected.every(([id, v]) => /^[1-9][0-9]{0,3}$/.test(v) && books.some(b => b.id === id));
  async function submit() {
    if (sending.current || !valid) return;
    sending.current = true; setBusy(true); setMessage(""); setError("");
    try {
      await confirmRestock({ data: { requestId: draft.requestId, items: selected.map(([id, q]) => ({ id, quantity: Number(q) })) } });
      save(fresh()); setMessage("Reposición confirmada. Las unidades ya están en el catálogo.");
      await Promise.all(["catalog-books","catalog-book"].map(k => cache.invalidateQueries({ queryKey: [k] })));
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo confirmar. Puedes reintentar el mismo pedido."); }
    finally { sending.current = false; setBusy(false); }
  }
  return <><p className="welcome-eyebrow">ADMINISTRACIÓN</p><h1 className="member-title">Gestión de stock</h1>
    <p className="shop-note">Los libros con menos existencias aparecen primero. Selecciona los que quieras reponer.</p>
    {catalog.isPending && <p role="status">Consultando existencias…</p>}
    {catalog.isError && <div role="alert">No se ha podido actualizar el catálogo. <Button variant="outline" onClick={() => void catalog.refetch()}>Reintentar</Button></div>}
    {catalog.isSuccess && !books.length && <p>No hay libros en el catálogo.</p>}
    <ul className="stock-list">{books.map(book => <li key={book.id}><div><Link to="/libro/$bookId" params={{ bookId: book.id }}><strong>{book.title}</strong></Link><p>{book.author}</p><span className="stock-label" data-level={stockLevel(book.stock)}>{stockLevel(book.stock)} · {book.stock} uds.</span></div>
      <Button variant="outline" disabled={busy || (selected.length >= 100 && !(book.id in draft.lines))} aria-pressed={book.id in draft.lines} aria-label={`Seleccionar ${book.title} para reponer`} onClick={() => edit(book.id, book.id in draft.lines ? undefined : "1")}>{book.id in draft.lines ? "Seleccionado" : "Seleccionar"}</Button></li>)}</ul>
    <section className="shop-summary"><h2><PackagePlus aria-hidden="true" /> Cesta de reposición</h2>
      {!selected.length ? <p>Todavía no has seleccionado libros.</p> : <form onSubmit={e => { e.preventDefault(); void submit(); }}>
        {selected.map(([id, q]) => <div className="restock-line" key={id}><label htmlFor={"units-"+id}>{books.find(b => b.id===id)?.title ?? "Libro no disponible"} · Unidades a añadir</label>
          <Input id={"units-"+id} type="number" min={1} max={9999} step={1} required value={q} disabled={busy} onChange={e=>edit(id,e.target.value)} />
          <Button type="button" variant="quiet" disabled={busy} onClick={()=>edit(id)}>Quitar</Button></div>)}
        <p>{selected.length} títulos · {selected.reduce((n,[,q])=>n+(Number(q)||0),0)} unidades a añadir</p>
        <Button variant="welcome" type="submit" disabled={!valid || busy || catalog.isError}>{busy ? "Confirmando…" : "Confirmar reposición"}</Button>
      </form>}
      <p role="status">{message}</p>{error && <p role="alert">{error}</p>}
    </section></>;
}
