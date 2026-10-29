/**
 * Maple Connect QR — Cloud Sync & Dynamic QR Engine
 * Powered by Supabase (Real-Time Cloud Persistence)
 * Enables permanent QR codes that update live on walls/signs without reprinting.
 */

(function (window) {
  "use strict";

  const STORAGE_KEY = "maple_cloud_config";
  const DEFAULT_TABLE = "profiles";

  // Pre-configured default config (or user custom config stored in localStorage)
  const defaultConfig = {
    provider: "supabase",
    supabaseUrl: "",
    supabaseKey: "",
    tableName: DEFAULT_TABLE,
    autoSync: true,
  };

  let cachedClient = null;
  let lastClientKey = "";

  const CloudSync = {
    /**
     * Get active cloud configuration
     */
    getConfig() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          return { ...defaultConfig, ...parsed };
        }
      } catch (e) {
        console.warn("Could not load cloud config", e);
      }
      return { ...defaultConfig };
    },

    /**
     * Save cloud configuration
     */
    saveConfig(cfg) {
      try {
        const updated = { ...this.getConfig(), ...cfg };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        cachedClient = null; // Invalidate cached instance
        return true;
      } catch (e) {
        console.error("Failed to save cloud config", e);
        return false;
      }
    },

    /**
     * Check if cloud database is configured with URL and Key
     */
    isConfigured() {
      const cfg = this.getConfig();
      return Boolean(
        cfg.supabaseUrl &&
        cfg.supabaseUrl.trim().startsWith("http") &&
        cfg.supabaseKey &&
        cfg.supabaseKey.trim().length > 10
      );
    },

    /**
     * Initialize or return cached Supabase client
     */
    getClient() {
      const cfg = this.getConfig();
      if (!this.isConfigured()) return null;

      const clientSignature = `${cfg.supabaseUrl}::${cfg.supabaseKey}`;
      if (cachedClient && lastClientKey === clientSignature) {
        return cachedClient;
      }

      const supabaseLib = window.supabase;
      if (!supabaseLib || typeof supabaseLib.createClient !== "function") {
        console.warn("Supabase client library (@supabase/supabase-js) is not loaded.");
        return null;
      }

      try {
        cachedClient = supabaseLib.createClient(cfg.supabaseUrl.trim(), cfg.supabaseKey.trim(), {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        });
        lastClientKey = clientSignature;
        return cachedClient;
      } catch (e) {
        console.error("Error creating Supabase client:", e);
        return null;
      }
    },

    /**
     * Upsert a profile to Supabase
     * @param {Object} model Current profile model
     */
    async saveProfile(model) {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: "Cloud database is not configured yet. Connect Supabase in Settings.",
        };
      }

      const client = this.getClient();
      if (!client) {
        return {
          success: false,
          error: "Supabase client is not available.",
        };
      }

      const cfg = this.getConfig();
      const slug = (model.slug || "").trim().toLowerCase();

      if (!slug) {
        return {
          success: false,
          error: "Profile slug is required to sync to cloud.",
        };
      }

      const record = {
        slug: slug,
        name: model.name || "My Profile",
        bio: model.bio || "",
        avatar_url: model.avatarUrl || "",
        contact_phone: model.contactPhone || "",
        contact_email: model.contactEmail || "",
        theme: model.theme || "minimal",
        button_shape: model.buttonShape || "rounded",
        links: Array.isArray(model.links) ? model.links : [],
        updated_at: new Date().toISOString(),
      };

      try {
        const { data, error } = await client
          .from(cfg.tableName || DEFAULT_TABLE)
          .upsert(record, { onConflict: "slug" })
          .select();

        if (error) {
          console.error("Supabase upsert error:", error);
          return { success: false, error: error.message || "Failed to sync to cloud." };
        }

        return { success: true, data: data, timestamp: Date.now() };
      } catch (err) {
        console.error("Cloud save unexpected exception:", err);
        return { success: false, error: err.message || "Network error while syncing." };
      }
    },

    /**
     * Fetch a profile by slug from Supabase
     * @param {string} slug Profile slug
     */
    async getProfile(slug) {
      if (!this.isConfigured() || !slug) return null;

      const client = this.getClient();
      if (!client) return null;

      const cfg = this.getConfig();
      const cleanSlug = String(slug).trim().toLowerCase();

      try {
        const { data, error } = await client
          .from(cfg.tableName || DEFAULT_TABLE)
          .select("*")
          .eq("slug", cleanSlug)
          .maybeSingle();

        if (error) {
          console.warn("Supabase getProfile error:", error);
          return null;
        }

        if (!data) return null;

        // Map database record to standard profile model
        return {
          id: "cloud_" + data.slug,
          name: data.name || "My Profile",
          displayName: data.name || "My Profile",
          slug: data.slug,
          description: data.bio || "",
          avatarUrl: data.avatar_url || "",
          contactPhone: data.contact_phone || "",
          contactEmail: data.contact_email || "",
          theme: data.theme || "minimal",
          customization: {
            buttonStyle: data.button_shape || "rounded",
          },
          links: Array.isArray(data.links)
            ? data.links.map((lnk, idx) => ({
                id: lnk.id || "lnk_" + idx,
                linkType: lnk.linkType || "custom",
                title: lnk.title || "Link",
                destination: lnk.destination || "",
                description: lnk.description || "",
                isEnabled: lnk.isEnabled !== false,
                sortOrder: idx,
              }))
            : [],
          updatedAt: data.updated_at,
          source: "cloud",
        };
      } catch (err) {
        console.warn("Cloud getProfile exception:", err);
        return null;
      }
    },

    /**
     * Test connection to Supabase and verify profiles table
     */
    async testConnection(testUrl, testKey) {
      const supabaseLib = window.supabase;
      if (!supabaseLib || typeof supabaseLib.createClient !== "function") {
        return {
          success: false,
          error: "Supabase library not loaded. Check internet connection.",
        };
      }

      const url = (testUrl || "").trim();
      const key = (testKey || "").trim();

      if (!url.startsWith("http")) {
        return { success: false, error: "Invalid Project URL. Must start with https://" };
      }
      if (key.length < 10) {
        return { success: false, error: "Invalid Anon Key. It should be a long JWT string." };
      }

      try {
        const testClient = supabaseLib.createClient(url, key, {
          auth: { persistSession: false },
        });

        const cfg = this.getConfig();
        const { data, error } = await testClient
          .from(cfg.tableName || DEFAULT_TABLE)
          .select("slug")
          .limit(1);

        if (error) {
          if (error.code === "42P01" || error.message.includes("relation") || error.message.includes("does not exist")) {
            return {
              success: false,
              tableMissing: true,
              error: `Table "${cfg.tableName || DEFAULT_TABLE}" does not exist in your Supabase database yet. Run the SQL script below in your Supabase SQL Editor.`,
            };
          }
          return { success: false, error: error.message };
        }

        return { success: true, message: "Connected successfully to Supabase!" };
      } catch (e) {
        return { success: false, error: e.message || "Could not connect to Supabase." };
      }
    },

    /**
     * Standard copy-paste SQL snippet to create the profiles table in Supabase
     */
    getSetupSQL(tableName = DEFAULT_TABLE) {
      return `-- 1. Create the public profiles table for Maple Connect QR
CREATE TABLE IF NOT EXISTS public.${tableName} (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  contact_phone TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  theme TEXT DEFAULT 'minimal',
  button_shape TEXT DEFAULT 'rounded',
  links JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;

-- 3. Allow anyone to read profiles (needed so phone scans can load your links)
DROP POLICY IF EXISTS "Public Read Profiles" ON public.${tableName};
CREATE POLICY "Public Read Profiles" ON public.${tableName}
  FOR SELECT USING (true);

-- 4. Allow insert and update of profiles from the editor
DROP POLICY IF EXISTS "Public Insert Profiles" ON public.${tableName};
CREATE POLICY "Public Insert Profiles" ON public.${tableName}
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Update Profiles" ON public.${tableName};
CREATE POLICY "Public Update Profiles" ON public.${tableName}
  FOR UPDATE USING (true);`;
    },
  };

  window.CloudSync = CloudSync;
})(window);
