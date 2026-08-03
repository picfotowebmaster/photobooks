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

describe("GET /api/invoices", () => {
  let GET: any;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    const mod = await import("@/app/api/invoices/route");
    GET = mod.GET;
  });

  it("devuelve 401 sin sesión", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("devuelve órdenes pagadas del usuario", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    };
    chain.order.mockResolvedValue({
      data: [
        {
          id: "order-1",
          project_id: "proj-1",
          total_amount: 979,
          payment_status: "paid",
          invoice_number: "INV-2025-0001",
          total_pages: 24,
          created_at: "2025-06-01",
          paid_at: "2025-06-02",
          projects: { title: "Fotolibro Familiar", format: "20x20", cover_type: "hard" },
        },
      ],
      error: null,
    });

    mockFrom.mockReturnValue(chain);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].payment_status).toBe("paid");
  });

  it("devuelve array vacío si no hay órdenes pagadas", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    };
    chain.order.mockResolvedValue({ data: [], error: null });

    mockFrom.mockReturnValue(chain);
    const res = await GET();
    const body = await res.json();
    expect(body.data).toEqual([]);
  });
});
