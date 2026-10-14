import { Link } from "@tanstack/react-router";
import { BookOpen, Home, MessageSquare, UserRound, PackagePlus, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import gremlibPeek from "@/assets/gremlib-peek.png.asset.json";
import { emptyCatalogFilters } from "@/lib/catalog-search";

export function MemberShell({ children }: { children: ReactNode }) {
  return <main className="member-page">
    <header className="welcome-header member-header"><Link to="/inicio" className="brand-mark"><BookOpen /><span>GremLib<span className="brand-period">.</span></span></Link><Button variant="quiet" asChild><Link to="/perfil"><UserRound /> Mi perfil</Link></Button></header>
    <div className="member-content">{children}</div>
    <nav className="member-tabs" aria-label="Navegación principal">
      <img className="member-peek" src={gremlibPeek.url} alt="" aria-hidden="true" />
      <Button variant="quiet" asChild><Link to="/inicio" activeProps={{ className: "is-active" }}><Home /><span>Inicio</span></Link></Button>
      <Button variant="quiet" asChild><Link to="/catalogo" search={emptyCatalogFilters} activeProps={{ className: "is-active" }}><BookOpen /><span>Catálogo</span></Link></Button>
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