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

    /* -----------------------------------------------------
        3. HERO IMAGE PATH & DIMENSION CACHING
    ----------------------------------------------------- */
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

    if (heroImg && transitionData?.imgSrc) {
        let imgSrc = transitionData.imgSrc;
        if (!imgSrc.startsWith('http') && !imgSrc.startsWith('/') && !imgSrc.startsWith('../') && window.location.pathname.includes('/projects/')) {
            imgSrc = '../' + imgSrc;
        }
        heroImg.src = imgSrc;
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
        4. FLUID PHYSICS & INTERACTION ENGINE
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

        function renderLoop() {
            if (!isPointerDown) {
                if (focusMode) {
                    virtualX += velocity;
                    velocity *= 0.94;

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

        banner.addEventListener('wheel', (e) => {
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
                const delta = e.shiftKey && Math.abs(e.deltaX) <= Math.abs(e.deltaY) ? e.deltaY : e.deltaX;
                e.preventDefault();
                activateFocusMode();
                
                virtualX -= delta;
                
                if (virtualX > maxX) virtualX = maxX;
                if (virtualX < minX) virtualX = minX;

                if (Math.abs(delta) > 40) {
                    velocity = -delta * 0.1;
                } else {
                    velocity = 0;
                }
            }
        }, { passive: false });

        function onPointerDown(e) {
            if (e.button && e.button !== 0) return;

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
        5. NEXT UP TRIGGER (MOBILE TOUCH)
    ----------------------------------------------------- */
    const nextUpSection = document.querySelector('.project-next-up');
    if (nextUpSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    nextUpSection.classList.add('is-inview');
                } else {
                    nextUpSection.classList.remove('is-inview');
                }
            });
        }, { threshold: 0.8 });

        observer.observe(nextUpSection);

        nextUpSection.addEventListener('click', (e) => {
            if (window.matchMedia('(hover: none), (pointer: coarse)').matches) {
                if (!e.target.closest('.next-up-link')) {
                    const link = nextUpSection.querySelector('.next-up-link');
                    if (link) link.click();
                }
            }
        });
    }

});
