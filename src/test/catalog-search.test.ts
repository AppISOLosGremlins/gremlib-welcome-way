import { describe, expect, it } from "vitest";
import { emptyCatalogFilters, filterCatalog, validateCatalogSearch, type CatalogBook } from "@/lib/catalog-search";
const books: CatalogBook[] = [
  { id: "1", title: "La última página", author: "María García", isbn: "123456", genre: "Fantasía", price: 15, format: "Tapa blanda" },
  { id: "2", title: "El misterio", author: "Ana López", isbn: "654321", genre: "Misterio", price: 25, format: "Tapa dura" },
];
describe("catalog search", () => {
  it("matches accents, case, author and ISBN", () => {
    for (const q of ["ULTIMA", "maria garcia", "123456"]) expect(filterCatalog(books, { ...emptyCatalogFilters, q })).toEqual([books[0]]);
  });
  it("combines genre, inclusive prices and format", () => {
    expect(filterCatalog(books, { q: "", genre: "Fantasía", min: "15", max: "15", format: "Tapa blanda" })).toEqual([books[0]]);
    expect(filterCatalog(books, { ...emptyCatalogFilters, max: "14" })).toEqual([]);
  });
  it("keeps empty inventory empty and ignores invalid prices", () => {
    expect(filterCatalog([], emptyCatalogFilters)).toEqual([]);
    expect(filterCatalog(books, { ...emptyCatalogFilters, min: "bad" })).toEqual(books);
  });
  it("validates URL values without losing unknown string values", () => {
    expect(validateCatalogSearch({ q: [], genre: "Nuevo género", min: 12 })).toEqual({ ...emptyCatalogFilters, genre: "Nuevo género" });
  });
});