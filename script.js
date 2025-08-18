document.addEventListener('DOMContentLoaded', function () {
    var headerEl = document.querySelector('header');
    var toggle = document.querySelector('.nav-toggle');
    if (toggle && headerEl) {
        toggle.addEventListener('click', function () {
            headerEl.classList.toggle('nav-open');
        });
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
