/* =========================================================
   0. GLOBAL SCROLL RESTORATION CONTROL
========================================================== */
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

/* =========================================================
   1. DEVICE & ENVIRONMENT HELPERS
========================================================== */
function isMobile() {
    return window.innerHeight > window.innerWidth;
}

/* =========================================================
   2. INTRO — SKIP-INTRO & THEME-COLOR LOGIC
========================================================== */
const themeMeta = document.getElementById('theme-color');
const introEl = document.getElementById('intro');

function setThemeColor(color) {
    if (themeMeta) {
        themeMeta.setAttribute('content', color);
    }
}

if (window.location.hash || sessionStorage.getItem('introPlayed')) {
    document.body.classList.add('skip-intro');
    setThemeColor('#ffffff');
    if (!sessionStorage.getItem('introPlayed')) {
        sessionStorage.setItem('introPlayed', 'true');
    }
} else {
    document.body.classList.remove('skip-intro');
    sessionStorage.setItem('introPlayed', 'true');

    if (introEl) {
        introEl.addEventListener('animationend', (e) => {
            if (e.animationName === 'fadeOut') {
                setThemeColor('#ffffff');
            }
        });
    }
}

/* =========================================================
   3. HERO 1 (UNBOUNDED INFINITE ENGINE)
========================================================== */
(function initHeroEngine() {
    const hero = document.querySelector('.hero');
    const track = document.querySelector('.hero-track');

    if (!hero || !track) return;

    let focusMode = false;
    let virtualX = 0;              
    let velocity = 0;              
    let autoPanSpeed = -0.6;
    let singleTileWidth = 0;

    let isPointerDown = false;
    let isDragging = false;
    let pointerId = null;
    let lastClientX = 0;
    let lastTime = 0;

    function updateDimensions() {
        singleTileWidth = track.scrollWidth / 3;
    }
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('load', updateDimensions);

    function activateFocusMode() {
        if (!focusMode) {
            focusMode = true;
            hero.classList.add('focus-mode');
        }
    }

    function deactivateFocusMode() {
        if (focusMode) {
            focusMode = false;
            hero.classList.remove('focus-mode');
        }
    }

    function getWrappedOffset(x, tileWidth) {
        if (tileWidth <= 0) return 0;
        const mod = ((x % tileWidth) + tileWidth) % tileWidth;
        return -mod - tileWidth;
    }

    function renderLoop() {
        if (!isPointerDown) {
            if (focusMode) {
                if (Math.abs(velocity) > 0.05) {
                    virtualX += velocity;
                    velocity *= 0.94;
                } else {
                    velocity = 0;
                }
            } else {
                virtualX -= autoPanSpeed;
            }
        }

        if (singleTileWidth > 0) {
            const renderX = getWrappedOffset(virtualX, singleTileWidth);
            track.style.transform = `translate3d(${renderX}px, 0, 0)`;
        }

        requestAnimationFrame(renderLoop);
    }
    requestAnimationFrame(renderLoop);

    hero.addEventListener('wheel', (e) => {
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
        if (delta !== 0) {
            e.preventDefault();
            activateFocusMode();
            virtualX += delta; 
            velocity = delta * 0.5; 
        }
    }, { passive: false });

    function onPointerDown(e) {
        if (e.button && e.button !== 0) return;

        isPointerDown = true;
        isDragging = false;
        pointerId = e.pointerId;
        lastClientX = e.clientX;
        lastTime = performance.now();
        velocity = 0;

        activateFocusMode();
    }

    function onPointerMove(e) {
        if (!isPointerDown || e.pointerId !== pointerId) return;

        const now = performance.now();
        const deltaX = e.clientX - lastClientX;
        const deltaTime = Math.max(now - lastTime, 1);

        if (Math.abs(deltaX) > 2 || isDragging) {
            if (!isDragging) {
                isDragging = true;
                hero.classList.add('is-dragging');
                if (hero.setPointerCapture) {
                    try { hero.setPointerCapture(pointerId); } catch (_) {}
                }
            }

            virtualX -= deltaX;
            velocity = -(deltaX / deltaTime) * 16;

            lastClientX = e.clientX;
            lastTime = now;
        }
    }

    function onPointerUp(e) {
        if (!isPointerDown || e.pointerId !== pointerId) return;

        isPointerDown = false;

        if (hero.releasePointerCapture && hero.hasPointerCapture && hero.hasPointerCapture(e.pointerId)) {
            try { hero.releasePointerCapture(e.pointerId); } catch (_) {}
        }

        if (isDragging) {
            hero.classList.remove('is-dragging');
        }
    }

    hero.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    hero.addEventListener('touchstart', () => {
        activateFocusMode();
    }, { passive: true });

    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            document.body.classList.add('scrolled');
            deactivateFocusMode();
        } else {
            document.body.classList.remove('scrolled');
        }
        
        if (window.scrollY > 20) {
            document.body.classList.add('is-scrolled');
        } else {
            document.body.classList.remove('is-scrolled');
        }
    }, { passive: true });
})();

