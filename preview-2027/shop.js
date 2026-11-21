/* The Prize Counter: turns "Opens January 1" into BUY buttons once the store links are set.
   Set STORE to the Fourthwall shop address (for example 'https://shop.clintonstrickland.com'),
   and each product's path from its Fourthwall product page. Leave STORE empty to keep the counter closed. */
(function () {
  'use strict';
  var STORE = '';
  var LINKS = {
    hoodie: '',   // e.g. '/products/press-start-hoodie'
    'goat-water': '',
    'level-up': '',
    'player-1': '',
    stickers: '',
    pin: ''
  };
  if (!STORE) return;
  var status = document.querySelector('[data-el="status"]');
  if (status) status.textContent = 'Open now · printed to order and shipped to you';
  Array.prototype.forEach.call(document.querySelectorAll('[data-product]'), function (card) {
    var path = LINKS[card.getAttribute('data-product')];
    var slot = card.querySelector('[data-el="buy"]');
    if (!slot) return;
    var name = card.querySelector('h3') ? card.querySelector('h3').textContent : 'this item';
    var a = document.createElement('a');
    a.className = 'btn primary';
    a.href = STORE.replace(/\/$/, '') + (path || '');
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = '▶ BUY';
    a.setAttribute('aria-label', 'Buy ' + name + ' (opens the store in a new tab)');
    slot.replaceWith(a);
  });
})();
