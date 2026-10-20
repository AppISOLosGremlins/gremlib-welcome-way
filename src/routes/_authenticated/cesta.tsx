import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { emptyCatalogFilters } from "@/lib/catalog-search";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/_authenticated/cesta")({
  head: () => pageMeta("Cesta", "Tu cesta de libros en GremLib."),
  component: CestaPage,
});

function CestaPage() {
  return (
    <>
      <p className="welcome-eyebrow">HISTORIAS POR DESCUBRIR</p>
      <h1 className="member-title">Cesta</h1>
      <section className="member-empty" aria-labelledby="cesta-empty-title">
        <ShoppingBasket aria-hidden="true" />
        <h2 id="cesta-empty-title">Tu cesta está esperando su primera historia.</h2>
        <p>Todavía no hay libros en tu cesta. Explora el catálogo y encuentra tu próxima lectura.</p>
        <Button variant="welcome" asChild>
          <Link to="/catalogo" search={emptyCatalogFilters}>
            Explorar catálogo<ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </section>
    </>
  );
}
