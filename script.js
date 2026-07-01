const icon = document.getElementById("themeIcon");
const navToggle = document.getElementById("navToggle");
const siteNav = document.getElementById("siteNav");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("section[id]");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

const PDFJS_VERSION = "3.11.174";
const PDF_THUMB_HEIGHT = 144;

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

document.querySelectorAll(".gallery-thumb").forEach((thumb) => {
    thumb.addEventListener("click", () => {
        if (!lightbox || !lightboxImg) return;
        const img = thumb.querySelector("img");
        lightboxImg.src = thumb.dataset.full || thumb.src || (img && img.src);
        lightboxImg.alt = (img && img.alt) || thumb.getAttribute("aria-label") || "";
        lightbox.classList.remove("hidden");
        lightbox.classList.add("flex");
        document.body.classList.add("overflow-hidden");
    });
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

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPdfThumbnails);
} else {
    initPdfThumbnails();
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
        link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
    });
}

window.addEventListener("scroll", setActiveNav, { passive: true });
setActiveNav();
