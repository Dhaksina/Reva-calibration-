/* ==========================================================================
   REVA PHOENIX — GSAP KINETIC TYPOGRAPHY & SCROLLTRIGGER ENGINE
   Cinematic Word Splits, Staggered Line Reveals, and Parallax Scrubbing
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Check if GSAP is available
  if (typeof gsap === 'undefined') {
    console.warn('GSAP library not detected.');
    return;
  }

  // Register ScrollTrigger if available
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  /**
   * Helper: Splits text nodes inside an element into word wraps
   * Preserves inner spans, classes and styling.
   */
  function splitElementIntoWords(el) {
    if (!el || el.getAttribute('data-gsap-split') === 'true') return [];
    el.setAttribute('data-gsap-split', 'true');

    const words = [];
    const childNodes = Array.from(el.childNodes);

    el.innerHTML = '';

    childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        const tokens = text.split(/(\s+)/);

        tokens.forEach(token => {
          if (!token) return;
          if (/^\s+$/.test(token)) {
            el.appendChild(document.createTextNode(token));
          } else {
            const wrap = document.createElement('span');
            wrap.className = 'gsap-word-wrap';
            const inner = document.createElement('span');
            inner.className = 'gsap-word';
            inner.textContent = token;
            wrap.appendChild(inner);
            el.appendChild(wrap);
            words.push(inner);
          }
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // If it's a break tag, keep it
        if (node.tagName.toLowerCase() === 'br') {
          el.appendChild(node);
          return;
        }

        // If it's a dedicated line container (e.g. .hero-line, .heading-line), preserve line block
        if (node.classList && (node.classList.contains('hero-line') || node.classList.contains('heading-line'))) {
          const lineEl = document.createElement('span');
          lineEl.className = node.className;
          if (node.id) lineEl.id = node.id;
          el.appendChild(lineEl);

          Array.from(node.childNodes).forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
              const tokens = child.textContent.split(/(\s+)/);
              tokens.forEach(token => {
                if (!token) return;
                if (/^\s+$/.test(token)) {
                  lineEl.appendChild(document.createTextNode(token));
                } else {
                  const wrap = document.createElement('span');
                  wrap.className = 'gsap-word-wrap';
                  const inner = document.createElement('span');
                  inner.className = 'gsap-word';
                  inner.textContent = token;
                  wrap.appendChild(inner);
                  lineEl.appendChild(wrap);
                  words.push(inner);
                }
              });
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              const childClass = child.className;
              const tokens = child.textContent.split(/(\s+)/);
              tokens.forEach(token => {
                if (!token) return;
                if (/^\s+$/.test(token)) {
                  lineEl.appendChild(document.createTextNode(token));
                } else {
                  const wrap = document.createElement('span');
                  wrap.className = 'gsap-word-wrap';
                  const inner = document.createElement('span');
                  inner.className = `gsap-word ${childClass}`;
                  inner.textContent = token;
                  wrap.appendChild(inner);
                  lineEl.appendChild(wrap);
                  words.push(inner);
                }
              });
            }
          });
          return;
        }

        // Element with special class (e.g., .highlight-word, .outline-word, .text-orange)
        const containerEl = document.createElement(node.tagName.toLowerCase());
        containerEl.className = node.className;
        el.appendChild(containerEl);

        const subNodes = Array.from(node.childNodes);
        if (subNodes.length > 0) {
          subNodes.forEach(subNode => {
            if (subNode.nodeType === Node.TEXT_NODE) {
              const tokens = subNode.textContent.split(/(\s+)/);
              tokens.forEach(token => {
                if (!token) return;
                if (/^\s+$/.test(token)) {
                  containerEl.appendChild(document.createTextNode(' '));
                } else {
                  const wrap = document.createElement('span');
                  wrap.className = 'gsap-word-wrap';
                  const inner = document.createElement('span');
                  inner.className = 'gsap-word';
                  inner.textContent = token;
                  wrap.appendChild(inner);
                  containerEl.appendChild(wrap);
                  words.push(inner);
                }
              });
            } else if (subNode.nodeType === Node.ELEMENT_NODE) {
              if (subNode.tagName.toLowerCase() === 'br') {
                containerEl.appendChild(subNode.cloneNode());
              } else {
                const wrap = document.createElement('span');
                wrap.className = 'gsap-word-wrap';
                const inner = document.createElement('span');
                inner.className = `gsap-word ${subNode.className}`;
                inner.textContent = subNode.textContent;
                wrap.appendChild(inner);
                containerEl.appendChild(wrap);
                words.push(inner);
              }
            }
          });
        } else {
          const innerText = node.textContent;
          const tokens = innerText.split(/(\s+)/);
          tokens.forEach(token => {
            if (!token) return;
            if (/^\s+$/.test(token)) {
              containerEl.appendChild(document.createTextNode(' '));
            } else {
              const wrap = document.createElement('span');
              wrap.className = 'gsap-word-wrap';
              const inner = document.createElement('span');
              inner.className = 'gsap-word';
              inner.textContent = token;
              wrap.appendChild(inner);
              containerEl.appendChild(wrap);
              words.push(inner);
            }
          });
        }
      }
    });

    return words;
  }

  // 1. HERO HEADLINE CINEMATIC TIMELINE REVEAL
  const heroHeadline = document.querySelector('.hero-headline');
  if (heroHeadline) {
    const heroWords = splitElementIntoWords(heroHeadline);

    const tl = gsap.timeline({ delay: 0.2 });

    // Animate words rising from clipping mask
    tl.to(heroWords, {
      y: '0%',
      rotation: 0,
      opacity: 1,
      duration: 1.15,
      stagger: 0.08,
      ease: 'power4.out'
    });

    // Subhead fade and rise
    tl.fromTo(
      '.hero-subhead',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.0, ease: 'power3.out' },
      '-=0.7'
    );

    // CTAs fade in
    tl.fromTo(
      '.hero-cta-group .btn',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out' },
      '-=0.6'
    );

    // Telemetry items stagger
    tl.fromTo(
      '.hero-telemetry-strip .telemetry-item',
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out' },
      '-=0.5'
    );
  }

  // 2. SCROLLTRIGGER SECTION TITLES STAGGERED WORD REVEALS
  const sectionTitles = document.querySelectorAll('.section-title');
  sectionTitles.forEach(title => {
    // Avoid double splitting hero
    if (title.classList.contains('hero-headline')) return;

    const words = splitElementIntoWords(title);
    if (!words.length) return;

    gsap.to(words, {
      y: '0%',
      rotation: 0,
      opacity: 1,
      duration: 1.05,
      stagger: 0.06,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: title,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  });

  // 3. SECTION SUBTITLES SLIDE-IN
  const sectionSubtitles = document.querySelectorAll('.section-subtitle');
  sectionSubtitles.forEach(sub => {
    gsap.fromTo(
      sub,
      { x: -30, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sub,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // 4. PARALLAX SCRUB FOR GIANT BACKGROUND TYPOGRAPHY
  if (typeof ScrollTrigger !== 'undefined') {
    // Giant '35' Watermark Parallax
    const watermark35 = document.querySelector('.labs-giant-watermark');
    if (watermark35) {
      gsap.to(watermark35, {
        y: 120,
        ease: 'none',
        scrollTrigger: {
          trigger: '#laboratories',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2
        }
      });
    }

    // Giant 'REVA PHOENIX' Footer Watermark Parallax
    const footerWatermark = document.querySelector('.footer-watermark');
    if (footerWatermark) {
      gsap.fromTo(
        footerWatermark,
        { y: -60, opacity: 0.01 },
        {
          y: 30,
          opacity: 0.035,
          ease: 'none',
          scrollTrigger: {
            trigger: '.site-footer',
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: 1
          }
        }
      );
    }

    // Metric Background Numbers Parallax
    document.querySelectorAll('.metric-bg-number').forEach(bgNum => {
      gsap.to(bgNum, {
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: bgNum.closest('.metric-card'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5
        }
      });
    });
  }

  // 5. SERVICE ROW CARDS GSAP STAGGER
  const serviceCards = document.querySelectorAll('.service-row-card');
  if (serviceCards.length) {
    gsap.fromTo(
      serviceCards,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.85,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.services-container',
          start: 'top 82%'
        }
      }
    );
  }

  // 6. API CARDS GSAP STAGGER
  const apiCards = document.querySelectorAll('.api-card');
  if (apiCards.length) {
    gsap.fromTo(
      apiCards,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.api-grid',
          start: 'top 82%'
        }
      }
    );
  }

  // 7. INDUSTRIES CARDS GSAP STAGGER
  const industryCards = document.querySelectorAll('.industry-card');
  if (industryCards.length) {
    gsap.fromTo(
      industryCards,
      { y: 45, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.85,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.industries-grid',
          start: 'top 82%'
        }
      }
    );
  }
});
