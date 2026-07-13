"use client";

import { useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { siteConfig } from "@/lib/site";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mobile-menu">
      <button
        type="button"
        className="icon-button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open ? (
        <nav className="mobile-menu-panel" aria-label="Mobile navigation">
          {siteConfig.navigation.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
