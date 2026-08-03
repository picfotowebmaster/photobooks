import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    })
  ),
}));

describe("GET /api/profile", () => {
  let GET: any;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    const mod = await import("@/app/api/profile/route");
    GET = mod.GET;
  });

  it("devuelve 401 sin sesión", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await GET();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("No autorizado");
  });

  it("devuelve perfil del usuario autenticado", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: "user-1", email: "test@test.com" },
      },
      error: null,
    });

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        id: "user-1",
        email: "test@test.com",
        full_name: "Juan Pérez",
        phone: null,
        role: "client",
        is_active: true,
        rfc: null,
        razon_social: null,
        regimen_fiscal: null,
        created_at: "2025-01-01",
        updated_at: "2025-01-01",
      },
      error: null,
    });

    mockFrom.mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.email).toBe("test@test.com");
    expect(body.data.full_name).toBe("Juan Pérez");
  });
});

describe("PATCH /api/profile", () => {
  let PATCH: any;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    const mod = await import("@/app/api/profile/route");
    PATCH = mod.PATCH;
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: "user-1", email: "test@test.com" },
      },
      error: null,
    });
  });

  it("actualiza nombre y teléfono", async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        id: "user-1",
        full_name: "Nuevo Nombre",
        phone: "5551234567",
      },
      error: null,
    });

    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({ eq: mockEq, select: mockSelect, single: mockSingle }),
    });

    const req = new Request("http://localhost/api/profile", {
      method: "PATCH",
      body: JSON.stringify({ full_name: "Nuevo Nombre", phone: "5551234567" }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.full_name).toBe("Nuevo Nombre");
  });

  it("guarda datos de facturación", async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        id: "user-1",
        rfc: "TEST850101XXX",
        razon_social: "Juan Pérez",
        regimen_fiscal: "Persona Física con Actividad Empresarial",
        cp_fiscal: "12345",
        uso_cfdi: "Gastos en general",
      },
      error: null,
    });

    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      }),
    });

    const req = new Request("http://localhost/api/profile", {
      method: "PATCH",
      body: JSON.stringify({
        rfc: "TEST850101XXX",
        razon_social: "Juan Pérez",
        regimen_fiscal: "Persona Física con Actividad Empresarial",
        cp_fiscal: "12345",
        uso_cfdi: "Gastos en general",
      }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.rfc).toBe("TEST850101XXX");
  });
});
