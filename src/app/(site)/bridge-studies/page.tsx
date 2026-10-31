import type { Metadata } from "next";
import Image from "next/image";
import { CompareStudio } from "@/components/bridge-studies/CompareStudio";
import { StudyThumbnail } from "@/components/bridge-studies/StudyPicture";
import { StudyViewer } from "@/components/bridge-studies/StudyViewer";
import { COMPARISON, STUDIES, type Study } from "@/components/bridge-studies/studies";
import { SiteShell } from "@/components/site/SiteShell";
import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionHeading } from "@/components/system/SectionHeading";
import { SectionMarker } from "@/components/system/SectionMarker";

/*
 * Bridge studies: an internal design review of the Approach bridge and four
 * alternatives. Not linked from the site, not in the sitemap, and noindex.
 * Nothing here touches the shipped bridge: the original is shown through a
 * wrapper around its own scene (scenes/bridge-studies/original.ts).
 */

export const metadata: Metadata = {
  title: "Bridge studies",
  description: "Internal design review: the Approach bridge and four alternative directions.",
  alternates: { canonical: "/bridge-studies" },
  robots: { index: false, follow: false },
};

export default function BridgeStudiesPage() {
  return (
    <SiteShell>
      <header className="pt-32 pb-section md:pt-40">
        <Container>
          <SectionMarker label="Design review · internal, not indexed" />
          <h1 className="mt-5 max-w-[14ch] text-balance font-display text-display font-medium [font-stretch:100%] lg:[font-stretch:112%]">
            One bridge, four hands.
          </h1>
          <div className="mt-8 grid gap-6 lg:grid-cols-12">
            <p className="max-w-measure text-lede text-pretty text-ink-soft lg:col-span-6">
              The bridge appears five times on the homepage and once on the 404, always as a pale 3D model. Here the
              Nine Spears idea (a razor’s edge that widens to nine spears’ length) is drawn in four completely
              different visual languages, next to the current bridge for reference.
            </p>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 self-end text-small lg:col-span-5 lg:col-start-8">
              <Fact term="Studies" value="Original + 4 styles" />
              <Fact term="Prepared" value="October 2026" />
              <Fact term="Built with" value="SVG and three.js, in code" />
              <Fact term="Live site" value="Unchanged" />
            </dl>
          </div>
          <p className="mt-10 text-small text-ink-muted">
            Every study follows its slider from today to the future. The two 3D studies can also be dragged to turn
            them; any study opens full screen.
          </p>
        </Container>
      </header>

      <Overview />

      {STUDIES.map((study) => (
        <StudyPlate key={study.id} study={study} />
      ))}

      <Section id="compare" labelledBy="compare-title" ruled className="bg-paper-raised">
        <Container>
          <div className="grid gap-y-6 lg:grid-cols-12 lg:items-end lg:gap-x-6">
            <SectionHeading id="compare-title" className="lg:col-span-7">
              Side by side.
            </SectionHeading>
            <p className="max-w-measure text-lede text-pretty text-ink-soft lg:col-span-4 lg:col-start-9">
              Pick any two. One slider builds both, so the styles can be read against each other at the same moment
              of the story.
            </p>
          </div>
          <div className="mt-10 md:mt-14">
            <CompareStudio />
          </div>
        </Container>
      </Section>

      <Section id="matrix" labelledBy="matrix-title" ruled>
        <Container>
          <SectionHeading id="matrix-title">At a glance.</SectionHeading>
          <Matrix />
        </Container>
      </Section>

      <Section id="decision" labelledBy="decision-title" ruled>
        <Container className="grid gap-y-8 lg:grid-cols-12 lg:gap-x-6">
          <SectionHeading id="decision-title" className="lg:col-span-5">
            Making the call.
          </SectionHeading>
          <div className="space-y-5 text-body text-ink-soft lg:col-span-6 lg:col-start-7">
            <p>
              The idea is the same in all four, so the choice is the voice the site speaks in. Miniature tells the
              story behind the name. Blueprint says we engineer things properly. Etching keeps the interactive 3D
              but makes it hand-made. Poster turns the Approach into a bold typographic statement.
            </p>
            <p>
              A choice here is a direction, not a finished asset. The homepage and the 404 all derive from one bridge
              config, so whichever study we pick would be rebuilt for the Approach seam, the four Method plates and the
              broken 404 together.
            </p>
          </div>
        </Container>
      </Section>
    </SiteShell>
  );
}

function Fact({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="font-label text-label text-ink-muted uppercase">{term}</dt>
      <dd className="mt-1 text-ink">{value}</dd>
    </div>
  );
}

