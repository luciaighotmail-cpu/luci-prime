/**
 * Luci Prime — Sealie Federation Control Desk
 * Full interactive UI (v0.1.0)
 * AUTHORITY ≤ VERIFIED PROOF · R0 · Fail closed · Browser-local only
 *
 * Rebuild:
 *   npx esbuild src/app.ts --bundle --outfile=public/app.js --format=esm --target=es2020 --sourcemap
 */

import type { ControlDeskState, OperatingMode, ChecklistItem, Order, Sleeve } from './core/types';
import { createWitness, verifyChain, getTip } from './core/ledger';
import { isValidPortfolio, updateSleeve, sumAllocations } from './core/vault';
import { createOrder, transitionOrder } from './core/orders';
import { calculateReadiness } from './core/readiness';
import { loadState, saveState, clearState } from './core/storage';

export const LUCI_PRIME_VERSION = '0.1.0';
export const STATUS = 'MODEL' as const;

const BRIEFS = [
  'Summarise current readiness posture',
  'List open Domain 01 blockers',
  'Report modelled vs measured node status',
  'Explain ledger integrity vs claim truth',
];

let state: ControlDeskState = loadState();
let activePanel: string = 'tower';

function persist() {
  saveState(state);
}

function setMode(mode: OperatingMode) {
  if (mode === 'EXECUTE') {
    const r = calculateReadiness(state.checklist);
    if (!r.ready) {
      addAlert('warn', 'EXECUTE blocked', `Readiness gaps remain: ${r.gaps.join('; ') || 'checklist incomplete'}`);
      return;
    }
  }
  state.mode = mode;
  persist();
  render();
}

function addAlert(severity: 'info' | 'warn' | 'critical', title: string, message: string) {
  state.alerts.unshift({
    id: `alert-${Date.now()}`,
    severity,
    title,
    message,
    createdAt: Date.now(),
    acknowledged: false,
  });
  // keep last 8
  state.alerts = state.alerts.slice(0, 8);
  persist();
}

function ackAlert(id: string) {
  state.alerts = state.alerts.map(a =>
    a.id === id ? { ...a, acknowledged: true } : a
  );
  persist();
  render();
}

function toggleChecklist(id: string) {
  state.checklist = state.checklist.map(c => {
    if (c.id !== id) return c;
    const next = !c.checked;
    return {
      ...c,
      checked: next,
      checkedAt: next ? Date.now() : undefined,
      // for this MODEL, checking with evidenceRef is simulated when user confirms
      evidenceRef: next && !c.evidenceRef ? `local-evidence-${id}` : c.evidenceRef,
    };
  });
  persist();
  render();
}

async function addWitness(claim: string) {
  try {
    const tip = getTip(state.witnesses);
    const w = await createWitness(claim, tip);
    state.witnesses = [...state.witnesses, w];
    persist();
    addAlert('info', 'Witness created', `Hash ${w.hash.slice(0, 12)}…`);
    render();
  } catch (e: any) {
    addAlert('critical', 'Witness failed', e.message || String(e));
    render();
  }
}

async function runChainVerify() {
  const result = await verifyChain(state.witnesses);
  if (result.valid) {
    addAlert('info', 'Chain valid', `Length ${result.length}. Tip ${result.tipHash?.slice(0, 12) || '—'}…`);
  } else {
    addAlert('critical', 'Chain broken', result.reason || 'unknown');
  }
  render();
}

function setSleevePct(sleeveId: string, pct: number) {
  const result = updateSleeve(state.portfolio, sleeveId, pct);
  if (!result.ok) {
    addAlert('warn', 'Allocation rejected', result.reason);
    return;
  }
  state.portfolio = result.portfolio;
  persist();
  render();
}

function createNewOrder(title: string) {
  try {
    const order = createOrder(title);
    state.orders = [order, ...state.orders];
    persist();
    render();
  } catch (e: any) {
    addAlert('warn', 'Order rejected', e.message);
    render();
  }
}

function moveOrder(id: string, next: 'hold' | 'done' | 'cancelled' | 'draft') {
  const idx = state.orders.findIndex(o => o.id === id);
  if (idx < 0) return;
  const result = transitionOrder(state.orders[idx], next);
  if (!result.ok) {
    addAlert('warn', 'Illegal transition', result.reason);
    return;
  }
  state.orders = state.orders.map(o => (o.id === id ? result.order : o));
  persist();
  render();
}

function renderHeader(): string {
  const modes: OperatingMode[] = ['WATCH', 'HOLD', 'EXECUTE'];
  return `
    <header class="header">
      <div class="brand">
        <span class="sigil">◈</span>
        <h1>Luci Prime</h1>
        <span class="subtitle">Sealie Federation Control Desk · v${LUCI_PRIME_VERSION} · ${STATUS}</span>
      </div>
      <div class="mode-bar">
        ${modes.map(m => `
          <button class="mode-btn ${m === 'EXECUTE' ? 'execute' : ''} ${state.mode === m ? 'active' : ''}"
                  data-mode="${m}">${m}</button>
        `).join('')}
      </div>
    </header>
  `;
}

