import { ComingSoonNotice } from "@/components/molecules/ComingSoonNotice";
import { Panel } from "@/components/portal/Panel";
import { createClient } from "@/lib/supabase/server";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export async function RealUpdatesArchive({ customerId }: { customerId: string }) {
  const supabase = await createClient();
  const { data: updates } = await supabase
    .from("customer_updates")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  return (
    <Panel title="Reports & archive">
      {!updates || updates.length === 0 ? (
        <ComingSoonNotice>Your first update will appear here once your consultant posts one.</ComingSoonNotice>
      ) : (
        <ol className="divide-y divide-line">
          {updates.map((update) => (
            <li key={update.id} className="px-5 py-5 sm:px-6">
              <time dateTime={update.created_at} className="block text-small text-ink-muted">
                {formatDate(update.created_at)}
              </time>
              <h3 className="mt-1 text-body font-medium text-ink">{update.title}</h3>
              <p className="mt-1 text-small text-pretty text-ink-soft">{update.body}</p>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
