/**
 * NexaCore — Main Script
 * Handles: loader, navbar, theme, hamburger, counters,
 *          portfolio filter, testimonial slider, contact form, AOS
 */

/* =============================================
   1. LOADER
   ============================================= */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => loader.classList.add('hidden'), 600);
});

/* =============================================
   2. AOS INIT
   ============================================= */
AOS.init({
  duration: 700,
  once: true,
  offset: 80,
  easing: 'ease-out-cubic',
});

/* =============================================
   3. NAVBAR — scroll + active link
   ============================================= */
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  // Sticky style
  navbar.classList.toggle('scrolled', window.scrollY > 40);

  // Active link highlight
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}, { passive: true });

/* =============================================
   4. HAMBURGER MENU
   ============================================= */
const hamburger = document.getElementById('hamburger');
const navLinksContainer = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navLinksContainer.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close on link click
navLinksContainer.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinksContainer.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
    document.body.style.overflow = '';
  });
});

// Close on outside click
document.addEventListener('click', e => {
  if (!navbar.contains(e.target)) {
    hamburger.classList.remove('open');
    navLinksContainer.classList.remove('open');
    document.body.style.overflow = '';
  }
});

/* =============================================
   5. DARK / LIGHT MODE TOGGLE
   ============================================= */
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.theme-icon');
const savedTheme = localStorage.getItem('theme') || 'light';

applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const isDark = document.body.classList.contains('dark-mode');
  applyTheme(isDark ? 'light' : 'dark');
});

function applyTheme(theme) {
  document.body.classList.toggle('dark-mode', theme === 'dark');
  document.body.classList.toggle('light-mode', theme === 'light');
  themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', theme);
}

/* =============================================
   6. ANIMATED COUNTERS
   ============================================= */
const counters = document.querySelectorAll('.counter');
let countersStarted = false;

function startCounters() {
  if (countersStarted) return;
  const aboutSection = document.getElementById('about');
  if (!aboutSection) return;
  const rect = aboutSection.getBoundingClientRect();
  if (rect.top < window.innerHeight - 100) {
    countersStarted = true;
    counters.forEach(counter => animateCounter(counter));
  }
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      el.textContent = target + '+';
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current);
    }
  }, 16);
}

window.addEventListener('scroll', startCounters, { passive: true });
startCounters(); // run on load in case already in view

/* =============================================
   7. PORTFOLIO FILTER
   ============================================= */
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    portfolioItems.forEach(item => {
      const match = filter === 'all' || item.dataset.category === filter;
      item.style.transition = 'opacity 0.3s, transform 0.3s';
      if (match) {
        item.classList.remove('hidden');
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
      } else {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.9)';
        setTimeout(() => item.classList.add('hidden'), 300);
      }
    });
  });
});

/* =============================================
   8. TESTIMONIAL SLIDER
   ============================================= */
const track = document.getElementById('testimonialTrack');
const cards = track ? track.querySelectorAll('.testimonial-card') : [];
const dotsContainer = document.getElementById('sliderDots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let currentSlide = 0;
let autoSlideTimer;

// Build dots
cards.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
  dot.addEventListener('click', () => goToSlide(i));
  dotsContainer.appendChild(dot);
});

function goToSlide(index) {
  currentSlide = (index + cards.length) % cards.length;
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
  document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === currentSlide));
  resetAutoSlide();
}

function resetAutoSlide() {
  clearInterval(autoSlideTimer);
  autoSlideTimer = setInterval(() => goToSlide(currentSlide + 1), 5000);
}

if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

// Touch/swipe support
let touchStartX = 0;
if (track) {
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1);
  });
}

resetAutoSlide();

/* =============================================
   9. CONTACT FORM VALIDATION
   ============================================= */
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    // Loading state
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';
    submitBtn.disabled = true;

    // Simulate async submission (replace with real API call)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Success state
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
    submitBtn.disabled = false;
    contactForm.reset();
    document.getElementById('formSuccess').classList.add('show');
    setTimeout(() => document.getElementById('formSuccess').classList.remove('show'), 5000);
  });

  // Live validation on blur
  ['name', 'email', 'subject', 'message'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', () => validateField(id));
  });
}

function validateForm() {
  const fields = ['name', 'email', 'subject', 'message'];
  return fields.map(id => validateField(id)).every(Boolean);
}

function validateField(id) {
  const el = document.getElementById(id);
  const errorEl = document.getElementById(id + 'Error');
  if (!el || !errorEl) return true;

  const value = el.value.trim();
  let error = '';

  if (!value) {
    error = 'This field is required.';
  } else if (id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    error = 'Please enter a valid email address.';
  } else if (id === 'name' && value.length < 2) {
    error = 'Name must be at least 2 characters.';
  } else if (id === 'message' && value.length < 10) {
    error = 'Message must be at least 10 characters.';
  }

  el.classList.toggle('error', !!error);
  errorEl.textContent = error;
  return !error;
}

/* =============================================
   10. SMOOTH SCROLL for anchor links
   ============================================= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
