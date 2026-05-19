// toga-background-module.js — adicione ao seu background service worker
//
// Se já tiver um background.js: cole o conteúdo deste arquivo no final dele.
// Se não tiver: renomeie este arquivo para background.js e registre no manifest.json.
//
// Permissões necessárias no manifest.json (veja MANIFEST_CHANGES.md):
//   "declarativeNetRequest", "storage", "tabs"

'use strict';

// IDs das regras dinâmicas do TOGA (evita conflito com regras existentes da extensão)
const TOGA_RULE_ID_START = 9000;
const TOGA_MAX_RULES     = 100; // limite de segurança

// ── Restaura estado ao reiniciar o service worker ─────────────────────────────
// (MV3 service workers podem ser encerrados e relançados pelo navegador)
async function restoreBlockingState() {
  try {
    const { togaBlockerActive, togaBlockerExpiry } = await chrome.storage.local.get([
      'togaBlockerActive', 'togaBlockerExpiry',
    ]);
    if (!togaBlockerActive) return;

    const remaining = togaBlockerExpiry > 0 ? togaBlockerExpiry - Date.now() : -1;
    if (togaBlockerExpiry > 0 && remaining <= 0) {
      // Timer expirou enquanto o service worker estava inativo
      await deactivateBlocking();
    } else if (remaining > 0) {
      // Re-agenda o desligamento automático
      setTimeout(() => deactivateBlocking(), remaining);
    }
  } catch (e) {}
}

chrome.runtime.onStartup.addListener(restoreBlockingState);
chrome.runtime.onInstalled.addListener(restoreBlockingState);

// ── Listener principal de mensagens ──────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.source !== 'TOGA_APP') return false;

  // Async handler — retorna true para manter canal aberto
  (async () => {
    try {
      switch (msg.type) {

        case 'PING': {
          const { togaBlockerActive } = await chrome.storage.local.get('togaBlockerActive');
          sendResponse({ type: 'PONG', active: !!togaBlockerActive });
          break;
        }

        case 'ACTIVATE': {
          await activateBlocking(msg);
          sendResponse({ type: 'ACTIVATED' });
          broadcastToTabs({ type: 'ACTIVATED' }, sender.tab?.id);
          break;
        }

        case 'DEACTIVATE': {
          await deactivateBlocking();
          sendResponse({ type: 'DEACTIVATED' });
          broadcastToTabs({ type: 'DEACTIVATED' }, sender.tab?.id);
          break;
        }

        case 'GET_STATUS': {
          const { togaBlockerActive } = await chrome.storage.local.get('togaBlockerActive');
          sendResponse({ type: 'STATUS_UPDATE', active: !!togaBlockerActive });
          break;
        }

        default:
          sendResponse({ type: 'UNKNOWN', originalType: msg.type });
      }
    } catch (err) {
      sendResponse({ type: 'ERROR', message: err.message });
    }
  })();

  return true; // mantém canal assíncrono aberto
});

// ── Ativar bloqueio ───────────────────────────────────────────────────────────
async function activateBlocking({ sitesToBlock = [], whitelist = [], duration = 0, mode = 'profundo' }) {
  // Remove regras TOGA existentes
  const existing     = await chrome.declarativeNetRequest.getDynamicRules();
  const togaRuleIds  = existing.filter(r => r.id >= TOGA_RULE_ID_START).map(r => r.id);

  // Monta regras de bloqueio
  const rules = sitesToBlock
    .filter(site => typeof site === 'string' && site.trim())
    .slice(0, TOGA_MAX_RULES)
    .map((site, i) => ({
      id:       TOGA_RULE_ID_START + i,
      priority: 10,
      action:   { type: 'block' },
      condition: {
        urlFilter:     `||${site.trim()}^`,   // bloqueia domínio e subdomínios
        resourceTypes: ['main_frame', 'sub_frame'],
      },
    }));

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: togaRuleIds,
    addRules:      rules,
  });

  const expiry = duration > 0 ? Date.now() + duration * 1000 : 0;
  await chrome.storage.local.set({
    togaBlockerActive: true,
    togaBlockerExpiry: expiry,
    togaBlockerMode:   mode,
    togaBlockerSites:  sitesToBlock,
  });

  // Desligamento automático sincronizado com o timer do TOGA
  if (duration > 0) {
    setTimeout(() => deactivateBlocking(), duration * 1000);
  }
}

// ── Desativar bloqueio ────────────────────────────────────────────────────────
async function deactivateBlocking() {
  const existing    = await chrome.declarativeNetRequest.getDynamicRules();
  const togaRuleIds = existing.filter(r => r.id >= TOGA_RULE_ID_START).map(r => r.id);

  if (togaRuleIds.length > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: togaRuleIds, addRules: [] });
  }

  await chrome.storage.local.set({ togaBlockerActive: false, togaBlockerExpiry: 0 });
}

// ── Broadcast para todas as abas (notifica quando status muda) ────────────────
async function broadcastToTabs(msg, excludeTabId) {
  try {
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => {
      if (tab.id === excludeTabId) return;
      chrome.tabs.sendMessage(tab.id, { __togaBroadcast: true, ...msg }).catch(() => {});
    });
  } catch (e) {}
}
