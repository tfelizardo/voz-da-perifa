/***********************
 * 0) Config rápida (altere o caminho se renomear o PDF)
 ***********************/
const PDF_URL = './assets/jornal-perifa.pdf';

/***********************
 * 1) Fallback do formulário (caso nomes REPLACE_ não tenham sido trocados)
 ***********************/
(function () {
  const form = document.getElementById('cadastro-form');
  if (!form) return;

  const needsIds = Array.from(form.querySelectorAll('input[name], select[name]'))
    .some((el) => el.name && el.name.indexOf('REPLACE_') !== -1);

  if (needsIds) {
    const fb = document.getElementById('forms-fallback');
    if (fb) {
      form.hidden = true;
      fb.hidden = false;
    } else {
      form.hidden = false;
    }
  }
})();

/***********************
 * 2) Ano no footer
 ***********************/
(function () {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

/***********************
 * 3) Menu mobile
 ***********************/
(function () {
  const btn = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!btn || !nav) return;

  function setOpen(open) {
    btn.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
  }

  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    setOpen(!open);
  });

  nav.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
})();

/***********************
 * 4) Carrossel + Dots + Swipe
 ***********************/
(function () {
  const root = document.getElementById('carousel');
  if (!root) return;

  const track = root.querySelector('.track');
  const slides = Array.from(root.querySelectorAll('.slide'));
  const prev = root.querySelector('.prev');
  const next = root.querySelector('.next');
  const dotsWrap = root.querySelector('.dots');
  let index = 0;

  // cria dots
  dotsWrap.innerHTML = '';
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', 'Ir para o slide ' + (i + 1));
    b.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(b);
  });

  function update() {
    track.style.transform = `translateX(${-index * 100}%)`;
    dotsWrap.querySelectorAll('button')
      .forEach((b, i) => b.classList.toggle('active', i === index));
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    update();
  }

  prev && prev.addEventListener('click', () => goTo(index - 1));
  next && next.addEventListener('click', () => goTo(index + 1));

  // Swipe
  let startX = 0;
  track.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (dx > 40) goTo(index - 1);
    if (dx < -40) goTo(index + 1);
  });

  update();
})();

/***********************
 * 5) Alinhamento do carrossel aos parágrafos (desktop)
 ***********************/
(function () {
  const section = document.querySelector('#sobre-o-lab');
  const carousel = document.getElementById('carousel');
  const content = section ? section.querySelector('.content') : null;

  if (!section || !carousel || !content) return;

  function prepareImagesForFill() {
    const imgs = carousel.querySelectorAll('img');
    imgs.forEach(img => {
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.display = 'block';
    });
  }

  function resetCarouselSizing() {
    carousel.style.marginTop = '';
    carousel.style.height = '';
  }

  function alignCarouselToParagraphs() {
    if (window.innerWidth <= 980) {
      resetCarouselSizing();
      return;
    }

    const ps = content.querySelectorAll('p');
    if (!ps.length) {
      const h2 = content.querySelector('h2');
      const contentRect = content.getBoundingClientRect();
      const baseTop = h2 ? h2.getBoundingClientRect().bottom - contentRect.top : 0;
      const desiredHeight = content.offsetHeight - baseTop;
      carousel.style.marginTop = `${baseTop}px`;
      carousel.style.height = `${Math.max(0, desiredHeight)}px`;
      return;
    }

    const p1Rect = ps[0].getBoundingClientRect();
    const plastRect = ps[ps.length - 1].getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();

    const marginTop = p1Rect.top - contentRect.top;
    const desiredHeight = Math.max(0, plastRect.bottom - p1Rect.top);

    carousel.style.marginTop = `${marginTop}px`;
    carousel.style.height = `${desiredHeight}px`;
  }

  let raf;
  function scheduleAlign() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      prepareImagesForFill();
      alignCarouselToParagraphs();
    });
  }

  window.addEventListener('load', scheduleAlign);
  window.addEventListener('resize', scheduleAlign);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleAlign);
  }

  const imgs = carousel.querySelectorAll('img');
  imgs.forEach(img => {
    if (!img.complete) img.addEventListener('load', scheduleAlign, { once: true });
  });

  scheduleAlign();
})();

/***********************
 * 6) Máscara de telefone (unificada)
 ***********************/
(function () {
  function formatPhone(v) {
    v = v.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);

    // (DD) 9XXXX-XXXX  |  (DD) XXXX-XXXX
    if (v.length > 6) {
      // com traço
      v = v.replace(/^(\d{0,2})(\d{0,5})(\d{0,4}).*/, function (_m, ddd, p1, p2) {
        let out = '';
        if (ddd) out += '(' + ddd + ')';
        if (p1) out += ' ' + p1;
        if (p2) out += '-' + p2;
        return out.trim();
      });
    } else if (v.length > 2) {
      // sem traço ainda
      v = v.replace(/^(\d{0,2})(\d{0,5}).*/, function (_m, ddd, p1) {
        let out = '';
        if (ddd) out += '(' + ddd + ')';
        if (p1) out += ' ' + p1;
        return out.trim();
      });
    } else if (v.length > 0) {
      v = '(' + v;
    }
    return v;
  }

  function attachMask(el) {
    if (!el) return;
    el.addEventListener('input', () => {
      const pos = el.selectionStart;
      el.value = formatPhone(el.value);
      // caret básico (evita pular muito)
      try { el.setSelectionRange(el.value.length, el.value.length); } catch (_) {}
    });
    el.addEventListener('keypress', (e) => {
      if (!/[0-9]/.test(e.key)) e.preventDefault();
    });
  }

  const telById = document.getElementById('telefone');
  attachMask(telById);
  document.querySelectorAll('input[type="tel"]').forEach(attachMask);
})();

/***********************
 * 7) Envio ao Google Forms (via iFrame) + download automático
 ***********************/
/***********************
 * 7) Envio ao Google Forms (iframe) + download automático SEM sair da página
 ***********************/
(function () {
  const form   = document.getElementById('cadastro-form');
  const iframe = document.getElementById('hidden_iframe');
  const ok     = document.getElementById('form-ok');
  const dlLink = document.getElementById('dl-pdf'); // link oculto no HTML
  if (!form || !iframe) return;

  // força o target do formulário para o iframe invisível
  form.setAttribute('target', 'hidden_iframe');

  let justSubmitted = false;

  form.addEventListener('submit', (e) => {
    // evita que o browser navegue de qualquer jeito
    e.preventDefault();

    // envia manualmente o form via XMLHttpRequest (para não recarregar a página)
    const data = new FormData(form);
    fetch(form.action, { method: 'POST', body: data, mode: 'no-cors' })
      .then(() => {
        // sucesso no envio (não abre outra página)
        if (ok) {
          ok.style.display = 'block';
          setTimeout(() => (ok.style.display = 'none'), 4000);
        }
        form.reset();

        // dispara download sem sair da página
        if (dlLink) {
          dlLink.setAttribute('href', dlLink.getAttribute('href') || './assets/jornal-perifa.pdf');
          dlLink.setAttribute('download', dlLink.getAttribute('download') || 'jornal-perifa.pdf');
          dlLink.click();
        } else {
          // fallback: cria link temporário
          const a = document.createElement('a');
          a.href = './assets/jornal-perifa.pdf';
          a.download = 'jornal-perifa.pdf';
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          setTimeout(() => a.remove(), 0);
        }
      })
      .catch(() => {
        alert('Ocorreu um erro ao enviar. Tente novamente.');
      });
  });
})();

window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});
