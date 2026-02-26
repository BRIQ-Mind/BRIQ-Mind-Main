/**
 * ABOUT PAGE - Script
 * @version 1.0.0
 * @description Subnav aktiflik, sayaçlar ve sticky ikon kontrolü
 */

(() => {
  'use strict';

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  const debounce = (func, wait = 10) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const rafThrottle = (callback) => {
    let requestId = null;
    let lastArgs;
    
    const later = (context) => () => {
      requestId = null;
      callback.apply(context, lastArgs);
    };
    
    const throttled = function(...args) {
      lastArgs = args;
      if (requestId === null) {
        requestId = requestAnimationFrame(later(this));
      }
    };
    
    throttled.cancel = () => {
      cancelAnimationFrame(requestId);
      requestId = null;
    };
    
    return throttled;
  };

  // ============================================
  // 1) SUBNAV AKTİFLİK YÖNETİMİ
  // ============================================
  const initSubnavigation = () => {
    const sections = [
      '#overview', 
      '#vizyon-misyon', 
      '#yaklasim', 
      '#ilkelerimiz'
    ].map(sel => document.querySelector(sel)).filter(Boolean);

    const links = Array.from(document.querySelectorAll('.aboutpage-subnav__link'));

    if (!sections.length || !links.length) {
      console.warn('[About] Subnav: Section veya link bulunamadı');
      return;
    }

    const getLayoutMetrics = () => {
      const header = document.querySelector('.header');
      const subnav = document.querySelector('.subnav-wrapper');
      return {
        headerHeight: header?.offsetHeight || 80,
        subnavHeight: subnav?.offsetHeight || 60,
        buffer: 50
      };
    };

    let metrics = getLayoutMetrics();

    const handleResize = debounce(() => {
      metrics = getLayoutMetrics();
      updateActiveLink();
    }, 150);
    
    window.addEventListener('resize', handleResize);

    const updateActiveLink = () => {
      const scrollPos = window.scrollY + metrics.headerHeight + metrics.subnavHeight + metrics.buffer;
      
      let activeSection = null;
      let maxVisibility = 0;
      
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionBottom = sectionTop + sectionHeight;

        if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
          const visibility = Math.min(sectionBottom, scrollPos + window.innerHeight) - 
                           Math.max(sectionTop, scrollPos);
          
          if (visibility > maxVisibility) {
            maxVisibility = visibility;
            activeSection = section;
          }
        }
      });

      if (activeSection) {
        const activeId = '#' + activeSection.id;
        links.forEach(link => {
          const isActive = link.getAttribute('href') === activeId;
          link.classList.toggle('is-active', isActive);

          if (isActive) {
            link.setAttribute('aria-current', 'location');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      }
    };

    const handleScroll = rafThrottle(updateActiveLink);
    window.addEventListener('scroll', handleScroll, { passive: true });

    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (!targetSection) return;
        
        e.preventDefault();

        const yOffset = -(metrics.headerHeight + metrics.subnavHeight + 10);
        const targetY = targetSection.getBoundingClientRect().top + window.pageYOffset + yOffset;

        window.scrollTo({
          top: targetY,
          behavior: 'smooth'
        });

        links.forEach(l => {
          l.classList.toggle('is-active', l === link);
          if (l === link) {
            l.setAttribute('aria-current', 'location');
          } else {
            l.removeAttribute('aria-current');
          }
        });
      });
    });

    updateActiveLink();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      handleScroll.cancel();
    };
  };

  // ============================================
  // 2) SAYAÇ ANİMASYONLARI
  // ============================================
  const initCounters = () => {
    const counters = document.querySelectorAll('.aboutpage-stat__value[data-target]');
    
    if (!counters.length) {
      console.info('[About] Sayaç elementi bulunamadı');
      return;
    }

    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
    const duration = 1200;

    const animateCounter = (element) => {
      const target = parseInt(element.dataset.target, 10);
      
      if (isNaN(target)) {
        console.warn('[About] Geçersiz data-target değeri:', element.dataset.target);
        return;
      }

      let startTime = null;
      
      const step = (currentTime) => {
        if (!startTime) startTime = currentTime;
        
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const easedProgress = easeOutCubic(progress);
        const currentValue = Math.floor(easedProgress * target);
        
        element.textContent = currentValue.toLocaleString('tr-TR');
        
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          element.textContent = target.toLocaleString('tr-TR');
        }
      };
      
      requestAnimationFrame(step);
    };

    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
    
    return () => observer.disconnect();
  };

  // ============================================
  // 3) STICKY İKON YÖNETİMİ (HİKAYE BÖLÜMÜ)
  // ============================================
  const initStickyIcons = () => {
    const stickyContainer = document.querySelector('.stick-nav-img');
    const storyStages = document.querySelectorAll('.story-stage');
    const stickyImages = document.querySelectorAll('.sticky-image');

    if (!stickyContainer || !storyStages.length || !stickyImages.length) {
      console.info('[About] Sticky ikon elementi bulunamadı');
      return;
    }

    const updateStickyIcon = () => {
      const stickyRect = stickyContainer.getBoundingClientRect();
      const stickyCenter = stickyRect.top + (stickyRect.height / 2);

      let closestStage = null;
      let minDistance = Infinity;

      storyStages.forEach(stage => {
        const stageRect = stage.getBoundingClientRect();
        const stageCenter = stageRect.top + (stageRect.height / 2);
        const distance = Math.abs(stickyCenter - stageCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestStage = stage;
        }
      });

      if (closestStage) {
        const activeStageId = closestStage.id;
        
        stickyImages.forEach(img => {
          const shouldBeActive = img.dataset.imageFor === activeStageId;
          img.classList.toggle('is-active', shouldBeActive);
          
          img.setAttribute('aria-hidden', !shouldBeActive);
        });
      }
    };

    const handleScroll = rafThrottle(updateStickyIcon);
    window.addEventListener('scroll', handleScroll, { passive: true });

    updateStickyIcon();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      handleScroll.cancel();
    };
  };

  // ============================================
  // BAŞLATMA
  // ============================================
  const init = () => {
    try {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
        return;
      }

      console.info('[About] Sayfa scriptleri başlatılıyor...');

      const cleanupFunctions = [
        initSubnavigation(),
        initCounters(),
        initStickyIcons()
      ].filter(Boolean);

      console.info('[About] Tüm modüller başarıyla yüklendi');

      window.__aboutPageCleanup = () => {
        cleanupFunctions.forEach(fn => fn());
        console.info('[About] Cleanup tamamlandı');
      };

    } catch (error) {
      console.error('[About] Başlatma hatası:', error);
    }
  };

  init();

})();