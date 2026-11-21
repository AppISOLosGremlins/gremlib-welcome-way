-- Libro ficticio de demostración para comprobar agotados y reposición.
-- UUID estable: volver a ejecutar no duplica el libro ni reinicia su stock.
INSERT INTO public.books (id, title, author, isbn, genre, price, format, stock, description)
VALUES (
  'dff7175d-82c3-4f04-90bf-4bb7320285e9',
  'El secreto del estante vacío',
  'Los Gremlins',
  '',
  'Fantasía',
  17.90,
  'Tapa blanda',
  0,
  'Un joven librero descubre que los libros desaparecidos de su tienda esconden la entrada a un mundo olvidado.'
)
ON CONFLICT (id) DO NOTHING;
