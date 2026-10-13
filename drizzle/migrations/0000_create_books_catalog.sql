CREATE TABLE public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  isbn text NOT NULL DEFAULT '',
  genre text NOT NULL,
  price numeric(8,2) NOT NULL DEFAULT 0,
  format text NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.books TO authenticated;
GRANT ALL ON public.books TO service_role;

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read the catalog"
  ON public.books FOR SELECT TO authenticated USING (true);

CREATE TRIGGER books_updated BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION touch_profile_updated_at();

INSERT INTO public.books (title, author, isbn, genre, price, format, stock, description) VALUES
  ('La última página', 'María García', '978-84-1001-001-1', 'Fantasía', 15.99, 'Tapa blanda', 12, 'Una bibliotecaria descubre que el último capítulo de cada libro cambia según quién lo lee.'),
  ('El misterio del faro', 'Ana López', '978-84-1001-002-8', 'Misterio', 24.50, 'Tapa dura', 7, 'Un farero desaparece en una noche sin tormenta y solo su gato sabe la verdad.'),
  ('Estrellas de cartón', 'Carlos Ruiz', '978-84-1001-003-5', 'Ciencia ficción', 18.90, 'Tapa blanda', 15, 'Una tripulación de recicladores espaciales encuentra un planeta que no debería existir.'),
  ('El jardín de los susurros', 'Lucía Fernández', '978-84-1001-004-2', 'Romance', 12.99, 'Tapa blanda', 20, 'Dos vecinos rivales heredan a medias un jardín que florece solo cuando cooperan.'),
  ('Imperios de arena', 'Pablo Navarro', '978-84-1001-005-9', 'Historia', 29.95, 'Tapa dura', 5, 'La crónica de tres dinastías que se disputaron el mismo desierto durante quinientos años.'),
  ('El bosque que habla', 'Sofía Martín', '978-84-1001-006-6', 'Infantil', 9.99, 'Tapa blanda', 30, 'Una niña con botas rojas aprende el idioma de los árboles para salvar su pueblo.'),
  ('Versos de medianoche', 'Elena Torres', '978-84-1001-007-3', 'Poesía', 11.50, 'Tapa blanda', 18, 'Poemas escritos entre las doce y la una, cuando la casa por fin se queda en silencio.'),
  ('La mente del duende', 'Diego Ramos', '978-84-1001-008-0', 'Ensayo', 21.00, 'Tapa dura', 9, 'Un recorrido divulgativo por la creatividad, el juego y las ideas que aparecen de noche.'),
  ('La biblioteca infinita', 'Carmen Ortega', '978-84-1001-009-7', 'Fantasía', 16.99, 'Tapa blanda', 14, 'Cada puerta de esta biblioteca abre un género distinto, y alguien ha mezclado todos los libros.'),
  ('Código espectral', 'Andrés Vega', '978-84-1001-010-3', 'Ciencia ficción', 22.75, 'Ebook', 50, 'Un programador recibe commits de un repositorio que fue borrado hace diez años.'),
  ('Sombras en la niebla', 'Isabel Duarte', '978-84-1001-011-0', 'Misterio', 19.90, 'Audiolibro', 25, 'Una detective con insomnio resuelve casos que solo ocurren cuando baja la niebla.'),
  ('Cuentos para gremlins', 'Javier Soto', '978-84-1001-012-7', 'Infantil', 8.50, 'Tapa blanda', 40, 'Doce cuentos cortos para pequeños duendes que no quieren irse a dormir.');