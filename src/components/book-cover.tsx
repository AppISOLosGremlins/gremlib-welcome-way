import { BookOpen } from "lucide-react";

const coverStyles: Record<string, string> = {
  "Fantasía": "book-cover-fantasia",
  "Ciencia ficción": "book-cover-ciencia",
  "Misterio": "book-cover-misterio",
  "Romance": "book-cover-romance",
  "Historia": "book-cover-historia",
  "Infantil": "book-cover-infantil",
  "Poesía": "book-cover-poesia",
  "Ensayo": "book-cover-ensayo",
};

export function BookCover({ title, author, genre, size = "large" }: { title: string; author: string; genre: string; size?: "small" | "large" }) {
  const variant = coverStyles[genre] ?? "book-cover-default";
  return (
    <div className={`book-cover ${variant} book-cover-${size}`} role="img" aria-label={`Portada ilustrada de ${title}`}>
      <span className="book-cover-genre">{genre}</span>
      <strong className="book-cover-title">{title}</strong>
      <span className="book-cover-author">{author}</span>
      <BookOpen aria-hidden="true" className="book-cover-mark" />
    </div>
  );
}
