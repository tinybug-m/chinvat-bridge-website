export interface Project {
  key: "scornik" | "benedict" | "naturaglow";
  name: string;
  /** One line on who it is for and what we did. */
  context: string;
  label: "Client project" | "Concept";
  href: string;
  /** Screenshot of the home page; every capture is 2000x1250 (16:10). */
  src: string;
  alt: string;
}

/*
 * Built only from the three projects the team supplied. Scornik Gerstein is
 * the one real client and leads; the two concepts are labelled as concepts in
 * plain text so they are never read as commissioned work.
 */
export const PROJECTS: Project[] = [
  {
    key: "scornik",
    name: "Scornik Gerstein LLP",
    context: "London law firm. We designed and built their website.",
    label: "Client project",
    href: "https://scornik.vercel.app/",
    src: "/work/scornik.jpg",
    alt: "Home page of the Scornik Gerstein LLP website: an aerial view of the Thames, Tower Bridge and the Shard under the headline Your London Solicitors for Individuals, with Request a consultation and Call buttons.",
  },
  {
    key: "benedict",
    name: "Benedict Funeral Directors",
    context: "Funeral directors, Henlow\u00a0Camp, Bedfordshire.",
    label: "Concept",
    href: "https://benedict-funeral.vercel.app/",
    src: "/work/benedict.jpg",
    alt: "Home page of the Benedict Funeral Directors concept on a dark green background with a copper address bar, with the headline Caring for your family, and the person you love, and a banner saying it is a design concept and not the live website.",
  },
  {
    key: "naturaglow",
    name: "NATURAGLOW",
    context: "Skincare and wellness clinic, Beverly Hills.",
    label: "Concept",
    href: "https://beauty-blue-sigma.vercel.app/",
    src: "/work/naturaglow.jpg",
    alt: "Home page of the NATURAGLOW concept on a brown background, with the headline Natural Beauty, Expert Care, Book your treatment and Explore Services buttons, and an arched photo of a woman applying a serum with a dropper.",
  },
];
