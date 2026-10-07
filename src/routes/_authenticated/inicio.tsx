import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpRight, BookOpen, MessageSquare, PackagePlus, Leaf } from "lucide-react";
import { getMemberHome } from "@/lib/member.functions";
import { pageMeta } from "@/lib/page-meta";
import { Button } from "@/components/ui/button";
import banner from "@/assets/gremlib-banner.asset.json";

const homeOptions = queryOptions({ queryKey: ["member-home"], queryFn: () => getMemberHome(), staleTime: 0 });
export const Route = createFileRoute("/_authenticated/inicio")({
  loader: ({ context }) => context.queryClient.ensureQueryData(homeOptions),
  head: () => pageMeta("Inicio", "Tu espacio en GremLib: descubre el catálogo, reseña tus lecturas y accede a tu perfil."),
  errorComponent: ({ reset }) => <div className="member-empty"><h1>No se ha podido cargar Inicio.</h1><Button variant="quiet" onClick={reset}>Reintentar</Button></div>,
  notFoundComponent: () => <p>Este espacio no está disponible.</p>,
  component: MemberHome,
});
function MemberHome() {
  const { data } = useSuspenseQuery(homeOptions);
  return <>
    <section className="member-greeting"><div><p className="welcome-eyebrow">TU REFUGIO LITERARIO</p><h1 className="member-title">Hola{data.displayName ? `, ${data.displayName.split(" ")[0]}` : ""}<span>.</span></h1><p>¿Qué historia comienza hoy?</p></div><img src={banner.url} alt="El duende lector de GremLib" /></section>
    <div className="member-section-heading"><h2>Tu próximo capítulo</h2><span><Leaf /> A tu ritmo</span></div>
    <div className="home-options">
      <Button variant="quiet" asChild><Link to="/catalogo" className="home-option catalog-option"><span className="option-icon"><BookOpen /></span><span className="option-copy"><span className="option-kicker">EXPLORA</span><strong>Catálogo</strong><span>Encuentra tu próxima lectura.</span></span><ArrowUpRight className="option-arrow" /></Link></Button>
      <Button variant="quiet" asChild><Link to="/resenar" className="home-option review-option"><span className="option-icon"><MessageSquare /></span><span className="option-copy"><span className="option-kicker">COMPARTE</span><strong>Reseñar</strong><span>Cada lectura merece una opinión.</span></span><ArrowUpRight className="option-arrow" /></Link></Button>
      {data.isAdmin && <Button variant="quiet" asChild><Link to="/reponer" className="home-option restock-option"><span className="option-icon"><PackagePlus /></span><span className="option-copy"><span className="option-kicker">ADMINISTRACIÓN</span><strong>Reponer</strong><span>Cuida las existencias de la librería.</span></span><ArrowUpRight className="option-arrow" /></Link></Button>}
    </div>
    <p className="member-signature"><BookOpen /> Una aventura en cada página.</p>
  </>;
}