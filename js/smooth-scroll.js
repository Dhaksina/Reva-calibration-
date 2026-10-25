/* ==========================================================================
   REVA PHOENIX — LUXURY INERTIAL SMOOTH SCROLLING ENGINE
   Powered by Lenis & synchronized with GSAP ScrollTrigger
   ========================================================================== */

(function () {
  'use strict';

  function initSmoothScroll() {
    if (typeof Lenis === 'undefined') {
      console.warn('[SmoothScroll] Lenis library not found. Falling back to native scrolling.');
      return;
    }

    // 1. Initialize Lenis with refined inertia & spring physics
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration curve
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.4,
      infinite: false,
      autoResize: true,
      prevent: (node) => {
        return Boolean(
          node &&
          node.closest &&
          node.closest('#lab-detail-modal, .lab-detail-modal, #quote-modal, .quote-modal, #enquiry-modal, .enquiry-modal, #lightbox-modal, .lightbox-modal, [data-lenis-prevent]')
        );
      },
    });

    window.lenis = lenis;

    // 2. Synchronize Lenis with GSAP ScrollTrigger
    lenis.on('scroll', (e) => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.update();
      }

      // Update sticky header state with sub-pixel precision
      const header = document.getElementById('site-header');
      if (header) {
        if (e.scroll > 40) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    });

    // 3. Connect to GSAP Ticker for 120Hz/60Hz synchronized frame pacing
    if (typeof gsap !== 'undefined') {
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(500, 33);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    // 4. Header offset calculation helper
    function getHeaderOffset() {
      const header = document.getElementById('site-header');
      return header ? -(header.offsetHeight + 16) : -80;
    }

    // 5. Smooth Anchor Click Interceptor
    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Handle pure hash links (#laboratories) or same-page paths (index.html#laboratories)
      let targetId = null;
      if (href.startsWith('#') && href.length > 1) {
        targetId = href.substring(1);
      } else {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const urlMatch = href.match(/^([^#]*)(#.+)$/);
        if (urlMatch) {
          const targetPath = urlMatch[1].split('/').pop() || currentPath;
          if (targetPath === currentPath) {
            targetId = urlMatch[2].substring(1);
          }
        }
      }

      if (targetId) {
        if (targetId === 'hero' || targetId === 'top') {
          e.preventDefault();
          lenis.scrollTo(0, { duration: 1.25 });
          if (history.pushState) history.pushState(null, null, '#hero');
          return;
        }

        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          e.preventDefault();
          lenis.scrollTo(targetEl, {
            offset: getHeaderOffset(),
            duration: 1.3,
          });
          if (history.pushState) {
            history.pushState(null, null, `#${targetId}`);
          }
        }
      }
    });

    // 6. Smooth Scroll on initial load with hash
    if (window.location.hash) {
      const initialTarget = window.location.hash.substring(1);
      if (initialTarget && initialTarget !== 'hero' && initialTarget !== 'top') {
        setTimeout(() => {
          const targetEl = document.getElementById(initialTarget);
          if (targetEl) {
            lenis.scrollTo(targetEl, {
              offset: getHeaderOffset(),
              immediate: false,
              duration: 1.2,
            });
          }
        }, 150);
      }
    }

    // 7. Prevent background scroll when Modals / Lightboxes are active
    const modalContainers = [
      document.getElementById('enquiry-modal'),
      document.getElementById('lab-detail-modal'),
      document.getElementById('lab-details-modal'),
      document.getElementById('lightbox-modal'),
      document.getElementById('quote-modal'),
      document.getElementById('quick-quote-modal'),
    ].filter(Boolean);

    modalContainers.forEach((container) => {
      container.setAttribute('data-lenis-prevent', 'true');
      container.setAttribute('data-lenis-prevent-wheel', 'true');
      container.setAttribute('data-lenis-prevent-touch', 'true');
      const scrollables = container.querySelectorAll('.modal-content, .lab-modal-dialog, .lab-modal-container, .lab-modal-body, .lab-modal-main');
      scrollables.forEach((scrollable) => {
        scrollable.setAttribute('data-lenis-prevent', 'true');
        scrollable.setAttribute('data-lenis-prevent-wheel', 'true');
        scrollable.setAttribute('data-lenis-prevent-touch', 'true');
      });
    });

    // Watch for modal visibility changes with targeted observers (NO subtree / style flood)
    let lastLabModalOpen = null;
    let lastOtherModalOpen = null;

    function checkModalStates() {
      const isLabModalOpen = Boolean(document.querySelector('.lab-detail-modal.active'));
      const isOtherModalOpen = Boolean(
        document.querySelector('.modal.active, .enquiry-modal.active, .lightbox-modal.active, .lightbox-overlay.active, .quote-modal.active, .lab-modal-backdrop.open') ||
        document.body.classList.contains('modal-open')
      );

      if (isLabModalOpen !== lastLabModalOpen) {
        lastLabModalOpen = isLabModalOpen;
        if (isLabModalOpen) {
          document.body.classList.add('lab-modal-open');
          document.documentElement.classList.add('lab-modal-open');
        } else {
          document.body.classList.remove('lab-modal-open');
          document.documentElement.classList.remove('lab-modal-open');
        }
      }

      if (isOtherModalOpen !== lastOtherModalOpen) {
        lastOtherModalOpen = isOtherModalOpen;
        if (isOtherModalOpen) {
          lenis.stop();
        } else if (!isLabModalOpen) {
          lenis.start();
        }
      }
    }

    const modalObserver = new MutationObserver(checkModalStates);
    modalContainers.forEach((container) => {
      modalObserver.observe(container, {
        attributes: true,
        attributeFilter: ['class'],
      });
    });

    console.log('[SmoothScroll] Lenis smooth scrolling initialized successfully with GSAP.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmoothScroll);
  } else {
    initSmoothScroll();
  }
})();
