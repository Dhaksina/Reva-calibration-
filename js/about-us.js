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
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 130;
        const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
        history.replaceState(null, null, targetId);
      }
    });
  });

  // Handle direct hash navigation on page load
  if (window.location.hash) {
    setTimeout(() => {
      const targetEl = document.querySelector(window.location.hash);
      if (targetEl) {
        const headerOffset = 130;
        const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    }, 200);
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
