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
