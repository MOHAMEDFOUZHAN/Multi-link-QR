"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import {
  ClientProfile,
  LinkItem,
  LinkType,
  ThemeType,
  ButtonShape,
} from "@/lib/types";
import {
  Storage,
  getSubscriptionState,
  createBlankModel,
  getDefaultExpiryDate,
} from "@/lib/storage";
import {
  fetchAllProfilesFromSupabase,
  saveProfileToSupabase,
  deleteProfileFromSupabase,
} from "@/lib/supabase";
import { compressImageFile } from "@/lib/image-utils";
import {
  QrCode,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  IndianRupee,
  Plus,
  Search,
  RotateCw,
  Printer,
  Edit,
  Trash2,
  ExternalLink,
  MessageCircle,
  Phone,
  Calendar,
  Sparkles,
  Download,
  X,
  Layers,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Globe,
  MapPin,
  UtensilsCrossed,
  ShoppingBag,
  Mail,
  HelpCircle,
  Eye,
  Check,
  Upload,
  CloudUpload,
  Settings,
  Lock,
  Unlock,
  Key,
  Image as ImageIcon,
  Copy,
} from "lucide-react";
import {
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
  LinkedinIcon,
  TikTokIcon,
  XIcon,
  TelegramIcon,
  GoogleMapsIcon,
  WhatsAppIcon,
} from "@/lib/brand-icons";

type FilterTab = "all" | "active" | "expiring" | "suspended" | "expired";
type SortOption = "expiry" | "name" | "price" | "created";

