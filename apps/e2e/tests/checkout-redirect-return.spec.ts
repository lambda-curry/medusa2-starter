import { expect, type Page, test } from '@playwright/test';

// Redirect-based payment methods (Amazon Pay, Klarna, etc.) send the customer back to
// /checkout/success with a payment intent instead of an order id. A paid return needs a
// real Stripe account, but these returns don't.

const addToCart = async (page: Page) => {
  await page.goto('/products/barrio-blend-medium-roast');
  // The cart drawer opens before the item is saved, so wait for the cart cookie's response.
  const added = page.waitForResponse((r) => r.url().includes('/api/cart/line-items/create') && r.ok());
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await added;
};

const cartCookie = async (page: Page) =>
  (await page.context().cookies()).find((cookie) => cookie.name === '_medusa_cart_id');

test.describe('checkout redirect return', () => {
  test('without a cart, goes home', async ({ page }) => {
    await page.goto('/checkout/success?payment_intent=pi_e2e&redirect_status=succeeded');

    await expect(page).toHaveURL(/\/$/);
  });

  test('a failed payment returns to checkout and keeps the cart', async ({ page }) => {
    await addToCart(page);

    await page.goto('/checkout/success?payment_intent=pi_e2e&redirect_status=failed');

    await expect(page).toHaveURL(/\/checkout$/);
    expect(await cartCookie(page)).toBeDefined();
  });

  test('an unpaid cart is not completed', async ({ page }) => {
    await addToCart(page);

    // A forged "pending" return on a cart that was never paid can't complete it. (This cart has
    // no payment session; a paid return needs a real Stripe account.)
    await page.goto('/checkout/success?payment_intent=pi_e2e&redirect_status=pending');

    await expect(page).toHaveURL(/\/checkout$/);
    expect(await cartCookie(page)).toBeDefined();
  });
});
