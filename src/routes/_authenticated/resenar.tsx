import { createFileRoute } from "@tanstack/react-router";
import { MemberEmpty } from "@/components/member-shell";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/_authenticated/resenar")({ head: () => pageMeta("Reseñar", "Comparte tus opiniones sobre los libros de GremLib."), component: () => <MemberEmpty kind="reviews" /> });