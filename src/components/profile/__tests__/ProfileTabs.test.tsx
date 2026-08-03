import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { User, MapPin, FileText, CreditCard } from "lucide-react";
import { ProfileTabs } from "@/components/profile/ProfileTabs";

const tabs = [
  { id: "personal", label: "Datos personales", icon: User },
  { id: "addresses", label: "Direcciones", icon: MapPin },
  { id: "billing", label: "Facturación", icon: FileText },
  { id: "payments", label: "Pagos", icon: CreditCard },
];

describe("ProfileTabs", () => {
  it("renderiza los 4 tabs", () => {
    render(<ProfileTabs tabs={tabs} activeTab="personal" onTabChange={() => {}} />);
    expect(screen.getByText("Datos personales")).toBeInTheDocument();
    expect(screen.getByText("Direcciones")).toBeInTheDocument();
    expect(screen.getByText("Facturación")).toBeInTheDocument();
    expect(screen.getByText("Pagos")).toBeInTheDocument();
  });

  it("tab activo tiene clase de borde indigo", () => {
    render(<ProfileTabs tabs={tabs} activeTab="addresses" onTabChange={() => {}} />);
    const active = screen.getByText("Direcciones").closest("button");
    expect(active?.className).toContain("border-indigo-600");
    expect(active?.className).toContain("text-indigo-600");
  });

  it("tab inactivo NO tiene clase de borde indigo", () => {
    render(<ProfileTabs tabs={tabs} activeTab="personal" onTabChange={() => {}} />);
    const inactive = screen.getByText("Direcciones").closest("button");
    expect(inactive?.className).toContain("border-transparent");
  });

  it("click en tab llama onTabChange con el id correcto", () => {
    const onChange = vi.fn();
    render(<ProfileTabs tabs={tabs} activeTab="personal" onTabChange={onChange} />);
    fireEvent.click(screen.getByText("Pagos"));
    expect(onChange).toHaveBeenCalledWith("payments");
  });
});
