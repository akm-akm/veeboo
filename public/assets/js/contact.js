// Contact page: form validation and sending, plus the click-to-load booking calendar.
// Without this script the form still works as a normal POST.
(function () {
  var TODO_PREFIX = 'TODO';
  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var MIN_PROCESS_LENGTH = 20;
  var CALENDLY_SCRIPT = 'https://assets.calendly.com/assets/external/widget.js';
  var CALENDLY_STYLES = 'https://assets.calendly.com/assets/external/widget.css';

  var form = document.querySelector('[data-contact-form]');
  if (form) setUpForm(form);

  var booking = document.querySelector('[data-calendly]');
  if (booking) setUpBooking(booking);

  function setUpForm(form) {
    var messages = JSON.parse(document.querySelector('[data-contact-messages]').textContent);
    var status = form.querySelector('[data-contact-status]');
    var submit = form.querySelector('[data-contact-submit]');
    var success = document.querySelector('[data-contact-success]');
    var fields = {
      name: form.elements.name,
      email: form.elements.email,
      company: form.elements.company,
      niche: form.elements.niche,
      process: form.elements.process,
    };

    // The browser's own bubbles are replaced by the inline messages below.
    form.setAttribute('novalidate', '');

    function errorFor(key) {
      var value = fields[key].value.trim();
      if (key === 'name' && !value) return messages.errors.nameRequired;
      if (key === 'email' && !value) return messages.errors.emailRequired;
      if (key === 'email' && !EMAIL_PATTERN.test(value)) return messages.errors.emailInvalid;
      if (key === 'niche' && !value) return messages.errors.nicheRequired;
      if (key === 'process' && !value) return messages.errors.processRequired;
      if (key === 'process' && value.length < MIN_PROCESS_LENGTH) return messages.errors.processShort;
      return '';
    }

    function showError(key, message) {
      var input = fields[key];
      var slot = form.querySelector('[data-error-for="' + input.id + '"]');
      if (!slot) return;
      slot.textContent = message;
      slot.hidden = !message;
      if (message) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    }

    function validate() {
      var firstInvalid = null;
      ['name', 'email', 'niche', 'process'].forEach(function (key) {
        var message = errorFor(key);
        showError(key, message);
        if (message && !firstInvalid) firstInvalid = fields[key];
      });
      return firstInvalid;
    }

    function clearStatus() {
      status.hidden = true;
      status.removeAttribute('data-state');
      status.textContent = '';
    }

    function mailtoHref() {
      var nicheOption = fields.niche.options[fields.niche.selectedIndex];
      var lines = [
        messages.labels.name + ': ' + fields.name.value.trim(),
        messages.labels.email + ': ' + fields.email.value.trim(),
        messages.labels.company + ': ' + fields.company.value.trim(),
        messages.labels.niche + ': ' + (fields.niche.value ? nicheOption.text : ''),
        '',
        messages.labels.process,
        fields.process.value.trim(),
      ];
      return (
        'mailto:' +
        form.getAttribute('data-email') +
        '?subject=' +
        encodeURIComponent(messages.mailSubject) +
        '&body=' +
        encodeURIComponent(lines.join('\n'))
      );
    }

    // state: 'error' | 'notice'. copy: { title, text, mailLabel? }
    function showStatus(state, copy) {
      status.textContent = '';
      status.setAttribute('data-state', state);
      var title = document.createElement('strong');
      title.textContent = copy.title;
      status.appendChild(title);
      if (copy.text) {
        var text = document.createElement('p');
        text.textContent = copy.text;
        status.appendChild(text);
      }
      if (copy.mailLabel) {
        var link = document.createElement('a');
        link.className = 'btn btn--ghost btn--small';
        link.href = mailtoHref();
        link.textContent = copy.mailLabel;
        status.appendChild(link);
      }
      status.hidden = false;
    }

    function setSending(sending) {
      submit.disabled = sending;
      submit.textContent = sending ? messages.sending : messages.submit;
      if (sending) form.setAttribute('aria-busy', 'true');
      else form.removeAttribute('aria-busy');
    }

    function showSuccess() {
      form.hidden = true;
      success.hidden = false;
      success.focus();
    }

    Object.keys(fields).forEach(function (key) {
      var eventName = fields[key].tagName === 'SELECT' ? 'change' : 'input';
      fields[key].addEventListener(eventName, function () {
        // Only re-check a field that is already showing an error, so nothing nags while typing.
        if (fields[key].getAttribute('aria-invalid') === 'true') showError(key, errorFor(key));
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (submit.disabled) return;
      clearStatus();

      var firstInvalid = validate();
      if (firstInvalid) {
        showStatus('error', { title: messages.errors.summary });
        firstInvalid.focus();
        return;
      }

      // Bots fill the hidden field. Show them a success screen and send nothing.
      if (form.elements._gotcha.value) {
        showSuccess();
        return;
      }

      var endpoint = form.getAttribute('data-endpoint') || '';
      if (endpoint.indexOf(TODO_PREFIX) === 0) {
        showStatus('notice', messages.notConnected);
        return;
      }

      setSending(true);
      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (response) {
          if (!response.ok) throw new Error('Form service answered ' + response.status);
          setSending(false);
          showSuccess();
        })
        .catch(function () {
          setSending(false);
          showStatus('error', messages.failed);
        });
    });
  }

  // The calendar is third-party code, so nothing from Calendly loads until the visitor asks for it.
  function setUpBooking(box) {
    var trigger = box.querySelector('[data-calendly-load]');
    trigger.addEventListener('click', function () {
      trigger.disabled = true;
      trigger.textContent = box.getAttribute('data-loading-label');

      var styles = document.createElement('link');
      styles.rel = 'stylesheet';
      styles.href = CALENDLY_STYLES;
      document.head.appendChild(styles);

      var holder = document.createElement('div');
      holder.className = 'contact-booking__embed';
      box.insertBefore(holder, trigger);

      var script = document.createElement('script');
      script.src = CALENDLY_SCRIPT;
      script.async = true;
      script.onload = function () {
        window.Calendly.initInlineWidget({ url: box.getAttribute('data-calendly-url'), parentElement: holder });
        trigger.hidden = true;
      };
      script.onerror = function () {
        // Blocked or offline: remove the empty frame; the plain booking link below still works.
        holder.remove();
        trigger.hidden = true;
        box.setAttribute('data-calendly-failed', '');
      };
      document.head.appendChild(script);
    });
  }
})();
