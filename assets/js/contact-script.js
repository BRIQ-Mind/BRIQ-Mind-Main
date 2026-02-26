/**
 * CONTACT PAGE - Script
 * @version 1.0.0
 * @description Contact form control
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form-element');
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

    const contactButton = document.querySelector('.contact-button');
    if (contactButton && contactButton.getAttribute('href') === '#contact-form') {
        contactButton.addEventListener('click', (e) => {
            e.preventDefault();
            const formSection = document.getElementById('contact-form');
            if (formSection) {
                const header = document.querySelector('.header');
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = formSection.getBoundingClientRect().top + window.scrollY;
                const offsetPosition = targetPosition - headerHeight - 20;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
});