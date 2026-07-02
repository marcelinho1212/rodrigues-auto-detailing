/* ==========================================================================
   RODRIGUES AUTO DETAILING — SCRIPT.JS
   Menu mobile, scroll reveal, slider antes/depois, header on scroll
   e formulário de agendamento com integração WhatsApp.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------------------
     1) MENU MOBILE
  --------------------------------------------------------------------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    const openNav = () => {
      navToggle.classList.add('open');
      navLinks.classList.add('open');
      document.body.classList.add('nav-open');
    };
    const closeNav = () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.classList.remove('nav-open');
    };

    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.contains('open') ? closeNav() : openNav();
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('click', (e) => {
      if (!navLinks.classList.contains('open')) return;
      if (navLinks.contains(e.target) || navToggle.contains(e.target)) return;
      closeNav();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) closeNav();
    });
  }

  /* ---------------------------------------------------------------------
     2) HEADER: sombra sutil ao rolar
  --------------------------------------------------------------------- */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 40) {
        header.style.borderBottomColor = 'rgba(228,0,27,0.35)';
        header.style.background = 'rgba(8,8,9,0.9)';
      } else {
        header.style.borderBottomColor = 'rgba(255,255,255,0.06)';
        header.style.background = 'rgba(10,10,11,0.72)';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------------------------------------------------------------------
     3) SCROLL REVEAL (IntersectionObserver)
  --------------------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 90}ms`;
      io.observe(el);
    });
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------------------------------------------------------------------
     4) SLIDER ANTES / DEPOIS (arrastável, mouse + touch)
     -----------------------------------------------------------------
     OBS: as imagens "before-*.jpg" desta demo foram geradas a partir das
     próprias fotos do portfólio (com um filtro de dessaturação) apenas
     para ILUSTRAR o funcionamento do slider. Basta substituir os
     arquivos em /images/before-*.jpg e /images/after-*.jpg por fotos
     reais de antes/depois do cliente para produção.
  --------------------------------------------------------------------- */
  const pairs = [
    { before: 'images/before-1.jpg', after: 'images/after-1.jpg', label: 'Pintura — Correção & Selante' },
    { before: 'images/before-2.jpg', after: 'images/after-2.jpg', label: 'Lavagem Detalhada Externa' },
    { before: 'images/before-3.jpg', after: 'images/after-3.jpg', label: 'Polimento Técnico' },
  ];

  const slider = document.querySelector('.ba-slider');
  if (slider) {
    const imgBefore = slider.querySelector('.ba-before');
    const imgAfterWrap = slider.querySelector('.ba-after-wrap');
    const imgAfter = slider.querySelector('.ba-after-wrap img');
    const handle = slider.querySelector('.ba-handle');
    const dotsWrap = document.querySelector('.ba-dots');
    let current = 0;

    function loadPair(index) {
      current = index;
      imgBefore.src = pairs[index].before;
      imgAfter.src = pairs[index].after;
      imgBefore.alt = `Antes — ${pairs[index].label}`;
      imgAfter.alt = `Depois — ${pairs[index].label}`;
      setPosition(50);
      if (dotsWrap) {
        [...dotsWrap.children].forEach((d, i) => d.classList.toggle('active', i === index));
      }
    }

    function setPosition(percent) {
      percent = Math.max(4, Math.min(96, percent));
      imgAfterWrap.style.width = percent + '%';
      imgAfter.style.width = (100 / (percent / 100)) + '%';
      handle.style.left = percent + '%';
    }

    function positionFromEvent(clientX) {
      const rect = slider.getBoundingClientRect();
      const percent = ((clientX - rect.left) / rect.width) * 100;
      setPosition(percent);
    }

    let dragging = false;
    const start = () => { dragging = true; };
    const stop = () => { dragging = false; };
    const move = (clientX) => { if (dragging) positionFromEvent(clientX); };

    handle.addEventListener('mousedown', start);
    window.addEventListener('mouseup', stop);
    window.addEventListener('mousemove', (e) => move(e.clientX));

    handle.addEventListener('touchstart', start, { passive: true });
    window.addEventListener('touchend', stop);
    window.addEventListener('touchmove', (e) => {
      if (dragging && e.touches[0]) move(e.touches[0].clientX);
    }, { passive: true });

    // clique direto na imagem também reposiciona
    slider.addEventListener('click', (e) => {
      if (e.target === handle || handle.contains(e.target)) return;
      positionFromEvent(e.clientX);
    });

    if (dotsWrap) {
      pairs.forEach((p, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Ver comparação ${i + 1}`);
        dot.addEventListener('click', () => loadPair(i));
        dotsWrap.appendChild(dot);
      });
    }

    loadPair(0);
  }

  /* ---------------------------------------------------------------------
     5) FORMULÁRIO DE AGENDAMENTO → WHATSAPP
  --------------------------------------------------------------------- */
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    const WHATSAPP_NUMBER = '553191789892';

    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nome = bookingForm.nome.value.trim();
      const telefone = bookingForm.telefone.value.trim();
      const servico = bookingForm.servico.value;
      const servicoLabel = bookingForm.servico.selectedOptions[0]?.text || servico;
      const data = bookingForm.data.value;
      const obs = bookingForm.observacoes.value.trim();

      if (!nome || !telefone || !servico || !data) {
        bookingForm.reportValidity();
        return;
      }

      const dataFormatada = formatDateBR(data);

      const linhas = [
        '🚗 *Novo agendamento — Rodrigues Auto Detailing*',
        '',
        `*Nome:* ${nome}`,
        `*Telefone:* ${telefone}`,
        `*Serviço:* ${servicoLabel}`,
        `*Data desejada:* ${dataFormatada}`,
      ];
      if (obs) linhas.push(`*Observações:* ${obs}`);
      linhas.push('', 'Enviado pelo site.');

      const texto = encodeURIComponent(linhas.join('\n'));
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${texto}`;

      const successBox = document.getElementById('form-success');
      if (successBox) successBox.classList.add('show');

      window.open(url, '_blank');
    });
  }

  function formatDateBR(isoDate) {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
  }

  /* ---------------------------------------------------------------------
     6) Ano dinâmico no rodapé
  --------------------------------------------------------------------- */
  document.querySelectorAll('.current-year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

});
