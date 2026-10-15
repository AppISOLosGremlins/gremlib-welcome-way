import { createFileRoute, redirect } from "@tanstack/react-router";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/_authenticated/resenar")({ head: () => pageMeta("Reseñar", "Consulta tus opiniones de libros en GremLib."), beforeLoad: () => { throw redirect({ to: "/mis-resenas", replace: true }); } });