function Overview() {
  return (
    <section aria-label="The studies" className="border-t border-line py-10 md:py-14">
      <Container>
        <ol className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-5 lg:gap-x-5">
          {STUDIES.map((study) => (
            <li key={study.id}>
              <a href={`#${study.id}`} className="group block rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cobalt-700">
                <div className="relative aspect-[4/3] overflow-hidden bg-paper-raised shadow-[inset_0_0_0_1px_var(--color-line)]">
                  {study.medium === "svg" ? (
                    <div className="absolute inset-0 transition-transform duration-[600ms] ease-out-quart group-hover:scale-[1.04] motion-reduce:transition-none">
                      <StudyThumbnail study={study.id as "miniature" | "blueprint" | "poster"} />
                    </div>
                  ) : (
                    <Image
                      src={study.poster!}
                      alt={`${study.name}, built`}
                      fill
                      sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
                      className="object-cover transition-transform duration-[600ms] ease-out-quart group-hover:scale-[1.04] motion-reduce:transition-none"
                    />
                  )}
                </div>
                <p className="mt-3 flex items-baseline gap-2">
                  <span className="font-label text-label text-ink-muted">{study.number}</span>
                  <span className="font-medium text-ink group-hover:text-cobalt-700">{study.name}</span>
                </p>
                <p className="mt-1 text-small text-pretty text-ink-muted">{study.thesis}</p>
              </a>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

function StudyPlate({ study }: { study: Study }) {
  const titleId = `${study.id}-title`;
  const original = study.id === "original";
  return (
    <Section id={study.id} labelledBy={titleId} ruled>
      <Container>
        <div className="grid gap-y-6 lg:grid-cols-12 lg:items-end lg:gap-x-6">
          <div className="lg:col-span-6">
            <p className="flex items-center gap-3 font-label text-label text-ink-muted uppercase">
              <span className="tabular-nums">{study.number}</span>
              <span aria-hidden="true" className="h-px w-8 bg-line-strong" />
              <span>{study.kind}</span>
            </p>
            <SectionHeading id={titleId} className="mt-4">
              {study.name}
            </SectionHeading>
            <p className="mt-4 max-w-[34ch] text-subheading text-pretty text-ink-soft">{study.thesis}</p>
          </div>
          <div className="max-w-measure lg:col-span-5 lg:col-start-8">
            <blockquote className="border-l-2 border-saffron-500 pl-4 text-body text-pretty text-ink italic">
              {study.story}
            </blockquote>
            <p className="mt-5 text-body text-pretty text-ink-soft">{study.concept}</p>
          </div>
        </div>

        <div className="mt-10 md:mt-14">
          <StudyViewer study={study.id} />
        </div>

        <div className="mt-10 grid gap-y-8 border-t border-line pt-8 md:mt-14 lg:grid-cols-12 lg:gap-x-6">
          <dl className="grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:col-span-8 xl:grid-cols-4">
            {study.notes.map((note) => (
              <div key={note.label}>
                <dt className="font-label text-label text-ink-muted uppercase">{note.label}</dt>
                <dd className="mt-2 text-small text-pretty text-ink-soft">{note.text}</dd>
              </div>
            ))}
          </dl>
          <div className="lg:col-span-4">
            <p className="font-label text-label text-saffron-700 uppercase">{original ? "On the site" : "If we adopt it"}</p>
            <p className="mt-2 text-small text-pretty text-ink">{study.adoption}</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function Matrix() {
  return (
    <div className="mt-10 -mx-gutter overflow-x-auto px-gutter md:mt-14" tabIndex={0} role="region" aria-labelledby="matrix-title">
      <table className="w-full min-w-[58rem] border-collapse text-left text-small">
        <thead>
          <tr className="border-b border-ink">
            <th scope="col" className="w-40 py-3 pr-4 font-label text-label font-normal text-ink-muted uppercase">
              <span className="sr-only">Aspect</span>
            </th>
            {STUDIES.map((study) => (
              <th key={study.id} scope="col" className="py-3 pr-4 align-bottom font-medium text-ink">
                <a href={`#${study.id}`} className="hover:text-cobalt-700">
                  <span className="block font-label text-label font-normal text-ink-muted">{study.number}</span>
                  {study.name}
                </a>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARISON.map((row) => (
            <tr key={row.label} className="border-b border-line">
              <th scope="row" className="py-4 pr-4 align-top font-label text-label font-normal text-ink-muted uppercase">
                {row.label}
              </th>
              {row.cells.map((cell, i) => (
                <td key={STUDIES[i].id} className="py-4 pr-4 align-top text-pretty text-ink-soft">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
