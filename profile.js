/**
 * Maple Connect QR — Public Profile Controller
 * Ultra-Responsive, Mobile-First Landing Page Controller
 * Features: 1-Tap Save Contact (.vcf), Native Web Share API, Category Filtering,
 * Brand Styling, Touch Haptics, and Offline Resilience.
 */

(function () {
  "use strict";

  // Storage Keys
  const STORAGE_KEYS = {
    PROFILES: "maple_qr_v1_profiles",
    ANALYTICS: "maple_qr_v1_analytics",
  };

  // SVG Icons Database for Link Types
  const ICONS = {
    whatsapp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`,
    instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
    facebook: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`,
    youtube: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`,
    tiktok: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>`,
    x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>`,
    website: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
    google_maps: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
    email: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
    telegram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`,
    store: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`,
    menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`,
    custom: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="13" x2="14" y2="11"></line><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
  };

  // Action Badges for Link Types
  const LINK_ACTION_LABELS = {
    whatsapp: "Chat",
    instagram: "Follow",
    facebook: "Connect",
    youtube: "Watch",
    linkedin: "Connect",
    tiktok: "Watch",
    x: "Follow",
    google_maps: "Directions",
    menu: "Menu",
    store: "Shop",
    phone: "Call",
    email: "Email",
    telegram: "Join",
    website: "Visit",
    custom: "Open",
  };

  // Standard Default Titles Database
  const DEFAULT_TITLES = {
    whatsapp: "Chat on WhatsApp",
    instagram: "Follow on Instagram",
    facebook: "Connect on Facebook",
    youtube: "Subscribe on YouTube",
    linkedin: "Connect on LinkedIn",
    tiktok: "Watch on TikTok",
    x: "Follow on X",
    website: "Visit Website",
    google_maps: "Google Maps Location",
    phone: "Call Telephone Hotline",
    email: "Send Email Inquiry",
    telegram: "Telegram Channel",
    store: "Shop Online Store",
    menu: "Browse Food & Drinks Menu",
    custom: "Custom Link",
  };

  // Theme Meta Colors for Mobile Browser Status Bars
  const THEME_META_COLORS = {
    minimal: "#F8FAFC",
    business: "#F1F5F9",
    premium: "#070B14",
    creative: "#1A0733",
    dark: "#000000",
  };

  // Safe LocalStorage Helper
  const Storage = {
    getProfiles() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
        if (raw) return JSON.parse(raw);
        return [];
      } catch (e) {
        console.error("Failed to read profiles from LocalStorage", e);
        return [];
      }
    },
    saveProfiles(profiles) {
      try {
        localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      } catch (e) {
        console.error("Failed to save profiles to LocalStorage", e);
      }
    },
    recordAnalyticsEvent(event) {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
        const list = raw ? JSON.parse(raw) : [];
        list.unshift(event);
        if (list.length > 500) list.length = 500;
        localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(list));
      } catch (e) {
        console.error("Failed to record analytics event", e);
      }
    },
  };

  // DOM Elements
  const elLoading = document.getElementById("profileLoading");
  const elNotFound = document.getElementById("profileNotFound");
  const elContent = document.getElementById("profileContent");
  const elDisplayName = document.getElementById("profileDisplayName");
  const elBio = document.getElementById("profileBio");
  const elAvatar = document.getElementById("profileAvatar");
  const elContactShortcuts = document.getElementById("profileContactShortcuts");
  const elLinksList = document.getElementById("profileLinksList");
  const elNotFoundMsg = document.getElementById("notFoundMsg");
  const elBtnLoadDemo = document.getElementById("btnLoadDemoProfile");
  const elMetaThemeColor = document.getElementById("metaThemeColor");
  const elSaveContactBtn = document.getElementById("btnSaveContact");
  const elFilterBar = document.getElementById("profileFilterBar");
  const elFilterChips = document.querySelectorAll(".filter-chip");

  // Mobile Bottom Bar Elements
  const elMobileBottomBar = document.getElementById("mobileBottomBar");
  const elBottomBarSaveBtn = document.getElementById("bottomBarSaveBtn");
  const elBottomBarShareBtn = document.getElementById("bottomBarShareBtn");
  const elBottomBarQrBtn = document.getElementById("bottomBarQrBtn");

  // Share Modal Elements
  const elFabShareBtn = document.getElementById("fabShareBtn");
  const elShareModalOverlay = document.getElementById("shareModalOverlay");
  const elCloseShareModalBtn = document.getElementById("closeShareModalBtn");
  const elShareQrTarget = document.getElementById("shareQrTarget");
  const elShareProfileName = document.getElementById("shareProfileName");
  const elShareUrlInput = document.getElementById("shareUrlInput");
  const elShareCopyBtn = document.getElementById("shareCopyBtn");
  const elBtnTriggerNativeShare = document.getElementById("btnTriggerNativeShare");
  const elToastContainer = document.getElementById("profileToastContainer");

  let currentProfile = null;
  let activeFilter = "all";

  // UTF-8 Resilient Payload Decoder
  function decodeProfileData(raw) {
    try {
      let clean = decodeURIComponent(raw).replace(/-/g, "+").replace(/_/g, "/");
      while (clean.length % 4) clean += "=";
      let json = "";
      try {
        const binary = atob(clean);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        json = new TextDecoder("utf-8").decode(bytes);
      } catch (e1) {
        try {
          json = decodeURIComponent(escape(atob(clean)));
        } catch (e2) {
          json = atob(clean);
        }
      }

      const c = JSON.parse(json);
      return {
        id: "encoded_" + (c.s || "profile"),
        name: c.n || "My Profile",
        displayName: c.n || "My Profile",
        slug: c.s || "profile",
        description: c.b || "",
        avatarUrl: c.a || "",
        contactPhone: c.p || "",
        contactEmail: c.e || "",
        theme: c.t || "minimal",
        customization: {
          buttonStyle: c.sh || "rounded",
        },
        links: Array.isArray(c.l)
          ? c.l.map((item, idx) => {
              const type = item.t || "custom";
              return {
                id: "lnk_" + idx,
                linkType: type,
                title: item.ti || DEFAULT_TITLES[type] || "Link",
                destination: item.d || "",
                description: item.ds || "",
                isEnabled: true,
                sortOrder: idx,
              };
            })
          : [],
      };
    } catch (e) {
      console.warn("Could not decode profile payload", e);
      return null;
    }
  }

  // Initialize Page
  async function init() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("u") || params.get("slug");
    const id = params.get("id");

    // Check if payload is directly embedded in hash (#d=...) or query (?d=...)
    let encodedPayload = params.get("d");
    if (!encodedPayload && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      encodedPayload = hashParams.get("d") || window.location.hash.replace(/^#d=/, "");
    }

    let profile = null;

    // 1. Try Cloud Database first (Dynamic QR Live Mode)
    if (slug && window.CloudSync && window.CloudSync.isConfigured()) {
      try {
        const cloudProfile = await window.CloudSync.getProfile(slug);
        if (cloudProfile) {
          profile = cloudProfile;
          // Cache to local storage for instant offline loading on next scan
          try {
            const cachedProfiles = Storage.getProfiles();
            const pSlug = (profile.slug || slug || "").toLowerCase();
            const existingIdx = cachedProfiles.findIndex((p) => (p.slug || "").toLowerCase() === pSlug);
            if (existingIdx !== -1) {
              cachedProfiles[existingIdx] = profile;
            } else {
              cachedProfiles.unshift(profile);
            }
            Storage.saveProfiles(cachedProfiles);
          } catch (e) {
            console.warn("Failed to cache cloud profile in Storage", e);
          }
        }
      } catch (cloudErr) {
        console.warn("CloudSync query failed, checking fallbacks:", cloudErr);
      }
    }

    // 2. Try decoding embedded QR payload (#d=...) if not loaded from cloud
    if (!profile && encodedPayload) {
      profile = decodeProfileData(encodedPayload);
      if (profile) {
        // Cache this profile on the viewer's device so subsequent visits by slug also work
        try {
          const cachedProfiles = Storage.getProfiles();
          const pSlug = (profile.slug || slug || "").toLowerCase();
          const existingIdx = cachedProfiles.findIndex((p) => (p.slug || "").toLowerCase() === pSlug);
          if (existingIdx !== -1) {
            cachedProfiles[existingIdx] = profile;
          } else {
            cachedProfiles.unshift(profile);
          }
          Storage.saveProfiles(cachedProfiles);
        } catch (e) {
          console.warn("Failed to cache profile in Storage", e);
        }
      }
    }

    const profiles = Storage.getProfiles();

    // 3. Search saved profiles if not found via cloud or embedded payload
    if (!profile && (slug || id)) {
      profile = profiles.find((p) => {
        if (id && p.id === id) return true;
        if (slug && p.slug && p.slug.toLowerCase() === slug.toLowerCase()) return true;
        return false;
      });
    }

    // 3. Check active QR from local creator if slug matches
    if (!profile && slug) {
      try {
        const activeRaw = localStorage.getItem("maple_active_qr");
        if (activeRaw) {
          const active = JSON.parse(activeRaw);
          if (active.slug && active.slug.toLowerCase() === slug.toLowerCase()) {
            profile = {
              id: "active_qr_profile",
              name: active.name,
              displayName: active.name,
              slug: active.slug,
              description: active.bio,
              avatarUrl: active.avatarUrl,
              contactPhone: active.contactPhone,
              contactEmail: active.contactEmail,
              theme: active.theme,
              customization: {
                buttonStyle: active.buttonShape,
              },
              links: active.links,
            };
          }
        }
      } catch (e) {}
    }

    // 4. Fallback: If no parameters given at all, check if any profile is stored
    if (!profile && !slug && !id && !encodedPayload) {
      if (profiles && profiles.length > 0) {
        profile = profiles[0];
      }
    }

    if (!profile) {
      showNotFound(slug || id ? `Profile "${slug || id}" could not be found.` : "No profile specified. Scan a QR code or create your profile in the creator.");
      return;
    }

    currentProfile = profile;
    renderProfile(profile);
    trackProfileView(profile);
    setupInteractions(profile);
  }

  // Render 404 / Missing View
  function showNotFound(msg) {
    elLoading.classList.add("hidden");
    elContent.classList.add("hidden");
    elNotFound.classList.remove("hidden");
    if (msg) elNotFoundMsg.textContent = msg;
    document.title = "Profile Not Found — Maple Connect QR";
  }

  // Render Active Profile
  function renderProfile(p) {
    elLoading.classList.add("hidden");
    elNotFound.classList.add("hidden");
    elContent.classList.remove("hidden");

    // Title & Meta
    const titleText = p.displayName || p.name || "Multi-Link Profile";
    document.title = `${titleText} — Maple Connect QR`;
    elDisplayName.textContent = titleText;
    elBio.textContent = p.description || "";

    // Avatar
    if (p.avatarUrl && p.avatarUrl.trim() !== "") {
      elAvatar.src = p.avatarUrl;
      elAvatar.alt = titleText;
    } else {
      elAvatar.src = "assets/logo.svg";
    }

    // Apply Themes, Theme-Color & Custom Styling
    applyCustomStyling(p);

    // Save Contact Row Visibility
    setupSaveContactButton(p);

    // Contact Shortcuts (Phone, Email, Website)
    renderContactShortcuts(p);

    // Filter Chips Setup
    setupFilterChips(p);

    // Render Enabled Links
    renderLinks(p);

    // Show Mobile Bottom Bar
    if (elMobileBottomBar) {
      elMobileBottomBar.classList.remove("hidden");
    }
  }

  // Apply Styling / Theming
  function applyCustomStyling(p) {
    const body = document.body;
    body.className = "";

    const theme = p.theme || "minimal";
    body.classList.add(`theme-${theme}`);

    // Update Mobile Browser Theme-Color
    if (elMetaThemeColor && THEME_META_COLORS[theme]) {
      elMetaThemeColor.setAttribute("content", THEME_META_COLORS[theme]);
    }

    const c = p.customization || {};

    // Button Style class
    if (c.buttonStyle) {
      body.classList.add(`btn-style-${c.buttonStyle}`);
    }

    // Font Family
    if (c.fontFamily === "serif") {
      body.style.setProperty("--font-body", "Georgia, 'Times New Roman', serif");
      body.style.setProperty("--font-display", "Georgia, 'Times New Roman', serif");
    } else if (c.fontFamily === "mono") {
      body.style.setProperty("--font-body", "ui-monospace, SFMono-Regular, Menlo, monospace");
      body.style.setProperty("--font-display", "ui-monospace, SFMono-Regular, Menlo, monospace");
    }

    // Custom Overrides (if provided)
    if (c.backgroundColor) {
      body.style.setProperty("--profile-bg", c.backgroundColor);
      if (elMetaThemeColor) elMetaThemeColor.setAttribute("content", c.backgroundColor);
    }
    if (c.accentColor) {
      body.style.setProperty("--profile-accent", c.accentColor);
    }
    if (c.cardColor) {
      body.style.setProperty("--profile-btn-bg", c.cardColor);
    }
    if (c.textColor) {
      body.style.setProperty("--profile-text", c.textColor);
      body.style.setProperty("--profile-btn-text", c.textColor);
    }
  }

  // Generate & Download RFC-Compliant vCard (.vcf)
  function downloadVCard(p) {
    triggerHaptic();
    const fullName = p.displayName || p.name || "Contact";
    const nameParts = fullName.trim().split(" ");
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
    const firstName = nameParts[0] || "";

    const vcardLines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN;CHARSET=UTF-8:${fullName}`,
      `N;CHARSET=UTF-8:${lastName};${firstName};;;`,
      `ORG;CHARSET=UTF-8:${fullName}`,
      "TITLE:Connect via Maple QR",
    ];

    if (p.contactPhone) {
      const cleanPhone = p.contactPhone.replace(/[^0-9+]/g, "");
      vcardLines.push(`TEL;TYPE=CELL,VOICE:${cleanPhone}`);
    }

    if (p.contactEmail) {
      vcardLines.push(`EMAIL;TYPE=WORK,INTERNET:${p.contactEmail.trim()}`);
    }

    if (p.websiteUrl) {
      let web = p.websiteUrl.trim();
      if (!web.startsWith("http://") && !web.startsWith("https://")) web = "https://" + web;
      vcardLines.push(`URL;TYPE=WORK:${web}`);
    }

    if (p.description) {
      vcardLines.push(`NOTE;CHARSET=UTF-8:${p.description.replace(/\n/g, " ")}`);
    }

    // Include primary links
    if (Array.isArray(p.links)) {
      p.links.forEach((link) => {
        if (link.destination && link.isEnabled !== false) {
          vcardLines.push(`URL;TYPE=${(link.linkType || "LINK").toUpperCase()}:${link.destination}`);
        }
      });
    }

    vcardLines.push("CATEGORIES:Maple Connect QR");
    vcardLines.push("END:VCARD");

    const vcardString = vcardLines.join("\r\n");
    const blob = new Blob([vcardString], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${(p.slug || "contact").replace(/[^a-z0-9_-]/gi, "_")}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("Opening address book / vCard...");
  }

  // Setup 1-Tap Save Contact Button
  function setupSaveContactButton(p) {
    const hasContactInfo = p.contactPhone || p.contactEmail || p.websiteUrl || (p.links && p.links.length > 0);
    if (!hasContactInfo) {
      if (elSaveContactBtn) elSaveContactBtn.style.display = "none";
      return;
    }

    if (elSaveContactBtn) {
      elSaveContactBtn.onclick = () => downloadVCard(p);
    }
    if (elBottomBarSaveBtn) {
      elBottomBarSaveBtn.onclick = () => downloadVCard(p);
    }
  }

  // Render Top Quick Contact Buttons
  function renderContactShortcuts(p) {
    elContactShortcuts.innerHTML = "";
    let hasContact = false;

    // Phone Call
    if (p.contactPhone) {
      const cleanPhone = p.contactPhone.replace(/[^0-9+]/g, "");
      const a = document.createElement("a");
      a.href = `tel:${cleanPhone}`;
      a.className = "contact-pill-btn";
      a.title = `Call ${p.contactPhone}`;
      a.setAttribute("aria-label", "Call phone number");
      a.innerHTML = ICONS.phone;
      a.addEventListener("click", () => {
        triggerHaptic();
        trackClick(p, "contact_phone", "Phone Call");
      });
      elContactShortcuts.appendChild(a);
      hasContact = true;
    }

    // Email
    if (p.contactEmail) {
      const a = document.createElement("a");
      a.href = `mailto:${p.contactEmail}?subject=Inquiry via Maple Connect QR`;
      a.className = "contact-pill-btn";
      a.title = `Email ${p.contactEmail}`;
      a.setAttribute("aria-label", "Send email");
      a.innerHTML = ICONS.email;
      a.addEventListener("click", () => {
        triggerHaptic();
        trackClick(p, "contact_email", "Email Inquiry");
      });
      elContactShortcuts.appendChild(a);
      hasContact = true;
    }

    // Primary Website
    if (p.websiteUrl) {
      let web = p.websiteUrl.trim();
      if (!web.startsWith("http://") && !web.startsWith("https://")) web = "https://" + web;
      const a = document.createElement("a");
      a.href = web;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "contact-pill-btn";
      a.title = `Visit Website`;
      a.setAttribute("aria-label", "Visit website");
      a.innerHTML = ICONS.website;
      a.addEventListener("click", () => {
        triggerHaptic();
        trackClick(p, "contact_web", "Website");
      });
      elContactShortcuts.appendChild(a);
      hasContact = true;
    }

    elContactShortcuts.style.display = hasContact ? "flex" : "none";
  }

  // Setup Category Filter Chips
  function setupFilterChips(p) {
    const links = Array.isArray(p.links) ? p.links : [];
    if (links.length >= 4 && elFilterBar) {
      elFilterBar.classList.remove("hidden");
      elFilterChips.forEach((chip) => {
        chip.addEventListener("click", () => {
          triggerHaptic();
          elFilterChips.forEach((c) => c.classList.remove("active"));
          chip.classList.add("active");
          activeFilter = chip.getAttribute("data-filter") || "all";
          renderLinks(p);
        });
      });
    } else if (elFilterBar) {
      elFilterBar.classList.add("hidden");
    }
  }

  // Render Links Stream
  function renderLinks(p) {
    elLinksList.innerHTML = "";
    const links = Array.isArray(p.links) ? p.links : [];

    // Filter enabled links & active category
    let activeLinks = links
      .filter((lnk) => lnk.isEnabled !== false)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    if (activeFilter === "contact") {
      activeLinks = activeLinks.filter((l) => ["whatsapp", "phone", "email", "telegram"].includes(l.linkType));
    } else if (activeFilter === "social") {
      activeLinks = activeLinks.filter((l) => ["instagram", "facebook", "youtube", "linkedin", "tiktok", "x"].includes(l.linkType));
    } else if (activeFilter === "other") {
      activeLinks = activeLinks.filter((l) => ["website", "google_maps", "menu", "store", "custom"].includes(l.linkType));
    }

    if (activeLinks.length === 0) {
      const emptyNote = document.createElement("div");
      emptyNote.style.textAlign = "center";
      emptyNote.style.padding = "28px 16px";
      emptyNote.style.color = "var(--profile-text-muted)";
      emptyNote.style.fontSize = "0.9rem";
      emptyNote.textContent = activeFilter === "all" ? "No active links available at this time." : "No links in this category.";
      elLinksList.appendChild(emptyNote);
      return;
    }

    activeLinks.forEach((link, idx) => {
      const sanitizedUrl = sanitizeDestination(link);

      const a = document.createElement("a");
      a.className = "public-link-btn";
      a.href = sanitizedUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.style.setProperty("--item-idx", idx);

      // Icon Box with Brand Color Gradient
      const iconWrap = document.createElement("div");
      iconWrap.className = `public-link-icon icon-type-${link.linkType || "custom"}`;
      iconWrap.innerHTML = ICONS[link.linkType] || ICONS.custom;

      // Text Content
      const contentWrap = document.createElement("div");
      contentWrap.className = "public-link-content";

      const titleSpan = document.createElement("span");
      titleSpan.className = "public-link-title";
      titleSpan.textContent = link.title;
      contentWrap.appendChild(titleSpan);

      if (link.description && link.description.trim() !== "") {
        const subSpan = document.createElement("span");
        subSpan.className = "public-link-subtitle";
        subSpan.textContent = link.description;
        contentWrap.appendChild(subSpan);
      }

      // Actions End (Quick Copy + Arrow)
      const actionsEnd = document.createElement("div");
      actionsEnd.className = "public-link-actions-end";

      // 1-Tap Copy Link Button
      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "link-quick-copy-btn";
      copyBtn.title = "Copy link";
      copyBtn.setAttribute("aria-label", "Copy link URL");
      copyBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;

      copyBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerHaptic();
        copyToClipboard(sanitizedUrl);
        showToast("Link copied!");
      });

      // Chevron Arrow
      const arrowWrap = document.createElement("div");
      arrowWrap.className = "public-link-arrow";
      arrowWrap.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

      actionsEnd.appendChild(copyBtn);
      actionsEnd.appendChild(arrowWrap);

      a.appendChild(iconWrap);
      a.appendChild(contentWrap);
      a.appendChild(actionsEnd);

      // Track click
      a.addEventListener("click", () => {
        triggerHaptic();
        trackClick(p, link.id, link.title);
      });

      elLinksList.appendChild(a);
    });
  }

  // Destination Sanitization
  function sanitizeDestination(link) {
    const type = link.linkType;
    let dest = (link.destination || "").trim();

    if (type === "whatsapp") {
      if (dest.startsWith("https://wa.me/")) return dest;
      const cleanPhone = dest.replace(/[^0-9]/g, "");
      return `https://wa.me/${cleanPhone}`;
    }

    if (type === "phone") {
      const cleanPhone = dest.replace(/[^0-9+]/g, "");
      return `tel:${cleanPhone}`;
    }

    if (type === "email") {
      if (dest.startsWith("mailto:")) return dest;
      return `mailto:${dest}`;
    }

    if (type === "google_maps") {
      if (dest.startsWith("http://") || dest.startsWith("https://")) return dest;
      return `https://maps.google.com/?q=${encodeURIComponent(dest)}`;
    }

    if (!dest.startsWith("http://") && !dest.startsWith("https://") && !dest.startsWith("tel:") && !dest.startsWith("mailto:")) {
      return "https://" + dest;
    }

    return dest;
  }

  // Analytics: Record Page View
  function trackProfileView(p) {
    const sessionKey = `maple_viewed_${p.id}`;
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, "1");

      const profiles = Storage.getProfiles();
      const idx = profiles.findIndex((item) => item.id === p.id);
      if (idx !== -1) {
        profiles[idx].viewCount = (profiles[idx].viewCount || 0) + 1;
        Storage.saveProfiles(profiles);
      }

      Storage.recordAnalyticsEvent({
        id: "evt_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
        type: "view",
        profileId: p.id,
        profileName: p.displayName || p.name,
        slug: p.slug,
        timestamp: Date.now(),
        referrer: document.referrer || "Direct / QR Scan",
        userAgent: navigator.userAgent || "Unknown Device",
      });
    }
  }

  // Analytics: Record Outbound Link Click
  function trackClick(p, linkId, linkTitle) {
    const profiles = Storage.getProfiles();
    const pIdx = profiles.findIndex((item) => item.id === p.id);
    if (pIdx !== -1) {
      profiles[pIdx].clickCount = (profiles[pIdx].clickCount || 0) + 1;
      if (Array.isArray(profiles[pIdx].links)) {
        const lIdx = profiles[pIdx].links.findIndex((l) => l.id === linkId);
        if (lIdx !== -1) {
          profiles[pIdx].links[lIdx].clickCount = (profiles[pIdx].links[lIdx].clickCount || 0) + 1;
        }
      }
      Storage.saveProfiles(profiles);
    }

    Storage.recordAnalyticsEvent({
      id: "evt_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      type: "click",
      profileId: p.id,
      profileName: p.displayName || p.name,
      linkId: linkId,
      linkTitle: linkTitle || "Link",
      timestamp: Date.now(),
    });
  }

  // Native Web Share API + Modal Fallback
  function shareProfile(p) {
    triggerHaptic();
    const currentUrl = window.location.href;
    const shareData = {
      title: p.displayName || p.name || "Connect with me",
      text: p.description || `Scan or tap to open ${p.displayName || p.name}'s multi-link hub`,
      url: currentUrl,
    };

    if (navigator.share) {
      navigator.share(shareData).catch((err) => {
        if (err.name !== "AbortError") {
          openShareModal(p);
        }
      });
    } else {
      openShareModal(p);
    }
  }

  // Open Share & QR Modal
  function openShareModal(p) {
    elShareModalOverlay.classList.remove("hidden");
  }

  function closeShareModal() {
    elShareModalOverlay.classList.add("hidden");
  }

  // Setup Share Modal & Actions
  function setupInteractions(p) {
    const currentUrl = window.location.href;
    elShareUrlInput.value = currentUrl;
    elShareProfileName.textContent = p.displayName || p.name;

    // Render Modal QR
    elShareQrTarget.innerHTML = "";
    if (typeof QRCode !== "undefined") {
      new QRCode(elShareQrTarget, {
        text: currentUrl,
        width: 170,
        height: 170,
        colorDark: "#0F172A",
        colorLight: "#FFFFFF",
        correctLevel: QRCode.CorrectLevel.H,
      });
    }

    // Share Triggers
    if (elFabShareBtn) elFabShareBtn.onclick = () => shareProfile(p);
    if (elBottomBarShareBtn) elBottomBarShareBtn.onclick = () => shareProfile(p);
    if (elBottomBarQrBtn) elBottomBarQrBtn.onclick = () => openShareModal(p);
    if (elBtnTriggerNativeShare) elBtnTriggerNativeShare.onclick = () => shareProfile(p);

    if (elCloseShareModalBtn) elCloseShareModalBtn.onclick = closeShareModal;
    if (elShareModalOverlay) {
      elShareModalOverlay.onclick = (e) => {
        if (e.target === elShareModalOverlay) closeShareModal();
      };
    }

    // Modal Copy Link Button
    if (elShareCopyBtn) {
      elShareCopyBtn.onclick = () => {
        triggerHaptic();
        copyToClipboard(currentUrl);
        showToast("Profile URL copied to clipboard!");
        elShareCopyBtn.innerHTML = `<span>Copied!</span>`;
        setTimeout(() => {
          elShareCopyBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>Copy</span>
          `;
        }, 2000);
      };
    }
  }

  // Clipboard Helper
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    const input = document.createElement("input");
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
  }

  // Subtle Haptic Feedback (Android Chrome / supported devices)
  function triggerHaptic() {
    if (navigator.vibrate) {
      try {
        navigator.vibrate(12);
      } catch (e) {}
    }
  }

  // Toast Notification
  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "profile-toast";
    toast.textContent = message;
    elToastContainer.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 2500);
  }

  // Start on DOM ready
  document.addEventListener("DOMContentLoaded", init);
})();
