#!/usr/bin/env bash
# overnight.sh — keeps Claude Code improving the website until morning.
#
# Each loop: Claude Code does one focused improvement (following OVERNIGHT_TASK.md),
# then this script runs the build. Build passes -> commit. Build fails -> revert,
# and the error is handed to the next run. Repeats until STOP_AT.
#
# Usage (from the website's repo root):
#   chmod +x overnight.sh
#   ./overnight.sh                        # runs until 07:00
#   STOP_AT=08:30 ./overnight.sh          # custom stop time
#   MODEL=opus ./overnight.sh             # pick a model
#
# Stop early at any time:  touch .overnight/STOP   (finishes the current run first)
# Or press Ctrl+C.

set -uo pipefail

STOP_AT="${STOP_AT:-07:00}"
BRANCH="${BRANCH:-overnight-redesign}"
MAX_TURNS="${MAX_TURNS:-80}"          # max agent steps per run
PROMPT_FILE="${PROMPT_FILE:-OVERNIGHT_TASK.md}"
MODEL="${MODEL:-}"                    # optional: opus, sonnet, ...
BUDGET="${BUDGET:-}"                  # optional, API billing only: max USD per run, e.g. 3
LIMIT_WAIT_MIN="${LIMIT_WAIT_MIN:-15}" # wait this long when a usage/rate limit is hit

DIR=".overnight"
LOG_DIR="$DIR/logs"
FAIL_FILE="$DIR/last-failure.txt"
SUMMARY_FILE="$DIR/last-summary.txt"
STOP_FILE="$DIR/STOP"

# Keep a Mac awake all night.
if [[ "$OSTYPE" == darwin* && -z "${CAFFEINATED:-}" ]] && command -v caffeinate >/dev/null; then
  CAFFEINATED=1 exec caffeinate -dimsu "$0" "$@"
fi

say() { echo "[$(date '+%H:%M:%S')] $*"; }
die() { say "ERROR: $*"; exit 1; }

# ---------- preflight ----------
command -v claude >/dev/null || die "Claude Code ('claude') is not installed or not on PATH."
command -v git >/dev/null    || die "git is required."
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || die "Run this from inside your website's git repo."
[[ -f "$PROMPT_FILE" ]] || die "Can't find $PROMPT_FILE in $(pwd)."
[[ -z "$(git status --porcelain)" ]] || die "Working tree has uncommitted changes. Commit or stash them first."

if   [[ -f pnpm-lock.yaml ]];               then PM=pnpm; ADD=add
elif [[ -f yarn.lock ]];                    then PM=yarn; ADD=add
elif [[ -f bun.lockb || -f bun.lock ]];     then PM=bun;  ADD=add
else                                             PM=npm;  ADD=install
fi

has_script() {
  [[ -f package.json ]] || return 1
  node -e "const s=require('./package.json').scripts||{}; process.exit(s['$1']?0:1)" 2>/dev/null
}

# Stop time as epoch seconds (works with GNU date and macOS date).
if t=$(date -d "today $STOP_AT" +%s 2>/dev/null); then :; else
  t=$(date -j -f "%H:%M" "$STOP_AT" +%s 2>/dev/null) || die "STOP_AT must look like 07:00"
fi
(( t <= $(date +%s) )) && t=$(( t + 86400 ))
STOP_EPOCH=$t

# Work on a separate branch so your main branch is untouched.
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git checkout -q "$BRANCH" || die "Couldn't switch to $BRANCH"
else
  git checkout -q -b "$BRANCH" || die "Couldn't create $BRANCH"
fi
START_SHA=$(git rev-parse HEAD)

mkdir -p "$LOG_DIR"
EXCLUDE="$(git rev-parse --git-path info/exclude)"
mkdir -p "$(dirname "$EXCLUDE")"
for p in ".overnight/logs/" ".overnight/last-failure.txt" ".overnight/last-summary.txt" ".overnight/STOP"; do
  grep -qxF "$p" "$EXCLUDE" 2>/dev/null || echo "$p" >> "$EXCLUDE"
done
rm -f "$STOP_FILE"

