import { describe, it, expect, vi, beforeEach } from "vitest";
import { chainable, mockSupabaseClient } from "@/test-helpers";

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

describe("GET /api/admin/dashboard", () => {
  let GET: any;
  let mockSrv: ReturnType<typeof mockSupabaseClient>;
  let mockAdmin: ReturnType<typeof mockSupabaseClient>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSrv = mockSupabaseClient();
    mockAdmin = mockSupabaseClient();

    const { createServerSupabase } = await import("@/lib/supabase/server");
    (createServerSupabase as any).mockReturnValue(mockSrv);

    const { createAdminClient } = await import("@/lib/supabase/admin");
    (createAdminClient as any).mockReturnValue(mockAdmin);

    const mod = await import("@/app/api/admin/dashboard/route");
    GET = mod.GET;
  });

  it("devuelve 401 sin sesión", async () => {
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("devuelve 403 si el usuario no es admin", async () => {
    mockSrv.auth.getUser.mockResolvedValue({
      data: { user: { id: "client-1" } },
      error: null,
    });

    mockSrv.from.mockReturnValue(
      chainable({ data: { role: "client" }, error: null })
    );

    const res = await GET();
    expect(res.status).toBe(403);
  });

  it("devuelve métricas para admin", async () => {
    mockSrv.auth.getUser.mockResolvedValue({
      data: { user: { id: "admin-1" } },
      error: null,
    });

    mockSrv.from.mockReturnValue(
      chainable({ data: { role: "admin" }, error: null })
    );

    mockAdmin.from.mockImplementation((table: string) => {
      if (table === "profiles") return chainable({ data: [], error: null, count: 15 });
      if (table === "projects") return chainable({ data: [], error: null, count: 42 });
      if (table === "orders") return chainable({ data: [], error: null, count: 5 });
      return chainable({ data: [], error: null, count: 0 });
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("totalClients");
    expect(body).toHaveProperty("totalRevenue");
    expect(body).toHaveProperty("revenueChart");
    expect(body).toHaveProperty("signupsChart");
    expect(body).toHaveProperty("topClients");
  });
});
