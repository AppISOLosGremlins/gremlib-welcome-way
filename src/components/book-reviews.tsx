import { useState, type FormEvent } from "react";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createReview, getBookReviews } from "@/lib/reviews.functions";

export const bookReviewsOptions = (bookId: string) => queryOptions({ queryKey: ["book-reviews", bookId], queryFn: () => getBookReviews({ data: bookId }), staleTime: 0 });

export function Stars({ value }: { value: number }) {
  return <span className="review-stars" aria-label={`${value} de 5 estrellas`}>{[1, 2, 3, 4, 5].map(n => <Star key={n} aria-hidden="true" className={n <= Math.round(value) ? "is-on" : ""} />)}</span>;
}

type Review = { id: string; author_name: string; rating: number; body: string; created_at: string };
export function ReviewCard({ review, title }: { review: Review; title?: string }) {
  return <article className="review-card">
    <header><strong>{title ?? review.author_name}</strong><Stars value={review.rating} /></header>
    <p>{review.body}</p>
    <time dateTime={review.created_at}>{new Date(review.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</time>
  </article>;
}

export function BookReviews({ bookId }: { bookId: string }) {
  const { data } = useSuspenseQuery(bookReviewsOptions(bookId));
  const qc = useQueryClient();
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const mutation = useMutation({
    mutationFn: () => createReview({ data: { bookId, rating, body } }),
    onSuccess: () => { setBody(""); setRating(0); void qc.invalidateQueries({ queryKey: ["book-reviews", bookId] }); void qc.invalidateQueries({ queryKey: ["my-reviews"] }); },
    onError: (e) => setError(e instanceof Error ? e.message : "No se ha podido publicar tu reseña."),
  });
  function submit(e: FormEvent) {
    e.preventDefault(); setError("");
    if (!rating) return setError("Elige una puntuación de 1 a 5 estrellas.");
    if (body.trim().length < 3) return setError("Escribe al menos unas palabras.");
    mutation.mutate();
  }
  return <section className="book-reviews" aria-labelledby="reviews-title">
    <div className="member-section-heading"><h2 id="reviews-title">Reseñas</h2>{data.count > 0 && <span><Stars value={data.average} /> {data.average.toFixed(1)} · {data.count}</span>}</div>
    {data.featured.length > 0 ? <div className="review-list">{data.featured.map(r => <ReviewCard key={r.id} review={r} />)}</div>
      : !data.mine && <p className="review-empty">Todavía nadie ha reseñado este libro. ¡Sé el primero!</p>}
    {data.mine ? <div className="review-mine"><p className="welcome-eyebrow">TU RESEÑA</p><ReviewCard review={data.mine} title="Tú" /></div> :
      <form className="review-form" onSubmit={submit}>
        <p className="welcome-eyebrow">ESCRIBE TU RESEÑA</p>
        <div className="review-rating" role="radiogroup" aria-label="Puntuación">
          {[1, 2, 3, 4, 5].map(n => <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} estrellas`} onClick={() => setRating(n)}><Star className={n <= rating ? "is-on" : ""} /></button>)}
        </div>
        <Textarea value={body} onChange={e => setBody(e.target.value)} maxLength={1500} placeholder="¿Qué te ha parecido?" aria-label="Tu reseña" rows={4} />
        {error && <p className="auth-message is-error" role="alert">{error}</p>}
        <Button variant="welcome" type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Publicando…" : "Publicar reseña"}<Send /></Button>
      </form>}
  </section>;
}
