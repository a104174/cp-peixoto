"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
};

export function BackofficeNavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const active =
    href === "/backoffice"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link className={`bo-nav-link${active ? " is-active" : ""}`} href={href}>
      {children}
    </Link>
  );
}

