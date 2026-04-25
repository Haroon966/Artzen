import { test, expect, devices } from "@playwright/test";

test.describe.configure({ timeout: 60_000 });

test.use({ ...devices["Pixel 5"] });

async function firstProductCardLink(page: import("@playwright/test").Page) {
  const grid = page.locator(".products-grid-showcase");
  await expect(grid).toBeVisible({ timeout: 30_000 });
  return grid.locator("a[href*='/products/']").first();
}

test("mobile: shop → PDP → add to cart → checkout (COD link visible)", async ({ page }) => {
  await page.goto("/shop/", { waitUntil: "load" });

  const productLink = await firstProductCardLink(page);
  await expect(productLink).toBeVisible();
  await productLink.click();

  await expect(page).toHaveURL(/\/products\//, { timeout: 15_000 });

  await page
    .locator("main")
    .getByRole("button", { name: /add to cart/i })
    .first()
    .click();

  await page.goto("/checkout/", { waitUntil: "load" });

  await expect(page.getByRole("heading", { name: /delivery details/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /how cod works/i })).toBeVisible();
});
