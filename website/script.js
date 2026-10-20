/* Land Shark Pools and Backyard Living: small progressive enhancements.
   The page works without this file: links, anchors, FAQ, and blog posts are plain HTML. */
(function () {
  'use strict';

  /* Lead destination. Paste a Formspree endpoint (https://formspree.io/f/xxxxxx) or a
     GoHighLevel webhook URL here. Empty = demo mode: nothing is sent anywhere. */
  var FORM_ENDPOINT = '';
  var PHONE_DISPLAY = '(559) 779-3500';
  var PHONE_HREF = 'tel:+15597793500';
  var EMAIL = 'landsharkpools.ca@gmail.com';

  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Mobile drawer ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  var backdrop = document.querySelector('.nav-backdrop');
  var drawerQuery = window.matchMedia('(max-width: 1120px)');

  function setDrawer(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (backdrop) backdrop.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      var first = nav.querySelector('.nav-close') || nav.querySelector('a');
      if (first) first.focus();
    }
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      setDrawer(toggle.getAttribute('aria-expanded') !== 'true');
    });
  }
  if (backdrop) backdrop.addEventListener('click', function () { setDrawer(false); });
  var closeBtn = document.querySelector('.nav-close');
  if (closeBtn) closeBtn.addEventListener('click', function () { setDrawer(false); toggle.focus(); });
  if (nav) {
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && drawerQuery.matches) setDrawer(false);
    });
  }
  drawerQuery.addEventListener('change', function () { setDrawer(false); });

  /* ---------- Desktop dropdowns (caret button; hover/focus handled in CSS) ---------- */
  var subToggles = document.querySelectorAll('.sub-toggle');
  function closeSubs(except) {
    subToggles.forEach(function (btn) {
      if (btn === except) return;
      btn.setAttribute('aria-expanded', 'false');
      btn.parentElement.classList.remove('is-open');
    });
  }
  subToggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      closeSubs(btn);
      btn.setAttribute('aria-expanded', String(open));
      btn.parentElement.classList.toggle('is-open', open);
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-sub')) closeSubs();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (nav && nav.classList.contains('is-open')) { setDrawer(false); toggle.focus(); }
    var openSub = document.querySelector('.sub-toggle[aria-expanded="true"]');
    if (openSub) { closeSubs(); openSub.focus(); }
  });

  /* ---------- "Request this service" buttons preselect the contact form ---------- */
  document.querySelectorAll('[data-service]').forEach(function (link) {
    link.addEventListener('click', function () {
      var select = document.getElementById('c-service');
      if (select) select.value = link.getAttribute('data-service');
      setTimeout(function () {
        var name = document.getElementById('c-name');
        if (name) name.focus({ preventScroll: true });
      }, 450);
    });
  });

  /* ---------- Gallery lightbox ---------- */
  var dialog = document.getElementById('lightbox');
  var items = Array.prototype.slice.call(document.querySelectorAll('.gallery__item'));
  if (dialog && typeof dialog.showModal === 'function' && items.length) {
    var img = dialog.querySelector('.lightbox__img');
    var cap = dialog.querySelector('.lightbox__caption');
    var current = 0;
    var opener = null;

    var show = function (i) {
      current = (i + items.length) % items.length;
      var a = items[current];
      img.src = a.getAttribute('href');
      img.alt = a.querySelector('img').alt;
      cap.textContent = a.getAttribute('data-caption') + ' (' + (current + 1) + ' of ' + items.length + ')';
    };
    items.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        opener = a;
        show(i);
        dialog.showModal();
      });
    });
    dialog.querySelector('.lightbox__prev').addEventListener('click', function () { show(current - 1); });
    dialog.querySelector('.lightbox__next').addEventListener('click', function () { show(current + 1); });
    dialog.querySelector('.lightbox__close').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
    dialog.addEventListener('close', function () {
      img.removeAttribute('src');
      if (opener) opener.focus();
    });
  }

  /* ---------- Lead forms ---------- */
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function validate(form) {
    var firstBad = null;
    form.querySelectorAll('[required]').forEach(function (el) {
      var ok = el.value.trim() !== '';
      if (ok && el.type === 'tel') ok = el.value.replace(/\D/g, '').length >= 10;
      el.setAttribute('aria-invalid', String(!ok));
      if (!ok && !firstBad) firstBad = el;
    });
    var email = form.querySelector('input[type="email"]');
    if (email && email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      email.setAttribute('aria-invalid', 'true');
      if (!firstBad) firstBad = email;
    } else if (email) {
      email.setAttribute('aria-invalid', 'false');
    }
    return firstBad;
  }

  function showThanks(form, name, demo) {
    var box = document.createElement('div');
    box.className = 'form-thanks';
    box.setAttribute('tabindex', '-1');
    var who = name ? ', ' + escapeHtml(name.split(' ')[0]) : '';
    box.innerHTML = demo
      ? '<h3>Thank you' + who + '.</h3>' +
        '<p>This is a preview of the new website, so this form is not connected yet and your details were not sent.</p>' +
        '<p>To reach Land Shark Pools now, call <a href="' + PHONE_HREF + '">' + PHONE_DISPLAY + '</a> or email <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.</p>'
      : '<h3>Thank you' + who + '.</h3>' +
        '<p>Your request was received. We will follow up to talk through your project.</p>' +
        '<p>Need us sooner? Call <a href="' + PHONE_HREF + '">' + PHONE_DISPLAY + '</a>.</p>';
    form.replaceWith(box);
    box.focus();
  }

  document.querySelectorAll('.lead-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form-status');
      status.classList.remove('is-error');
      status.textContent = '';

      var bad = validate(form);
      if (bad) {
        status.classList.add('is-error');
        status.textContent = 'Please add your name and a 10-digit phone number' +
          (bad.type === 'email' ? ', and check the email address.' : '.');
        bad.focus();
        return;
      }

      var name = (form.querySelector('[name="name"]') || {}).value || '';
      if (!FORM_ENDPOINT) { showThanks(form, name.trim(), true); return; }

      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending...';
      var data = new FormData(form);
      data.append('form', form.getAttribute('data-form-name') || 'Website');

      fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (res) {
          if (res.ok) { showThanks(form, name.trim(), false); return; }
          throw new Error('HTTP ' + res.status);
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = 'Send My Request';
          status.classList.add('is-error');
          status.innerHTML = 'Your request did not go through. Please call <a href="' + PHONE_HREF + '">' +
            PHONE_DISPLAY + '</a> or try again.';
        });
    });
  });
})();
