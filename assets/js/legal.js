/**
 * GENERAL USE v2 - Script
 * @version 1.0.0
 * @description General control v2
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const tocContainer = document.getElementById('legal-toc');
    const contentBody = document.querySelector('.content-body');
    const headings = contentBody.querySelectorAll('h2, h3');

    if (!tocContainer || !contentBody || headings.length === 0) {
        return;
    }

    headings.forEach((heading, index) => {
        const id = `section-${index}`;
        heading.id = id;

        const listItem = document.createElement('li');
        const link = document.createElement('a');
        
        link.href = `#${id}`;
        link.textContent = heading.textContent;
        
        listItem.appendChild(link);
        tocContainer.appendChild(listItem);
    });

    const tocLinks = tocContainer.querySelectorAll('a');
    const header = document.querySelector('.header');

    tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); 

            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerHeight = header ? header.offsetHeight : 0;
                const yOffset = -headerHeight - 20; 
                const targetY = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;

                window.scrollTo({
                    top: targetY,
                    behavior: 'smooth'
                });

                tocLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                tocLinks.forEach(link => link.classList.remove('active'));
                
                const id = entry.target.id;
                const activeLink = tocContainer.querySelector(`a[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, {
        rootMargin: '0px 0px -75% 0px',
        threshold: 0
    });

    headings.forEach(heading => {
        observer.observe(heading);
    });
});