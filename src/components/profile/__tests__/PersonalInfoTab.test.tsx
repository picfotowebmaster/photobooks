import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PersonalInfoTab } from "@/components/profile/PersonalInfoTab";

const mockProfile = {
  id: "user-1",
  email: "juan@test.com",
  full_name: "Juan Pérez",
  phone: null,
  avatar_url: null,
  role: "client",
  is_active: true,
  rfc: null,
  razon_social: null,
  regimen_fiscal: null,
  cp_fiscal: null,
  uso_cfdi: null,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

describe("PersonalInfoTab", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("muestra el nombre y email del perfil", () => {
    render(<PersonalInfoTab profile={mockProfile} onUpdate={() => {}} />);
    expect(screen.getAllByText("Juan Pérez").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("juan@test.com")).toBeInTheDocument();
  });

  it("muestra mensaje de miembro desde la fecha", () => {
    render(<PersonalInfoTab profile={mockProfile} onUpdate={() => {}} />);
    expect(screen.getByText(/Miembro desde/)).toBeInTheDocument();
  });

  it("al hacer click en Editar perfil, muestra formulario", () => {
    render(<PersonalInfoTab profile={mockProfile} onUpdate={() => {}} />);
    fireEvent.click(screen.getByText("Editar perfil"));
    expect(screen.getByPlaceholderText("Tu nombre completo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Tu número de teléfono")).toBeInTheDocument();
    expect(screen.getByText("Guardar")).toBeInTheDocument();
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("al cancelar, vuelve a vista de solo lectura", () => {
    render(<PersonalInfoTab profile={mockProfile} onUpdate={() => {}} />);
    fireEvent.click(screen.getByText("Editar perfil"));
    fireEvent.click(screen.getByText("Cancelar"));
    expect(screen.queryByPlaceholderText("Tu nombre completo")).not.toBeInTheDocument();
    expect(screen.getByText("Editar perfil")).toBeInTheDocument();
  });
});
