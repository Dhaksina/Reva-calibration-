/**
 * SERVICES PAGE JAVASCRIPT — REVA PHOENIX CALIBRATION LABORATORIES
 * Handles sticky sub-navigation pills, smooth anchor scrolling with header offset,
 * direct hash navigation, category tab switching, equipment search filtering, and quotation triggers.
 */

let isProgrammaticScrolling = false;
let scrollFinishTimeout = null;

document.addEventListener('DOMContentLoaded', () => {
  initSubnavPills();
  initSmoothAnchorScrolling();
  initSubnavScrollSpy();
  initCatalogTabsAndSearch();
  initNonAccTabsAndSearch();
  initQuoteTriggers();
  handleInitialHashScroll();
});

// 1. Precise Section Scrolling with Double-Header Offset (Site Header 72px + Sticky Subnav 56px + Breathing Room = 135px)
function scrollToSection(targetId, smooth = true) {
  if (!targetId || targetId === '#' || targetId === '#top') {
    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
    return;
  }

  const cleanId = targetId.startsWith('#') ? targetId : '#' + targetId;
  const targetElement = document.querySelector(cleanId);
  if (!targetElement) return;

  // Signal that programmatic scroll is active to prevent ScrollSpy from conflicting
  isProgrammaticScrolling = true;
  if (scrollFinishTimeout) clearTimeout(scrollFinishTimeout);

  const headerOffset = 135;
  const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
  const targetPosition = Math.max(0, Math.round(elementPosition - headerOffset));

  // Perform window scroll
  window.scrollTo({
    top: targetPosition,
    behavior: smooth ? 'smooth' : 'auto'
  });

  // Fallback for non-smooth or restricted environments
  if (!smooth) {
    document.documentElement.scrollTop = targetPosition;
    document.body.scrollTop = targetPosition;
  }

  // Update URL hash without causing default browser page jump
  if (window.history && window.history.pushState) {
    window.history.pushState(null, null, cleanId);
  }

  // Highlight the active pill immediately
  updateActivePill(cleanId);

  // Reset scroll lock after smooth scrolling completes
  scrollFinishTimeout = setTimeout(() => {
    isProgrammaticScrolling = false;
  }, 750);
}

// 2. Subnav Pill State & Container Horizontal Scrolling (NEVER uses window-scrolling scrollIntoView)
function updateActivePill(targetId) {
  const pills = document.querySelectorAll('.services-pill');
  const subnavContainer = document.querySelector('.services-subnav-container');

  pills.forEach(pill => {
    const href = pill.getAttribute('href');
    if (href === targetId || href.endsWith(targetId)) {
      pill.classList.add('active');

      // Scroll ONLY the horizontal subnav container if pills overflow horizontally
      if (subnavContainer && subnavContainer.scrollWidth > subnavContainer.clientWidth) {
        const pillLeft = pill.offsetLeft;
        const pillWidth = pill.offsetWidth;
        const containerWidth = subnavContainer.clientWidth;
        subnavContainer.scrollTo({
          left: Math.max(0, pillLeft - (containerWidth / 2) + (pillWidth / 2)),
          behavior: 'smooth'
        });
      }
    } else {
      pill.classList.remove('active');
    }
  });
}

// 3. Dedicated Pill Click Handler for Instant Responsiveness
function initSubnavPills() {
  const pills = document.querySelectorAll('.services-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const targetHash = pill.getAttribute('href');
      if (targetHash) {
        pill.blur();
        scrollToSection(targetHash, true);
      }
    });
  });
}

// 4. Intercept All Other Anchor Clicks for Services Sections
function initSmoothAnchorScrolling() {
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    if (!anchor || anchor.classList.contains('services-pill')) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    let targetHash = null;

    // Direct hash on current page: "#inspection"
    if (href.startsWith('#')) {
      targetHash = href;
    }
    // Full or relative path to services.html with hash: "services.html#cnc-calibration"
    else if (href.includes('#')) {
      try {
        const url = new URL(anchor.href, window.location.href);
        const currentPath = window.location.pathname.replace(/\/$/, '');
        const linkPath = url.pathname.replace(/\/$/, '');

        if (linkPath === currentPath || linkPath.endsWith('/services.html')) {
          targetHash = url.hash;
        }
      } catch (err) {
        if (href.startsWith('services.html#')) {
          targetHash = href.substring(href.indexOf('#'));
        }
      }
    }

    if (targetHash && targetHash !== '#' && targetHash !== '#top') {
      const targetElement = document.querySelector(targetHash);
      if (targetElement) {
        e.preventDefault();
        anchor.blur();

        // Close mobile nav drawer if open
        const mobileDrawer = document.getElementById('mobile-nav-drawer');
        const mobileOverlay = document.getElementById('mobile-drawer-overlay');
        if (mobileDrawer) mobileDrawer.classList.remove('active');
        if (mobileOverlay) mobileOverlay.classList.remove('active');
        document.body.classList.remove('nav-open');

        scrollToSection(targetHash, true);
      }
    }
  });

  // Handle browser back/forward navigation
  window.addEventListener('hashchange', () => {
    if (window.location.hash) {
      scrollToSection(window.location.hash, true);
    }
  });
}

// 5. Handle Direct Hash on Page Load
function handleInitialHashScroll() {
  if (!window.location.hash) return;
  const hash = window.location.hash;

  // Immediate attempt
  scrollToSection(hash, false);

  // Checkpoint after initial paint
  setTimeout(() => scrollToSection(hash, true), 150);

  // Checkpoint after dynamic images/fonts layout
  setTimeout(() => scrollToSection(hash, true), 400);

  window.addEventListener('load', () => {
    setTimeout(() => scrollToSection(hash, true), 100);
  }, { once: true });
}

