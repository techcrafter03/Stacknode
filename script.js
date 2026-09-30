// ── CURRENCY TOGGLE ──
const prices = {
  eur: { starter: '€599', business: '€1,290', infra: '€399', ipaas: '€199', care: '€99', care2: '€199', extra: '€149' },
  usd: { starter: '$649', business: '$1,399', infra: '$439', ipaas: '$219', care: '$109', care2: '$219', extra: '$159' }
};
const selectLabels = {
  eur: ['Website Starter (€599)', 'Website Business (€1,290)', 'Linux Setup (€399 per server)', 'iPaaS Monitoring (€199)'],
  usd: ['Website Starter ($649)', 'Website Business ($1,399)', 'Linux Setup ($439 per server)', 'iPaaS Monitoring ($219)']
};
let currentCurrency = 'eur';

function setCurrency(cur) {
  currentCurrency = cur;
  const p = prices[cur];
  document.querySelectorAll('[data-price]').forEach(el => {
    const key = el.dataset.price;
    if (p[key]) el.textContent = p[key];
  });
  const sel = document.getElementById('service');
  if (sel) {
    const opts = sel.querySelectorAll('option');
    selectLabels[cur].forEach((label, i) => {
      if (opts[i + 1]) opts[i + 1].textContent = label;
    });
  }
  document.querySelectorAll('.cur-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cur === cur);
  });
}

document.querySelectorAll('.cur-btn').forEach(btn => {
  btn.addEventListener('click', () => setCurrency(btn.dataset.cur));
});

// ── TERMINAL ANIMATION ──
const terminalBody = document.getElementById('terminal-body');

const phase1Steps = [
  { type: 'cmd',  text: './setup.sh' },
  { type: 'ok',   text: 'C engine compiled successfully' },
  { type: 'ok',   text: 'systemd timer registered (5min)' },
  { type: 'ok',   text: 'SQLite database initialised' },
  { type: 'ok',   text: 'Webhook endpoint configured' },
  { type: 'info', text: 'Starting kernel monitor...' },
];

function ts() {
  const n = new Date();
  return [n.getHours(), n.getMinutes(), n.getSeconds()].map(v => String(v).padStart(2, '0')).join(':');
}
function ri(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

const phase2Fns = [
  () => `[${ts()}]  CPU ${ri(38, 55)}C   RAM ${ri(28, 45)}%   OK`,
  () => `[${ts()}]  CPU ${ri(38, 55)}C   RAM ${ri(28, 45)}%   OK`,
  () => `[${ts()}]  LOAD ${(Math.random() * 0.8 + 0.1).toFixed(2)}   DISK ${ri(12, 38)}%   OK`,
  () => `[${ts()}]  CPU ${ri(38, 55)}C   RAM ${ri(28, 45)}%   OK`,
  () => `[${ts()}]  ALERT: CPU spike 78C  [WARN]`,
  () => `[${ts()}]  Webhook fired → Discord notified`,
  () => `[${ts()}]  CPU ${ri(42, 52)}C   cooldown OK`,
  () => `[${ts()}]  CPU ${ri(38, 48)}C   RAM ${ri(28, 45)}%   OK`,
];

function addLine(cls, text) {
  if (!terminalBody) return;
  const div = document.createElement('div');
  div.className = 't-line ' + cls;
  div.style.opacity = '0';
  div.textContent = text;
  terminalBody.appendChild(div);
  setTimeout(() => { div.style.transition = 'opacity .25s'; div.style.opacity = '1'; }, 20);
  const lines = terminalBody.querySelectorAll('.t-line');
  if (lines.length > 16) lines[0].remove();
}

function typeCmd(text, cb) {
  if (!terminalBody) return;
  const div = document.createElement('div');
  div.className = 't-line t-cmd';
  const prompt = document.createElement('span');
  prompt.className = 't-prompt';
  prompt.textContent = '$ ';
  div.appendChild(prompt);
  terminalBody.appendChild(div);
  let i = 0;
  const cursor = document.createElement('span');
  cursor.className = 't-cursor';
  cursor.textContent = '|';
  div.appendChild(cursor);
  const iv = setInterval(() => {
    cursor.before(document.createTextNode(text[i]));
    i++;
    if (i >= text.length) {
      clearInterval(iv);
      cursor.remove();
      setTimeout(cb, 200);
    }
  }, 55);
}

function runPhase1(index) {
  if (!terminalBody) return;
  if (index >= phase1Steps.length) { setTimeout(runPhase2, 700); return; }
  const step = phase1Steps[index];
  if (step.type === 'cmd') {
    typeCmd(step.text, () => runPhase1(index + 1));
  } else {
    setTimeout(() => {
      addLine(step.type === 'ok' ? 't-success' : 't-info', (step.type === 'ok' ? '[OK] ' : '     ') + step.text);
      setTimeout(() => runPhase1(index + 1), 130);
    }, 110);
  }
}

let p2i = 0;
let p2Active = true;
function runPhase2() {
  if (!terminalBody || !p2Active) { setTimeout(runPhase2, 800); return; }
  const text = phase2Fns[p2i % phase2Fns.length]();
  const isAlert = text.includes('ALERT') || text.includes('WARN');
  const isHook = text.includes('Webhook');
  addLine(isAlert ? 't-warn' : isHook ? 't-webhook' : 't-log', text);
  p2i++;
  setTimeout(runPhase2, p2i % 3 === 0 ? 2600 : 1500);
}

if (terminalBody) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { runPhase1(0); obs.disconnect(); } });
  }, { threshold: 0.3 });
  obs.observe(terminalBody);

  const visObs = new IntersectionObserver(entries => {
    entries.forEach(e => { p2Active = e.isIntersecting; });
  }, { threshold: 0.1 });
  visObs.observe(terminalBody);
}

