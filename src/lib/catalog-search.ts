export const catalogGenres = ["Fantasía", "Ciencia ficción", "Misterio", "Romance", "Historia", "Infantil", "Poesía", "Ensayo"];
export type CatalogFilters = { q: string; genre: string; min: string; max: string; format: string };
export type CatalogBook = { id: string; title: string; author: string; isbn: string; genre: string; price: number; format: string };
export const emptyCatalogFilters: CatalogFilters = { q: "", genre: "", min: "", max: "", format: "" };
export function validateCatalogSearch(search: Record<string, unknown>): CatalogFilters {
  const text = (key: string) => typeof search[key] === "string" ? search[key] as string : "";
  return { q: text("q"), genre: text("genre"), min: text("min"), max: text("max"), format: text("format") };
}
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
export function filterCatalog(books: CatalogBook[], filters: CatalogFilters) {
  const words = normalize(filters.q).split(/\s+/).filter(Boolean);
  const price = (value: string) => value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : undefined;
  const min = price(filters.min);
  const max = price(filters.max);
  return books.filter(book => {
    const text = normalize(`${book.title} ${book.author} ${book.isbn}`);
    return words.every(word => text.includes(word)) && (!filters.genre || book.genre === filters.genre)
      && (!filters.format || book.format === filters.format) && (min === undefined || book.price >= min)
      && (max === undefined || book.price <= max);
  });
}