function renderTower(): string {
  const r = calculateReadiness(state.checklist);
  const unacked = state.alerts.filter(a => !a.acknowledged);
  return `
    <section class="panel" id="panel-tower">
      <div class="panel-header">
        <h2>01 Tower</h2>
        <span class="badge">WATCH</span>
      </div>
      <div class="readiness ${r.ready ? 'ready' : 'not-ready'}">
        <div class="score">${r.scorePct}%</div>
        <div class="label">${r.ready ? 'READY' : 'NOT READY'}</div>
        <div class="meta">${r.evidenceBackedMet}/${r.requiredTotal} evidence-backed required items</div>
      </div>
      <ul class="checklist">
        ${state.checklist.map(c => `
          <li class="${c.checked ? 'checked' : ''}">
            <input type="checkbox" data-check="${c.id}" ${c.checked ? 'checked' : ''} />
            <span>${c.label}</span>
            ${c.required ? '<span class="req">REQ</span>' : ''}
            ${c.evidenceRef ? `<span class="evidence">${c.evidenceRef.slice(0, 18)}…</span>` : ''}
          </li>
        `).join('')}
      </ul>
      <div class="alerts">
        ${unacked.length === 0
          ? '<p class="quiet">No unacknowledged alerts</p>'
          : unacked.map(a => `
            <div class="alert ${a.severity}">
              <strong>${a.title}</strong>
              <span>${a.message}</span>
              <button class="ack" data-ack="${a.id}">ACK</button>
            </div>
          `).join('')}
      </div>
    </section>
  `;
}

function renderLuci(): string {
  const ai = state.aiLink;
  return `
    <section class="panel" id="panel-luci">
      <div class="panel-header">
        <h2>02 Luci</h2>
        <span class="badge">HOLD</span>
      </div>
      <div class="ai-status ${ai.available ? 'available' : 'unavailable'}">
        ${ai.available
          ? `AI link available · credit ${ai.creditRemaining ?? '—'}`
          : `AI link unavailable — ${ai.reason || 'no live connection'}`}
      </div>
      <div class="briefs">
        ${BRIEFS.map((b, i) => `<button data-brief="${i}">${b}</button>`).join('')}
      </div>
      <form class="question-form" id="question-form">
        <input type="text" id="question-input" placeholder="Ask (no fabrication if offline)…" maxlength="200" />
        <button type="submit">Submit</button>
      </form>
      <p class="note">Luci never fabricates. Offline → explicit unavailable status only.</p>
    </section>
  `;
}

function renderNodes(): string {
  return `
    <section class="panel" id="panel-nodes">
      <div class="panel-header">
        <h2>03 Nodes</h2>
        <span class="badge">MODEL ≠ MEASURED</span>
      </div>
      ${state.nodes.map(n => `
        <div class="node-card">
          <h3>${n.name}</h3>
          <div class="status">Status: ${n.status}</div>
          <div class="modelled">
            <span class="tag">MODELLED</span>
            <span>Load ${n.modelledLoadPct}% · Uplink ${n.modelledUplinkMbps} Mbps</span>
          </div>
          <div class="measured">
            <span class="tag">MEASURED</span>
            ${n.measuredLoadPct !== null
              ? `<span>Load ${n.measuredLoadPct}% · Uplink ${n.measuredUplinkMbps} Mbps</span>`
              : `<span class="absent">No measured telemetry</span>`}
          </div>
        </div>
      `).join('')}
    </section>
  `;
}

function renderLedger(): string {
  return `
    <section class="panel" id="panel-ledger">
      <div class="panel-header">
        <h2>04 Ledger</h2>
        <span class="badge">SHA-256</span>
      </div>
      <form class="witness-form" id="witness-form">
        <input type="text" id="claim-input" placeholder="Claim text…" maxlength="180" required />
        <button type="submit">Create witness</button>
      </form>
      <button class="secondary" id="verify-chain" style="margin-top:0.4rem">Verify chain</button>
      <ul class="witness-list">
        ${state.witnesses.length === 0
          ? '<li class="empty">No witnesses yet</li>'
          : [...state.witnesses].reverse().map(w => `
            <li>
              <code>${w.hash.slice(0, 16)}…</code>
              <span>${w.claim}</span>
              <small>${new Date(w.timestamp).toISOString()} · prev ${w.prevHash ? w.prevHash.slice(0, 8) + '…' : 'GENESIS'}</small>
            </li>
          `).join('')}
      </ul>
      <p class="note">Valid hash = integrity of recorded bytes, not truth of claim.</p>
    </section>
  `;
}

function renderVault(): string {
  const sum = sumAllocations(state.portfolio.sleeves);
  const valid = isValidPortfolio(state.portfolio);
  return `
    <section class="panel" id="panel-vault">
      <div class="panel-header">
        <h2>05 Vault</h2>
        <span class="badge">MODEL BOOK</span>
      </div>
      <div class="model-label">Model portfolio only — no custody or executed trades</div>
      <div class="sum ${valid.valid ? 'ok' : 'bad'}">Σ ${sum.toFixed(2)}% ${valid.valid ? '✓' : '✗ ' + (valid.reason || '')}</div>
      <ul class="sleeves">
        ${state.portfolio.sleeves.map(s => `
          <li>
            <span class="name">${s.name}</span>
            <input type="number" min="0" max="100" step="0.1" value="${s.allocationPct}"
                   data-sleeve="${s.id}" />
            <span>%</span>
          </li>
        `).join('')}
      </ul>
    </section>
  `;
}

