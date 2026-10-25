/**
 * SERVICES PAGE JAVASCRIPT — REVA PHOENIX CALIBRATION LABORATORIES
 * Handles sticky sub-navigation, category tab switching, equipment search filtering, and quotation triggers.
 */

document.addEventListener('DOMContentLoaded', () => {
  initSubnavScrollSpy();
  initCatalogTabsAndSearch();
  initQuoteTriggers();
});

// 1. Sub-navigation Active State ScrollSpy
function initSubnavScrollSpy() {
  const sections = document.querySelectorAll('.service-section-wrap');
  const pills = document.querySelectorAll('.services-pill');

  if (!sections.length || !pills.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        pills.forEach(pill => {
          const href = pill.getAttribute('href');
          if (href === `#${id}`) {
            pill.classList.add('active');
            pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          } else {
            pill.classList.remove('active');
          }
        });
      }
    });
  }, {
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  });

  sections.forEach(sec => observer.observe(sec));
}

// 2. Equipment Catalog Category Tabs & Search Filter
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

// 3. Quote Modal Dispatcher for Service Pages
function initQuoteTriggers() {
  const quoteModal = document.getElementById('quote-modal');
  const quoteClose = document.getElementById('quote-modal-close');
  const quoteServiceSelect = document.getElementById('quote-service-select');
  const quoteSubtitle = document.getElementById('quote-modal-subtitle');

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
