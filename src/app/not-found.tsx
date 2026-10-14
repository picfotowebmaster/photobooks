import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-neutral-50 px-6 text-center">
      <p className="text-6xl font-bold text-neutral-900">404</p>
      <p className="text-lg text-neutral-600">La página que buscas no existe.</p>
      <Link href="/">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  );
}
