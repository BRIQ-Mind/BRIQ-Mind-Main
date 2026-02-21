/**
 * GENERAL USE v1 - Script
 * @version 1.0.0
 * @description General control v1
 */

'use strict';

// ======================== VIDEO & OBSERVER YONETIMI ========================
const resourceManager = {
    videos: new Set(),
    observers: new Set(),
    
    registerVideo(video) {
        this.videos.add(video);
    },
    
    registerObserver(observer) {
        this.observers.add(observer);
    },
    
    cleanup() {
        this.videos.forEach(video => {
            video.pause();
            video.removeAttribute('src');
            video.load();
        });
        this.observers.forEach(observer => observer.disconnect());
        this.videos.clear();
        this.observers.clear();
    }
};

// Global state for video controls
const heroSliderState = {
    currentIndex: 0,
    playActiveVideo: null
};

document.addEventListener('DOMContentLoaded', () => {

    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navOverlay = document.querySelector('.nav__overlay');
    const body = document.body;

    // ======================== NAVBAR MENU RESPONSIVE ========================
    const toggleNav = (forceClose = false) => {
    const isActive = body.classList.contains('nav-active');
    const html = document.documentElement;

    if (forceClose || isActive) {
        body.classList.remove('nav-active');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Menüyü aç');
        
        html.style.overflow = '';
        body.style.overflow = '';

    } else {
        body.classList.add('nav-active');
        navToggle.setAttribute('aria-expanded', 'true');
        navToggle.setAttribute('aria-label', 'Menüyü kapat');

        html.style.overflow = 'hidden';
        body.style.overflow = 'hidden';
    }
    };

    if (navToggle) {
        navToggle.addEventListener('click', () => toggleNav());
    }

    if (navOverlay) {
        navOverlay.addEventListener('click', () => toggleNav(true));
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && body.classList.contains('nav-active')) {
            toggleNav(true);
        }
    });

    // ======================== SMOOTH SCROLL ========================
    const scrollToSection = (targetId) => {
        const target = document.querySelector(targetId);
        if (!target) return;

        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 0;
        
        const images = target.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            if (!img.style.minHeight && img.getAttribute('height')) {
                img.style.minHeight = img.getAttribute('height') + 'px';
            }
        });
        
        const doScroll = () => {
            const targetPosition = target.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = targetPosition - headerHeight;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        };
        
        doScroll();
        
        setTimeout(() => {
            doScroll();
        }, 500);
    };

    window.addEventListener('hashchange', () => {
        const hash = window.location.hash;
        if (hash) {
            scrollToSection(hash);
        }
    });

    const handleHashOnLoad = () => {
        const hash = window.location.hash;
        
        if (hash) {
            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
            }
            
            window.scrollTo(0, 0);
            
            const scrollWhenReady = () => {
                const images = document.querySelectorAll('img');
                const allLoaded = Array.from(images).every(img => img.complete);
                
                if (allLoaded || document.readyState === 'complete') {
                    setTimeout(() => scrollToSection(hash), 300);
                } else {
                    window.addEventListener('load', () => {
                        setTimeout(() => scrollToSection(hash), 300);
                    });
                }
            };
            
            scrollWhenReady();
        }
    };

    handleHashOnLoad();

    if (navMenu) {
        navMenu.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            const parentItem = link.closest('.nav__item');
            const isDropdown = parentItem && parentItem.classList.contains('dropdown');

            if (href && href.startsWith('#')) {
                e.preventDefault();
                
                if (window.innerWidth <= 768) {
                    if (isDropdown && link.classList.contains('nav__link')) {
                        parentItem.classList.toggle('is-open');
                        return;
                    }
                    toggleNav(true);
                }
                
                if (history.pushState) {
                    history.pushState(null, null, href);
                } else {
                    window.location.hash = href;
                }
                
                scrollToSection(href);
                
                return;
            }

            if (window.innerWidth <= 768) {
                if (isDropdown && link.classList.contains('nav__link')) {
                    e.preventDefault();
                    parentItem.classList.toggle('is-open');
                } else {
                    toggleNav(true);
                }
            }
        });
    }

    let resizeTimeout;
    let prevResizeWidth = window.innerWidth;
    window.addEventListener('resize', () => {
        const currWidth = window.innerWidth;

        // Mobile → Desktop geçişinde dropdown transition flash'ını önle
        if (prevResizeWidth <= 768 && currWidth > 768) {
            document.querySelectorAll('.dropdown-menu').forEach(el => {
                el.style.transition = 'none';
            });
            document.querySelectorAll('.dropdown.is-open').forEach(el => {
                el.classList.remove('is-open');
            });
            requestAnimationFrame(() => requestAnimationFrame(() => {
                document.querySelectorAll('.dropdown-menu').forEach(el => {
                    el.style.transition = '';
                });
            }));
        }

        prevResizeWidth = currWidth;

        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (currWidth > 768 && body.classList.contains('nav-active')) {
                toggleNav(true);
            }
        }, 150);
    });
    
