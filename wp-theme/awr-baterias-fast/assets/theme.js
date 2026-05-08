/* JS mínimo do tema — defer aplicado automaticamente pelo perf-defer.php */
(function () {
  'use strict';

  // Toggle de menu mobile (se existir um botão com data-awrf-menu-toggle).
  var btn = document.querySelector('[data-awrf-menu-toggle]');
  var nav = document.querySelector('.awrf-header__nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });
  }

  // Smooth scroll para âncoras internas.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var t = document.querySelector(id);
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
})();

/* Recebe conversões do app React quando ele roda dentro de iframe.
   O app envia { type: 'awr_conversion', url } via postMessage para evitar
   duplicar GTM/GA4 dentro do iframe; quem dispara a conversão é o parent. */
(function () {
  'use strict';
  window.addEventListener('message', function (ev) {
    var d = ev && ev.data;
    if (!d || d.type !== 'awr_conversion') return;
    if (typeof window.gtag_report_conversion === 'function') {
      try { window.gtag_report_conversion(); } catch (e) {}
    } else if (typeof window.gtag === 'function') {
      try {
        window.gtag('event', 'conversion', {
          send_to: 'AW-994517528/axHrCPb1w6gcEJjEnNoD',
          value: 1.0, currency: 'BRL', transaction_id: ''
        });
      } catch (e) {}
    }
  }, false);
})();
