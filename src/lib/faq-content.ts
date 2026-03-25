/** Homepage FAQ — visible copy must match FAQPage JSON-LD exactly. */
export const homeFaqItems: { question: string; answer: string }[] = [
  {
    question: "Do you offer Cash on Delivery across Pakistan?",
    answer:
      "Yes. Artzen offers Cash on Delivery nationwide so you can pay when your order arrives.",
  },
  {
    question: "What can I buy at Artzen?",
    answer:
      "Shop home decor, wall art, Islamic calligraphy, personalized gifts, keychains, and more — all packed with care for delivery across Pakistan.",
  },
  {
    question: "How long does delivery usually take?",
    answer:
      "Delivery typically takes a few business days depending on your city. We share updates once your order ships.",
  },
  {
    question: "How can I get help with my order?",
    answer:
      "Message us on WhatsApp or use the Contact page — we reply as quickly as we can.",
  },
];

/** COD page FAQ — must match on-page copy. */
export const codFaqItems: { question: string; answer: string }[] = [
  {
    question: "Do you offer Cash on Delivery across Pakistan?",
    answer:
      "We offer Cash on Delivery (COD) across Pakistan. Place your order, and pay when your package arrives.",
  },
  {
    question: "How does Cash on Delivery work at Artzen?",
    answer:
      "Add items to your cart and proceed to checkout. Enter your name, phone number, and delivery address. We confirm and ship your order, and you pay the delivery person in cash when you receive it.",
  },
  {
    question: "Which areas do you deliver to?",
    answer:
      "We deliver to all major cities in Pakistan. Delivery times may vary by location. You will receive an update once your order is shipped.",
  },
  {
    question: "How do I contact Artzen?",
    answer: "Questions? Contact us via WhatsApp or the Contact page.",
  },
];

export function faqPageJsonLd(
  items: { question: string; answer: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