// ======================== VIDEO SLIDER ========================
    const sliderContainer = document.querySelector('.hero__slider-container');
    if (sliderContainer) {
        const slides = document.querySelectorAll('.hero__slide');
        const videos = document.querySelectorAll('.hero__video');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        const totalSlides = slides.length;

        const currentPath = window.location.pathname;
        const isEnglish = currentPath.startsWith('/en/') || currentPath.includes('_en/');
        const videoSuffix = isEnglish ? '_en' : '';

        videos.forEach((video, index) => {
            const videoNumber = index + 1;
            const source = video.querySelector('source');
            if (source) {
                source.src = `/assets/videos/video_${videoNumber}${videoSuffix}.mp4`;
            }
            video.poster = `/assets/images/video_${videoNumber}_poster${videoSuffix}.webp`;
            video.load();
        });

        sliderContainer.style.width = `${totalSlides * 100}%`;

        slides.forEach(slide => {
            slide.style.width = `${100 / totalSlides}%`;
        });

        videos.forEach(v => resourceManager.registerVideo(v));

        const playActiveVideo = (index) => {
            videos.forEach((video, i) => {
                if (i === index) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                    video.currentTime = 0;
                }
            });
        };

        heroSliderState.playActiveVideo = playActiveVideo;

        const goToSlide = (index) => {
            heroSliderState.currentIndex = index;
            requestAnimationFrame(() => {
                sliderContainer.style.transform = `translateX(-${index * 100 / totalSlides}%)`;
                playActiveVideo(index);
            });
        };

        const showNextSlide = () => {
            heroSliderState.currentIndex = (heroSliderState.currentIndex + 1) % totalSlides;
            goToSlide(heroSliderState.currentIndex);
        };

        const showPrevSlide = () => {
            heroSliderState.currentIndex = (heroSliderState.currentIndex - 1 + totalSlides) % totalSlides;
            goToSlide(heroSliderState.currentIndex);
        };

        nextBtn.addEventListener('click', showNextSlide);
        prevBtn.addEventListener('click', showPrevSlide);
        
        goToSlide(0);

        const ctaButtons = document.querySelectorAll('.hero__cta');
        let ctaTimeout = null;

        const showCta = (videoIndex) => {
            ctaButtons.forEach(btn => {
                btn.classList.remove('is-visible');
            });

            if (ctaTimeout) {
                clearTimeout(ctaTimeout);
            }

            ctaTimeout = setTimeout(() => {
                ctaButtons.forEach(btn => {
                    const btnVideo = parseInt(btn.getAttribute('data-video'));
                    if (btnVideo === videoIndex) {
                        btn.classList.add('is-visible');
                    }
                });
            }, 1500);
        };

        nextBtn.addEventListener('click', () => showCta(heroSliderState.currentIndex));
        prevBtn.addEventListener('click', () => showCta(heroSliderState.currentIndex));

        showCta(0);

    }

    // ======================== SCROLL ANIMASYONLARI ========================
    const fadeElements = document.querySelectorAll('.fade-in');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    };

    const fadeInObserver = new IntersectionObserver(observerCallback, observerOptions);
    resourceManager.registerObserver(fadeInObserver);

    fadeElements.forEach(el => fadeInObserver.observe(el));

    // ======================== MARQUEE LISTESI ========================
    const marqueeInners = document.querySelectorAll('.marquee__inner');

    if (marqueeInners.length > 0) {
        marqueeInners.forEach(marqueeInner => {
            if (marqueeInner.dataset.cloned === 'true') return;

            const originalWidth = marqueeInner.scrollWidth;
            marqueeInner.style.setProperty('--marquee-width', `${originalWidth}px`);

            const content = Array.from(marqueeInner.children);
            content.forEach(item => {
                const clone = item.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                clone.setAttribute('tabindex', '-1');
                marqueeInner.appendChild(clone);
            });

            marqueeInner.dataset.cloned = 'true';
        });
    }

    // ======================== ARATIRMA SLIDER ========================
    const researchSliderWrapper = document.querySelector('.research__slider-wrapper');

    if (researchSliderWrapper) {
        const researchCards = document.querySelectorAll('.research__card');
        const researchPrevBtn = document.getElementById('researchPrevBtn');
        const researchNextBtn = document.getElementById('researchNextBtn');

        let researchCurrentIndex = 0;
        const researchTotalSlides = researchCards.length;

        const goToResearchSlide = (index) => {
            requestAnimationFrame(() => {
                researchCards.forEach((card, i) => {
                    if (i === index) {
                        card.classList.add('is-active');
                        card.style.zIndex = '2';
                    } else {
                        card.classList.remove('is-active');
                        card.style.zIndex = '1';
                    }
                });
            });
        };

        const showNextResearchSlide = () => {
            researchCurrentIndex = (researchCurrentIndex + 1) % researchTotalSlides;
            goToResearchSlide(researchCurrentIndex);
        };

        const showPrevResearchSlide = () => {
            researchCurrentIndex = (researchCurrentIndex - 1 + researchTotalSlides) % researchTotalSlides;
            goToResearchSlide(researchCurrentIndex);
        };

        researchNextBtn.addEventListener('click', showNextResearchSlide);
        researchPrevBtn.addEventListener('click', showPrevResearchSlide);

        if(researchCards.length > 0) {
            setTimeout(() => researchCards[0].classList.add('is-active'), 100);
        }
    }

    // ======================== TIMELINE KISMI ========================
    const timelineContainer = document.querySelector('.timeline__container');

    if (timelineContainer) {
        const timelineItems = document.querySelectorAll('.timeline__item[data-index]');
        const progressBar = document.querySelector('.timeline__progress');

        if (timelineItems.length > 0 && progressBar) {

            let ticking = false;

            const handleTimelineScroll = (entries) => {
                if (ticking) {
                    return;
                }
                ticking = true;

                requestAnimationFrame(() => {
                    let activeItem = null;

                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-visible');
                            activeItem = entry.target;
                        }
                    });

                    if (activeItem) {
                        const dot = activeItem.querySelector('.timeline__dot');
                        if (dot) {
                            const containerRect = timelineContainer.getBoundingClientRect();
                            const dotRect = dot.getBoundingClientRect();
                            const newHeight = (dotRect.top + dotRect.height / 2) - containerRect.top;
                            progressBar.style.height = `${newHeight}px`;
                        }
                    } else {
                        const containerRect = timelineContainer.getBoundingClientRect();
                        const viewportCenter = window.innerHeight / 2;

                        if (containerRect.bottom < viewportCenter) {
                            progressBar.style.height = '100%';
                        } 
                        else if (containerRect.top > viewportCenter) {
                            progressBar.style.height = '0px';
                        }
                    }

                    ticking = false;
                });
            };

            const timelineObserver = new IntersectionObserver(handleTimelineScroll, {
                rootMargin: '-20% 0px -20% 0px',
                threshold: 0
            });

            resourceManager.registerObserver(timelineObserver);
            timelineItems.forEach(item => timelineObserver.observe(item));
        }
    }

    // ======================== STORY VIDEOLARI & HIGHLIGHT ========================
    const storySection = document.querySelector('.story-simple');

    if (storySection) {
        const storyHeader = storySection.querySelector('.story-simple__header');
        const storyMotto = storySection.querySelector('.story-simple__motto-container');
        const storyGrids = storySection.querySelectorAll('.story-simple__grid');
        const storyVideos = storySection.querySelectorAll('.story-simple__video');

        const storyTitle = storyHeader?.querySelector('.section__title');
        const mottoText = storyMotto?.querySelector('.story-simple__motto');
        if (storyTitle) storyTitle.setAttribute('data-text', storyTitle.textContent);
        if (mottoText) mottoText.setAttribute('data-text', mottoText.textContent);
        
        const allStoryElements = [...storyGrids, storyHeader, storyMotto].filter(Boolean);
        let activeElement = null;
        let ticking = false;

        const deactivateAll = () => {
            storyGrids.forEach(grid => {
                grid.querySelector('.story-simple__content')?.classList.remove('is-highlighted');
                const video = grid.querySelector('.story-simple__video');
                if (video) video.pause();
            });
            storyHeader?.classList.remove('is-glowing');
            storyMotto?.classList.remove('is-glowing');
        };

        const scrollHandler = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const viewportCenter = window.innerHeight / 2;
                    let closestElement = null;
                    let minDistance = Infinity;

                    allStoryElements.forEach(element => {
                        const rect = element.getBoundingClientRect();
                        if (rect.top < window.innerHeight && rect.bottom > 0) {
                            const elementCenter = rect.top + rect.height / 2;
                            const distance = Math.abs(viewportCenter - elementCenter);
                            if (distance < minDistance) {
                                minDistance = distance;
                                closestElement = element;
                            }
                        }
                    });

                    if (closestElement !== activeElement) {
                        deactivateAll();
                        if (closestElement?.classList.contains('story-simple__grid')) {
                            closestElement.querySelector('.story-simple__content')?.classList.add('is-highlighted');
                            closestElement.querySelector('.story-simple__video')?.play().catch(() => {});
                        } else if (closestElement === storyHeader) {
                            storyHeader.classList.add('is-glowing');
                        } else if (closestElement === storyMotto) {
                            storyMotto.classList.add('is-glowing');
                        }
                        activeElement = closestElement;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        const fadeInObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    fadeInObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        allStoryElements.forEach(el => fadeInObserver.observe(el));
        resourceManager.registerObserver(fadeInObserver);

        const sectionObserver = new IntersectionObserver((entries) => {
            const [entry] = entries;
            if (entry.isIntersecting) {
                document.addEventListener('scroll', scrollHandler, { passive: true });
            } else {
                document.removeEventListener('scroll', scrollHandler);
                deactivateAll();
                activeElement = null;
            }
        }, { rootMargin: '0px', threshold: 0 });

        sectionObserver.observe(storySection);
        resourceManager.registerObserver(sectionObserver);

        storyVideos.forEach(video => {
        video.pause();
        resourceManager.registerVideo(video);
        });
    }
    
    // ======================== CONTACT FORM (SANDVIC) ========================
    const contactForm = document.getElementById('contact-form');
    const submitBtn = contactForm?.querySelector('.form-submit-button');

    const getToastHost = (() => {
    let host = null;
    return () => {
        if (host) return host;
        host = document.createElement('div');
        host.className = 'toast-container';
        host.setAttribute('aria-live', 'polite');
        document.body.appendChild(host);
        return host;
    };
    })();

    function showToast(message, kind = 'success') {
    const host = getToastHost();
    const el = document.createElement('div');
    el.className = `toast toast--${kind}`;
    el.textContent = message;
    host.appendChild(el);

    requestAnimationFrame(() => el.classList.add('toast--in'));

    const ttl = setTimeout(() => {
        el.classList.remove('toast--in');
        el.addEventListener('transitionend', () => el.remove(), { once: true });
    }, 3000);

    el.addEventListener('click', () => {
        clearTimeout(ttl);
        el.classList.remove('toast--in');
        el.addEventListener('transitionend', () => el.remove(), { once: true });
    });
    }

    if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        submitBtn?.setAttribute('disabled', 'true');
        submitBtn?.classList.add('is-loading');

        try {
            const fd = new FormData(contactForm);
            const resp = await fetch(contactForm.action, {
                method: 'POST',
                body: fd,
                headers: { 'Accept': 'application/json' },
                signal: controller.signal
            });

            if (resp.ok) {
                showToast('Mesajınız gönderildi. En kısa sürede dönüş yapacağız.', 'success');
                contactForm.reset();
            } else {
                showToast('Gönderilemedi. Lütfen alanları kontrol edip tekrar deneyin.', 'error');
            }
            } catch (err) {
            showToast('Bağlantı hatası. İnternetinizi kontrol edip tekrar deneyin.', 'error');
            } finally {
            clearTimeout(timeoutId);
            submitBtn?.removeAttribute('disabled');
            submitBtn?.classList.remove('is-loading');
            }
        });
    }

    // ======================== COOKIE MODAL ODAK YONETIMI (FOCUS TRAP) ========================
    const handleFocusTrap = (e) => {
        if (e.key !== 'Tab') return;

        const cookieModal = document.getElementById('cookieModal');
        if (!cookieModal.classList.contains('active')) return;

        const focusableElements = Array.from(
            cookieModal.querySelectorAll(
                'button, [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
            )
        );
        
        if (focusableElements.length === 0) {
            e.preventDefault();
            return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        e.preventDefault();

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
            } else {
                const currentIndex = focusableElements.indexOf(document.activeElement);
                const prevElement = focusableElements[currentIndex - 1] || lastElement;
                prevElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
            } else {
                const currentIndex = focusableElements.indexOf(document.activeElement);
                const nextElement = focusableElements[currentIndex + 1] || firstElement;
                nextElement.focus();
            }
        }
    };

    // ======================== SCROLL DURUMUNDA LOGO ANIMASYONU ========================
    const header = document.querySelector('.header');
    const briqSpan = document.querySelector('.logo-text--briq');
    const mindSpan = document.querySelector('.logo-text--mind');
    const wrapper = document.querySelector('.logo-text-wrapper');

    if (!header || !briqSpan || !mindSpan || !wrapper) return;

    const calculateLogoShift = () => {
        const briqWidth = briqSpan.offsetWidth;
        const mindMargin = parseFloat(window.getComputedStyle(mindSpan).marginLeft);
        const totalShift = briqWidth + mindMargin;

        wrapper.style.setProperty('--logo-shift-amount', `${totalShift}px`);
    };

    calculateLogoShift();
    window.addEventListener('resize', calculateLogoShift);

    let isScrolled = false;
    const handleScroll = () => {
        const scrollPosition = window.scrollY;
        if (scrollPosition > 10 && !isScrolled) {
            header.classList.add('nav-scrolled');
            isScrolled = true;
        } else if (scrollPosition <= 10 && isScrolled) {
            header.classList.remove('nav-scrolled');
            isScrolled = false;
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // ======================== COOKIE MODAL ========================
    const manageCookiesLink = document.getElementById('manageCookiesLink');
    const cookieModal = document.getElementById('cookieModal');
    const cookieModalOverlay = document.getElementById('cookieModalOverlay');
    const cookieDoneBtn = document.getElementById('cookieDoneBtn');

    const openCookieModal = (e) => {
        e.preventDefault();
        
        cookieModal.classList.add('active');
        cookieModalOverlay.classList.add('active');
        
        document.documentElement.classList.add('modal-open');
        document.body.classList.add('modal-open');

        window.addEventListener('keydown', handleFocusTrap);

        setTimeout(() => document.getElementById('cookieModal').focus(), 100); 
    };

    const closeCookieModal = () => {
        cookieModal.classList.remove('active');
        cookieModalOverlay.classList.remove('active');
        
        document.documentElement.classList.remove('modal-open');
        document.body.classList.remove('modal-open');

        window.removeEventListener('keydown', handleFocusTrap);
    };

    if (manageCookiesLink && cookieModal && cookieModalOverlay && cookieDoneBtn) {
        manageCookiesLink.addEventListener('click', openCookieModal);
        cookieDoneBtn.addEventListener('click', closeCookieModal);
        cookieModalOverlay.addEventListener('click', closeCookieModal);

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && cookieModal.classList.contains('active')) {
                closeCookieModal();
            }
        });
    }

});

