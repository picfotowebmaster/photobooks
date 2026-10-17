import { describe, it, expect, vi, beforeEach } from "vitest";
import { chainable, mockSupabaseClient } from "@/test-helpers";

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

function request(body: unknown) {
  return new Request("http://localhost/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/admin/users", () => {
  let GET: any;
  let POST: any;
  let mockSrv: ReturnType<typeof mockSupabaseClient>;
  let mockAdmin: {
    auth: { admin: { createUser: any; deleteUser: any } };
    from: any;
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSrv = mockSupabaseClient();
    mockAdmin = {
      auth: {
        admin: {
          createUser: vi.fn().mockResolvedValue({
            data: { user: { id: "new-user" } },
            error: null,
          }),
          deleteUser: vi.fn().mockResolvedValue({ error: null }),
        },
      },
      from: vi.fn(),
    };

    const { createServerSupabase } = await import("@/lib/supabase/server");
    (createServerSupabase as any).mockReturnValue(mockSrv);

    const { createAdminClient } = await import("@/lib/supabase/admin");
    (createAdminClient as any).mockReturnValue(mockAdmin);

    const mod = await import("@/app/api/admin/users/route");
    GET = mod.GET;
    POST = mod.POST;
  });

  it("devuelve 401 sin sesión", async () => {
    const res = await POST(request({}));
    expect(res.status).toBe(401);
  });

  it("permite que un admin cree una cuenta de cliente", async () => {
    mockSrv.auth.getUser.mockResolvedValue({
      data: { user: { id: "admin-1" } },
      error: null,
    });
    mockSrv.from.mockReturnValue(chainable({ data: { role: "admin" }, error: null }));

    const profile = {
      id: "new-user",
      email: "nuevo@test.com",
      full_name: "Nuevo Cliente",
      role: "client",
    };
    const upsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: profile, error: null }),
      }),
    });
    mockAdmin.from.mockReturnValue({ upsert });

    const res = await POST(
      request({
        email: "nuevo@test.com",
        password: "password123",
        full_name: "Nuevo Cliente",
        role: "client",
      })
    );

    expect(res.status).toBe(201);
    expect(mockAdmin.auth.admin.createUser).toHaveBeenCalled();
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: "new-user", role: "client", is_active: true })
    );
  });

  it("rechaza el rol superadmin desde el formulario", async () => {
    mockSrv.auth.getUser.mockResolvedValue({
      data: { user: { id: "super-1" } },
      error: null,
    });
    mockSrv.from.mockReturnValue(chainable({ data: { role: "superadmin" }, error: null }));

    const res = await POST(
      request({ email: "nuevo@test.com", password: "password123", role: "superadmin" })
    );
    expect(res.status).toBe(400);
    expect(mockAdmin.auth.admin.createUser).not.toHaveBeenCalled();
  });

  it("crea una cuenta de administrador y actualiza el perfil", async () => {
    mockSrv.auth.getUser.mockResolvedValue({
      data: { user: { id: "super-1" } },
      error: null,
    });
    mockSrv.from.mockReturnValue(chainable({ data: { role: "superadmin" }, error: null }));

    const profile = {
      id: "new-user",
      email: "nuevo@test.com",
      full_name: "Nuevo Admin",
      role: "admin",
    };
    const upsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: profile, error: null }),
      }),
    });
    mockAdmin.from.mockReturnValue({ upsert });

    const res = await POST(
      request({
        email: "Nuevo@Test.com",
        password: "password123",
        full_name: "Nuevo Admin",
        role: "admin",
      })
    );

    expect(res.status).toBe(201);
    expect(mockAdmin.auth.admin.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "nuevo@test.com",
        password: "password123",
        email_confirm: true,
      })
    );
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: "new-user", role: "admin", is_active: true })
    );
  });

  it("lista usuarios para admin", async () => {
    mockSrv.auth.getUser.mockResolvedValue({
      data: { user: { id: "admin-1" } },
      error: null,
    });
    mockSrv.from.mockReturnValue(chainable({ data: { role: "admin" }, error: null }));
    mockAdmin.from.mockReturnValue(
      chainable({ data: [{ id: "u1", role: "client" }], count: 1, error: null })
    );

    const res = await GET(new Request("http://localhost/api/admin/users"));
    expect(res.status).toBe(200);
  });

  it("lista usuarios para superadmin", async () => {
    mockSrv.auth.getUser.mockResolvedValue({
      data: { user: { id: "super-1" } },
      error: null,
    });
    mockSrv.from.mockReturnValue(chainable({ data: { role: "superadmin" }, error: null }));
    mockAdmin.from.mockReturnValue(
      chainable({ data: [{ id: "u1", role: "client" }], count: 1, error: null })
    );

    const res = await GET(new Request("http://localhost/api/admin/users"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.total).toBe(1);
    expect(body.data).toHaveLength(1);
  });
});
