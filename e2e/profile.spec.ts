import { test, expect } from "@playwright/test";

test.describe("Mi Perfil", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("jesuslv2412@hotmail.com");
    await page.getByLabel("Contraseña").fill("jesuslv2412");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await page.waitForURL("/projects");
  });

  test("navegación por los 4 tabs del perfil", async ({ page }) => {
    await page.goto("/profile");
    await page.waitForURL("/profile");

    await expect(page.getByText("Datos personales")).toBeVisible();
    await expect(page.getByText("Direcciones")).toBeVisible();
    await expect(page.getByText("Facturación")).toBeVisible();
    await expect(page.getByText("Pagos")).toBeVisible();

    await page.getByText("Direcciones").click();
    await expect(page.getByText("Mis direcciones")).toBeVisible();

    await page.getByText("Facturación").click();
    await expect(page.getByText("Datos de facturación")).toBeVisible();

    await page.getByText("Pagos").click();
    await expect(page.getByText("Historial de pagos")).toBeVisible();

    await page.getByText("Datos personales").click();
    await expect(page.getByText("Editar perfil")).toBeVisible();
  });

  test("crear y eliminar dirección", async ({ page }) => {
    await page.goto("/profile");
    await page.getByText("Direcciones").click();

    await page.getByText("Agregar").click();
    await expect(page.getByText("Nueva dirección")).toBeVisible();

    await page.getByPlaceholder("Calle").fill("Calle de Prueba 123");
    await page.getByPlaceholder("Número exterior").fill("10");
    await page.getByPlaceholder("Número interior").fill("A");
    await page.getByPlaceholder("Colonia").fill("Centro");
    await page.getByPlaceholder("Ciudad").fill("Guadalajara");
    await page.getByPlaceholder("Estado").fill("Jalisco");
    await page.getByPlaceholder("Código Postal").fill("44100");

    await page.getByText("Guardar").last().click();
    await expect(page.getByText(/Calle de Prueba 123/)).toBeVisible();

    const deleteBtn = page.getByText("Eliminar").first();
    await deleteBtn.click();
    await expect(page.getByText(/Calle de Prueba 123/)).not.toBeVisible();
  });

  test("guardar datos de facturación", async ({ page }) => {
    await page.goto("/profile");
    await page.getByText("Facturación").click();

    await page.getByPlaceholder("XXXX000000XXX").fill("TEST850101XXX");
    await page.getByPlaceholder("Nombre o razón social").fill("Juan Pérez Test");

    await page.getByText("Guardar datos").click();
    await expect(page.getByText("Datos de facturación guardados.")).toBeVisible();
  });

  test("ver historial de pagos", async ({ page }) => {
    await page.goto("/profile");
    await page.getByText("Pagos").click();

    await expect(page.getByText("Total de órdenes")).toBeVisible();
    await expect(page.getByText("Total gastado")).toBeVisible();
    await expect(page.getByText("Pendientes")).toBeVisible();
  });
});