// ======================== GLOBAL TEMİZLİK ========================
window.addEventListener('beforeunload', () => resourceManager.cleanup());

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        resourceManager.videos.forEach(v => v.pause());
    } else {
        if (heroSliderState.playActiveVideo) {
            heroSliderState.playActiveVideo(heroSliderState.currentIndex);
        }
    }
});

// ======================== BFCACHE (Geri Buton) FIX ========================
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        
        const currentPath = window.location.pathname;
        const isHomePage = (
            currentPath === '/' || 
            currentPath === '/index.html' ||
            currentPath === '/en/' ||
            currentPath.endsWith('/en/index.html')
        );

        if (isHomePage) {
            window.location.reload();
        } 
        else {
            setTimeout(() => {
                document.querySelectorAll('.fade-in').forEach(el => {
                    el.classList.add('visible');
                });
            }, 100);
        }
    }
});

// ======================== SMOOTH GEÇİ - LOGO ========================
const logo = document.getElementById('nav-logo');
const heroSelector = '#hero';

if (logo) {
    logo.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Mevcut dili algıla
        const currentPath = window.location.pathname;
        const isEnglish = currentPath.startsWith('/en/') || currentPath.includes('_en/');
        const homeURL = isEnglish ? '/en/' : '/';
        
        const isHome = currentPath === '/' || currentPath === '/index.html' || currentPath === '/en/' || currentPath === '/en/index.html';

        if (isHome) {
            document.querySelector(heroSelector)?.scrollIntoView({ behavior: 'smooth' });
            history.replaceState(null, "", homeURL);
        } else {
            sessionStorage.setItem('scrollToHero', '1');
            window.location.href = homeURL;
        }
    });
}

