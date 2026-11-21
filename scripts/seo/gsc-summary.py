"""Summarise a Google Search Console Performance export for the SEO measurement baseline.

    python3 scripts/seo/gsc-summary.py <export-folder-or-zip> [--label "chinvatbridge.com, 2026-08-21..2026-11-19"]

The folder (or the .zip Search Console downloads) holds Queries.csv, Pages.csv, Countries.csv,
Devices.csv, Dates.csv and Filters.csv. Prints Markdown tables to paste into
seo/remediation-2026-11-21/SEO_MEASUREMENT_BASELINE.md.

Limits that the output states, because they matter when reading it:
- Totals come from Dates.csv (every day, all queries). Queries.csv is capped (1,000 rows from the UI,
  50,000 a day from the API, which scripts/seo/gsc-api.py uses) and omits anonymised queries, so brand + non-brand query sums are lower than the totals.
- Brand = a query containing "chinvat" AND a business term (the rule in
  seo/overnight-2026-11-18/15-measurement-framework.md). Other "chinvat" queries are mythology
  traffic and are reported separately.
- The date range is read from Filters.csv when present; always record it with the numbers.
"""

import csv
import io
import re
import sys
import zipfile
from pathlib import Path

BUSINESS = re.compile(r"ltd|consult|seo|software|automation|\bai\b|contact|pricing|services?|agency|company", re.I)
GROUPS = [
    ("Home", re.compile(r"^https?://[^/]+/?$")),
    ("Service pages", re.compile(r"/services/")),
    ("Pricing", re.compile(r"/pricing")),
    ("Insights articles", re.compile(r"/insights/.+")),
    ("Insights index", re.compile(r"/insights/?$")),
]


def load(source: Path) -> dict[str, list[dict]]:
    files: dict[str, str] = {}
    if source.suffix == ".zip":
        with zipfile.ZipFile(source) as z:
            for name in z.namelist():
                files[Path(name).name] = z.read(name).decode("utf-8-sig")
    else:
        for p in source.glob("*.csv"):
            files[p.name] = p.read_text(encoding="utf-8-sig")
    return {name: list(csv.DictReader(io.StringIO(text))) for name, text in files.items()}


def num(value: str) -> float:
    return float(str(value).replace("%", "").replace(",", "") or 0)


def metrics(rows: list[dict]) -> tuple[int, int, float, float]:
    clicks = sum(num(r["Clicks"]) for r in rows)
    impressions = sum(num(r["Impressions"]) for r in rows)
    ctr = clicks / impressions * 100 if impressions else 0.0
    # Impression-weighted average position, the way Search Console aggregates it.
    position = sum(num(r["Position"]) * num(r["Impressions"]) for r in rows) / impressions if impressions else 0.0
    return int(clicks), int(impressions), ctr, position


def row(label: str, rows: list[dict]) -> str:
    c, i, ctr, pos = metrics(rows)
    return f"| {label} | {c} | {i} | {ctr:.2f}% | {pos:.1f} |"


def first_key(rows: list[dict]) -> str:
    return next(iter(rows[0])) if rows else ""


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    data = load(Path(sys.argv[1]))
    label = sys.argv[sys.argv.index("--label") + 1] if "--label" in sys.argv else sys.argv[1]
    head = "| Segment | Clicks | Impressions | CTR | Avg. position |\n|---|---|---|---|---|"

    print(f"## Search Console summary: {label}\n")
    if "Filters.csv" in data:
        print("Filters in the export: " + "; ".join(f"{r.get('Filter', '')}: {r.get('Value', '')}" for r in data["Filters.csv"]) + "\n")

    dates = data.get("Dates.csv", [])
    if dates:
        days = sorted(r[first_key(dates)] for r in dates)
        print(f"Days in Dates.csv: {len(days)} ({days[0]} to {days[-1]})\n")
        print(head)
        print(row("All queries (totals, from Dates.csv)", dates))
        print()

    queries = data.get("Queries.csv", [])
    if queries:
        key = first_key(queries)
        chinvat = [r for r in queries if "chinvat" in r[key].lower()]
        brand = [r for r in chinvat if BUSINESS.search(r[key])]
        myth = [r for r in chinvat if not BUSINESS.search(r[key])]
        nonbrand = [r for r in queries if "chinvat" not in r[key].lower()]
        print(f"Queries.csv rows: {len(queries)} (UI exports cap at 1,000 rows, the API at 50,000 a day; anonymised queries are excluded either way)\n")
        print(head)
        print(row("Brand (chinvat + business term)", brand))
        print(row("Name only (likely mythology)", myth))
        print(row("Non-brand", nonbrand))
        print("\n### Top non-brand queries by impressions\n")
        print("| Query | Clicks | Impressions | CTR | Position |\n|---|---|---|---|---|")
        for r in sorted(nonbrand, key=lambda r: -num(r["Impressions"]))[:25]:
            print(f"| {r[key]} | {r['Clicks']} | {r['Impressions']} | {r['CTR']} | {r['Position']} |")
        print()

    pages = data.get("Pages.csv", [])
    if pages:
        key = first_key(pages)
        print("### By page group\n")
        print(head)
        com = [r for r in pages if "chinvatbridge.com" in r[key]]
        for name, pattern in GROUPS:
            print(row(f"{name} (.com)", [r for r in com if pattern.search(r[key])]))
        other_hosts = [r for r in pages if "chinvatbridge.com" not in r[key]]
        if other_hosts:
            print(row("Pages not on chinvatbridge.com (e.g. the old .uk)", other_hosts))
        print("\n### Pages with impressions but low CTR (≥ 100 impressions, CTR < 1%)\n")
        print("| Page | Clicks | Impressions | CTR | Position |\n|---|---|---|---|---|")
        for r in sorted(pages, key=lambda r: -num(r["Impressions"])):
            if num(r["Impressions"]) >= 100 and num(r["CTR"]) < 1:
                print(f"| {r[key]} | {r['Clicks']} | {r['Impressions']} | {r['CTR']} | {r['Position']} |")
        print()

    for name in ("Countries.csv", "Devices.csv"):
        rows = data.get(name, [])
        if rows:
            key = first_key(rows)
            print(f"### {name[:-4]}\n")
            print(head)
            for r in sorted(rows, key=lambda r: -num(r["Impressions"]))[:10]:
                print(row(r[key], [r]))
            print()


if __name__ == "__main__":
    main()
