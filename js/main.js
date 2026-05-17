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
  initFormEnhancements();
  initSmoothScroll();
  initIntersectionObservers();
});

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
  const nav = document.querySelector('.nav');

  if (!mobileToggle || !navLinks) return;

  // Toggle mobile menu
  mobileToggle.addEventListener('click', function(e) {
    e.preventDefault();
    const isExpanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', !isExpanded);
    navLinks.style.display = isExpanded ? 'none' : 'flex';
    
    // Add mobile menu styles dynamically
    if (!isExpanded) {
      navLinks.style.position = 'absolute';
      navLinks.style.top = '64px';
      navLinks.style.left = '0';
      navLinks.style.right = '0';
      navLinks.style.background = 'rgba(247, 244, 239, 0.98)';
      navLinks.style.backdropFilter = 'blur(8px)';
      navLinks.style.flexDirection = 'column';
      navLinks.style.padding = '1rem';
      navLinks.style.gap = '0.5rem';
      navLinks.style.borderBottom = '1px solid var(--border)';
      navLinks.style.boxShadow = '0 4px 12px rgba(15, 25, 35, 0.1)';
    }
  });

  // Close menu on link click
  const navLinksAll = document.querySelectorAll('.nav-links a');
  navLinksAll.forEach((link) => {
    link.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        mobileToggle.setAttribute('aria-expanded', 'false');
        navLinks.style.display = 'none';
      }
    });
  });

  // Check viewport on resize
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      navLinks.style.display = 'flex';
      navLinks.style.position = '';
      navLinks.style.top = '';
      navLinks.style.left = '';
      navLinks.style.right = '';
      navLinks.style.background = '';
      navLinks.style.backdropFilter = '';
      navLinks.style.flexDirection = '';
      navLinks.style.padding = '';
      navLinks.style.gap = '';
      navLinks.style.borderBottom = '';
      navLinks.style.boxShadow = '';
      mobileToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ============================================================
// Form Enhancements
// ============================================================
function initFormEnhancements() {
  const forms = document.querySelectorAll('form[data-netlify]');
  
  forms.forEach((form) => {
    // Add loading state
    const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('input[type="submit"]');
    if (submitBtn) {
      const originalText = submitBtn.innerHTML || submitBtn.value;
      
      form.addEventListener('submit', function() {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Envoi en cours...';
        submitBtn.style.opacity = '0.7';
      });
    }

    // Auto-fill current year if needed
    const yearInputs = form.querySelectorAll('input[name="year"]');
    yearInputs.forEach((input) => {
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

// Auto-init FAQ on page load
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.faq-q').forEach((q) => {
    q.addEventListener('click', function() {
      this.closest('.faq-item').classList.toggle('open');
    });
  });
});

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