// ====================== İLETİİM (Contact'a Kaydır) ======================
const contactLink = document.getElementById('nav-contact');
const contactSelector = '#contact';

if (contactLink) {
    contactLink.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Mevcut dili algıla
        const currentPath = window.location.pathname;
        const isEnglish = currentPath.startsWith('/en/') || currentPath.includes('_en/');
        const homeURL = isEnglish ? '/en/' : '/';
        
        const isHome = currentPath === '/' || currentPath === '/index.html' || currentPath === '/en/' || currentPath === '/en/index.html';

        if (isHome) {
            document.querySelector(contactSelector)?.scrollIntoView({ behavior: 'smooth' });
            history.replaceState(null, "", homeURL);
        } else {
            sessionStorage.setItem('scrollToContact', '1');
            window.location.href = homeURL;
        }
    });
}

// ====================== HERO CTA (About'a Kaydır) ======================
const heroCta = document.getElementById('hero-cta');
const aboutSelector = '#about';

if (heroCta) {
    heroCta.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Mevcut dili algıla
        const currentPath = window.location.pathname;
        const isEnglish = currentPath.startsWith('/en/') || currentPath.includes('_en/');
        const homeURL = isEnglish ? '/en/' : '/';
        
        const isHome = currentPath === '/' || currentPath === '/index.html' || currentPath === '/en/' || currentPath === '/en/index.html';

        if (isHome) {
            document.querySelector(aboutSelector)?.scrollIntoView({ behavior: 'smooth' });
            history.replaceState(null, "", homeURL);
        } else {
            sessionStorage.setItem('scrollToAbout', '1');
            window.location.href = homeURL;
        }
    });
}

// ====================== Sayfa Yüklendiğinde Scroll Kontrolü ======================
document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('scrollToHero')) {
        sessionStorage.removeItem('scrollToHero');
        document.querySelector(heroSelector)?.scrollIntoView({ behavior: 'smooth' });
        
        const currentPath = window.location.pathname;
        const isEnglish = currentPath.startsWith('/en/') || currentPath.includes('_en/');
        history.replaceState(null, "", isEnglish ? '/en/' : '/');
    }

    if (sessionStorage.getItem('scrollToContact')) {
        sessionStorage.removeItem('scrollToContact');
        document.querySelector(contactSelector)?.scrollIntoView({ behavior: 'smooth' });
        
        const currentPath = window.location.pathname;
        const isEnglish = currentPath.startsWith('/en/') || currentPath.includes('_en/');
        history.replaceState(null, "", isEnglish ? '/en/' : '/');
    }
    
    if (sessionStorage.getItem('scrollToAbout')) {
        sessionStorage.removeItem('scrollToAbout');
        document.querySelector(aboutSelector)?.scrollIntoView({ behavior: 'smooth' });
        
        const currentPath = window.location.pathname;
        const isEnglish = currentPath.startsWith('/en/') || currentPath.includes('_en/');
        history.replaceState(null, "", isEnglish ? '/en/' : '/');
    }
});

// ======================== DİL DEİTİRME SİSTEMİ ========================
const LanguageSwitcher = (() => {
    const LANG_CONFIG = {
        TR: {
            code: 'tr',
            flag: `<svg class="lang-switcher__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 341"><rect width="512" height="341" fill="#E30A17"/><circle cx="258" cy="170.5" r="102" fill="#fff"/><circle cx="275" cy="170.5" r="85" fill="#E30A17"/><path fill="#fff" d="m320 161-28 18 11-29-28-18h34l11-29 11 29h34l-28 18 11 29z"/></svg>`,
            label: 'TR'
        },
        EN: {
            code: 'en',
            flag: `<svg class="lang-switcher__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 341"><rect width="512" height="341" fill="#012169"/><path fill="#FFF" d="M0 0l512 341M512 0L0 341"/><path fill="#FFF" d="M213 0h86v341h-86z"/><path fill="#FFF" d="M0 114h512v113H0z"/><path fill="#C8102E" d="M0 137h512v68H0z"/><path fill="#C8102E" d="M230 0h52v341h-52z"/><path stroke="#FFF" stroke-width="64" d="M0 0l512 341M512 0L0 341"/><path stroke="#C8102E" stroke-width="43" d="M0 0l512 341M512 0L0 341"/></svg>`,
            label: 'EN'
        }
    };

    const detectCurrentLanguage = () => {
        const path = window.location.pathname;
        return path.startsWith('/en/') || path.includes('_en/') ? 'EN' : 'TR';
    };

    const generateTargetURL = (currentPath, currentHash) => {
        const currentLang = detectCurrentLanguage();
        
        if (currentPath === '/' || currentPath === '/index.html') {
            return currentLang === 'TR' ? '/en/' + currentHash : '/' + currentHash;
        }

        if (currentPath.startsWith('/en/')) {
            const withoutEn = currentPath.replace('/en/', '/');
            return withoutEn + currentHash;
        }

        if (!currentPath.includes('_en/')) {
            const segments = currentPath.split('/').filter(Boolean);
            
            if (segments.length > 0) {
                segments[0] = segments[0] + '_en';
                return '/' + segments.join('/') + currentHash;
            }
        }

        if (currentPath.includes('_en/')) {
            const withoutEn = currentPath.replace('_en/', '/');
            return withoutEn + currentHash;
        }

        return currentLang === 'TR' ? '/en/' + currentHash : '/' + currentHash;
    };

    const updateSwitcherUI = () => {
        const langSwitcher = document.querySelector('.footer .lang-switcher');
        if (!langSwitcher) return;

        const button = langSwitcher.querySelector('.lang-switcher__button');
        const langItem = langSwitcher.querySelector('.lang-switcher__item');
        
        if (!button || !langItem) return;

        const currentLang = detectCurrentLanguage();
        const currentConfig = LANG_CONFIG[currentLang];
        const targetConfig = LANG_CONFIG[currentLang === 'TR' ? 'EN' : 'TR'];

        button.innerHTML = `
            ${currentConfig.flag}
            <span>${currentConfig.label}</span>
            <i class='bx bx-chevron-down lang-switcher__arrow'></i>
        `;

        langItem.innerHTML = `
            ${targetConfig.flag}
            <span>${targetConfig.label}</span>
        `;

        button.setAttribute('aria-label', `Dili değiştir - u an: ${currentConfig.label}`);
        langItem.setAttribute('title', `${targetConfig.label} diline geç`);
    };

    const setupDropdownBehavior = () => {
        const langSwitcher = document.querySelector('.footer .lang-switcher');
        if (!langSwitcher) return;

        const button = langSwitcher.querySelector('.lang-switcher__button');
        
        let isOpen = false;

        const closeDropdown = () => {
            langSwitcher.classList.remove('is-open');
            button.setAttribute('aria-expanded', 'false');
            isOpen = false;
            document.removeEventListener('click', handleOutsideClick);
            document.removeEventListener('keydown', handleEscapeKey);
        };

        const openDropdown = () => {
            langSwitcher.classList.add('is-open');
            button.setAttribute('aria-expanded', 'true');
            isOpen = true;
            
            setTimeout(() => {
                document.addEventListener('click', handleOutsideClick);
                document.addEventListener('keydown', handleEscapeKey);
            }, 0);
        };

        const handleOutsideClick = (e) => {
            if (!langSwitcher.contains(e.target)) {
                closeDropdown();
            }
        };

        const handleEscapeKey = (e) => {
            if (e.key === 'Escape') {
                closeDropdown();
                button.focus();
            }
        };

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            isOpen ? closeDropdown() : openDropdown();
        });
    };

    const setupLanguageSwitch = () => {
        const langItem = document.querySelector('.footer .lang-switcher__item');
        if (!langItem) return;

        langItem.addEventListener('click', (e) => {
            e.preventDefault();
            
            const currentPath = window.location.pathname;
            const currentHash = window.location.hash;
            
            const targetURL = generateTargetURL(currentPath, currentHash);
            
            document.body.style.opacity = '0.95';
            
            setTimeout(() => {
                window.location.href = targetURL;
            }, 100);
        });
    };

    const init = () => {
        updateSwitcherUI();
        setupDropdownBehavior();
        setupLanguageSwitch();
        
        console.info('[LangSwitcher] Dil değiştirici başarıyla yüklendi:', detectCurrentLanguage());
    };

    return { init, detectCurrentLanguage, generateTargetURL };
})();

