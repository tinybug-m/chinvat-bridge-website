"""Read-only Google Search Console client for the Chinvat Bridge measurement baseline. Standard library only.

    python3 scripts/seo/gsc-api.py auth                 # one-time: Google's consent screen, read-only scope
    python3 scripts/seo/gsc-api.py sites                # which properties the account can see, and its permission
    python3 scripts/seo/gsc-api.py fetch [--out DIR]    # performance (16 months), sitemaps, URL inspection
    python3 scripts/seo/gsc-api.py plan                 # print every request `fetch` would make, without credentials

Safety, by construction:
- The only OAuth scope requested is webmasters.readonly; a token granted any other scope is refused and not saved.
- Every request passes an allow-list of read-only endpoints (sites.list, sitemaps.list, searchAnalytics.query,
  urlInspection.index.inspect). Submitting or deleting sitemaps, adding or removing sites, Change of Address and
  user management are not reachable from this script, and Google would refuse them for this scope anyway.
- Credentials live outside the repository, in ~/.config/chinvat-gsc/ (override with CHINVAT_GSC_DIR):
  client_secret.json (the Desktop OAuth client you download from Google Cloud) and token.json (the refresh token,
  written with mode 600). Neither is ever printed. Revoke at https://myaccount.google.com/permissions.

Not available through Google's API, so these still need the Search Console UI: the Page indexing report (only
per-URL inspection exists) and Change of Address status.
"""

import base64
import csv
import hashlib
import http.server
import json
import os
import re
import secrets
import sys
import threading
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

SCOPE = "https://www.googleapis.com/auth/webmasters.readonly"
AUTH_URI = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URI = "https://oauth2.googleapis.com/token"
API = "https://searchconsole.googleapis.com"
PROPERTIES = ["sc-domain:chinvatbridge.com", "sc-domain:chinvatbridge.uk"]
CANONICAL = "https://www.chinvatbridge.com"
CONFIG = Path(os.environ.get("CHINVAT_GSC_DIR", "~/.config/chinvat-gsc")).expanduser()
CLIENT_FILE = CONFIG / "client_secret.json"
TOKEN_FILE = CONFIG / "token.json"

# (method, path pattern). Anything else is refused before it leaves the machine.
ALLOWED = [
    ("GET", re.compile(r"^/webmasters/v3/sites$")),
    ("GET", re.compile(r"^/webmasters/v3/sites/[^/]+/sitemaps$")),
    ("POST", re.compile(r"^/webmasters/v3/sites/[^/]+/searchAnalytics/query$")),
    ("POST", re.compile(r"^/v1/urlInspection/index:inspect$")),
]


def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def load_client() -> dict:
    if not CLIENT_FILE.exists():
        sys.exit(f"Missing {CLIENT_FILE}. Download the Desktop OAuth client JSON from Google Cloud and save it there.")
    data = json.loads(CLIENT_FILE.read_text())
    client = data.get("installed")
    if not client:
        sys.exit("client_secret.json is not a Desktop app client (no 'installed' key). Create a 'Desktop app' OAuth client.")
    return client


