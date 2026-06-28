// --- Load SVG ---
fetch('../images/svg/helmet.svg')
    .then(res => res.text())
    .then(svg => {
        document.getElementById('helmet-container').innerHTML = svg;

        // Animera containern (inte SVG:n)
        const helmet = document.querySelector('.uc-helmet-big');

        // Reset animation så den alltid triggas
        helmet.style.animation = "none";
        void helmet.offsetWidth;

        // Kör exakt samma animation som hover, en gång
        helmet.style.animation = "hoverShake 0.55s cubic-bezier(.25,.8,.25,1)";

        // Ta bort animationen efteråt så hover funkar normalt
        setTimeout(() => {
            helmet.style.animation = "";
        }, 550);

        // --- KOPPLA KLICK PÅ HJÄLMEN ---
        helmet.addEventListener('click', triggerReveal);
    });

// --- Elements ---
const helmetContainer = document.querySelector('.uc-helmet-big');
const projects = document.querySelector('.uc-projects');
const grabHelmet = document.querySelector('.grab-helmet');

// --- KOPPLA KLICK PÅ TEXTEN (det som saknades) ---
grabHelmet.addEventListener('click', triggerReveal);

// --- Click: reveal animation ---
function triggerReveal() {
    helmetContainer.classList.add('animate');
    projects.classList.remove('hidden');
    projects.classList.add('show');
}