document.addEventListener('DOMContentLoaded', () => {
    LanguageSwitcher.init();
});

if (typeof window !== 'undefined') {
    window.LanguageSwitcher = LanguageSwitcher;
}

// ======================== BIRK PLAYGROUND ANIMATION ========================
function initBirkPlaygroundLegacy() {
    const terminal = document.getElementById('birkTerminal');
    if (!terminal) return;

    // Dil tespiti
    const isEN = document.documentElement.lang === 'en';

    const TEXTS = {
        requestText: isEN
            ? "Analyze last quarter's sales data and prepare a PDF report."
            : "Son çeyrek satış verilerini analiz et ve PDF raporu hazırla.",
        finalResponse: isEN
            ? "Analysis complete. A 15% increase in sales was observed."
            : "Analiz tamamlandı. Satışlarda %15 artış gözlemlendi."
    };

    const welcomeView  = document.getElementById('birkWelcomeView');
    const chatView     = document.getElementById('birkChatView');
    const welcomeWords = welcomeView.querySelectorAll('.birk__welcome-word');
    const inputBox     = document.getElementById('birkInputBox');
    const inputText    = document.getElementById('birkInputText');
    const sendBtn      = document.getElementById('birkSendBtn');
    const planning     = document.getElementById('birkPlanning');
    const planSteps    = planning.querySelectorAll('.birk__plan-step');
    const response     = document.getElementById('birkResponse');
    const responseText = document.getElementById('birkResponseText');
    const fileCard     = document.getElementById('birkFileCard');
    const stepCards    = document.querySelectorAll('.birk__step-card');

    let cancelled = false;
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    const setActiveStep = index => {
        stepCards.forEach((card, i) => card.classList.toggle('is-active', i === index));
    };

    const reset = () => {
        setActiveStep(0);
        welcomeView.classList.remove('is-hidden');
        welcomeWords.forEach(w => w.classList.remove('is-visible'));
        inputBox.classList.remove('is-visible');
        inputText.textContent = '';
        sendBtn.classList.remove('is-sending');
        chatView.classList.remove('is-visible');
        planning.classList.remove('is-visible');
        planSteps.forEach(step => {
            step.classList.remove('is-active', 'is-done');
            step.querySelector('.birk__plan-indicator').innerHTML = '';
        });
        response.classList.remove('is-visible');
        responseText.textContent = '';
        fileCard.classList.remove('is-visible');
    };

    const typeText = async (container, text) => {
        for (let i = 0; i <= text.length; i++) {
            if (cancelled) return;
            container.textContent = text.slice(0, i);
            await sleep(18 + Math.random() * 14);
        }
    };

    const runSequence = async () => {
        while (!cancelled) {
            reset();

            // Karşılama kelimelerini birer birer göster
            for (let i = 0; i < welcomeWords.length; i++) {
                await sleep(140);
                if (cancelled) return;
                welcomeWords[i].classList.add('is-visible');
            }

            await sleep(500);
            if (cancelled) return;
            inputBox.classList.add('is-visible');
            await sleep(800);
            if (cancelled) return;

            // Input metnini yaz
            await typeText(inputText, TEXTS.requestText);
            await sleep(800);
            if (cancelled) return;

            // Gönder butonuna basılıyor
            sendBtn.classList.add('is-sending');
            await sleep(1000);
            if (cancelled) return;

            // Chat görünümüne geç
            welcomeView.classList.add('is-hidden');
            await sleep(1500);
            if (cancelled) return;

            chatView.classList.add('is-visible');
            await sleep(500);
            if (cancelled) return;

            // Planlama adımları
            setActiveStep(1);
            planning.classList.add('is-visible');

            for (let i = 0; i < planSteps.length; i++) {
                if (cancelled) return;
                const step = planSteps[i];
                step.classList.add('is-active');
                const indicator = step.querySelector('.birk__plan-indicator');
                const spinner = document.createElement('span');
                spinner.className = 'birk__plan-spinner';
                indicator.innerHTML = '';
                indicator.appendChild(spinner);
                await sleep(1500);
                if (cancelled) return;
                indicator.innerHTML = '✓';
                step.classList.remove('is-active');
                step.classList.add('is-done');
            }

            await sleep(800);
            if (cancelled) return;

            // Yanıt
            setActiveStep(2);
            response.classList.add('is-visible');
            await typeText(responseText, TEXTS.finalResponse);
            if (cancelled) return;

            fileCard.classList.add('is-visible');
            await sleep(6000);
        }
    };

    // Sadece görünür olduğunda çalıştır
    let stopFn = null;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !stopFn) {
                cancelled = false;
                runSequence();
                stopFn = () => { cancelled = true; stopFn = null; };
            } else if (!entry.isIntersecting && stopFn) {
                stopFn();
            }
        });
    }, { threshold: 0.25 });

    observer.observe(terminal);
}

document.addEventListener('DOMContentLoaded', initBirkPlayground);

