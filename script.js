const icon = document.getElementById("themeIcon");
const navToggle = document.getElementById("navToggle");
const siteNav = document.getElementById("siteNav");
const navLinks = document.querySelectorAll(".nav-link");
const scrollLinks = document.querySelectorAll(".scroll-link");
const sections = document.querySelectorAll("section[id]");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");
const credentialsGrid = document.getElementById("credentialsGrid");

const PDFJS_VERSION = "3.11.174";
const PDF_THUMB_HEIGHT = 144;
const CREDENTIALS_PATH = "src/credentials/";

const PDF_FALLBACK_SVG = `<svg class="w-14 h-14 text-accent" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>`;

icon.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    document.body.classList.toggle("dark", isDark);

    icon.src = isDark
        ? "src/img/light.svg"
        : "src/img/dark.svg";
});

navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", isOpen);
});

navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        siteNav.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
    });
});

function stripHashFromUrl() {
    const cleanUrl = window.location.pathname + window.location.search;
    history.replaceState(null, document.title, cleanUrl);
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    section.scrollIntoView({ behavior: "smooth" });
    stripHashFromUrl();
}

scrollLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        const sectionId = link.dataset.scrollTo;
        if (sectionId) scrollToSection(sectionId);
    });
});

if (window.location.hash) {
    const sectionId = window.location.hash.slice(1);
    requestAnimationFrame(() => {
        scrollToSection(sectionId);
        stripHashFromUrl();
    });
}

window.addEventListener("hashchange", stripHashFromUrl);

document.addEventListener("click", (event) => {
    const thumb = event.target.closest(".gallery-thumb");
    if (!thumb || !lightbox || !lightboxImg) return;

    const img = thumb.querySelector("img");
    lightboxImg.src = thumb.dataset.full || thumb.src || (img && img.src);
    lightboxImg.alt = (img && img.alt) || thumb.getAttribute("aria-label") || "";
    lightbox.classList.remove("hidden");
    lightbox.classList.add("flex");
    document.body.classList.add("overflow-hidden");
});

function closeLightbox() {
    if (!lightbox || !lightboxImg) return;
    lightbox.classList.add("hidden");
    lightbox.classList.remove("flex");
    lightboxImg.src = "";
    document.body.classList.remove("overflow-hidden");
}

if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
}

if (lightbox) {
    lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) closeLightbox();
    });
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox && !lightbox.classList.contains("hidden")) {
        closeLightbox();
    }
});

function isImageCredential(filename) {
    return /\.(jpe?g|png|gif|webp)$/i.test(filename);
}

function renderCredentials() {
    if (!credentialsGrid || typeof CREDENTIALS === "undefined") return;

    credentialsGrid.innerHTML = CREDENTIALS.map((credential) => {
        const filePath = `${CREDENTIALS_PATH}${credential.file}`;
        const meta = `${credential.issuer} — ${credential.date}`;
        const previewAlt = `${credential.title} preview`;

        if (isImageCredential(credential.file)) {
            return `
                <article class="credential-card bg-white dark:bg-surfaceDark p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 hover:border-accentLight transition-colors">
                    <h3 class="font-bold text-lg text-neutral-900 dark:text-white mb-1">${credential.title}</h3>
                    <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-4">${meta}</p>
                    <button type="button" class="credential-preview gallery-thumb block w-full rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-accent" data-full="${filePath}" aria-label="View ${credential.title}">
                        <img src="${filePath}" alt="${previewAlt}" class="w-full h-36 object-cover object-top">
                    </button>
                </article>`;
        }

        return `
            <article class="credential-card bg-white dark:bg-surfaceDark p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 hover:border-accentLight transition-colors">
                <h3 class="font-bold text-lg text-neutral-900 dark:text-white mb-1">${credential.title}</h3>
                <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-4">${meta}</p>
                <a href="${filePath}" target="_blank" rel="noopener noreferrer" class="credential-pdf-link block w-full rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800/50 hover:border-accentLight transition-colors">
                    <canvas class="pdf-thumb-canvas w-full h-36" data-pdf="${filePath}" aria-label="${previewAlt}"></canvas>
                    <div class="pdf-thumb-fallback hidden flex items-center justify-center w-full h-36" aria-hidden="true">${PDF_FALLBACK_SVG}</div>
                </a>
            </article>`;
    }).join("");
}

function showPdfFallback(canvas) {
    canvas.classList.add("hidden");
    const fallback = canvas.nextElementSibling;
    if (fallback) fallback.classList.remove("hidden");
}

async function renderPdfThumbnail(canvas) {
    const pdfUrl = canvas.dataset.pdf;
    if (!pdfUrl || typeof pdfjsLib === "undefined") {
        showPdfFallback(canvas);
        return;
    }

    try {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        const page = await pdf.getPage(1);
        const containerWidth = canvas.parentElement.clientWidth || 280;
        const viewport = page.getViewport({ scale: 1 });
        const scale = Math.min(
            containerWidth / viewport.width,
            PDF_THUMB_HEIGHT / viewport.height
        );
        const scaledViewport = page.getViewport({ scale });
        const context = canvas.getContext("2d");

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        await page.render({
            canvasContext: context,
            viewport: scaledViewport,
        }).promise;
    } catch (error) {
        console.warn("PDF thumbnail render failed:", pdfUrl, error);
        showPdfFallback(canvas);
    }
}

function initPdfThumbnails() {
    document.querySelectorAll(".pdf-thumb-canvas").forEach((canvas) => {
        renderPdfThumbnail(canvas);
    });
}

function initApp() {
    renderCredentials();
    initPdfThumbnails();
    setActiveNav();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}

function setActiveNav() {
    const scrollPos = window.scrollY + 120;

    let current = "";
    sections.forEach((section) => {
        if (scrollPos >= section.offsetTop) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach((link) => {
        link.classList.toggle("active", link.dataset.scrollTo === current);
    });
}

window.addEventListener("scroll", setActiveNav, { passive: true });
