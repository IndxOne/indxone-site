/**
 * INDXONE — Main JavaScript
 * Core functionality for all pages
 */

// ============================================================
// DOM Ready
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  initRevealAnimations();
  initMobileMenu();
  initContextualProjectLinks();
  initFormEnhancements();
  initSmoothScroll();
  initIntersectionObservers();
  
  // Auto-init FAQ on page load
  document.querySelectorAll('.faq-q').forEach((q) => {
    q.addEventListener('click', function() {
      this.closest('.faq-item').classList.toggle('open');
    });
  });
});

function initContextualProjectLinks() {
  var isHome = window.location.pathname === '/' || window.location.pathname === '/index.html';
  if (isHome) return;
  var target = document.body.dataset.formContext === 'collectivite'
    ? '/votre-idee/?type=collectivite'
    : '/votre-idee/';
  document.querySelectorAll('a[href="/votre-idee"], a[href="/#contact"]').forEach((link) => {
    link.href = target;
  });
}

// ============================================================
// Reveal Animations
// ============================================================
function initRevealAnimations() {
  const revealElements = document.querySelectorAll('.reveal');
  
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.06,
      rootMargin: '0px 0px -20px 0px'
    });

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback for browsers without IntersectionObserver
    revealElements.forEach((el) => el.classList.add('in'));
  }
}

// ============================================================
// Mobile Menu
// ============================================================
function initMobileMenu() {
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const backdrop = document.querySelector('.mobile-menu-backdrop');

  if (!mobileToggle || !navLinks) return;

  const closeMenu = (restoreFocus = false) => {
    navLinks.setAttribute('data-open', 'false');
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.setAttribute('aria-label', 'Menu');
    document.body.classList.remove('menu-open');
    if (restoreFocus) mobileToggle.focus();
  };

  const openMenu = () => {
    navLinks.setAttribute('data-open', 'true');
    mobileToggle.setAttribute('aria-expanded', 'true');
    mobileToggle.setAttribute('aria-label', 'Fermer le menu');
    document.body.classList.add('menu-open');
  };

  mobileToggle.addEventListener('click', function(e) {
    e.preventDefault();
    const isExpanded = this.getAttribute('aria-expanded') === 'true';
    if (isExpanded) closeMenu();
    else openMenu();
  });

  // Close menu on link click
  const navLinksAll = document.querySelectorAll('.nav-links a');
  navLinksAll.forEach((link) => {
    link.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        closeMenu(true);
      }
    });
  });

  backdrop?.addEventListener('click', () => closeMenu(true));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileToggle.getAttribute('aria-expanded') === 'true') {
      closeMenu(true);
    }
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.querySelectorAll('a').forEach((item) => item.removeAttribute('aria-current'));
      link.setAttribute('aria-current', 'page');
    });
  });

  // Check viewport on resize
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });
}

// ============================================================
// Form Enhancements (AJAX + error/success states)
// ============================================================
function initFormEnhancements() {
  var forms = document.querySelectorAll('form[data-netlify]');

  forms.forEach(function (form) {
    // Le parcours guidé possède son propre payload et son propre endpoint.
    // Ne pas lui appliquer le gestionnaire générique du formulaire contact.
    if (form.dataset.customSubmit === 'true') return;

    var loadingText = '<span class="spinner"></span> Envoi en cours\u2026';
    var successText = 'Envoy\u00e9 \u2713';
    var errorText = 'Erreur \u2014 r\u00e9essayer';

    var submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('input[type="submit"]');
    if (!submitBtn) return;

    var originalText = submitBtn.innerHTML || submitBtn.value;

    // Inject hidden timing field for antispam
    var startedField = form.querySelector('input[name="started_at"]');
    if (!startedField) {
      startedField = document.createElement('input');
      startedField.type = 'hidden';
      startedField.name = 'started_at';
      form.appendChild(startedField);
    }
    startedField.value = new Date().toISOString();

    // Inject hidden lang field
    var langField = form.querySelector('input[name="lang"]');
    if (!langField) {
      langField = document.createElement('input');
      langField.type = 'hidden';
      langField.name = 'lang';
      form.appendChild(langField);
    }
    langField.value = 'fr';

    // Remove display:none honeypot visual (kept hidden)
    var botField = form.querySelector('input[name="bot_field"]');
    if (botField) {
      botField.setAttribute('tabindex', '-1');
      botField.setAttribute('autofocus', 'false');
    }

    form.addEventListener('submit', function (e) {
      // Prevent native submission — use AJAX
      e.preventDefault();

      // Guard: already submitting
      if (submitBtn.disabled) return;
      submitBtn.disabled = true;
      submitBtn.innerHTML = loadingText;
      submitBtn.style.opacity = '0.7';

      // Clear previous errors
      var prevError = form.querySelector('.form-error');
      if (prevError) prevError.remove();

      // Collect form data
      var formData = new FormData(form);
      var payload = {};
      formData.forEach(function (value, key) {
        payload[key] = value;
      });

      // Determine endpoint
      var endpoint = '/api/contact';

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (resp) {
          if (!resp.ok) {
            return resp.json().catch(function () {
              return { error: 'Erreur serveur' };
            }).then(function (data) {
              throw new Error(data.error || data.details ? data.details.join(', ') : 'Erreur ' + resp.status);
            });
          }
          return resp.json();
        })
        .then(function () {
          // Success
          submitBtn.innerHTML = successText;
          submitBtn.style.opacity = '1';
          submitBtn.style.background = 'var(--green, #2a7a4b)';

          // Redirect to thank-you page after short delay
          var redirectUrl = '/merci';
          setTimeout(function () {
            window.location.href = redirectUrl;
          }, 800);
        })
        .catch(function (err) {
          // Error — re-enable form
          submitBtn.disabled = false;
          submitBtn.innerHTML = errorText;
          submitBtn.style.opacity = '1';
          submitBtn.style.background = 'var(--red, #c0392b)';

          // Show error message below button
          var errorDiv = document.createElement('div');
          errorDiv.className = 'form-error';
          errorDiv.setAttribute('role', 'alert');
          errorDiv.textContent = err.message || 'Une erreur est survenue. R\u00e9essayez ou contactez-nous directement.';
          form.appendChild(errorDiv);

          // Reset button after 4s
          setTimeout(function () {
            submitBtn.innerHTML = originalText;
            submitBtn.style.background = '';
          }, 4000);
        });
    });

    // Auto-fill current year if needed
    var yearInputs = form.querySelectorAll('input[name="year"]');
    yearInputs.forEach(function (input) {
      if (!input.value) {
        input.value = new Date().getFullYear();
      }
    });
  });
}