// 6. Sub-navigation Active State ScrollSpy
function initSubnavScrollSpy() {
  const sections = document.querySelectorAll('.service-section-wrap');
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    if (isProgrammaticScrolling) return; // Prevent fight with programmatic scrolling

    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        updateActivePill(`#${id}`);
      }
    });
  }, {
    rootMargin: '-20% 0px -65% 0px',
    threshold: 0
  });

  sections.forEach(sec => observer.observe(sec));
}

// 7. Equipment Catalog Category Tabs & Search Filter
function initCatalogTabsAndSearch() {
  const tabBtns = document.querySelectorAll('.catalog-tab-btn');
  const searchInput = document.getElementById('catalog-search-input');
  const items = document.querySelectorAll('.equipment-item-card');

  let currentCategory = 'all';
  let searchQuery = '';

  function filterItems() {
    items.forEach(item => {
      const itemCat = item.getAttribute('data-category') || '';
      const itemName = (item.querySelector('.equipment-item-name')?.textContent || '').toLowerCase();

      const matchesCat = (currentCategory === 'all') || (itemCat === currentCategory);
      const matchesSearch = !searchQuery || itemName.includes(searchQuery);

      if (matchesCat && matchesSearch) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-filter') || 'all';
      filterItems();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      filterItems();
    });
  }
}

// 7B. Non-Accredited Scope Category Tabs & Search Filter
function initNonAccTabsAndSearch() {
  const tabBtns = document.querySelectorAll('.nonacc-tab-btn');
  const searchInput = document.getElementById('nonacc-search-input');
  const items = document.querySelectorAll('.nonacc-card');

  let currentCategory = 'all';
  let searchQuery = '';

  function filterNonAccItems() {
    items.forEach(item => {
      const itemCat = item.getAttribute('data-category') || '';
      const itemName = (item.querySelector('.nonacc-title')?.textContent || '').toLowerCase();
      const itemDesc = (item.querySelector('.nonacc-desc')?.textContent || '').toLowerCase();

      const matchesCat = (currentCategory === 'all') || (itemCat === currentCategory);
      const matchesSearch = !searchQuery || itemName.includes(searchQuery) || itemDesc.includes(searchQuery);

      if (matchesCat && matchesSearch) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-filter') || 'all';
      filterNonAccItems();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      filterNonAccItems();
    });
  }
}

// 8. Quote Modal Dispatcher for Service Pages
function initQuoteTriggers() {
  const quoteModal = document.getElementById('quote-modal');
  const quoteClose = document.getElementById('quote-modal-close');
  const quoteSubtitle = document.getElementById('quote-modal-subtitle');
  const quoteServiceInput = document.getElementById('quote-service-input');

  document.querySelectorAll('[data-open-quote]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceName = btn.getAttribute('data-open-quote');
      if (quoteModal) {
        quoteModal.classList.add('active');
        document.body.classList.add('modal-open');
        if (quoteSubtitle && serviceName) {
          quoteSubtitle.innerHTML = `Requesting Quotation for: <strong style="color: var(--orange-primary);">${serviceName}</strong>. Sent directly via Owner WhatsApp (<strong style="color: #25D366;">+91 99405 64261</strong>) or Email (<strong style="color: var(--orange-primary);">enquiry@revaphoenix.com</strong>).`;
        }
        if (quoteServiceInput && serviceName) {
          quoteServiceInput.value = serviceName;
        }
      }
    });
  });

  if (quoteClose && quoteModal) {
    quoteClose.addEventListener('click', () => {
      quoteModal.classList.remove('active');
      document.body.classList.remove('modal-open');
    });

    quoteModal.addEventListener('click', (e) => {
      if (e.target === quoteModal) {
        quoteModal.classList.remove('active');
        document.body.classList.remove('modal-open');
      }
    });
  }

  // Handle Email RFQ Button
  const emailBtn = document.getElementById('quote-submit-email-btn');
  if (emailBtn) {
    emailBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const name = document.getElementById('quote-name-input')?.value.trim();
      const phone = document.getElementById('quote-phone-input')?.value.trim();
      const email = document.getElementById('quote-email-input')?.value.trim();
      const company = document.getElementById('quote-company-input')?.value.trim();
      const service = document.getElementById('quote-service-input')?.value.trim() || 'Specialized Metrology & Calibration Service';

      if (!name || !phone) {
        alert('Please provide your Name and Phone Number to submit the quote request.');
        return;
      }

      const subject = `Calibration Quotation Request: ${service} | ${company || name}`;
      const body = `CALIBRATION QUOTATION REQUEST (RFQ) - REVA PHOENIX\n` +
                   `====================================================\n\n` +
                   `Client Name     : ${name}\n` +
                   `Company / Org   : ${company || 'Not provided'}\n` +
                   `Official Email  : ${email || 'Not provided'}\n` +
                   `Mobile / Phone  : ${phone}\n` +
                   `Service / Lab   : ${service}\n\n` +
                   `====================================================\n` +
                   `Submitted via: Reva Phoenix Calibration Portal (revacalibration.com)\n` +
                   `Direct Email: enquiry@revaphoenix.com\n` +
                   `Direct Owner WhatsApp: +91 99405 64261\n`;

      window.location.href = `mailto:enquiry@revaphoenix.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      if (quoteModal) quoteModal.classList.remove('active');
      document.body.classList.remove('modal-open');
    });
  }
}
