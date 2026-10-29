import Link from "next/link";
import { Lockup } from "@/components/brand/Lockup";
import { Container } from "@/components/system/Container";
import { CONTACT_EMAIL } from "@/lib/constants";
import { CONTACT_LINK, DISCIPLINE_LINKS, LOGIN_LINK, PRICING_LINK, SECTION_LINKS, type SiteLink } from "./nav";

/*
 * On small screens Explore runs the full height of the first column and
 * Disciplines and Clients stack in the second; from sm they sit side by side.
 */
const COLUMNS: { title: string; links: SiteLink[]; className: string }[] = [
  {
    title: "Explore",
    links: [...SECTION_LINKS, { label: "Contact", href: CONTACT_LINK.href }],
    className: "row-span-2 sm:row-span-1",
  },
  { title: "Disciplines", links: DISCIPLINE_LINKS, className: "col-start-2" },
  { title: "Clients", links: [PRICING_LINK, LOGIN_LINK], className: "col-start-2 sm:col-start-3" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-paper-raised">
      <Container className="grid gap-10 py-12 md:grid-cols-12 md:gap-6 lg:py-20">
        <div className="md:col-span-5 lg:col-span-4">
          <Lockup />
          <p className="mt-6 max-w-[34ch] text-small text-ink-soft">
            Chinvat Bridge is a UK-based technology consultancy helping businesses use AI, automation, software and SEO
            to work better and grow.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-6 inline-flex min-h-11 items-center text-small text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink"
          >
            {CONTACT_EMAIL}
          </a>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:col-span-7 lg:col-span-7 lg:col-start-6">
          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={`Footer: ${column.title}`} className={column.className}>
              <h2 className="text-small font-medium text-ink">{column.title}</h2>
              <ul className="mt-3 flex flex-col">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-11 items-center text-small text-ink-soft transition-colors duration-200 hover:text-ink lg:min-h-9"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </Container>

      <Container className="flex flex-col gap-2 pb-6 text-small text-ink-muted md:flex-row md:items-center md:justify-between">
        <p>UK Based // Working Globally</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <p>&copy; {year} Chinvat Bridge Ltd. All rights reserved.</p>
          <Link href="/privacy" className="inline-flex min-h-11 items-center hover:text-ink md:min-h-6 md:py-1">
            Privacy Policy
          </Link>
          <Link href="/terms" className="inline-flex min-h-11 items-center hover:text-ink md:min-h-6 md:py-1">
            Terms of Service
          </Link>
        </div>
      </Container>
    </footer>
  );
}
