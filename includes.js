
(function () {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    function init() {
        injectIfExists("header-host", "partials/header.html", onHeaderReady);
        injectIfExists("footer-host", "partials/footer.html", onFooterReady);
    }

    async function injectIfExists(id, url, after) {
        const host = document.getElementById(id);
        if (!host) return;
        try {
            const res = await fetch(url, { cache: "no-cache" });
            if (!res.ok) throw new Error("HTTP " + res.status);
            host.innerHTML = await res.text();
            if (typeof after === "function") after(host);
        } catch (e) {
            console.warn("Include failed:", url, e);
            host.innerHTML = "";
        }
    }

    function enableSmoothScroll(scopeEl) {
        (scopeEl || document).querySelectorAll('a[href^="#"]').forEach((a) => {
            a.addEventListener("click", (e) => {
                const id = a.getAttribute("href").slice(1);
                if (!id) return;
                const target = document.getElementById(id);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        });
    }

    function onHeaderReady(host) {
        enableSmoothScroll(host);
    }

    function onFooterReady(host) {
        const y = host.querySelector("#year");
        if (y) y.textContent = new Date().getFullYear();
        enableSmoothScroll(host);
    }
})();

