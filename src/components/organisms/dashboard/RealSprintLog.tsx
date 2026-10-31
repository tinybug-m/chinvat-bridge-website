import { ComingSoonNotice } from "@/components/molecules/ComingSoonNotice";
import { Panel } from "@/components/portal/Panel";
import { SprintTable } from "@/components/portal/SprintTable";
import { createClient } from "@/lib/supabase/server";

export async function RealSprintLog({ customerId }: { customerId: string }) {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("customer_sprint_items")
    .select("*")
    .eq("customer_id", customerId)
    .order("sort_order");

  return (
    <Panel title="Current sprint">
      {!items || items.length === 0 ? (
        <ComingSoonNotice>Your current sprint will appear here once your consultant sets it up.</ComingSoonNotice>
      ) : (
        <SprintTable
          rows={items.map((item) => ({
            key: item.id,
            title: item.title,
            detail: item.detail,
            status: item.status,
            date: item.item_date,
          }))}
        />
      )}
    </Panel>
  );
}
