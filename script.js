// ── MODAL CONTENT ──
const modals = {
  'web-dev': {
    tag: 'Web Development',
    title: 'Website Development',
    problem: 'Potential customers are finding your competitors first because their sites load faster and look more credible.',
    outcome: 'A clean, fast, mobile-ready website that converts visitors into enquiries.',
    includes: [
      'Up to 5 pages built from scratch',
      'Works on every device and screen size',
      'Contact form that routes straight to your inbox',
      'Basic SEO so customers can find you on Google',
      'Two rounds of revisions included',
      'Delivered in 7 to 10 working days'
    ]
  },
  'repair': {
    tag: 'Repair and Redesign',
    title: 'Repair and Redesign',
    problem: 'Your existing site is slow, broken, or outdated and it is costing you customers every day.',
    outcome: 'A rebuilt, fast-loading site that stops visitors leaving before they contact you.',
    includes: [
      'Full audit of what is wrong and why',
      'Rebuilding the structure and removing bloat',
      'Mobile performance optimised',
      'Loading speed improved measurably',
      'Three rounds of revisions included'
    ]
  },
  'linux': {
    tag: 'Linux Infrastructure',
    title: 'Linux Server Setup',
    problem: 'A server going down at 3am should not be something you have to deal with personally.',
    outcome: 'A hardened Linux server that stays up, stays secure, and does not need babysitting.',
    includes: [
      'Ubuntu, Debian, or Raspbian provisioning',
      'SSH key policies and root access locked down',
      'Firewall rules configured with UFW or iptables',
      'Automated backup scripts set up',
      'Full handover documentation',
      'Completed in 3 to 5 working days'
    ]
  },
  'monitoring': {
    tag: 'iPaaS Monitoring',
    title: 'Infrastructure Monitoring',
    problem: 'You find out your server is down when a client tells you, not before.',
    outcome: 'Real-time alerts the moment something goes wrong, before downtime hits your clients.',
    includes: [
      'C agent reads directly from the Linux kernel',
      'CPU temperature, RAM usage, and load monitored',
      'Alerts sent to Slack, Teams, or Discord',
      'Full SQLite audit trail stored locally',
      'Auto-shutdown if temperature exceeds threshold',
      'Deployed in under 10 minutes via one script'
    ]
  },
  'vpn': {
    tag: 'Network Security',
    title: 'VPN and Network Security',
    problem: 'Your team is working remotely on public networks, and business data is travelling unencrypted.',
    outcome: 'A private encrypted network your team trusts from anywhere in the world.',
    includes: [
      'WireGuard or OpenVPN configuration',
      'Firewall rules and routing policies set up',
      'Remote access for multiple team members',
      'Server log monitoring configured',
      'Full documentation and credentials handover'
    ]
  },
  'proxmox': {
    tag: 'Virtualisation',
    title: 'Proxmox and Virtual Labs',
    problem: 'Testing updates on a live production system is a risk your business should not be taking.',
    outcome: 'Isolated environments where you can test safely without touching what is live.',
    includes: [
      'Proxmox hypervisor installed and configured',
      'Linux and Windows VMs set up',
      'Network isolation between lab and production',
      'Snapshot and rollback configured',
      'Full documentation of the lab layout'
    ]
  }
};

// ── MODAL LOGIC ──
const overlay = document.getElementById('modal-overlay');
const modalBox = document.getElementById('modal-box');
const modalContent = document.getElementById('modal-content');
const modalClose = document.getElementById('modal-close');

function openModal(key) {
  const m = modals[key];
  if (!m) return;
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
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

document.querySelectorAll('.s-card').forEach(card => {
  card.addEventListener('click', () => openModal(card.dataset.modal));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') openModal(card.dataset.modal);
  });
});

modalClose.addEventListener('click', closeModal);
overlay.addEventListener('click', e => {
  if (e.target === overlay) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ── SCROLL FADE ──
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      fadeObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.fade').forEach(el => fadeObserver.observe(el));

// ── COUNTER ANIMATION ──
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const duration = 1600;
  const start = performance.now();
  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(target * eased) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      counterObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

// ── FAQ ACCORDION ──
document.querySelectorAll('.faq-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ── FORM AJAX ──
const form = document.getElementById('contact-form');
const success = document.getElementById('form-success');
if (form && success) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending...';
    btn.disabled = true;
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        form.style.display = 'none';
        success.style.display = 'block';
      } else {
        btn.textContent = 'Try again';
        btn.disabled = false;
      }
    } catch {
      btn.textContent = 'Try again';
      btn.disabled = false;
    }
  });
}
