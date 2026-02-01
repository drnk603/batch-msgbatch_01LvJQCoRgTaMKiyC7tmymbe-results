(function () {
  var header = document.querySelector('.dr-header');
  if (!header) return;

  var nav = header.querySelector('.dr-nav');
  var toggle = header.querySelector('.dr-nav-toggle');

  if (!nav || !toggle) return;

  toggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('dr-nav-open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
})();
