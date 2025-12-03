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
    const INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/responsibleindividuals/';
    const INSTAGRAM_FEED_ENDPOINT = '/.netlify/functions/instagram-feed';
    const FALLBACK_INSTAGRAM_POSTS = [
        {
            id: 'sample-1',
            caption: 'Learning circle as part of our Responsible Individuals launch week.',
            mediaUrl: 'https://cdn.jsdelivr.net/gh/ImpashreeShetty/responsible-individuals-website@main/Launchphotos/IMG_2760.jpeg',
            permalink: INSTAGRAM_PROFILE_URL,
            timestamp: '2025-07-19T10:00:00+05:30'
        },
        {
            id: 'sample-2',
            caption: 'WASH demo with volunteers and teachers at GHPS Bachenahatti.',
            mediaUrl: 'https://cdn.jsdelivr.net/gh/ImpashreeShetty/responsible-individuals-website@main/Launchphotos/IMG_2758.jpeg',
            permalink: INSTAGRAM_PROFILE_URL,
            timestamp: '2025-08-05T09:00:00+05:30'
        },
        {
            id: 'sample-3',
            caption: 'STEM lab restock underway thanks to our community donors.',
            mediaUrl: 'https://cdn.jsdelivr.net/gh/ImpashreeShetty/responsible-individuals-website@main/Launchphotos/IMG_2764.jpeg',
            permalink: INSTAGRAM_PROFILE_URL,
            timestamp: '2025-08-22T14:30:00+05:30'
        }
    ];

    const THEME_STORAGE_KEY = 'ri-theme';
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

    const escapeHtml = (value = '') => value
        .toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

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

    async function hydrateInstagramFeed() {
        const container = document.querySelector('[data-instagram-feed]');
        if (!container) return;

        const limit = Number(container.dataset.instagramLimit) || 4;
        const renderFallback = () => renderInstagramPosts(getFallbackInstagramPosts(limit), container);

        try {
            const response = await fetch(`${INSTAGRAM_FEED_ENDPOINT}?limit=${limit}`, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`Instagram feed HTTP ${response.status}`);
            }

            const posts = await response.json();
            if (!Array.isArray(posts) || !posts.length) {
                renderFallback();
                return;
            }

            renderInstagramPosts(posts.slice(0, limit), container);
        } catch (error) {
            console.warn('Unable to load Instagram feed:', error);
            renderFallback();
        }
    }

    function renderInstagramPosts(posts, container) {
        const normalized = posts
            .map((post) => normaliseInstagramPost(post))
            .filter((post) => post.mediaUrl);

        if (!normalized.length) {
            container.innerHTML = '<p class="muted">Instagram updates are temporarily unavailable.</p>';
            return;
        }

        container.innerHTML = normalized.map((post) => renderInstagramCard(post)).join('');
    }

    const renderInstagramCard = (post) => {
        const caption = typeof post.caption === 'string' ? post.caption.trim() : '';
        const trimmedCaption = caption.length > 120 ? `${caption.slice(0, 117)}…` : caption;
        const fallbackAlt = 'Instagram post from Responsible Individuals';
        const safeCaption = escapeHtml(trimmedCaption || 'View post on Instagram');
        const permalink = typeof post.permalink === 'string' && post.permalink.startsWith('http')
            ? post.permalink
            : INSTAGRAM_PROFILE_URL;
        const mediaUrl = typeof post.mediaUrl === 'string' && post.mediaUrl.startsWith('http')
            ? post.mediaUrl
            : '';
        const timestamp = typeof post.timestamp === 'string' ? post.timestamp : '';
        const formattedDate = formatInstagramDate(timestamp);

        return `
            <article class="instagram-card">
                <a class="instagram-card__image" href="${permalink}" target="_blank" rel="noreferrer noopener" aria-label="Open Instagram post">
                    ${mediaUrl ? `<img src="${mediaUrl}" alt="${escapeHtml(trimmedCaption || fallbackAlt)}" loading="lazy">` : ''}
                </a>
                <div class="instagram-card__body">
                    <p class="instagram-card__caption">${safeCaption}</p>
                    <div class="instagram-card__meta">
                        ${formattedDate ? `<span>${formattedDate}</span>` : ''}
                        <a href="${permalink}" target="_blank" rel="noreferrer noopener">View post</a>
                    </div>
                </div>
            </article>
        `;
    };

    function normaliseInstagramPost(post = {}) {
        const fallbackId = `instagram-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        return {
            id: post.id || fallbackId,
            caption: typeof post.caption === 'string' ? post.caption : '',
            mediaUrl: typeof post.mediaUrl === 'string'
                ? post.mediaUrl
                : (typeof post.media_url === 'string' ? post.media_url : (typeof post.thumbnail_url === 'string' ? post.thumbnail_url : '')),
            permalink: typeof post.permalink === 'string' ? post.permalink : INSTAGRAM_PROFILE_URL,
            timestamp: typeof post.timestamp === 'string' ? post.timestamp : ''
        };
    }

    function getFallbackInstagramPosts(limit) {
        return FALLBACK_INSTAGRAM_POSTS.slice(0, Math.max(1, limit));
    }

    function formatInstagramDate(value) {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return '';
        }
        try {
            return new Intl.DateTimeFormat(document.documentElement.lang || 'en', {
                month: 'short',
                day: 'numeric'
            }).format(date);
        } catch (error) {
            console.warn('Intl formatting issue:', error);
        }
        return date.toLocaleDateString();
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
        hydrateInstagramFeed();
        initLightbox();
        initRevealObserver();
        enhanceForms();
        setViewportUnit();
        initThemeToggle();
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

    function initLanguageSwitcher() {
        const select = document.getElementById('language-select');
        const buttons = document.querySelectorAll('.language-toggle');
        if (!select && !buttons.length) return;

        const toast = document.getElementById('language-toast');
        const langLabels = { en: 'English', hi: 'हिन्दी' };
        const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en';

        applyLanguage(storedLanguage, { quiet: true });

        if (select) {
            select.value = storedLanguage;
            select.addEventListener('change', () => {
                applyLanguage(select.value);
            });
        }

        if (buttons.length) {
            buttons.forEach((button) => {
                updateLanguageButton(button, storedLanguage);
                button.addEventListener('click', () => {
                    const next = document.documentElement.lang === 'en' ? 'hi' : 'en';
                    applyLanguage(next);
                });
            });
        }

        function applyLanguage(value, options = {}) {
            const lang = value === 'hi' ? 'hi' : 'en';
            document.documentElement.lang = lang;
            localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
            if (select) {
                select.value = lang;
            }
            buttons.forEach((button) => updateLanguageButton(button, lang));
            if (toast) {
                toast.textContent = options.quiet ? '' : `Language preference set to ${langLabels[lang] || lang}.`;
            }
        }

        function updateLanguageButton(button, currentLang) {
            const nextLang = currentLang === 'en' ? 'hi' : 'en';
            button.setAttribute('aria-label', `Switch language to ${langLabels[nextLang] || nextLang}`);
            const icon = button.querySelector('.language-toggle__icon');
            if (icon) {
                icon.textContent = currentLang === 'en' ? '🌐' : 'अ';
            }
        }
    }

    function initDonationButtons() {
        const groups = document.querySelectorAll('[data-donation-select]');
        if (!groups.length) return;

        groups.forEach((group) => {
            const status = group.parentElement.querySelector('[data-donation-output]');

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