// ============================================================
// Smooth Scroll
// ============================================================
function initSmoothScroll() {
  // Handle anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        
        // Calculate position with navbar offset
        const navHeight = document.querySelector('.nav')?.offsetHeight || 0;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Focus for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus();
      }
    });
  });
}

// ============================================================
// Intersection Observers
// ============================================================
function initIntersectionObservers() {
  // Lazy load images
  const lazyImages = document.querySelectorAll('img[data-src]');
  
  if ('IntersectionObserver' in window && lazyImages.length > 0) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '100px'
    });

    lazyImages.forEach((img) => imageObserver.observe(img));
  }

  // Animate stats on scroll
  const statElements = document.querySelectorAll('.hero-stat strong, .bc-stat strong');
  
  if (statElements.length > 0) {
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          animateValue(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.5
    });

    statElements.forEach((stat) => statObserver.observe(stat));
  }
}

// ============================================================
// Utility Functions
// ============================================================

// Animate numeric values
function animateValue(element) {
  const text = element.textContent;
  const hasNumber = /\d+/.test(text);
  
  if (!hasNumber) return;
  
  const match = text.match(/(\d+)/);
  if (!match) return;
  
  const targetValue = parseInt(match[1], 10);
  const prefix = text.substring(0, text.indexOf(match[1]));
  const suffix = text.substring(text.indexOf(match[1]) + match[1].length);
  
  let currentValue = 0;
  const duration = 1000;
  const steps = 20;
  const increment = targetValue / steps;
  const stepDuration = duration / steps;
  
  const timer = setInterval(() => {
    currentValue += increment;
    if (currentValue >= targetValue) {
      currentValue = targetValue;
      clearInterval(timer);
    }
    element.textContent = prefix + Math.floor(currentValue) + suffix;
  }, stepDuration);
}

// Debounce function for resize events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for scroll events
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Check if element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// ============================================================
// Filter Functions (for projets page)
// ============================================================

// Global filter function
window.filterProjet = function(btn, type) {
  document.querySelectorAll('.pf-btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  
  document.querySelectorAll('.bento-card, .bc').forEach((card) => {
    const match = type === 'all' || card.dataset.type === type;
    if (match) {
      card.style.opacity = '1';
      card.style.transform = '';
      card.style.display = '';
    } else {
      card.style.opacity = '0.15';
      card.style.transform = 'scale(0.97)';
      card.style.display = 'none';
    }
    card.style.transition = 'opacity 0.3s, transform 0.3s';
  });
};

// Alternative filter for projets/index.html
window.filterP = function(btn, type) {
  document.querySelectorAll('.pf-btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  
  document.querySelectorAll('.bc').forEach((card) => {
    const match = type === 'all' || card.dataset.type === type;
    card.style.opacity = match ? '1' : '0.15';
    card.style.transform = match ? '' : 'scale(0.97)';
    card.style.transition = 'opacity 0.3s, transform 0.3s';
  });
};

// ============================================================
// FAQ Toggle
// ============================================================
window.toggleFAQ = function(button) {
  const faqItem = button.closest('.faq-item');
  faqItem.classList.toggle('open');
};

// ============================================================
// Console Easter Egg
// ============================================================
console.log(
  '%c🚀 INDXONE %c— Consultant SI & Architecte Digital',
  'color: #C9A84C; font-size: 20px; font-weight: bold;',
  'color: #0F1923; font-size: 20px;' 
);
console.log('%cBesoin d\'un projet IT ? Contactez-moi !', 'color: #2A7A4B; font-size: 14px;');
console.log('%c📧 contact@indxone.com | 📞 07 75 67 90 67', 'color: #1B3A6B; font-size: 12px;');
