#!/bin/sh
# Builds an isolated copy of the site with the prototype router. The working tree is not touched:
# the repo is copied (without .git, .next, prototypes) to DEST, the patch and the prototype files are
# applied there, and the copy is built.
#
#   prototypes/curve-system/visual-review/prototype/setup.sh [DEST]
#   cd DEST && ./node_modules/.bin/next start -p 3400
#   open http://localhost:3400/?wire=next   (or ?wire=p1 for Phase 1, ?wire=prod for production)
#
# The patch is against the Phase 1 working tree (uncommitted at the time of writing).
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
REPO=$(cd "$HERE/../../../.." && pwd)
DEST=${1:-$(mktemp -d)/site}
mkdir -p "$DEST"
cd "$REPO"
tar --exclude=./node_modules --exclude=./.next --exclude=./.git --exclude=./prototypes \
  --exclude=./test-results --exclude=./.overnight --exclude=./.playwright-mcp --exclude=./.sentry-native \
  -cf - . | tar -xf - -C "$DEST"
cp -a node_modules "$DEST/"
cd "$DEST"
patch -p1 < "$HERE/prototype.patch"
cp "$HERE/route-next.ts" "$HERE/ink.ts" "$HERE/route-prod.ts" src/components/home/services/energy/
./node_modules/.bin/next build
echo "Built in $DEST. Start: cd $DEST && ./node_modules/.bin/next start -p 3400"
