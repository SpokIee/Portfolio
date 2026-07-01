const icon = document.getElementById("themeIcon");
const navToggle = document.getElementById("navToggle");
const siteNav = document.getElementById("siteNav");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("section[id]");
const contactForm = document.getElementById("contactForm");

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

if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();
    });
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
