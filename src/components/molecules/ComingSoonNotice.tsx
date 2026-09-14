import { Icon } from "@/components/atoms/icons";
import { CONTACT_EMAIL } from "@/lib/constants";

export function ComingSoonNotice({ children }: { children: string }) {
  return (
    <div className="p-6 flex items-start gap-3">
      <Icon name="helpOutline" className="text-gold-500 text-xl shrink-0 mt-0.5" />
      <p className="font-serif-monument text-sm text-parchment-muted leading-relaxed">
        {children} In the meantime, reach your consultant directly at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold-300 hover:text-gold-400 underline underline-offset-2">
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </div>
  );
}
