const icon = document.getElementById("themeIcon");
const navToggle = document.getElementById("navToggle");
const siteNav = document.getElementById("siteNav");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("section[id]");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

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
        lightboxImg.src = thumb.dataset.full || thumb.src;
        lightboxImg.alt = thumb.alt;
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
