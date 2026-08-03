import { test, expect } from "@playwright/test";

test.describe("Autenticación", () => {
  test("flujo login → projects → logout", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email")).toBeVisible();

    await page.getByLabel("Email").fill("jesuslv2412@hotmail.com");
    await page.getByLabel("Contraseña").fill("jesuslv2412");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    await page.waitForURL("/projects");
    await expect(page).toHaveURL("/projects");
    await expect(page.locator("nav").getByText("Proyectos")).toBeVisible();
    await expect(page.locator("nav").getByText("Mi Perfil")).toBeVisible();

    await page.getByText("Cerrar sesión").click();
    await page.waitForURL("/");
    await expect(page.getByRole("link", { name: "Iniciar sesión" })).toBeVisible();
  });

  test("admin ve link al panel admin en sidebar", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("jesuslv2412@hotmail.com");
    await page.getByLabel("Contraseña").fill("jesuslv2412");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await page.waitForURL("/projects");

    await expect(page.locator("nav").getByText("Panel Admin")).toBeVisible();
    await page.locator("nav").getByText("Panel Admin").click();
    await page.waitForURL("/admin/dashboard");
    await expect(page.getByText("Dashboard")).toBeVisible();
  });
});
