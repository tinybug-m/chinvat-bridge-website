import { Bay } from "@/components/molecules/Bay";
import { ComingSoonNotice } from "@/components/molecules/ComingSoonNotice";
import { createClient } from "@/lib/supabase/server";

const STATUS_CLASSES: Record<string, string> = {
  Complete: "border-gold-500 text-gold-400",
  "In Review": "border-stone-borderLight text-parchment-100",
  "In Progress": "border-gold-500/50 text-gold-300",
  Scheduled: "border-stone-border text-parchment-dim",
};

const DEFAULT_STATUS_CLASS = "border-stone-border text-parchment-dim";

export async function RealSprintLog({ customerId }: { customerId: string }) {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("customer_sprint_items")
    .select("*")
    .eq("customer_id", customerId)
    .order("sort_order");

  return (
    <Bay numeral="II." title="Current Sprint">
      {!items || items.length === 0 ? (
        <ComingSoonNotice>Your current sprint will appear here once your consultant sets it up.</ComingSoonNotice>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-stone-border">
                <th className="py-3 px-6 font-mono text-[10px] text-gold-500 uppercase tracking-technical">
                  Deliverable
                </th>
                <th className="py-3 px-4 font-mono text-[10px] text-gold-500 uppercase tracking-technical">
                  Status
                </th>
                <th className="py-3 px-6 font-mono text-[10px] text-gold-500 uppercase tracking-technical">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-border">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-obsidian-850 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-serif-monument text-sm text-parchment-100">{item.title}</div>
                    <div className="font-mono text-[10px] text-parchment-dim mt-0.5">{item.detail}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 border font-mono text-[10px] uppercase tracking-technical ${STATUS_CLASSES[item.status] ?? DEFAULT_STATUS_CLASS}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-[10px] text-parchment-dim uppercase tracking-technical">
                    {item.item_date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Bay>
  );
}