// ======================== HERO INPUT SLIDER (Slide Up Animation) ========================
const initHeroInputSlider = () => {
    const textElement = document.getElementById('heroInputText');
    if (!textElement) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const swapDelay = prefersReducedMotion ? 0 : 240;
    let pendingTimer = null;
    let currentText = (textElement.textContent || '').trim();

    const resetAnimation = () => {
        textElement.classList.remove('slide-out');
        textElement.classList.remove('slide-in');
    };

    const triggerInAnimation = () => {
        if (prefersReducedMotion) return;
        void textElement.offsetWidth;
        textElement.classList.add('slide-in');
    };

    const applySyncedText = (nextText, immediate = false) => {
        const normalized = (nextText || '').trim();
        if (!normalized || normalized === currentText) return;

        if (pendingTimer) {
            clearTimeout(pendingTimer);
            pendingTimer = null;
        }

        if (immediate || prefersReducedMotion) {
            resetAnimation();
            textElement.textContent = normalized;
            currentText = normalized;
            triggerInAnimation();
            return;
        }

        resetAnimation();
        void textElement.offsetWidth;
        textElement.classList.add('slide-out');

        pendingTimer = setTimeout(() => {
            textElement.textContent = normalized;
            currentText = normalized;
            resetAnimation();
            triggerInAnimation();
            pendingTimer = null;
        }, swapDelay);
    };

    document.addEventListener('hero:input-sync', (event) => {
        const detail = event && event.detail ? event.detail : {};
        applySyncedText(detail.text, !!detail.immediate);
    });
};

document.addEventListener('DOMContentLoaded', initHeroInputSlider);

// ======================== OVERRIDES: BIRK + HERO TERMINAL CAROUSEL ========================
function initBirkPlayground() {
    const terminal = document.getElementById('birkTerminal');
    if (!terminal) return;

    const isEN = document.documentElement.lang === 'en' || window.location.pathname.includes('/en/');
    const TEXTS = isEN
        ? {
            requestText: 'Analyze last quarter sales, generate the report, and write the summary into a notebook.',
            planTitle: 'Thought Process',
            planSteps: [
                'Connecting to internal data sources and scanning files...',
                'Running tools: SQL_Engine, WebScout, File_Analyzer...',
                'Generating deliverables and preparing download containers...'
            ],
            finalResponse: 'Tool run complete. Sales increased by 15%, and two key risk clusters were detected. report.pdf and analysis_notebook.md are ready.',
            reportFileName: 'report.pdf',
            reportFileMeta: '2.6 MB - PDF Report',
            notebookFileName: 'analysis_notebook.md',
            notebookFileMeta: '98 KB - Notebook'
        }
        : {
            requestText: 'Son çeyrek satışlarını analiz et, raporu üret ve özeti not defterine yaz.',
            planTitle: 'Düşünce Süreci',
            planSteps: [
                'Kurumsal veri kaynaklarına bağlanılıyor ve dosyalar taranıyor...',
                'Araçlar çalıştırılıyor: SQL_Engine, WebScout, File_Analyzer...',
                'Çıktı dosyaları hazırlanıyor ve indirme kartları oluşturuluyor...'
            ],
            finalResponse: 'Araç çalıştırma tamamlandı. Satışlarda %15 artış ve iki kritik risk kümesi tespit edildi. report.pdf ve analysis_notebook.md hazır.',
            reportFileName: 'report.pdf',
            reportFileMeta: '2.6 MB - PDF Raporu',
            notebookFileName: 'analysis_notebook.md',
            notebookFileMeta: '98 KB - Not Defteri'
        };

    const welcomeView = document.getElementById('birkWelcomeView');
    const chatView = document.getElementById('birkChatView');
    const inputBox = document.getElementById('birkInputBox');
    const inputText = document.getElementById('birkInputText');
    const sendBtn = document.getElementById('birkSendBtn');
    const planning = document.getElementById('birkPlanning');
    const response = document.getElementById('birkResponse');
    const responseText = document.getElementById('birkResponseText');
    const stepCards = document.querySelectorAll('.birk__step-card');

    if (!welcomeView || !chatView || !inputBox || !inputText || !sendBtn || !planning || !response || !responseText) {
        return;
    }

    const welcomeWords = welcomeView.querySelectorAll('.birk__welcome-word');
    const userBubble = chatView.querySelector('.birk__user-bubble');
    const planningHeader = planning.querySelector('.birk__planning-header span');
    const planSteps = planning.querySelectorAll('.birk__plan-step');
    const fileCard = document.getElementById('birkFileCard');

    if (!fileCard || !userBubble || !planSteps.length) return;

    let notebookCard = document.getElementById('birkNotebookCard');
    if (!notebookCard) {
        notebookCard = fileCard.cloneNode(true);
        notebookCard.id = 'birkNotebookCard';
        notebookCard.classList.remove('is-visible');
        response.appendChild(notebookCard);
    }

    userBubble.textContent = TEXTS.requestText;
    if (planningHeader) planningHeader.textContent = TEXTS.planTitle;

    planSteps.forEach((step, index) => {
        const stepText = step.querySelector('span:last-child');
        if (stepText) stepText.textContent = TEXTS.planSteps[index] || '';
    });

    const reportName = fileCard.querySelector('.birk__file-name');
    const reportMeta = fileCard.querySelector('.birk__file-meta');
    const notebookName = notebookCard.querySelector('.birk__file-name');
    const notebookMeta = notebookCard.querySelector('.birk__file-meta');

    if (reportName) reportName.textContent = TEXTS.reportFileName;
    if (reportMeta) reportMeta.textContent = TEXTS.reportFileMeta;
    if (notebookName) notebookName.textContent = TEXTS.notebookFileName;
    if (notebookMeta) notebookMeta.textContent = TEXTS.notebookFileMeta;

    let cancelled = false;
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const setActiveStep = (index) => {
        stepCards.forEach((card, i) => card.classList.toggle('is-active', i === index));
    };

    const reset = () => {
        setActiveStep(0);
        welcomeView.classList.remove('is-hidden');
        welcomeWords.forEach((word) => word.classList.remove('is-visible'));
        inputBox.classList.remove('is-visible');
        inputText.textContent = '';
        sendBtn.classList.remove('is-sending');
        chatView.classList.remove('is-visible');
        userBubble.classList.remove('is-visible');
        planning.classList.remove('is-visible');
        planSteps.forEach((step) => {
            step.classList.remove('is-active', 'is-done');
            const indicator = step.querySelector('.birk__plan-indicator');
            if (indicator) indicator.textContent = '';
        });
        response.classList.remove('is-visible');
        responseText.textContent = '';
        fileCard.classList.remove('is-visible');
        notebookCard.classList.remove('is-visible');
    };

    const typeText = async (container, text) => {
        for (let i = 0; i <= text.length; i++) {
            if (cancelled) return;
            container.textContent = text.slice(0, i);
            await sleep(18 + Math.random() * 14);
        }
    };

    const runSequence = async () => {
        while (!cancelled) {
            reset();

            for (let i = 0; i < welcomeWords.length; i++) {
                await sleep(140);
                if (cancelled) return;
                welcomeWords[i].classList.add('is-visible');
            }

            await sleep(500);
            if (cancelled) return;
            inputBox.classList.add('is-visible');
            await sleep(800);
            if (cancelled) return;

            await typeText(inputText, TEXTS.requestText);
            await sleep(800);
            if (cancelled) return;

            sendBtn.classList.add('is-sending');
            await sleep(1000);
            if (cancelled) return;

            welcomeView.classList.add('is-hidden');
            await sleep(1500);
            if (cancelled) return;

            chatView.classList.add('is-visible');
            await sleep(300);
            if (cancelled) return;

            userBubble.classList.add('is-visible');
            await sleep(650);
            if (cancelled) return;

            setActiveStep(1);
            planning.classList.add('is-visible');

            for (let i = 0; i < planSteps.length; i++) {
                if (cancelled) return;
                const step = planSteps[i];
                step.classList.add('is-active');

                const indicator = step.querySelector('.birk__plan-indicator');
                if (!indicator) continue;

                const spinner = document.createElement('span');
                spinner.className = 'birk__plan-spinner';
                indicator.textContent = '';
                indicator.appendChild(spinner);

                await sleep(1300);
                if (cancelled) return;

                indicator.textContent = 'OK';
                step.classList.remove('is-active');
                step.classList.add('is-done');
            }

            await sleep(800);
            if (cancelled) return;

            setActiveStep(2);
            response.classList.add('is-visible');
            await typeText(responseText, TEXTS.finalResponse);
            if (cancelled) return;

            fileCard.classList.add('is-visible');
            await sleep(450);
            if (cancelled) return;

            notebookCard.classList.add('is-visible');
            await sleep(5500);
        }
    };

    let stopFn = null;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && !stopFn) {
                cancelled = false;
                runSequence();
                stopFn = () => {
                    cancelled = true;
                    stopFn = null;
                };
            } else if (!entry.isIntersecting && stopFn) {
                stopFn();
            }
        });
    }, { threshold: 0.25 });

    observer.observe(terminal);
}

