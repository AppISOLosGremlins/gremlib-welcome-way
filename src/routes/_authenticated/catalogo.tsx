import { createFileRoute } from "@tanstack/react-router";
import { MemberEmpty } from "@/components/member-shell";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/_authenticated/catalogo")({ head: () => pageMeta("Catálogo", "Los libros de tu librería GremLib."), component: () => <MemberEmpty kind="catalog" /> });