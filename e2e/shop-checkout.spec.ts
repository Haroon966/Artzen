import { test, expect } from "@playwright/test";

test.describe("Shop to checkout", () => {
  test("shop → product → add to cart → checkout form", async ({ page }) => {
    await page.goto("/shop");

    const productLink = page.getByRole("link", { name: /^View / }).first();
    await expect(productLink).toBeVisible({ timeout: 15_000 });
    await productLink.click();

    await expect(page).toHaveURL(/\/products\//, { timeout: 15_000 });

    // PDP buy box appears before “You may also like” cards (each has its own add control).
    await page
      .locator("main")
      .getByRole("button", { name: /add to cart/i })
      .first()
      .click();

    await page.goto("/checkout");

    await expect(
      page.getByRole("heading", { name: /delivery details/i })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /order summary/i })).toBeVisible();
    await expect(page.getByText(/^Total:/)).toBeVisible();
    await expect(page.getByLabel(/full name/i)).toBeVisible();
  });
});
