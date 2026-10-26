/* ==========================================================================
   REVA PHOENIX UNIFIED SITE DATA & PERSISTENCE ENGINE
   Centralized Data Store for Laboratories, Instruments, Content, Media, Contact & URLs
   Connected to Python CMS REST API & Persistent Database (data/site_database.json)
   ========================================================================== */

(function () {
  const STORAGE_KEYS = {
    DB: 'reva_phoenix_database',
    LABS: 'reva_phoenix_labs',
    INSTRUMENTS: 'reva_phoenix_instruments',
    CATEGORIES: 'reva_phoenix_categories',
    CONTENT: 'reva_phoenix_content',
    CONTACT: 'reva_phoenix_contact',
    SOCIAL: 'reva_phoenix_social',
    MEDIA: 'reva_phoenix_media',
    NAV: 'reva_phoenix_navigation',
    AUTH: 'reva_phoenix_admin_auth'
  };

  let inMemoryDb = null;
  let isFetching = false;
  const CURRENT_APP_VERSION = '9.0';

  // Load from local cache synchronously on script evaluation
  function getCachedDatabase() {
    if (inMemoryDb) return inMemoryDb;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DB);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed || parsed.version !== CURRENT_APP_VERSION) {
          console.log('[SiteData] Database version updated (' + (parsed ? parsed.version : 'none') + ' -> ' + CURRENT_APP_VERSION + '). Invalidating client cache.');
          Object.values(STORAGE_KEYS).forEach(key => {
            try { localStorage.removeItem(key); } catch (e) {}
          });
          return null;
        }
        if (parsed.content && Array.isArray(parsed.content.metrics)) {
          parsed.content.metrics.forEach(m => {
            if (m.id === 2 && m.sub) {
              m.sub = 'Across India, Middle East, Asia & US';
            }
          });
        }
        inMemoryDb = parsed;
        return inMemoryDb;
      }
    } catch (e) {
      console.warn('Could not read cached database from localStorage:', e);
    }
    return null;
  }

  function setCachedDatabase(db) {
    if (!db || typeof db !== 'object') return;
    inMemoryDb = db;
    try {
      localStorage.setItem(STORAGE_KEYS.DB, JSON.stringify(db));
      if (db.laboratories) localStorage.setItem(STORAGE_KEYS.LABS, JSON.stringify(db.laboratories));
      if (db.instruments) localStorage.setItem(STORAGE_KEYS.INSTRUMENTS, JSON.stringify(db.instruments));
      if (db.categories) localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(db.categories));
      if (db.content) localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(db.content));
      if (db.contact) localStorage.setItem(STORAGE_KEYS.CONTACT, JSON.stringify(db.contact));
      if (db.media) localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(db.media));
      if (db.navigation) localStorage.setItem(STORAGE_KEYS.NAV, JSON.stringify(db.navigation));
      if (db.social) localStorage.setItem(STORAGE_KEYS.SOCIAL, JSON.stringify(db.social));
    } catch (e) {
      console.warn('Could not write cached database to localStorage:', e);
    }
  }

  // Asynchronously fetch live data from Supabase Cloud or server REST API
  async function fetchLiveDatabase() {
    if (isFetching) return inMemoryDb;
    isFetching = true;

    // 1. Try Supabase Main Database if configured
    if (typeof window !== 'undefined' && window.SupabaseDB && window.SupabaseDB.isConfigured()) {
      try {
        const [cloudLabs, cloudDocs, cloudImages] = await Promise.all([
          window.SupabaseDB.getLaboratories(),
          window.SupabaseDB.getDocuments(),
          window.SupabaseDB.getSiteImages()
        ]);

        if (Array.isArray(cloudLabs) && cloudLabs.length > 0) {
          const current = getCachedDatabase() || {};
          current.laboratories = cloudLabs.map(l => ({
            id: Number(l.id),
            code: l.code,
            name: l.name,
            category: l.category,
            tagline: l.tagline,
            cmc: l.cmc,
            statCmc: l.stat_cmc || l.cmc,
            tat: l.tat,
            envControl: l.env_control,
            instCount: l.inst_count,
            scope: l.scope,
            equipment: l.equipment,
            standards: l.standards,
            parameters: l.parameters,
            catalogUrl: l.catalog_url,
            catalogName: l.catalog_name,
            documentData: l.document_data || l.catalog_url,
            documentName: l.document_name || l.catalog_name
          }));

          if (Array.isArray(cloudDocs) && cloudDocs.length > 0) {
            if (!current.content) current.content = {};
            current.content.resources = cloudDocs;
          }

          if (Array.isArray(cloudImages) && cloudImages.length > 0) {
            current.siteImages = cloudImages;
          }

          setCachedDatabase(current);
          window.dispatchEvent(new CustomEvent('reva_data_updated', { detail: current }));
          isFetching = false;
          return current;
        }
      } catch (sbErr) {
        console.warn('[Supabase] site-data fetch warning:', sbErr);
      }
    }

    // 2. Fallback to /api/data REST API
    try {
      const res = await fetch('/api/data', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          setCachedDatabase(data);
          window.dispatchEvent(new CustomEvent('reva_data_updated', { detail: data }));
          return data;
        }
      }
    } catch (e) {
      console.log('Using local cached database (server API offline or static):', e.message);
    } finally {
      isFetching = false;
    }
    return getCachedDatabase();
  }

  // Kick off immediate async fetch
  if (typeof window !== 'undefined') {
    fetchLiveDatabase();
  }

  window.SiteData = {
    // --- Full Database Access ---
    getDatabase: function () {
      return getCachedDatabase() || {};
    },

    fetchLive: fetchLiveDatabase,

    saveDatabase: async function (dbData) {
      setCachedDatabase(dbData);
      window.dispatchEvent(new CustomEvent('reva_data_updated', { detail: dbData }));
      try {
        const res = await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dbData)
        });
        return res.ok;
      } catch (e) {
        console.warn('API save fallback to client cache:', e);
        return true;
      }
    },

    // --- Laboratories Registry (35 Labs) ---
    getLabs: function () {
      const db = getCachedDatabase();
      if (db && Array.isArray(db.laboratories) && db.laboratories.length > 0) {
        return db.laboratories;
      }
      if (typeof REVA_35_LABORATORIES !== 'undefined' && Array.isArray(REVA_35_LABORATORIES) && REVA_35_LABORATORIES.length > 0) {
        return REVA_35_LABORATORIES;
      }
      if (typeof window !== 'undefined' && Array.isArray(window.REVA_35_LABORATORIES) && window.REVA_35_LABORATORIES.length > 0) {
        return window.REVA_35_LABORATORIES;
      }
      return [];
    },

    getLabById: function (id) {
      const labs = this.getLabs();
      return labs.find(l => Number(l.id) === Number(id));
    },

    saveLabs: async function (labs) {
      const db = this.getDatabase();
      db.laboratories = labs;
      return await this.saveDatabase(db);
    },

    saveLab: async function (labData) {
      const labs = [...this.getLabs()];
      const idx = labs.findIndex(l => Number(l.id) === Number(labData.id));
      if (idx >= 0) {
        labs[idx] = { ...labs[idx], ...labData };
      } else {
        if (!labData.id) {
          const maxId = labs.reduce((max, l) => Number(l.id) > max ? Number(l.id) : max, 0);
          labData.id = maxId + 1;
        }
        labs.push(labData);
      }
      return await this.saveLabs(labs);
    },

    deleteLab: async function (id) {
      let labs = this.getLabs().filter(l => Number(l.id) !== Number(id));
      return await this.saveLabs(labs);
    },

    // --- Dedicated Instruments / Products ---
    getInstruments: function () {
      const db = getCachedDatabase();
      if (db && Array.isArray(db.instruments) && db.instruments.length > 0) {
        return db.instruments;
      }
      return [];
    },

    getInstrumentsByLabId: function (labId) {
      const all = this.getInstruments();
      const filtered = all.filter(i => Number(i.labId) === Number(labId) && i.enabled !== false);
      if (filtered.length > 0) return filtered;
      
      // Fallback to static instruments-db if database not yet populated
      if (typeof REVA_LAB_INSTRUMENTS !== 'undefined' && REVA_LAB_INSTRUMENTS[labId]) {
        return REVA_LAB_INSTRUMENTS[labId];
      }
      return [];
    },

    getInstrumentById: function (id) {
      const all = this.getInstruments();
      return all.find(i => String(i.id) === String(id));
    },

    saveInstrument: async function (inst) {
      const db = this.getDatabase();
      let instruments = Array.isArray(db.instruments) ? [...db.instruments] : [];
      const idx = instruments.findIndex(i => String(i.id) === String(inst.id));

      if (idx >= 0) {
        instruments[idx] = { ...instruments[idx], ...inst };
      } else {
        if (!inst.id) inst.id = 'inst-' + Date.now();
        instruments.push(inst);
      }
      db.instruments = instruments;
      setCachedDatabase(db);
      window.dispatchEvent(new CustomEvent('reva_data_updated', { detail: db }));

      try {
        const res = await fetch('/api/instruments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inst)
        });
        return res.ok;
      } catch (e) {
        return true;
      }
    },

    deleteInstrument: async function (id) {
      const db = this.getDatabase();
      let instruments = (db.instruments || []).filter(i => String(i.id) !== String(id));
      db.instruments = instruments;
      setCachedDatabase(db);
      window.dispatchEvent(new CustomEvent('reva_data_updated', { detail: db }));

      try {
        const res = await fetch(`/api/instruments?id=${encodeURIComponent(id)}`, {
          method: 'DELETE'
        });
        return res.ok;
      } catch (e) {
        return true;
      }
    },

    // --- Instrument Categories ---
    getCategories: function () {
      const db = getCachedDatabase();
      if (db && Array.isArray(db.categories) && db.categories.length > 0) {
        return db.categories;
      }
      return [
        { id: "dimensional", name: "Dimensional Metrology", icon: "ruler", description: "Precision length, diameter, angle and form standards.", order: 1 },
        { id: "thermal", name: "Thermal & Temperature", icon: "thermometer", description: "RTDs, thermocouples, liquid-in-glass thermometers, pyrometers, and dry-block calibrators.", order: 2 },
        { id: "mechanical", name: "Mechanical, Force & Torque", icon: "scale", description: "Weights, balances, tensile testing machines, torque wrenches, pressure gauges and load cells.", order: 3 },
        { id: "electro-technical", name: "Electro-Technical & RF", icon: "zap", description: "Multimeters, oscilloscopes, clamp meters, frequency counters, and multi-product calibrators.", order: 4 },
        { id: "fluid-flow", name: "Fluid Flow & Viscosity", icon: "droplet", description: "Flowmeters, anemometers, viscosity cups, hydrometers, and volumetric glassware.", order: 5 },
        { id: "medical", name: "Medical & Biomedical Devices", icon: "activity", description: "Defibrillators, patient monitors, infusion pumps, ECG machines, and electrosurgical units.", order: 6 },
        { id: "cleanroom", name: "Cleanroom & HVAC Validation", icon: "wind", description: "Particle counters, air velocity transmitters, HEPA filter integrity, and pressure differential monitors.", order: 7 },
        { id: "ndt", name: "Non-Destructive Testing (NDT)", icon: "shield", description: "Ultrasonic thickness gauges, magnetic particle yokes, eddy current testers, and lux meters.", order: 8 }
      ];
    },

    saveCategories: async function (categories) {
      const db = this.getDatabase();
      db.categories = categories;
      setCachedDatabase(db);
      window.dispatchEvent(new CustomEvent('reva_data_updated', { detail: db }));

      try {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categories)
        });
        return res.ok;
      } catch (e) {
        return true;
      }
    },

    deleteCategory: async function (id) {
      const cats = this.getCategories().filter(c => String(c.id) !== String(id));
      return await this.saveCategories(cats);
    },

    // --- Content & Copy ---
    getContent: function () {
      const db = getCachedDatabase();
      if (db && db.content) return db.content;
      return {};
    },

    saveContent: async function (content) {
      const db = this.getDatabase();
      db.content = { ...(db.content || {}), ...content };
      return await this.saveDatabase(db);
    },

    // --- Contact Information ---
    getContact: function () {
      const db = getCachedDatabase();
      if (db && db.contact) return db.contact;
      return {};
    },

    saveContact: async function (contact) {
      const db = this.getDatabase();
      db.contact = { ...(db.contact || {}), ...contact };
      return await this.saveDatabase(db);
    },

    // --- Social Links ---
    getSocial: function () {
      const db = getCachedDatabase();
      if (db && db.social) return db.social;
      return {};
    },

    saveSocial: async function (social) {
      const db = this.getDatabase();
      db.social = { ...(db.social || {}), ...social };
      return await this.saveDatabase(db);
    },

    // --- Media & Images ---
    getMedia: function () {
      const db = getCachedDatabase();
      if (db && db.media) return db.media;
      return {};
    },

    saveMedia: async function (media) {
      const db = this.getDatabase();
      db.media = { ...(db.media || {}), ...media };
      return await this.saveDatabase(db);
    },

    // --- Navigation Links ---
    getNavigation: function () {
      const db = getCachedDatabase();
      if (db && Array.isArray(db.navigation) && db.navigation.length > 0) {
        return db.navigation;
      }
      return [
        { label: "Home", href: "#hero", order: 1, enabled: true },
        { label: "Leadership", href: "#leadership", order: 2, enabled: true },
        { label: "About", href: "#about", order: 3, enabled: true },
        { label: "35 Labs", href: "#laboratories", order: 4, enabled: true },
        { label: "Industries", href: "#industries", order: 5, enabled: true },
        { label: "Portfolio", href: "#portfolio", order: 6, enabled: true },
        { label: "Gallery", href: "#gallery", order: 7, enabled: true },
        { label: "Downloads", href: "#resources", order: 8, enabled: true },
        { label: "Careers", href: "careers.html", order: 9, enabled: true },
        { label: "Contact", href: "#contact", order: 10, enabled: true }
      ];
    },

    saveNavigation: async function (navigation) {
      const db = this.getDatabase();
      db.navigation = navigation;
      return await this.saveDatabase(db);
    },

    // --- Media File Upload Helper ---
    uploadImage: async function (fileOrBase64, customName) {
      if (typeof fileOrBase64 === 'string') {
        // Base64 string payload
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64: fileOrBase64, name: customName || 'upload' })
        });
        return await res.json();
      } else if (fileOrBase64 instanceof File || fileOrBase64 instanceof Blob) {
        // Multipart/form-data
        const formData = new FormData();
        formData.append('image', fileOrBase64, customName || fileOrBase64.name || 'image.png');
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        return await res.json();
      }
      throw new Error('Unsupported image payload type');
    }
  };
})();
