import { ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShop } from "@/components/shop-provider";
import { quantityLimit } from "@/lib/shop";
import type { CatalogBook } from "@/lib/catalog-search";

export function AddToBasket({ book, compact = false }: { book: CatalogBook; compact?: boolean }) {
  const { add, ready, busy, shop } = useShop();
  const count = shop.items.find(item => item.id === book.id)?.quantity ?? 0;
  const soldOut = quantityLimit(book) === 0;
  const atLimit = count >= quantityLimit(book);
  const label = soldOut ? `Agotado: ${book.title}` : atLimit ? `Cantidad máxima en cesta: ${book.title}` : `Añadir ${book.title} a la cesta`;
  return <Button variant={compact ? "outline" : "welcome"} size={compact ? "icon" : "default"} className={compact ? "catalog-add" : "book-add"}
    disabled={!ready || busy || atLimit} aria-label={label} title={label} onClick={() => add(book)}>
    <ShoppingBasket aria-hidden="true" />{!compact && (soldOut ? "Agotado" : atLimit ? "Máximo en la cesta" : "Añadir a la cesta")}
  </Button>;
}
