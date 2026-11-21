# Decisions for you: pricing and service commitments

**Prepared:** 21 November 2026, from the live site (`www.chinvatbridge.com`, read the same day). Register IDs T1–T4 in `SEO_REMEDIATION_REGISTER.md`.

Every choice here is a fact about how you deliver, so it is yours. I have not changed anything you'd decide below. Pricing lives in the production database (`public.plans`), so it changes only when you run the approved SQL. The other changes are code on the unpushed branch.

**How to answer:** fill in the reply template at the end, in any words. "True", "not true" or "use your fallback" is enough.

---

## Pricing (T1, and T2 depends on it)

### What one "asset" is

**Live:** Starter "8 assets / mo", Growth "15 assets / mo", Scale "35 assets / mo". The page never says what an asset is.

**Why it matters:** your published SEO cost guide warns that "very high volumes at very low prices usually mean thin or generic content". If an asset is a full article, Scale works out at about £23 an article. A buyer who has just read the guide will notice. So one of these must be true, and the page should say which:
- **An asset is smaller than an article.** For example, a mix of new articles, page rewrites and metadata updates. The page then names the mix.
- **An asset is an article.** Then 35 for £799 probably needs a lower count, or a definition of length or depth.

**Choose:** the unit name, and whether 8 / 15 / 35 stay.
**What I do then:** fill section A of `pricing-wording.sql`, add a one-line definition under the plans (`Pricing.tsx`), and make the cost guide's "What our plans cost" paragraph use the same unit.

### Starter's audit

**Live, on the same card:** "Technical SEO audit: **Basic**" and, under Core Protocols, "**Full** technical SEO audit & continuous remediation". The two contradict each other.

**Choose one:**
- **Basic.** Starter gets an initial audit and fixes issues as they arise; the full audit is Growth's step up. **Recommended,** because it keeps the plans distinct.
- **Full.** Then Growth's "Full audit" is no longer a difference, and Growth needs another one.

### Scale's audit

**Live:** Starter "Basic", Growth "Full audit", Scale "**Advanced**". "Advanced" reads as more than "Full", but nothing says what it adds.

**Choose:** what Scale's audit adds over Growth's, for example a quarterly re-audit or multi-region checks. If it adds nothing, it becomes "Full audit", the same as Growth.

### Scale's people promise

**Live:** "Dedicated senior SEO consultant" and support "Priority + lead".

**Question:** is a named senior person assigned to each Scale client, and is that person a senior SEO specialist?
- **Yes:** keep it.
- **No:** use "A named lead consultant" (if one person is a client's contact) and "Priority, with a named lead".

### Scale's automation item

**Live:** "Bespoke SEO automation & schema pipelines".

**Question:** is this delivered today, as built automation for each client?
- **Yes:** keep it, reworded as "Automated reporting and structured data at scale", if that describes it.
- **No:** remove it. Nothing replaces it.

### Growth's reworded item

**Live:** "Deep crawl architecture & dynamic schema engineering". **Proposed (Part 1, wording only):** "Full crawl, site-structure and structured-data review".

**Question:** is the proposed line the same deliverable in plain English? If not, say what the work actually is.

### Part 1 of the SQL: wording only

**What it changes:** plain-English plan descriptions, and "Also included" / "Adds" in place of "Core Protocols", "Expanded Capability" and "Full Scope". No price, Stripe ID, plan name or deliverable changes. Full text in `pricing-wording.sql`.

**Choose:**
- **Approve:** you run it in the Supabase SQL editor, or tell me to prepare it for another route. I have no database credentials and will not ask for them.
- **Edit:** say which line.

### The SEO cost guide (T2)

The article is live and contradicts `/pricing` (the asset point above). Every other statement in it matches `/pricing` and your terms.

**Choose:**
- **Keep it live, and fix `/pricing` first** with the answers above. **Recommended:** about one day's turnaround once you answer.
- **Take it back to draft now** (a one-line change, `draft: true`), and republish once pricing is fixed. That needs a deploy.

---

## Service-page commitments (T3)

Each sentence is live and promises something about how you work. For each one, answer **true** (keep it), **true with a change** (say what), or **not true** (I use the fallback, which removes the promise without inventing anything).

### AI integration: guardrails and review

**Live** (`src/data/service-pages.ts:117`, echoed in the method step at `:169` and the FAQ at `:195`):
> Where output reaches a customer or informs a decision, we build in review steps, limits on what the system may do on its own, and a record of what it did, so problems are caught early and can be traced.

**Fallback:**
> Where output reaches a customer or informs a decision, we recommend review steps, limits on what the system may do on its own and a record of what it did, and agree them with you before anything goes live.

The FAQ and method-step lines get the same change.

### Workflow automation: Zapier and Make

**Live** (`:288`):
> Built-in automation and connector platforms such as Zapier or Make are often the fastest and cheapest route, and we use them where they are reliable enough for the job.

**Question:** do you build client workflows on Zapier or Make?

**Fallback:**
> Built-in automation and connector platforms such as Zapier or Make are often the fastest and cheapest route, and where one is reliable enough for the job, we'll tell you.

### Workflow automation: alerts, logs and documentation

**Live** (`:304`):
> We build in alerts and logs, and write down how each workflow works, so it doesn't become a black box nobody dares touch.

**Fallback:**
> We agree with you how each workflow reports problems and how it is documented, so it doesn't become a black box nobody dares touch.

### Workflow automation: failing loudly

**Live** (`:382`, FAQ):
> We build workflows to fail loudly rather than silently: errors raise an alert, failed steps can be retried, and there is a record of what happened. We also document how each workflow works, so you are not dependent on one person remembering.

**Question:** does every workflow you deliver have alerts on errors, retryable steps and a run log? All three are promised here.

**Fallback:**
> We plan for failure from the start: how errors are reported, what happens to a failed step, and how the workflow is documented, so you are not dependent on one person remembering.

### Custom software: testing with users

**Live** (`:536`):
> We design around the staff and customers who will use the software every day, and test it with them before it replaces anything.

**Fallback:**
> We design around the staff and customers who will use the software every day.

### Custom software: short cycles

**Live** (`:544`, method step):
> Design, development and integration in short cycles, shown to you as it takes shape.

**Fallback:**
> Design, development and integration, shown to you at agreed points as it takes shape.

---

## Privacy-policy line (T4)

**Live** (`src/app/(pages)/privacy/page.tsx`):
> With a message you send us, the page you were reading, the first page of your visit (including any campaign tags in the link you followed), and the name of the website that referred you, if any, so we know what prompted it. The page keeps this in memory while you browse; nothing is saved to your device.

**Accuracy against the code:** accurate, including after this branch's sanitiser fix.

**What I can't settle:** whether the policy as a whole meets UK GDPR (lawful basis, retention). That needs your judgement or legal advice.

**Choose:** approve as written, or edit.

---

## Reply template

```
Asset unit:                 [name]; counts 8/15/35 [stay | change to …]
Starter audit:              [Basic | Full]
Scale audit adds:           [… | nothing → "Full audit"]
Dedicated senior consultant:[true | not true → named lead | remove]
Automation & schema pipelines: [delivered | remove]
Growth reworded item:       [same | actually …]
SQL Part 1:                 [approve | edit …]
Cost guide:                 [fix pricing first | back to draft now]
AI guardrails:              [true | change … | fallback]
Zapier / Make:              [true | fallback]
Alerts, logs, docs:         [true | fallback]
Fail loudly:                [true | fallback]
Test with users:            [true | fallback]
Short cycles:               [true | fallback]
Privacy line:               [approve | edit …]
```
