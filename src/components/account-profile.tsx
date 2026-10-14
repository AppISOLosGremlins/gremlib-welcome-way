import { useEffect, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, LogOut, MessageSquare, Save } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authErrorMessage } from "@/lib/auth-errors";

const genres = ["Fantasía", "Misterio", "Romance", "Ciencia ficción", "Historia", "No ficción"];
export function AccountProfile() {
  const { user, signOut } = useAuth();
  const [name, setName] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const profile = useQuery({ queryKey: ["profile", user?.id], enabled: !!user, queryFn: async () => {
    if (!user) return null;
    const { data, error } = await supabase.from("profiles").select("display_name,reading_preferences").eq("id", user.id).single();
    if (error) throw error;
    return data;
  } });
  useEffect(() => { if (profile.data) { setName(profile.data.display_name); setPreferences(profile.data.reading_preferences); } }, [profile.data]);
  async function save(e: FormEvent) {
    e.preventDefault(); if (!user) return;
    setBusy(true); setMessage(""); setError("");
    try {
      const { data, error } = await supabase.from("profiles").update({ display_name: name.trim(), reading_preferences: preferences }).eq("id", user.id).select("id").single();
      if (error || !data) throw error ?? new Error("Profile unavailable");
      await profile.refetch(); setMessage("Tu perfil se ha guardado.");
    } catch { setError("No se ha podido guardar tu perfil. Inténtalo de nuevo."); } finally { setBusy(false); }
  }
  if (!user) return null;
  return <div className="auth-body">
    <p className="welcome-eyebrow">TU REFUGIO LITERARIO</p><h1>Ya estás en casa.</h1>
    <p className="auth-description">Tu cuenta de GremLib está lista.</p>
    <p className="account-email">{user.email}</p>
    <Button variant="quiet" asChild className="profile-reviews-link"><Link to="/mis-resenas"><MessageSquare /> Mis reseñas</Link></Button>
    {profile.isPending ? <p role="status">Cargando tu perfil…</p> : profile.isError ? <div className="auth-message is-error" role="alert">No se ha podido cargar tu perfil.<Button variant="quiet" onClick={() => void profile.refetch()}>Reintentar</Button></div> : <form className="auth-form" onSubmit={save}>
      <label htmlFor="profile-name">Tu nombre</label><Input id="profile-name" value={name} onChange={e => setName(e.target.value)} required maxLength={80} />
      <fieldset><legend><BookOpen /> ¿Qué te gusta leer?</legend><div className="genre-options">{genres.map(genre => <label key={genre} className="genre-option"><input type="checkbox" checked={preferences.includes(genre)} onChange={e => setPreferences(e.target.checked ? [...preferences, genre] : preferences.filter(p => p !== genre))} />{genre}</label>)}</div></fieldset>
      {message && <p className="auth-message" role="status">{message}</p>}{error && <p className="auth-message is-error" role="alert">{error}</p>}
      <Button variant="welcome" type="submit" disabled={busy}>{busy ? "Guardando…" : "Guardar perfil"}<Save /></Button>
    </form>}
    <Button variant="quiet" disabled={busy} className="auth-signout" onClick={async () => { setBusy(true); try { await signOut(); } catch (e) { setError(authErrorMessage(e instanceof Error ? e : new Error("Unknown"))); } finally { setBusy(false); } }}><LogOut /> Cerrar sesión</Button>
  </div>;
}