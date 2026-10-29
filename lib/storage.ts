import { ClientProfile, SubscriptionState } from "./types";
import { saveProfileToSupabase, deleteProfileFromSupabase } from "./supabase";

const STORAGE_KEY = "maple_qr_v1_profiles";
const ACTIVE_QR_KEY = "maple_active_qr";

export function getDefaultExpiryDate(days = 30): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function createBlankModel(override: Partial<ClientProfile> = {}): ClientProfile {
  return {
    id: "client_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    name: "",
    slug: "",
    bio: "",
    avatarUrl: "",
    contactPhone: "",
    contactEmail: "",
    theme: "minimal",
    buttonShape: "rounded",
    qrDark: "#0F172A",
    qrLight: "#FFFFFF",
    links: [],
    clientName: "",
    clientPhone: "",
    planPrice: "25",
    currency: "$",
    billingCycle: "monthly",
    status: "active",
    expiryDate: getDefaultExpiryDate(30),
    inactiveMessage: "",
    adminContact: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...override,
  };
}

export const Storage = {
  getAll(): ClientProfile[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Filter out legacy dummy data
          return parsed.filter((p) => {
            const name = String(p.name || "").toLowerCase();
            const slug = String(p.slug || "").toLowerCase();
            const isDemo =
              (p.id && String(p.id).startsWith("demo_")) ||
              name.includes("alex morgan") ||
              slug.includes("alex-morgan");
            return !isDemo;
          });
        }
      }
    } catch (e) {
      console.warn("Storage.getAll error:", e);
    }
    return [];
  },

  saveAll(list: ClientProfile[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error("Storage.saveAll error:", e);
    }
  },

  getBySlug(slug: string): ClientProfile | null {
    if (!slug) return null;
    const clean = slug.trim().toLowerCase();
    const list = this.getAll();
    return list.find((c) => (c.slug || "").toLowerCase() === clean) || null;
  },

  upsert(model: ClientProfile): ClientProfile {
    const list = this.getAll();
    const cleanSlug = String(model.slug || "").trim().toLowerCase();
    const idx = list.findIndex(
      (c) => (c.slug || "").toLowerCase() === cleanSlug || (model.id && c.id === model.id)
    );

    const record: ClientProfile = {
      ...model,
      slug: cleanSlug,
      updatedAt: new Date().toISOString(),
    };

    if (idx >= 0) {
      list[idx] = record;
    } else {
      list.unshift(record);
    }

    this.saveAll(list);
    saveProfileToSupabase(record);
    return record;
  },

  delete(slug: string) {
    const clean = String(slug).trim().toLowerCase();
    const list = this.getAll();
    const filtered = list.filter((c) => (c.slug || "").toLowerCase() !== clean);
    this.saveAll(filtered);
    deleteProfileFromSupabase(clean);
  },

  clearAll() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_QR_KEY);
  },
};

export function getSubscriptionState(client: ClientProfile): SubscriptionState {
  const status = String(client.status || "active").toLowerCase().trim();
  const isSuspended = status === "suspended" || status === "unpaid" || status === "disabled";

  if (isSuspended) {
    return {
      type: "suspended",
      badgeClass: "badge-suspended",
      label: "Suspended / Unpaid",
      caption: "QR code is locked",
      isLocked: true,
    };
  }

  if (!client.expiryDate || String(client.expiryDate).trim() === "") {
    return {
      type: "active",
      badgeClass: "badge-active",
      label: "Active (Lifetime)",
      caption: "No expiration date",
      isLocked: false,
    };
  }

  const exp = new Date(
    client.expiryDate + (client.expiryDate.length <= 10 ? "T23:59:59.999" : "")
  );

  if (isNaN(exp.getTime())) {
    return {
      type: "active",
      badgeClass: "badge-active",
      label: "Active",
      caption: client.expiryDate,
      isLocked: false,
    };
  }

  const diffMs = exp.getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const ago = Math.abs(diffDays);
    return {
      type: "expired",
      badgeClass: "badge-expired",
      label: `Expired ${ago}d ago`,
      caption: `Ended ${client.expiryDate}`,
      isLocked: true,
    };
  } else if (diffDays <= 7) {
    return {
      type: "expiring",
      badgeClass: "badge-expiring",
      label: `Expires in ${diffDays}d`,
      caption: `Due ${client.expiryDate}`,
      isLocked: false,
    };
  } else {
    return {
      type: "active",
      badgeClass: "badge-active",
      label: `Active (${diffDays}d left)`,
      caption: `Valid until ${client.expiryDate}`,
      isLocked: false,
    };
  }
}

