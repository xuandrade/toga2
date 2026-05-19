// TOGA Blocker — content script
// Roda em document_start em todas as páginas.
// Faz a ponte: window.postMessage (app TOGA) ↔ chrome.runtime.sendMessage (background)

(function () {
  'use strict';

  // 1. Sinaliza presença para o app TOGA imediatamente
  try {
    window.__TOGA_BLOCKER_INSTALLED = true;
    window.dispatchEvent(new CustomEvent('togablockerready', { detail: { version: '1.0.0' } }));
  } catch (_) {}

  // 2. Lê estado atual e envia READY com status real
  chrome.storage.local.get(['togaActive', 'togaMode', 'togaExpiry'], (data) => {
    window.postMessage({
      source:  'TOGA_BLOCKER',
      type:    'READY',
      version: '1.0.0',
      active:  !!data.togaActive,
      mode:    data.togaMode || 'profundo',
      expiry:  data.togaExpiry || 0,
    }, '*');
  });

  // 3. Página → Background: repassa mensagens do app TOGA para o service worker
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    const msg = event.data;
    if (!msg || msg.source !== 'TOGA_APP') return;

    chrome.runtime.sendMessage(msg, (response) => {
      if (chrome.runtime.lastError) return;
      if (response) {
        window.postMessage({ source: 'TOGA_BLOCKER', ...response }, '*');
      }
    });
  });

  // 4. Background → Página: recebe broadcasts e repassa para o app TOGA
  chrome.runtime.onMessage.addListener((msg) => {
    if (!msg || !msg.__togaBroadcast) return;
    const { __togaBroadcast: _, ...clean } = msg;
    window.postMessage({ source: 'TOGA_BLOCKER', ...clean }, '*');
  });
})();
