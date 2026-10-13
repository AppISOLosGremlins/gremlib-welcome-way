import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { CatalogSearch } from "@/components/catalog-search";
import { validateCatalogSearch } from "@/lib/catalog-search";
import { getCatalogBooks } from "@/lib/member.functions";
import { pageMeta } from "@/lib/page-meta";
import { Button } from "@/components/ui/button";

const catalogOptions = queryOptions({ queryKey: ["catalog-books"], queryFn: () => getCatalogBooks(), staleTime: 0 });
export const Route = createFileRoute("/_authenticated/catalogo")({
  validateSearch: validateCatalogSearch,
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogOptions),
  head: () => pageMeta("Catálogo", "Busca libros en GremLib por título, autor o ISBN y filtra por género, precio y formato."),
  errorComponent: ({ reset }) => <div className="member-empty"><h1>No se ha podido cargar el catálogo.</h1><Button variant="quiet" onClick={reset}>Reintentar</Button></div>,
  component: CatalogPage,
});
function CatalogPage() {
  const { data: books } = useSuspenseQuery(catalogOptions);
  const filters = Route.useSearch();
  const navigate = Route.useNavigate();
  return <CatalogSearch books={books} filters={filters} onChange={search => { void navigate({ search, replace: true }); }} />;
}
