import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "@/components/book-reviews";
import { getMyReviews } from "@/lib/reviews.functions";
import { emptyCatalogFilters } from "@/lib/catalog-search";
import { pageMeta } from "@/lib/page-meta";

const myReviewsOptions = queryOptions({ queryKey: ["my-reviews"], queryFn: () => getMyReviews(), staleTime: 0 });

export const Route = createFileRoute("/_authenticated/mis-resenas")({
  loader: ({ context }) => context.queryClient.ensureQueryData(myReviewsOptions),
  head: () => pageMeta("Mis reseñas", "Consulta todas las reseñas que has escrito en GremLib."),
  errorComponent: ({ reset }) => <div className="member-empty"><h1>No se han podido cargar tus reseñas.</h1><Button variant="quiet" onClick={reset}>Reintentar</Button></div>,
  component: MyReviews,
});

function MyReviews() {
  const { data } = useSuspenseQuery(myReviewsOptions);
  return <>
    <Button asChild variant="quiet" size="sm" className="book-back"><Link to="/perfil"><ArrowLeft />Volver al perfil</Link></Button>
    <p className="welcome-eyebrow">TU PERFIL</p>
    <h1 className="member-title">Mis reseñas</h1>
    {data.length === 0 ? <div className="member-empty"><MessageSquare /><h2>Aún no has escrito ninguna reseña.</h2><Button variant="quiet" asChild><Link to="/catalogo" search={emptyCatalogFilters}>Ir al catálogo</Link></Button></div> :
      <div className="review-list">{data.map(r => <Link key={r.id} to="/libro/$bookId" params={{ bookId: r.book_id }} className="review-link"><ReviewCard review={r} title={r.books?.title ?? "Libro"} /></Link>)}</div>}
  </>;
}
