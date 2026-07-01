import { expect, test } from '@playwright/test';

test.describe('storefront smoke', () => {
  test('renders seeded storefront data and adds a product to cart', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'BARRIO', exact: true }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Discover Our Blends' })).toBeVisible();

    await page.goto('/products');
    await expect(page.getByRole('heading', { name: 'Barrio Blend - Medium Roast' })).toBeVisible();

    await page.goto('/products/barrio-blend-medium-roast');

    await expect(page.getByRole('heading', { name: 'Barrio Blend - Medium Roast' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add to cart' })).toBeEnabled();

    await page.getByRole('button', { name: 'Add to cart' }).click();

    await expect(page.getByRole('heading', { name: /My Cart/ })).toBeVisible();
    await expect(page.getByText('Barrio Blend - Medium Roast')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Checkout' })).toBeEnabled();
  });
});
