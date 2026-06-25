document.addEventListener('DOMContentLoaded', () => {
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
  img.style.transition = 'transform 0.6s ease, width 0.6s ease, height 0.6s ease';

  document.body.appendChild(img);

  requestAnimationFrame(() => {
    img.style.width = '100%';
    img.style.height = '90vh';
    img.style.transform = `translate(0px, 0px)`;
  });

  img.addEventListener('transitionend', () => {
    img.remove();
    sessionStorage.removeItem('transitionData');
  });
});
