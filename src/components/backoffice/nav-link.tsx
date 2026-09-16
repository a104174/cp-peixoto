"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BackofficeIcon, type BackofficeIconName } from "./backoffice-icon";

type NavLinkProps = {
  href: string;
  icon: BackofficeIconName;
  children: React.ReactNode;
};

export function BackofficeNavLink({ href, icon, children }: NavLinkProps) {
  const pathname = usePathname();
  const active =
    href === "/backoffice"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link aria-current={active ? "page" : undefined} className={`bo-nav-link${active ? " is-active" : ""}`} href={href}>
      <span className="bo-nav-icon"><BackofficeIcon name={icon} /></span>
      <span>{children}</span>
      <span className="bo-nav-indicator" />
    </Link>
  );
}
