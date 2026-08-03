import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockSingle = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    })
  ),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

describe("GET /api/admin/clients", () => {
  let GET: any;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    const mod = await import("@/app/api/admin/clients/route");
    GET = mod.GET;
  });

  it("devuelve 403 si no es admin", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "client-1" } }, error: null });
    mockSingle.mockResolvedValue({ data: { role: "client" }, error: null });
    mockFrom.mockReturnValue({ select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: mockSingle }) }) });

    const res = await GET(new Request("http://localhost/api/admin/clients"));
    expect(res.status).toBe(403);
  });

  it("devuelve lista paginada de clientes", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1" } },
      error: null,
    });
    mockSingle.mockResolvedValue({ data: { role: "admin" }, error: null });

    const clientData = [
      {
        id: "c1",
        email: "cliente1@test.com",
        full_name: "Cliente Uno",
        phone: null,
        role: "client",
        is_active: true,
        created_at: "2025-01-01",
      },
    ];

    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: mockSingle,
    };

    chain.range.mockResolvedValue({
      data: clientData,
      count: 1,
      error: null,
    });

    const countResult = { count: 0, error: null };
    const ordersResult = { data: [], error: null };

    mockFrom.mockImplementation((table?: string) => {
      if (table === "profiles") return chain;
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(countResult),
        }),
      };
    });

    const res = await GET(new Request("http://localhost/api/admin/clients?page=1&limit=20"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("data");
    expect(body).toHaveProperty("total");
    expect(body).toHaveProperty("page");
  });

  it("filtra por búsqueda cuando se pasa search param", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-1" } },
      error: null,
    });
    mockSingle.mockResolvedValue({ data: { role: "admin" }, error: null });

    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: mockSingle,
    };

    chain.range.mockResolvedValue({
      data: [],
      count: 0,
      error: null,
    });

    mockFrom.mockImplementation((table?: string) => {
      if (table === "profiles") return chain;
      return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ count: 0, error: null }) }) };
    });

    const res = await GET(new Request("http://localhost/api/admin/clients?search=juan&page=1"));
    expect(res.status).toBe(200);
  });
});