verify() {  # $1 = iteration label
  local out="$LOG_DIR/verify-$1.log"
  : > "$out"
  local s
  for s in typecheck build; do
    if has_script "$s"; then
      echo "== $PM run $s" >> "$out"
      if ! "$PM" run "$s" >> "$out" 2>&1; then
        { echo "The '$PM run $s' step failed after your last run. Last lines of output:"; echo; tail -n 80 "$out"; } > "$FAIL_FILE"
        return 1
      fi
    fi
  done
  if has_script lint; then   # lint is advisory only, it never blocks a commit
    "$PM" run lint >> "$out" 2>&1 || echo "(lint reported problems — advisory only)" >> "$out"
  fi
  rm -f "$FAIL_FILE"
  return 0
}

say "Checking the build works before starting..."
verify "baseline" || die "Your build already fails before any changes. Fix it first (see $LOG_DIR/verify-baseline.log)."

# Tools Claude may use without asking. Anything else is automatically denied,
# so the run never freezes waiting for approval.
ALLOWED=(
  "Read" "Edit" "Write" "Glob" "Grep"
  "Bash($PM run *)"
  "Bash($PM $ADD @fontsource*)"
  "Bash($PM $ADD next-themes*)"
  "Bash(node scripts/*)"
  "Bash(npx tsc *)"
  "Bash(ls *)"
  "Bash(git status)"
  "Bash(git diff *)"
  "Bash(git log *)"
)
EXTRA=()
[[ -n "$MODEL"  ]] && EXTRA+=(--model "$MODEL")
[[ -n "$BUDGET" ]] && EXTRA+=(--max-budget-usd "$BUDGET")

say "Branch: $BRANCH | package manager: $PM | stopping at $STOP_AT"
say "To stop early: touch $STOP_FILE"

i=0; ok=0; reverted=0
while (( $(date +%s) < STOP_EPOCH )); do
  [[ -f "$STOP_FILE" ]] && { say "STOP file found, finishing."; break; }

  i=$(( i + 1 ))
  label=$(printf '%03d' "$i")
  log="$LOG_DIR/run-$label.log"
  mins_left=$(( (STOP_EPOCH - $(date +%s)) / 60 ))
  rm -f "$SUMMARY_FILE"

  prompt="$(cat "$PROMPT_FILE")

---
Run number: $i. About $mins_left minutes remain tonight.
Package manager: $PM (install font packages with: $PM $ADD <package>)."

  say "Run #$i started (log: $log)"
  claude -p "$prompt" \
    --permission-mode dontAsk \
    --max-turns "$MAX_TURNS" \
    ${EXTRA[@]+"${EXTRA[@]}"} \
    --allowedTools "${ALLOWED[@]}" \
    > "$log" 2>&1
  status=$?

  if [[ -z "$(git status --porcelain)" ]]; then
    if (( status != 0 )) && grep -Eiq "usage limit|rate limit|limit reached|overloaded|429|529" "$log"; then
      say "Usage/rate limit hit. Waiting $LIMIT_WAIT_MIN minutes..."
      i=$(( i - 1 ))
      sleep $(( LIMIT_WAIT_MIN * 60 ))
    else
      say "Run #$i made no changes (exit $status)."
      sleep 20
    fi
    continue
  fi

  if verify "$label"; then
    summary="$(head -n 1 "$SUMMARY_FILE" 2>/dev/null)"
    msg="overnight #$i: ${summary:-website improvements}"
    git add -A
    git commit -q -m "$msg" || git commit -q --no-verify -m "$msg"
    ok=$(( ok + 1 ))
    say "Run #$i committed: ${summary:-website improvements}"
  else
    git reset -q --hard HEAD
    git clean -q -fd
    reverted=$(( reverted + 1 ))
    say "Run #$i broke the build — reverted. The next run will see the error."
  fi

  sleep 10
done

say "Done. $ok runs committed, $reverted reverted."
echo
echo "What changed tonight (branch $BRANCH):"
git log --oneline "$START_SHA..HEAD"
echo
echo "Review:  git diff $START_SHA..HEAD --stat    and read .overnight/PROGRESS.md"
echo "Happy?   git checkout <your-main-branch> && git merge $BRANCH"
