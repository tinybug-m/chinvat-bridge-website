"use client";

import { type KeyboardEvent, useRef, useSyncExternalStore } from "react";
import {
  type LogoMaterial,
  readLogoMaterial,
  setLogoMaterial,
  subscribeLogoMaterial,
} from "@/components/brand/logo-material";
import { cn } from "@/lib/utils";

/*
 * Two-option radiogroup that switches the glass logo between its chrome
 * (default) and classic (cerulean / saffron) material. The logo itself is
 * switched by CSS from <html data-logo-material>; this only writes the
 * attribute (and localStorage) and mirrors it as aria-checked. Its visual
 * selected state is CSS too, so a saved choice never flashes the wrong one.
 */

const OPTIONS: { value: LogoMaterial; label: string }[] = [
  { value: "chrome", label: "Chrome" },
  { value: "classic", label: "Classic" },
];

const serverSnapshot = (): LogoMaterial => "chrome";

export function LogoMaterialToggle({ className }: { className?: string }) {
  const current = useSyncExternalStore(subscribeLogoMaterial, readLogoMaterial, serverSnapshot);
  const refs = useRef<Record<LogoMaterial, HTMLButtonElement | null>>({ chrome: null, classic: null });

  function choose(value: LogoMaterial, focus = false) {
    setLogoMaterial(value);
    if (focus) refs.current[value]?.focus();
  }

  // Radiogroup keys: arrows move and select, wrapping; Home and End jump.
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = OPTIONS.findIndex((option) => option.value === current);
    let next = -1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % OPTIONS.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index + OPTIONS.length - 1) % OPTIONS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = OPTIONS.length - 1;
    if (next < 0) return;
    event.preventDefault();
    choose(OPTIONS[next].value, true);
  }

  return (
    <div className={cn("logo-toggle", className)} data-logo-toggle>
      <span id="logo-material-label" className="text-small text-ink-muted">
        Logo
      </span>
      <div role="radiogroup" aria-labelledby="logo-material-label" onKeyDown={onKeyDown}>
        {OPTIONS.map((option) => {
          const checked = option.value === current;
          return (
            <button
              key={option.value}
              ref={(element) => {
                refs.current[option.value] = element;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              data-option={option.value}
              onClick={() => choose(option.value)}
            >
              <span aria-hidden="true" data-swatch={option.value} />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
