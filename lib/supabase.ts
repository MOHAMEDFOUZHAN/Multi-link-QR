import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ClientProfile } from "./types";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://igbqdesjyepguqrluxlu.supabase.co";
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_knwjJsGcS-4tz9mHNW5_gw_cKoTnnlg";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (typeof window === "undefined" && !SUPABASE_URL) return null;
  if (!supabaseInstance && SUPABASE_URL && SUPABASE_KEY) {
    try {
      supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    } catch (e) {
      console.warn("Could not initialize Supabase client:", e);
    }
  }
  return supabaseInstance;
}

export async function getProfileFromSupabase(slug: string): Promise<ClientProfile | null> {
  const sb = getSupabase();
  if (!sb || !slug) return null;
  const cleanSlug = slug.trim().toLowerCase();

  try {
    const { data, error } = await sb
      .from("profiles")
      .select("*")
      .eq("slug", cleanSlug)
      .maybeSingle();

    if (error || !data) return null;

    // Check if links contains embedded meta
    let rawLinks = Array.isArray(data.links) ? data.links : [];
    let address = data.address || "";
    let businessHours = data.business_hours || "";
    let announcement = data.announcement || "";

    const metaItem = rawLinks.find((l: any) => l && l.__isMeta === true);
    if (metaItem) {
      address = address || metaItem.address || "";
      businessHours = businessHours || metaItem.businessHours || "";
      announcement = announcement || metaItem.announcement || "";
      rawLinks = rawLinks.filter((l: any) => l && l.__isMeta !== true);
    }

    return {
      id: "cloud_" + data.slug,
      name: data.name || "Business Profile",
      slug: data.slug,
      bio: data.bio || "",
      avatarUrl: data.avatar_url || "",
      contactPhone: data.contact_phone || "",
      contactEmail: data.contact_email || "",
      address: address,
      businessHours: businessHours,
      announcement: announcement,
      theme: data.theme || "minimal",
      buttonShape: data.button_shape || "rounded",
      clientName: data.client_name || "",
      clientPhone: data.client_phone || "",
      planPrice: data.plan_price || "0",
      currency: data.currency || "$",
      billingCycle: data.billing_cycle || "monthly",
      status: data.status || "active",
      expiryDate: data.expiry_date || "",
      inactiveMessage: data.inactive_message || "",
      adminContact: data.admin_contact || "",
      links: rawLinks,
      updatedAt: data.updated_at,
    };
  } catch (err) {
    console.warn("getProfileFromSupabase error:", err);
    return null;
  }
}

export async function saveProfileToSupabase(profile: ClientProfile): Promise<boolean> {
  const sb = getSupabase();
  if (!sb || !profile.slug) return false;

  const linksToSave = Array.isArray(profile.links)
    ? profile.links.filter((l: any) => l && l.__isMeta !== true)
    : [];

  // If there's address, businessHours or announcement, embed them safely in links array so no schema error occurs
  if (profile.address || profile.businessHours || profile.announcement) {
    linksToSave.push({
      id: "__meta__",
      __isMeta: true,
      address: profile.address || "",
      businessHours: profile.businessHours || "",
      announcement: profile.announcement || "",
      linkType: "custom",
      title: "",
      destination: "",
      isEnabled: false,
    } as any);
  }

  const record: Record<string, any> = {
    slug: profile.slug.trim().toLowerCase(),
    name: profile.name || "Business Profile",
    bio: profile.bio || "",
    avatar_url: profile.avatarUrl || "",
    contact_phone: profile.contactPhone || "",
    contact_email: profile.contactEmail || "",
    theme: profile.theme || "minimal",
    button_shape: profile.buttonShape || "rounded",
    links: linksToSave,
    client_name: profile.clientName || "",
    client_phone: profile.clientPhone || "",
    plan_price: String(profile.planPrice || "0"),
    currency: profile.currency || "$",
    billing_cycle: profile.billingCycle || "monthly",
    status: profile.status || "active",
    expiry_date: profile.expiryDate || "",
    inactive_message: profile.inactiveMessage || "",
    admin_contact: profile.adminContact || "",
    updated_at: new Date().toISOString(),
  };

  try {
    const { error } = await sb.from("profiles").upsert(record, { onConflict: "slug" });
    if (error) {
      console.warn("Supabase upsert warning:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.warn("saveProfileToSupabase exception:", e);
    return false;
  }
}

export async function deleteProfileFromSupabase(slug: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb || !slug) return false;

  try {
    const { error } = await sb.from("profiles").delete().eq("slug", slug.trim().toLowerCase());
    return !error;
  } catch (e) {
    console.warn("deleteProfileFromSupabase error:", e);
    return false;
  }
}

export async function fetchAllProfilesFromSupabase(): Promise<ClientProfile[]> {
  const sb = getSupabase();
  if (!sb) return [];

  try {
    const { data, error } = await sb
      .from("profiles")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error || !data) return [];

    return data.map((d) => {
      let rawLinks = Array.isArray(d.links) ? d.links : [];
      let address = d.address || "";
      let businessHours = d.business_hours || "";
      let announcement = d.announcement || "";

      const metaItem = rawLinks.find((l: any) => l && l.__isMeta === true);
      if (metaItem) {
        address = address || metaItem.address || "";
        businessHours = businessHours || metaItem.businessHours || "";
        announcement = announcement || metaItem.announcement || "";
        rawLinks = rawLinks.filter((l: any) => l && l.__isMeta !== true);
      }

      return {
        id: "cloud_" + d.slug,
        name: d.name || "Business Profile",
        slug: d.slug,
        bio: d.bio || "",
        avatarUrl: d.avatar_url || "",
        contactPhone: d.contact_phone || "",
        contactEmail: d.contact_email || "",
        address: address,
        businessHours: businessHours,
        announcement: announcement,
        theme: d.theme || "minimal",
        buttonShape: d.button_shape || "rounded",
        clientName: d.client_name || "",
        clientPhone: d.client_phone || "",
        planPrice: d.plan_price || "0",
        currency: d.currency || "$",
        billingCycle: d.billing_cycle || "monthly",
        status: d.status || "active",
        expiryDate: d.expiry_date || "",
        inactiveMessage: d.inactive_message || "",
        adminContact: d.admin_contact || "",
        links: rawLinks,
        updatedAt: d.updated_at,
      };
    });
  } catch (err) {
    console.warn("fetchAllProfilesFromSupabase error:", err);
    return [];
  }
}
