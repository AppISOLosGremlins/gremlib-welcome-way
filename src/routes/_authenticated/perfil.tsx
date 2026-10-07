import { createFileRoute } from "@tanstack/react-router";
import { AccountProfile } from "@/components/account-profile";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/_authenticated/perfil")({ head: () => pageMeta("Mi perfil", "Tu nombre y preferencias de lectura en GremLib."), component: () => <div className="member-profile"><AccountProfile /></div> });