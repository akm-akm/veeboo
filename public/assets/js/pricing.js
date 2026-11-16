// Payback calculator on /pricing/.
// Prices are never written here: they arrive in the #pricing-calc-data JSON tag,
// which the page builds from content/pricing.json.
// veebooPayback is also run at build time (src/pages/pricing.mjs) for the no-JS example,
// so the sum lives in one place.
function veebooPayback(input) {
  var hoursSaved = input.hours * (input.share / 100) * input.weeksPerMonth;
  var value = Math.round(hoursSaved * input.cost);
  var net = value - input.monthly;
  var months = net > 0 ? Math.ceil(input.setup / net) : null;
  var verdict = months === null ? 'none' : months > input.maxMonths ? 'slow' : months === 1 ? 'paysOne' : 'pays';
  return { hoursSaved: Math.round(hoursSaved), value: value, net: net, months: months, verdict: verdict };
}

if (typeof document !== 'undefined') {
  (function () {
    var root = document.querySelector('[data-pricing-calc]');
    var dataTag = document.getElementById('pricing-calc-data');
    if (!root || !dataTag) return;
    var data = JSON.parse(dataTag.textContent);

    var fields = {
      hours: root.querySelector('[data-calc-number="hours"]'),
      hoursRange: root.querySelector('[data-calc-range="hours"]'),
      cost: root.querySelector('[data-calc-number="cost"]'),
      shareRange: root.querySelector('[data-calc-range="share"]'),
      shareOut: root.querySelector('[data-calc-share-out]'),
    };
    var out = {
      valueNote: root.querySelector('[data-calc-out="valueNote"]'),
      value: root.querySelector('[data-calc-out="value"]'),
      retainerNote: root.querySelector('[data-calc-out="retainerNote"]'),
      retainer: root.querySelector('[data-calc-out="retainer"]'),
      net: root.querySelector('[data-calc-out="net"]'),
      setup: root.querySelector('[data-calc-out="setup"]'),
      verdict: root.querySelector('[data-calc-out="verdict"]'),
      total: root.querySelector('[data-calc-total]'),
    };

    function money(amount) {
      var text = data.symbol + Math.abs(amount).toLocaleString('en-US');
      return amount < 0 ? '−' + text : text;
    }
    function fill(template, values) {
      return template.replace(/\{(\w+)\}/g, function (match, key) {
        return key in values ? values[key] : match;
      });
    }
    // A half-typed or empty number field falls back to the last good value.
    function read(input, last) {
      var value = parseFloat(input.value);
      if (!isFinite(value)) return last;
      return Math.min(Number(input.max), Math.max(Number(input.min), value));
    }

    var state = {
      hours: read(fields.hours, data.defaults.hoursPerWeek),
      cost: read(fields.cost, data.defaults.hourlyCost),
      share: read(fields.shareRange, data.defaults.sharePercent),
    };

    function selectedTier() {
      var checked = root.querySelector('[data-calc-tier]:checked');
      var slug = checked ? checked.value : data.defaults.tier;
      for (var i = 0; i < data.tiers.length; i += 1) {
        if (data.tiers[i].slug === slug) return data.tiers[i];
      }
      return data.tiers[0];
    }

    function render() {
      var tier = selectedTier();
      var result = veebooPayback({
        hours: state.hours,
        cost: state.cost,
        share: state.share,
        setup: tier.setup,
        monthly: tier.monthly,
        weeksPerMonth: data.weeksPerMonth,
        maxMonths: data.maxMonths,
      });
      fields.shareOut.textContent = state.share + '%';
      out.valueNote.textContent = fill(data.text.valueNote, { hours: result.hoursSaved, cost: money(state.cost) });
      out.value.textContent = money(result.value);
      out.retainerNote.textContent = tier.name;
      out.retainer.textContent = money(-tier.monthly);
      out.net.textContent = money(result.net);
      out.setup.textContent = money(tier.setup);
      out.verdict.textContent = fill(data.text[result.verdict], { n: result.months });
      out.total.setAttribute('data-verdict', result.verdict);
    }

    fields.hoursRange.addEventListener('input', function () {
      state.hours = read(fields.hoursRange, state.hours);
      fields.hours.value = state.hours;
      render();
    });
    fields.hours.addEventListener('input', function () {
      state.hours = read(fields.hours, state.hours);
      fields.hoursRange.value = state.hours;
      render();
    });
    fields.cost.addEventListener('input', function () {
      state.cost = read(fields.cost, state.cost);
      render();
    });
    fields.shareRange.addEventListener('input', function () {
      state.share = read(fields.shareRange, state.share);
      render();
    });
    // Tidy an out-of-range or empty number once the visitor leaves the field.
    fields.hours.addEventListener('change', function () {
      fields.hours.value = state.hours;
    });
    fields.cost.addEventListener('change', function () {
      fields.cost.value = state.cost;
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-calc-tier]'), function (radio) {
      radio.addEventListener('change', render);
    });
    root.querySelector('form').addEventListener('submit', function (event) {
      event.preventDefault();
    });

    root.setAttribute('data-live', 'true');
    render();
  })();
}
