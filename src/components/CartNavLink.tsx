"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { CartCount } from "@/components/CartCount";

export function CartNavIcon({
  className,
  width = 18,
  height = 18,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
      <path d="M16 10a4 4 0 0 1-8 0" strokeLinecap="round" />
    </svg>
  );
}

type CartNavLinkProps = {
  className?: string;
  iconClassName?: string;
  badgeClassName?: string;
  iconSize?: number;
  children?: React.ReactNode;
};

export function CartNavLink({
  className = "",
  iconClassName,
  badgeClassName = "absolute -right-1 -top-1",
  iconSize,
  children,
}: CartNavLinkProps) {
  const { totalItems } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasItems = mounted && totalItems > 0;

  return (
    <Link
      href="/cart"
      className={`relative ${className}${hasItems ? " cart-nav-link--has-items" : ""}`}
      aria-label={hasItems ? `Cart, ${totalItems} item${totalItems === 1 ? "" : "s"}` : "Cart"}
    >
      <CartNavIcon className={iconClassName} width={iconSize} height={iconSize} />
      <span className={badgeClassName}>
        <CartCount />
      </span>
      {children}
    </Link>
  );
}
