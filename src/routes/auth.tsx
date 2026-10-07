import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/components/auth-provider";
import { AuthLayout } from "@/components/auth-layout";
import { AccountProfile } from "@/components/account-profile";
import { PasswordField } from "@/components/password-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authErrorMessage } from "@/lib/auth-errors";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode: "login" | "signup" | "forgot" } => ({ mode: search.mode === "signup" || search.mode === "forgot" ? search.mode : "login" }),
  head: () => ({ meta: [ { title: "Tu cuenta — GremLib" }, { name: "description", content: "Inicia sesión o crea tu cuenta de GremLib y personaliza tu perfil lector." }, { property: "og:title", content: "Tu cuenta — GremLib" }, { property: "og:description", content: "Tu rincón de lectura comienza con una cuenta GremLib." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" } ] }),
  component: AuthPage,
});
function AuthPage() {
  const { mode } = Route.useSearch();
  const { user, loading, recovery } = useAuth();
  return <AuthLayout>{loading ? <p className="auth-description" role="status">Preparando tu refugio…</p> : user && !recovery ? <AccountProfile /> : <AuthForm key={mode} mode={mode} />}</AuthLayout>;
}
function AuthForm({ mode }: { mode: "login" | "signup" | "forgot" }) {
  const [email, setEmail] = useState(""); const [name, setName] = useState(""); const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [message, setMessage] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault(); setError(""); setMessage("");
    if (mode === "signup" && password !== confirm) { setError("Las contraseñas no coinciden."); return; }
    if (mode === "signup" && !name.trim()) { setError("Escribe tu nombre para crear el perfil."); return; }
    setBusy(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setMessage("Si existe una cuenta con ese correo, recibirás un enlace para cambiar tu contraseña. Revisa también la carpeta de spam.");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { display_name: name.trim() }, emailRedirectTo: window.location.origin } });
        if (error) throw error;
        if (!data.session) setMessage("Revisa tu correo para confirmar la cuenta. Si ya tienes una, puedes iniciar sesión o recuperar tu contraseña.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password }); if (error) throw error;
      }
    } catch (e) { setError(authErrorMessage(e instanceof Error ? e : new Error("Unknown"))); } finally { setBusy(false); }
  }
  async function google() {
    setBusy(true); setError("");
    try { const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth` }); if (result.error) throw result.error; } catch { setError("No se ha podido iniciar sesión con Google. Inténtalo de nuevo."); } finally { setBusy(false); }
  }
  return <div className="auth-body">
    <p className="welcome-eyebrow">{mode === "forgot" ? "VOLVAMOS A TU HISTORIA" : "TU PRÓXIMO CAPÍTULO EMPIEZA AQUÍ"}</p>
    <h1>{mode === "signup" ? "Crea tu refugio." : mode === "forgot" ? "¿Olvidaste tu contraseña?" : "Qué bueno verte."}</h1>
    <p className="auth-description">{mode === "signup" ? "Un pequeño espacio para ti y tus grandes historias." : mode === "forgot" ? "Te enviaremos un enlace para elegir una nueva." : "Tus historias te estaban esperando."}</p>
    {mode !== "forgot" && <div className="auth-tabs"><Button variant="quiet" asChild><Link to="/auth" search={{ mode: "login" }} className={mode === "login" ? "is-active" : ""}>Iniciar sesión</Link></Button><Button variant="quiet" asChild><Link to="/auth" search={{ mode: "signup" }} className={mode === "signup" ? "is-active" : ""}>Crear cuenta</Link></Button></div>}
    <form className="auth-form" onSubmit={submit}>
      {mode === "signup" && <><label htmlFor="name">Tu nombre</label><Input id="name" autoComplete="name" maxLength={80} required value={name} onChange={e => setName(e.target.value)} /></>}
      <label htmlFor="email">Correo electrónico</label><Input id="email" type="email" autoComplete="email" required maxLength={254} placeholder="tu@correo.com" value={email} onChange={e => setEmail(e.target.value)} />
      {mode !== "forgot" && <><label htmlFor="password">Contraseña</label><PasswordField id="password" value={password} onChange={setPassword} newPassword={mode === "signup"} />{mode === "signup" ? <><p className="field-hint">Al menos 8 caracteres.</p><label htmlFor="confirm">Repite tu contraseña</label><PasswordField id="confirm" value={confirm} onChange={setConfirm} newPassword /></> : <Button variant="quiet" className="forgot-link" asChild><Link to="/auth" search={{ mode: "forgot" }}>¿Has olvidado tu contraseña?</Link></Button>}</>}
      {error && <p className="auth-message is-error" role="alert">{error}</p>}{message && <p className="auth-message" role="status"><Mail />{message}</p>}
      <Button type="submit" variant="welcome" disabled={busy}>{busy ? "Un momento…" : mode === "signup" ? "Crear mi cuenta" : mode === "forgot" ? "Enviar enlace" : "Entrar en GremLib"}<ArrowRight /></Button>
    </form>
    {mode !== "forgot" ? <><div className="auth-divider"><span>o continúa con</span></div><Button variant="outline" className="google-button" disabled={busy} onClick={google}><span className="google-letter" aria-hidden="true">G</span> Google</Button><p className="auth-privacy"><ShieldCheck /> Tu perfil es solo tuyo.</p></> : <Button variant="quiet" className="auth-signout" asChild><Link to="/auth" search={{ mode: "login" }}>Volver a iniciar sesión</Link></Button>}
  </div>;
}