/* BACK BUTTON LOGIC */

const goBack = document.querySelector('.go-back');

if (goBack) {

    // Rotate on scroll
    window.addEventListener('scroll', () => {
        goBack.classList.toggle('rotate', window.scrollY > 50);
    });

    // Smart click behavior
    goBack.addEventListener('click', (e) => {
        e.preventDefault();

        if (window.scrollY > 50) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = '/';
            }
        }
    });
}

/* SWIPER CAROUSEL */

var swiper = new Swiper(".mySwiper", {
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

/* DISABLE TRANSITION ON PROJECT PAGES */

sessionStorage.removeItem('transitionData');
