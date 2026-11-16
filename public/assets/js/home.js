// Home page: the hero run demo (tabs that switch example runs and replay the timeline)
// and a gentle reveal of sections as they scroll into view. Without JS every section is visible.
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var demo = document.querySelector('[data-demo]');
  if (demo) {
    var stage = demo.closest('.home-stage') || document;
    var tabs = Array.prototype.slice.call(demo.querySelectorAll('[role="tab"]'));
    var panels = Array.prototype.slice.call(demo.querySelectorAll('[role="tabpanel"]'));
    var floats = Array.prototype.slice.call(stage.querySelectorAll('[data-run]'));

    var play = function (panel) {
      if (reduceMotion) return;
      var rows = panel.querySelectorAll('.runlog__event, .runlog__footer');
      Array.prototype.forEach.call(rows, function (row, index) {
        row.style.setProperty('--i', index);
      });
      panel.classList.remove('is-playing');
      // Reading a layout property restarts the CSS animation.
      void panel.offsetWidth;
      panel.classList.add('is-playing');
    };

    var select = function (index, focus) {
      tabs.forEach(function (tab, tabIndex) {
        var selected = tabIndex === index;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels[tabIndex].hidden = !selected;
      });
      floats.forEach(function (card) {
        var match = card.getAttribute('data-run') === String(index);
        card.hidden = !match;
        if (match && !reduceMotion) {
          card.classList.remove('is-swapping');
          void card.offsetWidth;
          card.classList.add('is-swapping');
        }
      });
      if (focus) tabs[index].focus();
      play(panels[index]);
    };

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        select(index, false);
      });
      tab.addEventListener('keydown', function (event) {
        var next = null;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === null) return;
        event.preventDefault();
        select(next, true);
      });
    });

    play(panels[0]);
  }

  // Scroll reveal. Sections start visible; the hidden state only applies once JS has
  // confirmed IntersectionObserver works, so nothing is lost if this script fails.
  var sections = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if (reduceMotion || !('IntersectionObserver' in window) || !sections.length) return;
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
  );
  sections.forEach(function (section) {
    var rect = section.getBoundingClientRect();
    // Sections already on screen at load are not hidden first, so nothing flashes.
    if (rect.top < window.innerHeight) return;
    section.classList.add('is-pending');
    observer.observe(section);
  });
})();
