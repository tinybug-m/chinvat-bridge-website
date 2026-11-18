---
status: draft — for owner review, not published
slug: how-to-connect-business-systems
url: /insights/how-to-connect-business-systems
seo_title: "Connecting Business Systems That Don’t Talk"
meta_description: "A practical guide for UK SMEs: map what moves between your tools, decide where each record lives, and choose between built-in integrations, connectors and APIs."
h1: "How to connect business systems that don’t talk to each other"
primary_keyword: how to connect business systems
secondary_keywords:
  - systems that don't talk to each other
  - integrate crm and accounting software
  - api integration for small business
  - system integration for small business
  - stop double data entry
search_intent: problem-aware, moving into commercial investigation
audience: Owners and operations leads of UK SMEs retyping the same information into a CRM, accounts package, inbox and spreadsheets
funnel_stage: consideration
strategic_purpose: >
  The problem-led article for the automation cluster, built on the central positioning ("connect
  what you already have"). Shows working knowledge (sources of truth, identifiers, error handling)
  that generic competitor pages lack, and hands readers to /services/workflow-automation.
service_page: /services/workflow-automation
category: Process Automation
tags: [automation, integration, operations]
reading_minutes: 9
internal_links:
  - anchor: "workflow automation and integration"
    href: /services/workflow-automation
  - anchor: "What should you automate first?"
    href: /insights/what-should-you-automate-first
  - anchor: "a small tool of its own"
    href: /services/custom-software
external_references:
  - "ICO, data minimisation principle: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/data-minimisation/"
cta: "Describe a process → /#contact"
schema: Article, BreadcrumbList
review_notes:
  - The enquiry-to-invoice example is illustrative. Keep it framed that way.
  - Zapier and Make are named because the site already names them. Add n8n only if it is genuinely delivered.
  - Check the ICO URL resolves on the day of publishing.
---

# How to connect business systems that don’t talk to each other

Most business software can share information with other software, through a built-in integration, a connector platform or its API. The hard part is rarely the technology. It is deciding which system is the source of truth for each piece of information, and then choosing the lightest connection that will run reliably. Get those two decisions right and most "our systems don't talk to each other" problems become a series of small, manageable jobs. This is the core of our [workflow automation and integration](/services/workflow-automation) work, and the approach is the same whoever does it.

## Start with a map, not a tool

Before choosing any software, write down three things on a single page:

1. **Every system involved.** The CRM, the accounts package, the website forms, the shared inbox, the booking tool, and the spreadsheets that fill the gaps.
2. **What moves between them.** A new customer's details, an order, a job status, an invoice, a payment.
3. **Who moves it today, and how often.** "Office manager, from form email to CRM, about 20 times a week."

This map usually shows that the problem isn't ten broken connections but two or three handoffs that carry most of the manual work. Those are where to start. [What should you automate first?](/insights/what-should-you-automate-first) offers a simple way to rank them.

## Decide where each piece of information lives

Integrations go wrong most often when two systems both think they own the same record. Before connecting anything, decide the **source of truth** for each kind of information:

| Information | Usually lives in | Others should… |
|---|---|---|
| Customer contact details | CRM | Read from it, or receive updates from it |
| Invoices and payments | Accounting software | Never create invoices independently |
| Products, prices and stock | E-commerce platform or stock system | Pull prices and stock levels from it |
| Jobs, projects and their status | Job or project tool | Report status, not change it |

Once each record has one home, the connections have a clear direction. Information flows *from* its home *to* wherever else it is needed, and edits happen in one place.

## The four ways systems connect

### Built-in integrations

Many products connect directly to popular partners: an accounting package that syncs with your payment provider, a CRM that reads your email. Check each tool's integrations page first. These are usually the cheapest and best-supported option, though they only do what the vendor designed them to do.

### Connector platforms

Tools such as Zapier and Make link thousands of apps through "when this happens, do that" workflows, without code. They are quick to set up and easy to change, and they suit moderate volumes between popular tools. Their limits are per-task pricing that grows with volume, complex logic that becomes hard to follow, and error handling you have to set up deliberately.

### Direct API integration

An API is the published way one piece of software lets another read and write its data. A custom integration talks to each system's API directly, either reacting instantly through webhooks (notifications a system sends when something happens) or on a schedule. This is the right choice when there is no connector, the rules are specific to your business, the volume is high, or the workflow is critical enough to need full control over how failures are handled.

### Files, for older systems

Some industry-specific or older software has no API but can export and import files. A scheduled export, transformation and import is less elegant, but it is often perfectly reliable, and far better than retyping.

## Choosing between them

| If… | Start with |
|---|---|
| Both tools offer a native integration that does what you need | Built-in integration |
| Popular tools, simple rules, tens to hundreds of events a day | A connector platform |
| No connector exists, the rules are complex, or the volume makes per-task pricing expensive | Direct API integration |
| The workflow is business-critical (payments, orders, compliance) | Direct API integration, or a connector with deliberate monitoring |
| One system only exports files | A scheduled file-based sync |

Most businesses end up with a mixture, and that is fine. What matters is that someone knows what exists and how each piece works.

## What makes an integration reliable

These are the details that separate a connection that quietly works for years from one that breaks the first time something unusual happens.

- **A shared identifier.** Records need a reliable way to match across systems, such as a customer ID or an order number. Matching on names or email addresses alone leads to duplicates the first time someone changes their email.
- **A rule for duplicates.** Decide what happens when a record arrives that already exists: update it, skip it, or flag it for a person.
- **Field mapping, written down.** Which field goes where, in what format. Dates, phone numbers and postcodes cause more trouble than they should.
- **Failures that are loud.** Every integration eventually meets something it didn't expect: a password change, a renamed field, a system that is briefly down. It should retry where that is safe, alert someone when it can't, and keep a record of what happened. A silent failure discovered weeks later is the expensive kind.
- **Respect for limits.** APIs restrict how many requests you can make in a given period. A bulk update that ignores those limits will fail halfway through.
- **Testing with real data.** Sample data is always cleaner than the real thing. Test with a copy of real records, including the messy ones.
- **Documentation.** One page per workflow: what triggers it, what it does, where it logs, and who to call. Without this, the integration becomes a black box nobody dares change.

## Data protection when systems share data

Connecting systems moves personal data, often through a third party, so it is worth a moment's thought under UK GDPR. Pass each step only the fields it needs (the ICO calls this [data minimisation](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/data-minimisation/)), check where each platform processes and stores data, use accounts and permissions you can review, and keep your record of processing up to date.

## An illustrative example

Picture a small professional-services firm. Today an enquiry arrives through the website form; someone copies it into the CRM, emails an acknowledgement, and later re-types the client's details into the accounts package to raise the first invoice.

Connected, the same journey looks like this:

1. The form submission creates or updates the contact in the CRM (the source of truth for clients), matched on email address the first time and linked by the CRM's own ID from then on, and sends the acknowledgement.
2. When the deal is marked won in the CRM, the client is created in the accounting software using the CRM's ID, so the two records stay linked.
3. The first invoice is drafted in the accounts package for a person to check and send.
4. If any step fails, an alert goes to the office manager with the details, and nothing is lost.

Nobody retypes anything, every record has one home, and a person still approves the step that involves money.

## When connecting isn't enough

Sometimes the map shows that the real problem is a missing tool, not a missing connection. A spreadsheet has become the database, or no product handles the core of how you work. That is when a small tool of its own, built to fit your process and connected to everything else, makes more sense than another integration.

## In short

Map what moves between your systems and who moves it. Decide where each piece of information lives. Then choose the lightest reliable connection for each handoff: built-in integrations first, connector platforms for simple flows between popular tools, direct API work when the rules, volumes or stakes demand it. Build every connection to fail loudly and write down how it works.

If you have a handoff in mind, [describe the process to us](/#contact). We'll tell you whether it's a quick connection, a bigger project, or something your software can already do. Or read more about [how we approach automation projects](/services/workflow-automation), and when we'd recommend [a small tool of its own](/services/custom-software) instead.
