/* ==========================================================================
   REVA PHOENIX MAIN APPLICATION ENGINE
   Navigation, Dynamic Site Data Hydration, Interactive Labs & State Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Navigation Scroll State
  const siteHeader = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  });

  // 2. Mobile Nav Drawer
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const mobileClose = document.getElementById('mobile-drawer-close');
  const drawerOverlay = document.getElementById('mobile-drawer-overlay');
  const drawerLinks = document.querySelectorAll('.mobile-drawer-link');

  function openDrawer() {
    mobileDrawer.classList.add('open');
    drawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    mobileDrawer.classList.remove('open');
    drawerOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openDrawer);
  if (mobileClose) mobileClose.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // 3. Dynamic Site Data Hydration (Content, Media, Contact & Social)
  function applySiteData() {
    if (typeof SiteData === 'undefined') return;

    const content = SiteData.getContent();
    const contact = SiteData.getContact();
    const social = SiteData.getSocial();
    const media = SiteData.getMedia();

    // --- Hero Section Hydration ---
    if (content.hero) {
      const subheadEl = document.getElementById('hero-subhead-text');
      if (subheadEl && content.hero.subhead) {
        const lines = content.hero.subhead.split('\n').filter(l => l.trim().length > 0);
        if (lines.length >= 3) {
          subheadEl.innerHTML = `<span class="hero-subhead-services">${lines[0]}<br>${lines[1]}</span><span class="hero-subhead-trust">${lines.slice(2).join(' ')}</span>`;
        } else if (lines.length === 2) {
          subheadEl.innerHTML = `<span class="hero-subhead-services">${lines[0]}</span><span class="hero-subhead-trust">${lines[1]}</span>`;
        } else {
          subheadEl.textContent = content.hero.subhead;
        }
      }

      const coordEl = document.getElementById('hero-coordinates-tag');
      if (coordEl && content.hero.coordinates) coordEl.textContent = content.hero.coordinates;

      const badgeTag = document.getElementById('hero-badge-tag');
      if (badgeTag && content.hero.badgeText) {
        if (content.hero.badgeText.toUpperCase().includes('NABL')) {
          const rest = content.hero.badgeText.replace(/^NABL\s*/i, '');
          badgeTag.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg><span class="nabl-accent">NABL</span> <span>${rest}</span>`;
        } else {
          badgeTag.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg><span>${content.hero.badgeText}</span>`;
        }
      }

      if (content.hero.headline) {
        const headlineEl = document.getElementById('hero-headline-title');
        if (headlineEl) headlineEl.innerHTML = content.hero.headline;
      }

      if (content.hero.statNumber) {
        const numEl = document.querySelector('.hero-labs-number');
        if (numEl) numEl.textContent = content.hero.statNumber;
      }

      if (content.hero.telemetry && Array.isArray(content.hero.telemetry)) {
        content.hero.telemetry.forEach((t, i) => {
          const itemEl = document.getElementById(`hero-telemetry-${i}`);
          if (itemEl) {
            itemEl.innerHTML = `<span>${t.label}</span> ${t.value}`;
          }
        });
      }
    }

    // --- Leadership Section Hydration ---
    if (content.leadership) {
      const leaderCompanyEl = document.getElementById('leader-author-company');
      if (leaderCompanyEl && content.leadership.authorCompany) leaderCompanyEl.textContent = content.leadership.authorCompany;

      if (content.leadership.quotes && Array.isArray(content.leadership.quotes)) {
        content.leadership.quotes.forEach((q, idx) => {
          const qEl = document.getElementById(`leader-quote-${idx}`);
          if (qEl) qEl.innerHTML = `"${q}"`;
        });
      }
    }

    // --- Trust Metrics Hydration ---
    if (content.metrics && Array.isArray(content.metrics)) {
      content.metrics.forEach((m, idx) => {
        const id = idx + 1;
        const bgEl = document.getElementById(`metric-bg-${id}`);
        const valEl = document.getElementById(`metric-val-${id}`);
        const sufEl = document.getElementById(`metric-suf-${id}`);
        const lblEl = document.getElementById(`metric-lbl-${id}`);
        const subEl = document.getElementById(`metric-sub-${id}`);

        if (bgEl && m.number) bgEl.textContent = m.number.padStart(2, '0');
        if (valEl && m.number) {
          valEl.setAttribute('data-target', m.number);
          valEl.textContent = m.number;
        }
        if (sufEl && m.suffix) sufEl.textContent = m.suffix;
        if (lblEl && m.label) lblEl.textContent = m.label;
        if (subEl && m.sub) subEl.textContent = m.sub;
      });
    }

    // --- About Section Hydration ---
    if (content.about) {
      const p1 = document.getElementById('about-p1');
      const p2 = document.getElementById('about-p2');
      const p3 = document.getElementById('about-p3');
      const titlePart2El = document.getElementById('about-title-part2');
      if (titlePart2El && content.about.titlePart2 && !content.about.titlePart2.includes("Integrated Private Calibration Laboratory")) {
        titlePart2El.innerHTML = content.about.titlePart2;
      }
      if (p1 && content.about.paragraph1) p1.innerHTML = content.about.paragraph1;
      if (p2 && content.about.paragraph2) p2.innerHTML = content.about.paragraph2;
      if (p3 && content.about.paragraph3) p3.innerHTML = content.about.paragraph3;
    }

    // --- Media & Images Hydration ---
    if (media) {
      if (media.heroBuildingImage) {
        const heroVisual = document.querySelector('.hero-building-visual');
        if (heroVisual) heroVisual.style.backgroundImage = `url('${media.heroBuildingImage}')`;
      }

      if (media.mdPortraitImage) {
        const leaderImg = document.getElementById('leader-img-portrait');
        if (leaderImg) leaderImg.src = media.mdPortraitImage;
      }

      if (media.logoImage) {
        document.querySelectorAll('.brand-logo-img, .site-footer img[alt="Reva Phoenix Logo"]').forEach(img => {
          img.src = media.logoImage;
        });
      }

      if (media.badge25YearsImage) {
        document.querySelectorAll('.brand-badge-img, .site-footer img[alt="25 Years Badge"]').forEach(img => {
          img.src = media.badge25YearsImage;
        });
      }
    }

    // --- Gallery & Infrastructure Images & Words Hydration ---
    if (content.gallery && Array.isArray(content.gallery)) {
      const galleryCards = document.querySelectorAll('.gallery-grid .gallery-card');
      content.gallery.forEach((g, idx) => {
        if (galleryCards[idx]) {
          const card = galleryCards[idx];
          if (g.image) {
            card.setAttribute('data-gallery-src', g.image);
            const img = card.querySelector('.gallery-card-img');
            if (img) img.src = g.image;
          }
          if (g.title) {
            card.setAttribute('data-gallery-title', g.title);
            const titleEl = card.querySelector('.gallery-caption-title');
            if (titleEl) titleEl.textContent = g.title;
          }
          if (g.sub) {
            card.setAttribute('data-gallery-sub', g.sub);
            const subEl = card.querySelector('.gallery-caption-sub');
            if (subEl) subEl.textContent = g.sub;
          }
        }
      });
    }

    // --- Dynamic siteImages (Infrastructure & Leadership) Words Hydration ---
    if (content.siteImages && Array.isArray(content.siteImages)) {
      content.siteImages.forEach(sImg => {
        if (sImg.id === 'md-portrait') {
          const lImg = document.getElementById('leader-img-portrait');
          if (lImg && sImg.path) lImg.src = sImg.path;
        } else if (sImg.id === 'facility-building') {
          const bCard = document.querySelector('.about-visual-card.about-building-card');
          if (bCard) {
            if (sImg.path) {
              bCard.setAttribute('data-gallery-src', sImg.path);
              const bImg = bCard.querySelector('.about-building-img');
              if (bImg) bImg.src = sImg.path;
            }
            if (sImg.title) {
              const tEl = bCard.querySelector('.about-building-title');
              if (tEl) tEl.textContent = sImg.title;
            }
            if (sImg.sub) {
              const sEl = bCard.querySelector('.about-building-sub');
              if (sEl) sEl.textContent = sImg.sub;
            }
          }
        } else {
          // Match gallery cards by path or title
          const gCard = document.querySelector(`.gallery-card[data-gallery-src*="${sImg.path}"]`) || document.querySelector(`.gallery-card[data-gallery-src="${sImg.path}"]`);
          if (gCard) {
            if (sImg.title) {
              gCard.setAttribute('data-gallery-title', sImg.title);
              const tEl = gCard.querySelector('.gallery-caption-title');
              if (tEl) tEl.textContent = sImg.title;
            }
            if (sImg.sub) {
              gCard.setAttribute('data-gallery-sub', sImg.sub);
              const sEl = gCard.querySelector('.gallery-caption-sub');
              if (sEl) sEl.textContent = sImg.sub;
            }
            if (sImg.path) {
              const imgEl = gCard.querySelector('.gallery-card-img');
              if (imgEl) imgEl.src = sImg.path;
            }
          }
        }
      });
    }

    // --- Contact & Office Coordinates Hydration ---
    if (contact) {
      // Primary Phone
      const enquiryPhone = document.getElementById('contact-enquiry-phone');
      if (enquiryPhone && contact.primaryPhone) {
        enquiryPhone.href = `tel:${contact.primaryPhone.replace(/\s+/g, '')}`;
        const span = enquiryPhone.querySelector('span');
        if (span) span.textContent = contact.primaryPhone;
      }
      const footerPhone = document.getElementById('footer-phone-val');
      if (footerPhone && contact.primaryPhone) {
        footerPhone.href = `tel:${contact.primaryPhone.replace(/\s+/g, '')}`;
        footerPhone.textContent = contact.primaryPhone;
      }

      // Feedback & Complaints Phone
      const feedbackPhone = document.getElementById('contact-feedback-phone');
      if (feedbackPhone) {
        const phone = contact.whatsappNumber || '+91 99405 64261';
        feedbackPhone.href = `tel:${phone.replace(/\s+/g, '')}`;
        const span = feedbackPhone.querySelector('span');
        if (span) span.textContent = phone;
      }

      // Primary Email
      const enquiryEmail = document.getElementById('contact-enquiry-email');
      if (enquiryEmail && contact.primaryEmail) {
        enquiryEmail.href = `mailto:${contact.primaryEmail}`;
        const span = enquiryEmail.querySelector('span');
        if (span) span.textContent = contact.primaryEmail;
      }
      const footerEmail = document.getElementById('footer-email-val');
      if (footerEmail && contact.primaryEmail) {
        footerEmail.href = `mailto:${contact.primaryEmail}`;
        footerEmail.textContent = contact.primaryEmail;
      }

      // Headquarters Address
      const contactHq = document.getElementById('contact-hq-address-block');
      if (contactHq) {
        contactHq.innerHTML = `
          <strong>Reva Phoenix Complex</strong><br>
          No. 14, 4th Street, Rajarajeswari Nagar, Madipakkam,<br>
          Chennai – 600 091, Tamil Nadu, India.
        `;
      }
      const footerHq = document.getElementById('footer-hq-address');
      if (footerHq) {
        footerHq.innerHTML = `
          Reva Phoenix Complex, No. 14,<br>
          4th Street, Rajarajeswari Nagar,<br>
          Madipakkam, Chennai – 600 091,<br>
          Tamil Nadu, India.
        `;
      }
    }

    // --- Social Media & External Division Links Hydration ---
    if (social) {
      // Calibration Division URL (e.g. revacalibration.com)
      const footerCalBtn = document.getElementById('footer-lab-division-btn');
      if (footerCalBtn && social.labDivisionUrl) {
        footerCalBtn.href = social.labDivisionUrl;
        try {
          const urlObj = new URL(social.labDivisionUrl);
          footerCalBtn.textContent = urlObj.hostname;
        } catch (_) {
          footerCalBtn.textContent = social.labDivisionUrl;
        }
      }

      // WhatsApp links
      if (social.whatsappChatUrl) {
        document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
          a.href = social.whatsappChatUrl;
        });
      }
    }
  }

  // Hydrate DOM on initial load
  try {
    applySiteData();
  } catch (err) {
    console.warn('applySiteData non-fatal initialization warning:', err);
  }

  // 4. Render 35 Integrated Laboratories & Setup Search / Filtering
  function getLaboratoriesData() {
    if (typeof SiteData !== 'undefined' && typeof SiteData.getLabs === 'function') {
      return SiteData.getLabs();
    }
    if (typeof window !== 'undefined' && window.SiteData && typeof window.SiteData.getLabs === 'function') {
      return window.SiteData.getLabs();
    }
    if (typeof REVA_35_LABORATORIES !== 'undefined' && Array.isArray(REVA_35_LABORATORIES) && REVA_35_LABORATORIES.length > 0) {
      return REVA_35_LABORATORIES;
    }
    if (typeof window !== 'undefined' && window.REVA_35_LABORATORIES && Array.isArray(window.REVA_35_LABORATORIES)) {
      return window.REVA_35_LABORATORIES;
    }
    return [];
  }

  const searchInput = document.getElementById('lab-search-input');
  let currentCategory = 'all';
  let currentQuery = '';

  function filterAndRenderLabs() {
    const allLabs = getLaboratoriesData();
    const targetCat = (currentCategory || 'all').toLowerCase().trim();
    const q = (currentQuery || '').toLowerCase().trim();

    const filtered = allLabs.filter(lab => {
      const labCat = (lab.category || '').toLowerCase().trim();
      const matchesCategory = targetCat === 'all' || labCat === targetCat;
      const matchesQuery = !q ||
                           (lab.name && lab.name.toLowerCase().includes(q)) ||
                           (lab.scope && lab.scope.toLowerCase().includes(q)) ||
                           (lab.code && lab.code.toLowerCase().includes(q)) ||
                           (lab.equipment && lab.equipment.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });

    if (typeof renderLaboratories === 'function') {
      renderLaboratories(filtered);
    }
  }

  // Global function for filtering categories directly from onclick or programmatically
  window.setLabCategory = function (category, clickedBtn) {
    currentCategory = (category || 'all').toLowerCase().trim();
    const allFilterBtns = document.querySelectorAll('.lab-filter-btn');
    allFilterBtns.forEach(b => {
      const bCat = (b.getAttribute('data-lab-category') || 'all').toLowerCase().trim();
      if (bCat === currentCategory) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
    filterAndRenderLabs();
  };

  // Attach click listeners to all filter pills
  const filterBtns = document.querySelectorAll('.lab-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = btn.getAttribute('data-lab-category') || 'all';
      window.setLabCategory(cat, btn);
    });
  });

  // Event delegation on container in case buttons are dynamically touched
  const filterPillsContainer = document.querySelector('.labs-filter-pills');
  if (filterPillsContainer) {
    filterPillsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.lab-filter-btn');
      if (btn) {
        e.preventDefault();
        const cat = btn.getAttribute('data-lab-category') || 'all';
        window.setLabCategory(cat, btn);
      }
    });
  }

  // Initial labs render
  filterAndRenderLabs();

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentQuery = e.target.value.trim();
      filterAndRenderLabs();
    });
  }

  window.resetLabFilter = function () {
    currentCategory = 'all';
    currentQuery = '';
    if (searchInput) searchInput.value = '';
    window.setLabCategory('all');
  };

  window.refreshLabsGrid = function () {
    filterAndRenderLabs();
  };

  window.setLabViewMode = function (mode) {
    window.currentLabViewMode = mode;
    const btnMatrix = document.getElementById('btn-view-matrix');
    const btnCards = document.getElementById('btn-view-cards');
    if (btnMatrix && btnCards) {
      if (mode === 'matrix') {
        btnMatrix.classList.add('active');
        btnCards.classList.remove('active');
      } else {
        btnCards.classList.add('active');
        btnMatrix.classList.remove('active');
      }
    }
    filterAndRenderLabs();
  };

  // 5. Cross-Tab Live Synchronization
  // When an admin updates labs, copy, contact or media in admin.html, update index.html live!
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('reva_phoenix_')) {
      applySiteData();
      filterAndRenderLabs();
    }
  });

  window.addEventListener('reva_data_updated', () => {
    applySiteData();
    filterAndRenderLabs();
  });

  // 6. Active Nav Link on Scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPosition = window.pageYOffset + 150;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // 8. Smooth Scroll with Header Offset
  document.addEventListener('click', function (e) {
    const anchor = e.target.closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href) return;

    let targetId = null;
    if (href.startsWith('#')) {
      targetId = href;
    } else if (href.includes('#')) {
      const url = new URL(anchor.href, window.location.href);
      const currentPath = window.location.pathname.replace(/\/$/, '');
      const linkPath = url.pathname.replace(/\/$/, '');
      if (linkPath === currentPath || linkPath.endsWith('/index.html') || linkPath === '') {
        targetId = url.hash;
      }
    }

    if (targetId && targetId !== '#' && targetId !== '#top') {
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 75;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        if (history.pushState) {
          history.pushState(null, null, targetId);
        }
      }
    }
  });

  // 9. Portfolio Filter Tabs (Company vs Events)
  const portfolioFilterBtns = document.querySelectorAll('[data-portfolio-filter]');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  portfolioFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-portfolio-filter');
      portfolioFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      portfolioCards.forEach(card => {
        const cat = card.getAttribute('data-portfolio-cat');
        if (filter === 'all' || cat === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
});
