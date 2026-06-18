import { APP_NAME } from "@/lib/utils/constants";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 py-8">
      <div className="max-w-screen-2xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-neutral-500">
            © {new Date().getFullYear()} {APP_NAME}. Todos los derechos reservados.
          </span>
          <div className="flex gap-6 text-sm text-neutral-400">
            <a href="#" className="hover:text-neutral-600">Privacidad</a>
            <a href="#" className="hover:text-neutral-600">Términos</a>
            <a href="#" className="hover:text-neutral-600">Contacto</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
