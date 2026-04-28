// cart.js — Los Quesos de Chile shared cart system
(function () {
  'use strict';

  var PRODUCTS = [
    { id: 'cahuelche',   name: 'Camembert Cahuelche',        price: 8900,  img: 'uploads/products/cahuelche.png' },
    { id: 'burrata',     name: 'Burrata Fior di Latte',      price: 7500,  img: 'uploads/products/burrata.png' },
    { id: 'gruyere',     name: 'Gruyère Artesanal',          price: 12000, img: 'uploads/products/gruyere.png' },
    { id: 'edam-merken', name: 'Edam Merkén',                price: 9500,  img: 'uploads/products/edam-merken.png' },
    { id: 'komuy',       name: 'Mantecoso Komuy',            price: 7000,  img: 'uploads/products/komuy.png' },
    { id: 'ahumado',     name: 'Mantecoso Ahumado Natural',  price: 8500,  img: 'uploads/products/ahumado.png' },
    { id: 'huevos',      name: 'Huevos de Gallinas Araucanas', price: 4500, img: 'uploads/products/huevos-araucanas.png' },
    { id: 'mantequilla', name: 'Mantequilla de Campo',       price: 5500,  img: 'uploads/products/mantequilla-campo.png' },
    { id: 'dulce-leche', name: 'Dulce de Leche de Cabra',    price: 6000,  img: 'uploads/products/dulce-leche-cabra.png' },
  ];

  /* ── State ── */
  function getCart() { return JSON.parse(localStorage.getItem('lqdc_cart') || '[]'); }
  function saveCart(c) { localStorage.setItem('lqdc_cart', JSON.stringify(c)); updateBadge(); }

  function addItem(p) {
    var cart = getCart();
    var idx = cart.findIndex(function (x) { return x.id === p.id; });
    if (idx >= 0) cart[idx].qty++;
    else cart.push({ id: p.id, name: p.name, price: p.price, img: p.img, qty: 1 });
    saveCart(cart);
  }

  function changeQty(id, d) {
    var cart = getCart();
    var idx = cart.findIndex(function (x) { return x.id === id; });
    if (idx >= 0) { cart[idx].qty = Math.max(0, cart[idx].qty + d); if (!cart[idx].qty) cart.splice(idx, 1); }
    saveCart(cart);
    renderPanel();
  }

  function removeItem(id) {
    saveCart(getCart().filter(function (x) { return x.id !== id; }));
    renderPanel();
  }

  function getTotal(cart) {
    return (cart || getCart()).reduce(function (s, i) { return s + i.price * i.qty; }, 0);
  }

  function fmt(n) { return '$' + n.toLocaleString('es-CL'); }

  function updateBadge() {
    var n = getCart().reduce(function (s, i) { return s + i.qty; }, 0);
    document.querySelectorAll('.cart-badge').forEach(function (b) {
      b.textContent = n;
      b.style.display = n > 0 ? 'flex' : 'none';
    });
  }

  /* ── Panel render ── */
  function renderPanel() {
    var cart = getCart();
    var itemsEl = document.getElementById('cart-items');
    var recEl   = document.getElementById('cart-rec-list');
    var subtEl  = document.getElementById('cart-subtotal');
    var countEl = document.getElementById('cart-count-label');
    if (!itemsEl) return;

    var totalQty = cart.reduce(function (s, i) { return s + i.qty; }, 0);
    if (countEl) countEl.textContent = totalQty === 0 ? 'Tu carrito' : totalQty + (totalQty === 1 ? ' producto' : ' productos');

    if (cart.length === 0) {
      itemsEl.innerHTML = '<div id="cart-empty-msg">Tu carrito está vacío</div>';
    } else {
      itemsEl.innerHTML = cart.map(function (item) {
        return '<div class="cart-item">'
          + '<img class="cart-item-img" src="' + item.img + '" alt="' + item.name + '">'
          + '<div class="cart-item-info">'
          + '<div class="cart-item-name">' + item.name + '</div>'
          + '<div class="cart-item-price">' + fmt(item.price) + '</div>'
          + '<div class="cart-item-qty">'
          + '<button class="cart-qty-btn" onclick="LQDC.changeQty(\'' + item.id + '\',-1)">−</button>'
          + '<span class="cart-qty-num">' + item.qty + '</span>'
          + '<button class="cart-qty-btn" onclick="LQDC.changeQty(\'' + item.id + '\',1)">+</button>'
          + '</div></div>'
          + '<button class="cart-item-remove" onclick="LQDC.removeItem(\'' + item.id + '\')" aria-label="Eliminar">✕</button>'
          + '</div>';
      }).join('');
    }

    if (recEl) {
      var cartIds = cart.map(function (i) { return i.id; });
      var recs = PRODUCTS.filter(function (p) { return cartIds.indexOf(p.id) < 0; }).slice(0, 3);
      recEl.innerHTML = recs.map(function (p) {
        return '<div class="cart-rec-item">'
          + '<img class="cart-rec-img" src="' + p.img + '" alt="' + p.name + '">'
          + '<div class="cart-rec-info">'
          + '<div class="cart-rec-name">' + p.name + '</div>'
          + '<div class="cart-rec-price">' + fmt(p.price) + '</div>'
          + '</div>'
          + '<button class="cart-rec-add" onclick="LQDC.addRec(\'' + p.id + '\')">+ Agregar</button>'
          + '</div>';
      }).join('');
    }

    if (subtEl) subtEl.textContent = fmt(getTotal(cart));
    updateBadge();
  }

  /* ── Panel open / close ── */
  function openPanel() {
    renderPanel();
    var panel = document.getElementById('cart-panel');
    var overlay = document.getElementById('cart-overlay');
    if (panel) panel.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closePanel() {
    var panel = document.getElementById('cart-panel');
    var overlay = document.getElementById('cart-overlay');
    if (panel) panel.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ── Public API ── */
  window.LQDC = {
    PRODUCTS: PRODUCTS,
    getCart: getCart,
    saveCart: saveCart,
    addItem: addItem,
    changeQty: changeQty,
    removeItem: removeItem,
    getTotal: getTotal,
    fmt: fmt,
    updateBadge: updateBadge,
    renderPanel: renderPanel,
    openPanel: openPanel,
    closePanel: closePanel,
    addRec: function (id) {
      var p = PRODUCTS.find(function (x) { return x.id === id; });
      if (p) { addItem(p); renderPanel(); }
    }
  };

  /* ── DOM wiring ── */
  document.addEventListener('DOMContentLoaded', function () {
    var closeBtn = document.getElementById('cart-close');
    if (closeBtn) closeBtn.addEventListener('click', closePanel);
    var overlayEl = document.getElementById('cart-overlay');
    if (overlayEl) overlayEl.addEventListener('click', closePanel);

    // All navbar cart buttons open the panel
    document.querySelectorAll('[aria-label="Carrito"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) { e.preventDefault(); openPanel(); });
    });

    // Featured carousel "Agregar al carro" button (index.html)
    var addCartBtn = document.querySelector('.cta-cart');
    if (addCartBtn) {
      addCartBtn.addEventListener('click', function () {
        var slides = Array.from(document.querySelectorAll('.f-slide'));
        var active = document.querySelector('.f-slide.active');
        var idx    = active ? slides.indexOf(active) : 0;
        var p = PRODUCTS[idx >= 0 && idx < PRODUCTS.length ? idx : 0];
        if (p) { addItem(p); openPanel(); }
      });
    }

    updateBadge();
  });
})();
