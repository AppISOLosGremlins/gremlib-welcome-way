import { Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AccessibilitySettingsButton } from "@/components/accessibility-settings";
import banner from "@/assets/gremlib-banner.asset.json";

export function AuthLayout({ children }: { children: ReactNode }) {
  return <main className="welcome-page auth-page">
    <header className="welcome-header">
      <Link to="/" className="brand-mark"><BookOpen /><span>GremLib<span className="brand-period">.</span></span></Link>
      <div className="auth-header-actions">
        <AccessibilitySettingsButton />
        <Button variant="quiet" asChild><Link to="/"><ArrowLeft /> Volver a la bienvenida</Link></Button>
      </div>
    </header>
    <section className="auth-content">
      <img src={banner.url} className="auth-mascot" alt="Duende lector de GremLib" />
      {children}
    </section>
    <footer className="welcome-footer"><span>TU PEQUEÑO REFUGIO PARA GRANDES HISTORIAS</span><span>GremLib © 2026</span></footer>
  </main>;
}