/**
 * Reva Phoenix Calibration Laboratories
 * Client References & Partners Filtering & Search Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('client-search-input');
  const filterBtns = document.querySelectorAll('.client-filter-btn');
  const clientCards = document.querySelectorAll('.client-org-card');
  const countDisplay = document.getElementById('clients-visible-count');
  const noResults = document.getElementById('clients-no-results');

  let activeFilter = 'all';
  let searchQuery = '';

  function applyFilters() {
    let visibleCount = 0;
    const q = searchQuery.toLowerCase().trim();

    clientCards.forEach(card => {
      const category = card.getAttribute('data-category') || '';
      const name = (card.getAttribute('data-name') || '').toLowerCase();
      const sector = (card.getAttribute('data-sector') || '').toLowerCase();
      const scope = (card.getAttribute('data-scope') || '').toLowerCase();
      const region = (card.getAttribute('data-region') || '').toLowerCase();

      // Check category match
      const categoryMatch = (activeFilter === 'all') || (category === activeFilter);

      // Check search match
      const searchMatch = !q || 
        name.includes(q) || 
        sector.includes(q) || 
        scope.includes(q) || 
        region.includes(q);

      if (categoryMatch && searchMatch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Update count display
    if (countDisplay) {
      countDisplay.textContent = `Showing ${visibleCount} of ${clientCards.length} Organizations`;
    }

    // Toggle no results state
    if (noResults) {
      if (visibleCount === 0) {
        noResults.classList.add('visible');
      } else {
        noResults.classList.remove('visible');
      }
    }
  }

  // Filter button event listeners
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter') || 'all';
      applyFilters();
    });
  });

  // Search input event listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      applyFilters();
    });
  }

  // Initial calculation
  applyFilters();
});
