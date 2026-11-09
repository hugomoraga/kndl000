/*
 * Cita de inicio.
 * El HTML trae una cita por defecto (la más reciente del pool marcado con
 * `home_quote: true`). Si hay más de una, elegimos otra al azar en cada
 * visita y recordamos la última para no repetirla en la misma pestaña.
 */
(function () {
  'use strict';

  var data = document.getElementById('home-quote-pool');
  var textEl = document.querySelector('.umbral-quote__text');
  if (!data || !textEl) return;

  var pool;
  try {
    pool = JSON.parse(data.textContent);
  } catch (ignore) {
    return;
  }
  if (!Array.isArray(pool) || pool.length < 2) return;

  var valid = pool.filter(function (item) {
    return item && typeof item.text === 'string' && item.text !== '';
  });
  if (valid.length < 2) return;

  var last = '';
  try {
    last = window.sessionStorage.getItem('kndl-home-quote') || '';
  } catch (ignore) {}

  var candidates = valid.filter(function (item) {
    return item.text !== last;
  });
  if (candidates.length === 0) candidates = valid;

  var pick = candidates[Math.floor(Math.random() * candidates.length)];
  textEl.textContent = pick.text;

  var metaEl = document.querySelector('.umbral-quote__meta');
  if (pick.year) {
    if (!metaEl) {
      metaEl = document.createElement('p');
      metaEl.className = 'umbral-quote__meta';
      metaEl.setAttribute('translate', 'no');
      textEl.parentNode.appendChild(metaEl);
    }
    metaEl.textContent = pick.year;
  } else if (metaEl) {
    metaEl.textContent = '';
  }

  try {
    window.sessionStorage.setItem('kndl-home-quote', pick.text);
  } catch (ignore) {}
})();
