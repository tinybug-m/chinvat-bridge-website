import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionHeading } from "@/components/system/SectionHeading";
import { TextLink } from "@/components/system/TextLink";

interface Project {
  name: string;
  context: string;
  label: "Client project" | "Concept";
  href: string;
  key: "scornik" | "benedict" | "naturaglow";
  src: string;
  alt: string;
}

const SCORNIK: Project = {
  key: "scornik",
  name: "Scornik Gerstein LLP",
  context: "London law firm",
  label: "Client project",
  href: "https://scornik.vercel.app/",
  src: "/work/scornik.jpg",
  alt: "Home page of the Scornik Gerstein LLP website: an aerial view of the Thames, Tower Bridge and the Shard under the headline Your London Solicitors for Individuals, with Request a consultation and Call buttons.",
};

const CONCEPTS: Project[] = [
  {
    key: "benedict",
    name: "Benedict Funeral Directors",
    context: "Funeral directors, Henlow Camp, Bedfordshire",
    label: "Concept",
    href: "https://benedict-funeral.vercel.app/",
    src: "/work/benedict.jpg",
    alt: "Home page of the Benedict Funeral Directors concept on a plum background, with the headline Caring for your family, and the person you love, and a banner saying it is a design concept and not the live website.",
  },
  {
    key: "naturaglow",
    name: "NATURAGLOW",
    context: "Skincare and wellness clinic, Beverly Hills",
    label: "Concept",
    href: "https://beauty-blue-sigma.vercel.app/",
    src: "/work/naturaglow.jpg",
    alt: "Home page of the NATURAGLOW concept on a brown background, with the headline Natural Beauty, Expert Care, Book your treatment and Explore Services buttons, and an arched photo of a woman applying a serum with a dropper.",
  },
];

// Every screenshot is the same 2000x1250 capture (16:10).
const IMAGE_CLASS =
  "block h-auto w-full border border-line transition-opacity duration-200 group-hover:opacity-85 group-has-[a:focus-visible]:outline-2 group-has-[a:focus-visible]:outline-offset-4 group-has-[a:focus-visible]:outline-cobalt-700";

/*
 * The link's ::after stretches over the whole card, so the screenshot is
 * clickable too while the text link stays the one accessible name.
 */
function VisitLink({ project }: { project: Project }) {
  return (
    <TextLink
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center rounded-[2px] text-body after:absolute after:inset-0 after:content-[''] group-hover:decoration-cobalt-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cobalt-700"
    >
      Visit the site
      <span className="sr-only">
        {" "}
        for {project.name} (opens in a new tab)
      </span>
    </TextLink>
  );
}

/*
 * Built only from the three projects the team supplied. Scornik Gerstein is the
 * one real client, so it leads at full width. The two concepts follow under
 * their own heading, side by side at the same size, and are labelled as
 * concepts in plain text so they are never read as commissioned work.
 */
export function Work() {
  return (
    <Section id="work" labelledBy="work-title" className="py-16 md:py-20 lg:py-24">
      <Container>
        <Reveal>
          <SectionHeading id="work-title" measure="max-w-[12ch]">
            Recent work.
          </SectionHeading>
        </Reveal>

        <article aria-labelledby="work-scornik" data-project={SCORNIK.key} className="group relative mt-10 lg:mt-12">
          <Reveal>
            <Image
              src={SCORNIK.src}
              alt={SCORNIK.alt}
              width={2000}
              height={1250}
              sizes="(min-width: 1280px) 1200px, 100vw"
              className={IMAGE_CLASS}
            />
            <div className="mt-5 grid gap-x-6 gap-y-4 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p data-label className="text-small font-medium text-cobalt-700">
                  {SCORNIK.label}
                </p>
                <h3 id="work-scornik" className="mt-2 text-balance font-display text-heading font-medium">
                  {SCORNIK.name}
                </h3>
                <p className="mt-2 text-pretty text-body text-ink-soft">{SCORNIK.context}.</p>
              </div>
              <div className="lg:col-span-5 lg:pt-6">
                <p className="text-pretty text-lede text-ink">We designed and built their website.</p>
                <div className="mt-2">
                  <VisitLink project={SCORNIK} />
                </div>
              </div>
            </div>
          </Reveal>
        </article>

        <div className="mt-14 md:mt-16 lg:mt-20">
          <Reveal>
            <h3 className="text-balance font-display text-heading font-medium">Concepts</h3>
            <p className="mt-2 max-w-[44ch] text-pretty text-body text-ink-soft">
              Two concepts. Speculative, not client work.
            </p>
          </Reveal>

          <div className="mt-8 grid gap-x-6 gap-y-12 md:grid-cols-2">
            {CONCEPTS.map((project, index) => (
              <article
                key={project.key}
                aria-labelledby={`work-${project.key}`}
                data-project={project.key}
                className="group relative"
              >
                <Reveal delay={index * 80}>
                  <Image
                    src={project.src}
                    alt={project.alt}
                    width={2000}
                    height={1250}
                    sizes="(min-width: 1280px) 590px, (min-width: 768px) 46vw, 100vw"
                    className={IMAGE_CLASS}
                  />
                  <p data-label className="mt-5 text-small font-medium text-ink-soft">
                    {project.label}
                  </p>
                  <h4 id={`work-${project.key}`} className="mt-2 text-balance font-display text-subheading font-medium">
                    {project.name}
                  </h4>
                  <p className="mt-2 text-pretty text-body text-ink-soft">{project.context}.</p>
                  <div className="mt-2">
                    <VisitLink project={project} />
                  </div>
                </Reveal>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
