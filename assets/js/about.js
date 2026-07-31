/* ═══════════════════════════════════════════════════════════════
   Arble — About page interactions (Refined)
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Reveal on scroll ── */
  const revealEls = document.querySelectorAll('.rv');
  if (revealEls.length) {
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -36px 0px' }
    );
    revealEls.forEach((el) => revealObs.observe(el));
  }

  /* ── Stat counter animation ── */
  const statEls = document.querySelectorAll('.ab-stat__n[data-count]');
  if (statEls.length) {
    const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const countUp = (el, target, duration = 1200) => {
      if (prefersReduced) {
        el.textContent = target.toLocaleString();
        return;
      }
      const start = performance.now();
      const update = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.round(ease(progress) * target);
        el.textContent = current.toLocaleString();
        if (progress < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
    };

    const statObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = parseInt(entry.target.dataset.count, 10);
            countUp(entry.target, target);
            statObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    statEls.forEach((el) => statObs.observe(el));
  }

  /* ── FAQ accordion ── */
  const faqContainer = document.getElementById('aboutFaq');
  if (faqContainer) {
    const items = faqContainer.querySelectorAll('.ab-faq__item');
    items.forEach((item) => {
      const btn = item.querySelector('.ab-faq__q');
      if (!btn) return;

      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        items.forEach((i) => {
          i.classList.remove('is-open');
          const b = i.querySelector('.ab-faq__q');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });

      btn.addEventListener('keydown', (e) => {
        const all = [...items].map((i) => i.querySelector('.ab-faq__q')).filter(Boolean);
        const idx = all.indexOf(btn);
        if (e.key === 'ArrowDown' && idx < all.length - 1) {
          e.preventDefault();
          all[idx + 1].focus();
        } else if (e.key === 'ArrowUp' && idx > 0) {
          e.preventDefault();
          all[idx - 1].focus();
        }
      });
    });
  }

  /* ── Nav stuck state ── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('is-stuck', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
