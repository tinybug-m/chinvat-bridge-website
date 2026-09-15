import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteShell } from "@/components/templates/SiteShell";
import { Container } from "@/components/atoms/Container";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
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
      <div className="bg-obsidian-950 py-12 lg:py-16">
        <Container className="space-y-8">
          <div>
            <span className="font-mono text-[10px] text-gold-500 uppercase tracking-technical block mb-2">
              Internal
            </span>
            <h1 className="font-serif-monument text-3xl text-parchment-50 uppercase tracking-tight">Customers</h1>
          </div>

          <div className="border border-stone-border bg-obsidian-900 overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-stone-border">
                  <th className="py-3 px-6 font-mono text-[10px] text-gold-500 uppercase tracking-technical">
                    Company
                  </th>
                  <th className="py-3 px-4 font-mono text-[10px] text-gold-500 uppercase tracking-technical">
                    Email
                  </th>
                  <th className="py-3 px-4 font-mono text-[10px] text-gold-500 uppercase tracking-technical">
                    Plan
                  </th>
                  <th className="py-3 px-4 font-mono text-[10px] text-gold-500 uppercase tracking-technical">
                    Status
                  </th>
                  <th className="py-3 px-6" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-border">
                {!customers || customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 px-6 text-center font-serif-monument text-sm text-parchment-muted">
                      No customers yet.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-obsidian-850 transition-colors">
                      <td className="py-4 px-6 font-serif-monument text-sm text-parchment-100">
                        {customer.company_name ?? "—"}
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-parchment-muted">{customer.email}</td>
                      <td className="py-4 px-4 font-mono text-xs text-parchment-muted uppercase">
                        {customer.plan_id}
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-parchment-muted uppercase">
                        {customer.status}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="font-mono text-[10px] text-gold-400 hover:text-gold-300 uppercase tracking-technical underline underline-offset-2"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Container>
      </div>
    </SiteShell>
  );
}
