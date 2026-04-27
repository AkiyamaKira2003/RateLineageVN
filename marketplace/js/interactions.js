/* ============================================================================
   ADVANCED INTERACTIVE FEATURES & ANIMATIONS
   ============================================================================ */

export class InteractionEngine {
  constructor() {
    this.init();
  }

  init() {
    this.setupScrollAnimations();
    this.setupParallaxEffects();
    this.setupHoverEffects();
    this.setupRevealAnimations();
    this.setupMouseTracking();
    this.setupSmoothScroll();
    this.setupIntersectionObserver();
  }

  // ============================================================================
  // SCROLL ANIMATIONS
  // ============================================================================

  setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe product cards
    document.querySelectorAll('.product-card').forEach(card => {
      observer.observe(card);
    });

    // Observe other elements
    document.querySelectorAll('[data-animate]').forEach(el => {
      observer.observe(el);
    });
  }

  // ============================================================================
  // PARALLAX EFFECTS
  // ============================================================================

  setupParallaxEffects() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    if (parallaxElements.length === 0) return;

    window.addEventListener('scroll', () => {
      parallaxElements.forEach(element => {
        const scrollPosition = window.scrollY;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        const distance = scrollPosition - elementPosition;
        const speed = parseFloat(element.getAttribute('data-parallax')) || 0.5;
        
        element.style.transform = `translateY(${distance * speed}px)`;
      });
    });
  }

  // ============================================================================
  // HOVER EFFECTS WITH MOUSE TRACKING
  // ============================================================================

  setupMouseTracking() {
    const hoverElements = document.querySelectorAll('[data-hover-track]');
    
    hoverElements.forEach(element => {
      element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        element.style.setProperty('--mouse-x', `${x}px`);
        element.style.setProperty('--mouse-y', `${y}px`);
        element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      });
      
      element.addEventListener('mouseleave', () => {
        element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
      });
    });
  }

  // ============================================================================
  // REVEAL ANIMATIONS (TEXT, ELEMENTS)
  // ============================================================================

  setupRevealAnimations() {
    const revealElements = document.querySelectorAll('[data-reveal]');
    
    const revealOptions = {
      threshold: 0.15,
      rootMargin: '0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.getAttribute('data-reveal-delay') || '0ms';
          entry.target.style.animationDelay = delay;
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, revealOptions);

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // ============================================================================
  // HOVER EFFECTS
  // ============================================================================

  setupHoverEffects() {
    // Product card hover effect with scale and shadow
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transition = 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)';
        card.classList.add('hover-active');
      });
      
      card.addEventListener('mouseleave', () => {
        card.classList.remove('hover-active');
      });
    });

    // Button hover effects
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
      btn.addEventListener('mouseenter', (e) => {
        this.createRipple(btn, e);
      });
    });
  }

  createRipple(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.className = 'ripple-effect';
    
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }

  // ============================================================================
  // SMOOTH SCROLL
  // ============================================================================

  setupSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        const target = document.querySelector(href);
        
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // ============================================================================
  // INTERSECTION OBSERVER FOR LAZY LOADING & ANIMATIONS
  // ============================================================================

  setupIntersectionObserver() {
    const options = {
      threshold: [0, 0.25, 0.5, 0.75, 1],
      rootMargin: '0px'
    };

    const callback = (entries) => {
      entries.forEach(entry => {
        const element = entry.target;
        
        if (entry.isIntersecting) {
          element.classList.add('in-view');
          
          // Trigger lazy loaded images
          if (element.tagName === 'IMG' && element.dataset.src) {
            element.src = element.dataset.src;
            element.removeAttribute('data-src');
          }
        } else {
          element.classList.remove('in-view');
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);
    
    // Observe all images and data-animated elements
    document.querySelectorAll('img, [data-animated]').forEach(el => {
      observer.observe(el);
    });
  }
}

// ============================================================================
// ADVANCED ANIMATIONS
// ============================================================================

export class AnimationController {
  constructor() {
    this.animations = new Map();
    this.init();
  }

  init() {
    this.setupCountUpAnimations();
    this.setupProgressBars();
    this.setupTypingEffect();
  }

  setupCountUpAnimations() {
    const countElements = document.querySelectorAll('[data-count-up]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          this.animateCountUp(entry.target);
          entry.target.classList.add('counted');
        }
      });
    });

    countElements.forEach(el => observer.observe(el));
  }

  animateCountUp(element) {
    const target = parseInt(element.getAttribute('data-count-up'));
    const duration = parseInt(element.getAttribute('data-duration') || 2000);
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(target * progress);
      
      element.textContent = current.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }

  setupProgressBars() {
    const progressBars = document.querySelectorAll('[data-progress]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('started')) {
          const value = parseInt(entry.target.getAttribute('data-progress'));
          entry.target.style.width = value + '%';
          entry.target.classList.add('started');
        }
      });
    });

    progressBars.forEach(bar => observer.observe(bar));
  }

  setupTypingEffect() {
    const typingElements = document.querySelectorAll('[data-typing]');
    
    typingElements.forEach(element => {
      const text = element.getAttribute('data-typing');
      const speed = parseInt(element.getAttribute('data-speed') || 50);
      
      let index = 0;
      element.textContent = '';
      
      const type = () => {
        if (index < text.length) {
          element.textContent += text.charAt(index);
          index++;
          setTimeout(type, speed);
        }
      };
      
      // Start typing when element is in view
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          type();
          observer.unobserve(element);
        }
      });
      
      observer.observe(element);
    });
  }
}

// ============================================================================
// PAGE TRANSITIONS
// ============================================================================

export class PageTransitions {
  constructor() {
    this.setupTransitions();
  }

  setupTransitions() {
    // Fade out on navigation
    document.querySelectorAll('a:not([target="_blank"]):not([download])').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        // Don't apply transition to hash links or same-page navigation
        if (href.startsWith('#') || href === window.location.pathname) {
          return;
        }

        e.preventDefault();
        
        document.body.style.animation = 'fadeOut 300ms ease-out';
        setTimeout(() => {
          window.location.href = href;
        }, 300);
      });
    });
  }
}

// ============================================================================
// FLOATING PARTICLES BACKGROUND (Optional)
// ============================================================================

export class ParticleBackground {
  constructor(canvasSelector = '#particle-canvas') {
    const canvas = document.querySelector(canvasSelector);
    if (!canvas) return;
    
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 50;
    
    this.resize();
    this.createParticles();
    this.animate();
    
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;
      
      this.ctx.fillStyle = `rgba(99, 91, 255, ${particle.opacity})`;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    requestAnimationFrame(() => this.animate());
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new InteractionEngine();
    new AnimationController();
    new PageTransitions();
  });
} else {
  new InteractionEngine();
  new AnimationController();
  new PageTransitions();
}
