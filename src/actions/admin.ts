"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

function fieldValue(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function fieldInt(formData: FormData, name: string, fallback = 0): number {
  const value = Number.parseInt(fieldValue(formData, name), 10);
  return Number.isFinite(value) ? value : fallback;
}

export async function updateCustomerDetails(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;

  const customerId = fieldValue(formData, "customerId");
  if (!customerId) return;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("customers")
    .update({
      next_billing_date: fieldValue(formData, "nextBillingDate") || null,
      practice_lead: fieldValue(formData, "practiceLead") || null,
      status: fieldValue(formData, "status") || "active",
    })
    .eq("id", customerId);

  if (error) {
    console.error("updateCustomerDetails failed for", customerId, error);
  }

  revalidatePath(`/admin/customers/${customerId}`);
}

export async function upsertProgressItem(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;

  const customerId = fieldValue(formData, "customerId");
  const id = fieldValue(formData, "id");
  if (!customerId) return;

  const supabase = createAdminClient();
  const row = {
    customer_id: customerId,
    label: fieldValue(formData, "label"),
    status_label: fieldValue(formData, "statusLabel"),
    percent_label: fieldValue(formData, "percentLabel"),
    total_steps: fieldInt(formData, "totalSteps", 1),
    completed_steps: fieldInt(formData, "completedSteps", 0),
    note: fieldValue(formData, "note") || null,
    sort_order: fieldInt(formData, "sortOrder", 0),
  };

  const { error } = id
    ? await supabase.from("customer_progress_items").update(row).eq("id", id)
    : await supabase.from("customer_progress_items").insert(row);

  if (error) {
    console.error("upsertProgressItem failed for", customerId, error);
  }

  revalidatePath(`/admin/customers/${customerId}`);
  revalidatePath("/dashboard");
}

export async function deleteProgressItem(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;

  const id = fieldValue(formData, "id");
  const customerId = fieldValue(formData, "customerId");
  if (!id) return;

  const supabase = createAdminClient();
  const { error } = await supabase.from("customer_progress_items").delete().eq("id", id);

  if (error) {
    console.error("deleteProgressItem failed for", id, error);
  }

  revalidatePath(`/admin/customers/${customerId}`);
  revalidatePath("/dashboard");
}

export async function upsertSprintItem(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;

  const customerId = fieldValue(formData, "customerId");
  const id = fieldValue(formData, "id");
  if (!customerId) return;

  const supabase = createAdminClient();
  const row = {
    customer_id: customerId,
    title: fieldValue(formData, "title"),
    detail: fieldValue(formData, "detail"),
    status: fieldValue(formData, "status"),
    item_date: fieldValue(formData, "itemDate"),
    sort_order: fieldInt(formData, "sortOrder", 0),
  };

  const { error } = id
    ? await supabase.from("customer_sprint_items").update(row).eq("id", id)
    : await supabase.from("customer_sprint_items").insert(row);

  if (error) {
    console.error("upsertSprintItem failed for", customerId, error);
  }

  revalidatePath(`/admin/customers/${customerId}`);
  revalidatePath("/dashboard");
}

export async function deleteSprintItem(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;

  const id = fieldValue(formData, "id");
  const customerId = fieldValue(formData, "customerId");
  if (!id) return;

  const supabase = createAdminClient();
  const { error } = await supabase.from("customer_sprint_items").delete().eq("id", id);

  if (error) {
    console.error("deleteSprintItem failed for", id, error);
  }

  revalidatePath(`/admin/customers/${customerId}`);
  revalidatePath("/dashboard");
}

export async function addCustomerUpdate(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;

  const customerId = fieldValue(formData, "customerId");
  const title = fieldValue(formData, "title");
  const body = fieldValue(formData, "body");
  if (!customerId || !title || !body) return;

  const supabase = createAdminClient();
  const { error } = await supabase.from("customer_updates").insert({ customer_id: customerId, title, body });

  if (error) {
    console.error("addCustomerUpdate failed for", customerId, error);
  }

  revalidatePath(`/admin/customers/${customerId}`);
  revalidatePath("/dashboard");
}

export async function deleteCustomerUpdate(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;

  const id = fieldValue(formData, "id");
  const customerId = fieldValue(formData, "customerId");
  if (!id) return;

  const supabase = createAdminClient();
  const { error } = await supabase.from("customer_updates").delete().eq("id", id);

  if (error) {
    console.error("deleteCustomerUpdate failed for", id, error);
  }

  revalidatePath(`/admin/customers/${customerId}`);
  revalidatePath("/dashboard");
}
