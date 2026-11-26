#!/usr/bin/env bash
# Starts a local preview: the content stub, then `next dev` pointed at it. No real credentials.
set -euo pipefail
cd "$(dirname "$0")/../.."
STUB_PORT=${STUB_PORT:-54911}
PORT=${PORT:-3011}
# Without a model key (Gemini or LLM_API_KEY) (in the shell or .env.local) the chat gives clearly labelled mock replies.
if [ -z "${GEMINI_API_KEY:-}${LLM_API_KEY:-}" ] && ! grep -qE '^(GEMINI|LLM)_API_KEY=.+' .env.local 2>/dev/null; then
  export WINDY_POP_MOCK="${WINDY_POP_MOCK:-1}"
fi
node scripts/windy-pop/content-stub.mjs &
trap 'kill $!' EXIT
NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:$STUB_PORT" NEXT_PUBLIC_SUPABASE_ANON_KEY=lab-placeholder pnpm exec next dev -p "$PORT"
