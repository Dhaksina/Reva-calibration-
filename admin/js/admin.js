/* ==========================================================================
   REVA PHOENIX CALIBRATION CMS — ADMIN APPLICATION ENGINE
   35 Integrated Labs, Documents/Brochures/Certificates & All Website Images
   ========================================================================== */

(function () {
  'use strict';

  // State Management
  let siteDatabase = null;
  let allLaboratories = [];
  let allDocuments = [];
  let activeTab = 'laboratories';
  let activeLabCategory = 'all';
  let activeImageCategory = 'all';
  let currentEditingLab = null;

  // Master List of Images — Restricted ONLY to Infrastructure & Leadership Sections
  const SITE_IMAGES_REGISTRY = [
    // 1. Leadership Statements
    {
      id: 'md-portrait',
      title: 'Managing Director Portrait (Dr. Manikandan Venkatesan)',
      sub: 'Dr. Manikandan Venkatesan, Managing Director',
      section: "Managing Director's Statement",
      category: 'leadership',
      path: 'assets/images/md-manikandan.jpg',
      desc: "Official portrait of Dr. Manikandan Venkatesan in Managing Director's Statement section."
    },
    {
      id: 'facility-building',
      title: 'Reva Phoenix Headquarters Building',
      sub: 'Madipakkam, Chennai, Tamil Nadu, India',
      section: 'Corporate Leadership Statement',
      category: 'leadership',
      path: 'assets/images/building-office.jpg',
      desc: 'Featured building photo in Corporate Message & Leadership Commitment section.'
    },

    // 2. State-of-the-Art Infrastructure ("Facilities Engineered for Precision")
    {
      id: 'labs-reference-chart',
      title: '35 Integrated Labs Master Reference Chart',
      sub: 'Authoritative NABL Scope Overview',
      section: 'State-of-the-Art Infrastructure',
      category: 'infrastructure',
      path: 'assets/images/35-integrated-labs-reference.jpeg',
      desc: 'Authoritative master reference chart displaying full metrology scope in gallery.'
    },
    {
      id: 'lab-dimensional',
      title: 'Dimension Calibration Cleanroom Suite',
      sub: 'Class 1 Precision Laboratory',
      section: 'State-of-the-Art Infrastructure',
      category: 'infrastructure',
      path: 'assets/images/lab-dimension.jpg',
      desc: 'Temperature controlled 20°C ± 1°C dimensional metrology laboratory photo.'
    },
    {
      id: 'training-room',
      title: 'Executive Training Suite & Lecture Hall',
      sub: 'Corporate & Lead Auditor Programs',
      section: 'State-of-the-Art Infrastructure',
      category: 'infrastructure',
      path: 'assets/images/training-room-1.jpg',
      desc: 'Technical auditor and metrologist lecture hall photo in gallery.'
    },
    {
      id: 'md-office',
      title: 'Executive Directorate & MD Office',
      sub: 'MD Consultation Suite',
      section: 'State-of-the-Art Infrastructure',
      category: 'infrastructure',
      path: 'assets/images/md-office.jpg',
      desc: 'Executive Directorate consultation suite photo in gallery.'
    },
    {
      id: 'reception-counter',
      title: 'Corporate Reception Lounge & Intake Desk',
      sub: 'First Floor Concierge Desk',
      section: 'State-of-the-Art Infrastructure',
      category: 'infrastructure',
      path: 'assets/images/reception-1.jpg',
      desc: 'First floor corporate concierge & instrument receipt counter photo.'
    },
    {
      id: 'lab-electrotechnical',
      title: 'Electro-Technical & RF Calibration Suite',
      sub: 'AC/DC, Time & Frequency Standards',
      section: 'State-of-the-Art Infrastructure',
      category: 'infrastructure',
      path: 'assets/images/lab-electrotechnical.jpg',
      desc: 'AC/DC, time, frequency, and RF standards laboratory photo.'
    },
    {
      id: 'lab-thermal',
      title: 'Thermal & Relative Humidity Laboratory',
      sub: 'Chamber Mapping to 1750°C',
      section: 'State-of-the-Art Infrastructure',
      category: 'infrastructure',
      path: 'assets/images/lab-thermal.jpg',
      desc: 'Chamber mapping to 1750°C and pyrometry standards laboratory photo.'
    },
    {
      id: 'awards-photo',
      title: 'Industry & Metrology Excellence Awards',
      sub: 'Recognized by Quality Councils',
      section: 'State-of-the-Art Infrastructure',
      category: 'infrastructure',
      path: 'assets/images/awards.jpg',
      desc: 'Recognized quality council honors & national excellence awards photo.'
    }
  ];

  // Default Standard Documents
  const DEFAULT_DOCUMENTS = [
    {
      id: 1,
      meta: 'DOCUMENT: RPEC-CORP-BROCHURE // PDF',
      title: 'Reva Phoenix Corporate Brochure',
      category: 'Brochure',
      desc: 'Comprehensive overview of Reva Phoenix Labs & Consultants Pvt. Ltd., consulting methodologies, API auditing credentials, training courses, and consulting division scope.',
      fileUrl: 'assets/docs/Reva-Phoenix-Corporate-Brochure.pdf',
      buttonText: 'Download'
    },
    {
      id: 2,
      meta: 'CERTIFICATION: ISO 9001:2015 // PDF',
      title: 'ISO 9001 Quality Certificate',
      category: 'Certificate',
      desc: 'Official Quality Management System Certificate verifying Reva Phoenix Labs & Consultants adherence to international QMS benchmarks.',
      fileUrl: 'assets/docs/Reva-Phoenix-ISO-9001-Certificate.pdf',
      buttonText: 'Download'
    },
    {
      id: 3,
      meta: 'ACCREDITATION: NABL ISO/IEC 17025 // PNG',
      title: 'ISO/IEC 17025: 2017 Certificate',
      category: 'Accreditation',
      desc: 'Official NABL Certificate of Accreditation (CC-4178) certifying Reva Phoenix Labs & Consultants competence in testing and calibration.',
      fileUrl: 'assets/images/reva-nabl-iso-17025-certificate.png',
      buttonText: 'Download'
    },
    {
      id: 4,
      meta: 'ACCREDITATION: NABL SCOPE // PDF (192 PAGES)',
      title: '35 Integrated Labs Master Scope',
      category: 'Accreditation',
      desc: 'Authoritative 35 Integrated Laboratories reference chart detailing all parameters, disciplines, and on-site/off-site calibration ranges.',
      fileUrl: 'assets/docs/Reva-Phoenix-NABL-ISO-17025-Scope-Accreditation.pdf',
      buttonText: 'Download'
    },
    {
      id: 5,
      meta: 'CATALOG: METROLOGY MASTER SCOPE // PDF',
      title: 'Reva Phoenix Calibration Master Catalog',
      category: 'Catalog',
      desc: 'Master equipment calibration scope, parameters, expanded CMC uncertainty metrics, and sample turnaround schedules.',
      fileUrl: 'assets/docs/Reva-Phoenix-Catalog.pdf',
      buttonText: 'Download'
    }
  ];

  // Toast Notification System
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        ${type === 'success' 
          ? '<polyline points="20 6 9 17 4 12"></polyline>' 
          : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'}
      </svg>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(30px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // --- 1. Authentication ---
  function checkAuth() {
    const token = sessionStorage.getItem('reva_admin_token') || localStorage.getItem('reva_admin_token');
    const overlay = document.getElementById('login-overlay');
    const shell = document.getElementById('admin-shell');

    // Check Firebase Auth state or local token
    const firebaseUser = window.FirebaseAuth ? window.FirebaseAuth.getCurrentUser() : null;

    if (token || firebaseUser) {
      if (overlay) overlay.style.display = 'none';
      if (shell) shell.style.display = 'flex';
      initApp();
    } else {
      if (overlay) overlay.style.display = 'flex';
      if (shell) shell.style.display = 'none';
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const btn = document.getElementById('login-submit-btn');

    btn.disabled = true;
    btn.textContent = 'Verifying Credentials...';

    // 1. Try Firebase Authentication if initialized
    if (window.FirebaseAuth) {
      try {
        const authRes = await window.FirebaseAuth.login(email, password);
        if (authRes.success) {
          const token = await window.FirebaseAuth.getIdToken();
          sessionStorage.setItem('reva_admin_token', token || 'firebase_authenticated');
          showToast('Welcome back! Authenticated via Firebase.');
          checkAuth();
          btn.disabled = false;
          btn.textContent = 'Authenticate & Enter';
          return;
        } else if (authRes.raw && (authRes.raw.code === 'auth/user-not-found' || authRes.raw.code === 'auth/invalid-credential')) {
          // If first-time bootstrap for default admin, provision user automatically
          if (email === 'admin@revaphoenix.com' && (password === 'reva2026' || password === 'admin123')) {
            const signupRes = await window.FirebaseAuth.signup(email, password);
            if (signupRes.success) {
              const token = await window.FirebaseAuth.getIdToken();
              sessionStorage.setItem('reva_admin_token', token || 'firebase_authenticated');
              showToast('Admin account created & authenticated via Firebase!');
              checkAuth();
              btn.disabled = false;
              btn.textContent = 'Authenticate & Enter';
              return;
            }
          }
        }
      } catch (fbErr) {
        console.warn('[Firebase Auth] Error during login:', fbErr);
      }
    }

    // 2. Server API fallback
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('reva_admin_token', data.token || 'authenticated');
        showToast('Welcome back, Super Admin!');
        checkAuth();
      } else {
        showToast(data.error || 'Invalid credentials.', 'error');
      }
    } catch (err) {
      // 3. Fallback for offline/local development
      if (email === 'admin@revaphoenix.com' && (password === 'reva2026' || password === 'admin123')) {
        sessionStorage.setItem('reva_admin_token', 'local_session');
        showToast('Logged in successfully (Local session).');
        checkAuth();
      } else {
        showToast('Invalid email or password.', 'error');
      }
    } finally {
      btn.disabled = false;
      btn.textContent = 'Authenticate & Enter';
    }
  }

  async function handleLogout() {
    if (window.FirebaseAuth) {
      try {
        await window.FirebaseAuth.logout();
      } catch (e) {
        console.warn('Firebase logout warning:', e);
      }
    }
    sessionStorage.removeItem('reva_admin_token');
    localStorage.removeItem('reva_admin_token');
    showToast('Logged out securely.');
    checkAuth();
  }

  async function handleForgotPassword() {
    const emailInput = document.getElementById('login-email');
    const defaultEmail = (emailInput && emailInput.value.trim()) || 'admin@revaphoenix.com';
    const email = prompt('Enter your admin email address to receive password reset link:', defaultEmail);
    if (!email) return;

    if (window.FirebaseAuth) {
      showToast('Sending password reset email...');
      const res = await window.FirebaseAuth.resetPassword(email);
      if (res.success) {
        showToast(`Reset email sent to ${email}. Check your inbox!`);
      } else {
        showToast(res.error || 'Failed to send reset email.', 'error');
      }
    } else {
      showToast('Firebase Auth is initializing. Please try again.', 'error');
    }
  }

  // --- 2. Data Initialization ---
  async function initApp() {
    let loadedFromSupabase = false;

    // 1. Try Supabase Main Database first
    if (window.SupabaseDB && window.SupabaseDB.isConfigured()) {
      try {
        const [cloudLabs, cloudDocs, cloudImages] = await Promise.all([
          window.SupabaseDB.getLaboratories(),
          window.SupabaseDB.getDocuments(),
          window.SupabaseDB.getSiteImages()
        ]);

        if (Array.isArray(cloudLabs) && cloudLabs.length > 0) {
          allLaboratories = cloudLabs.map(l => ({
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
          loadedFromSupabase = true;
        }

        if (Array.isArray(cloudDocs) && cloudDocs.length > 0) {
          allDocuments = cloudDocs;
        }

        if (Array.isArray(cloudImages) && cloudImages.length > 0) {
          cloudImages.forEach(savedImg => {
            const found = SITE_IMAGES_REGISTRY.find(i => i.id === savedImg.id);
            if (found) {
              if (savedImg.title) found.title = savedImg.title;
              if (savedImg.sub) found.sub = savedImg.sub;
              if (savedImg.section) found.section = savedImg.section;
              if (savedImg.desc) found.desc = savedImg.desc;
              if (savedImg.path) found.path = savedImg.path;
            }
          });
        }

        if (loadedFromSupabase) {
          console.log('[Supabase] Initialized 35 Labs & Content from Supabase Cloud.');
        }
      } catch (err) {
        console.warn('[Supabase] Initial fetch error, using local fallback:', err);
      }
    }

    // 2. Fetch /api/data fallback or supplementary
    try {
      const res = await fetch('/api/data', { cache: 'no-store' });
      if (res.ok) {
        siteDatabase = await res.json();
      }
    } catch (e) {
      console.warn('Could not fetch /api/data:', e);
    }

    if (!siteDatabase) {
      siteDatabase = {};
    }

    // Laboratories Fallback
    if (!loadedFromSupabase || allLaboratories.length === 0) {
      if (Array.isArray(siteDatabase.laboratories) && siteDatabase.laboratories.length > 0) {
        allLaboratories = siteDatabase.laboratories;
      } else if (typeof REVA_35_LABORATORIES !== 'undefined') {
        allLaboratories = REVA_35_LABORATORIES;
      } else {
        allLaboratories = [];
      }
    }

    // Documents / Resources Fallback
    if (allDocuments.length === 0) {
      if (siteDatabase.content && Array.isArray(siteDatabase.content.resources) && siteDatabase.content.resources.length > 0) {
        allDocuments = siteDatabase.content.resources;
      } else {
        allDocuments = DEFAULT_DOCUMENTS;
      }
    }

    // Site Images Registry Sync from siteDatabase if not already from Supabase
    if (!loadedFromSupabase && siteDatabase && Array.isArray(siteDatabase.siteImages)) {
      siteDatabase.siteImages.forEach(savedImg => {
        const found = SITE_IMAGES_REGISTRY.find(i => i.id === savedImg.id);
        if (found) {
          if (savedImg.title) found.title = savedImg.title;
          if (savedImg.sub) found.sub = savedImg.sub;
          if (savedImg.section) found.section = savedImg.section;
          if (savedImg.desc) found.desc = savedImg.desc;
          if (savedImg.path) found.path = savedImg.path;
        }
      });
    }

    // Update Counter Badges
    const labsBadge = document.getElementById('count-labs-badge');
    if (labsBadge) labsBadge.textContent = allLaboratories.length;

    const docsBadge = document.getElementById('count-docs-badge');
    if (docsBadge) docsBadge.textContent = allDocuments.length;

    const imgsBadge = document.getElementById('count-imgs-badge');
    if (imgsBadge) imgsBadge.textContent = SITE_IMAGES_REGISTRY.length;

    // Render Active Tab
    renderCurrentTab();

    // Dual-Sync to Firebase Cloud Firestore if available
    if (window.FirebaseFirestore) {
      window.FirebaseFirestore.syncAll({
        laboratories: allLaboratories,
        content: { resources: allDocuments },
        siteImages: SITE_IMAGES_REGISTRY
      }).catch(err => console.warn('[Firestore] Sync warning:', err));
    }
  }

  // --- 3. Tab Switching ---
  function switchTab(tabName) {
    activeTab = tabName;
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    document.querySelectorAll('.view-section').forEach(view => {
      view.classList.toggle('active', view.id === `view-${tabName}`);
    });
    renderCurrentTab();
  }

  function renderCurrentTab() {
    if (activeTab === 'laboratories') {
      renderLaboratories();
    } else if (activeTab === 'documents') {
      renderDocuments();
    } else if (activeTab === 'images') {
      renderImages();
    }
  }

  // ==========================================================================
  // MODULE 1: 35 INTEGRATED LABORATORIES
  // ==========================================================================
  function renderLaboratories() {
    const container = document.getElementById('labs-grid-container');
    if (!container) return;

    const searchInput = document.getElementById('labs-search-input');
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

    const filtered = allLaboratories.filter(lab => {
      const matchCat = activeLabCategory === 'all' || (lab.category && lab.category.toLowerCase().includes(activeLabCategory));
      const matchText = !query || 
        (lab.name && lab.name.toLowerCase().includes(query)) ||
        (lab.code && lab.code.toLowerCase().includes(query)) ||
        (lab.scope && lab.scope.toLowerCase().includes(query)) ||
        (lab.parameters && lab.parameters.toLowerCase().includes(query)) ||
        (lab.cmc && lab.cmc.toLowerCase().includes(query));
      return matchCat && matchText;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 48px; text-align: center; color: var(--text-muted);">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px; opacity: 0.5;">
            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <p style="font-size: 1.1rem; font-weight: 600; color: var(--text-secondary);">No laboratories match your criteria</p>
          <p style="font-size: 0.85rem;">Try modifying your search or clearing the category filter.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(lab => `
      <div class="lab-card" data-lab-id="${lab.id}">
        <div>
          <div class="lab-card-header">
            <div>
              <div class="lab-card-meta">
                <span class="lab-code-badge">${lab.code || 'LAB-' + lab.id}</span>
                <span class="lab-category-tag">${lab.category || 'General'}</span>
              </div>
              <h3 class="lab-card-title">${lab.name}</h3>
              <p class="lab-card-tagline">${lab.tagline || (lab.scope ? lab.scope.substring(0, 75) + '...' : '')}</p>
            </div>
          </div>

          <div class="lab-specs-grid" style="margin-top: 14px;">
            <div class="lab-spec-item">
              <span class="lab-spec-label">CMC Uncertainty</span>
              <span class="lab-spec-val" title="${lab.statCmc || lab.cmc || '± 1.2 µm'}">${lab.statCmc || lab.cmc || '± 1.2 µm (k=2)'}</span>
            </div>
            <div class="lab-spec-item">
              <span class="lab-spec-label">TAT Schedule</span>
              <span class="lab-spec-val">${lab.tat || '24–48h Priority'}</span>
            </div>
            <div class="lab-spec-item">
              <span class="lab-spec-label">Environment</span>
              <span class="lab-spec-val">${lab.envControl || '20°C ± 1°C'}</span>
            </div>
            <div class="lab-spec-item">
              <span class="lab-spec-label">Capability</span>
              <span class="lab-spec-val">${lab.instCount || 'NABL Scope'}</span>
            </div>
          </div>

          <div class="lab-card-brochure-row">
            <div style="display: flex; align-items: center; gap: 6px; overflow: hidden; flex: 1;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--orange-primary); flex-shrink: 0;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              <span style="font-size: 0.74rem; font-weight: 600; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${lab.catalogName ? lab.catalogName : (lab.catalogUrl ? 'Brochure PDF' : 'No Brochure PDF')}
              </span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
              <input type="file" id="direct-lab-brochure-file-${lab.id}" accept=".pdf" style="display: none;" onchange="window.AdminApp.uploadBrochureForLab(${lab.id}, this)">
              <button type="button" class="btn-upload-direct" onclick="document.getElementById('direct-lab-brochure-file-${lab.id}').click()" title="Upload or Replace PDF Brochure">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                Upload PDF
              </button>
            </div>
          </div>
        </div>

        <div class="lab-card-footer">
          <div>
            ${lab.catalogUrl ? `
              <a href="${lab.catalogUrl}" target="_blank" class="lab-catalog-badge" title="${lab.catalogName || 'Lab Catalog'}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                <span>Preview PDF</span>
              </a>
            ` : '<span style="font-size: 0.72rem; color: var(--text-muted);">No catalog linked</span>'}
          </div>

          <button class="btn-primary btn-sm" onclick="window.AdminApp.openLabModal(${lab.id})">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            Edit Lab &amp; Scope
          </button>
        </div>
      </div>
    `).join('');
  }

  function openLabModal(labId) {
    const lab = allLaboratories.find(l => Number(l.id) === Number(labId));
    if (!lab) return;

    currentEditingLab = lab;
    document.getElementById('edit-lab-id').value = lab.id;
    document.getElementById('edit-lab-name').value = lab.name || '';
    document.getElementById('edit-lab-code').value = lab.code || '';
    document.getElementById('edit-lab-category').value = lab.category || 'dimensional';
    document.getElementById('edit-lab-tagline').value = lab.tagline || '';
    document.getElementById('edit-lab-cmc').value = lab.cmc || lab.statCmc || '';
    document.getElementById('edit-lab-tat').value = lab.tat || '24–48h';
    document.getElementById('edit-lab-env').value = lab.envControl || '20°C ± 1°C';
    document.getElementById('edit-lab-scope').value = lab.scope || '';
    document.getElementById('edit-lab-equipment').value = lab.equipment || '';
    document.getElementById('edit-lab-standards').value = lab.standards || '';
    document.getElementById('edit-lab-parameters').value = lab.parameters || '';
    document.getElementById('edit-lab-catalog-url').value = lab.catalogUrl || '';
    document.getElementById('edit-lab-catalog-name').value = lab.catalogName || '';

    // Update prominent modal brochure box
    updateModalBrochureDisplay(lab.catalogUrl, lab.catalogName);

    const modal = document.getElementById('lab-edit-modal');
    if (modal) modal.classList.add('open');
  }

  function updateModalBrochureDisplay(url, name) {
    const displayName = document.getElementById('modal-brochure-display-name');
    const displayUrl = document.getElementById('modal-brochure-display-url');
    const statusBadge = document.getElementById('modal-brochure-status-badge');
    const viewBtn = document.getElementById('modal-view-pdf-btn');
    const downloadBtn = document.getElementById('modal-download-pdf-btn');

    if (url) {
      if (displayName) displayName.textContent = name || 'Brochure PDF Attached';
      if (displayUrl) displayUrl.textContent = url;
      if (statusBadge) statusBadge.innerHTML = '<span class="status-pill" style="font-size: 0.72rem; padding: 3px 8px; color: var(--green-success);"><span class="status-indicator-dot"></span> Active PDF</span>';
      if (viewBtn) {
        viewBtn.href = url;
        viewBtn.style.display = 'inline-flex';
      }
      if (downloadBtn) {
        downloadBtn.href = url;
        downloadBtn.download = name || 'Lab_Brochure.pdf';
        downloadBtn.style.display = 'inline-flex';
      }
    } else {
      if (displayName) displayName.textContent = 'Click or Drag & Drop to Upload Brochure PDF';
      if (displayUrl) displayUrl.textContent = 'Select official PDF document from your computer';
      if (statusBadge) statusBadge.innerHTML = '<span style="font-size: 0.72rem; color: var(--text-muted); background: rgba(255,255,255,0.06); padding: 3px 8px; border-radius: 12px;">No PDF</span>';
      if (viewBtn) viewBtn.style.display = 'none';
      if (downloadBtn) downloadBtn.style.display = 'none';
    }
  }

  function closeLabModal() {
    const modal = document.getElementById('lab-edit-modal');
    if (modal) modal.classList.remove('open');
    currentEditingLab = null;
  }

  async function saveLabData(e) {
    e.preventDefault();
    if (!currentEditingLab) return;

    const labId = Number(document.getElementById('edit-lab-id').value);
    const catUrl = document.getElementById('edit-lab-catalog-url').value.trim();
    const catName = document.getElementById('edit-lab-catalog-name').value.trim();

    const updatedLab = {
      ...currentEditingLab,
      id: labId,
      name: document.getElementById('edit-lab-name').value.trim(),
      code: document.getElementById('edit-lab-code').value.trim(),
      category: document.getElementById('edit-lab-category').value.trim(),
      tagline: document.getElementById('edit-lab-tagline').value.trim(),
      cmc: document.getElementById('edit-lab-cmc').value.trim(),
      statCmc: document.getElementById('edit-lab-cmc').value.trim(),
      tat: document.getElementById('edit-lab-tat').value.trim(),
      envControl: document.getElementById('edit-lab-env').value.trim(),
      scope: document.getElementById('edit-lab-scope').value.trim(),
      equipment: document.getElementById('edit-lab-equipment').value.trim(),
      standards: document.getElementById('edit-lab-standards').value.trim(),
      parameters: document.getElementById('edit-lab-parameters').value.trim(),
      catalogUrl: catUrl,
      catalogName: catName,
      documentData: catUrl,
      documentName: catName
    };

    // Update in memory
    const index = allLaboratories.findIndex(l => Number(l.id) === labId);
    if (index !== -1) {
      allLaboratories[index] = updatedLab;
    }

    // Save to Supabase Cloud if configured
    if (window.SupabaseDB && window.SupabaseDB.isConfigured()) {
      try {
        await window.SupabaseDB.upsertLaboratory(updatedLab);
      } catch (sbErr) {
        console.warn('[Supabase] Error upserting lab:', sbErr);
      }
    }

    // Save to Firebase Cloud Firestore
    if (window.FirebaseFirestore) {
      try {
        window.FirebaseFirestore.syncLaboratories([updatedLab]);
      } catch (fbErr) {
        console.warn('[Firebase Firestore] Error upserting lab:', fbErr);
      }
    }

    // Save to Server
    try {
      const res = await fetch('/api/laboratories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLab)
      });
      if (res.ok) {
        showToast(`Saved laboratory: ${updatedLab.name}`);
        closeLabModal();
        renderLaboratories();
      } else {
        showToast('Saved locally / cloud synced.', 'success');
        closeLabModal();
        renderLaboratories();
      }
    } catch (err) {
      showToast('Saved laboratory data.', 'success');
      closeLabModal();
      renderLaboratories();
    }
  }

  // Handle Lab Catalog File Upload inside modal
  function handleLabCatalogUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    showToast(`Uploading ${file.name}...`);
    const reader = new FileReader();
    reader.onload = async function (evt) {
      const base64 = evt.target.result;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: file.name,
            base64: base64
          })
        });
        const data = await res.json();
        if (data.success && data.url) {
          document.getElementById('edit-lab-catalog-url').value = data.url;
          document.getElementById('edit-lab-catalog-name').value = file.name;
          updateModalBrochureDisplay(data.url, file.name);
          showToast(`Uploaded ${file.name} successfully! Click Save to apply.`);
        } else {
          showToast('Upload error: ' + (data.error || 'Server rejected file'), 'error');
        }
      } catch (err) {
        showToast('Upload failed: ' + err.message, 'error');
      }
    };
    reader.readAsDataURL(file);
  }

  // Direct 1-Click Brochure Upload for any of the 35 labs from the card
  async function uploadBrochureForLab(labId, inputElement) {
    const file = inputElement.files[0];
    if (!file) return;

    const lab = allLaboratories.find(l => Number(l.id) === Number(labId));
    if (!lab) return;

    showToast(`Uploading brochure for ${lab.name}...`);

    const reader = new FileReader();
    reader.onload = async function (evt) {
      const base64 = evt.target.result;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: file.name,
            base64: base64
          })
        });
        const data = await res.json();
        if (data.success && data.url) {
          lab.catalogUrl = data.url;
          lab.catalogName = file.name;
          lab.documentData = data.url;
          lab.documentName = file.name;

          // Save to server
          await fetch('/api/laboratories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lab)
          });

          // Save to Supabase Cloud
          if (window.SupabaseDB && window.SupabaseDB.isConfigured()) {
            window.SupabaseDB.upsertLaboratory(lab).catch(e => console.warn('Supabase lab update error:', e));
          }

          // Save to Firebase Cloud Firestore
          if (window.FirebaseFirestore) {
            window.FirebaseFirestore.syncLaboratories([lab]).catch(e => console.warn('Firestore lab update error:', e));
          }

          showToast(`Brochure "${file.name}" linked to ${lab.name}!`);
          renderLaboratories();
        } else {
          showToast('Failed to upload brochure.', 'error');
        }
      } catch (err) {
        showToast('Upload error: ' + err.message, 'error');
      }
    };
    reader.readAsDataURL(file);
  }

  // ==========================================================================
  // MODULE 2: DOCUMENTS, BROCHURES & CERTIFICATES
  // ==========================================================================
  function renderDocuments() {
    const container = document.getElementById('docs-grid-container');
    if (!container) return;

    container.innerHTML = allDocuments.map(doc => `
      <div class="doc-card" data-doc-id="${doc.id}">
        <div>
          <span class="doc-card-badge ${doc.category === 'Certificate' ? 'cert' : ''}">
            ${doc.category || 'Official Document'}
          </span>
          <h3 class="doc-card-title">${doc.title}</h3>
          <p class="doc-card-desc">${doc.desc || ''}</p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div class="doc-card-meta" title="${doc.fileUrl}">
            <strong>Path:</strong> ${doc.fileUrl}
          </div>

          <div class="doc-card-actions">
            <a href="${doc.fileUrl}" target="_blank" class="btn-secondary btn-sm" style="flex: 1;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              View Document
            </a>
            <a href="${doc.fileUrl}" download class="btn-secondary btn-sm" style="flex: 1;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download
            </a>
          </div>

          <!-- Replace File Button -->
          <div style="position: relative;">
            <input type="file" id="replace-doc-file-${doc.id}" style="display: none;" accept=".pdf,.doc,.docx,.jpeg,.jpg,.png" onchange="window.AdminApp.replaceDocFile(${doc.id}, this)">
            <button class="btn-primary btn-sm" style="width: 100%;" onclick="document.getElementById('replace-doc-file-${doc.id}').click()">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              Upload & Replace Document File
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Replace existing document file directly
  async function replaceDocFile(docId, inputElement) {
    const file = inputElement.files[0];
    if (!file) return;

    const doc = allDocuments.find(d => Number(d.id) === Number(docId));
    if (!doc) return;

    const reader = new FileReader();
    reader.onload = async function (e) {
      const base64 = e.target.result;
      try {
        // Try direct replacement if targeting existing known document
        let endpoint = '/api/replace-image';
        let payload = {
          targetPath: doc.fileUrl,
          base64: base64
        };

        let res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        let data = await res.json();
        if (!data.success) {
          // Fallback to /api/upload
          res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: file.name, base64: base64 })
          });
          data = await res.json();
          if (data.success && data.url) {
            doc.fileUrl = data.url;
            await saveAllDocuments();
          }
        }

        showToast(`Document "${doc.title}" replaced with ${file.name}!`);
        renderDocuments();
      } catch (err) {
        showToast('Document update error: ' + err.message, 'error');
      }
    };
    reader.readAsDataURL(file);
  }

  // Add a new brochure or certificate
  async function handleNewDocSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('new-doc-title').value.trim();
    const category = document.getElementById('new-doc-category').value;
    const desc = document.getElementById('new-doc-desc').value.trim();
    const fileInput = document.getElementById('new-doc-file');
    const file = fileInput.files[0];

    if (!file) {
      showToast('Please select a PDF or document file to upload.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async function (evt) {
      const base64 = evt.target.result;
      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: file.name, base64: base64 })
        });
        const uploadData = await uploadRes.json();
        const fileUrl = (uploadData.success && uploadData.url) ? uploadData.url : `assets/docs/${file.name}`;

        const newDoc = {
          id: Date.now(),
          meta: `${category.toUpperCase()}: ${file.name.toUpperCase()}`,
          title: title,
          category: category,
          desc: desc,
          fileUrl: fileUrl,
          buttonText: 'Download'
        };

        allDocuments.push(newDoc);
        await saveAllDocuments();

        showToast(`Added document: ${title}`);
        e.target.reset();
        document.getElementById('dropzone-file-name').textContent = 'No file chosen';
        renderDocuments();
      } catch (err) {
        showToast('Error uploading document: ' + err.message, 'error');
      }
    };
    reader.readAsDataURL(file);
  }

  async function saveAllDocuments() {
    if (window.SupabaseDB && window.SupabaseDB.isConfigured()) {
      try {
        for (const doc of allDocuments) {
          await window.SupabaseDB.upsertDocument(doc);
        }
      } catch (err) {
        console.warn('[Supabase] Error syncing documents:', err);
      }
    }

    if (window.FirebaseFirestore) {
      try {
        window.FirebaseFirestore.syncDocuments(allDocuments);
      } catch (fbErr) {
        console.warn('[Firebase Firestore] Error syncing documents:', fbErr);
      }
    }

    try {
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allDocuments)
      });
    } catch (e) {
      console.warn('Could not post /api/documents:', e);
    }
  }

  // ==========================================================================
  // MODULE 3: INFRASTRUCTURE & LEADERSHIP IMAGES & WORDS MANAGER
  // ==========================================================================
  let currentEditingImage = null;
  let modalSelectedImageBase64 = null;

  function renderImages() {
    const container = document.getElementById('images-grid-container');
    if (!container) return;

    const filtered = SITE_IMAGES_REGISTRY.filter(img => {
      if (activeImageCategory === 'all') return true;
      if (activeImageCategory === 'infrastructure') return img.category === 'infrastructure';
      if (activeImageCategory === 'leadership') return img.category === 'leadership';
      return true;
    });

    const timestamp = Date.now();

    container.innerHTML = filtered.map(img => `
      <div class="image-card" data-img-id="${img.id}">
        <div class="image-preview-wrap">
          <img src="${img.path}?t=${timestamp}" alt="${img.title}" id="img-preview-${img.id}" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\'><rect fill=\\'%23162032\\' width=\\'100\\' height=\\'100\\'/><text fill=\\'%2394A3B8\\' x=\\'50%\\' y=\\'50%\\' text-anchor=\\'middle\\' dy=\\'.3em\\'>Image</text></svg>'">
        </div>

        <div class="image-card-body">
          <div>
            <span class="image-card-section-tag">${img.section}</span>
            <h3 class="image-card-title">${img.title}</h3>
            ${img.sub ? `<div style="font-size: 0.76rem; font-weight: 600; color: var(--orange-primary); margin-top: 3px;">${img.sub}</div>` : ''}
            <p style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px;">${img.desc}</p>
          </div>

          <div class="image-card-path" title="${img.path}">
            ${img.path}
          </div>

          <div class="image-card-actions" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <button class="btn-secondary btn-sm" onclick="window.AdminApp.openImageWordsModal('${img.id}')" title="Edit text, headings, captions & notes">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Edit Words
            </button>
            <input type="file" id="replace-image-input-${img.id}" style="display: none;" accept="image/*,.svg" onchange="window.AdminApp.replaceSiteImage('${img.id}', '${img.path}', this)">
            <button class="btn-primary btn-sm" onclick="document.getElementById('replace-image-input-${img.id}').click()" title="Upload or Replace Image File">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              Change Image
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Direct image replacement with cache bust and instant update
  async function replaceSiteImage(imgId, targetPath, inputElement) {
    const file = inputElement.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (e) {
      const base64 = e.target.result;
      try {
        const res = await fetch('/api/replace-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetPath: targetPath,
            base64: base64
          })
        });

        const data = await res.json();
        if (data.success) {
          showToast(`Replaced image: ${targetPath}`);
          // Update preview immediately
          const preview = document.getElementById(`img-preview-${imgId}`);
          if (preview) {
            preview.src = `${targetPath}?t=${Date.now()}`;
          }

          const imgObj = SITE_IMAGES_REGISTRY.find(i => i.id === imgId);
          if (imgObj) {
            // Save to Supabase Cloud
            if (window.SupabaseDB && window.SupabaseDB.isConfigured()) {
              window.SupabaseDB.upsertSiteImage(imgObj).catch(err => console.warn('Supabase image update error:', err));
            }
            // Save to Firebase Cloud Firestore
            if (window.FirebaseFirestore) {
              window.FirebaseFirestore.syncImages([imgObj]).catch(err => console.warn('Firestore image update error:', err));
            }
          }
        } else {
          showToast(data.error || 'Failed to replace image', 'error');
        }
      } catch (err) {
        showToast('Image upload error: ' + err.message, 'error');
      }
    };
    reader.readAsDataURL(file);
  }

  // Open Edit Words & Image Modal
  function openImageWordsModal(imgId) {
    const img = SITE_IMAGES_REGISTRY.find(i => i.id === imgId);
    if (!img) return;
    currentEditingImage = img;
    modalSelectedImageBase64 = null;

    document.getElementById('edit-img-id').value = img.id;
    document.getElementById('edit-img-path').value = img.path;
    document.getElementById('edit-img-section').value = img.section || '';
    document.getElementById('edit-img-title').value = img.title || '';
    document.getElementById('edit-img-sub').value = img.sub || '';
    document.getElementById('edit-img-desc').value = img.desc || '';

    const preview = document.getElementById('edit-img-modal-preview');
    if (preview) preview.src = `${img.path}?t=${Date.now()}`;

    const pathDisp = document.getElementById('edit-img-modal-path-display');
    if (pathDisp) pathDisp.textContent = img.path;

    const fileStatus = document.getElementById('edit-img-modal-filestatus');
    if (fileStatus) fileStatus.textContent = 'Current image loaded';

    const fileInput = document.getElementById('edit-img-modal-file');
    if (fileInput) fileInput.value = '';

    const modal = document.getElementById('image-words-modal');
    if (modal) modal.classList.add('open');
  }

  function closeImageWordsModal() {
    const modal = document.getElementById('image-words-modal');
    if (modal) modal.classList.remove('open');
    currentEditingImage = null;
    modalSelectedImageBase64 = null;
  }

  function handleModalImageFilePicked(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      modalSelectedImageBase64 = e.target.result;
      const preview = document.getElementById('edit-img-modal-preview');
      if (preview) preview.src = modalSelectedImageBase64;
      const fileStatus = document.getElementById('edit-img-modal-filestatus');
      if (fileStatus) fileStatus.textContent = `Selected: ${file.name}`;
    };
    reader.readAsDataURL(file);
  }

  async function saveImageWordsData(e) {
    e.preventDefault();
    if (!currentEditingImage) return;

    const saveBtn = document.getElementById('save-img-words-btn');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = 'Saving Changes...';
    }

    const imgId = document.getElementById('edit-img-id').value;
    const targetPath = document.getElementById('edit-img-path').value;
    const newSection = document.getElementById('edit-img-section').value.trim();
    const newTitle = document.getElementById('edit-img-title').value.trim();
    const newSub = document.getElementById('edit-img-sub').value.trim();
    const newDesc = document.getElementById('edit-img-desc').value.trim();

    // 1. If a new image file was selected, upload/replace it
    if (modalSelectedImageBase64) {
      try {
        const replaceRes = await fetch('/api/replace-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetPath: targetPath,
            base64: modalSelectedImageBase64
          })
        });
        const replaceData = await replaceRes.json();
        if (!replaceData.success) {
          console.warn('Replace image response:', replaceData);
        }
      } catch (err) {
        console.warn('Error replacing image file:', err);
      }
    }

    // 2. Update in-memory registry
    currentEditingImage.section = newSection;
    currentEditingImage.title = newTitle;
    currentEditingImage.sub = newSub;
    currentEditingImage.desc = newDesc;

    // 3. Update siteDatabase
    if (!siteDatabase) siteDatabase = {};
    if (!siteDatabase.siteImages) siteDatabase.siteImages = [];

    const existingIdx = siteDatabase.siteImages.findIndex(i => i.id === imgId);
    if (existingIdx !== -1) {
      siteDatabase.siteImages[existingIdx] = { ...currentEditingImage };
    } else {
      siteDatabase.siteImages.push({ ...currentEditingImage });
    }

    // Sync to specific section content
    if (imgId === 'md-portrait') {
      if (!siteDatabase.leadership) siteDatabase.leadership = {};
      if (newTitle) siteDatabase.leadership.authorName = newTitle;
      if (newSub) siteDatabase.leadership.authorTitle = newSub;
      if (newDesc) {
        siteDatabase.leadership.quotes = [newDesc];
      }
    } else if (imgId === 'facility-building') {
      if (!siteDatabase.about) siteDatabase.about = {};
      if (newTitle) siteDatabase.about.buildingTitle = newTitle;
      if (newSub) siteDatabase.about.buildingSub = newSub;
    } else {
      // Gallery sync
      if (siteDatabase.gallery && Array.isArray(siteDatabase.gallery)) {
        const gItem = siteDatabase.gallery.find(g => g.image === targetPath);
        if (gItem) {
          gItem.title = newTitle;
          gItem.sub = newSub;
        }
      }
    }

    // 4. Save to Supabase Cloud if configured
    if (window.SupabaseDB && window.SupabaseDB.isConfigured()) {
      try {
        await window.SupabaseDB.upsertSiteImage(currentEditingImage);
      } catch (sbErr) {
        console.warn('[Supabase] Error upserting image to cloud:', sbErr);
      }
    }

    // 5. Save to Firebase Cloud Firestore
    if (window.FirebaseFirestore) {
      try {
        await window.FirebaseFirestore.syncImages([currentEditingImage]);
      } catch (fbErr) {
        console.warn('[Firebase Firestore] Error upserting image to cloud:', fbErr);
      }
    }

    // Save to Server API
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteDatabase)
      });
      showToast(`Saved "${newTitle}" & updated words successfully!`);
    } catch (err) {
      showToast('Saved words & image data.', 'success');
    }

    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Save Words &amp; Image';
    }

    closeImageWordsModal();
    renderImages();
  }

  // --- Global Event Bindings ---
  document.addEventListener('DOMContentLoaded', () => {
    // Check initial auth
    checkAuth();

    // Listen to Firebase Auth state
    if (window.FirebaseAuth) {
      window.FirebaseAuth.onAuthStateChanged(user => {
        if (user) {
          sessionStorage.setItem('reva_admin_token', 'firebase_authenticated');
          const overlay = document.getElementById('login-overlay');
          const shell = document.getElementById('admin-shell');
          if (overlay && overlay.style.display !== 'none') {
            overlay.style.display = 'none';
            if (shell) shell.style.display = 'flex';
            initApp();
          }
        }
      });
    }

    // Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    // Forgot Password Button
    const forgotBtn = document.getElementById('btn-forgot-password');
    if (forgotBtn) forgotBtn.addEventListener('click', handleForgotPassword);

    // Logout Button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // Navigation Tabs
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Laboratory Filters & Search
    document.querySelectorAll('.lab-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.lab-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeLabCategory = btn.dataset.cat || 'all';
        renderLaboratories();
      });
    });

    const labsSearchInput = document.getElementById('labs-search-input');
    if (labsSearchInput) {
      labsSearchInput.addEventListener('input', () => renderLaboratories());
    }

    // Lab Modal
    const labForm = document.getElementById('lab-edit-form');
    if (labForm) labForm.addEventListener('submit', saveLabData);

    const closeLabBtn = document.getElementById('close-lab-modal');
    if (closeLabBtn) closeLabBtn.addEventListener('click', closeLabModal);

    const labCatalogInput = document.getElementById('edit-lab-catalog-file');
    if (labCatalogInput) labCatalogInput.addEventListener('change', handleLabCatalogUpload);

    // Document Dropzone File Input
    const dropzoneInput = document.getElementById('new-doc-file');
    const dropzoneBox = document.getElementById('doc-dropzone');
    if (dropzoneBox && dropzoneInput) {
      dropzoneBox.addEventListener('click', () => dropzoneInput.click());
      dropzoneInput.addEventListener('change', () => {
        const file = dropzoneInput.files[0];
        const nameEl = document.getElementById('dropzone-file-name');
        if (file && nameEl) nameEl.textContent = file.name;
      });
    }

    const newDocForm = document.getElementById('new-doc-form');
    if (newDocForm) newDocForm.addEventListener('submit', handleNewDocSubmit);

    // Image Category Tabs
    document.querySelectorAll('.img-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.img-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeImageCategory = btn.dataset.imgcat || 'all';
        renderImages();
      });
    });
  });

  // Expose methods for inline actions
  window.AdminApp = {
    openLabModal,
    closeLabModal,
    replaceDocFile,
    replaceSiteImage,
    uploadBrochureForLab,
    openImageWordsModal,
    closeImageWordsModal,
    handleModalImageFilePicked,
    saveImageWordsData
  };
})();
