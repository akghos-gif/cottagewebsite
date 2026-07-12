const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const tracking = window.CottageTracking || {};
const pixelId = tracking.metaPixelId;
const hasPixel = pixelId && !pixelId.startsWith('REPLACE_');
const createEventId = (name) => `${name}-${crypto.randomUUID()}`;

const sendCapiEvent = (eventName, eventId, customData = {}) => {
  fetch('/api/meta-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({ eventName, eventId, eventSourceUrl: window.location.href, customData })
  }).catch(() => {});
};

if (hasPixel) {
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', pixelId);
  fbq('track', 'PageView');
  const viewContentEventId = createEventId('view-content');
  const viewContentData = { content_name: 'The Cottage at Broad Creek', content_category: 'Luxury waterfront rental' };
  fbq('track', 'ViewContent', viewContentData, { eventID: viewContentEventId });
  sendCapiEvent('ViewContent', viewContentEventId, viewContentData);
}

toggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.textContent = isOpen ? 'Close' : 'Menu';
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = 'Menu';
  });
});

document.querySelectorAll('[data-booking-platform]').forEach((link) => {
  link.addEventListener('click', () => {
    if (!hasPixel) return;

    const clickoutEventId = createEventId('booking-clickout');
    const clickoutData = { booking_platform: link.dataset.bookingPlatform, content_name: 'The Cottage at Broad Creek' };
    fbq('trackCustom', 'BookingClickout', clickoutData, { eventID: clickoutEventId });
    sendCapiEvent('BookingClickout', clickoutEventId, clickoutData);
  });
});
