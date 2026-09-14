import Link from "next/link";
import { BrandLockup } from "@/components/molecules/BrandLockup";
import { BulletRow } from "@/components/molecules/BulletRow";
import { Container } from "@/components/atoms/Container";
import { EmailLink } from "@/components/atoms/EmailLink";
import { toRomanNumeral } from "@/lib/roman-numeral";
import { DISCIPLINE_LINKS, SECTION_NAV_LINKS, type FooterLink } from "@/data/footer";

const FOOTER_NAV_ITEMS: FooterLink[] = [...SECTION_NAV_LINKS, { label: "Contact", href: "/#contact" }];

export function Footer() {
  const copyrightYear = toRomanNumeral(new Date().getFullYear());

  return (
    <footer className="bg-obsidian-950 border-t border-stone-border text-parchment-muted">
      <Container className="py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-stone-border">
          <div className="md:col-span-5 space-y-4">
            <BrandLockup size="sm" />
            <p className="font-serif-monument text-sm text-parchment-muted max-w-sm leading-relaxed">
              Chinvat Bridge is a UK-based technology consultancy helping businesses use AI, automation,
              software and SEO to work better and grow.
            </p>
          </div>
          <div className="md:col-span-4 space-y-2.5 font-mono text-[11px] tracking-technical">
            <span className="text-gold-400 uppercase block font-semibold">Disciplines</span>
            <div className="grid grid-cols-2 gap-2 text-parchment-dim">
              {DISCIPLINE_LINKS.map((link) => (
                <Link key={link.label} className="hover:text-gold-300 transition-colors" href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="md:col-span-3 space-y-2 font-mono text-[11px] tracking-technical">
            <span className="text-gold-400 uppercase block font-semibold">Chinvat Bridge</span>
            <p className="text-parchment-dim text-xs leading-relaxed">
              UK Based &bull; Working Globally
              <br />
              <EmailLink variant="underline" />
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              <Link
                className="inline-block px-2.5 py-0.5 bg-obsidian-900 border border-gold-500/40 text-[9px] text-gold-300 hover:text-gold-400 transition-colors"
                href="/#contact"
              >
                Start a Conversation
              </Link>
              <Link
                className="inline-block px-2.5 py-0.5 bg-obsidian-900 border border-stone-borderLight text-[9px] text-parchment-dim hover:text-gold-300 transition-colors"
                href="/login"
              >
                Client Sign In
              </Link>
            </div>
          </div>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono tracking-technical text-parchment-dim gap-4">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span>&copy; {copyrightYear} Chinvat Bridge Ltd. All rights reserved.</span>
            <Link href="/privacy" className="hover:text-gold-300 transition-colors underline underline-offset-2">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gold-300 transition-colors underline underline-offset-2">
              Terms of Service
            </Link>
          </div>
          <BulletRow
            gap="wrap"
            bulletColor="subtle"
            className="justify-center"
            items={FOOTER_NAV_ITEMS}
            renderItem={(link, index) => (
              <Link
                className={
                  index === FOOTER_NAV_ITEMS.length - 1
                    ? "text-gold-400 hover:underline"
                    : "hover:text-gold-300 transition-colors"
                }
                href={link.href}
              >
                {link.label}
              </Link>
            )}
          />
        </div>
      </Container>
    </footer>
  );
}
