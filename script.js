// JS SMOOTH SCROLLING WITH EXACT OFFSET
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      e.preventDefault();
      const nav = document.getElementById('mainNav');
      const navHeight = nav ? nav.offsetHeight : 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight - 20;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      if (navLinks && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        if (navToggle) {
          navToggle.classList.remove('active');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      }
    }
  });
});

// Mobile Nav Toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
  });
}

// WhatsApp Chatbot Toggle
const waToggle = document.getElementById('waToggle');
const waBox = document.getElementById('waBox');
if (waToggle && waBox) {
  waToggle.addEventListener('click', () => {
    waBox.classList.toggle('active');
  });
}

// Back to Top Button
const backToTopBtn = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  if (window.pageYOffset > 400) {
    backToTopBtn.classList.add('show');
  } else {
    backToTopBtn.classList.remove('show');
  }

  // Active Nav Highlight
  let current = '';
  const sections = document.querySelectorAll('section, .hero');
  const nav = document.getElementById('mainNav');
  const navHeight = nav ? nav.offsetHeight : 80;

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    if (pageYOffset >= sectionTop - navHeight - 60) {
      current = section.getAttribute('id');
    }
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') === `#${current}`) {
      a.classList.add('active');
    }
  });
});

if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// FAQ Accordion
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    item.classList.toggle('active');
  });
});

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObs.observe(el));

// Count-up stats
const statEls = document.querySelectorAll('.stat-num');
const seen = new Set();
function animateStat(el) {
  const target = parseFloat(el.dataset.target);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const dur = 1300; const start = performance.now();
  function frame(now) {
    const p = Math.min(1, (now - start) / dur);
    const val = Math.round(target * (1 - Math.pow(1 - p, 3)));
    el.textContent = prefix + val + suffix;
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
const statObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && !seen.has(e.target)) { seen.add(e.target); animateStat(e.target); }
  });
}, { threshold: 0.4 });
statEls.forEach(el => statObs.observe(el));

// CONTACT FORM SUBMISSION -> email (Web3Forms) + WhatsApp message to business number
const WA_NUMBER = '919214491585'; // yahan apna WhatsApp number (country code ke saath, bina + ke)
const leadForm = document.getElementById('leadForm');
const formStatus = document.getElementById('formStatus');

function buildWhatsAppUrl(d) {
  const text = [
    'Hi A2 Raccoon, I just submitted an inquiry on your website:',
    '',
    `Name: ${d.name}`,
    `Email: ${d.email}`,
    `Phone: ${d.phone}`,
    `Store Link: ${d.store || 'N/A'}`,
    `Message: ${d.message || 'N/A'}`
  ].join('\n');
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

if (leadForm) {
  leadForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const sendBtn = document.getElementById('formSendBtn');
    const formData = new FormData(leadForm);
    const waUrl = buildWhatsAppUrl({
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      store: formData.get('store_url'),
      message: formData.get('message')
    });

    // Tab abhi (click ke time) kholte hain taaki popup-blocker na roke
    const waWin = window.open('', '_blank');

    sendBtn.disabled = true;
    formStatus.style.display = 'block';
    formStatus.style.color = '#0E7C86';
    formStatus.textContent = '⏳ Submitting your inquiry...';

    let emailed = false;
    try {
      const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
      const json = await response.json();
      emailed = response.ok && json.success !== false;
    } catch (err) { /* network issue: WhatsApp fallback below */ }

    formStatus.textContent = emailed
      ? '✓ Details received! Opening WhatsApp - please tap Send to confirm.'
      : 'Opening WhatsApp - please tap Send to share your details.';

    setTimeout(() => {
      if (waWin && !waWin.closed) waWin.location.href = waUrl;
      else window.location.href = waUrl;
      leadForm.reset();
      sendBtn.disabled = false;
      setTimeout(() => { formStatus.style.display = 'none'; }, 4000);
    }, 900);
  });
}
