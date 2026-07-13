const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const tracking = window.CottageTracking || {};
const pixelId = tracking.metaPixelId;
const hasPixel = pixelId && !pixelId.startsWith('REPLACE_');
const consentKey = 'cottage_tracking_consent_v1';
const consentBanner = document.querySelector('#tracking-consent');
const readConsent = () => {
  try {
    return window.localStorage.getItem(consentKey);
  } catch {
    return null;
  }
};
const saveConsent = (value) => {
  try {
    window.localStorage.setItem(consentKey, value);
  } catch {
    return;
  }
};
const createEventId = (name) => `${name}-${crypto.randomUUID()}`;

const sendCapiEvent = (eventName, eventId, customData = {}) => {
  fetch('/api/meta-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({ eventName, eventId, eventSourceUrl: window.location.href, customData })
  }).catch(() => {});
};

let trackingEnabled = false;
const enableTracking = () => {
  if (!hasPixel || trackingEnabled || window.navigator.globalPrivacyControl === true) return;
  trackingEnabled = true;
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', pixelId);
  fbq('track', 'PageView');
  const viewContentEventId = createEventId('view-content');
  const viewContentData = { content_name: 'The Cottage at Broad Creek', content_category: 'Luxury waterfront rental' };
  fbq('track', 'ViewContent', viewContentData, { eventID: viewContentEventId });
  sendCapiEvent('ViewContent', viewContentEventId, viewContentData);
};

const hideConsentBanner = () => {
  if (consentBanner) consentBanner.hidden = true;
};
const showConsentBanner = () => {
  if (consentBanner && hasPixel && window.navigator.globalPrivacyControl !== true) consentBanner.hidden = false;
};

if (hasPixel) {
  if (window.navigator.globalPrivacyControl === true) {
    saveConsent('denied');
  } else if (readConsent() === 'granted') {
    enableTracking();
  } else {
    showConsentBanner();
  }
}

document.querySelector('#tracking-accept')?.addEventListener('click', () => {
  saveConsent('granted');
  hideConsentBanner();
  enableTracking();
});

document.querySelector('#tracking-decline')?.addEventListener('click', () => {
  saveConsent('denied');
  hideConsentBanner();
});

document.querySelector('#privacy-choices')?.addEventListener('click', () => {
  if (window.navigator.globalPrivacyControl === true) return;
  showConsentBanner();
});

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
