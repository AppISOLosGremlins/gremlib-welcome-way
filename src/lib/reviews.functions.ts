import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const cols = "id, book_id, user_id, author_name, rating, body, created_at";

export const getBookReviews = createServerFn({ method: "GET" })
  .inputValidator((bookId: string) => z.string().uuid().parse(bookId))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data: bookId }) => {
    const { data, error } = await context.supabase.from("reviews").select(cols).eq("book_id", bookId)
      .order("rating", { ascending: false }).order("created_at", { ascending: false });
    if (error) throw new Error("No se han podido cargar las reseñas.");
    const mine = data.find(r => r.user_id === context.userId) ?? null;
    const average = data.length ? data.reduce((s, r) => s + r.rating, 0) / data.length : 0;
    const featured = data.filter(r => r.id !== mine?.id).slice(0, 2);
    return { count: data.length, average, featured, mine };
  });

export const createReview = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ bookId: z.string().uuid(), rating: z.number().int().min(1).max(5), body: z.string().trim().min(3).max(1500) }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("reviews").insert({ book_id: data.bookId, rating: data.rating, body: data.body, user_id: context.userId });
    if (error?.code === "23505") throw new Error("Ya has reseñado este libro.");
    if (error) throw new Error("No se ha podido publicar tu reseña.");
    return { ok: true };
  });

export const getMyReviews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("reviews").select(`${cols}, books(title, author)`).eq("user_id", context.userId).order("created_at", { ascending: false });
    if (error) throw new Error("No se han podido cargar tus reseñas.");
    return data;
  });
