import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import logo from "@/images/Logo-Pic-foto.png";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="max-w-screen-2xl mx-auto px-6 py-20 text-center">
          <img
            src={logo.src}
            alt="PicFoto"
            className="h-20 mx-auto mb-2"
          />
          <p className="text-4xl font-bold tracking-tight text-neutral-900 mb-6">
            Photobooks
          </p>
          <p className="text-xl text-neutral-500 max-w-2xl mx-auto mb-10">
            Arrastra y suelta tus fotos en plantillas increíbles. De 10 a 40
            páginas, impreso en calidad premium.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/editor">
              <Button size="lg">Comenzar a diseñar</Button>
            </Link>
            <Link href="/projects">
              <Button variant="secondary" size="lg">
                Ver proyectos
              </Button>
            </Link>
          </div>
        </section>

        <section className="max-w-screen-2xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Editor arrastrar y soltar",
              desc: "Editor de lienzo intuitivo con vista previa en tiempo real. Redimensiona, rota y posiciona tus fotos libremente.",
            },
            {
              title: "Plantillas profesionales",
              desc: "Elige entre una variedad de diseños predefinidos para cada ocasión.",
            },
            {
              title: "Calidad de impresión premium",
              desc: "Exportación a 300 DPI lista para impresión comercial. Entregado como PDF o JPGs individuales.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-neutral-200 p-6 hover:border-neutral-300 transition-colors"
            >
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-neutral-500">{feature.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