// ── MODALS ──
const modals = {
  'web-dev': {
    tag: 'Web Development', title: 'Website Development',
    problem: 'Potential customers are finding your competitors first because their sites load faster and look more credible.',
    outcome: 'A clean, fast, mobile-ready website that converts visitors into enquiries.',
    includes: ['Up to 5 pages built from scratch', 'Works on every device and screen size', 'Contact form routing to your inbox', 'Basic SEO so customers can find you', 'Two rounds of revisions included', 'Delivered in 7 to 10 working days']
  },
  'repair': {
    tag: 'Repair and Redesign', title: 'Repair and Redesign',
    problem: 'Your existing site is slow, broken, or outdated and costing you customers every day.',
    outcome: 'A rebuilt, fast-loading site that stops visitors leaving before they contact you.',
    includes: ['Full audit of what is wrong and why', 'Structure rebuilt, bloat removed', 'Mobile performance optimised', 'Loading speed improved measurably', 'Three rounds of revisions included']
  },
  'linux': {
    tag: 'Linux Infrastructure', title: 'Linux Server Setup',
    problem: 'A server going down at 3am should not be something you deal with personally.',
    outcome: 'A hardened, documented Linux server that you can hand to anyone.',
    includes: ['Ubuntu, Debian, or Raspberry Pi OS provisioning', 'SSH key policies, root access locked down', 'Firewall configured with UFW or iptables', 'Automated backup scripts', 'Full handover documentation', 'Optional monthly care plan for ongoing maintenance', 'Completed in 3 to 5 working days']
  },
  'monitoring': {
    tag: 'iPaaS Monitoring', title: 'Infrastructure Monitoring',
    problem: 'You find out your server is down when a client tells you, not before.',
    outcome: 'Alerts within minutes of a problem, so you can act before your clients call.',
    includes: ['C agent reads directly from Linux kernel', 'CPU temp, RAM, and load monitored', 'Webhook alerts, checked every 5 minutes (Discord live, Slack and Teams in development)', 'Full SQLite audit trail stored locally', 'Optional protective shutdown at a critical temperature', 'Best suited to physical servers and edge devices', 'Deployed in under 10 minutes']
  },
  'vpn': {
    tag: 'Network Security', title: 'VPN and Network Security',
    problem: 'Your team is on public networks and business data is travelling unencrypted.',
    outcome: 'A private encrypted network your team trusts from anywhere.',
    includes: ['WireGuard VPN configuration', 'Firewall rules and routing policies', 'Remote access for multiple team members', 'Server log monitoring configured', 'Full documentation and credentials handover']
  },
  'proxmox': {
    tag: 'Virtualisation', title: 'Proxmox and Virtual Labs',
    problem: 'Testing updates on a live production system is a risk your business should not be taking.',
    outcome: 'Isolated environments where you test safely without touching what is live.',
    includes: ['Proxmox hypervisor installed and configured', 'Linux and Windows VMs set up', 'Network isolation between lab and production', 'Snapshot and rollback configured', 'Full documentation of the lab layout']
  }
};

const overlay = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');
const modalClose = document.getElementById('modal-close');

function openModal(key) {
  const m = modals[key];
  if (!m || !overlay || !modalContent) return;
  modalContent.innerHTML = `
    <span class="modal-tag">${m.tag}</span>
    <h3>${m.title}</h3>
    <p><strong style="color:var(--white)">The problem:</strong> ${m.problem}</p>
    <p><strong style="color:var(--white)">What you get:</strong> ${m.outcome}</p>
    <ul>${m.includes.map(i => `<li>${i}</li>`).join('')}</ul>
    <a href="#contact" class="btn btn-blue btn-full" onclick="closeModal()">Get started</a>
  `;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

if (modalClose) modalClose.addEventListener('click', closeModal);
if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
document.querySelectorAll('.s-card').forEach(card => {
  card.addEventListener('click', () => openModal(card.dataset.modal));
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openModal(card.dataset.modal); });
});

// ── SCROLL FADE ──
const fadeObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); fadeObs.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.fade').forEach(el => fadeObs.observe(el));

// ── COUNTERS ──
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const start = performance.now();
  const duration = 1600;
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const cntObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); cntObs.unobserve(e.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(el => cntObs.observe(el));

// ── FAQ ──
document.querySelectorAll('.faq-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ── FORM ──
const form = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');
if (form && formSuccess) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending...';
    btn.disabled = true;
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (res.ok) { form.style.display = 'none'; formSuccess.style.display = 'block'; }
      else { btn.textContent = 'Try again'; btn.disabled = false; }
    } catch { btn.textContent = 'Try again'; btn.disabled = false; }
  });
}
