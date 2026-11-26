# Windy Pup

The dog hero and chat assistant.

## Where it shows

- `/`: the classic hero. The dog appears at the contact section only (`variants/contact/HomeContact.tsx`).
- `/windy-pup`: the same homepage with the dog hero and the corner dog. Reached only by its address; `noindex`.

The chat is offered only where `isChatAvailable()` says the API will answer: in development, or in production
with `WINDY_POP_LAB_ENABLED=1` and a model key. Otherwise the pages show the dog and the plain enquiry form.

## Code

| Part | Where |
|---|---|
| Dog (3D) | `src/components/windy-pop/{WindyPopStage.tsx,scene,shaders,pose,anatomy,build}` |
| Page behaviour | `src/components/windy-pop/variants/{duo,open,contact}/` |
| Chat | `variants/minimal-chat/`, `useWindyChat.ts`, `Handoff.tsx`, `Markdown.tsx` |
| Chat server | `src/app/api/windy-pop/chat/route.ts`, `src/lib/windy-pop/` |
| No-WebGL stills | `public/windy-pop/duo/*.webp` (recapture after changing the dog's look) |

## Run it

`./scripts/windy-pop/dev.sh` serves http://localhost:3011 with a content stub (no Supabase needed). Without a model
key in `.env.local` the chat gives labelled mock replies. `LLM_API_KEY` (any OpenAI-compatible API) wins over
`GEMINI_API_KEY`; see `.env.example`.

## Before turning the chat on in production

A paid model key with a budget cap, a shared rate limit (today's is in memory, one per instance), a privacy page
note and owner approval of the "What happens next" copy.
