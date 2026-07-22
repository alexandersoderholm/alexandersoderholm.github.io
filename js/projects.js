/* =========================================================
   PROJECT PAGE INTERACTION LOGIC (FLUID MOBILE ENGINE)
========================================================== */
document.addEventListener('DOMContentLoaded', () => {

    const goBack = document.querySelector('.back-link');
    const transitionData = JSON.parse(sessionStorage.getItem('transitionData'));
    const banner = document.querySelector('.project-banner');
    const track = document.querySelector('.project-banner-track');
    const heroImg = track?.querySelector('.project-banner-media img');

    let focusMode = false;
    let virtualX = 0;
    let targetX = 0;
    let velocity = 0;

    let trackWidth = 0;
    let viewWidth = 0;
    let minX = 0;
    let maxX = 0;

    let isPointerDown = false;
    let isDragging = false;
    let hasMoved = false;
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let lastClientX = 0;
    let lastTime = 0;

    /* -----------------------------------------------------
        1. HERO IMAGE PATH & DIMENSION CACHING
    ----------------------------------------------------- */
    if (heroImg) {
        if (transitionData?.imgSrc) {
            let imgSrc = transitionData.imgSrc;
            if (!imgSrc.startsWith('http') && !imgSrc.startsWith('/') && !imgSrc.startsWith('../') && window.location.pathname.includes('/projects/')) {
                imgSrc = '../' + imgSrc;
            }
            heroImg.src = imgSrc;
        }
    }

    function updateBounds() {
        if (!track) return;
        trackWidth = track.offsetWidth;
        viewWidth = window.innerWidth;
        minX = Math.min(0, viewWidth - trackWidth);
        maxX = 0;
    }

    function centerBanner() {
        updateBounds();
        targetX = (viewWidth - trackWidth) / 2;
        if (targetX > 0) targetX = 0;
        targetX = Math.max(minX, Math.min(maxX, targetX));
    }

    if (track && heroImg) {
        const initCenter = () => {
            updateBounds();
            centerBanner();
            virtualX = targetX;
            requestAnimationFrame(() => {
                track.classList.add('is-ready');
            });
        };

        if (heroImg.complete && heroImg.naturalWidth > 0) {
            initCenter();
        } else {
            heroImg.onload = initCenter;
            setTimeout(initCenter, 200);
        }
        window.addEventListener('resize', () => {
            updateBounds();
            if (!focusMode) centerBanner();
        });
    }

    /* -----------------------------------------------------
        2. INDEX-STYLE FLUID PHYSICS & INTERACTION ENGINE (STRICT BOUNDS)
    ----------------------------------------------------- */
    if (banner && track) {
        function activateFocusMode() {
            if (!focusMode) {
                focusMode = true;
                banner.classList.add('focus-mode');
            }
        }

        function deactivateFocusMode() {
            if (focusMode) {
                focusMode = false;
                banner.classList.remove('focus-mode');
                centerBanner();
            }
        }

        // Render Loop with Hard Boundaries
        function renderLoop() {
            if (!isPointerDown) {
                if (focusMode) {
                    virtualX += velocity;
                    velocity *= 0.94; // Standardfriktion

                    // Strikta gränser: stoppa rörelsen helt vid kanten
                    if (virtualX >= maxX) {
                        virtualX = maxX;
                        velocity = 0;
                    } else if (virtualX <= minX) {
                        virtualX = minX;
                        velocity = 0;
                    }

                    if (Math.abs(velocity) < 0.1) {
                        velocity = 0;
                    }
                } else {
                    virtualX += (targetX - virtualX) * 0.12;
                }
            }

            track.style.transform = `translate3d(${virtualX}px, 0, 0)`;
            requestAnimationFrame(renderLoop);
        }
        requestAnimationFrame(renderLoop);

        // Scroll Wheel / Trackpad
        banner.addEventListener('wheel', (e) => {
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
                const delta = e.shiftKey && Math.abs(e.deltaX) <= Math.abs(e.deltaY) ? e.deltaY : e.deltaX;
                e.preventDefault();
                activateFocusMode();
                
                virtualX -= delta;
                
                // Spärra mushjulet från att scrolla förbi kanten
                if (virtualX > maxX) virtualX = maxX;
                if (virtualX < minX) virtualX = minX;

                if (Math.abs(delta) > 40) {
                    velocity = -delta * 0.1;
                } else {
                    velocity = 0;
                }
            }
        }, { passive: false });

        // Pointer Events
        function onPointerDown(e) {
            if (e.button && e.button !== 0) return;
            if (e.target.closest('.back-link')) return;

            isPointerDown = true;
            isDragging = false;
            hasMoved = false;
            pointerId = e.pointerId;
            startX = e.clientX;
            startY = e.clientY;
            lastClientX = e.clientX;
            lastTime = performance.now();
            velocity = 0;
        }

        function onPointerMove(e) {
            if (!isPointerDown || e.pointerId !== pointerId) return;

            const now = performance.now();
            const deltaX = e.clientX - lastClientX;
            const moveX = Math.abs(e.clientX - startX);
            const moveY = Math.abs(e.clientY - startY);
            const deltaTime = Math.max(now - lastTime, 1);

            if (moveX > 4 || moveY > 4) {
                hasMoved = true;
            }

            if (Math.abs(deltaX) > 1 || isDragging) {
                if (!isDragging) {
                    isDragging = true;
                    banner.classList.add('is-dragging');
                    activateFocusMode();
                    if (banner.setPointerCapture) {
                        try { banner.setPointerCapture(pointerId); } catch (_) {}
                    }
                }

                virtualX += deltaX;

                // Strikta gränser: tillåt inte fingret att dra förbi kanten
                if (virtualX > maxX) {
                    virtualX = maxX;
                } else if (virtualX < minX) {
                    virtualX = minX;
                }
                
                const instantVelocity = (deltaX / deltaTime) * 16; 
                velocity = velocity * 0.4 + instantVelocity * 0.6; 

                lastClientX = e.clientX;
                lastTime = now;
            }
        }

        function onPointerUp(e) {
            if (!isPointerDown || e.pointerId !== pointerId) return;

            isPointerDown = false;

            if (banner.releasePointerCapture && banner.hasPointerCapture && banner.hasPointerCapture(e.pointerId)) {
                try { banner.releasePointerCapture(e.pointerId); } catch (_) {}
            }

            if (isDragging) {
                banner.classList.remove('is-dragging');
            } else if (!hasMoved) {
                if (focusMode) {
                    deactivateFocusMode();
                } else {
                    activateFocusMode();
                }
            }
        }

        banner.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);

        window.addEventListener('scroll', () => {
            if (window.scrollY > 30) {
                deactivateFocusMode();
            }
        }, { passive: true });
    }

    /* -----------------------------------------------------
        3. BACK BUTTON HANDLER
    ----------------------------------------------------- */
    if (goBack) {
        goBack.addEventListener('click', (e) => {
            e.preventDefault();

            if (window.scrollY > 50) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = '../index.html';
            }
        });
    }

    /* -----------------------------------------------------
        4. SWIPER CAROUSEL INITIALIZATION
    ----------------------------------------------------- */
    if (document.querySelector('.mySwiper')) {
        new Swiper(".mySwiper", {
            loop: true,
            autoplay: {
                delay: 2000,
                disableOnInteraction: false,
            },
            effect: "fade",
            fadeEffect: { crossFade: true },
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            }
        });
    }
});