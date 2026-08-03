import { test, expect } from "@playwright/test";

test.describe("Sidebar", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("jesuslv2412@hotmail.com");
    await page.getByLabel("Contraseña").fill("jesuslv2412");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await page.waitForURL("/projects");
  });

  test("sidebar muestra todos los links de cliente", async ({ page }) => {
    await expect(page.locator("nav").getByText("Proyectos")).toBeVisible();
    await expect(page.locator("nav").getByText("Nuevo libro")).toBeVisible();
    await expect(page.locator("nav").getByText("Mi Perfil")).toBeVisible();
    await expect(page.locator("nav").getByText("Mis Órdenes")).toBeVisible();
  });

  test("admin ve link a Panel Admin en sidebar", async ({ page }) => {
    await expect(page.locator("nav").getByText("Panel Admin")).toBeVisible();
  });

  test("links del sidebar navegan correctamente", async ({ page }) => {
    await page.locator("nav").getByText("Mi Perfil").click();
    await page.waitForURL("/profile");
    await expect(page).toHaveURL("/profile");

    await page.locator("nav").getByText("Mis Órdenes").click();
    await page.waitForURL("/orders");
    await expect(page).toHaveURL("/orders");

    await page.locator("nav").getByText("Proyectos").click();
    await page.waitForURL("/projects");
    await expect(page).toHaveURL("/projects");
  });

  test("link activo tiene estilo destacado", async ({ page }) => {
    await page.goto("/profile");
    const activeLink = page.locator("nav").getByText("Mi Perfil");
    const className = await activeLink.evaluate((el) => el.className);
    expect(className).toContain("font-medium");
  });
});
