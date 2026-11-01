/* =========================================================
   PROJECT DETAIL PAGE ENGINE (projects.js)
========================================================== */
document.addEventListener('DOMContentLoaded', () => {

    /* -----------------------------------------------------
        1. DYNAMIC BACK BUTTON HASH ASSIGNMENT
    ----------------------------------------------------- */
    const backBtn = document.querySelector('.back-button, .nav-back, .back-link');
    if (backBtn) {
        const currentFilename = window.location.pathname.split('/').pop();
        const projectSlug = currentFilename ? currentFilename.replace('.html', '') : '';

        if (projectSlug && projectSlug !== 'index') {
            backBtn.setAttribute('href', `../index.html#${projectSlug}`);
        }
    }

    /* -----------------------------------------------------
        2. SWIPER CAROUSEL INITIALIZATION
    ----------------------------------------------------- */
    const swiperEl = document.querySelector('.mySwiper');

    if (swiperEl && typeof Swiper !== 'undefined') {
        new Swiper('.mySwiper', {
            loop: true,
            grabCursor: true,
            spaceBetween: 24,
            slidesPerView: 1,

            // Transition effect (choose 'fade' or remove for default slide)
            effect: 'fade',
            fadeEffect: {
                crossFade: true,
            },
            speed: 200,

            // Continuous Autoplay
            autoplay: {
                delay: 2000,
                disableOnInteraction: true, // Keeps playing after manual clicks/swipes
                stopOnLastSlide: false,      // Guarantees it loops indefinitely
            },

            // Auto-recalculate if images or container change
            observer: true,
            observeParents: true,

            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });
    }

});