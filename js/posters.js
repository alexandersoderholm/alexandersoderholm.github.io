import PhotoSwipeLightbox from 'https://cdnjs.cloudflare.com/ajax/libs/photoswipe/5.4.2/photoswipe-lightbox.esm.min.js';

/* =========================================================
   1. POSTER GALLERY (TRACK DRAG & PADDLES)
========================================================== */
(function initPosterGallery() {
    const wrapper = document.querySelector('.poster-track-wrapper');
    const leftPaddle = document.querySelector('.poster-paddle-left');
    const rightPaddle = document.querySelector('.poster-paddle-right');

    if (!wrapper) return;

    const cards = Array.from(wrapper.querySelectorAll('.poster-card'));

    wrapper.querySelectorAll('img, a').forEach(el => {
        el.setAttribute('draggable', 'false');
        el.addEventListener('dragstart', (e) => e.preventDefault());
    });

    function updatePaddles() {
        if (!leftPaddle || !rightPaddle) return;
        const tolerance = 15;
        const isAtStart = wrapper.scrollLeft <= tolerance;
        const isAtEnd = wrapper.scrollLeft + wrapper.clientWidth >= wrapper.scrollWidth - tolerance;

        leftPaddle.classList.toggle('is-hidden', isAtStart);
        rightPaddle.classList.toggle('is-hidden', isAtEnd);
    }

    function scrollGallery(direction) {
        if (!cards.length) return;
        let activeIndex = 0;
        let minDistance = Infinity;

        cards.forEach((card, index) => {
            const distance = Math.abs(card.offsetLeft - cards[0].offsetLeft - wrapper.scrollLeft);
            if (distance < minDistance) {
                minDistance = distance;
                activeIndex = index;
            }
        });

        const targetIndex = Math.max(0, Math.min(cards.length - 1, activeIndex + direction));
        const targetScroll = cards[targetIndex].offsetLeft - cards[0].offsetLeft;

        wrapper.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }

    if (leftPaddle) leftPaddle.addEventListener('click', () => scrollGallery(-1));
    if (rightPaddle) rightPaddle.addEventListener('click', () => scrollGallery(1));

    // Dragging logic
    let isDown = false;
    let hasDragged = false;
    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;

    wrapper.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        isDown = true;
        hasDragged = false;
        startX = e.clientX;
        startY = e.clientY;
        scrollLeft = wrapper.scrollLeft;
        wrapper.classList.add('is-dragging');
    });

    window.addEventListener('mouseup', () => {
        if (!isDown) return;
        isDown = false;
        wrapper.classList.remove('is-dragging');
    });

    window.addEventListener('mouseleave', () => {
        if (!isDown) return;
        isDown = false;
        wrapper.classList.remove('is-dragging');
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        const xWalk = Math.abs(e.clientX - startX);
        const yWalk = Math.abs(e.clientY - startY);

        if (xWalk > 5 || yWalk > 5) {
            hasDragged = true;
        }

        if (hasDragged) {
            const walk = (e.clientX - startX) * 1.5;
            wrapper.scrollLeft = scrollLeft - walk;
            updatePaddles();
        }
    });

    // Suppress PhotoSwipe opening if the user was dragging the track
    wrapper.addEventListener('click', (e) => {
        if (hasDragged) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);

    wrapper.addEventListener('scroll', updatePaddles, { passive: true });
    window.addEventListener('resize', updatePaddles);
    updatePaddles();
})();

/* =========================================================
   2. PHOTOSWIPE LIGHTBOX INITIALIZATION
========================================================== */
const lightbox = new PhotoSwipeLightbox({
    gallery: '.poster-track',
    children: 'a.poster-card',
    pswpModule: () => import('https://cdnjs.cloudflare.com/ajax/libs/photoswipe/5.4.2/photoswipe.esm.min.js'),

    /* Dynamic margins (padding around the image) */
    paddingFn: (viewportSize) => {
        if (viewportSize.x < 768) {
            return { top: 32, bottom: 32, left: 16, right: 16 };
        }
        return { top: 60, bottom: 60, left: 80, right: 80 };
    },

    /* Animation & Background setup */
    showAnimationDuration: 300,
    hideAnimationDuration: 250,
    bgOpacity: 1,

    /* Custom SVGs */
    closeSVG: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    zoomSVG: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="6.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 16l4.5 4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arrowPrevSVG: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arrowNextSVG: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
});

lightbox.init();
