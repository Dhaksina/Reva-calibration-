/* ==========================================================================
   REVA PHOENIX FULLSCREEN LIGHTBOX & FACILITY INSPECTOR
   Supports Desktop Keyboard (Arrows, Esc), Mobile Swipe Gestures & Custom Triggers
   ========================================================================== */

(function () {
  let activeIndex = 0;
  let galleryItems = [];

  const modal = document.getElementById('lightbox-modal');
  const imgElement = document.getElementById('lightbox-img');
  const captionElement = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  if (!modal) return;

  function initGallery() {
    const cards = document.querySelectorAll('[data-gallery-src]');
    galleryItems = Array.from(cards).map(card => ({
      src: card.getAttribute('data-gallery-src'),
      title: card.getAttribute('data-gallery-title') || 'Facility & Infrastructure',
      subtitle: card.getAttribute('data-gallery-sub') || 'Reva Phoenix Complex',
      element: card
    }));

    cards.forEach((card, index) => {
      card.addEventListener('click', (e) => {
        // Prevent lightbox if clicking a direct link inside
        if (e.target.tagName === 'A' && !e.target.classList.contains('project-action-link')) return;
        openLightbox(index);
      });
    });
  }

  function openLightbox(index) {
    if (index < 0 || index >= galleryItems.length) return;
    activeIndex = index;
    updateLightboxContent();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function updateLightboxContent() {
    if (!galleryItems[activeIndex]) return;
    const item = galleryItems[activeIndex];
    imgElement.src = item.src;
    imgElement.alt = item.title;

    captionElement.innerHTML = `
      <div style="font-family: var(--font-display, sans-serif); font-size: 1.15rem; font-weight: 700; color: #FFFFFF; margin-bottom: 4px;">
        ${item.title}
        <span style="font-family: var(--font-technical, monospace); font-size: 0.8rem; background: rgba(37, 99, 235, 0.25); color: #60A5FA; padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(96, 165, 250, 0.3); margin-left: 10px; vertical-align: middle;">
          ${activeIndex + 1} / ${galleryItems.length}
        </span>
      </div>
      <div style="font-family: var(--font-technical, monospace); font-size: 0.85rem; color: #94A3B8; letter-spacing: 0.04em;">
        ${item.subtitle}
      </div>
    `;
  }

  function nextImage() {
    if (galleryItems.length === 0) return;
    activeIndex = (activeIndex + 1) % galleryItems.length;
    updateLightboxContent();
  }

  function prevImage() {
    if (galleryItems.length === 0) return;
    activeIndex = (activeIndex - 1 + galleryItems.length) % galleryItems.length;
    updateLightboxContent();
  }

  // Click Event Listeners
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', prevImage);
  if (nextBtn) nextBtn.addEventListener('click', nextImage);

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  });

  // Mobile Touch Swipe Handling
  let touchStartX = 0;
  let touchEndX = 0;

  modal.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  modal.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > swipeThreshold) {
      if (diff < 0) {
        nextImage(); // Swipe left -> Next
      } else {
        prevImage(); // Swipe right -> Previous
      }
    }
  }

  // Global trigger helpers
  window.openFacilityLightbox = function (index) {
    openLightbox(index);
  };

  window.openFacilityLightboxBySrc = function (src) {
    const idx = galleryItems.findIndex(item => item.src === src);
    if (idx !== -1) {
      openLightbox(idx);
    } else {
      openLightbox(0);
    }
  };

  // Re-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGallery);
  } else {
    initGallery();
  }
})();
