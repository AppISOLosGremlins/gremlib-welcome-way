import { Link, useLocation } from "@tanstack/react-router";
import { BookOpen, Home, MessageSquare, UserRound, PackagePlus, ArrowRight, ShoppingBasket } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import gremlibPeek from "@/assets/gremlib-peek.png.asset.json";
import { emptyCatalogFilters } from "@/lib/catalog-search";

function gremlinPhrase(path: string) {
  if (path.startsWith("/cesta")) return "Tu próxima historia puede empezar en el catálogo.";
  if (path.startsWith("/catalogo")) return "¿Buscamos tu próxima aventura?";
  if (path.startsWith("/libro")) return "¡Este tiene buena pinta!";
  if (path.startsWith("/perfil")) return "Este es tu rincón lector.";
  if (path.startsWith("/mis-resenas")) return "¡Me encantan tus opiniones!";
  if (path.startsWith("/reponer")) return "¿Llenamos las estanterías?";
  return "¿Qué quieres hacer hoy?";
}

function GremlinPeek() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", esc); };
  }, [open]);
  return <>
    {open && <p className="member-bubble" role="status">{gremlinPhrase(pathname)}</p>}
    <button ref={ref} type="button" className="member-peek" aria-label="Hablar con el gremlin" aria-expanded={open} onClick={() => setOpen(o => !o)}>
      <img src={gremlibPeek.url} alt="" />
    </button>
  </>;
}

export function MemberShell({ children }: { children: ReactNode }) {
  return <main className="member-page">
    <header className="welcome-header member-header"><Link to="/inicio" className="brand-mark"><BookOpen /><span>GremLib<span className="brand-period">.</span></span></Link><Button variant="quiet" asChild><Link to="/perfil"><UserRound /> Mi perfil</Link></Button></header>
    <div className="member-content">{children}</div>
    <nav className="member-tabs" aria-label="Navegación principal">
      <GremlinPeek />
      <Button variant="quiet" asChild><Link to="/inicio" activeProps={{ className: "is-active" }}><Home /><span>Inicio</span></Link></Button>
      <Button variant="quiet" asChild><Link to="/catalogo" search={emptyCatalogFilters} activeProps={{ className: "is-active" }}><BookOpen /><span>Catálogo</span></Link></Button>
      <Button variant="quiet" asChild><Link to="/cesta" activeProps={{ className: "is-active", "aria-current": "page" }}><ShoppingBasket aria-hidden="true" /><span>Cesta</span></Link></Button>
      <Button variant="quiet" asChild><Link to="/perfil" activeProps={{ className: "is-active" }}><UserRound /><span>Perfil</span></Link></Button>
    </nav>
  </main>;
}

export function MemberEmpty({ kind }: { kind: "catalog" | "reviews" | "restock" }) {
  const content = {
    catalog: { icon: BookOpen, title: "Catálogo", text: "Todavía no hay libros en el catálogo." },
    reviews: { icon: MessageSquare, title: "Reseñar", text: "Cuando haya libros en el catálogo, podrás elegir uno para reseñar." },
    restock: { icon: PackagePlus, title: "Reponer", text: "No hay libros disponibles para reponer." },
  }[kind];
  const Icon = content.icon;
  return <><p className="welcome-eyebrow">{kind === "restock" ? "ADMINISTRACIÓN" : "TU REFUGIO LITERARIO"}</p><h1 className="member-title">{content.title}</h1><div className="member-empty"><Icon /><h2>{content.text}</h2><Button variant="quiet" asChild><Link to="/inicio">Volver a Inicio<ArrowRight /></Link></Button></div></>;
}
