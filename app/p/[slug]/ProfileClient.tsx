"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { ClientProfile, LinkItem } from "@/lib/types";
import { getSubscriptionState, Storage } from "@/lib/storage";
import { getProfileFromSupabase } from "@/lib/supabase";
import {
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Share2,
  Download,
  MessageCircle,
  Globe,
  UtensilsCrossed,
  ShoppingBag,
  Send,
  HelpCircle,
  QrCode,
  Search,
  Sparkles,
  Clock,
  Copy,
  Check,
  X,
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

interface ProfileClientProps {
  slug: string;
  initialProfile: ClientProfile | null;
}

export default function ProfileClient({ slug, initialProfile }: ProfileClientProps) {
  const [profile, setProfile] = useState<ClientProfile | null>(initialProfile);
  const [loading, setLoading] = useState<boolean>(!initialProfile);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrModalDataUrl, setQrModalDataUrl] = useState<string>("");
  const [linkClicks, setLinkClicks] = useState<Record<string, number>>({});

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!initialProfile) {
        const cloudData = await getProfileFromSupabase(slug);
        if (cloudData && isMounted) {
          setProfile(cloudData);
          setLoading(false);
          return;
        }

        const localData = Storage.getBySlug(slug);
        if (localData && isMounted) {
          setProfile(localData);
          setLoading(false);
          return;
        }

        if (isMounted) setLoading(false);
      } else {
        const local = Storage.getBySlug(slug);
        if (local && local.updatedAt && initialProfile.updatedAt) {
          if (new Date(local.updatedAt) > new Date(initialProfile.updatedAt)) {
            setProfile(local);
          }
        }
      }
    }

    loadData();

    // Load click stats from localStorage
    try {
      const stats = localStorage.getItem(`maple_clicks_${slug}`);
      if (stats) setLinkClicks(JSON.parse(stats));
    } catch {}

    return () => {
      isMounted = false;
    };
  }, [slug, initialProfile]);

  // Generate QR for In-Person Sharing Modal
  useEffect(() => {
    if (showQrModal && !qrModalDataUrl) {
      const currentUrl = typeof window !== "undefined" ? window.location.href : `https://mapleconnect.app/p/${slug}`;
      QRCode.toDataURL(currentUrl, {
        width: 600,
        margin: 2,
        color: {
          dark: profile?.qrDark || "#0F172A",
          light: profile?.qrLight || "#FFFFFF",
        },
      })
        .then((url) => setQrModalDataUrl(url))
        .catch((e) => console.error("QR modal error:", e));
    }
  }, [showQrModal, qrModalDataUrl, slug, profile?.qrDark, profile?.qrLight]);

  // Save Contact as vCard (.vcf)
  function handleSaveContact() {
    if (!profile) return;
    const vCard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${profile.name || "Business Profile"}`,
      `ORG:${profile.name || "Business"}`,
      `TITLE:${profile.bio || "Official Profile"}`,
      profile.contactPhone ? `TEL;TYPE=WORK,VOICE:${profile.contactPhone}` : "",
      profile.contactEmail ? `EMAIL;TYPE=WORK,INTERNET:${profile.contactEmail}` : "",
      profile.address ? `ADR;TYPE=WORK:;;${profile.address};;;;` : "",
      typeof window !== "undefined" ? `URL:${window.location.href}` : "",
      "NOTE:Verified business destination powered by Maple Connect QR",
      "END:VCARD",
    ]
      .filter(Boolean)
      .join("\r\n");

    const blob = new Blob([vCard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(profile.slug || "contact").replace(/[^a-z0-9_-]/gi, "_")}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Share Link via Web Share API or Clipboard
  async function handleShare() {
    if (typeof window === "undefined") return;
    const shareData = {
      title: profile?.name || "Business Profile",
      text: profile?.bio || `Check out ${profile?.name} official links and contact!`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // User dismissed share sheet or unsupported
      }
    }

    navigator.clipboard.writeText(window.location.href);
    setCopiedLink("all");
    setTimeout(() => setCopiedLink(null), 3000);
  }

  // Copy Specific Link Address
  function handleCopySpecificLink(e: React.MouseEvent, dest: string, linkId: string) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(dest);
    setCopiedLink(linkId);
    setTimeout(() => setCopiedLink(null), 2500);
  }

  // Record Link Click
  function handleLinkClick(linkId: string) {
    setLinkClicks((prev) => {
      const next = { ...prev, [linkId]: (prev[linkId] || 0) + 1 };
      try {
        localStorage.setItem(`maple_clicks_${slug}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  // Render Brand Icon
  function renderLinkIcon(link: LinkItem) {
    const type = link.linkType;
    switch (type) {
      case "whatsapp":
        return <WhatsAppIcon size={22} />;
      case "instagram":
        return <InstagramIcon size={22} />;
      case "facebook":
        return <FacebookIcon size={22} />;
      case "youtube":
        return <YoutubeIcon size={22} />;
      case "linkedin":
        return <LinkedinIcon size={22} />;
      case "tiktok":
        return <TikTokIcon size={22} />;
      case "x":
        return <XIcon size={22} />;
      case "telegram":
        return <TelegramIcon size={22} />;
      case "google_maps":
        return <GoogleMapsIcon size={22} />;
      case "phone":
        return <Phone size={22} />;
      case "email":
        return <Mail size={22} />;
      case "store":
        return <ShoppingBag size={22} />;
      case "menu":
        return <UtensilsCrossed size={22} />;
      case "website":
      case "custom":
      default:
        return <Globe size={22} />;
    }
  }

  // Categories helper
  const availableCategories = useMemo(() => {
    if (!profile || !profile.links) return ["all"];
    const cats = new Set<string>(["all"]);
    const hasSocial = profile.links.some((l) =>
      ["instagram", "facebook", "youtube", "tiktok", "x", "linkedin", "telegram"].includes(l.linkType)
    );
    const hasMenuOrStore = profile.links.some((l) => ["menu", "store"].includes(l.linkType));
    const hasContact = profile.links.some((l) =>
      ["whatsapp", "phone", "email", "google_maps"].includes(l.linkType)
    );
    const hasFeatured = profile.links.some((l) => l.isFeatured || l.badge);

    if (hasFeatured) cats.add("featured");
    if (hasSocial) cats.add("social");
    if (hasMenuOrStore) cats.add("menu_store");
    if (hasContact) cats.add("contact");

    return Array.from(cats);
  }, [profile]);

  // Filtered links list
  const visibleLinks = useMemo(() => {
    if (!profile || !profile.links) return [];
    let list = profile.links.filter((l) => l.isEnabled !== false);

    // Category filter
    if (activeCategory === "featured") {
      list = list.filter((l) => l.isFeatured || l.badge);
    } else if (activeCategory === "social") {
      list = list.filter((l) =>
        ["instagram", "facebook", "youtube", "tiktok", "x", "linkedin", "telegram"].includes(l.linkType)
      );
    } else if (activeCategory === "menu_store") {
      list = list.filter((l) => ["menu", "store"].includes(l.linkType));
    } else if (activeCategory === "contact") {
      list = list.filter((l) =>
        ["whatsapp", "phone", "email", "google_maps"].includes(l.linkType)
      );
    }

    // In-page search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((l) => {
        const title = (l.title || "").toLowerCase();
        const desc = (l.description || "").toLowerCase();
        const dest = (l.destination || "").toLowerCase();
        return title.includes(q) || desc.includes(q) || dest.includes(q);
      });
    }

    return list;
  }, [profile, activeCategory, searchQuery]);

  if (loading) {
    return (
      <div className="profile-page-wrapper">
        <div className="ambient-background">
          <div className="ambient-orb orb-1" />
          <div className="ambient-orb orb-2" />
          <div className="ambient-mesh" />
        </div>
        <div className="profile-card-container">
          <div className="profile-not-found" style={{ textAlign: "center" }}>
            <div className="skeleton-avatar" style={{ margin: "0 auto 16px" }} />
            <div className="skeleton-title" style={{ margin: "0 auto 10px" }} />
            <div className="skeleton-bio" style={{ margin: "0 auto 20px" }} />
            <div className="skeleton-card" style={{ marginBottom: "12px" }} />
            <div className="skeleton-card" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page-wrapper">
        <div className="ambient-background">
          <div className="ambient-orb orb-1" />
          <div className="ambient-orb orb-2" />
          <div className="ambient-mesh" />
        </div>
        <div className="profile-card-container">
          <div className="profile-not-found">
            <div className="not-found-icon">
              <HelpCircle size={38} />
            </div>
            <h2>Profile Not Found</h2>
            <p>
              The QR link <code>/p/{slug}</code> is not registered yet or has been removed.
            </p>
            <div className="not-found-actions">
              <Link href="/" className="btn-suspended-contact">
                Open Admin Command Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sub = getSubscriptionState(profile);

  // =========================================================================
  // SUSPENDED / UNPAID / EXPIRED STATE (KILL-SWITCH TRIGGERED)
  // =========================================================================
  if (sub.isLocked) {
    const adminTel = profile.adminContact || profile.clientPhone || "";
    const cleanAdminTel = adminTel.replace(/[^0-9+]/g, "");
    const waRenewalUrl = cleanAdminTel
      ? `https://wa.me/${cleanAdminTel.replace(/^\+/, "")}?text=${encodeURIComponent(
          `Hello, I would like to renew the subscription for ${profile.name} (${profile.slug}).`
        )}`
      : "";

    return (
      <div className={`profile-page-wrapper theme-${profile.theme || "minimal"}`}>
        <div className="ambient-background">
          <div className="ambient-orb orb-1" />
          <div className="ambient-orb orb-2" />
          <div className="ambient-mesh" />
        </div>

        <div className="profile-card-container">
          <div className="profile-suspended">
            <div className="suspended-icon-box">
              <AlertTriangle size={38} />
            </div>

            <div className="suspended-badge">
              {sub.type === "expired" ? "Subscription Expired" : "Account Suspended"}
            </div>

            <h2>Page Not Available</h2>

            <p className="suspended-message-text">
              {profile.inactiveMessage ||
                "This business profile is temporarily unavailable due to pending subscription renewal."}
            </p>

            <div className="suspended-notice-box">
              <strong>Notice for Customers & Business Owner</strong>
              All links and interactive shortcuts for <strong>{profile.name}</strong> are
              temporarily locked until the account subscription is renewed by the agency administrator.
            </div>

            <div className="suspended-actions">
              {waRenewalUrl ? (
                <a
                  href={waRenewalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-suspended-contact"
                >
                  <MessageCircle size={20} />
                  Contact Agency to Renew Page
                </a>
              ) : adminTel ? (
                <a href={`tel:${cleanAdminTel}`} className="btn-suspended-contact">
                  <Phone size={20} />
                  Call Agency ({adminTel})
                </a>
              ) : null}

              <Link
                href="/"
                className="btn btn-secondary"
                style={{ justifyContent: "center", padding: "12px 18px", borderRadius: "14px" }}
              >
                Agency Admin Sign-In
              </Link>
            </div>

            <div className="suspended-footer">
              Maple Connect QR Agency Infrastructure &bull; Protected Node
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // ACTIVE VERIFIED PROFILE VIEW (TOP TIER EXPERIENCE)
  // =========================================================================
  const cleanPhone = (profile.contactPhone || "").replace(/[^0-9+]/g, "");
  const waContactUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.replace(/^\+/, "")}?text=${encodeURIComponent(
        `Hi ${profile.name}, I scanned your counter QR standee and would like to connect!`
      )}`
    : "";

  const mapsUrl = profile.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address)}`
    : "";

  return (
    <div className={`profile-page-wrapper theme-${profile.theme || "minimal"}`}>
      {/* Ambient background orbs */}
      <div className="ambient-background">
        <div className="ambient-orb orb-1" />
        <div className="ambient-orb orb-2" />
        <div className="ambient-mesh" />
      </div>

      <div className="profile-card-container">
        {/* Optional Announcement Banner */}
        {profile.announcement && (
          <div className="announcement-banner">
            <Sparkles size={16} />
            <span>{profile.announcement}</span>
          </div>
        )}

        {/* Profile Header */}
        <header className="profile-header">
          {/* Avatar with Glow and Online Pulsing Dot */}
          <div className="profile-avatar-wrapper">
            <div className="avatar-ring-glow" />
            <div className="profile-avatar-container">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="profile-avatar-img"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="avatar-placeholder-text">
                  {(profile.name || "B").substring(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="status-pulse-pill" title="Verified Active Business">
              <div className="pulse-indicator-dot" />
            </div>
          </div>

          {/* Shop Title & Verified Badge */}
          <div className="profile-title-row">
            <h1 className="profile-display-name">{profile.name || "Business Profile"}</h1>
            <span className="verified-badge" title="Verified Business QR Destination">
              <CheckCircle2 size={22} fill="currentColor" stroke="#FFFFFF" />
            </span>
          </div>

          {/* Bio / Tagline */}
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}

          {/* Business Meta (Address & Hours) */}
          {(profile.address || profile.businessHours) && (
            <div className="business-meta-row">
              {profile.address && (
                <a
                  href={mapsUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="business-meta-pill"
                  title="Open location in Google Maps"
                >
                  <MapPin size={13} />
                  <span>{profile.address}</span>
                </a>
              )}
              {profile.businessHours && (
                <div className="business-meta-pill" title="Operating hours">
                  <Clock size={13} />
                  <span>{profile.businessHours}</span>
                </div>
              )}
            </div>
          )}

          {/* Primary Action Button: Save Contact to Phone (vCard) */}
          {(profile.contactPhone || profile.contactEmail || profile.name) && (
            <div className="profile-save-contact-row">
              <button
                type="button"
                onClick={handleSaveContact}
                className="btn-save-contact"
                title="1-tap to save this business directly into your phone contacts"
              >
                <Download size={18} />
                Save to Phone Contacts
              </button>
            </div>
          )}

          {/* Quick Shortcuts Bar (Call, WhatsApp, Email, Maps, Share, Show QR) */}
          <div className="profile-contact-shortcuts">
            {profile.contactPhone && (
              <a
                href={`tel:${cleanPhone}`}
                className="contact-pill-btn"
                title={`Call ${profile.contactPhone}`}
              >
                <Phone size={19} />
              </a>
            )}

            {waContactUrl && (
              <a
                href={waContactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-pill-btn"
                title="Chat on WhatsApp"
              >
                <WhatsAppIcon size={20} />
              </a>
            )}

            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-pill-btn"
                title="Directions in Google Maps"
              >
                <GoogleMapsIcon size={20} />
              </a>
            )}

            {profile.contactEmail && (
              <a
                href={`mailto:${profile.contactEmail}`}
                className="contact-pill-btn"
                title={`Email ${profile.contactEmail}`}
              >
                <Mail size={19} />
              </a>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="contact-pill-btn"
              title="Share Profile Link"
            >
              <Share2 size={19} />
            </button>

            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="contact-pill-btn"
              title="Show QR Code on screen for friends to scan"
            >
              <QrCode size={19} />
            </button>
          </div>

          {copiedLink === "all" && (
            <div
              style={{
                marginTop: "12px",
                fontSize: "0.825rem",
                color: "#10B981",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <Check size={16} /> Link copied to clipboard!
            </div>
          )}
        </header>

        {/* Links Navigation (Filters & Search if multiple links exist) */}
        {(profile.links || []).length > 3 && (
          <div style={{ marginTop: "10px", width: "100%" }}>
            {/* Quick in-page search */}
            <div className="profile-search-wrap">
              <Search size={16} />
              <input
                type="text"
                className="profile-search-input"
                placeholder="Search links, menu, socials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94A3B8",
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category tabs */}
            {availableCategories.length > 2 && (
              <div className="profile-filter-tabs">
                {availableCategories.map((cat) => {
                  const labels: Record<string, string> = {
                    all: "All",
                    featured: "Featured ⭐",
                    social: "Socials 💬",
                    menu_store: "Menu & Store 🍔",
                    contact: "Contact 📞",
                  };
                  return (
                    <button
                      key={cat}
                      type="button"
                      className={`profile-filter-btn ${activeCategory === cat ? "active" : ""}`}
                      onClick={() => setActiveCategory(cat)}
                    >
                      {labels[cat] || cat}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Main Links Stream */}
        <main className="profile-links-section">
          {visibleLinks.length === 0 ? (
            <div
              style={{
                background: "var(--profile-card-bg, #FFF)",
                padding: "28px 20px",
                borderRadius: "20px",
                textAlign: "center",
                color: "var(--profile-text-muted, #64748B)",
                fontSize: "0.9rem",
                border: "1px solid var(--profile-btn-border, #E2E8F0)",
              }}
            >
              {searchQuery
                ? `No links matched "${searchQuery}".`
                : "No links published yet. Check back soon!"}
            </div>
          ) : (
            visibleLinks.map((link) => {
              const shapeClass = `shape-${profile.buttonShape || "rounded"}`;
              const isFeatured = link.isFeatured || Boolean(link.badge);

              return (
                <a
                  key={link.id}
                  href={link.destination}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleLinkClick(link.id)}
                  className={`public-link-btn ${shapeClass} ${isFeatured ? "link-featured" : ""}`}
                >
                  {/* Optional Badge */}
                  {link.badge && <span className="link-badge-pill">{link.badge}</span>}

                  <div className={`public-link-icon icon-type-${link.linkType}`}>
                    {renderLinkIcon(link)}
                  </div>

                  <div className="public-link-content">
                    <span className="public-link-title">{link.title || "Open Link"}</span>
                    {link.description ? (
                      <span className="public-link-subtitle">{link.description}</span>
                    ) : (
                      <span className="public-link-subtitle">
                        {link.destination.replace(/^https?:\/\//, "")}
                      </span>
                    )}
                  </div>

                  <div className="public-link-actions-end">
                    <button
                      type="button"
                      className="link-quick-copy-btn"
                      title="Copy link URL"
                      onClick={(e) => handleCopySpecificLink(e, link.destination, link.id)}
                    >
                      {copiedLink === link.id ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                    </button>
                    <ExternalLink size={16} />
                  </div>
                </a>
              );
            })
          )}
        </main>

        {/* Footer Brand Badge */}
        <footer className="profile-footer">
          <Link href="/" className="footer-badge">
            Powered by <strong>Maple Connect QR</strong>
          </Link>
        </footer>
      </div>

      {/* ========================================================================= */}
      {/* QR IN-PERSON SHARING MODAL */}
      {/* ========================================================================= */}
      {showQrModal && (
        <div className="profile-qr-modal-overlay" onClick={() => setShowQrModal(false)}>
          <div className="profile-qr-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "#F1F5F9",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#64748B",
              }}
            >
              <X size={18} />
            </button>

            <h3 className="profile-qr-modal-title">{profile.name}</h3>
            <p className="profile-qr-modal-sub">
              Scan with camera to open this profile on another phone
            </p>

            <div className="profile-qr-box">
              {qrModalDataUrl ? (
                <img
                  src={qrModalDataUrl}
                  alt="QR Code"
                  style={{ width: "220px", height: "220px", display: "block" }}
                />
              ) : (
                <div style={{ width: "220px", height: "220px" }} />
              )}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={handleShare}
              >
                <Share2 size={15} /> Share Link
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => setShowQrModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
