/**
 * Maple Connect QR — Single-Page Multi-Link QR Generator
 * Pure Vanilla JavaScript with real-time QR generation and live phone preview.
 * Tagline: One QR. Everything Connected.
 */

(function () {
  "use strict";

  // Storage Keys
  const STORAGE_KEYS = {
    ACTIVE_QR: "maple_active_qr",
    PROFILES: "maple_qr_v1_profiles",
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

  // Theme Color Configurations
  const THEMES = {
    minimal: { bg: "#F8FAFC", text: "#0F172A", accent: "#2563EB", card: "#FFFFFF" },
    business: { bg: "#F1F5F9", text: "#0F172A", accent: "#1D4ED8", card: "#FFFFFF" },
    premium: { bg: "#0B1120", text: "#FFFFFF", accent: "#38BDF8", card: "#172244" },
    creative: { bg: "#2E0854", text: "#FFFFFF", accent: "#F472B6", card: "#4C1D95" },
    dark: { bg: "#000000", text: "#FFFFFF", accent: "#3B82F6", card: "#18181B" },
  };

  // Dynamic Host Resolver
  function getDefaultHost() {
    if (typeof window !== "undefined" && window.location && window.location.origin && window.location.origin !== "null") {
      return window.location.origin;
    }
    return "";
  }

  // Current Active QR Model - Clean Production Default
  let currentModel = {
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
    qrMode: "wifi",
    networkHost: getDefaultHost(),
    links: [],
  };

  // DOM Elements Cache
  const DOM = {
    // Form Inputs
    inputProfileName: document.getElementById("inputProfileName"),
    inputProfileSlug: document.getElementById("inputProfileSlug"),
    inputProfileBio: document.getElementById("inputProfileBio"),
    avatarThumbImg: document.getElementById("avatarThumbImg"),
    avatarEmptyIcon: document.getElementById("avatarEmptyIcon"),
    fileAvatarInput: document.getElementById("fileAvatarInput"),
    inputAvatarUrl: document.getElementById("inputAvatarUrl"),
    btnRemoveAvatar: document.getElementById("btnRemoveAvatar"),
    inputContactPhone: document.getElementById("inputContactPhone"),
    inputContactEmail: document.getElementById("inputContactEmail"),

    // Links Stream
    btnOpenAddLink: document.getElementById("btnOpenAddLink"),
    linksStreamContainer: document.getElementById("linksStreamContainer"),
    emptyLinksState: document.getElementById("emptyLinksState"),

    // Theme & Shapes
    themeCards: document.querySelectorAll(".theme-card"),
    shapeBtns: document.querySelectorAll(".shape-btn"),

    // Mode Switcher & Host
    tabModeWifi: document.getElementById("tabModeWifi"),
    tabModeLocal: document.getElementById("tabModeLocal"),
    tabModeOffline: document.getElementById("tabModeOffline"),
    hostConfigRow: document.getElementById("hostConfigRow"),
    inputHostAddress: document.getElementById("inputHostAddress"),
    btnApplyHost: document.getElementById("btnApplyHost"),
    hostHintText: document.getElementById("hostHintText"),

    // View Toggle Pills & Cards
    tabViewBoth: document.getElementById("tabViewBoth"),
    tabViewQR: document.getElementById("tabViewQR"),
    tabViewPhone: document.getElementById("tabViewPhone"),
    cardQRHero: document.getElementById("cardQRHero"),
    cardPhonePreview: document.getElementById("cardPhonePreview"),

    // QR Preview
    heroQrTarget: document.getElementById("heroQrTarget"),
    qrTargetUrlText: document.getElementById("qrTargetUrlText"),
    btnDownloadPNG: document.getElementById("btnDownloadPNG"),
    btnDownloadSVG: document.getElementById("btnDownloadSVG"),
    btnCopyPageUrl: document.getElementById("btnCopyPageUrl"),
    btnOpenPageDirect: document.getElementById("btnOpenPageDirect"),
    qrDarkColor: document.getElementById("qrDarkColor"),
    qrLightColor: document.getElementById("qrLightColor"),

    // Live Smartphone
    livePhoneScreen: document.getElementById("livePhoneScreen"),
    livePhoneAvatar: document.getElementById("livePhoneAvatar"),
    livePhoneName: document.getElementById("livePhoneName"),
    livePhoneBio: document.getElementById("livePhoneBio"),
    livePhoneContactBar: document.getElementById("livePhoneContactBar"),
    phoneIconCall: document.getElementById("phoneIconCall"),
    phoneIconEmail: document.getElementById("phoneIconEmail"),
    livePhoneLinksStream: document.getElementById("livePhoneLinksStream"),

    // Navbar Actions
    btnResetForm: document.getElementById("btnResetForm"),
    btnLoadExample: document.getElementById("btnLoadExample"),
    navPreviewLiveBtn: document.getElementById("navPreviewLiveBtn"),

    // Link Modal
    linkModal: document.getElementById("linkModal"),
    linkModalTitle: document.getElementById("linkModalTitle"),
    btnCloseLinkModal: document.getElementById("btnCloseLinkModal"),
    btnCancelLink: document.getElementById("btnCancelLink"),
    btnSaveLink: document.getElementById("btnSaveLink"),
    editLinkId: document.getElementById("editLinkId"),
    selectLinkType: document.getElementById("selectLinkType"),
    inputLinkTitle: document.getElementById("inputLinkTitle"),
    inputLinkSubtitle: document.getElementById("inputLinkSubtitle"),

    // Dest Wrappers
    destStandard: document.getElementById("destStandard"),
    inputStandardDest: document.getElementById("inputStandardDest"),
    destWhatsApp: document.getElementById("destWhatsApp"),
    inputWaNumber: document.getElementById("inputWaNumber"),
    inputWaPrefill: document.getElementById("inputWaPrefill"),
    destPhone: document.getElementById("destPhone"),
    inputPhoneNum: document.getElementById("inputPhoneNum"),
    destEmail: document.getElementById("destEmail"),
    inputEmailAddr: document.getElementById("inputEmailAddr"),
    inputEmailSub: document.getElementById("inputEmailSub"),
    destMaps: document.getElementById("destMaps"),
    inputMapsLoc: document.getElementById("inputMapsLoc"),

    // Toast Shelf
    toastShelf: document.getElementById("toastShelf"),
  };

  // Initialize
  function init() {
    loadSavedData();
    bindFormEvents();
    bindModalEvents();
    bindExportEvents();
    bindModeSwitcherEvents();
    bindPreviewViewTabs();
    renderAll();
  }

  // Load from LocalStorage
  function loadSavedData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_QR);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name === "Alex Morgan" || parsed.slug === "alex-morgan") {
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_QR);
          return;
        }
        if (parsed.networkHost && parsed.networkHost.includes("192.168.31.217")) {
          parsed.networkHost = getDefaultHost();
        }
        currentModel = Object.assign(currentModel, parsed);
      }
    } catch (e) {
      console.warn("Could not load saved QR data", e);
    }
  }

  // Persist to LocalStorage
  function persistData() {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_QR, JSON.stringify(currentModel));

      let profiles = [];
      const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
      if (raw) profiles = JSON.parse(raw);

      const existingIndex = profiles.findIndex((p) => p.slug === currentModel.slug || p.id === "active_qr_profile");
      const profileRecord = {
        id: "active_qr_profile",
        name: currentModel.name,
        displayName: currentModel.name,
        slug: currentModel.slug,
        description: currentModel.bio,
        avatarUrl: currentModel.avatarUrl,
        contactPhone: currentModel.contactPhone,
        contactEmail: currentModel.contactEmail,
        theme: currentModel.theme,
        customization: {
          buttonStyle: currentModel.buttonShape,
        },
        links: currentModel.links,
        viewCount: 1,
        clickCount: 0,
      };

      if (existingIndex >= 0) {
        profiles[existingIndex] = profileRecord;
      } else {
        profiles.unshift(profileRecord);
      }

      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    } catch (e) {
      console.warn("Could not persist QR data", e);
    }
  }

  // Bind Mode Switcher
  function bindModeSwitcherEvents() {
    DOM.tabModeWifi.addEventListener("click", () => {
      setQRMode("wifi");
    });

    DOM.tabModeLocal.addEventListener("click", () => {
      setQRMode("portable");
    });

    DOM.tabModeOffline.addEventListener("click", () => {
      setQRMode("offline");
    });

    DOM.btnApplyHost.addEventListener("click", () => {
      const val = DOM.inputHostAddress.value.trim().replace(/\/$/, "");
      if (val) {
        currentModel.networkHost = val;
        renderLiveQR();
        persistData();
        showToast("Network host updated!");
      }
    });

    DOM.inputHostAddress.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        DOM.btnApplyHost.click();
      }
    });
  }

  function setQRMode(mode) {
    currentModel.qrMode = mode;
    DOM.tabModeWifi.classList.toggle("active", mode === "wifi");
    DOM.tabModeLocal.classList.toggle("active", mode === "portable" || mode === "local");
    DOM.tabModeOffline.classList.toggle("active", mode === "offline");

    if (mode === "wifi" || mode === "portable" || mode === "local") {
      DOM.hostConfigRow.classList.remove("hidden");
      DOM.inputHostAddress.value = currentModel.networkHost || getDefaultHost();
      if (mode === "wifi") {
        DOM.hostHintText.textContent = "⚡ Clean short link: instant 0.1s scan on any phone camera.";
      } else {
        DOM.hostHintText.textContent = "📦 Standalone profile: all links & styling embedded into QR code.";
      }
    } else if (mode === "offline") {
      DOM.hostConfigRow.classList.add("hidden");
    }

    renderLiveQR();
    persistData();
  }

  // Bind Preview View Tabs (Show Both / QR Code / Phone Preview)
  function bindPreviewViewTabs() {
    const tabs = [
      { btn: DOM.tabViewBoth, view: "both" },
      { btn: DOM.tabViewQR, view: "qr" },
      { btn: DOM.tabViewPhone, view: "phone" },
    ];

    tabs.forEach(({ btn, view }) => {
      if (!btn) return;
      btn.addEventListener("click", () => {
        tabs.forEach((t) => t.btn && t.btn.classList.toggle("active", t.view === view));
        if (view === "both") {
          if (DOM.cardQRHero) DOM.cardQRHero.classList.remove("hidden");
          if (DOM.cardPhonePreview) DOM.cardPhonePreview.classList.remove("hidden");
        } else if (view === "qr") {
          if (DOM.cardQRHero) DOM.cardQRHero.classList.remove("hidden");
          if (DOM.cardPhonePreview) DOM.cardPhonePreview.classList.add("hidden");
        } else if (view === "phone") {
          if (DOM.cardQRHero) DOM.cardQRHero.classList.add("hidden");
          if (DOM.cardPhonePreview) DOM.cardPhonePreview.classList.remove("hidden");
        }
      });
    });
  }

  // Bind Form Inputs
  function bindFormEvents() {
    // Name
    DOM.inputProfileName.addEventListener("input", (e) => {
      currentModel.name = e.target.value.trim();
      const cleanSlug = slugify(currentModel.name);
      currentModel.slug = cleanSlug;
      DOM.inputProfileSlug.value = cleanSlug;
      renderLiveQR();
      renderPhoneMockup();
      persistData();
    });

    // Slug
    DOM.inputProfileSlug.addEventListener("input", (e) => {
      const clean = slugify(e.target.value);
      currentModel.slug = clean;
      DOM.inputProfileSlug.value = clean;
      renderLiveQR();
      renderPhoneMockup();
      persistData();
    });

    // Bio
    DOM.inputProfileBio.addEventListener("input", (e) => {
      currentModel.bio = e.target.value.trim();
      renderPhoneMockup();
      renderLiveQR();
      persistData();
    });

    // Phone & Email
    DOM.inputContactPhone.addEventListener("input", (e) => {
      currentModel.contactPhone = e.target.value.trim();
      renderPhoneMockup();
      renderLiveQR();
      persistData();
    });

    DOM.inputContactEmail.addEventListener("input", (e) => {
      currentModel.contactEmail = e.target.value.trim();
      renderPhoneMockup();
      renderLiveQR();
      persistData();
    });

    // Avatar URL
    DOM.inputAvatarUrl.addEventListener("input", (e) => {
      const url = e.target.value.trim();
      currentModel.avatarUrl = url;
      updateAvatarThumb();
      renderPhoneMockup();
      renderLiveQR();
      persistData();
    });

    // Avatar File Picker
    DOM.fileAvatarInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        currentModel.avatarUrl = event.target.result;
        DOM.inputAvatarUrl.value = "";
        updateAvatarThumb();
        renderPhoneMockup();
        persistData();
        showToast("Avatar image updated!");
      };
      reader.readAsDataURL(file);
    });

    // Remove Avatar
    DOM.btnRemoveAvatar.addEventListener("click", () => {
      currentModel.avatarUrl = "";
      DOM.inputAvatarUrl.value = "";
      DOM.fileAvatarInput.value = "";
      updateAvatarThumb();
      renderPhoneMockup();
      renderLiveQR();
      persistData();
      showToast("Avatar removed");
    });

    // Theme selector
    DOM.themeCards.forEach((card) => {
      card.addEventListener("click", () => {
        const theme = card.getAttribute("data-theme");
        DOM.themeCards.forEach((c) => c.classList.remove("active"));
        card.classList.add("active");
        currentModel.theme = theme;
        renderPhoneMockup();
        renderLiveQR();
        persistData();
      });
    });

    // Button shapes
    DOM.shapeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const shape = btn.getAttribute("data-btn-shape");
        DOM.shapeBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentModel.buttonShape = shape;
        renderPhoneMockup();
        renderLiveQR();
        persistData();
      });
    });

    // QR Colors
    DOM.qrDarkColor.addEventListener("input", (e) => {
      currentModel.qrDark = e.target.value;
      renderLiveQR();
      persistData();
    });

    DOM.qrLightColor.addEventListener("input", (e) => {
      currentModel.qrLight = e.target.value;
      renderLiveQR();
      persistData();
    });

    // Quick chips
    document.querySelectorAll(".chip-btn").forEach((chip) => {
      chip.addEventListener("click", () => {
        const type = chip.getAttribute("data-type");
        openLinkModal(null, type);
      });
    });

    // Reset Button
    DOM.btnResetForm.addEventListener("click", () => {
      if (confirm("Reset and create a blank QR profile?")) {
        currentModel = {
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
          qrMode: "wifi",
          networkHost: getDefaultHost(),
          links: [],
        };
        renderAll();
        persistData();
        showToast("Fresh creator ready!");
      }
    });
  }

  // Render Full UI
  function renderAll() {
    DOM.inputProfileName.value = currentModel.name;
    DOM.inputProfileSlug.value = currentModel.slug;
    DOM.inputProfileBio.value = currentModel.bio;
    DOM.inputContactPhone.value = currentModel.contactPhone || "";
    DOM.inputContactEmail.value = currentModel.contactEmail || "";
    DOM.inputAvatarUrl.value = currentModel.avatarUrl && currentModel.avatarUrl.startsWith("http") ? currentModel.avatarUrl : "";
    DOM.qrDarkColor.value = currentModel.qrDark;
    DOM.qrLightColor.value = currentModel.qrLight;

    DOM.themeCards.forEach((c) => {
      c.classList.toggle("active", c.getAttribute("data-theme") === currentModel.theme);
    });

    DOM.shapeBtns.forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-btn-shape") === currentModel.buttonShape);
    });

    setQRMode(currentModel.qrMode || "wifi");
    updateAvatarThumb();
    renderLinksList();
    renderPhoneMockup();
  }

  // Avatar thumbnail
  function updateAvatarThumb() {
    if (currentModel.avatarUrl) {
      DOM.avatarThumbImg.src = currentModel.avatarUrl;
      DOM.avatarThumbImg.classList.remove("hidden");
      DOM.avatarEmptyIcon.classList.add("hidden");
    } else {
      DOM.avatarThumbImg.src = "";
      DOM.avatarThumbImg.classList.add("hidden");
      DOM.avatarEmptyIcon.classList.remove("hidden");
    }
  }

  // Render Links list in form
  function renderLinksList() {
    DOM.linksStreamContainer.innerHTML = "";

    if (!currentModel.links || currentModel.links.length === 0) {
      DOM.emptyLinksState.classList.remove("hidden");
      return;
    }

    DOM.emptyLinksState.classList.add("hidden");

    currentModel.links.forEach((link, idx) => {
      const card = document.createElement("div");
      card.className = "link-entry-card";

      const isFirst = idx === 0;
      const isLast = idx === currentModel.links.length - 1;

      card.innerHTML = `
        <div class="link-move-controls">
          <button type="button" class="move-btn btn-up" ${isFirst ? "disabled" : ""} title="Move Up">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
          </button>
          <button type="button" class="move-btn btn-down" ${isLast ? "disabled" : ""} title="Move Down">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
        </div>

        <div class="link-icon-box icon-type-${link.linkType || "custom"}">
          ${ICONS[link.linkType] || ICONS.custom}
        </div>

        <div class="link-body">
          <div class="link-title-text">${escapeHTML(link.title)}</div>
          <div class="link-dest-text">${escapeHTML(link.destination || "")}</div>
        </div>

        <div class="link-actions-box">
          <button type="button" class="icon-btn-sm btn-edit" title="Edit">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button type="button" class="icon-btn-sm text-danger btn-del" title="Delete">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      `;

      card.querySelector(".btn-up").addEventListener("click", () => {
        if (idx > 0) {
          const temp = currentModel.links[idx];
          currentModel.links[idx] = currentModel.links[idx - 1];
          currentModel.links[idx - 1] = temp;
          renderLinksList();
          renderPhoneMockup();
          renderLiveQR();
          persistData();
        }
      });

      card.querySelector(".btn-down").addEventListener("click", () => {
        if (idx < currentModel.links.length - 1) {
          const temp = currentModel.links[idx];
          currentModel.links[idx] = currentModel.links[idx + 1];
          currentModel.links[idx + 1] = temp;
          renderLinksList();
          renderPhoneMockup();
          renderLiveQR();
          persistData();
        }
      });

      card.querySelector(".btn-edit").addEventListener("click", () => {
        openLinkModal(link);
      });

      card.querySelector(".btn-del").addEventListener("click", () => {
        currentModel.links.splice(idx, 1);
        renderLinksList();
        renderPhoneMockup();
        renderLiveQR();
        persistData();
        showToast("Link removed");
      });

      DOM.linksStreamContainer.appendChild(card);
    });
  }

  // Compact payload encoder
  function encodeProfileData(model) {
    try {
      const compact = {};
      if (model.name) compact.n = model.name;
      if (model.slug) compact.s = model.slug;
      if (model.bio) compact.b = model.bio;
      if (model.avatarUrl && model.avatarUrl.startsWith("http")) compact.a = model.avatarUrl;
      if (model.contactPhone) compact.p = model.contactPhone;
      if (model.contactEmail) compact.e = model.contactEmail;
      if (model.theme && model.theme !== "minimal") compact.t = model.theme;
      if (model.buttonShape && model.buttonShape !== "rounded") compact.sh = model.buttonShape;
      if (model.links && model.links.length > 0) {
        compact.l = model.links.filter((l) => l.isEnabled !== false).map((l) => {
          const item = { t: l.linkType || "custom", ti: l.title, d: l.destination };
          if (l.description) item.ds = l.description;
          return item;
        });
      }
      const json = JSON.stringify(compact);
      const binary = unescape(encodeURIComponent(json));
      return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    } catch (e) {
      return "";
    }
  }

  // Build standard vCard string for offline contact card mode
  function buildVCardPayload(model) {
    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${model.name}`,
    ];
    if (model.bio) {
      lines.push(`NOTE:${model.bio}`);
    }
    if (model.contactPhone) {
      lines.push(`TEL;TYPE=CELL:${model.contactPhone.replace(/[^0-9+]/g, "")}`);
    }
    if (model.contactEmail) {
      lines.push(`EMAIL:${model.contactEmail}`);
    }

    (model.links || []).forEach((l) => {
      if (l.destination) {
        lines.push(`URL;TYPE=${l.linkType || "WORK"}:${l.destination}`);
      }
    });

    lines.push("END:VCARD");
    return lines.join("\n");
  }

  // Render QR Code in Real-Time
  function renderLiveQR() {
    let qrData = "";

    if (currentModel.qrMode === "offline") {
      qrData = buildVCardPayload(currentModel);
      DOM.qrTargetUrlText.textContent = `Offline Contact Card (${currentModel.name || "My Contact"})`;
    } else {
      const fullUrl = buildFullProfileUrl(currentModel.slug);
      qrData = fullUrl;
      DOM.qrTargetUrlText.textContent = fullUrl;
    }

    // Direct test links
    const directUrl = buildDirectLocalUrl(currentModel.slug);
    DOM.btnOpenPageDirect.href = directUrl;
    DOM.navPreviewLiveBtn.href = directUrl;

    DOM.heroQrTarget.innerHTML = "";
    const canvas = document.createElement("canvas");
    DOM.heroQrTarget.appendChild(canvas);

    const qrlib = window.QRCodeLib || window.QRCode;
    if (qrlib && typeof qrlib.toCanvas === "function") {
      const isDense = qrData.length > 200;
      qrlib.toCanvas(canvas, qrData, {
        width: 220,
        margin: isDense ? 5 : 4,
        color: {
          dark: currentModel.qrDark || "#000000",
          light: currentModel.qrLight || "#FFFFFF",
        },
        errorCorrectionLevel: isDense ? "L" : "M",
      }, (err) => {
        if (err) console.error("Live QR render error:", err);
      });
    }
  }

  // Build QR URL with phone scan host
  function buildFullProfileUrl(slug) {
    let base = getDefaultHost();
    if (currentModel.networkHost && currentModel.networkHost.trim() !== "") {
      base = currentModel.networkHost.trim().replace(/\/$/, "");
    }

    const cleanSlug = slugify(slug || currentModel.slug || "profile");

    // In portable mode, embed the compact data payload for standalone scans
    if (currentModel.qrMode === "portable" || currentModel.qrMode === "local") {
      const payload = encodeProfileData(currentModel);
      return `${base}/profile.html?u=${encodeURIComponent(cleanSlug)}#d=${payload}`;
    }

    // Fast-scan clean link (scans in 0.1s!)
    return `${base}/profile.html?u=${encodeURIComponent(cleanSlug)}`;
  }

  function buildDirectLocalUrl(slug) {
    const origin = getDefaultHost();
    const cleanSlug = slugify(slug || currentModel.slug || "profile");
    if (currentModel.qrMode === "portable" || currentModel.qrMode === "local") {
      const payload = encodeProfileData(currentModel);
      return `${origin}/profile.html?u=${encodeURIComponent(cleanSlug)}#d=${payload}`;
    }
    return `${origin}/profile.html?u=${encodeURIComponent(cleanSlug)}`;
  }

  // Render Smartphone Mockup in Real-Time
  function renderPhoneMockup() {
    DOM.livePhoneName.textContent = currentModel.name || "Your Name";
    DOM.livePhoneBio.textContent = currentModel.bio || "Your bio and description will appear here.";

    // Avatar
    if (currentModel.avatarUrl) {
      DOM.livePhoneAvatar.src = currentModel.avatarUrl;
      DOM.livePhoneAvatar.style.display = "block";
    } else {
      DOM.livePhoneAvatar.src = "assets/logo.svg";
      DOM.livePhoneAvatar.style.display = "block";
    }

    // Contact Buttons
    DOM.phoneIconCall.style.display = currentModel.contactPhone ? "inline-flex" : "none";
    DOM.phoneIconEmail.style.display = currentModel.contactEmail ? "inline-flex" : "none";
    DOM.livePhoneContactBar.style.display = (currentModel.contactPhone || currentModel.contactEmail) ? "flex" : "none";

    // Theme colors
    const t = THEMES[currentModel.theme] || THEMES.minimal;
    DOM.livePhoneScreen.style.backgroundColor = t.bg;
    DOM.livePhoneScreen.style.color = t.text;
    DOM.livePhoneName.style.color = t.text;

    // Render Phone Links
    DOM.livePhoneLinksStream.innerHTML = "";

    const activeLinks = (currentModel.links || []).filter((l) => l.isEnabled !== false);

    if (activeLinks.length === 0) {
      const p = document.createElement("p");
      p.className = "phone-empty-hint";
      p.textContent = "Your added links will appear here.";
      DOM.livePhoneLinksStream.appendChild(p);
    } else {
      activeLinks.forEach((link) => {
        const item = document.createElement("div");
        item.className = "phone-link-card";

        // Shape styling
        if (currentModel.buttonShape === "pill") {
          item.style.borderRadius = "9999px";
        } else if (currentModel.buttonShape === "shadow") {
          item.style.borderRadius = "10px";
          item.style.boxShadow = "0 6px 14px rgba(0,0,0,0.12)";
        } else if (currentModel.buttonShape === "outline") {
          item.style.borderRadius = "10px";
          item.style.backgroundColor = "transparent";
          item.style.border = `2px solid ${t.accent}`;
        } else {
          item.style.borderRadius = "10px";
          item.style.backgroundColor = t.card;
        }

        item.innerHTML = `
          <div class="phone-link-icon-box icon-type-${link.linkType || "custom"}">
            ${ICONS[link.linkType] || ICONS.custom}
          </div>
          <div class="phone-link-content">
            <span class="phone-link-title" style="color: ${t.text}">${escapeHTML(link.title)}</span>
            ${link.description ? `<span class="phone-link-subtitle">${escapeHTML(link.description)}</span>` : ""}
          </div>
        `;
        DOM.livePhoneLinksStream.appendChild(item);
      });
    }
  }

  // ==========================================================================
  // LINK MODAL CONTROLLER
  // ==========================================================================

  function bindModalEvents() {
    DOM.btnOpenAddLink.addEventListener("click", () => openLinkModal(null));
    DOM.btnCloseLinkModal.addEventListener("click", closeLinkModal);
    DOM.btnCancelLink.addEventListener("click", closeLinkModal);
    DOM.linkModal.addEventListener("click", (e) => {
      if (e.target === DOM.linkModal) closeLinkModal();
    });

    DOM.selectLinkType.addEventListener("change", (e) => {
      updateModalFields(e.target.value);
    });

    DOM.btnSaveLink.addEventListener("click", handleSaveLink);
  }

  function openLinkModal(linkToEdit = null, defaultType = "whatsapp") {
    DOM.linkModal.classList.remove("hidden");

    if (linkToEdit) {
      DOM.linkModalTitle.textContent = "Edit Link";
      DOM.editLinkId.value = linkToEdit.id;
      DOM.selectLinkType.value = linkToEdit.linkType || "custom";
      DOM.inputLinkTitle.value = linkToEdit.title || "";
      DOM.inputLinkSubtitle.value = linkToEdit.description || "";
      updateModalFields(linkToEdit.linkType || "custom", linkToEdit.destination || "");
    } else {
      DOM.linkModalTitle.textContent = "Add New Link";
      DOM.editLinkId.value = "";
      DOM.selectLinkType.value = defaultType;
      DOM.inputLinkTitle.value = getDefaultTitle(defaultType);
      DOM.inputLinkSubtitle.value = "";
      updateModalFields(defaultType, "");
    }
  }

  function closeLinkModal() {
    DOM.linkModal.classList.add("hidden");
  }

  function getDefaultTitle(type) {
    const titles = {
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
    return titles[type] || "New Link";
  }

  function updateModalFields(type, existingDest = "") {
    DOM.destStandard.classList.add("hidden");
    DOM.destWhatsApp.classList.add("hidden");
    DOM.destPhone.classList.add("hidden");
    DOM.destEmail.classList.add("hidden");
    DOM.destMaps.classList.add("hidden");

    if (type === "whatsapp") {
      DOM.destWhatsApp.classList.remove("hidden");
      if (existingDest.includes("wa.me/")) {
        try {
          const u = new URL(existingDest);
          DOM.inputWaNumber.value = u.pathname.replace("/", "");
          DOM.inputWaPrefill.value = u.searchParams.get("text") || "";
        } catch (e) {
          DOM.inputWaNumber.value = existingDest;
        }
      } else {
        DOM.inputWaNumber.value = existingDest.replace(/[^0-9]/g, "");
      }
    } else if (type === "phone") {
      DOM.destPhone.classList.remove("hidden");
      DOM.inputPhoneNum.value = existingDest.replace("tel:", "");
    } else if (type === "email") {
      DOM.destEmail.classList.remove("hidden");
      if (existingDest.startsWith("mailto:")) {
        try {
          const parts = existingDest.replace("mailto:", "").split("?");
          DOM.inputEmailAddr.value = parts[0];
          if (parts[1]) {
            const p = new URLSearchParams(parts[1]);
            DOM.inputEmailSub.value = p.get("subject") || "";
          }
        } catch (e) {
          DOM.inputEmailAddr.value = existingDest;
        }
      } else {
        DOM.inputEmailAddr.value = existingDest;
      }
    } else if (type === "google_maps") {
      DOM.destMaps.classList.remove("hidden");
      DOM.inputMapsLoc.value = existingDest.replace("https://maps.google.com/?q=", "");
    } else {
      DOM.destStandard.classList.remove("hidden");
      DOM.inputStandardDest.value = existingDest;
    }
  }

  function handleSaveLink() {
    const title = DOM.inputLinkTitle.value.trim();
    const type = DOM.selectLinkType.value;
    const sub = DOM.inputLinkSubtitle.value.trim();
    const editId = DOM.editLinkId.value;

    if (!title) {
      alert("Please enter a link title");
      DOM.inputLinkTitle.focus();
      return;
    }

    let destination = "";
    if (type === "whatsapp") {
      const phone = DOM.inputWaNumber.value.trim().replace(/[^0-9]/g, "");
      if (!phone) {
        alert("Please enter a WhatsApp phone number with country code");
        DOM.inputWaNumber.focus();
        return;
      }
      const msg = DOM.inputWaPrefill.value.trim();
      destination = msg ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/${phone}`;
    } else if (type === "phone") {
      const phone = DOM.inputPhoneNum.value.trim();
      if (!phone) {
        alert("Please enter a telephone number");
        DOM.inputPhoneNum.focus();
        return;
      }
      destination = `tel:${phone.replace(/[^0-9+]/g, "")}`;
    } else if (type === "email") {
      const email = DOM.inputEmailAddr.value.trim();
      if (!email || !email.includes("@")) {
        alert("Please enter a valid email address");
        DOM.inputEmailAddr.focus();
        return;
      }
      const subText = DOM.inputEmailSub.value.trim();
      destination = subText ? `mailto:${email}?subject=${encodeURIComponent(subText)}` : `mailto:${email}`;
    } else if (type === "google_maps") {
      const loc = DOM.inputMapsLoc.value.trim();
      if (!loc) {
        alert("Please enter a location or maps URL");
        DOM.inputMapsLoc.focus();
        return;
      }
      destination = loc.startsWith("http") ? loc : `https://maps.google.com/?q=${encodeURIComponent(loc)}`;
    } else {
      let dest = DOM.inputStandardDest.value.trim();
      if (!dest) {
        alert("Please enter a destination URL");
        DOM.inputStandardDest.focus();
        return;
      }
      if (/^(javascript:|data:|vbscript:)/i.test(dest)) {
        alert("Unsafe URL protocol rejected");
        return;
      }
      if (!dest.startsWith("http://") && !dest.startsWith("https://")) {
        dest = "https://" + dest;
      }
      destination = dest;
    }

    if (editId) {
      const idx = currentModel.links.findIndex((l) => l.id === editId);
      if (idx !== -1) {
        currentModel.links[idx] = {
          ...currentModel.links[idx],
          title,
          linkType: type,
          destination,
          description: sub,
        };
        showToast("Link updated!");
      }
    } else {
      currentModel.links.push({
        id: "lnk_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
        linkType: type,
        title,
        destination,
        description: sub,
        isEnabled: true,
      });
      showToast("Link added!");
    }

    closeLinkModal();
    renderLinksList();
    renderPhoneMockup();
    renderLiveQR();
    persistData();
  }

  // ==========================================================================
  // EXPORT / DOWNLOAD HANDLERS
  // ==========================================================================

  function bindExportEvents() {
    DOM.btnCopyPageUrl.addEventListener("click", () => {
      let url = "";
      if (currentModel.qrMode === "offline") {
        url = buildVCardPayload(currentModel);
        copyToClipboard(url);
        showToast("vCard text copied to clipboard!");
      } else {
        url = buildFullProfileUrl(currentModel.slug);
        copyToClipboard(url);
        showToast("Link copied to clipboard!");
      }
    });

    DOM.btnDownloadPNG.addEventListener("click", () => {
      let qrData = "";
      if (currentModel.qrMode === "offline") {
        qrData = buildVCardPayload(currentModel);
      } else {
        qrData = buildFullProfileUrl(currentModel.slug);
      }

      const isDense = qrData.length > 200;
      const qrlib = window.QRCodeLib || window.QRCode;
      if (qrlib && typeof qrlib.toDataURL === "function") {
        qrlib.toDataURL(qrData, {
          width: 1024,
          margin: isDense ? 5 : 4,
          color: {
            dark: currentModel.qrDark || "#000000",
            light: currentModel.qrLight || "#FFFFFF",
          },
          errorCorrectionLevel: isDense ? "L" : "M",
        }).then((dataUrl) => {
          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = `maple-qr-${slugify(currentModel.slug || "profile")}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          showToast("Downloaded high-res scannable PNG (1024px)!");
        }).catch((err) => {
          console.error("PNG export error:", err);
          showToast("Failed to generate PNG");
        });
      }
    });

    DOM.btnDownloadSVG.addEventListener("click", () => {
      let qrData = "";
      if (currentModel.qrMode === "offline") {
        qrData = buildVCardPayload(currentModel);
      } else {
        qrData = buildFullProfileUrl(currentModel.slug);
      }

      const isDense = qrData.length > 200;
      const qrlib = window.QRCodeLib || window.QRCode;
      if (qrlib && typeof qrlib.toString === "function") {
        qrlib.toString(qrData, {
          type: "svg",
          margin: isDense ? 5 : 4,
          color: {
            dark: currentModel.qrDark || "#000000",
            light: currentModel.qrLight || "#FFFFFF",
          },
          errorCorrectionLevel: isDense ? "L" : "M",
        }).then((svgString) => {
          const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `maple-qr-${slugify(currentModel.slug || "profile")}.svg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showToast("Downloaded scalable vector SVG!");
        }).catch((err) => {
          console.error("SVG export error:", err);
          showToast("Failed to generate SVG");
        });
      }
    });
  }

  // Helpers
  function slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  }

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

  function showToast(msg) {
    const toast = document.createElement("div");
    toast.className = "toast-pill";
    toast.textContent = msg;
    DOM.toastShelf.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 2800);
  }

  function escapeHTML(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Start on load
  document.addEventListener("DOMContentLoaded", init);
})();
