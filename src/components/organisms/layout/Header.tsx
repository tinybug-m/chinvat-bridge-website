import Link from "next/link";
import { BrandLockup } from "@/components/molecules/BrandLockup";
import { Button } from "@/components/atoms/Button";
import { Container } from "@/components/atoms/Container";
import { MobileNav } from "@/components/organisms/layout/MobileNav";
import { NAV_LINKS } from "@/data/navigation";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-obsidian-950/90 backdrop-blur-xl border-b border-stone-border/80">
      <Container className="h-20 flex items-center justify-between">
        <BrandLockup />
        <nav
          aria-label="Main navigation"
          className="hidden lg:flex items-center space-x-9 text-[11px] font-mono tracking-technical uppercase text-parchment-muted"
        >
          {NAV_LINKS.map((link) => (
            <Link key={link.href} className="hover:text-gold-300 transition-colors" href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <Button href="/#contact" icon="arrowForward" size="sm">
              Start a Conversation
            </Button>
          </div>
          <MobileNav links={NAV_LINKS} />
        </div>
      </Container>
    </header>
  );
}
