import { describe, it, expect, vi, beforeEach } from "vitest";
import { chainable, mockSupabaseClient } from "@/test-helpers";

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: vi.fn(),
}));

describe("GET /api/profile/addresses", () => {
  let GET: any;
  let mockClient: ReturnType<typeof mockSupabaseClient>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockClient = mockSupabaseClient();
    const { createServerSupabase } = await import("@/lib/supabase/server");
    (createServerSupabase as any).mockReturnValue(mockClient);

    const mod = await import("@/app/api/profile/addresses/route");
    GET = mod.GET;
  });

  it("devuelve 401 sin sesión", async () => {
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("devuelve lista de direcciones del usuario", async () => {
    mockClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" }, session: null },
      error: null,
    });

    mockClient.from.mockReturnValue(
      chainable({
        data: [
          { id: "addr-1", label: "Casa", street: "Av. Siempre Viva", city: "CDMX", is_default: true },
          { id: "addr-2", label: "Oficina", street: "Reforma 222", city: "CDMX", is_default: false },
        ],
        error: null,
      })
    );

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(2);
    expect(body.data[0].label).toBe("Casa");
  });
});

describe("POST /api/profile/addresses", () => {
  let POST: any;
  let mockClient: ReturnType<typeof mockSupabaseClient>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockClient = mockSupabaseClient({ id: "user-1", email: "test@test.com" });
    const { createServerSupabase } = await import("@/lib/supabase/server");
    (createServerSupabase as any).mockReturnValue(mockClient);

    const mod = await import("@/app/api/profile/addresses/route");
    POST = mod.POST;
  });

  it("crea dirección exitosamente", async () => {
    mockClient.from.mockReturnValue(
      chainable({
        data: { id: "addr-3", label: "Casa", street: "Nueva Calle 123", city: "GDL", is_default: true },
        error: null,
      })
    );

    const req = new Request("http://localhost/api/profile/addresses", {
      method: "POST",
      body: JSON.stringify({
        label: "Casa",
        street: "Nueva Calle 123",
        city: "GDL",
        state: "Jalisco",
        zip: "44100",
        is_default: false,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.label).toBe("Casa");
  });
});
