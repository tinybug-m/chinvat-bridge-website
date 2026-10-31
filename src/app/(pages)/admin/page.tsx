import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteShell } from "@/components/templates/SiteShell";
import { Container } from "@/components/system/Container";
import { PageHeader } from "@/components/system/PageHeader";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  past_due: "Past due",
  cancelled: "Cancelled",
};

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/login");
  }

  const supabase = createAdminClient();
  const { data: customers } = await supabase
    .from("customers")
    .select("id, email, company_name, plan_id, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <SiteShell>
      <PageHeader kicker="Internal" title="Customers" compact />
      <Container className="pt-10 pb-section lg:pt-14">
        <div className="overflow-x-auto rounded-[2px] border border-line bg-paper-raised">
          <table className="w-full min-w-[40rem] border-collapse text-left">
            <caption className="sr-only">Customers, newest first</caption>
            <thead>
              <tr className="border-b border-line text-small text-ink-muted">
                <th scope="col" className="py-3 pr-4 pl-6 font-medium">
                  Company
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Email
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Plan
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="py-3 pr-6 pl-4">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {!customers || customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-small text-ink-muted">
                    No customers yet.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="transition-colors hover:bg-paper">
                    <td className="py-3 pr-4 pl-6 text-small font-medium text-ink">{customer.company_name ?? "—"}</td>
                    <td className="px-4 py-3 text-small break-all text-ink-soft">{customer.email}</td>
                    <td className="px-4 py-3 text-small text-ink-soft capitalize">{customer.plan_id}</td>
                    <td className="px-4 py-3 text-small text-ink-soft">
                      {STATUS_LABELS[customer.status] ?? customer.status}
                    </td>
                    <td className="py-1 pr-6 pl-4 text-right">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="inline-flex min-h-11 items-center text-small font-medium text-cobalt-700 underline decoration-cobalt-700/35 underline-offset-[0.22em] hover:decoration-cobalt-700"
                      >
                        Manage
                        <span className="sr-only">&nbsp;{customer.company_name ?? customer.email}</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Container>
    </SiteShell>
  );
}
