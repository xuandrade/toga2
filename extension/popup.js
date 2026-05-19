// TOGA Blocker — popup script

const MODES = {
  leve:     { color: '#00B8D4', label: '🌿 Foco Leve' },
  profundo: { color: '#5B47B8', label: '🔮 Foco Profundo' },
  monge:    { color: '#C9A961', label: '🧘 Modo Monge' },
};

function fmt(secs) {
  if (!secs || secs <= 0) return '--:--';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
}

function render(data) {
  const { togaActive, togaMode, togaExpiry, togaSites } = data;
  const mode = MODES[togaMode] || MODES.profundo;
  const pill = document.getElementById('statusPill');
  const dot  = document.getElementById('statusDot');
  const txt  = document.getElementById('statusText');
  const body = document.getElementById('bodyContent');
  const btn  = document.getElementById('actionBtn');

  if (togaActive) {
    const remaining = togaExpiry > 0 ? Math.max(0, Math.floor((togaExpiry - Date.now()) / 1000)) : 0;

    pill.style.borderColor = mode.color + '55';
    pill.style.color       = mode.color;
    dot.style.background   = mode.color;
    dot.style.boxShadow    = `0 0 6px ${mode.color}`;
    txt.textContent        = 'ATIVO';

    body.innerHTML = `
      <div class="timer-block" style="border-color:${mode.color}22">
        <div class="timer-label">TEMPO RESTANTE</div>
        <div class="timer-value" id="timerVal" style="color:${mode.color};filter:drop-shadow(0 0 10px ${mode.color})">${togaExpiry > 0 ? fmt(remaining) : '∞'}</div>
      </div>
      <div class="info-row">
        <span class="info-key">Modo</span>
        <span class="info-val">${mode.label}</span>
      </div>
      <div class="info-row">
        <span class="info-key">Sites bloqueados</span>
        <span class="info-val">${(togaSites || []).length}</span>
      </div>
    `;

    btn.className   = 'btn btn-stop';
    btn.disabled    = false;
    btn.textContent = '⏹ Encerrar sessão';
    btn.onclick     = async () => {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          __togaStopRequest: true,
        }).catch(() => {});
      }
      // Envia diretamente para background (sem depender da aba)
      chrome.runtime.sendMessage({ source: 'TOGA_APP', type: 'DEACTIVATE' }, () => {
        window.close();
      });
    };

  } else {
    pill.style.borderColor = 'rgba(255,255,255,0.12)';
    pill.style.color       = 'rgba(255,255,255,0.3)';
    dot.style.background   = 'rgba(255,255,255,0.2)';
    dot.style.boxShadow    = 'none';
    txt.textContent        = 'INATIVO';

    body.innerHTML = `
      <div class="inactive-msg">
        Nenhuma sessão ativa.<br/>
        Inicie o <strong>🛡 Blindado</strong> no TOGA.
      </div>
    `;
    btn.className   = 'btn btn-inactive';
    btn.disabled    = true;
    btn.textContent = 'Nenhuma sessão ativa';
    btn.onclick     = null;
  }
}

// Carga inicial
chrome.storage.local.get(['togaActive','togaMode','togaExpiry','togaSites'], render);

// Atualiza o timer a cada segundo se ativo
setInterval(() => {
  const el = document.getElementById('timerVal');
  if (!el) return;
  chrome.storage.local.get(['togaActive','togaExpiry'], ({ togaActive, togaExpiry }) => {
    if (!togaActive || !togaExpiry) return;
    const remaining = Math.max(0, Math.floor((togaExpiry - Date.now()) / 1000));
    el.textContent = fmt(remaining);
  });
}, 1000);
