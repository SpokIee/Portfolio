const icon = document.getElementById("themeIcon");

icon.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");

    icon.src = isDark
        ? "src/img/light.svg"   
        : "src/img/dark.svg"; 
});
