import { AppHeader } from "@/components/layout/AppHeader";

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden">
      <AppHeader />
      <main className="flex min-h-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
