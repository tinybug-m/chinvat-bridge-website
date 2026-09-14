import Image from "next/image";
import Link from "next/link";

interface BrandLockupProps {
  size?: "sm" | "md";
  showTagline?: boolean;
}

const FRAME_SIZE = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
};

const WORDMARK_SIZE = {
  sm: "text-sm tracking-[0.2em]",
  md: "text-base tracking-[0.24em]",
};

export function BrandLockup({ size = "md", showTagline = true }: BrandLockupProps) {
  return (
    <Link
      aria-label="Chinvat Bridge Home"
      className="flex items-center gap-3.5 group focus-visible:outline-none"
      href="/"
    >
      <div
        className={`relative ${FRAME_SIZE[size]} shrink-0 rounded-full p-0.5 border border-gold-500/60 bg-obsidian-900 group-hover:border-gold-400 transition-all duration-300 overflow-hidden shadow-inner flex items-center justify-center`}
      >
        <Image
          src="/logo.jpg"
          alt="Chinvat Bridge emblem"
          width={80}
          height={80}
          className="w-full h-full object-cover rounded-full scale-105 group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="flex flex-col text-left">
        <span
          className={`font-cinzel text-parchment-100 font-semibold uppercase leading-tight group-hover:text-gold-300 transition-colors ${WORDMARK_SIZE[size]}`}
        >
          CHINVAT
        </span>
        {showTagline ? (
          <span className="font-mono text-[9px] tracking-[0.36em] text-gold-500 uppercase font-medium">
            BRIDGE
          </span>
        ) : null}
      </div>
    </Link>
  );
}
