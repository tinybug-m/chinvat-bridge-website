import { BrandLockup } from "@/components/ui/BrandLockup";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/constants";
import { toRomanNumeral } from "@/lib/roman-numeral";
import { DISCIPLINE_LINKS, LEGAL_NAV_LINKS } from "@/data/footer";

export function Footer() {
  const copyrightYear = toRomanNumeral(new Date().getFullYear());

  return (
    <footer className="bg-obsidian-950 border-t border-stone-border text-parchment-muted">
      <div className="max-w-7xl mx-auto py-14 px-6 lg:px-12">
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
                <a key={link.label} className="hover:text-gold-300 transition-colors" href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className="md:col-span-3 space-y-2 font-mono text-[11px] tracking-technical">
            <span className="text-gold-400 uppercase block font-semibold">Chinvat Bridge</span>
            <p className="text-parchment-dim text-xs leading-relaxed">
              UK Based &bull; Working Globally
              <br />
              <a
                className="text-parchment-200 hover:text-gold-300 underline-offset-2 hover:underline wrap-break-word"
                href={CONTACT_MAILTO}
              >
                {CONTACT_EMAIL}
              </a>
            </p>
            <div className="pt-2">
              <a
                className="inline-block px-2.5 py-0.5 bg-obsidian-900 border border-gold-500/40 text-[9px] text-gold-300 hover:text-gold-400 transition-colors"
                href="#contact"
              >
                Start a Conversation
              </a>
            </div>
          </div>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono tracking-technical text-parchment-dim gap-4">
          <div>&copy; {copyrightYear} Chinvat Bridge Ltd. All rights reserved.</div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {LEGAL_NAV_LINKS.map((link) => (
              <span key={link.label} className="flex items-center gap-x-6">
                <a className="hover:text-gold-300 transition-colors" href={link.href}>
                  {link.label}
                </a>
                <span aria-hidden="true" className="text-stone-border">
                  &bull;
                </span>
              </span>
            ))}
            <a className="text-gold-400 hover:underline" href="#contact">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
