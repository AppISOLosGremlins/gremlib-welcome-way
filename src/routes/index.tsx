import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, BookOpen, Bookmark, Heart, Sparkles, Leaf, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import banner from "@/assets/gremlib-banner.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Bienvenido a GremLib — Tu próxima aventura" },
    { name: "description", content: "Descubre GremLib: un pequeño refugio para grandes historias. Tu próxima aventura comienza con una página." },
    { property: "og:title", content: "Bienvenido a GremLib — Tu próxima aventura" },
    { property: "og:description", content: "Un pequeño refugio para grandes historias. Conoce tu nueva librería GremLib." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { property: "og:image", content: banner.url },
    { name: "twitter:image", content: banner.url },
  ] }),
  component: Index,
});

const slides = [
  { label: "BIENVENIDO A TU REFUGIO LITERARIO", title: <>Pequeño duende.<br />Grandes <span>historias.</span></>, description: "Hay un libro esperando por ti. Y un pequeño compañero para ayudarte a encontrarlo.", tag: "Una aventura en cada página", icon: BookOpen },
  { label: "SIEMPRE HAY ALGO POR DESCUBRIR", title: <>Una página.<br />Mil <span>mundos.</span></>, description: "Misterios, aventuras y lugares inimaginables. Deja que la curiosidad elija tu próxima historia.", tag: "Sigue tu curiosidad", icon: Sparkles },
  { label: "LAS BUENAS HISTORIAS SE QUEDAN", title: <>Tu rincón.<br />Tus <span>historias.</span></>, description: "Para los que subrayan, sueñan y dicen «solo un capítulo más». Este es tu lugar.", tag: "Hecho para amantes de los libros", icon: Heart },
];

function Index() {
  const [step, setStep] = useState(0);
  const slide = slides[step];
  const TagIcon = slide.icon;
  return (
    <main className="welcome-page">
      <header className="welcome-header">
        <a href="/" className="brand-mark" aria-label="GremLib, inicio"><BookOpen /><span>GremLib<span className="brand-period">.</span></span></a>
        <span className="header-note"><Leaf /> Un lugar para perderse leyendo</span>
        <Button variant="quiet" onClick={() => setStep(step === 2 ? 0 : 2)}>{step === 2 ? "Volver al inicio" : "Saltar introducción"}<ArrowRight /></Button>
      </header>

      <section className="welcome-content" aria-label="Introducción a GremLib">
        <div className="illustration-scene">
          <span className="scene-orbit" aria-hidden="true" />
          <Sparkles className="scene-sparkle sparkle-one" aria-hidden="true" />
          <Sparkles className="scene-sparkle sparkle-two" aria-hidden="true" />
          <BookOpen className="scene-book" aria-hidden="true" />
          <Bookmark className="scene-bookmark" aria-hidden="true" />
          <img className="gremlib-illustration" src={banner.url} alt="El duende de GremLib leyendo un libro, sobre el nombre GremLib" fetchPriority="high" />
          <span className="story-label"><TagIcon />{slide.tag}</span>
        </div>

        <div className="welcome-copy" key={step} aria-live="polite">
          <p className="welcome-eyebrow">{slide.label}</p>
          <h1>{slide.title}</h1>
          <p className="welcome-description">{slide.description}</p>
        </div>

        <div className="welcome-actions">
          <div className="step-dots" aria-label="Pasos de la introducción">
            {slides.map((_, i) => <Button key={i} variant="quiet" className={`step-dot ${step === i ? "is-current" : ""}`} aria-label={`Ver paso ${i + 1}`} aria-current={step === i ? "step" : undefined} onClick={() => setStep(i)} />)}
          </div>
          <Button variant="welcome" onClick={() => setStep(step === 2 ? 0 : step + 1)}>{step === 0 ? "Comenzar la aventura" : step === 1 ? "Continuar" : "Volver a la bienvenida"}{step === 2 ? <RotateCcw /> : <ArrowRight />}</Button>
          <p className="welcome-footnote"><Heart /> Para quienes aman el olor de un buen libro.</p>
        </div>
      </section>
      <footer className="welcome-footer"><span>LIBROS, MAGIA Y UN POCO DE CURIOSIDAD</span><span>GremLib © 2026</span></footer>
    </main>
  );
}
