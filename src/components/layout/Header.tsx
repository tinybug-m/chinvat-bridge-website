import { BrandLockup } from "@/components/ui/BrandLockup";
import { Button } from "@/components/ui/Button";
import { MobileNav } from "@/components/layout/MobileNav";
import { NAV_LINKS } from "@/data/navigation";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-obsidian-950/90 backdrop-blur-xl border-b border-stone-border/80">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        <BrandLockup />
        <nav
          aria-label="Main navigation"
          className="hidden lg:flex items-center space-x-9 text-[11px] font-mono tracking-technical uppercase text-parchment-muted"
        >
          {NAV_LINKS.map((link) => (
            <a key={link.href} className="hover:text-gold-300 transition-colors" href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <Button href="#contact" icon="arrowForward" size="sm">
              Start a Conversation
            </Button>
          </div>
          <MobileNav links={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}
