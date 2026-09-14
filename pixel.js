/**
 * SURDEASIA — Meta Pixel Module
 * Pixel ID: 2128091181457539
 *
 * Loads the Meta Pixel base code and exposes helper functions
 * for tracking standard e-commerce events.
 *
 * Usage: include this file in <head> of every page.
 * Functions are attached to window.SurdePixel and can be called
 * from any other script after this file loads.
 */

/* ── Meta Pixel Base Code ── */
!function(f,b,e,v,n,t,s){
  if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)
}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');

fbq('init', '2128091181457539');
fbq('track', 'PageView');

/* ── Noscript fallback injected dynamically ── */
(function() {
  var ns = document.createElement('noscript');
  var img = document.createElement('img');
  img.height = 1;
  img.width = 1;
  img.style.display = 'none';
  img.src = 'https://www.facebook.com/tr?id=2128091181457539&ev=PageView&noscript=1';
  ns.appendChild(img);
  document.head.appendChild(ns);
})();

/* ── Helper: safe fbq wrapper (survives adblockers silently) ── */
function _fbqSafe(eventType, eventName, params) {
  try {
    if (typeof fbq === 'function') {
      fbq(eventType, eventName, params);
    }
  } catch(e) {
    // Silent fail — never block the purchase flow
  }
}

/* ── ViewContent: fired when user opens a product modal ──
   @param {Object} product - product object from products.js
*/
window.pixelViewContent = function(product) {
  if (!product) return;
  _fbqSafe('track', 'ViewContent', {
    content_ids:  [String(product.id)],
    content_name: product.name,
    content_type: 'product',
    value:        product.priceNum || 0,
    currency:     'BRL'
  });
};

/* ── AddToCart: fired when user adds item to cart ──
   @param {Object} product      - product object
   @param {string} selectedColor
   @param {string} selectedSize
*/
window.pixelAddToCart = function(product, selectedColor, selectedSize) {
  if (!product) return;
  _fbqSafe('track', 'AddToCart', {
    content_ids:  [String(product.id)],
    content_name: product.name,
    content_type: 'product',
    value:        product.priceNum || 0,
    currency:     'BRL'
  });
};

/* ── InitiateCheckout: fired when user enters the checkout page ──
   @param {Array}  cartItems  - array of cart items
   @param {number} total      - cart total in BRL
*/
window.pixelInitiateCheckout = function(cartItems, total) {
  var ids = (cartItems || []).map(function(i) { return String(i.id); });
  _fbqSafe('track', 'InitiateCheckout', {
    content_ids:   ids,
    num_items:     (cartItems || []).reduce(function(s, i) { return s + (i.quantity || 1); }, 0),
    value:         parseFloat(total) || 0,
    currency:      'BRL'
  });
};

/* ── Purchase: fired on checkout-result.html when server confirms status=confirmed ──
   Anti-duplicate guard: uses localStorage flag keyed by orderId.
   event_id = orderId → Meta deduplicates with the CAPI server-side event automatically.
   @param {number} value     - total order value confirmed by Mercado Pago
   @param {string} eventId   - orderId (8-char), used as event_id for CAPI deduplication
*/
window.pixelPurchase = function(value, eventId) {
    _fbqSafe('track', 'Purchase', {
        value:        parseFloat(value) || 0,
        currency:     'BRL',
        content_type: 'product',
        event_id:     eventId || undefined
    }, { eventID: eventId || undefined });
};
