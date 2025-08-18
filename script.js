document.addEventListener('DOMContentLoaded', function () {
    var headerEl = document.querySelector('header');
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');
    function setExpanded() {
        if (toggle && headerEl) {
            toggle.setAttribute('aria-expanded', headerEl.classList.contains('nav-open') ? 'true' : 'false');
        }
    }
    if (toggle && headerEl) {
        toggle.addEventListener('click', function () {
            headerEl.classList.toggle('nav-open');
            setExpanded();
            if (toggle.getAttribute('aria-expanded') === 'true') {
                toggle.setAttribute('aria-label', 'Close navigation');
            } else {
                toggle.setAttribute('aria-label', 'Open navigation');
            }
        });
        setExpanded();
        toggle.setAttribute('aria-label', 'Open navigation');
    }

    // Mark active nav link
    var current = window.location.pathname.split('/').pop() || 'index.html';
    var links = document.querySelectorAll('nav a');
    links.forEach(function (link) {
        var href = link.getAttribute('href');
        if (href === current) {
            link.classList.add('active');
        }
    });

    if (nav) {
        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                if (headerEl && headerEl.classList.contains('nav-open')) {
                    headerEl.classList.remove('nav-open');
                    setExpanded();
                }
            });
        });
    }

    // Smooth scroll for on-page anchors
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            var targetId = a.getAttribute('href').slice(1);
            var target = document.getElementById(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

console.log("NGO website loaded successfully.");
