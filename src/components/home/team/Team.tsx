import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionHeading } from "@/components/system/SectionHeading";

/* First names and role titles only: nothing else about the team has been supplied. */
const PEOPLE = [
  { name: "Artin", role: "Owner" },
  { name: "Arshia", role: "CTO" },
  { name: "Erik", role: "SEO expert" },
] as const;

/*
 * Each name starts two columns further in, so on wide screens the three step
 * down the grid like a descending signature. A hairline closes every row and
 * every role sits in the same right-hand column, flush to the baseline of its
 * name: the long run between the two is the index rule doing its job, and the
 * stagger is the only thing that moves. Classes are spelled out in full so
 * Tailwind can see them.
 */
const STARTS = ["lg:col-start-1", "lg:col-start-3", "lg:col-start-5"] as const;

/* Below lg the same descent is a small margin step instead of a column step. */
const STEPS = ["", "ml-[8%] lg:ml-0", "ml-[16%] lg:ml-0"] as const;

/*
 * Deliberately short and typographic: no photos exist, so the names themselves
 * are the largest type in the section, bigger than its heading. The ground is
 * haze, a step off the dark About band before it and the paper Insights after.
 */
export function Team() {
  return (
    <Section id="team" labelledBy="team-title" className="bg-haze py-20 md:py-28 lg:py-32">
      <Container>
        <Reveal>
          <SectionHeading id="team-title">The team.</SectionHeading>
        </Reveal>

        <ul className="mt-12 list-none border-b border-line md:mt-16 lg:mt-20">
          {PEOPLE.map((person, index) => (
            <Reveal as="li" key={person.name} delay={index * 90} className="border-t border-line py-5 lg:py-3">
              <div
                className={`flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-x-6 lg:grid lg:grid-cols-12 lg:gap-x-6 ${STEPS[index]}`}
              >
                <span
                  className={`font-display text-[clamp(4rem,1.2rem+12vw,13rem)] font-medium leading-[0.92] tracking-[-0.035em] text-ink lg:col-end-10 lg:text-[length:clamp(7rem,0.5rem+14.5vw,14rem)] lg:[font-stretch:112%] ${STARTS[index]}`}
                >
                  {person.name}
                </span>
                <span className="sr-only">, </span>
                <span className="text-subheading font-medium text-cobalt-700 lg:col-span-3 lg:col-start-10">
                  {person.role}
                </span>
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
