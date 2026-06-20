import { test, expect } from "@playwright/test";

test.describe.configure({ timeout: 60_000 });

async function firstProductCardLink(page: import("@playwright/test").Page) {
  const grid = page.locator(".products-grid-showcase");
  await expect(grid).toBeVisible({ timeout: 30_000 });
  return grid.locator("a[href*='/products/']").first();
}

test.describe("Shop to checkout", () => {
  test("shop → product → add to cart → checkout form", async ({ page }) => {
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

    await expect(
      page.getByRole("heading", { name: /delivery details/i })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /order summary/i })).toBeVisible();
    await expect(page.getByText(/^Total:/)).toBeVisible();
    await expect(page.getByLabel(/full name/i)).toBeVisible();
  });

  test("shop → add to cart → cart WhatsApp link includes order total", async ({ page }) => {
    await page.goto("/shop/", { waitUntil: "load" });

    const productLink = await firstProductCardLink(page);
    await productLink.click();
    await expect(page).toHaveURL(/\/products\//, { timeout: 15_000 });

    await page
      .locator("main")
      .getByRole("button", { name: /add to cart/i })
      .first()
      .click();

    await page.goto("/cart/", { waitUntil: "load" });

    const whatsAppLink = page
      .locator("main")
      .getByRole("link", { name: "Order on WhatsApp", exact: true });
    await expect(whatsAppLink).toBeVisible();
    await expect(whatsAppLink).toHaveAttribute("href", /wa\.me/);

    const href = await whatsAppLink.getAttribute("href");
    expect(href).toMatch(/Total%3A/);
  });

  test("checkout with empty cart shows message", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      try {
        localStorage.removeItem("artzen-cart");
      } catch {
        /* ignore */
      }
    });
    await page.goto("/checkout/", { waitUntil: "load" });
    await expect(page.getByRole("link", { name: /continue shopping/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/cart is empty/i)).toBeVisible();
  });

  test("checkout validates phone", async ({ page }) => {
    await page.goto("/shop/", { waitUntil: "load" });

    const productLink = await firstProductCardLink(page);
    await productLink.click();
    await expect(page).toHaveURL(/\/products\//, { timeout: 15_000 });

    await page
      .locator("main")
      .getByRole("button", { name: /add to cart/i })
      .first()
      .click();

    await page.goto("/checkout/", { waitUntil: "load" });

    await page.getByLabel(/full name/i).fill("Playwright Test User");
    await page.getByLabel(/^phone/i).fill("123");
    await page.getByLabel(/city/i).fill("Lahore");
    await page.getByLabel(/full address/i).fill("House 1, Street 2, Area 3, Lahore");
    await page.getByRole("button", { name: /confirm order on whatsapp/i }).click();

    await expect(page.locator("#phone-error")).toContainText(/valid mobile number/i);
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

test.describe("Checkout success (Formspree stubbed)", () => {
  test("full submit shows order received", async ({ page }) => {
    await page.addInitScript(() => {
      window.open = () => null;
    });

    await page.route("**/*formspree.io/**", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ next: "https://formspree.io/thanks" }),
      });
    });

    await page.goto("/shop/", { waitUntil: "load" });
    const productLink = await firstProductCardLink(page);
    await productLink.click();
    await expect(page).toHaveURL(/\/products\//, { timeout: 15_000 });

    await page
      .locator("main")
      .getByRole("button", { name: /add to cart/i })
      .first()
      .click();

    await page.goto("/checkout/", { waitUntil: "load" });

    await page.getByLabel(/full name/i).fill("E2E Success User");
    await page.getByLabel(/^phone/i).fill("03001234567");
    await page.getByLabel(/city/i).fill("Karachi");
    await page
      .getByLabel(/full address/i)
      .fill("House 10, Street 5, Block 3, Karachi — full address line.");

    await page.getByRole("button", { name: /confirm order on whatsapp/i }).click();

    await expect(page.getByRole("heading", { name: /order received/i })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.locator("p.font-mono").getByText(/^AZ-\d{4}\d{2}\d{2}-[A-Z0-9]+$/)).toBeVisible();
    await expect(
      page.getByRole("status").getByRole("link", { name: /cash on delivery/i })
    ).toBeVisible();
  });
});
