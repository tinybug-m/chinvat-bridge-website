import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteShell } from "@/components/templates/SiteShell";
import { Container } from "@/components/system/Container";
import { PageHeader } from "@/components/system/PageHeader";
import { Button } from "@/components/system/Button";
import { Panel } from "@/components/portal/Panel";
import {
  AdminInput,
  AdminSelect,
  AdminTextarea,
  DELETE_CLASS,
  NEW_CARD,
  RECORD_CARD,
} from "@/components/portal/AdminFields";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanById } from "@/data/pricing";
import { cn } from "@/lib/utils";
import {
  updateCustomerDetails,
  upsertProgressItem,
  deleteProgressItem,
  upsertSprintItem,
  deleteSprintItem,
  addCustomerUpdate,
  deleteCustomerUpdate,
} from "@/actions/admin";

export const metadata: Metadata = {
  title: "Manage Customer",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCustomerPage({ params }: PageProps) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/login");
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: customer } = await supabase.from("customers").select("*").eq("id", id).maybeSingle();
  if (!customer) {
    notFound();
  }

  const [plan, { data: progressItems }, { data: sprintItems }, { data: updates }] = await Promise.all([
    getPlanById(customer.plan_id),
    supabase.from("customer_progress_items").select("*").eq("customer_id", id).order("sort_order"),
    supabase.from("customer_sprint_items").select("*").eq("customer_id", id).order("sort_order"),
    supabase.from("customer_updates").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
  ]);

  return (
    <SiteShell>
      <PageHeader
        kicker={
          <Link
            href="/admin"
            className="inline-flex min-h-11 items-center gap-2 text-cobalt-700 underline decoration-cobalt-700/35 underline-offset-[0.22em] hover:decoration-cobalt-700"
          >
            <span aria-hidden="true">&larr;</span> All customers
          </Link>
        }
        title={customer.company_name ?? customer.email}
        lede={`${customer.email} — ${plan ? `${plan.name} (${plan.priceLabel}${plan.billingPeriod})` : customer.plan_id}`}
        compact
        className="[&_h1]:break-words"
      />

      <Container className="pt-10 pb-section lg:pt-14">
        <div className="max-w-4xl space-y-6 lg:space-y-8">
          <Panel title="Engagement details">
            <form action={updateCustomerDetails} className="grid grid-cols-1 items-end gap-4 px-5 py-5 sm:grid-cols-3 sm:px-6">
              <input type="hidden" name="customerId" value={customer.id} />
              <AdminInput label="Next billing" name="nextBillingDate" defaultValue={customer.next_billing_date ?? ""} placeholder="1st of each month" />
              <AdminInput label="Practice lead" name="practiceLead" defaultValue={customer.practice_lead ?? ""} placeholder="Alex Rowan" />
              <AdminSelect label="Status" name="status" defaultValue={customer.status}>
                <option value="active">Active</option>
                <option value="past_due">Past due</option>
                <option value="cancelled">Cancelled</option>
              </AdminSelect>
              <div className="sm:col-span-3">
                <Button type="submit">Save</Button>
              </div>
            </form>
          </Panel>

          <Panel title="Project progress">
            <div className="space-y-4 px-5 py-5 sm:px-6">
              {(progressItems ?? []).map((item) => (
                <form key={item.id} action={upsertProgressItem} className={RECORD_CARD}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="customerId" value={customer.id} />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <AdminInput label="Label" name="label" defaultValue={item.label} required />
                    <AdminInput label="Status label" name="statusLabel" defaultValue={item.status_label} required />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <AdminInput label="Percent label" name="percentLabel" defaultValue={item.percent_label} required />
                    <AdminInput label="Total steps" type="number" min="1" name="totalSteps" defaultValue={item.total_steps} />
                    <AdminInput label="Completed" type="number" min="0" name="completedSteps" defaultValue={item.completed_steps} />
                    <AdminInput label="Sort order" type="number" name="sortOrder" defaultValue={item.sort_order} />
                  </div>
                  <AdminInput label="Note" name="note" defaultValue={item.note ?? ""} />
                  <div className="flex items-center justify-between gap-4">
                    <Button type="submit">Save</Button>
                    <button type="submit" formAction={deleteProgressItem} className={DELETE_CLASS}>Delete</button>
                  </div>
                </form>
              ))}

              <form action={upsertProgressItem} className={NEW_CARD}>
                <input type="hidden" name="customerId" value={customer.id} />
                <h3 className="text-small font-medium text-ink-soft">Add new</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <AdminInput label="Label" name="label" placeholder="Content Assets" required />
                  <AdminInput label="Status label" name="statusLabel" placeholder="6 / 15 Completed" required />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <AdminInput label="Percent label" name="percentLabel" placeholder="40% Complete" required />
                  <AdminInput label="Total steps" type="number" min="1" name="totalSteps" defaultValue={1} />
                  <AdminInput label="Completed" type="number" min="0" name="completedSteps" defaultValue={0} />
                  <AdminInput label="Sort order" type="number" name="sortOrder" defaultValue={(progressItems?.length ?? 0) + 1} />
                </div>
                <AdminInput label="Note" name="note" placeholder="Optional detail shown under the bar" />
                <Button type="submit" variant="secondary">Add item</Button>
              </form>
            </div>
          </Panel>

          <Panel title="Current sprint">
            <div className="space-y-4 px-5 py-5 sm:px-6">
              {(sprintItems ?? []).map((item) => (
                <form key={item.id} action={upsertSprintItem} className={RECORD_CARD}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="customerId" value={customer.id} />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <AdminInput label="Title" name="title" defaultValue={item.title} required />
                    <AdminInput label="Detail" name="detail" defaultValue={item.detail} required />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <AdminSelect label="Status" name="status" defaultValue={item.status}>
                      <option>Scheduled</option>
                      <option>In Progress</option>
                      <option>In Review</option>
                      <option>Complete</option>
                    </AdminSelect>
                    <AdminInput label="Date" name="itemDate" defaultValue={item.item_date} placeholder="14 Sep 2026" required />
                    <AdminInput label="Sort order" type="number" name="sortOrder" defaultValue={item.sort_order} />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <Button type="submit">Save</Button>
                    <button type="submit" formAction={deleteSprintItem} className={DELETE_CLASS}>Delete</button>
                  </div>
                </form>
              ))}

              <form action={upsertSprintItem} className={NEW_CARD}>
                <input type="hidden" name="customerId" value={customer.id} />
                <h3 className="text-small font-medium text-ink-soft">Add new</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <AdminInput label="Title" name="title" placeholder="Schema Markup Implementation" required />
                  <AdminInput label="Detail" name="detail" placeholder="Structured data for key page templates" required />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <AdminSelect label="Status" name="status" defaultValue="Scheduled">
                    <option>Scheduled</option>
                    <option>In Progress</option>
                    <option>In Review</option>
                    <option>Complete</option>
                  </AdminSelect>
                  <AdminInput label="Date" name="itemDate" placeholder="14 Sep 2026" required />
                  <AdminInput label="Sort order" type="number" name="sortOrder" defaultValue={(sprintItems?.length ?? 0) + 1} />
                </div>
                <Button type="submit" variant="secondary">Add item</Button>
              </form>
            </div>
          </Panel>

          <Panel title="Reports & updates">
            <div className="space-y-4 px-5 py-5 sm:px-6">
              {(updates ?? []).map((update) => (
                <div key={update.id} className={cn(RECORD_CARD, "flex items-start justify-between gap-4 space-y-0")}>
                  <div className="min-w-0">
                    <p className="text-small text-ink-muted">
                      {new Date(update.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <p className="mt-1 text-body font-medium text-ink">{update.title}</p>
                    <p className="mt-1 text-small text-pretty text-ink-soft">{update.body}</p>
                  </div>
                  <form action={deleteCustomerUpdate} className="shrink-0">
                    <input type="hidden" name="id" value={update.id} />
                    <input type="hidden" name="customerId" value={customer.id} />
                    <button type="submit" className={DELETE_CLASS}>Delete</button>
                  </form>
                </div>
              ))}

              <form action={addCustomerUpdate} className={NEW_CARD}>
                <input type="hidden" name="customerId" value={customer.id} />
                <h3 className="text-small font-medium text-ink-soft">Post new update</h3>
                <AdminInput label="Title" name="title" placeholder="Onboarding call scheduled" required />
                <AdminTextarea label="Body" name="body" rows={3} placeholder="What happened, what's next..." required />
                <Button type="submit" variant="secondary">Post update</Button>
              </form>
            </div>
          </Panel>
        </div>
      </Container>
    </SiteShell>
  );
}
