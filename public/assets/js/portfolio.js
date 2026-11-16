// Portfolio filters: two chip groups (industry, service) that combine.
// State lives in the URL query (?industry=…&service=…) so a filtered view can be shared.
// Without this script the chips stay hidden and every project shows.
(function () {
  var toolbar = document.querySelector('[data-portfolio-filters]');
  if (!toolbar) return;

  var chips = Array.prototype.slice.call(toolbar.querySelectorAll('[data-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-project]'));
  var count = document.querySelector('[data-portfolio-count]');
  var empty = document.querySelector('[data-portfolio-empty]');
  var reset = document.querySelector('[data-portfolio-reset]');
  var KEYS = ['industry', 'service'];
  var state = { industry: '', service: '' };

  function isKnown(key, value) {
    return chips.some(function (chip) {
      return chip.getAttribute('data-filter') === key && chip.getAttribute('data-value') === value;
    });
  }

  function readUrl() {
    var params = new URLSearchParams(window.location.search);
    KEYS.forEach(function (key) {
      var value = params.get(key) || '';
      state[key] = isKnown(key, value) ? value : '';
    });
  }

  function writeUrl() {
    var params = new URLSearchParams(window.location.search);
    KEYS.forEach(function (key) {
      if (state[key]) params.set(key, state[key]);
      else params.delete(key);
    });
    var query = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (query ? '?' + query : '') + window.location.hash);
  }

  function matches(card) {
    var industryOk = !state.industry || card.getAttribute('data-industry') === state.industry;
    var serviceOk = !state.service || card.getAttribute('data-services').split(' ').indexOf(state.service) !== -1;
    return industryOk && serviceOk;
  }

  function render() {
    var shown = 0;
    cards.forEach(function (card) {
      var visible = matches(card);
      card.hidden = !visible;
      if (visible) shown += 1;
    });
    chips.forEach(function (chip) {
      var active = state[chip.getAttribute('data-filter')] === chip.getAttribute('data-value');
      chip.setAttribute('aria-pressed', String(active));
    });
    count.textContent = count
      .getAttribute('data-template')
      .replace('{shown}', String(shown))
      .replace('{total}', count.getAttribute('data-total'));
    empty.hidden = shown !== 0;
  }

  toolbar.addEventListener('click', function (event) {
    var chip = event.target.closest('[data-filter]');
    if (!chip) return;
    state[chip.getAttribute('data-filter')] = chip.getAttribute('data-value');
    writeUrl();
    render();
  });

  reset.addEventListener('click', function () {
    state.industry = '';
    state.service = '';
    writeUrl();
    render();
    toolbar.querySelector('[data-filter]').focus();
  });

  window.addEventListener('popstate', function () {
    readUrl();
    render();
  });

  toolbar.hidden = false;
  readUrl();
  render();
})();
