/**
 * ABOUT US PAGE INTERACTION SCRIPT
 * Reva Phoenix Calibration Laboratories
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Sub-Nav ScrollSpy
  const sections = document.querySelectorAll('.about-section-target');
  const navPills = document.querySelectorAll('.about-nav-pill');

  function updateActivePill() {
    let currentId = '';
    const scrollPos = window.pageYOffset + 180;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navPills.forEach(pill => {
      pill.classList.remove('active');
      if (pill.getAttribute('href') === `#${currentId}`) {
        pill.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActivePill, { passive: true });
  updateActivePill();

  // 2. Smooth Scroll with offset for internal anchor clicks
  function scrollToAboutSection(targetId, smooth = true) {
    if (!targetId || targetId === '#' || targetId === '#top') {
      window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
      return;
    }
    const cleanId = targetId.startsWith('#') ? targetId : '#' + targetId;
    const targetEl = document.querySelector(cleanId);
    if (targetEl) {
      const headerOffset = 135;
      const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: Math.max(0, targetPos),
        behavior: smooth ? 'smooth' : 'auto'
      });
      if (history.pushState) {
        history.pushState(null, null, cleanId);
      }
    }
  }

  document.addEventListener('click', function(e) {
    const anchor = e.target.closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href) return;

    let targetHash = null;
    if (href.startsWith('#')) {
      targetHash = href;
    } else if (href.includes('#')) {
      const url = new URL(anchor.href, window.location.href);
      const currentPath = window.location.pathname.replace(/\/$/, '');
      const linkPath = url.pathname.replace(/\/$/, '');
      if (linkPath === currentPath || linkPath.endsWith('/about-us.html')) {
        targetHash = url.hash;
      }
    }

    if (targetHash && targetHash !== '#' && targetHash !== '#top') {
      const targetEl = document.querySelector(targetHash);
      if (targetEl) {
        e.preventDefault();
        anchor.blur();
        scrollToAboutSection(targetHash, true);
      }
    }
  });

  // Handle direct hash navigation on page load
  if (window.location.hash) {
    scrollToAboutSection(window.location.hash, false);
    setTimeout(() => scrollToAboutSection(window.location.hash, true), 150);
    setTimeout(() => scrollToAboutSection(window.location.hash, true), 400);
    window.addEventListener('load', () => {
      setTimeout(() => scrollToAboutSection(window.location.hash, true), 80);
    }, { once: true });
  }

  // 3. Industry Search & Filter
  const industrySearch = document.getElementById('industry-search');
  const categoryPills = document.querySelectorAll('.cat-pill');
  const industryTiles = document.querySelectorAll('.industry-tile');

  let activeCategory = 'all';
  let searchTerm = '';

  function filterIndustries() {
    let matchCount = 0;
    industryTiles.forEach(tile => {
      const name = tile.getAttribute('data-name')?.toLowerCase() || '';
      const category = tile.getAttribute('data-category')?.toLowerCase() || '';

      const matchesCat = activeCategory === 'all' || category === activeCategory;
      const matchesSearch = searchTerm === '' || name.includes(searchTerm) || category.includes(searchTerm);

      if (matchesCat && matchesSearch) {
        tile.style.display = 'flex';
        matchCount++;
      } else {
        tile.style.display = 'none';
      }
    });

    const noResultsEl = document.getElementById('industry-no-results');
    if (noResultsEl) {
      noResultsEl.style.display = matchCount === 0 ? 'block' : 'none';
    }
  }

  if (industrySearch) {
    industrySearch.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim().toLowerCase();
      filterIndustries();
    });
  }

  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.getAttribute('data-filter') || 'all';
      filterIndustries();
    });
  });

  // 4. Mobile Nav Drawer Toggle
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const mobileOverlay = document.getElementById('mobile-drawer-overlay');
  const mobileClose = document.getElementById('mobile-drawer-close');

  function openDrawer() {
    if (mobileDrawer && mobileOverlay) {
      mobileDrawer.classList.add('open');
      mobileOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDrawer() {
    if (mobileDrawer && mobileOverlay) {
      mobileDrawer.classList.remove('open');
      mobileOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openDrawer);
  if (mobileClose) mobileClose.addEventListener('click', closeDrawer);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeDrawer);

  document.querySelectorAll('.mobile-drawer-link, .mobile-drawer-sub-link').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
});