/* =========================================================
   4. PROJECT GALLERY & SCROLL POSITION CONTROL
========================================================== */
(function initNativeGallery() {
    const wrapper = document.querySelector('.projects-track-wrapper');
    const leftPaddle = document.querySelector('.projects-paddle-left');
    const rightPaddle = document.querySelector('.projects-paddle-right');

    if (!wrapper) return;

    const cards = Array.from(wrapper.querySelectorAll('.project-card, .project-square'));

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

        let currentIndex = 0;
        let minDistance = Infinity;

        cards.forEach((card, index) => {
            const distance = Math.abs(card.offsetLeft - cards[0].offsetLeft - wrapper.scrollLeft);
            if (distance < minDistance) {
                minDistance = distance;
                currentIndex = index;
            }
        });

        const targetIndex = Math.max(0, Math.min(cards.length - 1, currentIndex + direction));
        const targetScroll = cards[targetIndex].offsetLeft - cards[0].offsetLeft;

        wrapper.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
    }

    if (leftPaddle) {
        leftPaddle.addEventListener('click', () => scrollGallery(-1));
    }
    if (rightPaddle) {
        rightPaddle.addEventListener('click', () => scrollGallery(1));
    }

    let isDown = false;
    let hasDragged = false;
    let startX;
    let scrollLeft;

    wrapper.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        isDown = true;
        hasDragged = false;
        wrapper.classList.add('is-dragging');
        
        startX = e.clientX;
        scrollLeft = wrapper.scrollLeft;
        
        e.preventDefault();
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
        e.preventDefault();
        
        const x = e.clientX;
        const walk = (x - startX) * 1.5;
        
        if (Math.abs(walk) > 5) {
            hasDragged = true;
        }
        
        wrapper.scrollLeft = scrollLeft - walk;
        updatePaddles();
    });

    wrapper.addEventListener('click', (e) => {
        if (hasDragged) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);

    function updateActiveCard() {
        updatePaddles();

        if (!cards.length || window.innerWidth > 700) {
            cards.forEach(card => {
                card.classList.remove('project-card--active', 'in-focus');
            });
            return;
        }

        const wrapperRect = wrapper.getBoundingClientRect();
        const wrapperCenter = wrapperRect.left + wrapperRect.width / 2;

        let closestCard = cards[0];
        let minDistance = Infinity;

        cards.forEach(card => {
            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.left + cardRect.width / 2;
            const distance = Math.abs(wrapperCenter - cardCenter);

            if (distance < minDistance) {
                minDistance = distance;
                closestCard = card;
            }
        });

        cards.forEach(card => {
            card.classList.toggle('project-card--active', card === closestCard);
            card.classList.toggle('in-focus', card === closestCard);
        });
    }

    wrapper.addEventListener('scroll', updateActiveCard, { passive: true });
    window.addEventListener('resize', updateActiveCard);
    
    updateActiveCard();

    function handleHashJump(isInitialLoad = false) {
        const hash = window.location.hash;

        // If clicking wordmark (no hash), stay/reset to top (0,0)
        if (!hash) {
            if (isInitialLoad) {
                window.scrollTo(0, 0);
            }
            return;
        }

        const targetEl = document.querySelector(hash);
        const projectsSection = document.getElementById('projects');

        if (!targetEl) return;

        const behaviorMode = isInitialLoad ? 'auto' : 'smooth';

        if (projectsSection && (targetEl === projectsSection || projectsSection.contains(targetEl))) {
            projectsSection.scrollIntoView({ behavior: behaviorMode });
        } else {
            targetEl.scrollIntoView({ behavior: behaviorMode });
        }

        if (wrapper.contains(targetEl)) {
            const cardCenter = targetEl.offsetLeft + (targetEl.offsetWidth / 2);
            const wrapperCenter = wrapper.clientWidth / 2;
            wrapper.scrollTo({
                left: Math.max(0, cardCenter - wrapperCenter),
                behavior: behaviorMode
            });
        }
    }

    handleHashJump(true);
    window.addEventListener('load', () => handleHashJump(true));
    window.addEventListener('hashchange', () => handleHashJump(false));
})();
