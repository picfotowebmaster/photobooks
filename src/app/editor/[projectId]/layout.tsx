import { Header } from "@/components/layout/Header";

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">{children}</div>
    </div>
  );
}
