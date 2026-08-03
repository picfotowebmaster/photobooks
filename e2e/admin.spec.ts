import { test, expect } from "@playwright/test";

test.describe("Panel Admin", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("jesuslv2412@hotmail.com");
    await page.getByLabel("Contraseña").fill("jesuslv2412");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await page.waitForURL("/projects");
  });

  test("dashboard carga KPIs correctamente", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await page.waitForURL("/admin/dashboard");

    await expect(page.locator("h1")).toContainText("Dashboard");
    await expect(page.getByText("Total clientes")).toBeVisible();
    await expect(page.getByText("Activos")).toBeVisible();
    await expect(page.getByText("Ingresos totales")).toBeVisible();
    await expect(page.getByText("Órdenes pagadas")).toBeVisible();
    await expect(page.getByText("Proyectos")).toBeVisible();
  });

  test("lista de clientes con búsqueda", async ({ page }) => {
    await page.goto("/admin/clients");
    await page.waitForURL("/admin/clients");

    await expect(page.locator("h1")).toContainText("Clientes");
    await expect(page.getByPlaceholder("Buscar por nombre o email...")).toBeVisible();

    const searchInput = page.getByPlaceholder("Buscar por nombre o email...");
    await searchInput.fill("jesus");
  });

  test("filtro de clientes activos/baneados", async ({ page }) => {
    await page.goto("/admin/clients");
    await page.waitForURL("/admin/clients");

    const filterSelect = page.locator("select").first();
    await filterSelect.selectOption("active");
    await filterSelect.selectOption("banned");
    await filterSelect.selectOption("");
  });

  test("navegación a detalle de cliente", async ({ page }) => {
    await page.goto("/admin/clients");

    const verLink = page.getByText("Ver").first();
    if (await verLink.isVisible().catch(() => false)) {
      await verLink.click();
      await expect(page.getByText("Volver a clientes")).toBeVisible();
    }
  });

  test("órdenes admin cargan correctamente", async ({ page }) => {
    await page.goto("/admin/orders");
    await page.waitForURL("/admin/orders");

    await expect(page.locator("h1")).toContainText("Órdenes");
  });

  test("header admin tiene link 'Ir al sitio'", async ({ page }) => {
    await page.goto("/admin/dashboard");

    await expect(page.getByText("Ir al sitio")).toBeVisible();
    await expect(page.getByText("Admin Panel")).toBeVisible();
  });
});
