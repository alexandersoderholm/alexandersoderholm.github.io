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
    document.documentElement.classList.remove('play-intro');
    document.documentElement.classList.add('skip-intro');
    document.body.classList.add('skip-intro');
    setThemeColor('#ffffff');
    if (!sessionStorage.getItem('introPlayed')) {
        sessionStorage.setItem('introPlayed', 'true');
    }
} else {
    document.documentElement.classList.remove('skip-intro');
    document.documentElement.classList.add('play-intro');
    document.body.classList.remove('skip-intro');
    sessionStorage.setItem('introPlayed', 'true');

    if (introEl) {
        introEl.addEventListener('animationend', (e) => {
            if (e.animationName === 'intro-background-fade') {
                introEl.style.display = 'none';
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
    const heroAction = document.querySelector('.hero-tag');

    if (!hero || !track) return;

    let focusMode = false;
    let panIndicatorTimer = null;
    let virtualX = 0;              
    let velocity = 0;              
    let autoPanSpeed = 0.3;
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
            hero.classList.add('pan-indicator-visible');
            panIndicatorTimer = window.setTimeout(() => {
                hero.classList.remove('pan-indicator-visible');
                panIndicatorTimer = null;
            }, 3000);
        }
    }

    function deactivateFocusMode() {
        if (focusMode) {
            focusMode = false;
            hero.classList.remove('focus-mode');
            hero.classList.remove('pan-indicator-visible');
            if (panIndicatorTimer !== null) {
                window.clearTimeout(panIndicatorTimer);
                panIndicatorTimer = null;
            }
        }
    }

    if (heroAction) {
        heroAction.addEventListener('click', activateFocusMode);
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
        if (e.target.closest('.site-header, .hero-content, .hero-pan-indicator')) return;

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

    let previousScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        if (window.scrollY > 10) {
            document.body.classList.add('scrolled');
            if (currentScrollY > previousScrollY) {
                deactivateFocusMode();
            }
        } else {
            document.body.classList.remove('scrolled');
        }
        
        if (window.scrollY > 20) {
            document.body.classList.add('is-scrolled');
        } else {
            document.body.classList.remove('is-scrolled');
        }
        previousScrollY = currentScrollY;
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
        const maxScroll = Math.max(0, wrapper.scrollWidth - wrapper.clientWidth);
        leftPaddle.disabled = wrapper.scrollLeft <= 1;
        rightPaddle.disabled = wrapper.scrollLeft >= maxScroll - 1;
    }

    function scrollGallery(direction) {
        if (!cards.length) return;

        const snapInset = parseFloat(getComputedStyle(wrapper).scrollPaddingInlineStart) || 0;
        const maxScroll = Math.max(0, wrapper.scrollWidth - wrapper.clientWidth);
        const snapPositions = cards
            .map(card => Math.max(
                    0,
                    Math.min(maxScroll, card.offsetLeft - wrapper.offsetLeft - snapInset)
                ))
            .sort((a, b) => a - b)
            .filter((position, index, positions) => index === 0 || position - positions[index - 1] > 1);

        let currentSnapIndex = 0;
        let minDistance = Infinity;

        snapPositions.forEach((position, index) => {
            const distance = Math.abs(position - wrapper.scrollLeft);
            if (distance < minDistance) {
                minDistance = distance;
                currentSnapIndex = index;
            }
        });

        const targetSnapIndex = Math.max(
            0,
            Math.min(snapPositions.length - 1, currentSnapIndex + direction)
        );
        const targetScroll = snapPositions[targetSnapIndex];

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
        
        const x = e.clientX;
        const walk = (x - startX) * 1.5;
        
        if (Math.abs(walk) > 5) {
            hasDragged = true;
            e.preventDefault();

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

        const shouldHighlightCenter = window.innerWidth <= 700 ||
            window.matchMedia('(hover: none)').matches;

        if (!cards.length || !shouldHighlightCenter) {
            cards.forEach(card => card.classList.remove('project-card--active'));
            return;
        }

        const wrapperRect = wrapper.getBoundingClientRect();
        const wrapperCenter = wrapperRect.left + wrapperRect.width / 2;
        let closestCard = null;
        let minDistance = Infinity;

        cards.forEach(card => {
            const cardRect = card.getBoundingClientRect();
            const distance = Math.abs(wrapperCenter - (cardRect.left + cardRect.width / 2));

            if (distance < minDistance) {
                minDistance = distance;
                closestCard = card;
            }
        });

        cards.forEach(card => {
            card.classList.toggle('project-card--active', card === closestCard);
        });
    }

    wrapper.addEventListener('scroll', updateActiveCard, { passive: true });
    window.addEventListener('resize', updateActiveCard);
    window.addEventListener('pageshow', () => requestAnimationFrame(updateActiveCard));
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