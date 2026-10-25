/**
 * SERVICES PAGE JAVASCRIPT — REVA PHOENIX CALIBRATION LABORATORIES
 * Handles sticky sub-navigation, smooth anchor scrolling with header offset,
 * direct hash navigation, category tab switching, equipment search filtering, and quotation triggers.
 */

document.addEventListener('DOMContentLoaded', () => {
  initSmoothAnchorScrolling();
  initSubnavScrollSpy();
  initCatalogTabsAndSearch();
  initQuoteTriggers();
  handleInitialHashScroll();
});

// 1. Precise Section Scrolling with Double-Header Offset (Site Header 72px + Sticky Subnav 56px + Breathing Room = 140px)
function scrollToSection(targetId, smooth = true) {
  if (!targetId || targetId === '#' || targetId === '#top') {
    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
    return;
  }

  const cleanId = targetId.startsWith('#') ? targetId : '#' + targetId;
  const targetElement = document.querySelector(cleanId);
  if (!targetElement) return;

  const headerOffset = 140;
  const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
  const targetPosition = Math.max(0, elementPosition - headerOffset);

  window.scrollTo({
    top: targetPosition,
    behavior: smooth ? 'smooth' : 'auto'
  });

  // Update URL hash without causing a default browser jump
  if (window.history && window.history.pushState) {
    window.history.pushState(null, null, cleanId);
  }

  // Update active pill in subnav
  updateActivePill(cleanId);
}

function updateActivePill(targetId) {
  const pills = document.querySelectorAll('.services-pill');
  pills.forEach(pill => {
    const href = pill.getAttribute('href');
    if (href === targetId || href.endsWith(targetId)) {
      pill.classList.add('active');
      pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } else {
      pill.classList.remove('active');
    }
  });
}

// 2. Intercept All Anchor Clicks for Services Sections
function initSmoothAnchorScrolling() {
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    let targetHash = null;

    // Direct hash on current page: "#cnc-calibration"
    if (href.startsWith('#')) {
      targetHash = href;
    }
    // Full or relative path to services.html with hash: "services.html#cnc-calibration"
    else if (href.includes('#')) {
      const url = new URL(anchor.href, window.location.href);
      const currentPath = window.location.pathname.replace(/\/$/, '');
      const linkPath = url.pathname.replace(/\/$/, '');
      
      // If link points to current page (or services.html)
      if (linkPath === currentPath || linkPath.endsWith('/services.html')) {
        targetHash = url.hash;
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

// 3. Handle Direct Hash on Page Load (with multiple checkpoints for image/font rendering)
function handleInitialHashScroll() {
  if (!window.location.hash) return;
  const hash = window.location.hash;

  // Immediate attempt
  scrollToSection(hash, false);

  // Microtask checkpoint
  setTimeout(() => scrollToSection(hash, true), 120);

  // Layout checkpoint (after fonts and catalog items paint)
  setTimeout(() => scrollToSection(hash, true), 350);

  // Complete page assets loaded checkpoint
  window.addEventListener('load', () => {
    setTimeout(() => scrollToSection(hash, true), 100);
  }, { once: true });
}

// 4. Sub-navigation Active State ScrollSpy
function initSubnavScrollSpy() {
  const sections = document.querySelectorAll('.service-section-wrap');
  const pills = document.querySelectorAll('.services-pill');

  if (!sections.length || !pills.length) return;

  const observer = new IntersectionObserver((entries) => {
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

// 5. Equipment Catalog Category Tabs & Search Filter
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

// 6. Quote Modal Dispatcher for Service Pages
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
          quoteSubtitle.innerHTML = `Requesting Quotation for: <strong style="color: var(--orange-primary);">${serviceName}</strong>. Sent directly to Owner WhatsApp (+91 99405 64261).`;
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
}
