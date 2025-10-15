// Partials + variables simples
const INCLUDE_VARS = {
  EMAIL: "didierperret69440@gmail.com",
  BRAND: "Prep To Perf",
  YEAR: new Date().getFullYear().toString()
};

async function injectPartials() {
  const nodes = Array.from(document.querySelectorAll("[data-include]"));
  await Promise.all(nodes.map(async (el) => {
    const src = el.getAttribute("data-include");
    if (!src) return;
    try {
      const res = await fetch(src, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      let html = await res.text();
      html = html.replace(/\{\{(\w+)\}\}/g, (_, k) => INCLUDE_VARS[k] ?? _);
      const wrapper = document.createElement("div");
      wrapper.innerHTML = html;
      el.outerHTML = wrapper.innerHTML;
    } catch (e) {
      console.error("Include failed:", src, e);
      el.innerHTML = "";
    }
  }));
}

// Remplace {{VARS}} dans l'ensemble du document (texte et attributs),
// en évitant les balises <script> et <style>
function replaceVariablesInDocument(root){
  const re = /\{\{(\w+)\}\}/g;
  const replaceText = (text) => text.replace(re, (_, k) => INCLUDE_VARS[k] ?? _);

  const walk = (node) => {
    if(!node) return;
    if(node.nodeType === Node.ELEMENT_NODE){
      const el = node;
      const tag = (el.tagName || '').toLowerCase();
      if(tag === 'script' || tag === 'style') return; // ne pas toucher

      // Remplacer dans les attributs
      if(el.attributes){
        for(const attr of Array.from(el.attributes)){
          const v = attr.value;
          const nv = replaceText(v);
          if(nv !== v) el.setAttribute(attr.name, nv);
        }
      }

      // Parcourir les enfants
      for(const child of Array.from(el.childNodes)) walk(child);
    } else if(node.nodeType === Node.TEXT_NODE){
      const v = node.nodeValue || '';
      const nv = replaceText(v);
      if(nv !== v) node.nodeValue = nv;
    }
  };

  walk(root || document.body);
}

function initNav(){
  const header = document.querySelector('.site-header');
  if(!header) return;
  const toggle = header.querySelector('.nav-toggle');
  const navRight = header.querySelector('.nav-right');
  if(!toggle || !navRight) return;

  const close = () => {
    header.classList.remove('open');
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-label','Ouvrir le menu');
  };
  const open = () => {
    header.classList.add('open');
    toggle.setAttribute('aria-expanded','true');
    toggle.setAttribute('aria-label','Fermer le menu');
  };

  toggle.addEventListener('click', () => {
    if(header.classList.contains('open')) close(); else open();
  });

  // Close on link click
  navRight.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

  // Close when resizing to desktop
  window.addEventListener('resize', () => {
    if(window.innerWidth > 820 && header.classList.contains('open')) close();
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await injectPartials();
  // Après l'injection des partials, remplace aussi les variables {{...}} dans la page courante
  try {
    replaceVariablesInDocument(document.body);
  } catch(e) {
    console.error('Variable replacement failed', e);
  }
  initNav();
  initCarousel('#screens-carousel');
});

function initCarousel(selector){
  const root = document.querySelector(selector);
  if(!root) return;
  const track = root.querySelector('.carousel-track');
  const slides = Array.from(root.querySelectorAll('.slide'));
  const btnPrev = root.querySelector('.carousel-btn.prev');
  const btnNext = root.querySelector('.carousel-btn.next');
  const dotsWrap = root.querySelector('.carousel-dots');
  if(!track || slides.length === 0) return;

  let index = 0;

  // Build dots
  dotsWrap.innerHTML = '';
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `Aller à la diapo ${i+1}`);
    b.setAttribute('role','tab');
    b.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(b);
  });

  function update(){
    track.style.transform = `translateX(${-index*100}%)`;
    const dots = dotsWrap.querySelectorAll('button');
    dots.forEach((d, i) => d.setAttribute('aria-selected', i===index ? 'true':'false'));
  }
  function goTo(i){ index = (i+slides.length)%slides.length; update(); }
  function next(){ goTo(index+1); }
  function prev(){ goTo(index-1); }

  btnNext && btnNext.addEventListener('click', next);
  btnPrev && btnPrev.addEventListener('click', prev);

  // Touch swipe
  let startX = 0, deltaX = 0, dragging = false;
  const threshold = 40;
  root.addEventListener('touchstart', (e)=>{ dragging = true; startX = e.touches[0].clientX; deltaX = 0;}, {passive:true});
  root.addEventListener('touchmove', (e)=>{ if(!dragging) return; deltaX = e.touches[0].clientX - startX;}, {passive:true});
  root.addEventListener('touchend', ()=>{
    if(!dragging) return; dragging = false;
    if(Math.abs(deltaX) > threshold){ deltaX < 0 ? next() : prev(); }
  });

  // Keyboard support
  root.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowLeft') prev(); else if(e.key === 'ArrowRight') next();
  });

  update();
}
