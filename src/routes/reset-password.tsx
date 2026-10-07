import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { AuthLayout } from "@/components/auth-layout";
import { PasswordField } from "@/components/password-field";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { authErrorMessage } from "@/lib/auth-errors";

export const Route = createFileRoute("/reset-password")({ head: () => ({ meta: [ { title: "Nueva contraseña — GremLib" }, { name: "description", content: "Recupera el acceso a tu cuenta de GremLib de forma segura." }, { property: "og:title", content: "Nueva contraseña — GremLib" }, { property: "og:description", content: "Elige una nueva contraseña para tu refugio literario." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" } ] }), component: ResetPassword });
function ResetPassword() {
  const { user, loading, recovery, signOut } = useAuth();
  const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState(""); const [busy, setBusy] = useState(false); const [done, setDone] = useState(false); const [error, setError] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault(); setError(""); if (password !== confirm) { setError("Las contraseñas no coinciden."); return; }
    if (!recovery || !user) return;
    setBusy(true);
    try { const { error } = await supabase.auth.updateUser({ password }); if (error) throw error; setDone(true); } catch (e) { setError(authErrorMessage(e instanceof Error ? e : new Error("Unknown"))); } finally { setBusy(false); }
  }
  return <AuthLayout><div className="auth-body"><p className="welcome-eyebrow">UN NUEVO COMIENZO</p><h1>Nueva contraseña.</h1>
    {loading ? <p role="status">Comprobando tu enlace…</p> : done ? <><p className="auth-message" role="status">Tu contraseña se ha actualizado.</p><Button variant="welcome" disabled={busy} onClick={async () => { setBusy(true); try { await signOut(); } catch { setError("No se ha podido cerrar la sesión. Inténtalo de nuevo."); } finally { setBusy(false); } }}>Volver a iniciar sesión<ArrowRight /></Button></> : recovery && user ? <form className="auth-form" onSubmit={submit}><p className="auth-description">Elige una contraseña de al menos 8 caracteres.</p><label htmlFor="new-password">Nueva contraseña</label><PasswordField id="new-password" value={password} onChange={setPassword} newPassword /><label htmlFor="new-confirm">Repite la contraseña</label><PasswordField id="new-confirm" value={confirm} onChange={setConfirm} newPassword /><Button variant="welcome" type="submit" disabled={busy}>{busy ? "Guardando…" : "Guardar contraseña"}<ArrowRight /></Button></form> : <><p className="auth-description">Este enlace no es válido o ha caducado. Solicita uno nuevo para recuperar tu cuenta.</p><Button variant="welcome" asChild><Link to="/auth" search={{ mode: "forgot" }}>Solicitar nuevo enlace<ArrowRight /></Link></Button></>}
    {error && <p className="auth-message is-error" role="alert">{error}</p>}
  </div></AuthLayout>;
}