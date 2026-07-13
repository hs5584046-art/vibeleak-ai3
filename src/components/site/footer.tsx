import { Logo } from "@/components/ui/logo";
import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>{siteConfig.tagline}</p>
          <small>Self-reflection, not diagnosis or guaranteed prediction.</small>
        </div>

        <FooterColumn title="Product" items={siteConfig.footer.product} />
        <FooterColumn title="Company" items={siteConfig.footer.company} />
        <FooterColumn title="Legal" items={siteConfig.footer.legal} />
      </div>

      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} VibeLytix.</span>
        <span>Designed for clarity, privacy and thoughtful decisions.</span>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items
}: {
  title: string;
  items: readonly { label: string; href: string }[];
}) {
  return (
    <div className="footer-column">
      <h2>{title}</h2>
      {items.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}
    </div>
  );
}
