(function initPosterGallery() {
    const wrapper = document.querySelector('.poster-track-wrapper');
    const leftPaddle = document.querySelector('.poster-paddle-left');
    const rightPaddle = document.querySelector('.poster-paddle-right');

    if (!wrapper) return;

    const cards = Array.from(wrapper.querySelectorAll('.poster-card'));
    const posterImages = cards.map(card => card.querySelector('img').src);

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

    wrapper.addEventListener('scroll', updatePaddles, { passive: true });
    window.addEventListener('resize', updatePaddles);
    updatePaddles();

    // ==========================================
    // LIGHTBOX FUNCTIONS
    // ==========================================
    const lightbox = document.querySelector('.poster-lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeBtn = lightbox?.querySelector('.lightbox-close');
    const prevBtn = lightbox?.querySelector('.lightbox-prev');
    const nextBtn = lightbox?.querySelector('.lightbox-next');
    let currentIndex = 0;

    function openLightbox(index) {
        if (!lightbox || !lightboxImg) return;
        currentIndex = index;
        lightboxImg.src = posterImages[currentIndex];
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    function changeLightboxImage(direction) {
        if (!lightboxImg) return;
        currentIndex = (currentIndex + direction + posterImages.length) % posterImages.length;
        lightboxImg.src = posterImages[currentIndex];
    }

    cards.forEach((card, index) => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            if (!hasDragged) {
                openLightbox(index);
            }
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); changeLightboxImage(-1); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); changeLightboxImage(1); });

    window.addEventListener('keydown', (e) => {
        if (!lightbox?.classList.contains('is-open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') changeLightboxImage(-1);
        if (e.key === 'ArrowRight') changeLightboxImage(1);
    });
})();

// =========================================================
// LIGHTBOX SWIPE & CLICK-TO-CLOSE SUPPORT
// =========================================================
const lightbox = document.querySelector('.poster-lightbox');
const lightboxContent = document.querySelector('.lightbox-content');

let touchStartX = 0;
let touchEndX = 0;
let isMultiTouch = false;

if (lightbox) {
    lightbox.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
            isMultiTouch = true;
        } else {
            isMultiTouch = false;
            touchStartX = e.changedTouches[0].screenX;
        }
    }, { passive: true });

    lightbox.addEventListener('touchmove', (e) => {
        if (e.touches.length > 1) {
            isMultiTouch = true;
        }
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        if (isMultiTouch) return;
        touchEndX = e.changedTouches[0].screenX;
        
        const swipeThreshold = 50;
        const diff = touchEndX - touchStartX;

        if (Math.abs(diff) < swipeThreshold) return;

        if (diff < 0) {
            const nextBtn = document.querySelector('.lightbox-next');
            if (nextBtn) nextBtn.click();
        } else {
            const prevBtn = document.querySelector('.lightbox-prev');
            if (prevBtn) prevBtn.click();
        }
    }, { passive: true });
}

if (lightboxContent) {
    lightboxContent.addEventListener('click', (e) => {
        if (e.target === lightboxContent) {
            const closeBtn = document.querySelector('.lightbox-close');
            if (closeBtn) closeBtn.click();
        }
    });
}