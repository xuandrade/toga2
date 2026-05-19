// TOGA Blocker — background service worker
// Gerencia o bloqueio de sites via declarativeNetRequest + sincronização com o app TOGA

const RULE_ID_BASE = 9000;   // base ID para regras dinâmicas (evita conflito com outras extensões)
const MAX_SITES    = 100;    // limite de segurança do declarativeNetRequest

// ── Inicialização / restauração de estado ─────────────────────────────────────
async function init() {
  const { togaActive, togaExpiry } = await chrome.storage.local.get(['togaActive','togaExpiry']);
  if (!togaActive) return;
  if (togaExpiry && togaExpiry > 0) {
    const remaining = togaExpiry - Date.now();
    if (remaining <= 0) {
      await deactivate({ silent: true });
    } else {
      scheduleAutoDeactivate(remaining);
    }
  }
}

chrome.runtime.onStartup.addListener(init);
chrome.runtime.onInstalled.addListener(init);

// Alarme para desativar (sobrevive a reinicializações do SW)
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'toga_deactivate') {
    await deactivate();
    broadcastToTabs({ type: 'DEACTIVATED' });
  }
});

// ── Listener de mensagens do content.js ──────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.source !== 'TOGA_APP') return false;

  (async () => {
    switch (msg.type) {

      case 'PING': {
        const { togaActive } = await chrome.storage.local.get('togaActive');
        sendResponse({ type: 'PONG', active: !!togaActive });
        break;
      }

      case 'ACTIVATE': {
        await activate(msg);
        sendResponse({ type: 'ACTIVATED' });
        broadcastToTabs({ type: 'ACTIVATED' }, sender.tab?.id);
        updateIcon(true);
        break;
      }

      case 'DEACTIVATE': {
        await deactivate();
        sendResponse({ type: 'DEACTIVATED' });
        broadcastToTabs({ type: 'DEACTIVATED' }, sender.tab?.id);
        updateIcon(false);
        break;
      }

      case 'GET_STATUS': {
        const { togaActive, togaMode, togaExpiry } = await chrome.storage.local.get(['togaActive','togaMode','togaExpiry']);
        sendResponse({ type: 'STATUS_UPDATE', active: !!togaActive, mode: togaMode, expiry: togaExpiry });
        break;
      }

      default:
        sendResponse({ type: 'UNKNOWN' });
    }
  })();

  return true; // mantém canal aberto para resposta assíncrona
});

// ── Ativar bloqueio ───────────────────────────────────────────────────────────
async function activate({ sitesToBlock = [], whitelist = [], duration = 0, mode = 'profundo' }) {
  // Remove regras TOGA anteriores
  const existing    = await chrome.declarativeNetRequest.getDynamicRules();
  const oldIds      = existing.filter(r => r.id >= RULE_ID_BASE).map(r => r.id);

  const blockedExtUrl = chrome.runtime.getURL('blocked.html');

  // Cria uma regra por site
  const rules = sitesToBlock
    .filter(s => typeof s === 'string' && s.trim())
    .slice(0, MAX_SITES)
    .map((site, i) => ({
      id:       RULE_ID_BASE + i,
      priority: 10,
      action: {
        type: 'redirect',
        redirect: { url: `${blockedExtUrl}?mode=${mode}&site=${encodeURIComponent(site)}` },
      },
      condition: {
        urlFilter:     `||${site.trim()}^`,
        resourceTypes: ['main_frame'],
      },
    }));

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: oldIds,
    addRules:      rules,
  });

  const expiry = duration > 0 ? Date.now() + duration * 1000 : 0;
  await chrome.storage.local.set({
    togaActive:  true,
    togaMode:    mode,
    togaExpiry:  expiry,
    togaSites:   sitesToBlock,
    togaStarted: Date.now(),
    togaDuration: duration,
  });

  if (duration > 0) scheduleAutoDeactivate(duration * 1000);
}

// ── Desativar bloqueio ────────────────────────────────────────────────────────
async function deactivate({ silent = false } = {}) {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const togaIds  = existing.filter(r => r.id >= RULE_ID_BASE).map(r => r.id);

  if (togaIds.length > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: togaIds, addRules: [] });
  }

  await chrome.storage.local.set({ togaActive: false, togaExpiry: 0 });
  await chrome.alarms.clear('toga_deactivate');
  if (!silent) updateIcon(false);
}

// ── Alarme de auto-desativação ────────────────────────────────────────────────
function scheduleAutoDeactivate(ms) {
  chrome.alarms.create('toga_deactivate', { when: Date.now() + ms });
}

// ── Broadcast para todas as abas ──────────────────────────────────────────────
async function broadcastToTabs(msg, excludeTabId) {
  try {
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => {
      if (tab.id === excludeTabId) return;
      chrome.tabs.sendMessage(tab.id, { __togaBroadcast: true, ...msg }).catch(() => {});
    });
  } catch (_) {}
}

// ── Ícone dinâmico ────────────────────────────────────────────────────────────
function updateIcon(active) {
  chrome.action.setIcon({
    path: {
      '16': `icons/icon16${active ? '_active' : ''}.png`,
      '48': `icons/icon48${active ? '_active' : ''}.png`,
    },
  }).catch(() => {
    // Fallback: usa ícone padrão se o active não existir
  });
  chrome.action.setBadgeText({ text: active ? '🛡' : '' }).catch(() => {});
  if (active) chrome.action.setBadgeBackgroundColor({ color: '#5B47B8' }).catch(() => {});
}
