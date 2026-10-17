/**
 * REVA PHOENIX CALIBRATION — SUPABASE DATABASE CLIENT & DATA LAYER
 * Production CRUD operations, Real-Time Sync, and Firebase Auth Bridging
 */
(function () {
  'use strict';

  let supabaseClient = null;

  function isSupabaseConfigured() {
    if (!window.CLOUD_CONFIG || !window.CLOUD_CONFIG.supabase) return false;
    const url = window.CLOUD_CONFIG.supabase.url;
    const key = window.CLOUD_CONFIG.supabase.anonKey;
    return !!(url && key && !url.includes('your-project') && !key.includes('your-supabase-anon-key'));
  }

  function getClient() {
    if (supabaseClient) return supabaseClient;
    if (typeof window.supabase === 'undefined') {
      console.warn('[Supabase] SDK not loaded from CDN.');
      return null;
    }
    if (!isSupabaseConfigured()) {
      return null;
    }
    try {
      let rawUrl = (window.CLOUD_CONFIG.supabase.url || '').trim();
      rawUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
      const rawKey = (window.CLOUD_CONFIG.supabase.anonKey || '').trim();

      supabaseClient = window.supabase.createClient(
        rawUrl,
        rawKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        }
      );
      console.log('[Supabase] Client initialized successfully with:', rawUrl);
      return supabaseClient;
    } catch (e) {
      console.error('[Supabase] Failed to initialize client:', e);
      return null;
    }
  }

  const SupabaseDB = {
    isConfigured: isSupabaseConfigured,
    getClient,

    // =========================================================================
    // 1. LABORATORIES (35 INTEGRATED LABS)
    // =========================================================================
    async getLaboratories() {
      const client = getClient();
      if (!client) return null; // Fallback to local
      try {
        const { data, error } = await client
          .from('laboratories')
          .select('*')
          .order('id', { ascending: true });
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('[Supabase] getLaboratories query error, using local fallback:', err.message);
        return null;
      }
    },

    async upsertLaboratory(labData) {
      const client = getClient();
      if (!client) return null;
      try {
        const payload = {
          id: Number(labData.id),
          code: labData.code,
          name: labData.name,
          category: labData.category,
          tagline: labData.tagline,
          cmc: labData.cmc || labData.statCmc,
          stat_cmc: labData.statCmc || labData.cmc,
          tat: labData.tat,
          env_control: labData.envControl,
          inst_count: labData.instCount,
          scope: labData.scope,
          equipment: labData.equipment,
          standards: labData.standards,
          parameters: labData.parameters,
          catalog_url: labData.catalogUrl,
          catalog_name: labData.catalogName,
          document_data: labData.documentData || labData.catalogUrl,
          document_name: labData.documentName || labData.catalogName,
          updated_at: new Date().toISOString()
        };

        const { data, error } = await client
          .from('laboratories')
          .upsert(payload, { onConflict: 'id' })
          .select()
          .single();

        if (error) throw error;
        return { success: true, data };
      } catch (err) {
        console.error('[Supabase] upsertLaboratory error:', err);
        return { success: false, error: err.message };
      }
    },

    async deleteLaboratory(labId) {
      const client = getClient();
      if (!client) return null;
      try {
        const { error } = await client
          .from('laboratories')
          .delete()
          .eq('id', Number(labId));
        if (error) throw error;
        return { success: true };
      } catch (err) {
        console.error('[Supabase] deleteLaboratory error:', err);
        return { success: false, error: err.message };
      }
    },

    // =========================================================================
    // 2. DOCUMENTS & BROCHURES
    // =========================================================================
    async getDocuments() {
      const client = getClient();
      if (!client) return null;
      try {
        const { data, error } = await client
          .from('documents')
          .select('*')
          .order('id', { ascending: true });
        if (error) throw error;
        return data.map(d => ({
          id: d.id,
          meta: d.meta,
          title: d.title,
          category: d.category,
          desc: d.description,
          fileUrl: d.file_url,
          buttonText: d.button_text || 'Download'
        }));
      } catch (err) {
        console.warn('[Supabase] getDocuments error, using local fallback:', err.message);
        return null;
      }
    },

    async upsertDocument(docData) {
      const client = getClient();
      if (!client) return null;
      try {
        const payload = {
          id: Number(docData.id) || Date.now(),
          meta: docData.meta || `${docData.category}: ${docData.title}`,
          title: docData.title,
          category: docData.category,
          description: docData.desc || docData.description,
          file_url: docData.fileUrl || docData.file_url,
          button_text: docData.buttonText || 'Download',
          updated_at: new Date().toISOString()
        };

        const { data, error } = await client
          .from('documents')
          .upsert(payload, { onConflict: 'id' })
          .select()
          .single();

        if (error) throw error;
        return { success: true, data };
      } catch (err) {
        console.error('[Supabase] upsertDocument error:', err);
        return { success: false, error: err.message };
      }
    },

    // =========================================================================
    // 3. SITE IMAGES (INFRASTRUCTURE & LEADERSHIP)
    // =========================================================================
    async getSiteImages() {
      const client = getClient();
      if (!client) return null;
      try {
        const { data, error } = await client
          .from('site_images')
          .select('*')
          .order('id', { ascending: true });
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('[Supabase] getSiteImages error, using fallback:', err.message);
        return null;
      }
    },

    async upsertSiteImage(imgData) {
      const client = getClient();
      if (!client) return null;
      try {
        const payload = {
          id: String(imgData.id),
          title: imgData.title,
          sub: imgData.sub,
          section: imgData.section,
          category: imgData.category,
          path: imgData.path,
          description: imgData.desc || imgData.description,
          updated_at: new Date().toISOString()
        };

        const { data, error } = await client
          .from('site_images')
          .upsert(payload, { onConflict: 'id' })
          .select()
          .single();

        if (error) throw error;
        return { success: true, data };
      } catch (err) {
        console.error('[Supabase] upsertSiteImage error:', err);
        return { success: false, error: err.message };
      }
    },

    // =========================================================================
    // 4. CUSTOMER ENQUIRIES & QUOTE REQUESTS
    // =========================================================================
    async submitEnquiry(enquiryData) {
      const client = getClient();
      if (!client) return null;
      try {
        const payload = {
          name: enquiryData.name,
          email: enquiryData.email,
          phone: enquiryData.phone,
          company: enquiryData.company,
          lab_id: enquiryData.labId || null,
          message: enquiryData.message,
          service_required: enquiryData.serviceRequired || 'Calibration',
          status: 'new',
          created_at: new Date().toISOString()
        };

        const { data, error } = await client
          .from('enquiries')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data };
      } catch (err) {
        console.error('[Supabase] submitEnquiry error:', err);
        return { success: false, error: err.message };
      }
    },

    // =========================================================================
    // 5. SITE CONTENT CONFIGURATION
    // =========================================================================
    async getSiteContent(key) {
      const client = getClient();
      if (!client) return null;
      try {
        const { data, error } = await client
          .from('site_content')
          .select('value')
          .eq('key', key)
          .single();
        if (error) throw error;
        return data ? data.value : null;
      } catch (err) {
        return null;
      }
    },

    async saveSiteContent(key, value) {
      const client = getClient();
      if (!client) return null;
      try {
        const { error } = await client
          .from('site_content')
          .upsert({
            key: key,
            value: value,
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
        if (error) throw error;
        return { success: true };
      } catch (err) {
        console.error('[Supabase] saveSiteContent error:', err);
        return { success: false, error: err.message };
      }
    }
  };

  window.SupabaseDB = SupabaseDB;
})();
