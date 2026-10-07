import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ShieldX } from "lucide-react";
import { MemberEmpty } from "@/components/member-shell";
import { Button } from "@/components/ui/button";
import { verifyRestockAccess } from "@/lib/member.functions";
import { pageMeta } from "@/lib/page-meta";
const accessOptions = queryOptions({ queryKey: ["restock-access"], queryFn: () => verifyRestockAccess(), staleTime: 0 });
export const Route = createFileRoute("/_authenticated/reponer")({
  loader: ({ context }) => context.queryClient.ensureQueryData(accessOptions),
  head: () => pageMeta("Reponer", "Espacio de administración de existencias de GremLib."),
  errorComponent: ({ reset }) => <div className="member-empty"><h1>No se han podido comprobar tus permisos.</h1><Button variant="quiet" onClick={reset}>Reintentar</Button></div>,
  notFoundComponent: () => <p>Este espacio no está disponible.</p>,
  component: Restock,
});
function Restock() {
  const { data } = useSuspenseQuery(accessOptions);
  if (!data.allowed) return <div className="member-empty"><ShieldX /><h1>Acceso restringido</h1><p>Solo los administradores pueden reponer libros.</p><Button variant="quiet" asChild><Link to="/inicio">Volver a Inicio</Link></Button></div>;
  return <MemberEmpty kind="restock" />;
}