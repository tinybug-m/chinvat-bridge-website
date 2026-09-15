import { Bay } from "@/components/molecules/Bay";
import { ComingSoonNotice } from "@/components/molecules/ComingSoonNotice";
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
    <Bay numeral="III." title="Reports & Archive">
      {!updates || updates.length === 0 ? (
        <ComingSoonNotice>Your first update will appear here once your consultant posts one.</ComingSoonNotice>
      ) : (
        <div className="divide-y divide-stone-border">
          {updates.map((update) => (
            <div key={update.id} className="p-6 space-y-1.5">
              <span className="font-mono text-[10px] text-parchment-dim uppercase tracking-technical block">
                {formatDate(update.created_at)}
              </span>
              <h3 className="font-serif-monument text-sm text-parchment-100 font-semibold">{update.title}</h3>
              <p className="font-serif-monument text-sm text-parchment-muted leading-relaxed">{update.body}</p>
            </div>
          ))}
        </div>
      )}
    </Bay>
  );
}
