import { useEffect, useState } from "react";
import { BookOpen, Search, SlidersHorizontal, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { catalogGenres, emptyCatalogFilters, filterCatalog, type CatalogBook, type CatalogFilters } from "@/lib/catalog-search";

// Inventory remains empty until the inventory workflow is implemented.
const books: CatalogBook[] = [];
export function CatalogSearch({ filters, onChange }: { filters: CatalogFilters; onChange: (filters: CatalogFilters) => void }) {
  const [query, setQuery] = useState(filters.q);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const [error, setError] = useState("");
  useEffect(() => { setQuery(filters.q); }, [filters.q]);
  const activeCount = [filters.genre, filters.min || filters.max, filters.format].filter(Boolean).length;
  const results = filterCatalog(books, filters);
  const chips: { key: keyof CatalogFilters; label: string }[] = [];
  if (filters.genre) chips.push({ key: "genre", label: filters.genre });
  if (filters.min) chips.push({ key: "min", label: `Desde ${filters.min} €` });
  if (filters.max) chips.push({ key: "max", label: `Hasta ${filters.max} €` });
  if (filters.format) chips.push({ key: "format", label: filters.format });
  return <>
    <p className="welcome-eyebrow">TU REFUGIO LITERARIO</p>
    <h1 className="member-title">Catálogo</h1>
    <div className="catalog-toolbar">
      <form role="search" className="catalog-search-field" onSubmit={event => { event.preventDefault(); onChange({ ...filters, q: query.trim() }); }}>
        <Search aria-hidden="true" className="catalog-search-icon" />
        <Input type="search" aria-label="Buscar libros" placeholder="Título, autor o ISBN" value={query} onChange={event => setQuery(event.target.value)} />
        <Button type="submit" variant="quiet" size="icon" aria-label="Buscar" title="Buscar"><Search /></Button>
      </form>
      <Sheet open={open} onOpenChange={next => { setOpen(next); if (next) { setDraft(filters); setError(""); } }}>
        <SheetTrigger asChild><Button variant={activeCount ? "default" : "outline"} size="icon" className="catalog-filter-trigger" aria-label={activeCount ? `Filtros, ${activeCount} activos` : "Filtros"} title="Filtrar libros"><SlidersHorizontal />{activeCount > 0 && <span className="catalog-filter-count">{activeCount}</span>}</Button></SheetTrigger>
        <SheetContent side="right" className="catalog-filter-panel">
          <SheetHeader><SheetTitle>Filtrar libros</SheetTitle><SheetDescription>Género, precio y formato</SheetDescription></SheetHeader>
          <form className="catalog-filter-form" onSubmit={event => {
            event.preventDefault();
            if (draft.min && draft.max && Number(draft.min) > Number(draft.max)) { setError("El precio máximo debe ser igual o mayor que el mínimo."); return; }
            onChange({ ...draft, q: query.trim() }); setOpen(false);
          }}>
            <div className="catalog-filter-group"><label htmlFor="catalog-genre">Género</label><Select value={draft.genre || "all"} onValueChange={value => setDraft({ ...draft, genre: value === "all" ? "" : value })}><SelectTrigger id="catalog-genre"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos los géneros</SelectItem>{catalogGenres.map(genre => <SelectItem key={genre} value={genre}>{genre}</SelectItem>)}</SelectContent></Select></div>
            <fieldset className="catalog-filter-group"><legend>Precio (€)</legend><div className="catalog-price-range"><div><label htmlFor="catalog-min">Mínimo</label><Input id="catalog-min" type="number" min="0" step="0.01" inputMode="decimal" placeholder="Sin mínimo" value={draft.min} onChange={event => { setDraft({ ...draft, min: event.target.value }); setError(""); }} /></div><div><label htmlFor="catalog-max">Máximo</label><Input id="catalog-max" type="number" min="0" step="0.01" inputMode="decimal" placeholder="Sin máximo" value={draft.max} onChange={event => { setDraft({ ...draft, max: event.target.value }); setError(""); }} /></div></div></fieldset>
            <div className="catalog-filter-group"><label htmlFor="catalog-format">Formato</label><Select value={draft.format || "all"} onValueChange={value => setDraft({ ...draft, format: value === "all" ? "" : value })}><SelectTrigger id="catalog-format"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos los formatos</SelectItem>{["Tapa blanda", "Tapa dura", "Ebook", "Audiolibro"].map(format => <SelectItem key={format} value={format}>{format}</SelectItem>)}</SelectContent></Select></div>
            {error && <p role="alert" className="text-destructive text-sm">{error}</p>}
            <div className="catalog-filter-actions"><Button type="submit">Aplicar filtros</Button><Button type="button" variant="quiet" onClick={() => { setDraft({ ...emptyCatalogFilters, q: query }); setError(""); }}><RotateCcw />Restablecer filtros</Button></div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
    {chips.length > 0 && <div className="catalog-active-filters">{chips.map(chip => <Button key={chip.key} variant="outline" size="sm" onClick={() => onChange({ ...filters, [chip.key]: "" })} aria-label={`Quitar filtro: ${chip.label}`}>{chip.label}<X /></Button>)}</div>}
    <div className="catalog-results-heading"><span>{results.length} libros</span>{(filters.q || activeCount > 0) && <Button variant="quiet" size="sm" onClick={() => { setQuery(""); onChange(emptyCatalogFilters); }}><RotateCcw />Limpiar búsqueda</Button>}</div>
    <div className="member-empty catalog-empty" role="status"><BookOpen /><h2>{books.length === 0 ? "Todavía no hay libros en el catálogo." : "No se encontraron libros."}</h2>{books.length > 0 && <p>Prueba con otra búsqueda o cambia los filtros.</p>}</div>
  </>;
}