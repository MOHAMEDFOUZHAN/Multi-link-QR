export type LinkType =
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "youtube"
  | "linkedin"
  | "tiktok"
  | "x"
  | "website"
  | "google_maps"
  | "phone"
  | "email"
  | "telegram"
  | "store"
  | "menu"
  | "custom";

export interface LinkItem {
  id: string;
  linkType: LinkType;
  title: string;
  destination: string;
  description?: string;
  badge?: string;
  isFeatured?: boolean;
  isEnabled: boolean;
}

export type ThemeType = "minimal" | "business" | "premium" | "creative" | "dark";
export type ButtonShape = "rounded" | "pill" | "outline" | "shadow";

export interface ClientProfile {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  businessHours?: string;
  announcement?: string;
  theme: ThemeType;
  buttonShape: ButtonShape;
  qrDark?: string;
  qrLight?: string;
  links: LinkItem[];
  // SaaS Subscription & Admin Controls
  clientName?: string;
  clientPhone?: string;
  planPrice: string | number;
  currency: string;
  billingCycle: "monthly" | "quarterly" | "yearly" | "one-time";
  status: "active" | "suspended";
  expiryDate?: string;
  inactiveMessage?: string;
  adminContact?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionState {
  type: "active" | "expiring" | "expired" | "suspended";
  badgeClass: string;
  label: string;
  caption: string;
  isLocked: boolean;
}
