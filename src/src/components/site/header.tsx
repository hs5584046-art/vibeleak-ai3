import { ButtonLink } from "@/components/ui/button-link";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { Logo } from "@/components/ui/logo";
import { MobileMenu } from "@/components/site/mobile-menu";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { siteConfig } from "@/lib/site";

export function Header() {
  return (
    <header className="site-header shell">
      <Logo />
      <nav className="desktop-navigation" aria-label="Primary navigation">
        {siteConfig.navigation.map((item) => (
          <a href={item.href} key={item.href}>{item.label}</a>
        ))}
      </nav>
      <div className="header-actions">
        <ThemeToggle />
        <ButtonLink href="/dashboard" variant="ghost" className="header-cta">
          My reports
        </ButtonLink>
        <ButtonLink href="#personality-dna" variant="secondary" className="header-cta">
          Start free <ArrowUpRightIcon />
        </ButtonLink>
        <MobileMenu />
      </div>
    </header>
  );
}
