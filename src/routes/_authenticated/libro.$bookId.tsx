import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Barcode, BookOpen, Layers, Package, Tag } from "lucide-react";
import { BookCover } from "@/components/book-cover";
import { Button } from "@/components/ui/button";
import { getBookDetail } from "@/lib/member.functions";
import { emptyCatalogFilters } from "@/lib/catalog-search";
import { pageMeta } from "@/lib/page-meta";

const bookOptions = (bookId: string) => queryOptions({
  queryKey: ["catalog-book", bookId],
  queryFn: async () => {
    const book = await getBookDetail({ data: bookId });
    if (!book) throw notFound();
    return book;
  },
  staleTime: 0,
});

export const Route = createFileRoute("/_authenticated/libro/$bookId")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(bookOptions(params.bookId)),
  head: ({ loaderData }) => pageMeta(
    loaderData ? `${loaderData.title} — GremLib` : "Libro no disponible — GremLib",
    loaderData ? `${loaderData.title}, de ${loaderData.author}. Ficha completa del libro en GremLib.` : "Este libro no está disponible en el catálogo de GremLib.",
  ),
  notFoundComponent: () => (
    <div className="member-empty">
      <BookOpen />
      <h1>Este libro no está en el catálogo.</h1>
      <Button asChild variant="quiet"><Link to="/catalogo" search={emptyCatalogFilters}><ArrowLeft />Volver al catálogo</Link></Button>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="member-empty">
      <h1>No se ha podido cargar el libro.</h1>
      <Button variant="quiet" onClick={reset}>Reintentar</Button>
    </div>
  ),
  component: BookPage,
});

function BookPage() {
  const { bookId } = Route.useParams();
  const { data: book } = useSuspenseQuery(bookOptions(bookId));
  return (
    <>
      <Button asChild variant="quiet" size="sm" className="book-back">
        <Link to="/catalogo" search={emptyCatalogFilters}><ArrowLeft />Volver al catálogo</Link>
      </Button>
      <article className="book-detail">
        <BookCover title={book.title} author={book.author} genre={book.genre} />
        <div className="book-detail-info">
          <p className="welcome-eyebrow">FICHA DEL LIBRO</p>
          <h1 className="member-title">{book.title}</h1>
          <p className="book-detail-author">{book.author}</p>
          {book.description && <p className="book-detail-description">{book.description}</p>}
          <dl className="book-detail-attrs">
            <div><dt><Tag aria-hidden="true" />Género</dt><dd>{book.genre}</dd></div>
            <div><dt><Layers aria-hidden="true" />Formato</dt><dd>{book.format}</dd></div>
            <div><dt><Barcode aria-hidden="true" />ISBN</dt><dd>{book.isbn || "Sin ISBN"}</dd></div>
            <div><dt><Package aria-hidden="true" />Disponibilidad</dt><dd>{book.stock > 0 ? `${book.stock} en stock` : "Agotado"}</dd></div>
          </dl>
          <p className="book-detail-price">{book.price.toFixed(2)} €</p>
        </div>
      </article>
    </>
  );
}
