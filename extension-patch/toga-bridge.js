// toga-bridge.js — content script da extensão
// Cole este arquivo na raiz da extensão e registre-o no manifest.json (veja MANIFEST_CHANGES.md)
//
// Responsabilidade: fazer a ponte entre a página web (TOGA app) e o background service worker
// via window.postMessage ↔ chrome.runtime.sendMessage

(function () {
  'use strict';

  // 1. Sinaliza presença para o TOGA app assim que o script carrega
  try {
    window.__TOGA_BLOCKER_INSTALLED = true;
    window.dispatchEvent(new CustomEvent('togablockerready', { detail: { version: '1.0' } }));
  } catch (e) {}

  // 2. Lê estado atual do storage e responde READY com o status correto
  chrome.storage.local.get('togaBlockerActive', ({ togaBlockerActive }) => {
    window.postMessage({
      source: 'TOGA_BLOCKER',
      type: 'READY',
      version: '1.0',
      active: !!togaBlockerActive,
    }, '*');
  });

  // 3. Página → Extensão: repassa mensagens TOGA_APP para o background
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    const msg = event.data;
    if (!msg || msg.source !== 'TOGA_APP') return;

    chrome.runtime.sendMessage(msg, (response) => {
      if (chrome.runtime.lastError) return; // tab pode ter sido fechada
      if (response) {
        window.postMessage({ source: 'TOGA_BLOCKER', ...response }, '*');
      }
    });
  });

  // 4. Extensão → Página: recebe broadcasts do background e repassa para a página
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.__togaBroadcast) {
      // Remove flag interna antes de expor para a página
      const { __togaBroadcast: _, ...clean } = msg;
      window.postMessage({ source: 'TOGA_BLOCKER', ...clean }, '*');
    }
  });
})();
