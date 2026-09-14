import { Icon } from "@/components/atoms/icons";
import { Bay } from "@/components/molecules/Bay";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/constants";

export function AdvisoryChannel() {
  return (
    <Bay numeral="IV." title="Advisory Channel">
      <div className="p-6 space-y-4">
        <div className="border-l-2 border-gold-500 pl-3">
          <span className="font-mono text-[10px] text-gold-500 uppercase tracking-technical font-semibold block">
            Priority Advisory Access
          </span>
          <p className="font-serif-monument text-sm text-parchment-dim mt-1">
            Direct access to your designated SEO consultant &mdash; included with the Growth and Scale plans.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <button
            type="button"
            disabled
            className="w-full bg-obsidian-850 border border-stone-borderLight text-parchment-dim font-mono text-[10px] tracking-technical uppercase py-3 px-4 flex items-center justify-center gap-2 opacity-70 cursor-not-allowed"
          >
            <Icon name="helpOutline" className="text-sm" />
            <span>Schedule Strategy Call (Coming Soon)</span>
          </button>
          <a
            href={`${CONTACT_MAILTO}?subject=Client%20Support`}
            className="w-full bg-obsidian-850 border border-gold-500/50 text-gold-300 hover:text-gold-400 hover:border-gold-500 font-mono text-[10px] tracking-technical uppercase py-3 px-4 flex items-center justify-center gap-2 transition-colors"
          >
            <Icon name="mail" className="text-sm" />
            <span>Email Support</span>
          </a>
        </div>
        <p className="text-center font-mono text-[10px] text-parchment-dim pt-1">Direct: {CONTACT_EMAIL}</p>
      </div>
    </Bay>
  );
}
