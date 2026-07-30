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

if (!sessionStorage.getItem('introPlayed')) {
    document.body.classList.remove('skip-intro');
    sessionStorage.setItem('introPlayed', 'true');

    // Swap theme color right as the intro fadeOut finishes
    if (introEl) {
        introEl.addEventListener('animationend', (e) => {
            if (e.animationName === 'fadeOut') {
                setThemeColor('#ffffff'); // Match your light section / header background
            }
        });
    }
} else {
    document.body.classList.add('skip-intro');
    // If intro was skipped, switch to light immediately
    setThemeColor('#ffffff');
}

/* =========================================================
   3. HERO 1 (UNBOUNDED INFINITE ENGINE)
========================================================== */
(function initHeroEngine() {
    const hero = document.querySelector('.hero');
    const track = document.querySelector('.hero-track');

    if (!hero || !track) return;

    let focusMode = false;
    
    // Physics variables
    let virtualX = 0;              
    let velocity = 0;              
    let autoPanSpeed = -0.6;         // Keep positive; we subtract it properly below
    let singleTileWidth = 0;

    // Pointer Tracking
    let isPointerDown = false;
    let isDragging = false;
    let pointerId = null;
    let lastClientX = 0;
    let lastTime = 0;

    // Measure Tile Dimensions
    function updateDimensions() {
        singleTileWidth = track.scrollWidth / 3;
    }
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('load', updateDimensions);

    // Focus Mode Handlers
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

    // Mathematical continuous floor modulo
    function getWrappedOffset(x, tileWidth) {
        if (tileWidth <= 0) return 0;
        const mod = ((x % tileWidth) + tileWidth) % tileWidth;
        return -mod - tileWidth; // Centers inside middle tile
    }

    // Physics Render Loop
    function renderLoop() {
        if (!isPointerDown) {
            if (focusMode) {
                if (Math.abs(velocity) > 0.05) {
                    virtualX += velocity;
                    velocity *= 0.94; // Inertia damping
                } else {
                    velocity = 0;
                }
            } else {
                virtualX -= autoPanSpeed; // Clean subtraction for auto-pan
            }
        }

        if (singleTileWidth > 0) {
            const renderX = getWrappedOffset(virtualX, singleTileWidth);
            track.style.transform = `translate3d(${renderX}px, 0, 0)`;
        }

        requestAnimationFrame(renderLoop);
    }
    requestAnimationFrame(renderLoop);

    // Prevent drag/focus mode from hijacking the "Explore projects" button click and trigger instantly
    const heroTagBtn = hero.querySelector('.hero-tag');
    if (heroTagBtn) {
        heroTagBtn.addEventListener('pointerdown', (e) => {
            e.stopPropagation(); 
        });
        
        // Fires instantly on release, bypassing native click delay
        heroTagBtn.addEventListener('pointerup', (e) => {
            e.stopPropagation();
            const targetId = heroTagBtn.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    // Trackpad / Mouse Wheel Horizontal Support (INVERTED)
    hero.addEventListener('wheel', (e) => {
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
        if (delta !== 0) {
            e.preventDefault();
            activateFocusMode();
            virtualX += delta; 
            velocity = delta * 0.5; 
        }
    }, { passive: false });

    // Pointer Drag & Inertia Handlers (INVERTED)
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
    }, { passive: true });

   /* Hide indicator immediately when page scroll begins */
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            document.body.classList.add('is-scrolled');
        } else {
            document.body.classList.remove('is-scrolled');
        }
    }, { passive: true });
})();

/* =========================================================
   4. PROJECT GALLERY (NATIVE CSS SCROLL + ROBUST MOUSE DRAG)
========================================================== */
(function initNativeGallery() {
    const wrapper = document.querySelector('.projects-track-wrapper');
    const leftPaddle = document.querySelector('.projects-paddle-left');
    const rightPaddle = document.querySelector('.projects-paddle-right');

    if (!wrapper) return;

    const cards = Array.from(wrapper.querySelectorAll('.project-card, .project-square'));

    // Prevent native image ghosting/dragging globally inside track
    wrapper.querySelectorAll('img, a').forEach(el => {
        el.setAttribute('draggable', 'false');
        el.addEventListener('dragstart', (e) => e.preventDefault());
    });

    // Paddle Click Navigation
    function scrollGallery(direction) {
        if (!cards.length) return;
        const cardWidth = cards[0].offsetWidth;
        const gap = 32; // Matches your 2rem CSS gap
        const scrollAmount = cardWidth + gap;

        wrapper.scrollBy({
            left: direction * scrollAmount,
            behavior: 'smooth'
        });
    }

    if (leftPaddle) {
        leftPaddle.addEventListener('click', () => scrollGallery(-1));
    }
    if (rightPaddle) {
        rightPaddle.addEventListener('click', () => scrollGallery(1));
    }

    // Robust Mouse Click & Drag Mechanics with Drag-to-Click Prevention
    let isDown = false;
    let hasDragged = false;
    let startX;
    let scrollLeft;

    wrapper.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // Only left-click
        isDown = true;
        hasDragged = false; // Reset drag flag on new press
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
        const walk = (x - startX) * 1.5; // Scroll multiplier speed
        
        // If the user moved more than 5 pixels, flag it as a drag (prevents accidental link clicks)
        if (Math.abs(walk) > 5) {
            hasDragged = true;
        }
        
        wrapper.scrollLeft = scrollLeft - walk;
    });

    // Intercept and cancel clicks on cards/links if the user was dragging
    wrapper.addEventListener('click', (e) => {
        if (hasDragged) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);

    // Active Card Highlighting (Restricted strictly to mobile viewports)
    function updateActiveCard() {
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
})();