export default function AdminDashboard() {
  // Agency Admin Security Shield
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPin, setAdminPin] = useState("3110");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [newPinInput, setNewPinInput] = useState("");

  // Navigation
  const [activeTab, setActiveTab] = useState<"directory" | "studio">("directory");

  // Clients State
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [sortBy, setSortBy] = useState<SortOption>("expiry");
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  // Production Domain Configuration (for Vercel & Live hosting)
  const [customDomain, setCustomDomain] = useState<string>("");
  const [customDomainInput, setCustomDomainInput] = useState<string>("");
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);

  // Studio Form Model
  const [formModel, setFormModel] = useState<ClientProfile>(() => createBlankModel());
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [studioPreviewMode, setStudioPreviewMode] = useState<"active" | "suspended">("active");

  // Logo Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoInputMode, setLogoInputMode] = useState<"upload" | "url">("upload");
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);

  // Live QR Data URL
  const [liveQrDataUrl, setLiveQrDataUrl] = useState<string>("");

  // Modals
  const [standeeClient, setStandeeClient] = useState<ClientProfile | null>(null);
  const [standeeQrUrl, setStandeeQrUrl] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<ClientProfile | null>(null);
  const [detailClient, setDetailClient] = useState<ClientProfile | null>(null);

  // Toast
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);

  function addToast(msg: string) {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message: msg }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }

  // Detect localhost & load custom production domain & PIN
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      setIsLocalhost(isLocal);

      const saved = localStorage.getItem("maple_qr_base_domain");
      if (saved) {
        setCustomDomain(saved);
        setCustomDomainInput(saved);
      }

      const savedPin = localStorage.getItem("maple_admin_pin") || "3110";
      setAdminPin(savedPin);

      const sessionAuth = sessionStorage.getItem("maple_admin_session");
      if (sessionAuth === "unlocked") {
        setIsAdminUnlocked(true);
      }
    }
  }, []);

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (pinInput.trim() === adminPin) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("maple_admin_session", "unlocked");
      }
      setIsAdminUnlocked(true);
      setPinError("");
      setPinInput("");
      addToast("🔓 Command Center unlocked!");
    } else {
      setPinError("Incorrect security PIN. Please try again.");
    }
  }

  function handleLockDashboard() {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("maple_admin_session");
    }
    setIsAdminUnlocked(false);
    addToast("🔒 Command Center locked.");
  }

  // Helper to get base URL for all generated QR codes & Standees
  function getTargetBaseUrl(): string {
    if (customDomain && customDomain.trim()) {
      let d = customDomain.trim().replace(/\/+$/, "");
      if (!d.startsWith("http://") && !d.startsWith("https://")) {
        d = "https://" + d;
      }
      return d;
    }
    return typeof window !== "undefined" ? window.location.origin : "https://mapleconnect.app";
  }

  // Save Production Domain
  function handleSaveDomain() {
    let d = customDomainInput.trim().replace(/\/+$/, "");
    if (d && !d.startsWith("http://") && !d.startsWith("https://")) {
      d = "https://" + d;
    }
    setCustomDomain(d);
    if (typeof window !== "undefined") {
      if (d) {
        localStorage.setItem("maple_qr_base_domain", d);
      } else {
        localStorage.removeItem("maple_qr_base_domain");
      }
    }
    setIsDomainModalOpen(false);
    addToast(d ? `🌐 QR target domain set to: ${d}` : "QR domain reset to current origin.");
  }

  // 1. Initial Load: Load local storage, sync with Supabase Cloud
  useEffect(() => {
    const local = Storage.getAll();
    setClients(local);

    async function syncCloud() {
      setIsCloudSyncing(true);
      try {
        // Auto-push local profiles to Supabase so nothing is lost
        for (const loc of local) {
          saveProfileToSupabase(loc);
        }

        const cloudProfiles = await fetchAllProfilesFromSupabase();
        if (cloudProfiles && cloudProfiles.length > 0) {
          const localMap = new Map<string, ClientProfile>();
          local.forEach((c) => localMap.set(c.slug.toLowerCase(), c));

          cloudProfiles.forEach((cp) => {
            const cleanSlug = cp.slug.toLowerCase();
            const existing = localMap.get(cleanSlug);
            if (!existing || new Date(cp.updatedAt || 0) >= new Date(existing.updatedAt || 0)) {
              localMap.set(cleanSlug, cp);
            }
          });

          const merged = Array.from(localMap.values());
          Storage.saveAll(merged);
          setClients(merged);
        }
      } catch (err) {
        console.warn("Supabase background sync:", err);
      } finally {
        setIsCloudSyncing(false);
      }
    }

    syncCloud();
  }, []);

  // 1-Click Push All Local to Cloud
  async function handlePushLocalToCloud() {
    setIsCloudSyncing(true);
    try {
      let count = 0;
      for (const client of clients) {
        const ok = await saveProfileToSupabase(client);
        if (ok) count++;
      }
      addToast(`☁️ Pushed & verified ${count} shop(s) in Supabase Cloud!`);
    } catch (err) {
      console.error("Cloud push error:", err);
      addToast("❌ Failed to push shops to Supabase.");
    } finally {
      setIsCloudSyncing(false);
    }
  }

  // 2. Generate Live QR for Studio Model
  useEffect(() => {
    let isCancelled = false;
    const origin = getTargetBaseUrl();
    const slug = formModel.slug ? formModel.slug.trim().toLowerCase() : "preview";
    const targetUrl = `${origin}/p/${slug}`;

    QRCode.toDataURL(targetUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: formModel.qrDark || "#0F172A",
        light: formModel.qrLight || "#FFFFFF",
      },
    })
      .then((url) => {
        if (!isCancelled) setLiveQrDataUrl(url);
      })
      .catch((e) => console.error("Live QR error:", e));

    return () => {
      isCancelled = true;
    };
  }, [formModel.slug, formModel.qrDark, formModel.qrLight, customDomain]);

  // 3. Generate QR for Standee Modal when open
  useEffect(() => {
    if (!standeeClient) {
      setStandeeQrUrl("");
      return;
    }

    const origin = getTargetBaseUrl();
    const targetUrl = `${origin}/p/${standeeClient.slug}`;

    QRCode.toDataURL(targetUrl, {
      width: 1024,
      margin: 2,
      color: {
        dark: standeeClient.qrDark || "#0F172A",
        light: standeeClient.qrLight || "#FFFFFF",
      },
    })
      .then((url) => setStandeeQrUrl(url))
      .catch((e) => console.error("Standee QR gen error:", e));
  }, [standeeClient, customDomain]);

  // Handle Logo File Upload & Canvas Compression
  async function handleLogoUpload(file: File) {
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const dataUrl = await compressImageFile(file, 400, 0.85);
      setFormModel((prev) => ({ ...prev, avatarUrl: dataUrl }));
      addToast("📸 Logo uploaded & compressed for mobile retina display!");
    } catch (err) {
      console.error("Logo upload error:", err);
      alert("Could not process this image file. Please try another image.");
    } finally {
      setIsUploadingLogo(false);
    }
  }

  // KPI Calculations
  const kpis = useMemo(() => {
    let activeCount = 0;
    let expiringCount = 0;
    let suspendedCount = 0;
    let monthlyRevenue = 0;

    clients.forEach((c) => {
      const state = getSubscriptionState(c);
      if (state.type === "active") {
        activeCount++;
      } else if (state.type === "expiring") {
        expiringCount++;
        activeCount++;
      } else if (state.type === "suspended" || state.type === "expired") {
        suspendedCount++;
      }

      if (!state.isLocked) {
        const priceNum = parseFloat(String(c.planPrice)) || 0;
        monthlyRevenue += priceNum;
      }
    });

    return {
      total: clients.length,
      active: activeCount,
      expiring: expiringCount,
      suspended: suspendedCount,
      revenue: monthlyRevenue,
    };
  }, [clients]);

  // Filtered & Sorted Clients List
  const filteredClients = useMemo(() => {
    let result = [...clients];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((c) => {
        const name = (c.name || "").toLowerCase();
        const slug = (c.slug || "").toLowerCase();
        const owner = (c.clientName || "").toLowerCase();
        const phone = (c.clientPhone || "").toLowerCase();
        return name.includes(q) || slug.includes(q) || owner.includes(q) || phone.includes(q);
      });
    }

    if (filterTab !== "all") {
      result = result.filter((c) => {
        const state = getSubscriptionState(c);
        if (filterTab === "active") return state.type === "active" || state.type === "expiring";
        if (filterTab === "expiring") return state.type === "expiring";
        if (filterTab === "suspended") return state.type === "suspended";
        if (filterTab === "expired") return state.type === "expired";
        return true;
      });
    }

    result.sort((a, b) => {
      if (sortBy === "expiry") {
        const da = a.expiryDate ? new Date(a.expiryDate).getTime() : 9999999999999;
        const db = b.expiryDate ? new Date(b.expiryDate).getTime() : 9999999999999;
        return da - db;
      }
      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortBy === "price") {
        const pa = parseFloat(String(a.planPrice)) || 0;
        const pb = parseFloat(String(b.planPrice)) || 0;
        return pb - pa;
      }
      if (sortBy === "created") {
        const ca = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const cb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return cb - ca;
      }
      return 0;
    });

    return result;
  }, [clients, searchQuery, filterTab, sortBy]);

  // 1-Click Kill Switch (Active <-> Suspended)
  async function handleToggleStatus(client: ClientProfile) {
    const nextStatus = client.status === "active" ? "suspended" : "active";
    const updated: ClientProfile = {
      ...client,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    };

    const updatedList = clients.map((c) => (c.slug === client.slug || c.id === client.id ? updated : c));
    setClients(updatedList);
    Storage.saveAll(updatedList);
    saveProfileToSupabase(updated);

    if (detailClient && (detailClient.slug === client.slug || detailClient.id === client.id)) {
      setDetailClient(updated);
    }

    addToast(
      nextStatus === "active"
        ? `🟢 Activated ${client.name} — QR links are live`
        : `🔴 Suspended ${client.name} — QR shows 'Page Not Available'`
    );
  }

  // 1-Click Renew (+30 Days)
  async function handleQuickRenew(client: ClientProfile) {
    let baseDate = new Date();
    if (client.expiryDate) {
      const currentExp = new Date(client.expiryDate);
      if (currentExp.getTime() > baseDate.getTime()) {
        baseDate = currentExp;
      }
    }
    baseDate.setDate(baseDate.getDate() + 30);
    const newExpiry = baseDate.toISOString().split("T")[0];

    const updated: ClientProfile = {
      ...client,
      status: "active",
      expiryDate: newExpiry,
      updatedAt: new Date().toISOString(),
    };

    const updatedList = clients.map((c) => (c.slug === client.slug || c.id === client.id ? updated : c));
    setClients(updatedList);
    Storage.saveAll(updatedList);
    saveProfileToSupabase(updated);

    if (detailClient && (detailClient.slug === client.slug || detailClient.id === client.id)) {
      setDetailClient(updated);
    }

    addToast(`⚡ Renewed ${client.name}: +30 days (expires ${newExpiry})`);
  }

  // Toggle Individual Link Active / Disabled
  function handleToggleLinkStatus(client: ClientProfile, linkId: string) {
    const updatedLinks = (client.links || []).map((l) => {
      if (l.id === linkId) {
        const nextState = l.isEnabled === false ? true : false;
        return { ...l, isEnabled: nextState };
      }
      return l;
    });

    const targetLink = client.links?.find((l) => l.id === linkId);
    const isNowActive = targetLink?.isEnabled === false;

    const updatedClient: ClientProfile = {
      ...client,
      links: updatedLinks,
      updatedAt: new Date().toISOString(),
    };

    const updatedList = clients.map((c) =>
      c.slug === client.slug || c.id === client.id ? updatedClient : c
    );
    setClients(updatedList);
    Storage.upsert(updatedClient);

    if (detailClient && (detailClient.slug === client.slug || detailClient.id === client.id)) {
      setDetailClient(updatedClient);
    }

    addToast(
      `Link "${targetLink?.title || "Link"}" ${isNowActive ? "🟢 enabled" : "⚪ disabled (hidden from QR)"}`
    );
  }

  // Render Link Icon Helper
  function renderLinkIcon(type: LinkType) {
    switch (type) {
      case "whatsapp":
        return <WhatsAppIcon size={18} />;
      case "instagram":
        return <InstagramIcon size={18} />;
      case "facebook":
        return <FacebookIcon size={18} />;
      case "youtube":
        return <YoutubeIcon size={18} />;
      case "linkedin":
        return <LinkedinIcon size={18} />;
      case "tiktok":
        return <TikTokIcon size={18} />;
      case "x":
        return <XIcon size={18} />;
      case "telegram":
        return <TelegramIcon size={18} />;
      case "google_maps":
        return <GoogleMapsIcon size={18} />;
      case "phone":
        return <Phone size={18} />;
      case "email":
        return <Mail size={18} />;
      case "store":
        return <ShoppingBag size={18} />;
      case "menu":
        return <UtensilsCrossed size={18} />;
      case "website":
      case "custom":
      default:
        return <Globe size={18} />;
    }
  }

  // Open WhatsApp Payment Reminder
  function handleSendWhatsAppReminder(client: ClientProfile) {
    const phone = (client.clientPhone || client.contactPhone || "").replace(/[^0-9]/g, "");
    if (!phone) {
      alert("No client phone number registered for this shop. Please edit the client and add a phone number.");
      return;
    }

    const state = getSubscriptionState(client);
    let msg = "";

    const curr = client.currency && client.currency !== "$" ? client.currency : "₹";
    if (state.type === "expired") {
      msg = `Hello ${client.clientName || client.name}, your Maple Connect QR subscription expired on ${client.expiryDate}. The QR page is currently suspended for customers. Please process payment of ${curr}${client.planPrice} to restore your page immediately. Thank you! - Connected by Maple Connect (Unit of Maple Pro)`;
    } else if (state.type === "expiring") {
      msg = `Hello ${client.clientName || client.name}, friendly reminder that your Maple Connect QR subscription is due for renewal on ${client.expiryDate} (${curr}${client.planPrice}). Renewing early keeps your counter QR standee uninterrupted! - Connected by Maple Connect (Unit of Maple Pro)`;
    } else if (state.type === "suspended") {
      msg = `Hello ${client.clientName || client.name}, your Maple Connect QR profile is currently paused. Please let us know once the payment of ${curr}${client.planPrice} is complete so we can re-activate your counter QR page immediately. - Connected by Maple Connect (Unit of Maple Pro)`;
    } else {
      msg = `Hello ${client.clientName || client.name}, checking in from Maple Connect (Unit of Maple Pro). Your counter QR profile is active and valid until ${client.expiryDate || "Lifetime"}. Let us know if you need any link updates!`;
    }

    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
  }

  // Start New Client in Studio
  function handleStartNewClient() {
    setFormModel(createBlankModel());
    setIsEditingExisting(false);
    setActiveTab("studio");
  }

  // Edit Existing Client in Studio
  function handleEditClient(client: ClientProfile) {
    setFormModel(JSON.parse(JSON.stringify(client)));
    setIsEditingExisting(true);
    setActiveTab("studio");
  }

  // Confirm Delete Client
  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    const slugToDelete = deleteTarget.slug;

    const filtered = clients.filter((c) => c.slug !== slugToDelete);
    setClients(filtered);
    Storage.delete(slugToDelete);
    deleteProfileFromSupabase(slugToDelete);

    addToast(`🗑️ Completely deleted ${deleteTarget.name}`);
    setDeleteTarget(null);
  }

  // Save Studio Form
  async function handleSaveStudioForm(e: React.FormEvent) {
    e.preventDefault();

    if (!formModel.name || !formModel.name.trim()) {
      alert("Please enter a Shop / Business Name");
      return;
    }

    let slug = formModel.slug ? formModel.slug.trim().toLowerCase() : "";
    if (!slug) {
      slug = formModel.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    if (!isEditingExisting) {
      const exists = clients.some((c) => c.slug.toLowerCase() === slug.toLowerCase());
      if (exists) {
        slug = `${slug}-${Math.floor(Math.random() * 899 + 100)}`;
      }
    }

    const updatedRecord: ClientProfile = {
      ...formModel,
      name: formModel.name.trim(),
      slug: slug,
      updatedAt: new Date().toISOString(),
    };

    Storage.upsert(updatedRecord);

    setClients((prev) => {
      const idx = prev.findIndex((c) => c.slug === updatedRecord.slug || c.id === updatedRecord.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedRecord;
        return copy;
      }
      return [updatedRecord, ...prev];
    });

    addToast(`💾 Successfully saved ${updatedRecord.name}!`);
    setActiveTab("directory");
  }

  // Link Items Management in Studio
  function handleAddLink(type: LinkType = "website") {
    const defaultTitles: Record<LinkType, string> = {
      whatsapp: "Chat on WhatsApp",
      instagram: "Follow on Instagram",
      google_maps: "Find us on Google Maps",
      phone: "Call Direct",
      email: "Send Email",
      website: "Official Website",
      menu: "Browse Food Menu",
      store: "Shop Online",
      facebook: "Connect on Facebook",
      youtube: "Watch YouTube",
      linkedin: "Connect on LinkedIn",
      tiktok: "Follow on TikTok",
      x: "Follow on X",
      telegram: "Join Telegram Channel",
      custom: "Custom Link",
    };

    const newLink: LinkItem = {
      id: "lnk_" + Date.now() + "_" + Math.random().toString(36).substring(2, 5),
      linkType: type,
      title: defaultTitles[type] || "Link Title",
      destination: type === "phone" ? "+1" : "https://",
      badge: "",
      isFeatured: false,
      isEnabled: true,
    };

    setFormModel((prev) => ({
      ...prev,
      links: [...(prev.links || []), newLink],
    }));
  }

  function handleUpdateLink(id: string, updates: Partial<LinkItem>) {
    setFormModel((prev) => ({
      ...prev,
      links: (prev.links || []).map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }));
  }

  function handleDeleteLink(id: string) {
    setFormModel((prev) => ({
      ...prev,
      links: (prev.links || []).filter((l) => l.id !== id),
    }));
  }

  // Download High-Res Standee PNG
  function handleDownloadStandeePng() {
    if (!standeeQrUrl || !standeeClient) return;
    const a = document.createElement("a");
    a.href = standeeQrUrl;
    a.download = `${standeeClient.slug}-acrylic-standee-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Download Standee SVG
  async function handleDownloadStandeeSvg() {
    if (!standeeClient) return;
    const origin = getTargetBaseUrl();
    const targetUrl = `${origin}/p/${standeeClient.slug}`;

    try {
      const svg = await QRCode.toString(targetUrl, {
        type: "svg",
        margin: 2,
        color: {
          dark: standeeClient.qrDark || "#0F172A",
          light: standeeClient.qrLight || "#FFFFFF",
        },
      });

      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${standeeClient.slug}-vector-qr.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("SVG export error:", e);
    }
  }

  // =========================================================================
  // ADMIN PASSCODE / PIN AUTHENTICATION GUARD
  // =========================================================================
  if (!isAdminUnlocked) {
    return (
      <div className="admin-lock-screen">
        <form onSubmit={handleUnlock} className="admin-lock-card">
          <div className="admin-lock-icon-wrap">
            <Lock size={32} />
          </div>

          <h2 className="admin-lock-title">Agency Command Center</h2>
          <p className="admin-lock-subtitle">
            Enter your agency security PIN to manage 100+ client profiles, subscription status, and billing.
          </p>

          <input
            type="password"
            autoFocus
            className="admin-lock-pin-input"
            placeholder="••••"
            maxLength={8}
            value={pinInput}
            onChange={(e) => {
              setPinInput(e.target.value);
              setPinError("");
            }}
          />

          {pinError && (
            <div style={{ color: "#EF4444", fontSize: "0.8rem", marginBottom: "14px", fontWeight: 600 }}>
              {pinError}
            </div>
          )}

          <button type="submit" className="btn-admin-unlock">
            <ShieldCheck size={18} /> Unlock Dashboard
          </button>

          <div className="admin-lock-footer-text">
            Default PIN: <strong style={{ color: "#94A3B8" }}>3110</strong> (Customizable in Settings)
          </div>
        </form>

        {/* Toast Shelf */}
        <div className="toast-shelf">
          {toasts.map((t) => (
            <div key={t.id} className="toast-pill">
              {t.message}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATED COMMAND CENTER
  // =========================================================================
  return (
    <div className="admin-app-root">
      {/* SaaS Navigation */}
      <nav className="app-navbar">
        <div className="navbar-container">
          <div className="navbar-brand-wrap">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFF",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.35)",
              }}
            >
              <QrCode size={22} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="navbar-brand-title">Maple Connect</span>
                <span className="admin-brand-tag">AGENCY SAAS</span>
              </div>
              <div style={{ fontSize: "0.68rem", color: "#64748B", fontWeight: 600, letterSpacing: "0.02em" }}>
                Connected by Maple Connect &bull; Unit of Maple Pro
              </div>
            </div>
          </div>

          <div className="navbar-tabs">
            <button
              type="button"
              className={`nav-tab ${activeTab === "directory" ? "active" : ""}`}
              onClick={() => setActiveTab("directory")}
            >
              <Users size={18} />
              Clients Directory
              <span className="nav-count-badge">{clients.length}</span>
            </button>
            <button
              type="button"
              className={`nav-tab ${activeTab === "studio" ? "active" : ""}`}
              onClick={() => setActiveTab("studio")}
            >
              <Layers size={18} />
              {isEditingExisting ? "Editing Client" : "QR Studio & Generator"}
            </button>
          </div>

          <div className="navbar-actions">
            {/* Live Domain Target & Settings Button */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsDomainModalOpen(true)}
              title="Configure live website domain and security PIN"
            >
              <Settings size={14} />
              {customDomain ? customDomain.replace(/^https?:\/\//, "") : "Settings"}
            </button>

            {/* Push Local to Cloud Button */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handlePushLocalToCloud}
              disabled={isCloudSyncing}
              title="Push all local shops and changes to Supabase Cloud"
            >
              <CloudUpload size={14} />
              {isCloudSyncing ? "Pushing..." : "Push to Cloud"}
            </button>

            {/* Supabase Status Pill */}
            <div
              className="btn-cloud-pill"
              title="Connected to Supabase PostgreSQL Cloud Cluster"
            >
              <span
                className="cloud-status-dot"
                style={{
                  background: isCloudSyncing ? "#F59E0B" : "#10B981",
                  boxShadow: isCloudSyncing
                    ? "0 0 8px rgba(245, 158, 11, 0.6)"
                    : "0 0 8px rgba(16, 185, 129, 0.6)",
                }}
              />
              {isCloudSyncing ? "Syncing..." : "Cloud Online"}
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleStartNewClient}
            >
              <Plus size={16} />
              New Client
            </button>

            {/* Lock Session Button */}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleLockDashboard}
              title="Lock Command Center Session"
              style={{ color: "#94A3B8" }}
            >
              <Lock size={15} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main SaaS Content */}
      <main className="creator-container">
        {/* Banner: Localhost Scanning Warning */}
        {isLocalhost && !customDomain && (
          <div
            style={{
              background: "#FFFBEB",
              border: "1px solid #FDE68A",
              borderRadius: "16px",
              padding: "16px 20px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "14px",
              boxShadow: "0 2px 8px rgba(245, 158, 11, 0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#FEF3C7",
                  color: "#D97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#92400E" }}>
                  Why didn&apos;t the QR code open on your phone?
                </div>
                <div style={{ fontSize: "0.825rem", color: "#B45309", marginTop: "2px" }}>
                  Your QR code currently encodes <code>http://localhost:3000</code>. Phones cannot reach &quot;localhost&quot;. 
                  Host on Vercel or set your Vercel URL below so anyone anywhere can scan it!
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="text"
                className="form-control"
                placeholder="https://multi-link-qr.vercel.app"
                style={{ width: "300px", padding: "8px 12px", fontSize: "0.85rem" }}
                value={customDomainInput}
                onChange={(e) => setCustomDomainInput(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSaveDomain}
              >
                Save Live Domain
              </button>
            </div>
          </div>
        )}

        {/* VIEW 1: CLIENTS DIRECTORY */}
        {activeTab === "directory" && (
          <div>
            <div className="admin-hero-header">
              <div>
                <span className="badge-pill">AGENCY COMMAND HUB</span>
                <h1 className="creator-title">Client Directory & Subscription Center</h1>
                <p className="creator-subtitle">
                  Manage 100+ shop QR profiles, toggle active/unpaid kill switches, and issue high-res counter standees.
                  {customDomain && (
                    <span style={{ display: "block", marginTop: "4px", color: "#2563EB", fontWeight: 600 }}>
                      🌐 Target Domain: {customDomain}
                    </span>
                  )}
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px", alignSelf: "center" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handlePushLocalToCloud}
                  disabled={isCloudSyncing}
                >
                  <CloudUpload size={16} />
                  Push All to Cloud
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleStartNewClient}
                >
                  <Plus size={18} />
                  Onboard New Client
                </button>
              </div>
            </div>

            {/* 5 KPI Metric Cards */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon-wrap icon-primary">
                  <Users size={24} />
                </div>
                <div className="kpi-content">
                  <span className="kpi-value">{kpis.total}</span>
                  <span className="kpi-label">Total Shops</span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-wrap icon-success">
                  <ShieldCheck size={24} />
                </div>
                <div className="kpi-content">
                  <span className="kpi-value text-success">{kpis.active}</span>
                  <span className="kpi-label">Active & Paid 🟢</span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-wrap icon-warning">
                  <Clock size={24} />
                </div>
                <div className="kpi-content">
                  <span className="kpi-value text-warning">{kpis.expiring}</span>
                  <span className="kpi-label">Expiring ≤ 7d ⚠️</span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-wrap icon-danger">
                  <ShieldAlert size={24} />
                </div>
                <div className="kpi-content">
                  <span className="kpi-value text-danger">{kpis.suspended}</span>
                  <span className="kpi-label">Suspended / Unpaid 🔴</span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-wrap icon-revenue">
                  <IndianRupee size={24} />
                </div>
                <div className="kpi-content">
                  <span className="kpi-value">₹{kpis.revenue.toLocaleString("en-IN")}</span>
                  <span className="kpi-label">Est. Monthly Revenue</span>
                </div>
              </div>
            </div>

            {/* Table Controls */}
            <div className="table-controls-card">
              <div className="search-filter-row">
                <div className="search-input-wrap">
                  <Search size={18} />
                  <input
                    type="text"
                    className="form-control search-input"
                    placeholder="Search by shop name, slug, owner name, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="btn-clear-search"
                      onClick={() => setSearchQuery("")}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="filter-pills-wrap">
                  <button
                    type="button"
                    className={`client-filter-chip ${filterTab === "all" ? "active" : ""}`}
                    onClick={() => setFilterTab("all")}
                  >
                    All ({clients.length})
                  </button>
                  <button
                    type="button"
                    className={`client-filter-chip ${filterTab === "active" ? "active" : ""}`}
                    onClick={() => setFilterTab("active")}
                  >
                    🟢 Active
                  </button>
                  <button
                    type="button"
                    className={`client-filter-chip ${filterTab === "expiring" ? "active" : ""}`}
                    onClick={() => setFilterTab("expiring")}
                  >
                    ⚠️ Expiring ({kpis.expiring})
                  </button>
                  <button
                    type="button"
                    className={`client-filter-chip ${filterTab === "suspended" ? "active" : ""}`}
                    onClick={() => setFilterTab("suspended")}
                  >
                    🔴 Suspended ({kpis.suspended})
                  </button>
                  <button
                    type="button"
                    className={`client-filter-chip ${filterTab === "expired" ? "active" : ""}`}
                    onClick={() => setFilterTab("expired")}
                  >
                    ⌛ Expired
                  </button>
                </div>

                <div className="sort-selector-wrap">
                  <span className="sort-label">Sort:</span>
                  <select
                    className="form-control"
                    style={{ width: "auto", padding: "6px 12px", fontSize: "0.85rem" }}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                  >
                    <option value="expiry">Due Date (Soonest)</option>
                    <option value="name">Shop Name (A-Z)</option>
                    <option value="price">Highest Fee</option>
                    <option value="created">Newest Created</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Clients Table Card */}
            <div className="clients-table-card">
              {filteredClients.length === 0 ? (
                <div className="empty-clients-state">
                  <div className="empty-icon-wrap">
                    <Users size={36} />
                  </div>
                  <h3 className="empty-title">
                    {searchQuery ? "No matching clients found" : "No Clients Onboarded Yet"}
                  </h3>
                  <p className="empty-desc">
                    {searchQuery
                      ? `No shops match "${searchQuery}". Try a different keyword.`
                      : "Start fresh with a clean database! Add your first shop or business client to create permanent counter QR codes and manage monthly subscription payments."}
                  </p>
                  <div className="empty-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleStartNewClient}
                    >
                      <Plus size={16} />
                      Onboard First Client
                    </button>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="clients-table">
                    <thead>
                      <tr>
                        <th>Shop / Business</th>
                        <th>Links</th>
                        <th>Owner & Contact</th>
                        <th>Subscription & Expiry</th>
                        <th>Kill-Switch</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClients.map((client) => {
                        const sub = getSubscriptionState(client);
                        const isSwitchActive = client.status === "active";
                        const totalLinks = (client.links || []).length;
                        const activeLinks = (client.links || []).filter((l) => l.isEnabled !== false).length;

                        return (
                          <tr key={client.slug || client.id} className="client-table-row">
                            {/* 1. Shop / Business */}
                            <td>
                              <div
                                className="client-identity-box clickable"
                                onClick={() => setDetailClient(client)}
                                title="Click to open full client details & links"
                              >
                                <div className="client-table-avatar">
                                  {client.avatarUrl ? (
                                    <img
                                      src={client.avatarUrl}
                                      alt={client.name}
                                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                  ) : (
                                    <span style={{ fontWeight: 800, color: "#2563EB" }}>
                                      {(client.name || "B").substring(0, 1).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <span className="client-table-name">{client.name}</span>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                                    <Link
                                      href={`/p/${client.slug}`}
                                      target="_blank"
                                      onClick={(e) => e.stopPropagation()}
                                      className="client-table-slug-link"
                                      title="Open live public QR page"
                                    >
                                      /p/{client.slug}
                                      <ExternalLink size={11} />
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* 2. Total Links Count */}
                            <td>
                              <button
                                type="button"
                                className="client-links-count-pill"
                                onClick={() => setDetailClient(client)}
                                title="Click to inspect and toggle separate links"
                              >
                                <Layers size={13} />
                                <span className="links-count-text">
                                  <strong>{totalLinks}</strong> {totalLinks === 1 ? "Link" : "Links"}
                                </span>
                                {totalLinks > 0 && (
                                  <span className={`links-status-mini ${activeLinks === totalLinks ? "all-active" : "has-disabled"}`}>
                                    {activeLinks}/{totalLinks} on
                                  </span>
                                )}
                              </button>
                            </td>

                            {/* 3. Owner & Contact (Clean spacing, no overlap) */}
                            <td>
                              <div className="client-owner-cell">
                                <span className="client-owner-name">
                                  {client.clientName || "—"}
                                </span>
                                <div className="client-contact-row">
                                  <span className="client-contact-phone">
                                    {client.clientPhone || client.contactPhone || "No phone"}
                                  </span>
                                  {(client.clientPhone || client.contactPhone) && (
                                    <button
                                      type="button"
                                      className="btn-whatsapp-chat-mini"
                                      title="Send prefilled WhatsApp subscription reminder"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSendWhatsAppReminder(client);
                                      }}
                                    >
                                      <MessageCircle size={12} />
                                      <span>Remind</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* 4. Subscription & Expiry */}
                            <td>
                              <div className="status-badge-wrap">
                                <div className="status-plan-row">
                                  <span className="plan-pill">
                                    {(client.currency && client.currency !== "$") ? client.currency : "₹"}{client.planPrice}
                                  </span>
                                  <div className={`status-pill ${sub.badgeClass}`}>
                                    <span className="status-dot-mini" />
                                    {sub.label}
                                  </div>
                                </div>
                                <span className="expiry-date-caption">
                                  Valid until {client.expiryDate || "Lifetime"}
                                </span>
                              </div>
                            </td>

                            {/* 5. Kill-Switch */}
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <label className="switch-toggle" title="Toggle Active / Suspended">
                                  <input
                                    type="checkbox"
                                    checked={isSwitchActive}
                                    onChange={() => handleToggleStatus(client)}
                                  />
                                  <span className="switch-slider" />
                                </label>
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    color: isSwitchActive ? "#10B981" : "#EF4444",
                                  }}
                                >
                                  {isSwitchActive ? "ACTIVE" : "LOCKED"}
                                </span>
                              </div>
                            </td>

                            {/* 6. Actions */}
                            <td>
                              <div className="table-actions-group">
                                <button
                                  type="button"
                                  className="btn-table-manage"
                                  title="View Full Client Details & Control Individual Links"
                                  onClick={() => setDetailClient(client)}
                                >
                                  <Eye size={14} />
                                  <span>Manage</span>
                                </button>

                                <button
                                  type="button"
                                  className="btn-table-action"
                                  title="Generate Acrylic Counter Standee (Print & PNG)"
                                  onClick={() => setStandeeClient(client)}
                                >
                                  <Printer size={15} />
                                </button>

                                <button
                                  type="button"
                                  className="btn-table-action action-delete"
                                  title="Permanently remove client"
                                  onClick={() => setDeleteTarget(client)}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: QR STUDIO & GENERATOR */}
        {activeTab === "studio" && (
          <form onSubmit={handleSaveStudioForm}>
            <div className="admin-hero-header">
              <div>
                <span className="badge-pill">
                  {isEditingExisting ? "EDITING CLIENT" : "NEW ONBOARDING"}
                </span>
                <h1 className="creator-title">
                  {isEditingExisting ? `Edit: ${formModel.name}` : "Create Business QR Profile"}
                </h1>
                <p className="creator-subtitle">
                  Configure subscription billing, upload brand logo, add destination links, and preview the live mobile screen.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveTab("directory")}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={18} />
                  Save & Deploy
                </button>
              </div>
            </div>

            <div className="generator-grid">
              {/* Form Controls Column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Step 0: SaaS Subscription & Admin Controls */}
                <div className="card">
                  <div className="card-header">
                    <span className="step-num step-admin">0</span>
                    <div>
                      <h2 className="card-title">SaaS Subscription & Access Control</h2>
                      <p className="card-desc">
                        Manage payment status, expiration date, and customer lock screen.
                      </p>
                    </div>
                  </div>

                  <div className="card-body">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        background: formModel.status === "active" ? "#ECFDF5" : "#FEF2F2",
                        border: `1px solid ${formModel.status === "active" ? "#A7F3D0" : "#FECACA"}`,
                        borderRadius: "12px",
                        marginBottom: "16px",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>
                          Account Status:{" "}
                          <span
                            style={{
                              color: formModel.status === "active" ? "#065F46" : "#991B1B",
                            }}
                          >
                            {formModel.status === "active" ? "ACTIVE / PAID 🟢" : "SUSPENDED / UNPAID 🔴"}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#64748B" }}>
                          {formModel.status === "active"
                            ? "All links and public actions are accessible when customer scans QR."
                            : "Customer sees 'Page Not Available'. All business links are locked."}
                        </div>
                      </div>

                      <label className="switch-toggle">
                        <input
                          type="checkbox"
                          checked={formModel.status === "active"}
                          onChange={(e) =>
                            setFormModel((prev) => ({
                              ...prev,
                              status: e.target.checked ? "active" : "suspended",
                            }))
                          }
                        />
                        <span className="switch-slider" />
                      </label>
                    </div>

                    <div className="expiry-control-box">
                      <div className="expiry-header-row">
                        <div>
                          <label className="form-label" style={{ marginBottom: "2px" }}>
                            Subscription Expiry Date
                          </label>
                          <span className="form-hint">
                            QR automatically locks after this date.
                          </span>
                        </div>
                        <div className="expiry-quick-buttons">
                          <button
                            type="button"
                            className="btn-quick-date"
                            onClick={() =>
                              setFormModel((prev) => ({
                                ...prev,
                                expiryDate: getDefaultExpiryDate(30),
                              }))
                            }
                          >
                            +30d
                          </button>
                          <button
                            type="button"
                            className="btn-quick-date"
                            onClick={() =>
                              setFormModel((prev) => ({
                                ...prev,
                                expiryDate: getDefaultExpiryDate(90),
                              }))
                            }
                          >
                            +90d
                          </button>
                          <button
                            type="button"
                            className="btn-quick-date"
                            onClick={() =>
                              setFormModel((prev) => ({
                                ...prev,
                                expiryDate: getDefaultExpiryDate(365),
                              }))
                            }
                          >
                            +1 Year
                          </button>
                          <button
                            type="button"
                            className="btn-quick-date"
                            onClick={() =>
                              setFormModel((prev) => ({
                                ...prev,
                                expiryDate: "",
                              }))
                            }
                          >
                            Lifetime
                          </button>
                        </div>
                      </div>

                      <input
                        type="date"
                        className="form-control"
                        value={formModel.expiryDate || ""}
                        onChange={(e) =>
                          setFormModel((prev) => ({ ...prev, expiryDate: e.target.value }))
                        }
                      />
                    </div>

                    <div className="form-grid-3" style={{ marginTop: "16px" }}>
                      <div className="form-group">
                        <label className="form-label">Client / Owner Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. John Doe"
                          value={formModel.clientName || ""}
                          onChange={(e) =>
                            setFormModel((prev) => ({ ...prev, clientName: e.target.value }))
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Owner Phone (WhatsApp)</label>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="+1234567890"
                          value={formModel.clientPhone || ""}
                          onChange={(e) =>
                            setFormModel((prev) => ({ ...prev, clientPhone: e.target.value }))
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Monthly Plan Fee</label>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <input
                            type="text"
                            className="form-control"
                            style={{ width: "50px", textAlign: "center" }}
                            value={(formModel.currency && formModel.currency !== "$") ? formModel.currency : "₹"}
                            onChange={(e) =>
                              setFormModel((prev) => ({ ...prev, currency: e.target.value }))
                            }
                          />
                          <input
                            type="number"
                            className="form-control"
                            placeholder="499"
                            value={formModel.planPrice || ""}
                            onChange={(e) =>
                              setFormModel((prev) => ({ ...prev, planPrice: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-grid-2" style={{ marginTop: "12px" }}>
                      <div className="form-group">
                        <label className="form-label">Custom Lock Screen Message</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="This profile is temporarily unavailable."
                          value={formModel.inactiveMessage || ""}
                          onChange={(e) =>
                            setFormModel((prev) => ({
                              ...prev,
                              inactiveMessage: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Agency Renewal Contact (WhatsApp/Phone)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="+18005550199"
                          value={formModel.adminContact || ""}
                          onChange={(e) =>
                            setFormModel((prev) => ({
                              ...prev,
                              adminContact: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 1: Shop Identity & Logo Upload */}
                <div className="card">
                  <div className="card-header">
                    <span className="step-num">1</span>
                    <div>
                      <h2 className="card-title">Shop Identity & Branding</h2>
                      <p className="card-desc">Business details and logo displayed to scanning customers.</p>
                    </div>
                  </div>

                  <div className="card-body">
                    {/* Logo Upload Dropzone Section */}
                    <div className="form-group">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <label className="form-label" style={{ margin: 0 }}>Business Logo / Avatar</label>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            type="button"
                            className={`btn btn-sm ${logoInputMode === "upload" ? "btn-primary" : "btn-secondary"}`}
                            style={{ padding: "3px 10px", fontSize: "0.75rem" }}
                            onClick={() => setLogoInputMode("upload")}
                          >
                            <Upload size={12} /> Upload File
                          </button>
                          <button
                            type="button"
                            className={`btn btn-sm ${logoInputMode === "url" ? "btn-primary" : "btn-secondary"}`}
                            style={{ padding: "3px 10px", fontSize: "0.75rem" }}
                            onClick={() => setLogoInputMode("url")}
                          >
                            Image URL
                          </button>
                        </div>
                      </div>

                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleLogoUpload(file);
                        }}
                      />

                      {formModel.avatarUrl ? (
                        <div className="logo-preview-box">
                          <div className="logo-preview-avatar">
                            <img src={formModel.avatarUrl} alt="Logo" />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#0F172A" }}>
                              Custom Logo Attached
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#64748B" }}>
                              Optimized for mobile retina screens and acrylic standee print
                            </div>
                            <div className="logo-action-btns" style={{ marginTop: "8px" }}>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingLogo}
                              >
                                <Upload size={13} /> {isUploadingLogo ? "Compressing..." : "Change Logo"}
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                style={{ color: "#EF4444" }}
                                onClick={() => setFormModel((prev) => ({ ...prev, avatarUrl: "" }))}
                              >
                                <Trash2 size={13} /> Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : logoInputMode === "upload" ? (
                        <div
                          className={`logo-upload-dropzone ${isDraggingLogo ? "dragging" : ""}`}
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingLogo(true);
                          }}
                          onDragLeave={() => setIsDraggingLogo(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingLogo(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleLogoUpload(file);
                          }}
                        >
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: "50%",
                              background: "#EFF6FF",
                              color: "#2563EB",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Upload size={22} />
                          </div>
                          <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#0F172A" }}>
                            {isUploadingLogo ? "Compressing & uploading..." : "Click or drag & drop to upload shop logo"}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#64748B" }}>
                            Supports PNG, JPG, WebP, SVG (Auto-compressed to 400x400)
                          </div>
                        </div>
                      ) : (
                        <input
                          type="url"
                          className="form-control"
                          placeholder="https://images.unsplash.com/... or https://domain.com/logo.png"
                          value={formModel.avatarUrl || ""}
                          onChange={(e) => setFormModel((prev) => ({ ...prev, avatarUrl: e.target.value }))}
                        />
                      )}
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label required">Shop / Business Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Maple Artisan Bakery"
                          required
                          value={formModel.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormModel((prev) => ({
                              ...prev,
                              name: val,
                              slug:
                                !isEditingExisting && !prev.slug
                                  ? val
                                      .toLowerCase()
                                      .replace(/[^a-z0-9]+/g, "-")
                                      .replace(/^-+|-+$/g, "")
                                  : prev.slug,
                            }));
                          }}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label required">Custom URL Slug</label>
                        <div className="input-prefix-group">
                          <span className="input-prefix">/p/</span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="maple-bakery"
                            required
                            value={formModel.slug}
                            onChange={(e) =>
                              setFormModel((prev) => ({
                                ...prev,
                                slug: e.target.value
                                  .toLowerCase()
                                  .replace(/[^a-z0-9_-]/g, ""),
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Bio / Tagline</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Fresh sourdough, specialty coffee, and handcrafted pastries daily."
                        value={formModel.bio || ""}
                        onChange={(e) =>
                          setFormModel((prev) => ({ ...prev, bio: e.target.value }))
                        }
                      />
                    </div>

                    <div className="form-grid-3">
                      <div className="form-group">
                        <label className="form-label">Announcement Banner (Optional)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="🎉 20% Off Weekend Specials!"
                          value={formModel.announcement || ""}
                          onChange={(e) =>
                            setFormModel((prev) => ({ ...prev, announcement: e.target.value }))
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Physical Store Address</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="123 King Street, Downtown"
                          value={formModel.address || ""}
                          onChange={(e) =>
                            setFormModel((prev) => ({ ...prev, address: e.target.value }))
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Business Hours</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Mon - Sat: 9:00 AM - 10:00 PM"
                          value={formModel.businessHours || ""}
                          onChange={(e) =>
                            setFormModel((prev) => ({ ...prev, businessHours: e.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label">Customer Direct Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="+1 555-0199"
                          value={formModel.contactPhone || ""}
                          onChange={(e) =>
                            setFormModel((prev) => ({ ...prev, contactPhone: e.target.value }))
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Customer Email</label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="hello@shop.com"
                          value={formModel.contactEmail || ""}
                          onChange={(e) =>
                            setFormModel((prev) => ({ ...prev, contactEmail: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Multi-Link Stream */}
                <div className="card">
                  <div className="card-header">
                    <span className="step-num">2</span>
                    <div>
                      <h2 className="card-title">Destination Links & Socials</h2>
                      <p className="card-desc">
                        Add WhatsApp chat, Google Maps, digital menu, catalog, or social media links.
                      </p>
                    </div>
                  </div>

                  <div className="card-body">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleAddLink("whatsapp")}
                      >
                        <WhatsAppIcon size={14} /> + WhatsApp
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleAddLink("google_maps")}
                      >
                        <GoogleMapsIcon size={14} /> + Google Maps
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleAddLink("instagram")}
                      >
                        <InstagramIcon size={14} /> + Instagram
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleAddLink("menu")}
                      >
                        <UtensilsCrossed size={14} /> + Menu
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleAddLink("store")}
                      >
                        <ShoppingBag size={14} /> + Store
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleAddLink("phone")}
                      >
                        <Phone size={14} /> + Call Direct
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleAddLink("website")}
                      >
                        <Globe size={14} /> + Website
                      </button>
                    </div>

                    <div className="links-stream">
                      {(formModel.links || []).length === 0 ? (
                        <div
                          style={{
                            padding: "20px",
                            textAlign: "center",
                            background: "#F8FAFC",
                            borderRadius: "12px",
                            color: "#64748B",
                            fontSize: "0.875rem",
                          }}
                        >
                          No links added yet. Click one of the shortcuts above to add links!
                        </div>
                      ) : (
                        formModel.links.map((link) => (
                          <div key={link.id} className="link-entry-card">
                            <div className="link-icon-box">
                              {renderLinkIcon(link.linkType)}
                            </div>

                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <select
                                  className="form-control"
                                  style={{ width: "130px", padding: "6px 8px", fontSize: "0.8rem" }}
                                  value={link.linkType}
                                  onChange={(e) =>
                                    handleUpdateLink(link.id, {
                                      linkType: e.target.value as LinkType,
                                    })
                                  }
                                >
                                  <option value="whatsapp">WhatsApp</option>
                                  <option value="google_maps">Google Maps</option>
                                  <option value="instagram">Instagram</option>
                                  <option value="facebook">Facebook</option>
                                  <option value="youtube">YouTube</option>
                                  <option value="tiktok">TikTok</option>
                                  <option value="x">X / Twitter</option>
                                  <option value="linkedin">LinkedIn</option>
                                  <option value="telegram">Telegram</option>
                                  <option value="menu">Digital Menu</option>
                                  <option value="store">Online Store</option>
                                  <option value="website">Website</option>
                                  <option value="phone">Phone Call</option>
                                  <option value="email">Email</option>
                                  <option value="custom">Custom</option>
                                </select>

                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Link Title (e.g. Chat with Us)"
                                  style={{ flex: 1, padding: "6px 10px", fontSize: "0.85rem" }}
                                  value={link.title}
                                  onChange={(e) =>
                                    handleUpdateLink(link.id, { title: e.target.value })
                                  }
                                />
                              </div>

                              <input
                                type="text"
                                className="form-control"
                                placeholder="Destination URL (https://... or tel:+1...)"
                                style={{ padding: "6px 10px", fontSize: "0.8rem" }}
                                value={link.destination}
                                onChange={(e) =>
                                  handleUpdateLink(link.id, { destination: e.target.value })
                                }
                              />

                              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Badge (optional e.g. 🔥 Popular, New, 20% Off)"
                                  style={{ flex: 1, padding: "4px 8px", fontSize: "0.75rem" }}
                                  value={link.badge || ""}
                                  onChange={(e) =>
                                    handleUpdateLink(link.id, { badge: e.target.value })
                                  }
                                />
                                <label
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    fontSize: "0.75rem",
                                    color: link.isEnabled !== false ? "#10B981" : "#94A3B8",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    whiteSpace: "nowrap",
                                  }}
                                  title="Toggle this link active or disabled"
                                >
                                  <input
                                    type="checkbox"
                                    checked={link.isEnabled !== false}
                                    onChange={(e) =>
                                      handleUpdateLink(link.id, { isEnabled: e.target.checked })
                                    }
                                  />
                                  {link.isEnabled !== false ? "Active" : "Disabled (Hidden)"}
                                </label>
                                <label
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    fontSize: "0.75rem",
                                    color: "#475569",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={Boolean(link.isFeatured)}
                                    onChange={(e) =>
                                      handleUpdateLink(link.id, { isFeatured: e.target.checked })
                                    }
                                  />
                                  Featured Highlight
                                </label>
                              </div>
                            </div>

                            <div className="link-actions-box">
                              <button
                                type="button"
                                className="icon-btn-sm"
                                title="Remove Link"
                                onClick={() => handleDeleteLink(link.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 3: Design & Styling */}
                <div className="card">
                  <div className="card-header">
                    <span className="step-num">3</span>
                    <div>
                      <h2 className="card-title">Design, Theme & QR Colors</h2>
                      <p className="card-desc">Visual styling applied to the smartphone page.</p>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="form-group">
                      <label className="form-label">Color Theme</label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
                        {(
                          [
                            { id: "minimal", label: "Minimal Light", bg: "#F8FAFC", text: "#0F172A" },
                            { id: "business", label: "Navy Business", bg: "#1D4ED8", text: "#FFFFFF" },
                            { id: "premium", label: "Obsidian Azure", bg: "#070B14", text: "#38BDF8" },
                            { id: "creative", label: "Royal Amethyst", bg: "#1A0733", text: "#F472B6" },
                            { id: "dark", label: "Pure Black", bg: "#000000", text: "#FFFFFF" },
                          ] as const
                        ).map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() =>
                              setFormModel((prev) => ({ ...prev, theme: t.id as ThemeType }))
                            }
                            style={{
                              padding: "10px 8px",
                              borderRadius: "10px",
                              border: `2px solid ${
                                formModel.theme === t.id ? "var(--primary)" : "#E2E8F0"
                              }`,
                              background: t.bg,
                              color: t.text,
                              cursor: "pointer",
                              textAlign: "center",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              boxShadow:
                                formModel.theme === t.id
                                  ? "0 0 0 3px rgba(37, 99, 235, 0.2)"
                                  : "none",
                            }}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group" style={{ marginTop: "16px" }}>
                      <label className="form-label">Button Shape</label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                        {(
                          [
                            { id: "rounded", label: "Rounded (12px)" },
                            { id: "pill", label: "Pill Shape" },
                            { id: "outline", label: "Wire Outline" },
                            { id: "shadow", label: "Card Shadow" },
                          ] as const
                        ).map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() =>
                              setFormModel((prev) => ({ ...prev, buttonShape: s.id as ButtonShape }))
                            }
                            className={`btn ${
                              formModel.buttonShape === s.id ? "btn-primary" : "btn-secondary"
                            } btn-sm`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-grid-2" style={{ marginTop: "16px" }}>
                      <div className="form-group">
                        <label className="form-label">QR Dark Color</label>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <input
                            type="color"
                            value={formModel.qrDark || "#0F172A"}
                            onChange={(e) =>
                              setFormModel((prev) => ({ ...prev, qrDark: e.target.value }))
                            }
                            style={{ width: "42px", height: "38px", padding: 0, border: "none", cursor: "pointer" }}
                          />
                          <input
                            type="text"
                            className="form-control"
                            value={formModel.qrDark || "#0F172A"}
                            onChange={(e) =>
                              setFormModel((prev) => ({ ...prev, qrDark: e.target.value }))
                            }
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">QR Light Background</label>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <input
                            type="color"
                            value={formModel.qrLight || "#FFFFFF"}
                            onChange={(e) =>
                              setFormModel((prev) => ({ ...prev, qrLight: e.target.value }))
                            }
                            style={{ width: "42px", height: "38px", padding: 0, border: "none", cursor: "pointer" }}
                          />
                          <input
                            type="text"
                            className="form-control"
                            value={formModel.qrLight || "#FFFFFF"}
                            onChange={(e) =>
                              setFormModel((prev) => ({ ...prev, qrLight: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setActiveTab("directory")}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ minWidth: "160px" }}>
                    <Check size={18} />
                    Save & Deploy to Cloud
                  </button>
                </div>
              </div>

              {/* Sticky Smartphone & Live QR Preview Column */}
              <div style={{ position: "sticky", top: "85px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    background: "#F1F5F9",
                    padding: "4px",
                    borderRadius: "12px",
                    justifyContent: "center",
                  }}
                >
                  <button
                    type="button"
                    className={`btn btn-sm ${studioPreviewMode === "active" ? "btn-primary" : "btn-ghost"}`}
                    style={{ flex: 1 }}
                    onClick={() => setStudioPreviewMode("active")}
                  >
                    <Eye size={14} /> Preview Active
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${studioPreviewMode === "suspended" ? "btn-danger" : "btn-ghost"}`}
                    style={{ flex: 1 }}
                    onClick={() => setStudioPreviewMode("suspended")}
                  >
                    <ShieldAlert size={14} /> Preview Suspended Lock
                  </button>
                </div>

                {/* Smartphone Device Frame */}
                <div className="smartphone-frame">
                  <div className={`smartphone-screen theme-${formModel.theme || "minimal"}`}>
                    {studioPreviewMode === "suspended" || formModel.status === "suspended" ? (
                      <div className="profile-suspended" style={{ padding: "20px 14px", marginTop: "40px" }}>
                        <div
                          className="suspended-icon-box"
                          style={{ width: "52px", height: "52px", margin: "0 auto 12px" }}
                        >
                          <AlertTriangle size={24} />
                        </div>
                        <div className="suspended-badge">Subscription Expired</div>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "6px" }}>
                          Page Not Available
                        </h3>
                        <p style={{ fontSize: "0.75rem", color: "#64748B", marginBottom: "14px" }}>
                          {formModel.inactiveMessage ||
                            "This business profile is temporarily unavailable due to pending subscription renewal."}
                        </p>
                        <div
                          style={{
                            background: "#F8FAFC",
                            padding: "10px",
                            borderRadius: "10px",
                            fontSize: "0.7rem",
                            color: "#475569",
                            textAlign: "left",
                            marginBottom: "14px",
                          }}
                        >
                          All links for <strong>{formModel.name || "Business"}</strong> are locked.
                        </div>
                        <div
                          style={{
                            background: "#2563EB",
                            color: "#FFF",
                            padding: "8px",
                            borderRadius: "8px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                          }}
                        >
                          Contact Agency to Renew
                        </div>
                      </div>
                    ) : (
                      <>
                        {formModel.announcement && (
                          <div
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              background: "rgba(37, 99, 235, 0.1)",
                              padding: "4px 10px",
                              borderRadius: "9999px",
                              marginBottom: "10px",
                              textAlign: "center",
                              color: "#2563EB",
                            }}
                          >
                            ✨ {formModel.announcement}
                          </div>
                        )}

                        <div className="phone-hero">
                          <div className="phone-avatar-circle">
                            {formModel.avatarUrl ? (
                              <img src={formModel.avatarUrl} alt="Avatar" />
                            ) : (
                              <span style={{ fontWeight: 800, fontSize: "1.5rem", color: "#2563EB" }}>
                                {(formModel.name || "B").substring(0, 1).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="phone-name">{formModel.name || "Shop Name"}</div>
                          <div className="phone-bio">
                            {formModel.bio || "Add a tagline or description..."}
                          </div>

                          {(formModel.address || formModel.businessHours) && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", justifyContent: "center", marginTop: "8px" }}>
                              {formModel.address && (
                                <span style={{ fontSize: "0.65rem", padding: "2px 8px", borderRadius: "9999px", background: "#EFF6FF", color: "#2563EB" }}>
                                  📍 {formModel.address}
                                </span>
                              )}
                              {formModel.businessHours && (
                                <span style={{ fontSize: "0.65rem", padding: "2px 8px", borderRadius: "9999px", background: "#F1F5F9", color: "#475569" }}>
                                  🕒 {formModel.businessHours}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="phone-links-stream">
                          {(formModel.links || []).filter((l) => l.isEnabled !== false).length === 0 ? (
                            <div
                              style={{
                                textAlign: "center",
                                padding: "20px 10px",
                                fontSize: "0.75rem",
                                color: "#94A3B8",
                              }}
                            >
                              Links will appear here
                            </div>
                          ) : (
                            formModel.links
                              .filter((l) => l.isEnabled !== false)
                              .map((link) => (
                                <div
                                  key={link.id}
                                  className={`phone-link-btn shape-${formModel.buttonShape || "rounded"}`}
                                  style={{ position: "relative" }}
                                >
                                  {link.badge && (
                                    <span
                                      style={{
                                        position: "absolute",
                                        top: "-6px",
                                        right: "10px",
                                        background: "#2563EB",
                                        color: "#FFF",
                                        fontSize: "0.6rem",
                                        fontWeight: 800,
                                        padding: "1px 6px",
                                        borderRadius: "9999px",
                                      }}
                                    >
                                      {link.badge}
                                    </span>
                                  )}
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                      style={{
                                        fontSize: "0.8rem",
                                        fontWeight: 700,
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {link.title || "Link Title"}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "0.68rem",
                                        color: "#64748B",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {link.destination}
                                    </div>
                                  </div>
                                  <ExternalLink size={12} color="#94A3B8" />
                                </div>
                              ))
                          )}
                        </div>

                        <div className="phone-footer">
                          <div>Connected by <strong>Maple Connect</strong></div>
                          <div style={{ fontSize: "0.62rem", opacity: 0.75, letterSpacing: "0.03em", textTransform: "uppercase" }}>
                            Unit of Maple Pro
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Live QR Box */}
                <div
                  style={{
                    background: "#FFFFFF",
                    borderRadius: "16px",
                    padding: "16px",
                    border: "1px solid #E2E8F0",
                    textAlign: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: "8px" }}>
                    Permanent QR Code
                  </div>
                  {liveQrDataUrl ? (
                    <img
                      src={liveQrDataUrl}
                      alt="Live QR"
                      style={{ width: "160px", height: "160px", margin: "0 auto 10px", display: "block" }}
                    />
                  ) : (
                    <div style={{ width: "160px", height: "160px", margin: "0 auto" }} />
                  )}
                  <div style={{ fontSize: "0.75rem", color: "#64748B", marginBottom: "10px", wordBreak: "break-all" }}>
                    Target: <code>{getTargetBaseUrl()}/p/{formModel.slug || "..."}</code>
                  </div>
                  <Link
                    href={`/p/${formModel.slug || ""}`}
                    target="_blank"
                    className="btn btn-secondary btn-sm"
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    <ExternalLink size={14} /> Open Live Page in New Tab
                  </Link>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>

      {/* MODAL 0: CLIENT FULL DETAILS & INDIVIDUAL LINK CONTROLLER */}
      {detailClient && (
        <div className="modal-overlay" onClick={() => setDetailClient(null)}>
          <div
            className="modal-box client-detail-modal"
            style={{ maxWidth: "820px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header client-detail-header">
              <div className="detail-header-left">
                <div className="detail-avatar-wrap">
                  {detailClient.avatarUrl ? (
                    <img src={detailClient.avatarUrl} alt={detailClient.name} />
                  ) : (
                    <span style={{ fontWeight: 800, fontSize: "1.4rem", color: "#2563EB" }}>
                      {(detailClient.name || "B").substring(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="detail-header-text">
                  <div className="detail-title-row">
                    <h2 className="detail-shop-name">{detailClient.name}</h2>
                    <span className="badge-verified-mini">Verified QR Node</span>
                  </div>
                  <div className="detail-url-pills">
                    <a
                      href={`/p/${detailClient.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="detail-url-link"
                    >
                      {getTargetBaseUrl().replace(/^https?:\/\//, "")}/p/{detailClient.slug}
                      <ExternalLink size={12} />
                    </a>
                    <button
                      type="button"
                      className="btn-copy-mini"
                      onClick={() => {
                        const url = `${getTargetBaseUrl()}/p/${detailClient.slug}`;
                        navigator.clipboard.writeText(url);
                        addToast("📋 Copied live public URL to clipboard!");
                      }}
                    >
                      <Copy size={12} /> Copy URL
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setDetailClient(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body-scroll" style={{ padding: "24px" }}>
              {/* Client Info & Subscription Grid */}
              <div className="detail-summary-grid">
                {/* 1. Subscription & Kill Switch */}
                <div className="detail-card">
                  <div className="detail-card-title">
                    <ShieldCheck size={16} />
                    <span>Subscription & Kill-Switch</span>
                  </div>
                  <div className="detail-card-body">
                    <div className="detail-status-row">
                      <div className={`status-pill ${getSubscriptionState(detailClient).badgeClass}`}>
                        <span className="status-dot-mini" />
                        {getSubscriptionState(detailClient).label}
                      </div>

                      <div className="killswitch-group">
                        <label className="switch-toggle" title="Toggle Active / Suspended">
                          <input
                            type="checkbox"
                            checked={detailClient.status === "active"}
                            onChange={() => handleToggleStatus(detailClient)}
                          />
                          <span className="switch-slider" />
                        </label>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: detailClient.status === "active" ? "#10B981" : "#EF4444",
                          }}
                        >
                          {detailClient.status === "active" ? "ACTIVE" : "LOCKED"}
                        </span>
                      </div>
                    </div>

                    <div className="detail-meta-text">
                      Valid until: <strong>{detailClient.expiryDate || "Lifetime"}</strong>
                    </div>

                    <button
                      type="button"
                      className="btn-renew-wide"
                      onClick={() => handleQuickRenew(detailClient)}
                    >
                      <RotateCw size={14} />
                      Extend Subscription (+30 Days)
                    </button>
                  </div>
                </div>

                {/* 2. Owner & Plan */}
                <div className="detail-card">
                  <div className="detail-card-title">
                    <Users size={16} />
                    <span>Owner & Subscription Plan</span>
                  </div>
                  <div className="detail-card-body">
                    <div className="detail-owner-info">
                      <div className="detail-field">
                        <span className="detail-field-label">Owner Name</span>
                        <span className="detail-field-value">{detailClient.clientName || "—"}</span>
                      </div>
                      <div className="detail-field">
                        <span className="detail-field-label">Billing Rate</span>
                        <span className="detail-field-value">
                          {(detailClient.currency && detailClient.currency !== "$") ? detailClient.currency : "₹"}{detailClient.planPrice} / {detailClient.billingCycle || "month"}
                        </span>
                      </div>
                    </div>

                    <div className="detail-phone-row">
                      <div className="detail-phone-text">
                        <Phone size={13} />
                        <span>{detailClient.clientPhone || detailClient.contactPhone || "No phone added"}</span>
                      </div>
                      {(detailClient.clientPhone || detailClient.contactPhone) && (
                        <button
                          type="button"
                          className="btn-whatsapp-chat-mini"
                          onClick={() => handleSendWhatsAppReminder(detailClient)}
                        >
                          <MessageCircle size={13} />
                          WhatsApp Remind
                        </button>
                      )}
                    </div>

                    {detailClient.address && (
                      <div className="detail-address-text">
                        <MapPin size={13} />
                        <span>{detailClient.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Individual Links Management Section */}
              <div className="detail-links-box">
                <div className="detail-links-header-row">
                  <div>
                    <h3 className="detail-links-heading">
                      Client Links & Access Control
                      <span className="detail-links-count-pill">
                        {detailClient.links?.length || 0} Total &bull;{" "}
                        <strong style={{ color: "#10B981" }}>
                          {(detailClient.links || []).filter((l) => l.isEnabled !== false).length} Active
                        </strong>
                        {(detailClient.links || []).some((l) => l.isEnabled === false) && (
                          <span style={{ color: "#EF4444", marginLeft: "4px" }}>
                            &bull; {(detailClient.links || []).filter((l) => l.isEnabled === false).length} Off
                          </span>
                        )}
                      </span>
                    </h3>
                    <p className="detail-links-sub">
                      Turn individual links ON or OFF anytime. Disabled links are immediately hidden from customer QR scans without deleting them.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      handleEditClient(detailClient);
                      setDetailClient(null);
                    }}
                  >
                    <Edit size={14} /> Edit All in Studio
                  </button>
                </div>

                {(!detailClient.links || detailClient.links.length === 0) ? (
                  <div className="empty-links-state">
                    <p>No links found for this client.</p>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        handleEditClient(detailClient);
                        setDetailClient(null);
                      }}
                    >
                      <Plus size={14} /> Add Links in Studio
                    </button>
                  </div>
                ) : (
                  <div className="detail-links-items">
                    {detailClient.links.map((link, idx) => {
                      const isLinkActive = link.isEnabled !== false;
                      return (
                        <div
                          key={link.id || idx}
                          className={`detail-link-card ${isLinkActive ? "link-active" : "link-disabled"}`}
                        >
                          <div className="detail-link-card-left">
                            <div className="detail-link-icon-circle">
                              {renderLinkIcon(link.linkType)}
                            </div>
                            <div className="detail-link-main">
                              <div className="detail-link-meta-row">
                                <span className="detail-link-title-text">{link.title || "Untitled Link"}</span>
                                <span className="detail-link-type-tag">{link.linkType}</span>
                                {link.badge && (
                                  <span className="detail-link-highlight-tag">{link.badge}</span>
                                )}
                                {!isLinkActive && (
                                  <span className="detail-link-hidden-tag">Hidden from QR</span>
                                )}
                              </div>
                              <div className="detail-link-dest-url" title={link.destination}>
                                {link.destination}
                              </div>
                            </div>
                          </div>

                          <div className="detail-link-card-right">
                            <div className="link-toggle-switch-group">
                              <label
                                className="switch-toggle"
                                title={isLinkActive ? "Click to Disable this link" : "Click to Enable this link"}
                              >
                                <input
                                  type="checkbox"
                                  checked={isLinkActive}
                                  onChange={() => handleToggleLinkStatus(detailClient, link.id)}
                                />
                                <span className="switch-slider" />
                              </label>
                              <span
                                className="link-switch-status-label"
                                style={{
                                  color: isLinkActive ? "#10B981" : "#94A3B8",
                                  fontWeight: 700,
                                  fontSize: "0.75rem",
                                }}
                              >
                                {isLinkActive ? "ACTIVE" : "DISABLED"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setStandeeClient(detailClient);
                    setDetailClient(null);
                  }}
                >
                  <Printer size={16} /> Print Standee
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    handleEditClient(detailClient);
                    setDetailClient(null);
                  }}
                >
                  <Edit size={16} /> Edit Profile
                </button>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setDetailClient(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ACRYLIC COUNTER STANDEE GENERATOR */}
      {standeeClient && (
        <div className="modal-overlay" onClick={() => setStandeeClient(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Acrylic Counter Standee (Print Ready)</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setStandeeClient(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body-scroll">
              <div className="standee-print-card">
                <div className="standee-avatar-circle">
                  {standeeClient.avatarUrl ? (
                    <img src={standeeClient.avatarUrl} alt={standeeClient.name} />
                  ) : (
                    <span style={{ fontWeight: 800, fontSize: "1.8rem", color: "#2563EB" }}>
                      {(standeeClient.name || "B").substring(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="standee-shop-name">{standeeClient.name}</div>
                <div className="standee-shop-tagline">
                  {standeeClient.bio || "Scan to view our digital menu, links & offers"}
                </div>

                <div className="standee-qr-frame">
                  {standeeQrUrl ? (
                    <img
                      src={standeeQrUrl}
                      alt="Standee High-Res QR"
                      style={{ width: "220px", height: "220px", display: "block" }}
                    />
                  ) : (
                    <div style={{ width: "220px", height: "220px" }} />
                  )}
                </div>

                <div className="standee-scan-badge">SCAN WITH PHONE CAMERA</div>

                <div className="standee-footer">
                  <div className="standee-url-text">
                    {getTargetBaseUrl().replace(/^https?:\/\//, "")}/p/{standeeClient.slug}
                  </div>
                  <div className="standee-brand-text">
                    CONNECTED BY MAPLE CONNECT &bull; UNIT OF MAPLE PRO
                  </div>
                </div>
              </div>

              <div className="standee-actions-row">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => window.print()}
                >
                  <Printer size={16} /> Print Standee
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleDownloadStandeePng}
                >
                  <Download size={16} /> Download PNG (1024px)
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleDownloadStandeeSvg}
                >
                  <Download size={16} /> Download Vector SVG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: AGENCY SETTINGS & PRODUCTION DOMAIN */}
      {isDomainModalOpen && (
        <div className="modal-overlay" onClick={() => setIsDomainModalOpen(false)}>
          <div
            className="modal-box"
            style={{ maxWidth: "480px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Agency Settings & Security</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsDomainModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              <div className="form-group">
                <label className="form-label">Live Production Domain (Vercel)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://multi-link-qr.vercel.app"
                  value={customDomainInput}
                  onChange={(e) => setCustomDomainInput(e.target.value)}
                />
                <span className="form-hint">
                  Current target for QR codes: <strong>{getTargetBaseUrl()}</strong>
                </span>
              </div>

              <div style={{ borderTop: "1px solid #E2E8F0", marginTop: "18px", paddingTop: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Agency Security PIN</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="New PIN (min 4 digits)"
                      maxLength={8}
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        if (newPinInput.trim().length >= 4) {
                          setAdminPin(newPinInput.trim());
                          if (typeof window !== "undefined") {
                            localStorage.setItem("maple_admin_pin", newPinInput.trim());
                          }
                          setNewPinInput("");
                          addToast("🔑 Security PIN updated!");
                        } else {
                          alert("PIN must be at least 4 digits.");
                        }
                      }}
                    >
                      Update PIN
                    </button>
                  </div>
                  <span className="form-hint">Protects your agency dashboard from unauthorized access. Default: 3110</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setCustomDomainInput("");
                  setCustomDomain("");
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("maple_qr_base_domain");
                  }
                  setIsDomainModalOpen(false);
                  addToast("Reset domain to current origin.");
                }}
              >
                Reset Domain
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveDomain}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div
            className="modal-box"
            style={{ maxWidth: "440px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Delete Client Profile?</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setDeleteTarget(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  background: "#FEF2F2",
                  borderRadius: "12px",
                  color: "#991B1B",
                  fontSize: "0.875rem",
                  marginBottom: "16px",
                }}
              >
                <AlertTriangle size={24} style={{ flexShrink: 0 }} />
                <span>
                  Are you sure you want to completely remove{" "}
                  <strong>{deleteTarget.name}</strong>?
                </span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#64748B", lineHeight: 1.5 }}>
                This will delete their profile from cloud storage and local database. Any printed
                QR codes pointing to <code>/p/{deleteTarget.slug}</code> will show &quot;Profile Not Found&quot;.
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
              >
                <Trash2 size={16} /> Delete Client Completely
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Shelf */}
      <div className="toast-shelf">
        {toasts.map((t) => (
          <div key={t.id} className="toast-pill">
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
