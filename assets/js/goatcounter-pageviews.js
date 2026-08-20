(() => {
  'use strict';

  const script = document.currentScript;
  const tracker = document.querySelector('script[data-goatcounter]');
  const postDetails = document.querySelector(
    '.post-meta .d-flex.justify-content-between > div'
  );

  if (!script || !tracker || !postDetails) {
    return;
  }

  const label = script.dataset.pageviewLabel || 'views';
  const counter = document.createElement('span');
  counter.className = 'goatcounter-pageviews';
  counter.hidden = true;
  counter.setAttribute('aria-live', 'polite');
  postDetails.insertBefore(counter, postDetails.firstChild);

  const endpoint = new URL(tracker.dataset.goatcounter).origin;
  const path = window.location.pathname.replace(/\/index\.html$/, '/');
  const url = `${endpoint}/counter/${encodeURIComponent(path)}.json`;

  fetch(url, { credentials: 'omit' })
    .then((response) => {
      if (response.status === 404) {
        return { count: '0' };
      }

      if (!response.ok) {
        throw new Error(`GoatCounter returned ${response.status}`);
      }

      return response.json();
    })
    .then(({ count }) => {
      counter.replaceChildren();

      const icon = document.createElement('i');
      icon.className = 'far fa-eye fa-fw';
      icon.setAttribute('aria-hidden', 'true');

      const value = document.createElement('em');
      value.textContent = count;

      counter.append(icon, ' ', value, ` ${label}`);
      counter.hidden = false;
    })
    .catch(() => {
      counter.remove();
    });
})();
