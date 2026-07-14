import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

type Props = {
  href: Route | `#${string}` | `mailto:${string}`;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

export function ButtonLink({ href, children, variant = "primary", className = "" }: Props) {
  const classes = `button button-${variant} ${className}`.trim();

  if (href.startsWith("#") || href.startsWith("mailto:")) {
    return <a href={href} className={classes}>{children}</a>;
  }

  return <Link href={href as Route} className={classes}>{children}</Link>;
}
