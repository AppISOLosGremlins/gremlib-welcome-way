CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  author_name text NOT NULL DEFAULT '',
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text NOT NULL CHECK (char_length(body) BETWEEN 3 AND 1500),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (book_id, user_id)
);
CREATE INDEX reviews_book_idx ON public.reviews(book_id);
CREATE INDEX reviews_user_idx ON public.reviews(user_id);
GRANT SELECT, INSERT ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read reviews" ON public.reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members add own review" ON public.reviews FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE OR REPLACE FUNCTION public.set_review_author()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $$
BEGIN
  NEW.user_id := auth.uid();
  NEW.author_name := coalesce((SELECT nullif(display_name,'') FROM public.profiles WHERE id = auth.uid()), 'Lector de GremLib');
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.set_review_author() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER reviews_set_author BEFORE INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.set_review_author();