function initHeroTerminalCarousel() {
    const stack = document.querySelector('.hero__stack-container');
    if (!stack) return;

    const terminals = Array.from(stack.querySelectorAll('.terminal-window'));
    if (!terminals.length) return;

    const isEN = document.documentElement.lang === 'en' || window.location.pathname.includes('/en/');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const syncHeroInput = (text, immediate = false) => {
        document.dispatchEvent(new CustomEvent('hero:input-sync', {
            detail: { text, immediate }
        }));
    };

    const CONTENT = isEN
        ? [
            {
                title: 'security_module',
                user: 'Inspect traffic, run scanner, and save brief notes.',
                thinkingTitle: 'Thought Process',
                thinkingSteps: [
                    'Scanning active ports with NetSec_Scanner...',
                    'Matching signatures with ThreatMap...',
                    'Saving summary into security_notebook.md...'
                ],
                botTool: 'NetSec_Scanner + ThreatMap',
                botMessage: 'Scan complete. No critical threat, 2 low alerts logged.',
                downloadName: 'security_notebook.md',
                downloadMeta: '34 KB - Notebook'
            },
            {
                title: 'data_engine',
                user: 'Analyze sales, detect anomalies, and write short notes.',
                thinkingTitle: 'Thought Process',
                thinkingSteps: [
                    'Querying records with SQL_Engine...',
                    'Checking outliers with Trend_Analyzer...',
                    'Generating anomaly_notes.txt...'
                ],
                botTool: 'SQL_Engine + Trend_Analyzer',
                botMessage: 'Analysis done. 3 anomaly clusters, margin impact: 9.7%.',
                downloadName: 'anomaly_notes.txt',
                downloadMeta: '41 KB - Text Notes'
            },
            {
                title: 'birk_assistant',
                user: 'Generate annual report, score risks, and attach notebook.',
                thinkingTitle: 'Thought Process',
                thinkingSteps: [
                    'Collecting KPI and finance sheets...',
                    'Scoring exposure areas with Risk_Analyzer...',
                    'Generating report.pdf and risk_notebook.md...'
                ],
                botTool: 'DocuGen_AI + Risk_Analyzer',
                botMessage: 'Output ready. Report generated and risk notes prepared.',
                downloadName: 'risk_notebook.md',
                downloadMeta: '72 KB - Notebook'
            }
        ]
        : [
            {
                title: 'guvenlik_modulu',
                user: 'Ağ trafiğini denetle, taramayı çalıştır, kısa not kaydet.',
                thinkingTitle: 'Düşünce Süreci',
                thinkingSteps: [
                    'NetSec_Scanner ile aktif portlar taranıyor...',
                    'ThreatMap ile imzalar eşleştiriliyor...',
                    'Özet security_notebook.md dosyasına yazılıyor...'
                ],
                botTool: 'NetSec_Scanner + ThreatMap',
                botMessage: 'Tarama tamamlandı. Kritik tehdit yok, 2 düşük uyarı var.',
                downloadName: 'security_notebook.md',
                downloadMeta: '34 KB - Not Defteri'
            },
            {
                title: 'veri_motoru',
                user: 'Satış verisini analiz et, anomalileri bul, kısa not üret.',
                thinkingTitle: 'Düşünce Süreci',
                thinkingSteps: [
                    'SQL_Engine ile kayıtlar sorgulanıyor...',
                    'Trend_Analyzer ile aykırı değerler inceleniyor...',
                    'anomaly_notes.txt dosyası hazırlanıyor...'
                ],
                botTool: 'SQL_Engine + Trend_Analyzer',
                botMessage: 'Analiz tamamlandı. 3 anomali kümesi, marj etkisi: %9.7.',
                downloadName: 'anomaly_notes.txt',
                downloadMeta: '41 KB - Metin Notu'
            },
            {
                title: 'birk_asistan',
                user: 'Yıllık raporu üret, riskleri puanla, not defteri ekle.',
                thinkingTitle: 'Düşünce Süreci',
                thinkingSteps: [
                    'File_Analyzer ile KPI ve finans verileri toplanıyor...',
                    'Risk_Analyzer ile maruziyet puanlanıyor...',
                    'report.pdf ve risk_notebook.md oluşturuluyor...'
                ],
                botTool: 'DocuGen_AI + Risk_Analyzer',
                botMessage: 'Nihai çıktı hazır. Rapor ve risk notları indirilebilir.',
                downloadName: 'risk_notebook.md',
                downloadMeta: '72 KB - Not Defteri'
            }
        ];

    terminals.forEach((terminal, index) => {
        const content = CONTENT[index % CONTENT.length];
        const title = terminal.querySelector('.terminal-title');
        const body = terminal.querySelector('.terminal-body');
        if (!body) return;

        if (title && content.title) title.textContent = content.title;

        body.innerHTML = `
            <div class="chat-bubble chat-bubble--user"></div>
            <div class="terminal-thinking">
                <div class="terminal-thinking__title"></div>
                <ul class="terminal-thinking__steps"></ul>
            </div>
            <div class="chat-bubble chat-bubble--bot">
                <span class="bot-tool"></span>
                <span class="bot-message"></span>
                <div class="bot-download-card">
                    <span class="bot-download-card__icon">DL</span>
                    <div class="bot-download-card__text">
                        <span class="bot-download-card__name"></span>
                        <span class="bot-download-card__meta"></span>
                    </div>
                </div>
            </div>
        `;

        const userBubble = body.querySelector('.chat-bubble--user');
        const thinkingTitle = body.querySelector('.terminal-thinking__title');
        const thinkingSteps = body.querySelector('.terminal-thinking__steps');
        const botTool = body.querySelector('.bot-tool');
        const botMessage = body.querySelector('.bot-message');
        const downloadName = body.querySelector('.bot-download-card__name');
        const downloadMeta = body.querySelector('.bot-download-card__meta');

        if (userBubble) userBubble.textContent = content.user;
        if (thinkingTitle) thinkingTitle.textContent = content.thinkingTitle;
        if (botTool) botTool.textContent = content.botTool;
        if (botMessage) botMessage.textContent = content.botMessage;
        if (downloadName) downloadName.textContent = content.downloadName;
        if (downloadMeta) downloadMeta.textContent = content.downloadMeta;

        if (thinkingSteps) {
            thinkingSteps.innerHTML = '';
            content.thinkingSteps.forEach((stepText) => {
                const item = document.createElement('li');
                item.className = 'terminal-thinking__step';
                item.textContent = stepText;
                thinkingSteps.appendChild(item);
            });
        }
    });

    stack.classList.add('is-ready');

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
    let activeIndex = terminals.findIndex((terminal) => terminal.classList.contains('terminal-3'));
    if (activeIndex < 0) activeIndex = 0;
    let loopToken = 0;

    const clearBubbleStates = (terminal) => {
        const userBubble = terminal.querySelector('.chat-bubble--user');
        const thinking = terminal.querySelector('.terminal-thinking');
        const botBubble = terminal.querySelector('.chat-bubble--bot');
        const thinkingSteps = terminal.querySelectorAll('.terminal-thinking__step');

        if (userBubble) userBubble.classList.remove('is-visible');
        if (thinking) thinking.classList.remove('is-visible');
        if (botBubble) botBubble.classList.remove('is-visible');
        thinkingSteps.forEach((step) => step.classList.remove('is-visible'));
    };

    const applyPositions = () => {
        const mobileView = isMobile();
        terminals.forEach((terminal, index) => {
            terminal.classList.remove('is-left', 'is-center', 'is-right', 'is-hidden');

            if (mobileView) {
                terminal.classList.add(index === activeIndex ? 'is-center' : 'is-hidden');
                return;
            }

            const offset = (index - activeIndex + terminals.length) % terminals.length;
            if (offset === 0) {
                terminal.classList.add('is-center');
            } else if (offset === 1) {
                terminal.classList.add('is-right');
            } else if (offset === terminals.length - 1) {
                terminal.classList.add('is-left');
            } else {
                terminal.classList.add('is-hidden');
            }
        });
    };

    const animateActiveTerminal = async (token) => {
        if (token !== loopToken) return false;
        const terminal = terminals[activeIndex];
        if (!terminal) return false;

        terminals.forEach((item) => item.classList.remove('is-animating'));
        terminal.classList.add('is-animating');
        clearBubbleStates(terminal);
        applyPositions();

        const userBubble = terminal.querySelector('.chat-bubble--user');
        const thinking = terminal.querySelector('.terminal-thinking');
        const botBubble = terminal.querySelector('.chat-bubble--bot');
        const thinkingSteps = Array.from(terminal.querySelectorAll('.terminal-thinking__step'));

        const delays = prefersReducedMotion
            ? { enter: 0, preThink: 90, step: 90, preBot: 90, hold: 700 }
            : { enter: 220, preThink: 620, step: 380, preBot: 340, hold: 1600 };

        await sleep(delays.enter);
        if (token !== loopToken) {
            terminal.classList.remove('is-animating');
            return false;
        }
        if (userBubble) {
            syncHeroInput(userBubble.textContent || '');
            userBubble.classList.add('is-visible');
        }

        await sleep(delays.preThink);
        if (token !== loopToken) {
            terminal.classList.remove('is-animating');
            return false;
        }
        if (thinking) thinking.classList.add('is-visible');

        for (const step of thinkingSteps) {
            await sleep(delays.step);
            if (token !== loopToken) {
                terminal.classList.remove('is-animating');
                return false;
            }
            step.classList.add('is-visible');
        }

        await sleep(delays.preBot);
        if (token !== loopToken) {
            terminal.classList.remove('is-animating');
            return false;
        }
        if (botBubble) botBubble.classList.add('is-visible');

        await sleep(delays.hold);
        terminal.classList.remove('is-animating');
        clearBubbleStates(terminal);
        return token === loopToken;
    };

    const runLoop = async (token) => {
        while (token === loopToken) {
            applyPositions();
            const completed = await animateActiveTerminal(token);
            if (!completed || token !== loopToken) return;

            activeIndex = (activeIndex + 1) % terminals.length;
            await sleep(prefersReducedMotion ? 220 : 520);
        }
    };

    const restartLoop = () => {
        const nextToken = loopToken + 1;
        loopToken = nextToken;
        terminals.forEach((terminal) => {
            terminal.classList.remove('is-animating');
            clearBubbleStates(terminal);
        });
        applyPositions();
        const currentPrompt = terminals[activeIndex]
            ? terminals[activeIndex].querySelector('.chat-bubble--user')
            : null;
        syncHeroInput(currentPrompt ? currentPrompt.textContent || '' : '', true);
        const firstDelay = prefersReducedMotion ? 140 : 820;
        setTimeout(() => {
            if (loopToken === nextToken) runLoop(nextToken);
        }, firstDelay);
    };

    restartLoop();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            applyPositions();
        }, 120);
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            loopToken += 1;
        } else {
            restartLoop();
        }
    });
}

