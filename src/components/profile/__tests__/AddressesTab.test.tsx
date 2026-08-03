import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AddressesTab } from "@/components/profile/AddressesTab";

const mockAddresses = [
  {
    id: "addr-1",
    user_id: "user-1",
    label: "Casa",
    full_name: "Juan Pérez",
    phone: "5551234567",
    street: "Av. Siempre Viva",
    ext_number: "742",
    int_number: null,
    neighborhood: "Springfield",
    city: "CDMX",
    state: "CDMX",
    zip: "12345",
    country: "México",
    is_default: true,
    created_at: "2025-01-01",
  },
  {
    id: "addr-2",
    user_id: "user-1",
    label: "Oficina",
    full_name: null,
    phone: null,
    street: "Reforma 222",
    ext_number: "100",
    int_number: "4B",
    neighborhood: "Juárez",
    city: "CDMX",
    state: "CDMX",
    zip: "06600",
    country: "México",
    is_default: false,
    created_at: "2025-02-01",
  },
];

describe("AddressesTab", () => {
  it("muestra direcciones guardadas", () => {
    render(<AddressesTab addresses={mockAddresses} onRefresh={() => {}} />);
    expect(screen.getByText("Casa")).toBeInTheDocument();
    expect(screen.getByText("Oficina")).toBeInTheDocument();
    expect(screen.getByText(/Av. Siempre Viva/)).toBeInTheDocument();
    expect(screen.getByText(/Reforma 222/)).toBeInTheDocument();
  });

  it("muestra badge 'Principal' en la dirección default", () => {
    render(<AddressesTab addresses={mockAddresses} onRefresh={() => {}} />);
    expect(screen.getByText("Principal")).toBeInTheDocument();
  });

  it("muestra empty state sin direcciones", () => {
    render(<AddressesTab addresses={[]} onRefresh={() => {}} />);
    expect(screen.getByText("No tienes direcciones guardadas.")).toBeInTheDocument();
  });

  it("botón Agregar abre formulario de nueva dirección", () => {
    render(<AddressesTab addresses={mockAddresses} onRefresh={() => {}} />);
    fireEvent.click(screen.getByText("Agregar"));
    expect(screen.getByText("Nueva dirección")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Calle")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ciudad")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Estado")).toBeInTheDocument();
  });
});
