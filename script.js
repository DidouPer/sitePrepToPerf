// === Inject header & footer from /partials ===
async function injectPartials() {
  async function load(selector, file) {
    const el = document.querySelector(selector);
    if (!el) return;
    const res = await fetch(file, { cache: "no-cache" });
    if (res.ok) {
      el.innerHTML = await res.text();
    } else {
      console.error(`Erreur chargement ${file}:`, res.status);
    }
  }

  await load("#site-header", "partials/header.html");
  await load("#site-footer", "partials/footer.html");

  // Post-injection hooks
  const y = document.getElementById("y");
  if (y) y.textContent = new Date().getFullYear();

  // Burger menu
  const burger = document.querySelector(".burger");
  const menu = document.getElementById("site-menu");
  if (burger && menu) {
    burger.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
      burger.classList.toggle("open", open);
      document.body.classList.toggle("no-scroll", open);
    });
  }

  // Smooth scroll for internal anchors (after header injection)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        menu?.classList.remove("open");
        burger?.classList.remove("open");
        burger?.setAttribute("aria-expanded", "false");
        document.body.classList.remove("no-scroll");
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", injectPartials);

// Utilitaire: date "dernière mise à jour" si présent
document.addEventListener("DOMContentLoaded", () => {
  const lu = document.getElementById("lastUpdated");
  if (lu)
    lu.textContent = new Date().toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
});
