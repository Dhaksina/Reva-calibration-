/* ==========================================================================
   REVA PHOENIX GALLERY PAGE INTERACTIVE CONTROLLER
   Navigation, Album Filtering, Scrollspy & Mobile Drawer
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Mobile Drawer Navigation
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const mobileOverlay = document.getElementById('mobile-drawer-overlay');
  const mobileClose = document.getElementById('mobile-drawer-close');

  function openDrawer() {
    if (mobileDrawer) mobileDrawer.classList.add('active');
    if (mobileOverlay) mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (mobileDrawer) mobileDrawer.classList.remove('active');
    if (mobileOverlay) mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openDrawer);
  if (mobileClose) mobileClose.addEventListener('click', closeDrawer);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeDrawer);

  document.querySelectorAll('.mobile-drawer-link').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // 2. Sticky Header Elevation
  const siteHeader = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  }, { passive: true });

  // 3. Album Filtering & Scroll Navigation
  const tabButtons = document.querySelectorAll('.gal-tab-btn');
  const sections = document.querySelectorAll('.gal-section');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      // Update active state
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (filter === 'all') {
        // Show all sections
        sections.forEach(sec => {
          sec.style.display = 'block';
        });
        window.scrollTo({
          top: document.getElementById('gallery-main').offsetTop - 120,
          behavior: 'smooth'
        });
      } else {
        // Smoothly scroll to the target section
        const targetSection = document.getElementById(filter);
        if (targetSection) {
          sections.forEach(sec => {
            sec.style.display = 'block'; // Keep all rendered so lightbox indices stay intact
          });
          const targetY = targetSection.getBoundingClientRect().top + window.pageYOffset - 130;
          window.scrollTo({
            top: targetY,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // 4. Scrollspy for Filter Tabs
  const observerOptions = {
    root: null,
    rootMargin: '-130px 0px -60% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        tabButtons.forEach(btn => {
          if (btn.getAttribute('data-filter') === id) {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => sectionObserver.observe(sec));

  // 5. Quote Modal triggers from buttons with [data-open-quote]
  document.querySelectorAll('[data-open-quote]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const quoteModal = document.getElementById('quote-modal');
      if (quoteModal) {
        quoteModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  const quoteClose = document.getElementById('quote-modal-close');
  const quoteCancel = document.getElementById('quote-cancel-btn');
  const quoteModal = document.getElementById('quote-modal');

  function closeQuoteModal() {
    if (quoteModal) quoteModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (quoteClose) quoteClose.addEventListener('click', closeQuoteModal);
  if (quoteCancel) quoteCancel.addEventListener('click', closeQuoteModal);
  if (quoteModal) {
    quoteModal.addEventListener('click', (e) => {
      if (e.target === quoteModal) closeQuoteModal();
    });
  }

  const quoteForm = document.getElementById('quote-modal-form');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const toast = document.getElementById('toast-notice');
      const toastMsg = document.getElementById('toast-message');
      if (toast && toastMsg) {
        toastMsg.textContent = 'Quotation request submitted! Our engineering desk will respond promptly.';
        toast.classList.add('active');
        setTimeout(() => toast.classList.remove('active'), 4500);
      }
      quoteForm.reset();
      closeQuoteModal();
    });
  }
});
