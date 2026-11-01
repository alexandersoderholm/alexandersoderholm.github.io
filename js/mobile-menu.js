let skipNextViewTransition = false;

function closeMobileMenus() {
  document.querySelectorAll('.site-menu[open]').forEach((menu) => {
    menu.removeAttribute('open');
  });
}

document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  skipNextViewTransition = false;
  const link = target.closest('a.brand-wordmark, .site-nav a');
  if (
    link &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    (!link.target || link.target === '_self') &&
    !link.hasAttribute('download')
  ) {
    const destination = new URL(link.href, window.location.href);
    skipNextViewTransition =
      destination.protocol === window.location.protocol &&
      (destination.pathname !== window.location.pathname ||
        destination.search !== window.location.search);
  }

  if (!target.closest('.menu-button')) {
    closeMobileMenus();
  }
});

window.addEventListener('scroll', closeMobileMenus, { passive: true });

window.addEventListener('pageswap', (event) => {
  if (!skipNextViewTransition || !event.viewTransition) return;

  skipNextViewTransition = false;
  if (typeof event.viewTransition.skipTransition === 'function') {
    event.viewTransition.skipTransition();
  }
});