def post_form(url: str, fields: dict) -> dict:
    req = urllib.request.Request(url, data=urllib.parse.urlencode(fields).encode(), method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            return json.load(res)
    except urllib.error.HTTPError as error:
        body = json.loads(error.read() or b"{}")
        sys.exit(f"Google refused the token request: {body.get('error')}: {body.get('error_description', '')}")


def auth() -> None:
    client = load_client()
    verifier = b64url(secrets.token_bytes(48))
    state = b64url(secrets.token_bytes(16))
    result: dict = {}

    class Handler(http.server.BaseHTTPRequestHandler):
        def do_GET(self):  # noqa: N802 (http.server API)
            query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            if "state" not in query and "error" not in query:
                self.send_response(404)
                self.end_headers()
                return
            result.update({k: v[0] for k, v in query.items()})
            ok = result.get("state") == state and "code" in result
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            message = "Read-only access granted. You can close this tab." if ok else "Authorisation did not complete. You can close this tab."
            self.wfile.write(f"<!doctype html><title>Chinvat Bridge</title><p>{message}</p>".encode())
            threading.Thread(target=server.shutdown, daemon=True).start()

        def log_message(self, *args):
            pass

    server = http.server.HTTPServer(("127.0.0.1", 0), Handler)
    redirect_uri = f"http://127.0.0.1:{server.server_port}"
    url = AUTH_URI + "?" + urllib.parse.urlencode({
        "client_id": client["client_id"],
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": SCOPE,
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
        "code_challenge": b64url(hashlib.sha256(verifier.encode()).digest()),
        "code_challenge_method": "S256",
    })
    print("Open this address in your browser, sign in to the Google account that owns the Search Console")
    print("properties, and approve read-only access (\"View Search Console data for your verified sites\"):\n")
    print(url, flush=True)
    print("\nWaiting up to 15 minutes for Google to redirect back to this computer...", flush=True)
    timer = threading.Timer(900, server.shutdown)
    timer.start()
    server.serve_forever()
    timer.cancel()

    if result.get("state") != state or "code" not in result:
        sys.exit(f"Not authorised: {result.get('error', 'timed out or state mismatch')}")
    token = post_form(TOKEN_URI, {
        "client_id": client["client_id"],
        "client_secret": client.get("client_secret", ""),
        "code": result["code"],
        "code_verifier": verifier,
        "grant_type": "authorization_code",
        "redirect_uri": redirect_uri,
    })
    granted = set(token.get("scope", "").split())
    if granted != {SCOPE}:
        sys.exit(f"Refusing to save: Google granted {sorted(granted)}, expected only {SCOPE}.")
    if "refresh_token" not in token:
        sys.exit("Google returned no refresh token. Remove the app's access at myaccount.google.com/permissions and retry.")
    CONFIG.mkdir(mode=0o700, parents=True, exist_ok=True)
    TOKEN_FILE.touch(mode=0o600, exist_ok=True)
    TOKEN_FILE.chmod(0o600)
    TOKEN_FILE.write_text(json.dumps({"refresh_token": token["refresh_token"], "scope": SCOPE, "granted": datetime.now(timezone.utc).isoformat()}))
    print(f"Saved a read-only refresh token to {TOKEN_FILE} (mode 600). Scope granted: {SCOPE}")


_access: dict = {}


def access_token() -> str:
    if _access.get("expires", 0) > datetime.now().timestamp() + 60:
        return _access["token"]
    if not TOKEN_FILE.exists():
        sys.exit(f"No token at {TOKEN_FILE}. Run: python3 scripts/seo/gsc-api.py auth")
    saved = json.loads(TOKEN_FILE.read_text())
    if saved.get("scope") != SCOPE:
        sys.exit("Saved token is not the read-only scope; refusing to use it.")
    client = load_client()
    token = post_form(TOKEN_URI, {
        "client_id": client["client_id"],
        "client_secret": client.get("client_secret", ""),
        "refresh_token": saved["refresh_token"],
        "grant_type": "refresh_token",
    })
    _access.update(token=token["access_token"], expires=datetime.now().timestamp() + token.get("expires_in", 3600))
    return _access["token"]


def api(method: str, path: str, body: dict | None = None, dry: bool = False) -> dict:
    if not any(method == m and p.match(path) for m, p in ALLOWED):
        raise PermissionError(f"Blocked: {method} {path} is not on the read-only allow-list")
    if dry:
        print(f"{method} {API}{path}" + (f"  {json.dumps(body)}" if body else ""))
        return {}
    req = urllib.request.Request(API + path, method=method, data=json.dumps(body).encode() if body else None)
    req.add_header("Authorization", f"Bearer {access_token()}")
    if body:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=60) as res:
            return json.load(res)
    except urllib.error.HTTPError as error:
        detail = json.loads(error.read() or b"{}").get("error", {})
        return {"_error": f"{error.code} {detail.get('status', '')}: {detail.get('message', '')}"}


def site_path(site: str) -> str:
    return "/webmasters/v3/sites/" + urllib.parse.quote(site, safe="")


def sites(dry: bool = False) -> list[dict]:
    data = api("GET", "/webmasters/v3/sites", dry=dry)
    entries = data.get("siteEntry", [])
    if not dry:
        if "_error" in data:
            sys.exit(data["_error"])
        for e in entries:
            print(f"{e['siteUrl']:45} {e['permissionLevel']}")
        for p in PROPERTIES:
            if p not in {e["siteUrl"] for e in entries}:
                print(f"{p:45} NOT VISIBLE to this account")
    return entries


def months_back(day: date, months: int) -> date:
    y, m = divmod(day.month - 1 - months, 12)
    return date(day.year + y, m + 1, 1)


def write_csv(path: Path, header: list[str], rows: list[list]) -> None:
    with path.open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows)


def metric_cols(r: dict) -> list:
    return [int(r["clicks"]), int(r["impressions"]), f"{r['ctr'] * 100:.2f}%", f"{r['position']:.1f}"]


def analytics(site: str, start: date, end: date, dimensions: list[str], dry: bool) -> list[dict] | str:
    rows, start_row = [], 0
    while True:
        body = {"startDate": start.isoformat(), "endDate": end.isoformat(), "dimensions": dimensions,
                "type": "web", "dataState": "final", "rowLimit": 25000, "startRow": start_row}
        data = api("POST", site_path(site) + "/searchAnalytics/query", body, dry)
        if dry:
            return []
        if "_error" in data:
            return data["_error"]
        batch = data.get("rows", [])
        rows += batch
        if len(batch) < 25000:
            return rows
        start_row += 25000


