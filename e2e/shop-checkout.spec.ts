import { test, expect } from "@playwright/test";

test.describe.configure({ timeout: 60_000 });

async function firstProductCardLink(page: import("@playwright/test").Page) {
  const grid = page.locator(".products-grid-showcase");
  await expect(grid).toBeVisible({ timeout: 30_000 });
  return grid.locator("a[href*='/products/']").first();
}

async function addFirstProductToCart(page: import("@playwright/test").Page) {
  await page.goto("/shop/", { waitUntil: "load" });
  const productLink = await firstProductCardLink(page);
  await productLink.click();
  await expect(page).toHaveURL(/\/products\//, { timeout: 15_000 });
  await page
    .locator("main")
    .getByRole("button", { name: /add to cart/i })
    .first()
    .click();
}

test.describe("Shop to cart order", () => {
  test("shop → product → add to cart → cart shows checkout CTA", async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto("/cart/", { waitUntil: "load" });

    await expect(page.getByText(/order summary/i)).toBeVisible();
    await expect(page.getByText(/estimated total/i)).toBeVisible();
    await expect(page.getByText(/shopify checkout/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /proceed to checkout/i })
    ).toBeVisible();
  });

  test("checkout without Shopify config shows configuration error", async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto("/cart/", { waitUntil: "load" });

    await page.getByRole("button", { name: /proceed to checkout/i }).click();
    await expect(page.locator("main").getByRole("alert")).toContainText(
      /shopify checkout is not configured/i
    );
  });

  test("cart with empty cart shows message", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      try {
        localStorage.removeItem("artzen-cart");
        localStorage.removeItem("artzen-shopify-cart-id");
      } catch {
        /* ignore */
      }
    });
    await page.goto("/cart/", { waitUntil: "load" });
    await expect(page.getByRole("link", { name: /discover the shop/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/nothing here yet/i)).toBeVisible();
  });

  test("collection page links to a product", async ({ page }) => {
    await page.goto("/collections/wall-decoration/", { waitUntil: "load" });
    const pdpLink = page.locator("main article.product-card a[href*='/products/']").first();
    await expect(pdpLink).toBeVisible({ timeout: 30_000 });
    await pdpLink.click();
    await expect(page).toHaveURL(/\/products\//, { timeout: 15_000 });
  });

  test("COD page loads", async ({ page }) => {
    await page.goto("/cod/", { waitUntil: "load" });
    await expect(page.locator("h1")).toContainText("Cash on Delivery");
  });
});
