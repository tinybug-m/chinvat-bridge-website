import Link from "next/link";
import { Lockup } from "@/components/brand/Lockup";
import { Container } from "@/components/system/Container";
import { prefetchFor, type ShellChrome, type SiteLink } from "./nav";

/*
 * On small screens Explore runs the full height of the first column and
 * Disciplines and Clients stack in the second; from sm they sit side by side.
 */
const columnsFor = (chrome: ShellChrome): { title: string; links: SiteLink[]; className: string }[] => [
  {
    title: chrome.footer.columnTitles.explore,
    links: [...chrome.sections, { label: chrome.footer.contactLinkLabel, href: chrome.contact.href }],
    className: "row-span-2 sm:row-span-1",
  },
  { title: chrome.footer.columnTitles.disciplines, links: chrome.disciplines, className: "col-start-2" },
  { title: chrome.footer.columnTitles.clients, links: [chrome.pricing, chrome.login], className: "col-start-2 sm:col-start-3" },
];

export function SiteFooter({ chrome }: { chrome: ShellChrome }) {
  const year = new Date().getFullYear();
  const COLUMNS = columnsFor(chrome);
  const CONTACT_EMAIL = chrome.contactEmail;

  return (
    <footer className="border-t border-line bg-paper-raised">
      <Container className="grid gap-10 py-12 md:grid-cols-12 md:gap-6 lg:py-20">
        <div className="md:col-span-5 lg:col-span-4">
          <Lockup className="min-h-11" />
          <p className="mt-6 max-w-[34ch] text-small text-ink-soft">{chrome.footer.blurb}</p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-6 inline-flex min-h-11 items-center text-small text-ink underline decoration-line-strong underline-offset-4 transition-[color,text-decoration-color] duration-200 ease-out-quart hover:decoration-ink motion-reduce:transition-none"
          >
            {CONTACT_EMAIL}
          </a>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:col-span-7 lg:col-span-7 lg:col-start-6">
          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={`Footer: ${column.title}`} className={column.className}>
              <h2 className="text-small font-medium text-ink">{column.title}</h2>
              <ul className="mt-3 flex flex-col">
                {/* Keyed by label, never by href + label: keys are serialised into the page, and a string
                    like "/pricingPricing" there was crawled by Google as a URL and 404'd. */}
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      prefetch={prefetchFor(link.href)}
                      className="inline-flex min-h-11 items-center text-small text-ink-soft transition-[color,text-decoration-color] duration-200 ease-out-quart hover:text-ink motion-reduce:transition-none lg:min-h-9"
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

      <Container className="flex flex-col gap-2 pb-6 text-small text-ink-muted lg:flex-row lg:items-center lg:justify-between">
        <p>{chrome.eyebrow}</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <p>
            &copy; {year} {chrome.footer.copyrightHolder}. {chrome.footer.rightsNotice}
          </p>
          {chrome.footer.legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              className="inline-flex min-h-11 items-center transition-[color,text-decoration-color] duration-200 ease-out-quart hover:text-ink motion-reduce:transition-none"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </Container>
    </footer>
  );
}
