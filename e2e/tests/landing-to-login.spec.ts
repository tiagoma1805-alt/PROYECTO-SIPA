import { test, expect } from '@playwright/test';

test.describe('Flujo Landing → Login', () => {
  test('should navigate from landing to login and show the form', async ({ page }) => {
    // Arrange
    await page.goto('/');

    // Act
    await page.getByRole('link', { name: /Iniciar sesión/i }).first().click();

    // Assert
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /Iniciar sesión/i })).toBeVisible();
    await expect(page.getByPlaceholder('ejemplo@correo.sena.edu.co')).toBeVisible();
    await expect(page.getByPlaceholder('Ingresa tu contraseña')).toBeVisible();
    await expect(page.locator('button.btn-login-submit')).toBeVisible();
  });
});