document.addEventListener('DOMContentLoaded', initHeroTerminalCarousel);

function initHeroLumosDots() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    let rect = hero.getBoundingClientRect();
    let rafId = 0;
    let active = false;

    let targetX = rect.width / 2;
    let targetY = rect.height / 2;
    let currentX = targetX;
    let currentY = targetY;

    const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

    const updateRect = () => {
        rect = hero.getBoundingClientRect();
    };

    const setTargetFromPointer = (clientX, clientY) => {
        targetX = clamp(clientX - rect.left, 0, rect.width);
        targetY = clamp(clientY - rect.top, 0, rect.height);
    };

    const tick = () => {
        rafId = 0;

        // Mouse takibini yumuşatmak için lineer yaklaşım.
        const ease = 0.12;
        currentX += (targetX - currentX) * ease;
        currentY += (targetY - currentY) * ease;

        hero.style.setProperty('--lumos-x', `${currentX.toFixed(2)}px`);
        hero.style.setProperty('--lumos-y', `${currentY.toFixed(2)}px`);

        const drifting = Math.abs(currentX - targetX) > 0.25 || Math.abs(currentY - targetY) > 0.25;
        if (active || drifting) {
            rafId = window.requestAnimationFrame(tick);
        }
    };

    const ensureLoop = () => {
        if (!rafId) {
            rafId = window.requestAnimationFrame(tick);
        }
    };

    hero.addEventListener('mouseenter', (event) => {
        updateRect();
        active = true;
        hero.classList.add('is-lumos-active');
        setTargetFromPointer(event.clientX, event.clientY);
        ensureLoop();
    }, { passive: true });

    window.addEventListener('mousemove', (event) => {
        if (!active) return;
        setTargetFromPointer(event.clientX, event.clientY);
        ensureLoop();
    }, { passive: true });

    hero.addEventListener('mouseleave', () => {
        active = false;
        hero.classList.remove('is-lumos-active');
        ensureLoop();
    }, { passive: true });

    window.addEventListener('scroll', updateRect, { passive: true });
    window.addEventListener('resize', updateRect, { passive: true });
}

document.addEventListener('DOMContentLoaded', initHeroLumosDots);

