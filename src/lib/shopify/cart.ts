import { storefrontFetch } from "./config";

export type ShopifyCartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: {
      handle: string;
      title: string;
      featuredImage?: { url: string } | null;
    };
    price: { amount: string; currencyCode: string };
    image?: { url: string } | null;
  };
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    totalAmount: { amount: string; currencyCode: string };
  };
  lines: {
    nodes: ShopifyCartLine[];
  };
};

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      totalAmount { amount currencyCode }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            product {
              handle
              title
              featuredImage { url }
            }
            price { amount currencyCode }
            image { url }
          }
        }
      }
    }
  }
`;

const CART_CREATE = `
  ${CART_FRAGMENT}
  mutation cartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
`;

const CART_LINES_ADD = `
  ${CART_FRAGMENT}
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
`;

const CART_LINES_UPDATE = `
  ${CART_FRAGMENT}
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
`;

const CART_LINES_REMOVE = `
  ${CART_FRAGMENT}
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
`;

const CART_QUERY = `
  ${CART_FRAGMENT}
  query getCart($cartId: ID!) {
    cart(id: $cartId) { ...CartFields }
  }
`;

type UserErrors = Array<{ field?: string[] | null; message: string }>;

function assertNoUserErrors(userErrors: UserErrors | undefined, action: string) {
  if (userErrors?.length) {
    throw new Error(
      `${action}: ${userErrors.map((e) => e.message).join("; ")}`
    );
  }
}

export async function createCart(
  lines: Array<{ merchandiseId: string; quantity: number }>
): Promise<ShopifyCart> {
  const data = await storefrontFetch<{
    cartCreate: { cart: ShopifyCart | null; userErrors: UserErrors };
  }>(CART_CREATE, { lines });
  assertNoUserErrors(data.cartCreate.userErrors, "cartCreate");
  if (!data.cartCreate.cart) throw new Error("cartCreate returned no cart");
  return data.cartCreate.cart;
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const data = await storefrontFetch<{ cart: ShopifyCart | null }>(CART_QUERY, {
    cartId,
  });
  return data.cart;
}

export async function addCartLines(
  cartId: string,
  lines: Array<{ merchandiseId: string; quantity: number }>
): Promise<ShopifyCart> {
  const data = await storefrontFetch<{
    cartLinesAdd: { cart: ShopifyCart | null; userErrors: UserErrors };
  }>(CART_LINES_ADD, { cartId, lines });
  assertNoUserErrors(data.cartLinesAdd.userErrors, "cartLinesAdd");
  if (!data.cartLinesAdd.cart) throw new Error("cartLinesAdd returned no cart");
  return data.cartLinesAdd.cart;
}

export async function updateCartLines(
  cartId: string,
  lines: Array<{ id: string; quantity: number }>
): Promise<ShopifyCart> {
  const data = await storefrontFetch<{
    cartLinesUpdate: { cart: ShopifyCart | null; userErrors: UserErrors };
  }>(CART_LINES_UPDATE, { cartId, lines });
  assertNoUserErrors(data.cartLinesUpdate.userErrors, "cartLinesUpdate");
  if (!data.cartLinesUpdate.cart) {
    throw new Error("cartLinesUpdate returned no cart");
  }
  return data.cartLinesUpdate.cart;
}

export async function removeCartLines(
  cartId: string,
  lineIds: string[]
): Promise<ShopifyCart> {
  const data = await storefrontFetch<{
    cartLinesRemove: { cart: ShopifyCart | null; userErrors: UserErrors };
  }>(CART_LINES_REMOVE, { cartId, lineIds });
  assertNoUserErrors(data.cartLinesRemove.userErrors, "cartLinesRemove");
  if (!data.cartLinesRemove.cart) {
    throw new Error("cartLinesRemove returned no cart");
  }
  return data.cartLinesRemove.cart;
}

export function mapShopifyCartToItems(
  cart: ShopifyCart
): Array<{
  id: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  merchandiseId: string;
  lineId: string;
}> {
  return cart.lines.nodes.map((line) => {
    const v = line.merchandise;
    const sizeLabel =
      v.title && v.title !== "Default Title" ? ` — ${v.title}` : "";
    return {
      id: line.id,
      lineId: line.id,
      merchandiseId: v.id,
      slug: v.product.handle,
      name: `${v.product.title}${sizeLabel}`,
      price: Math.round(parseFloat(v.price.amount)),
      quantity: line.quantity,
      image: v.image?.url ?? v.product.featuredImage?.url ?? undefined,
    };
  });
}
