window.addEventListener("pageswap", (event) => {
  const destinationUrl = event.activation?.entry?.url;
  if (!event.viewTransition || !destinationUrl) return;

  const destination = new URL(destinationUrl);
  const indexUrl = new URL("../index.html", window.location.href);
  if (destination.origin !== indexUrl.origin || destination.pathname !== indexUrl.pathname) return;

  const nextImage = document.querySelector(".project-next-link .project-next-image");
  if (!nextImage) return;

  const inlineTransitionName = nextImage.style.viewTransitionName;
  nextImage.style.viewTransitionName = "none";

  const restoreTransitionName = () => {
    nextImage.style.viewTransitionName = inlineTransitionName;
  };

  event.viewTransition.finished.then(restoreTransitionName, restoreTransitionName);
});