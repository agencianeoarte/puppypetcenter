(() => {
  'use strict';
  const cfg = window.PUPPY_CONFIG || {};
  const phone = String(cfg.whatsapp || '5545991481774').replace(/\D/g, '');
  const waUrl = (text) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  const all = (q) => [...document.querySelectorAll(q)];
  const one = (q) => document.querySelector(q);
  document.getElementById('year').textContent = new Date().getFullYear();
  all('[data-wa]').forEach(a => { a.href = waUrl(a.dataset.wa || 'Olá, Puppy!'); a.target = '_blank'; a.rel = 'noopener noreferrer'; });
  const maps = one('#maps-link'); if (maps && cfg.mapsUrl) maps.href = cfg.mapsUrl;
  const toggle = one('#nav-toggle');
  const nav = one('#navigation');
  const setMenu = (show) => { nav.classList.toggle('is-open', show); toggle.setAttribute('aria-expanded', String(show)); toggle.setAttribute('aria-label', show ? 'Fechar menu' : 'Abrir menu'); };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  all('.main-nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', e => { if (!nav.contains(e.target) && !toggle.contains(e.target)) setMenu(false); });

  // IntersectionObserver reveal with reduced-motion support.
  const targets = all('[data-reveal]');
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveal.unobserve(entry.target); } });
    }, { rootMargin: '0px 0px 65px 0px', threshold: .06 });
    targets.forEach(el => { el.classList.add('will-reveal'); reveal.observe(el); });
  }
  const progress = one('#scroll-progress'); const backTop = one('#back-top');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      progress.style.width = Math.min(100, Math.max(0, scrollY / max * 100)) + '%';
      backTop.classList.toggle('show', scrollY > 540);
      ticking = false;
    });
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true }); onScroll();
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  if ('IntersectionObserver' in window) {
    const sections = all('main .section-anchor');
    const active = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          all('.nav-link').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
        }
      });
    }, { rootMargin: '-25% 0px -65% 0px' });
    sections.forEach(s => active.observe(s));
  }

  // A simple, accessible service details modal: no invented prices/benefits.
  const serviceData = {
    terapeutico: { title: 'Banhos terapêuticos com cromoterapia', desc: 'A Puppy divulga banhos com cromoterapia. Consulte a equipe para saber como a modalidade funciona e se é adequada para o seu pet.', bullets: ['Consulte duração e disponibilidade', 'Pergunte sobre produtos e procedimentos', 'Informe necessidades específicas do pet'], message: 'Olá, Puppy! Gostaria de saber mais sobre os banhos terapêuticos com cromoterapia.' },
    banho: { title: 'Banho e tosa', desc: 'Higiene, estética e atenção ao conforto do seu melhor amigo. Consulte opções de banho e tosa disponíveis para a raça e o porte do seu pet.', bullets: ['Consulte os horários disponíveis', 'Informe a raça e o porte do pet', 'Confirme valores diretamente com a equipe'], message: 'Olá, Puppy! Quero consultar valores e horários para banho e tosa.' },
    hotel: { title: 'Hotel pet', desc: 'Para momentos em que você precisa se ausentar, a Puppy divulga hospedagem pet. Entre em contato para conhecer regras, disponibilidade e rotina de cuidados.', bullets: ['Consulte vagas e períodos', 'Confirme documentos e requisitos de saúde', 'Pergunte sobre a rotina de hospedagem'], message: 'Olá, Puppy! Quero informações sobre hospedagem no hotel pet.' },
    creche: { title: 'Creche pet', desc: 'Uma opção de cuidado e companhia durante o dia. A equipe pode orientar como funcionam avaliação inicial, atividades e horários.', bullets: ['Consulte as condições de participação', 'Pergunte sobre horários e adaptação', 'Confirme disponibilidade e valores'], message: 'Olá, Puppy! Gostaria de saber mais sobre a creche pet.' }
  };
  const dialog = one('#service-dialog'); const dialogTitle = one('#dialog-title'); const dialogText = one('#dialog-description'); const dialogList = one('#dialog-list'); const dialogWa = one('#dialog-wa');
  all('.service-more').forEach(btn => btn.addEventListener('click', () => {
    const info = serviceData[btn.dataset.service]; if (!info) return;
    dialogTitle.textContent = info.title; dialogText.textContent = info.desc;
    dialogList.replaceChildren(...info.bullets.map(s => { const li = document.createElement('li'); li.textContent = s; return li; }));
    dialogWa.href = waUrl(info.message);
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
  }));
  one('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  // One accordion open at a time, for compact mobile presentation.
  const faqs = all('.faq-list details');
  faqs.forEach(details => details.addEventListener('toggle', () => { if (details.open) faqs.filter(d => d !== details).forEach(d => { d.open = false; }); }));

  one('#booking-form').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const name = one('#owner').value.trim(); const pet = one('#pet').value.trim();
    const service = one('#service').value; const notes = one('#notes').value.trim();
    if (!name || !service) return;
    const message = [`Olá, Puppy! Gostaria de solicitar um atendimento.`, ``, `*Nome:* ${name}`, pet ? `*Pet:* ${pet}` : null, `*Serviço:* ${service}`, notes ? `*Observações:* ${notes}` : null, ``, `Podem me informar a disponibilidade e os valores?`].filter(line => line !== null).join('\n');
    const link = document.createElement('a'); link.href = waUrl(message); link.target = '_blank'; link.rel = 'noopener noreferrer';
    document.body.appendChild(link); link.click(); link.remove();
  });
})();
