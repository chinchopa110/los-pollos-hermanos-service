(function () {
    'use strict';

    const eventHandlers = {
        load: [],
        DOMContentLoaded: []
    };

    function addEventListener(event, handler) {
        if (!eventHandlers[event]) {
            eventHandlers[event] = [];
        }
        eventHandlers[event].push(handler);
    }

    function executeEventHandlers(event) {
        if (eventHandlers[event]) {
            eventHandlers[event].forEach(handler => {
                try {
                    handler();
                } catch (error) {
                    console.error(`Error in ${event} handler:`, error);
                }
            });
        }
    }

    addEventListener('load', function () {
        const loadTime = getLoadDuration();
        displayLoadTime(loadTime);
        highlightCurrentPage();
    });

    addEventListener('DOMContentLoaded', function () {
        initializeNavigation();
    });

    function getLoadDuration() {
        try {
            const navEntries = performance.getEntriesByType && performance.getEntriesByType('navigation');
            if (navEntries && navEntries.length > 0) {
                const nav = navEntries[0];
                if (nav.loadEventEnd && nav.loadEventEnd > 0) {
                    return nav.loadEventEnd - nav.startTime;
                }
                return performance.now();
            }
        } catch (_) {}
        return performance.now();
    }

    function displayLoadTime(loadTime) {
        const loadTimeElement = document.getElementById('loadTime');
        if (loadTimeElement) {
            loadTimeElement.textContent = `Время загрузки страницы: ${loadTime.toFixed(2)} мс`;
            loadTimeElement.style.cssText = `
                text-align: center;
                margin-top: 1rem;
                padding: 0.5rem;
                background: var(--color-background-alt);
                border-radius: var(--border-radius);
                font-size: 0.875rem;
                color: var(--color-text-light);
            `;
        }
    }

    function initializeNavigation() {
        highlightCurrentPage();
        addSmoothScrolling();
    }

    function highlightCurrentPage() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav__link');

        navLinks.forEach(link => {
            link.classList.remove('nav__link--active');

            const linkHref = link.getAttribute('href');

            const currentUrl = new URL(currentPath, window.location.origin);
            const linkUrl = new URL(linkHref, window.location.origin);

            if (currentUrl.pathname === linkUrl.pathname) {
                link.classList.add('nav__link--active');
            }
        });
    }

    function addSmoothScrolling() {
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 0;

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');

                if (href.startsWith('#') && href.length > 1) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        const elementPosition = target.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }

    function initHeaderScroll() {
        let lastScrollTop = 0;
        const header = document.querySelector('.header');

        if (!header) return;

        const headerHeight = header.offsetHeight;

        window.addEventListener('scroll', function () {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop > lastScrollTop && scrollTop > headerHeight) {
                header.classList.add('header--hidden');
            } else {
                header.classList.remove('header--hidden');
            }

            lastScrollTop = scrollTop;
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        executeEventHandlers('DOMContentLoaded');
        initHeaderScroll();
    });

    window.addEventListener('load', function () {
        executeEventHandlers('load');
    });

    window.addLoadHandler = function (handler) {
        addEventListener('load', handler);
    };

    window.addDOMContentLoadedHandler = function (handler) {
        addEventListener('DOMContentLoaded', handler);
    };

})();