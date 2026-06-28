/* INTRO */

if (!sessionStorage.getItem('introPlayed')) {
    document.body.classList.remove('skip-intro');
    sessionStorage.setItem('introPlayed', 'true');

    setTimeout(() => {
        document.body.classList.add('intro-done');
    }, 1500);
}

/* LANDING BLUR */

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const fadeDistance = window.innerHeight;

    const blur = Math.min((scrollY / fadeDistance) * 20, 20);
    const darken = Math.max(0.4 - (scrollY / fadeDistance) * 0.4, 0);

    document.body.style.setProperty('--hero-blur', `${blur}px`);
    document.body.style.setProperty('--hero-darken', darken);
});

/* SAVE TRANSITION DATA WHEN CLICKING A PROJECT */

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.project-animation').forEach(img => {
        img.addEventListener('click', () => {
            const rect = img.getBoundingClientRect();

            sessionStorage.setItem('transitionData', JSON.stringify({
                src: img.src,
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
            }));
        });
    });
});

/* RUN TRANSITION ON PROJECT PAGE LOAD */

function runTransition() {
    const dataRaw = sessionStorage.getItem('transitionData');
    if (!dataRaw) return;

    const data = JSON.parse(dataRaw);

    const img = document.createElement('img');
    img.src = data.src;
    img.classList.add("transition-image");

    img.style.position = 'fixed';
    img.style.top = '0';
    img.style.left = '0';
    img.style.width = data.width + 'px';
    img.style.height = data.height + 'px';
    img.style.transform = `translate(${data.left}px, ${data.top}px)`;
    img.style.objectFit = 'cover';
    img.style.zIndex = 9999;
    img.style.transition =
        'transform 0.25s ease, width 0.25s ease, height 0.25s ease';

    document.body.appendChild(img);

    requestAnimationFrame(() => {
        img.style.width = '100%';
        img.style.height = '90vh';
        img.style.transform = 'translate(0, 0)';
    });

    img.addEventListener('transitionend', () => {
        img.remove();
        sessionStorage.removeItem('transitionData');
    });

    // Safety cleanup
    setTimeout(() => {
        if (document.body.contains(img)) {
            img.remove();
            sessionStorage.removeItem('transitionData');
        }
    }, 600);
}

/* PAGE SHOW LOGIC */

window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        sessionStorage.removeItem('transitionData');
    } else {
        runTransition();
    }
});
