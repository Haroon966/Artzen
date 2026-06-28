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

function stubWindowOpen(page: import("@playwright/test").Page) {
  return page.addInitScript(() => {
    window.open = (url) => {
      (window as unknown as { __lastWaUrl?: string }).__lastWaUrl = String(url);
      return null;
    };
  });
}

async function fillDeliveryDetails(
  page: import("@playwright/test").Page,
  options: {
    name: string;
    phone: string;
    city: string;
    address: string;
  }
) {
  await page.getByLabel(/full name/i).fill(options.name);
  await page.getByLabel(/^phone/i).fill(options.phone);
  await page.getByLabel(/city/i).fill(options.city);
  await page.getByLabel(/full address/i).fill(options.address);
}

test.describe("Shop to cart order", () => {
  test("shop → product → add to cart → cart shows delivery form", async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto("/cart/", { waitUntil: "load" });

    await expect(page.getByText(/delivery details/i)).toBeVisible();
    await expect(page.getByText(/order summary/i)).toBeVisible();
    await expect(page.getByText(/estimated total/i)).toBeVisible();
    await expect(page.getByLabel(/full name/i)).toBeVisible();
  });

  test("shop → add to cart → cart WhatsApp includes customer details", async ({ page }) => {
    await stubWindowOpen(page);
    await addFirstProductToCart(page);
    await page.goto("/cart/", { waitUntil: "load" });

    const whatsAppButton = page
      .locator("main")
      .getByRole("button", { name: "Order on WhatsApp", exact: true });
    await expect(whatsAppButton).toBeVisible();

    await fillDeliveryDetails(page, {
      name: "Cart Test User",
      phone: "03001234567",
      city: "Lahore",
      address: "House 1, Street 2, Area 3, Lahore",
    });
    await whatsAppButton.click();

    const href = await page.evaluate(
      () => (window as unknown as { __lastWaUrl?: string }).__lastWaUrl
    );
    expect(href).toMatch(/wa\.me/);
    expect(href).toMatch(/Total%3A/);
    expect(href).toMatch(/Cart%20Test%20User/);
    expect(href).toMatch(/03001234567/);
  });

  test("cart with empty cart shows message", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      try {
        localStorage.removeItem("artzen-cart");
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

  test("cart validates phone before WhatsApp", async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto("/cart/", { waitUntil: "load" });

    await fillDeliveryDetails(page, {
      name: "Playwright Test User",
      phone: "123",
      city: "Lahore",
      address: "House 1, Street 2, Area 3, Lahore",
    });
    await page.getByRole("button", { name: "Order on WhatsApp", exact: true }).click();

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

test.describe("Cart WhatsApp order", () => {
  test("full submit opens WhatsApp with order details", async ({ page }) => {
    await stubWindowOpen(page);
    await addFirstProductToCart(page);
    await page.goto("/cart/", { waitUntil: "load" });

    await fillDeliveryDetails(page, {
      name: "E2E Success User",
      phone: "03001234567",
      city: "Karachi",
      address: "House 10, Street 5, Block 3, Karachi — full address line.",
    });

    await page.getByRole("button", { name: "Order on WhatsApp", exact: true }).click();

    const href = await page.evaluate(
      () => (window as unknown as { __lastWaUrl?: string }).__lastWaUrl
    );
    expect(href).toMatch(/wa\.me/);
    expect(href).toMatch(/E2E%20Success%20User/);
    expect(href).toMatch(/AZ-\d{4}\d{2}\d{2}-[A-Z0-9]+/);
  });
});