function renderOrders(): string {
  return `
    <section class="panel" id="panel-orders">
      <div class="panel-header">
        <h2>06 Orders</h2>
        <span class="badge">NO EXTERNAL ACTION</span>
      </div>
      <form class="order-form" id="order-form">
        <input type="text" id="order-title" placeholder="New order title…" maxlength="120" required />
        <button type="submit">Create</button>
      </form>
      <ul class="order-list">
        ${state.orders.length === 0
          ? '<li class="empty">No orders</li>'
          : state.orders.map(o => `
            <li class="status-${o.status}">
              <span class="st">${o.status.toUpperCase()}</span>
              <span>${o.title}</span>
              <div class="actions">
                ${o.status === 'draft' ? `<button data-order="${o.id}" data-to="hold">HOLD</button>` : ''}
                ${o.status === 'hold' ? `<button data-order="${o.id}" data-to="done">DONE</button>` : ''}
                ${o.status !== 'done' && o.status !== 'cancelled'
                  ? `<button data-order="${o.id}" data-to="cancelled">✕</button>` : ''}
              </div>
            </li>
          `).join('')}
      </ul>
      <p class="note">Status changes never imply an external action occurred.</p>
    </section>
  `;
}

function renderFooter(): string {
  return `
    <footer class="footer">
      <div>Luci Prime v${LUCI_PRIME_VERSION} · ${STATUS} · AUTHORITY ≤ VERIFIED PROOF</div>
      <div class="invariants">R0 · No external actions · Modelled ≠ measured · localStorage only · Fail closed</div>
      <div>Last persisted: ${state.lastPersistedAt ? new Date(state.lastPersistedAt).toISOString() : 'never'}</div>
    </footer>
  `;
}

function render() {
  const root = document.getElementById('app');
  if (!root) return;
  root.innerHTML = `
    ${renderHeader()}
    <div class="grid">
      ${renderTower()}
      ${renderLuci()}
      ${renderNodes()}
      ${renderLedger()}
      ${renderVault()}
      ${renderOrders()}
    </div>
    ${renderFooter()}
  `;
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = (btn as HTMLElement).dataset.mode as OperatingMode;
      setMode(mode);
    });
  });

  document.querySelectorAll('[data-check]').forEach(el => {
    el.addEventListener('change', () => {
      const id = (el as HTMLElement).dataset.check!;
      toggleChecklist(id);
    });
  });

  document.querySelectorAll('[data-ack]').forEach(btn => {
    btn.addEventListener('click', () => {
      ackAlert((btn as HTMLElement).dataset.ack!);
    });
  });

  document.querySelectorAll('[data-brief]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number((btn as HTMLElement).dataset.brief);
      const brief = BRIEFS[idx];
      if (!state.aiLink.available) {
        addAlert('warn', 'Luci unavailable', `Cannot process “${brief}” — ${state.aiLink.reason}`);
      } else {
        addAlert('info', 'Brief accepted', brief);
      }
      render();
    });
  });

  const qForm = document.getElementById('question-form');
  if (qForm) {
    qForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('question-input') as HTMLInputElement;
      const q = input?.value?.trim();
      if (!q) return;
      if (!state.aiLink.available) {
        addAlert('warn', 'Luci unavailable', `No live link. Question retained locally only: “${q.slice(0, 60)}…”`);
      } else {
        addAlert('info', 'Question submitted', q.slice(0, 80));
      }
      input.value = '';
      render();
    });
  }

  const wForm = document.getElementById('witness-form');
  if (wForm) {
    wForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('claim-input') as HTMLInputElement;
      const claim = input?.value?.trim();
      if (!claim) return;
      await addWitness(claim);
      input.value = '';
    });
  }

  const verifyBtn = document.getElementById('verify-chain');
  if (verifyBtn) {
    verifyBtn.addEventListener('click', () => runChainVerify());
  }

  document.querySelectorAll('[data-sleeve]').forEach(input => {
    input.addEventListener('change', () => {
      const id = (input as HTMLElement).dataset.sleeve!;
      const val = Number((input as HTMLInputElement).value);
      setSleevePct(id, val);
    });
  });

  const oForm = document.getElementById('order-form');
  if (oForm) {
    oForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('order-title') as HTMLInputElement;
      const title = input?.value?.trim();
      if (!title) return;
      createNewOrder(title);
      input.value = '';
    });
  }

  document.querySelectorAll('[data-order]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = (btn as HTMLElement).dataset.order!;
      const to = (btn as HTMLElement).dataset.to as any;
      moveOrder(id, to);
    });
  });
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
  render();
});

// Also run immediately if already loaded
if (document.readyState !== 'loading') {
  render();
}
