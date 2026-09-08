import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { CornerFrame } from "@/components/ui/CornerFrame";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/constants";

export function Contact() {
  return (
    <section className="border-b border-stone-border bg-obsidian-900 py-24 relative" id="contact">
      <div className="max-w-4xl mx-auto px-6">
        <CornerFrame
          offset="md"
          colorClassName="border-gold-400"
          className="border-2 border-gold-500/70 bg-obsidian-850 p-10 sm:p-14 text-center space-y-8 overflow-hidden shadow-2xl rounded-sm"
        >
          <div className="w-16 h-16 rounded-full mx-auto p-1 border-2 border-gold-500 bg-obsidian-950 shadow-lg shadow-gold-500/20 overflow-hidden flex items-center justify-center">
            <Image
              src="/logo.jpg"
              alt="Chinvat Bridge emblem seal"
              width={64}
              height={64}
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          <div className="space-y-2">
            <span className="font-mono text-[10px] tracking-technical text-gold-400 uppercase block font-semibold">
              Start the Conversation
            </span>
            <h2 className="font-serif-monument text-4xl sm:text-6xl text-parchment-50 uppercase tracking-tight">
              Cross the Bridge.
            </h2>
            <div aria-hidden="true" className="w-16 h-px gold-divider-glow mx-auto my-3" />
          </div>

          <p className="font-serif-monument text-base sm:text-lg text-parchment-200 max-w-lg mx-auto leading-relaxed">
            Have a business problem worth solving? Tell us what&rsquo;s slowing your business down, where
            you&rsquo;re trying to grow, or what you&rsquo;d like to build. We&rsquo;ll help you identify the
            most practical next step.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Button
              href={`${CONTACT_MAILTO}?subject=Consulting%20Inquiry`}
              icon="mail"
              size="lg"
              className="w-full sm:w-auto flex-1"
            >
              Start a Conversation
            </Button>
            <Button
              href={`${CONTACT_MAILTO}?subject=Project%20Discussion`}
              icon="arrowForward"
              variant="outline"
              size="lg"
              className="w-full sm:w-auto bg-obsidian-900"
            >
              Tell Us About Your Project
            </Button>
          </div>

          <div className="pt-2">
            <a className="font-mono text-xs text-gold-300 hover:text-gold-400 transition-colors" href={CONTACT_MAILTO}>
              {CONTACT_EMAIL}
            </a>
          </div>

          <div className="pt-6 border-t border-stone-border/80 flex flex-wrap justify-between items-center text-[10px] font-mono text-parchment-dim tracking-technical gap-2">
            <span>UK Based // Working Globally</span>
            <span>Chinvat Bridge</span>
            <span className="text-gold-400 font-semibold">Technology Consultancy</span>
          </div>
        </CornerFrame>
      </div>
    </section>
  );
}
