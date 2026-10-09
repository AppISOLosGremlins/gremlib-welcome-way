import { createFileRoute } from "@tanstack/react-router";
import { CatalogSearch } from "@/components/catalog-search";
import { validateCatalogSearch } from "@/lib/catalog-search";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/_authenticated/catalogo")({
  validateSearch: validateCatalogSearch,
  head: () => pageMeta("Catálogo", "Busca libros en GremLib por título, autor o ISBN y filtra por género, precio y formato."),
  component: CatalogPage,
});
function CatalogPage() {
  const filters = Route.useSearch();
  const navigate = Route.useNavigate();
  return <CatalogSearch filters={filters} onChange={search => { void navigate({ search, replace: true }); }} />;
}