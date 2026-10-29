import Link from "next/link";
import type { PostMeta } from "@/lib/blog";

export const meta: PostMeta = {
  slug: "where-the-name-chinvat-bridge-comes-from",
  title: "Where the Name Chinvat Bridge Comes From",
  description:
    "What the oldest Zoroastrian texts and the later Middle Persian books actually say about the Chinvat Bridge, and the one idea we borrowed from it.",
  date: "2026-10-29",
  author: "Chinvat Bridge",
  category: "Our Name",
  tags: ["brand", "origin", "approach"],
  readingMinutes: 3,
};

export function Content() {
  return (
    <>
      <p>
        The Chinvat Bridge is a crossing in Zoroastrian tradition, the place where a person&rsquo;s
        life is looked at plainly before they pass from one state to another. We took the name
        for the idea of an honest look followed by a way across. We did not take it for the
        religion, and we try to describe it only as far as the texts allow.
      </p>

      <div className="space-y-3">
        <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">
          What the oldest texts say
        </h2>
        <p>
          The Gathas, the oldest Zoroastrian texts, mention the bridge in Yasna 46.10&ndash;11 and
          51.13. Translators render its name as the &ldquo;Bridge of the Judge&rdquo; (Insler,
          Mills) or the &ldquo;Separator&rdquo; (Bartholomae). In these verses the soul and the
          conscience, <em>daena</em>, are what torment the wicked there. The verses do not
          describe a balance, a judge&rsquo;s tribunal or the width of the bridge.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">
          What the Middle Persian books add
        </h2>
        <p>
          Later Middle Persian writings place Mihr with Sros
          and Rashn at the judgement. Rashn weighs deeds on a balance, and the Mainyo-i Khrad
          (chapter 2, in West&rsquo;s 1885 translation) says that balance &ldquo;renders no
          favour&rdquo;: it does not bend for rank or flattery. That is the part of the story we
          find most useful, because it describes an assessment with nothing to sell.
        </p>
        <p>
          Some later Pahlavi books, among them the Dadestan i Denig (21.5) and the Denkard, also
          describe the bridge as nine lances wide for the righteous and as narrow as a razor for
          the wicked. That is a later tradition, not something the Gathas say, and scholars still
          debate how the crossing was imagined to work (Saadat, 2026, argues for a
          balance-driven mechanism).
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">
          What we borrow
        </h2>
        <p>
          Two things, and both are plain. First, look honestly at where things stand, before
          anyone proposes a tool. Second, build the way across, so that the distance between how a
          business works today and how it could work tomorrow gets shorter. Everything else in
          the tradition belongs to the people who hold it.
        </p>
        <p>
          If you would like that kind of honest look at your own systems,{" "}
          <Link className="text-gold-300 hover:text-gold-400 underline underline-offset-4" href="/#contact">
            start a conversation with us
          </Link>
          .
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">Sources</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Insler, S. (1975). The Gathas of Zarathustra. Yasna 46.10&ndash;11 and 51.13.</li>
          <li>Mills, L. H. (1887). The Zend-Avesta, part III. Sacred Books of the East, vol. 31.</li>
          <li>
            West, E. W. (1885). Pahlavi Texts, part III: Dina-i Mainog-i Khirad. Sacred Books of
            the East, vol. 24. Chapter 2.
          </li>
          <li>Encyclopaedia Iranica, &ldquo;Chinwad Puhl&rdquo;.</li>
          <li>Saadat, A. (2026). Iranian Studies.</li>
        </ul>
      </div>
    </>
  );
}