def fetch(out: Path, dry: bool) -> None:
    end = date.today() - timedelta(days=3)  # final data is typically 2-3 days behind
    start = months_back(end, 16)
    entries = {e["siteUrl"]: e["permissionLevel"] for e in sites(dry)}
    sitemap_xml = urllib.request.urlopen(f"{CANONICAL}/sitemap.xml", timeout=30).read().decode()
    paths = [urllib.parse.urlparse(u).path or "/" for u in re.findall(r"<loc>([^<]+)</loc>", sitemap_xml)]
    report = {"run": datetime.now(timezone.utc).isoformat(), "range": [start.isoformat(), end.isoformat()], "properties": {}}

    for site in PROPERTIES:
        if not dry and site not in entries:
            report["properties"][site] = {"error": "not visible to this account"}
            continue
        folder = out / site.replace("sc-domain:", "")
        if not dry:
            folder.mkdir(parents=True, exist_ok=True)
        info: dict = {"permission": entries.get(site), "files": {}}
        tables = [
            ("Dates.csv", ["date"], "Date"),
            ("Queries.csv", ["query"], "Top queries"),
            ("Pages.csv", ["page"], "Top pages"),
            ("Countries.csv", ["country"], "Country"),
            ("Devices.csv", ["device"], "Device"),
            ("QueryPage.csv", ["query", "page"], None),
            ("Branded.csv", ["brandedClassification"], "Branded classification"),
        ]
        for name, dims, label in tables:
            rows = analytics(site, start, end, dims, dry)
            if dry:
                continue
            if isinstance(rows, str):
                info["files"][name] = f"unavailable: {rows}"
                continue
            header = ([label] if label else ["Query", "Page"]) + ["Clicks", "Impressions", "CTR", "Position"]
            write_csv(folder / name, header, [r["keys"] + metric_cols(r) for r in rows])
            info["files"][name] = len(rows)
        if not dry:
            write_csv(folder / "Filters.csv", ["Filter", "Value"],
                      [["Search type", "Web"], ["Date", f"{start} to {end}"], ["Data state", "final"], ["Source", "Search Console API"]])

        smaps = api("GET", site_path(site) + "/sitemaps", dry=dry)
        if not dry:
            (folder / "sitemaps.json").write_text(json.dumps(smaps, indent=2))
            info["sitemaps"] = smaps.get("_error") or [
                {k: s.get(k) for k in ("path", "lastSubmitted", "lastDownloaded", "isPending", "warnings", "errors")}
                | {"submitted": sum(int(c.get("submitted", 0)) for c in s.get("contents", []))}
                for s in smaps.get("sitemap", [])]

        host = "https://www.chinvatbridge.com" if site.endswith(".com") else "https://www.chinvatbridge.uk"
        inspected = []
        for p in paths:
            url = host + p
            res = api("POST", "/v1/urlInspection/index:inspect", {"inspectionUrl": url, "siteUrl": site, "languageCode": "en-GB"}, dry)
            if dry:
                continue
            idx = res.get("inspectionResult", {}).get("indexStatusResult", {})
            inspected.append([url, res.get("_error", idx.get("verdict")), idx.get("coverageState"), idx.get("indexingState"),
                              idx.get("pageFetchState"), idx.get("robotsTxtState"), idx.get("googleCanonical"),
                              idx.get("userCanonical"), idx.get("lastCrawlTime"), idx.get("crawledAs"),
                              "; ".join(idx.get("sitemap", [])), "; ".join(idx.get("referringUrls", []))])
        if not dry:
            write_csv(folder / "Inspection.csv", ["URL", "Verdict", "Coverage", "Indexing", "Page fetch", "robots.txt",
                                                   "Google canonical", "User canonical", "Last crawl", "Crawled as", "Sitemaps", "Referring URLs"], inspected)
            info["inspected"] = len(inspected)
        report["properties"][site] = info

    if not dry:
        (out / "run.json").write_text(json.dumps(report, indent=2))
        print(json.dumps(report, indent=2))


def main() -> None:
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    out = Path(sys.argv[sys.argv.index("--out") + 1] if "--out" in sys.argv else
               f"~/Documents/project/artin/chinvat-gsc-data/{date.today().isoformat()}").expanduser()
    if cmd == "auth":
        auth()
    elif cmd == "sites":
        sites()
    elif cmd == "fetch":
        fetch(out, dry=False)
    elif cmd == "plan":
        fetch(out, dry=True)
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
