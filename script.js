if (!sessionStorage.getItem('introPlayed')) {
    document.body.classList.remove('skip-intro');
    sessionStorage.setItem('introPlayed', 'true');

    // När intro-animationerna är klara → ta bort overlayen helt
    setTimeout(() => {
        document.body.classList.add('intro-done');
    }, 1500); // matcha din fadeOut + slideUp
}

//LANDING

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const fadeDistance = window.innerHeight;

    const blur = Math.min((scrollY / fadeDistance) * 20, 20);
    const darken = Math.max(0.4 - (scrollY / fadeDistance) * 0.4, 0);

    document.body.style.setProperty('--hero-blur', `${blur}px`);
    document.body.style.setProperty('--hero-darken', darken);
});

//PROJECT ANIMATION

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

