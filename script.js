// ===== MOBILE NAVIGATION TOGGLE =====
(function() {
    const header = document.querySelector('header');
    const navToggle = header.querySelector('.nav-toggle');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            const isOpen = header.classList.toggle('nav-open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!header.contains(e.target)) {
                header.classList.remove('nav-open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && header.classList.contains('nav-open')) {
                header.classList.remove('nav-open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
})();

// ===== GITHUB GALLERY CONFIGURATION =====
const GITHUB_CONFIG = {
    owner: "ImpashreeShetty",
    repo: "responsible-individuals-website",
    branch: "main",
    folders: {
        launch: "Launchphotos",
        office: "Photos/Office",
        ground: "Photos/Groundvisit"
    }
};

// ===== GITHUB API FUNCTIONS =====
async function fetchGitHubImages(folderPath) {
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${encodeURIComponent(folderPath)}?ref=${encodeURIComponent(GITHUB_CONFIG.branch)}`;
    
    try {
        const response = await fetch(url, {
            headers: { 'Accept': 'application/vnd.github.v3+json' }
        });

        if (!response.ok) {
            throw new Error(`GitHub API ${response.status} for ${folderPath}`);
        }

        const items = await response.json();

        return items
            .filter(item => item.type === 'file' && /\.(jpe?g|png|webp|gif)$/i.test(item.name))
            .filter(item => !/^readme(\..+)?$/i.test(item.name))
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(item => item.download_url);
    } catch (error) {
        console.warn('Error fetching images:', error);
        return [];
    }
}

function renderGallery(galleryName, imageUrls) {
    const galleryElement = document.querySelector(`.gallery[data-gallery="${galleryName}"]`);
    if (!galleryElement || !imageUrls.length) return;

    galleryElement.innerHTML = imageUrls.map(src => `
        <figure class="ri-tile">
            <img src="${src}" alt="Gallery image" loading="lazy">
        </figure>
    `).join('');
}

function setCoverImage(imageId, imageUrls) {
    const imageElement = document.getElementById(imageId);
    if (imageElement && imageUrls && imageUrls.length) {
        imageElement.src = imageUrls[0];
        imageElement.style.display = 'block';
    }
}

// ===== GALLERY INITIALIZATION =====
async function initializeGallery() {
    try {
        const [launchImages, officeImages, groundImages] = await Promise.all([
            fetchGitHubImages(GITHUB_CONFIG.folders.launch),
            fetchGitHubImages(GITHUB_CONFIG.folders.office),
            fetchGitHubImages(GITHUB_CONFIG.folders.ground)
        ]);

        // Render galleries
        renderGallery('launch', launchImages);
        renderGallery('office', officeImages);
        renderGallery('ground', groundImages);

        // Set cover images
        setCoverImage('cover-launch', launchImages);
        setCoverImage('cover-office', officeImages);
        setCoverImage('cover-ground', groundImages);

        // Set news banner
        const newsBanner = document.getElementById('recent-banner');
        if (newsBanner && launchImages.length) {
            newsBanner.src = launchImages[0];
            newsBanner.style.display = 'block';
        }

    } catch (error) {
        console.warn('Gallery initialization failed:', error);
        
        // Show fallback message in galleries
        document.querySelectorAll('.gallery').forEach(gallery => {
            gallery.innerHTML = `
                <div class="card" style="border-style: dashed; padding: 20px; text-align: center;">
                    <p>Images are temporarily unavailable. Please refresh the page or try again later.</p>
                </div>
            `;
        });
    }
}

// ===== GALLERY TOGGLE FUNCTION =====
function toggleGallery(galleryId) {
    const gallery = document.getElementById(galleryId);
    if (gallery) {
        gallery.classList.toggle('hidden');
    } else {
        console.error("Gallery not found:", galleryId);
    }
}

// ===== LIGHTBOX FUNCTIONALITY =====
function initializeLightbox() {
    const lightbox = document.getElementById('ri-lightbox');
    if (!lightbox) return;

    const lightboxImage = lightbox.querySelector('.lb-img');
    const closeButton = lightbox.querySelector('.lb-close');

    // Open lightbox when clicking gallery images
    document.addEventListener('click', function(e) {
        const clickedImage = e.target.closest('.gallery img');
        if (!clickedImage) return;

        lightboxImage.src = clickedImage.dataset.full || clickedImage.src;
        lightboxImage.alt = clickedImage.alt || "Gallery image";
        lightbox.showModal();
    });

    // Close lightbox
    if (closeButton) {
        closeButton.addEventListener('click', () => lightbox.close());
    }

    // Close when clicking outside image
    lightbox.addEventListener('click', function(e) {
        const imageRect = lightboxImage.getBoundingClientRect();
        const clickedOutside = e.clientY < imageRect.top || 
                              e.clientY > imageRect.bottom || 
                              e.clientX < imageRect.left || 
                              e.clientX > imageRect.right;
        
        if (clickedOutside) {
            lightbox.close();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.open) {
            lightbox.close();
        }
    });
}

// ===== SCROLL REVEAL ANIMATION =====
function initializeScrollReveal() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, observerOptions);

    // Observe elements with reveal class
    document.querySelectorAll('.reveal').forEach(function(element) {
        observer.observe(element);
    });
}

// ===== SMOOTH SCROLLING FOR ANCHOR LINKS =====
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== FORM ENHANCEMENTS =====
function enhanceForms() {
    // Add proper input types for better mobile keyboards
    document.querySelectorAll('input[type="text"]').forEach(function(input) {
        const name = input.name || input.id || '';
        const placeholder = input.placeholder || '';
        const lowerName = name.toLowerCase();
        const lowerPlaceholder = placeholder.toLowerCase();

        // Email detection
        if (lowerName.includes('email') || lowerPlaceholder.includes('email')) {
            input.type = 'email';
        }
        // Phone detection
        else if (lowerName.includes('phone') || lowerName.includes('tel') || lowerPlaceholder.includes('phone')) {
            input.type = 'tel';
        }
        // URL detection
        else if (lowerName.includes('url') || lowerName.includes('website')) {
            input.type = 'url';
        }
    });
}

// ===== VIEWPORT HEIGHT FIX FOR MOBILE =====
function initializeViewportFix() {
    function setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', vh + 'px');
    }
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', function() {
        setTimeout(setViewportHeight, 100);
    });
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initializeGallery();
    initializeLightbox();
    initializeScrollReveal();
    initializeSmoothScrolling();
    enhanceForms();
    initializeViewportFix();
    
    // Add loaded class for CSS animations
    document.documentElement.classList.add('js-loaded');
    
    // Set current year in footer if element exists
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// ===== GLOBAL FUNCTION FOR GALLERY TOGGLE =====
// This function is used by the gallery.html onclick attributes
window.toggleGallery = toggleGallery;
