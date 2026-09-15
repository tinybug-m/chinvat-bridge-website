import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteShell } from "@/components/templates/SiteShell";
import { Container } from "@/components/atoms/Container";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanById } from "@/data/pricing";
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

const INPUT = "w-full bg-obsidian-900 border border-stone-borderLight px-3 py-2 font-sans text-sm text-parchment-100 focus:border-gold-500 transition-colors rounded-sm";
const LABEL = "block font-mono text-[9px] text-parchment-dim uppercase tracking-technical mb-1";
const SAVE_BUTTON = "font-mono text-[10px] text-obsidian-950 bg-gold-500 hover:brightness-110 uppercase tracking-technical px-4 py-2 rounded-sm";
const DELETE_BUTTON = "font-mono text-[10px] text-red-400 hover:text-red-300 uppercase tracking-technical px-3 py-2";

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
      <div className="bg-obsidian-950 py-12 lg:py-16">
        <Container className="space-y-10 max-w-4xl">
          <div>
            <Link href="/admin" className="font-mono text-[10px] text-gold-400 hover:text-gold-300 uppercase tracking-technical">
              &larr; All Customers
            </Link>
            <h1 className="font-serif-monument text-3xl text-parchment-50 uppercase tracking-tight mt-2">
              {customer.company_name ?? customer.email}
            </h1>
            <p className="font-mono text-xs text-parchment-dim mt-1">
              {customer.email} — {plan ? `${plan.name} (${plan.priceLabel}${plan.billingPeriod})` : customer.plan_id}
            </p>
          </div>

          <section className="border border-stone-border bg-obsidian-900 p-6 space-y-4">
            <h2 className="font-mono text-[10px] text-gold-500 uppercase tracking-technical font-semibold">
              Engagement Details
            </h2>
            <form action={updateCustomerDetails} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <input type="hidden" name="customerId" value={customer.id} />
              <div>
                <label className={LABEL}>Next Billing</label>
                <input className={INPUT} name="nextBillingDate" defaultValue={customer.next_billing_date ?? ""} placeholder="1st of each month" />
              </div>
              <div>
                <label className={LABEL}>Practice Lead</label>
                <input className={INPUT} name="practiceLead" defaultValue={customer.practice_lead ?? ""} placeholder="Alex Rowan" />
              </div>
              <div>
                <label className={LABEL}>Status</label>
                <select className={INPUT} name="status" defaultValue={customer.status}>
                  <option value="active">Active</option>
                  <option value="past_due">Past Due</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <button type="submit" className={SAVE_BUTTON}>Save</button>
              </div>
            </form>
          </section>

          <section className="border border-stone-border bg-obsidian-900 p-6 space-y-6">
            <h2 className="font-mono text-[10px] text-gold-500 uppercase tracking-technical font-semibold">
              Project Progress
            </h2>
            <div className="space-y-4">
              {(progressItems ?? []).map((item) => (
                <form key={item.id} action={upsertProgressItem} className="border border-stone-border p-4 space-y-3">
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="customerId" value={customer.id} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={LABEL}>Label</label>
                      <input className={INPUT} name="label" defaultValue={item.label} required />
                    </div>
                    <div>
                      <label className={LABEL}>Status Label</label>
                      <input className={INPUT} name="statusLabel" defaultValue={item.status_label} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className={LABEL}>Percent Label</label>
                      <input className={INPUT} name="percentLabel" defaultValue={item.percent_label} required />
                    </div>
                    <div>
                      <label className={LABEL}>Total Steps</label>
                      <input className={INPUT} type="number" min="1" name="totalSteps" defaultValue={item.total_steps} />
                    </div>
                    <div>
                      <label className={LABEL}>Completed</label>
                      <input className={INPUT} type="number" min="0" name="completedSteps" defaultValue={item.completed_steps} />
                    </div>
                    <div>
                      <label className={LABEL}>Sort Order</label>
                      <input className={INPUT} type="number" name="sortOrder" defaultValue={item.sort_order} />
                    </div>
                  </div>
                  <div>
                    <label className={LABEL}>Note</label>
                    <input className={INPUT} name="note" defaultValue={item.note ?? ""} />
                  </div>
                  <div className="flex items-center justify-between">
                    <button type="submit" className={SAVE_BUTTON}>Save</button>
                    <button type="submit" formAction={deleteProgressItem} className={DELETE_BUTTON}>Delete</button>
                  </div>
                </form>
              ))}

              <form action={upsertProgressItem} className="border border-dashed border-stone-borderLight p-4 space-y-3">
                <input type="hidden" name="customerId" value={customer.id} />
                <p className="font-mono text-[9px] text-gold-500 uppercase tracking-technical">Add New</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>Label</label>
                    <input className={INPUT} name="label" placeholder="Content Assets" required />
                  </div>
                  <div>
                    <label className={LABEL}>Status Label</label>
                    <input className={INPUT} name="statusLabel" placeholder="6 / 15 Completed" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className={LABEL}>Percent Label</label>
                    <input className={INPUT} name="percentLabel" placeholder="40% Complete" required />
                  </div>
                  <div>
                    <label className={LABEL}>Total Steps</label>
                    <input className={INPUT} type="number" min="1" name="totalSteps" defaultValue={1} />
                  </div>
                  <div>
                    <label className={LABEL}>Completed</label>
                    <input className={INPUT} type="number" min="0" name="completedSteps" defaultValue={0} />
                  </div>
                  <div>
                    <label className={LABEL}>Sort Order</label>
                    <input className={INPUT} type="number" name="sortOrder" defaultValue={(progressItems?.length ?? 0) + 1} />
                  </div>
                </div>
                <div>
                  <label className={LABEL}>Note</label>
                  <input className={INPUT} name="note" placeholder="Optional detail shown under the bar" />
                </div>
                <button type="submit" className={SAVE_BUTTON}>Add Item</button>
              </form>
            </div>
          </section>

          <section className="border border-stone-border bg-obsidian-900 p-6 space-y-6">
            <h2 className="font-mono text-[10px] text-gold-500 uppercase tracking-technical font-semibold">
              Current Sprint
            </h2>
            <div className="space-y-4">
              {(sprintItems ?? []).map((item) => (
                <form key={item.id} action={upsertSprintItem} className="border border-stone-border p-4 space-y-3">
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="customerId" value={customer.id} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={LABEL}>Title</label>
                      <input className={INPUT} name="title" defaultValue={item.title} required />
                    </div>
                    <div>
                      <label className={LABEL}>Detail</label>
                      <input className={INPUT} name="detail" defaultValue={item.detail} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className={LABEL}>Status</label>
                      <select className={INPUT} name="status" defaultValue={item.status}>
                        <option>Scheduled</option>
                        <option>In Progress</option>
                        <option>In Review</option>
                        <option>Complete</option>
                      </select>
                    </div>
                    <div>
                      <label className={LABEL}>Date</label>
                      <input className={INPUT} name="itemDate" defaultValue={item.item_date} placeholder="14 Sep 2026" required />
                    </div>
                    <div>
                      <label className={LABEL}>Sort Order</label>
                      <input className={INPUT} type="number" name="sortOrder" defaultValue={item.sort_order} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <button type="submit" className={SAVE_BUTTON}>Save</button>
                    <button type="submit" formAction={deleteSprintItem} className={DELETE_BUTTON}>Delete</button>
                  </div>
                </form>
              ))}

              <form action={upsertSprintItem} className="border border-dashed border-stone-borderLight p-4 space-y-3">
                <input type="hidden" name="customerId" value={customer.id} />
                <p className="font-mono text-[9px] text-gold-500 uppercase tracking-technical">Add New</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>Title</label>
                    <input className={INPUT} name="title" placeholder="Schema Markup Implementation" required />
                  </div>
                  <div>
                    <label className={LABEL}>Detail</label>
                    <input className={INPUT} name="detail" placeholder="Structured data for key page templates" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={LABEL}>Status</label>
                    <select className={INPUT} name="status" defaultValue="Scheduled">
                      <option>Scheduled</option>
                      <option>In Progress</option>
                      <option>In Review</option>
                      <option>Complete</option>
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>Date</label>
                    <input className={INPUT} name="itemDate" placeholder="14 Sep 2026" required />
                  </div>
                  <div>
                    <label className={LABEL}>Sort Order</label>
                    <input className={INPUT} type="number" name="sortOrder" defaultValue={(sprintItems?.length ?? 0) + 1} />
                  </div>
                </div>
                <button type="submit" className={SAVE_BUTTON}>Add Item</button>
              </form>
            </div>
          </section>

          <section className="border border-stone-border bg-obsidian-900 p-6 space-y-6">
            <h2 className="font-mono text-[10px] text-gold-500 uppercase tracking-technical font-semibold">
              Reports &amp; Updates
            </h2>
            <div className="space-y-4">
              {(updates ?? []).map((update) => (
                <div key={update.id} className="border border-stone-border p-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[9px] text-parchment-dim uppercase tracking-technical">
                      {new Date(update.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <p className="font-serif-monument text-sm text-parchment-100 font-semibold">{update.title}</p>
                    <p className="font-serif-monument text-sm text-parchment-muted">{update.body}</p>
                  </div>
                  <form action={deleteCustomerUpdate}>
                    <input type="hidden" name="id" value={update.id} />
                    <input type="hidden" name="customerId" value={customer.id} />
                    <button type="submit" className={DELETE_BUTTON}>Delete</button>
                  </form>
                </div>
              ))}

              <form action={addCustomerUpdate} className="border border-dashed border-stone-borderLight p-4 space-y-3">
                <input type="hidden" name="customerId" value={customer.id} />
                <p className="font-mono text-[9px] text-gold-500 uppercase tracking-technical">Post New Update</p>
                <div>
                  <label className={LABEL}>Title</label>
                  <input className={INPUT} name="title" placeholder="Onboarding call scheduled" required />
                </div>
                <div>
                  <label className={LABEL}>Body</label>
                  <textarea className={INPUT} name="body" rows={3} placeholder="What happened, what's next..." required />
                </div>
                <button type="submit" className={SAVE_BUTTON}>Post Update</button>
              </form>
            </div>
          </section>
        </Container>
      </div>
    </SiteShell>
  );
}
