/* =============================================================
   Responsible Individuals - Front-end Behaviours
   - Navigation + accessibility helpers
   - GitHub-powered gallery hydration
   - Lightbox + reveal animations
   ============================================================= */

const ResponsibleIndividuals = (() => {
    const githubConfig = {
        owner: 'ImpashreeShetty',
        repo: 'responsible-individuals-website',
        branch: 'main',
        folders: {
            launch: 'Launchphotos',
            office: 'Photos/Office',
            ground: 'Photos/Groundvisit'
        }
    };

    const DATA_ENDPOINTS = {
        projects: 'projects-data.json'
    };

    const THEME_STORAGE_KEY = 'ri-theme';
    const FONT_STORAGE_KEY = 'ri-font-scale';
    const LANGUAGE_STORAGE_KEY = 'ri-language';

    const state = {
        header: null,
        navToggle: null,
        lightbox: null,
        lightboxImage: null
    };

    /* -------------------- Navigation -------------------- */
    function initNavigation() {
        state.header = document.querySelector('.site-header') || document.querySelector('header');
        if (!state.header) return;

        state.navToggle = state.header.querySelector('.nav-toggle');
        const siteNav = document.getElementById('site-nav');
        if (!state.navToggle || !siteNav) return;

        const setExpanded = (expanded) => state.navToggle.setAttribute('aria-expanded', String(expanded));

        state.navToggle.addEventListener('click', () => {
            const isOpen = state.header.classList.toggle('nav-open');
            setExpanded(isOpen);
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 960 && state.header.classList.contains('nav-open')) {
                state.header.classList.remove('nav-open');
                setExpanded(false);
            }
        });
    }

    function highlightActiveNav() {
        const currentPage = document.body.dataset.page;
        if (!currentPage) return;

        const desiredPath = currentPage === 'home' ? 'index.html' : `${currentPage}.html`;
        document.querySelectorAll('#site-nav a[href]').forEach((link) => {
            if (link.getAttribute('href').endsWith(desiredPath)) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    /* -------------------- Gallery helpers -------------------- */
    async function fetchGitHubImages(folderPath) {
        const url = `https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/${encodeURIComponent(folderPath)}?ref=${githubConfig.branch}`;

        try {
            const response = await fetch(url, {
                headers: { Accept: 'application/vnd.github.v3+json' }
            });

            if (!response.ok) {
                throw new Error(`GitHub API ${response.status} for ${folderPath}`);
            }

            const items = await response.json();
            return items
                .filter((item) => item.type === 'file' && /\.(jpe?g|png|gif|webp)$/i.test(item.name))
                .filter((item) => !/^readme(\..+)?$/i.test(item.name))
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((item) => item.download_url);
        } catch (error) {
            console.warn('Error fetching images:', error);
            return [];
        }
    }

    function renderGallery(name, urls) {
        const container = document.querySelector(`.gallery[data-gallery="${name}"]`);
        if (!container || !urls.length) return;

        container.innerHTML = urls
            .map((url) => `
                <figure class="ri-tile">
                    <img src="${url}" alt="Gallery image" loading="lazy">
                </figure>
            `)
            .join('');
    }

    function setCoverImage(id, urls) {
        if (!urls.length) return;
        const image = document.getElementById(id);
        if (image) {
            image.src = urls[0];
            image.style.display = 'block';
        }
    }

    async function hydrateGalleries() {
        const galleryEls = document.querySelectorAll('[data-gallery]');
        if (!galleryEls.length) return; // Skip fetching when gallery widgets are absent.

        const [launch, office, ground] = await Promise.all([
            fetchGitHubImages(githubConfig.folders.launch),
            fetchGitHubImages(githubConfig.folders.office),
            fetchGitHubImages(githubConfig.folders.ground)
        ]);

        renderGallery('launch', launch);
        renderGallery('office', office);
        renderGallery('ground', ground);

        setCoverImage('cover-launch', launch);
        setCoverImage('cover-office', office);
        setCoverImage('cover-ground', ground);

        const banner = document.getElementById('recent-banner');
        if (banner && launch.length) {
            banner.src = launch[0];
            banner.style.display = 'block';
        }
    }

    async function hydrateProjectsContent() {
        const statsContainer = document.querySelector('[data-project-stats]');
        const portfolioContainer = document.querySelector('[data-project-portfolio]');
        if (!statsContainer && !portfolioContainer) return;

        try {
            const response = await fetch(DATA_ENDPOINTS.projects, { cache: 'no-cache' });
            if (!response.ok) {
                throw new Error(`Projects JSON ${response.status}`);
            }
            const payload = await response.json();

            if (statsContainer && Array.isArray(payload.stats)) {
                statsContainer.innerHTML = payload.stats.map((stat) => `
                    <article class="stat-card">
                        <span class="stat-card__value">${stat.value}</span>
                        <span class="stat-card__label">${stat.label}</span>
                    </article>
                `).join('');
            }

            if (portfolioContainer && Array.isArray(payload.portfolio)) {
                portfolioContainer.innerHTML = payload.portfolio.map((program) => `
                    <article class="content-card">
                        <h3>${program.title}</h3>
                        <p>${program.description}</p>
                        ${program.meta ? `<p class="story-card__meta">${program.meta}</p>` : ''}
                    </article>
                `).join('');
            }
        } catch (error) {
            console.warn('Unable to hydrate project content:', error);
            if (statsContainer && !statsContainer.innerHTML.trim()) {
                statsContainer.innerHTML = '<p class="muted">Project metrics are temporarily unavailable.</p>';
            }
            if (portfolioContainer && !portfolioContainer.innerHTML.trim()) {
                portfolioContainer.innerHTML = '<p class="muted">Project portfolio will load shortly.</p>';
            }
        }
    }

    function toggleGallerySection(id) {
        const section = document.getElementById(id);
        if (section) {
            section.classList.toggle('hidden');
        }
    }

    /* -------------------- Lightbox -------------------- */
    function initLightbox() {
        state.lightbox = document.getElementById('ri-lightbox');
        if (!state.lightbox) return;

        state.lightboxImage = state.lightbox.querySelector('.lb-img');
        const closeButton = state.lightbox.querySelector('.lb-close');

        if (closeButton) {
            closeButton.addEventListener('click', () => state.lightbox.close());
        }

        state.lightbox.addEventListener('click', (event) => {
            const rect = state.lightboxImage.getBoundingClientRect();
            const outsideImage =
                event.clientX < rect.left ||
                event.clientX > rect.right ||
                event.clientY < rect.top ||
                event.clientY > rect.bottom;

            if (outsideImage) {
                state.lightbox.close();
            }
        });
    }

    /* -------------------- Progressive enhancements -------------------- */
    function initRevealObserver() {
        const revealEls = document.querySelectorAll('.reveal');
        if (!('IntersectionObserver' in window) || !revealEls.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        }, { threshold: 0.18, rootMargin: '0px 0px -80px 0px' });

        revealEls.forEach((el) => observer.observe(el));
    }

    function enhanceForms() {
        document.querySelectorAll('input[type="text"]').forEach((input) => {
            const name = (input.name || input.id || '').toLowerCase();
            const placeholder = (input.placeholder || '').toLowerCase();

            if (name.includes('email') || placeholder.includes('email')) {
                input.type = 'email';
            } else if (name.includes('phone') || name.includes('tel') || placeholder.includes('phone')) {
                input.type = 'tel';
            } else if (name.includes('url') || name.includes('website')) {
                input.type = 'url';
            }
        });
    }

    function setViewportUnit() {
        const setVh = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        setVh();
        window.addEventListener('resize', setVh);
        window.addEventListener('orientationchange', () => setTimeout(setVh, 120));
    }

    function handleDocumentClick(event) {
        if (state.header && state.navToggle) {
            if (!state.header.contains(event.target)) {
                state.header.classList.remove('nav-open');
                state.navToggle.setAttribute('aria-expanded', 'false');
            }
        }

        if (state.lightbox) {
            const targetImage = event.target.closest('.gallery img');
            if (targetImage) {
                state.lightboxImage.src = targetImage.dataset.full || targetImage.src;
                state.lightboxImage.alt = targetImage.alt || 'Gallery image';
                state.lightbox.showModal();
            }
        }
    }

    function handleGlobalKeydown(event) {
        if (event.key !== 'Escape') return;

        if (state.header && state.header.classList.contains('nav-open')) {
            state.header.classList.remove('nav-open');
            state.navToggle?.setAttribute('aria-expanded', 'false');
        }

        if (state.lightbox?.open) {
            state.lightbox.close();
        }
    }

    /* -------------------- Init -------------------- */
    function init() {
        highlightActiveNav();
        initNavigation();
        hydrateGalleries();
        hydrateProjectsContent();
        initLightbox();
        initRevealObserver();
        enhanceForms();
        setViewportUnit();
        initThemeToggle();
        initFontControls();
        initLanguageSwitcher();
        initDonationButtons();
        document.addEventListener('click', handleDocumentClick);
        document.addEventListener('keydown', handleGlobalKeydown);
    }

    function initThemeToggle() {
        const toggles = document.querySelectorAll('.theme-toggle');
        if (!toggles.length) return;

        const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');

        setTheme(initialTheme);

        toggles.forEach((toggle) => {
            toggle.addEventListener('click', () => {
                const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
                setTheme(nextTheme);
                localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
            });
        });

        function setTheme(theme) {
            document.body.dataset.theme = theme;
            toggles.forEach((toggle) => {
                toggle.setAttribute('aria-pressed', String(theme === 'dark'));
                const icon = toggle.querySelector('.theme-toggle__icon');
                if (icon) {
                    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
                }
                toggle.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
            });
        }
    }

    function initFontControls() {
        const buttons = document.querySelectorAll('.font-btn');
        if (!buttons.length) return;

        let currentScale = parseFloat(localStorage.getItem(FONT_STORAGE_KEY)) || 1;
        applyFontScale(currentScale);

        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                const direction = button.dataset.font === 'increase' ? 0.05 : -0.05;
                currentScale = Math.min(1.2, Math.max(0.9, parseFloat((currentScale + direction).toFixed(2))));
                applyFontScale(currentScale);
                localStorage.setItem(FONT_STORAGE_KEY, String(currentScale));
            });
        });

        function applyFontScale(scale) {
            document.documentElement.style.setProperty('--font-scale', scale);
        }
    }

    function initLanguageSwitcher() {
        const select = document.getElementById('language-select');
        if (!select) return;

        const toast = document.getElementById('language-toast');
        const langLabels = { en: 'English', hi: 'हिन्दी' };
        const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en';

        select.value = storedLanguage;
        setLanguage(storedLanguage);

        select.addEventListener('change', () => {
            const value = select.value;
            setLanguage(value);
            localStorage.setItem(LANGUAGE_STORAGE_KEY, value);
            if (toast) {
                toast.textContent = `Language preference set to ${langLabels[value] || value}.`;
            }
        });

        function setLanguage(value) {
            document.documentElement.lang = value;
        }

        if (toast) {
            toast.textContent = '';
        }
    }

    function initDonationButtons() {
        const groups = document.querySelectorAll('[data-donation-select]');
        if (!groups.length) return;
        const status = document.getElementById('donation-selection');

        groups.forEach((group) => {
            group.querySelectorAll('button[data-amount]').forEach((button) => {
                button.setAttribute('aria-pressed', 'false');

                button.addEventListener('click', () => {
                    group.querySelectorAll('button').forEach((peer) => peer.setAttribute('aria-pressed', 'false'));
                    button.setAttribute('aria-pressed', 'true');
                    if (status) {
                        status.textContent = `Thank you! You selected ₹${button.dataset.amount} as a quick pledge.`;
                    }
                });
            });
        });
    }

    return {
        init,
        toggleGallerySection
    };
})();


document.addEventListener('DOMContentLoaded', ResponsibleIndividuals.init);
window.toggleGallery = ResponsibleIndividuals.toggleGallerySection;
