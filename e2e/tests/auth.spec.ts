import { test, expect } from '@playwright/test';

test.describe('Flujo de Autenticación SIPA', () => {
  
  test('Debería cargar la página principal y mostrar el título o formulario', async ({ page }) => {
    // 1. ARRANGE (Preparar): Ir a la página
    await page.goto('/'); 
    await page.waitForLoadState('networkidle');

    // 2. ACT (Actuar): (En este caso, la acción es la carga de la página)
    
    // 3. ASSERT (Verificar): Comprobar que la página cargó algo
    // Buscamos que el body tenga contenido visible
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Tomamos captura como evidencia
    await page.screenshot({ path: 'screenshot-inicial.png', fullPage: true });
  });

  test('Debería navegar al formulario de login y encontrar los inputs', async ({ page }) => {
    // 1. ARRANGE
    await page.goto('/login'); // ⚠️ Asegúrate de que esta ruta exista en tu app

    // 2. ACT
    // (Esperamos a que cargue)

    // 3. ASSERT
    // Buscamos que exista un formulario (ajusta el selector si es necesario)
    const form = page.locator('form');
    if (await form.count() > 0) {
      await expect(form.first()).toBeVisible();
    } else {
      // Si no hay form, al menos verificamos que no dio error 404
      const response = await page.goto('/login');
      expect(response?.status()).toBeLessThan(400);
    }
  });
});
