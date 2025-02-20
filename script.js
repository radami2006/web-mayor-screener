// script.js

// --- Smooth Scrolling (Optional) ---
//  Adds smooth scrolling to anchor links within the page.

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
  
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
  
  // --- Responsive Navigation (Optional) ---
  //  Example:  Could add a "hamburger" menu toggle for very small screens.
  //  This is a *basic* example and might need adjustments depending on your exact design.
  
  //  (You would need to add a "hamburger" icon/button in your HTML, and some additional CSS)
  
  const navToggle = document.createElement('button');
  navToggle.className = 'nav-toggle';
  navToggle.innerHTML = '<i class="fas fa-bars"></i>';
  document.querySelector('header nav').prepend(navToggle);
  
  navToggle.addEventListener('click', () => {
      document.querySelector('header nav ul').classList.toggle('active');
  });
  
  // --- Placeholder for Other JavaScript Functionality ---
  //  Add any other JavaScript code here, such as:
  //  - Image carousel/slider logic (if using)
  //  - Form validation (for the contact form on the contact page)
  //  - Interactions with a chatbot (if implementing the bonus challenge)
  
  // Example:  Very basic form validation (for the contact.html page - move this to contact.js later)
  
  const contactForm = document.querySelector('form'); // Assuming you have a <form>
  
  if (contactForm) {
      contactForm.addEventListener('submit', (event) => {
          event.preventDefault(); // Prevent default form submission
  
          const nameInput = document.getElementById('name');
          const emailInput = document.getElementById('email');
          const messageInput = document.getElementById('message');
  
          // Basic validation (check if fields are not empty)
          if (nameInput.value.trim() === '') {
              alert('Please enter your name.');
              nameInput.focus();
              return;
          }
  
          if (emailInput.value.trim() === '' || !isValidEmail(emailInput.value)) {
              alert('Please enter a valid email address.');
              emailInput.focus();
              return;
          }
  
          if (messageInput.value.trim() === '') {
              alert('Please enter a message.');
              messageInput.focus();
              return;
          }
  
          // If validation passes, you would typically submit the form data
          // using AJAX (fetch API or XMLHttpRequest).  This is a placeholder.
          alert('Form submitted successfully! (Placeholder)');
          // contactForm.submit(); //  In a real application, you'd handle this differently.
  
      });
  }
  
  // Helper function to validate email format (basic check)
  function isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
  }
  
  // Animate stats when in viewport
  const stats = document.querySelectorAll('.stat-number');
  let animated = false;
  
  function animateStats() {
      if (animated) return;
      
      stats.forEach(stat => {
          const target = parseInt(stat.textContent);
          let current = 0;
          const increment = target / 50; // Will complete in 50 steps
          const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                  clearInterval(timer);
                  current = target;
              }
              stat.textContent = Math.round(current).toLocaleString() + (stat.textContent.includes('%') ? '%' : '+');
          }, 20);
      });
      
      animated = true;
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
  
  // Animate elements when they come into view
  function handleScrollAnimation() {
      // Animate stats
      if (stats.length && isInViewport(stats[0])) {
          animateStats();
      }
  
      // Animate feature cards
      document.querySelectorAll('.feature-card').forEach(card => {
          if (isInViewport(card)) {
              card.classList.add('animated');
          }
      });
  }
  
  // Listen for scroll events
  window.addEventListener('scroll', handleScrollAnimation);
  
  // Initial check for visible animations
  handleScrollAnimation();
  
  // Demo video modal
  const demoButton = document.querySelector('.demo-button');
  if (demoButton) {
      demoButton.addEventListener('click', (e) => {
          e.preventDefault();
          // Create modal
          const modal = document.createElement('div');
          modal.className = 'video-modal';
          modal.innerHTML = `
              <div class="modal-content">
                  <button class="close-modal">&times;</button>
                  <iframe src="https://www.youtube.com/embed/your-video-id" 
                          frameborder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowfullscreen></iframe>
              </div>
          `;
          document.body.appendChild(modal);
          
          // Close modal functionality
          const closeBtn = modal.querySelector('.close-modal');
          closeBtn.addEventListener('click', () => {
              modal.remove();
          });
          modal.addEventListener('click', (e) => {
              if (e.target === modal) {
                  modal.remove();
              }
          });
      });
  }

  // Utility Functions
const animateValue = (start, end, duration, callback) => {
    const startTimestamp = performance.now();
    const animate = (currentTime) => {
        const elapsed = currentTime - startTimestamp;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (end - start) * easeOutQuart);
        
        callback(current);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    requestAnimationFrame(animate);
};

// Check if element is in viewport
const isInViewport = (element, offset = 0) => {
    const rect = element.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight - offset) &&
        rect.bottom >= 0 &&
        rect.left >= 0 &&
        rect.right <= window.innerWidth
    );
};

// Intersection Observer setup
const createObserver = (callback, options = {}) => {
    return new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                callback(entry.target);
            }
        });
    }, { threshold: 0.2, ...options });
};

// Animation Classes
class AnimationManager {
    constructor() {
        this.initializeAnimations();
        this.setupEventListeners();
    }

    initializeAnimations() {
        // Hero Section Animations
        this.animateHeroSection();
        
        // Features Animations
        this.setupFeatureAnimations();
        
        // Stats Animations
        this.setupStatsAnimations();
        
        // Testimonial Animations
        this.setupTestimonialAnimations();
        
        // Scroll Animations
        this.setupScrollAnimations();
    }

    animateHeroSection() {
        const heroElements = {
            title: document.querySelector('.hero-text h1'),
            subtitle: document.querySelector('.hero-subtitle'),
            cta: document.querySelector('.hero-cta'),
            stats: document.querySelector('.hero-stats'),
            image: document.querySelector('.hero-image'),
            floatingCards: document.querySelectorAll('.floating-card')
        };

        if (heroElements.title) {
            // Stagger animation for hero elements
            const sequence = [
                [heroElements.title, 'fade-up', 0],
                [heroElements.subtitle, 'fade-up', 200],
                [heroElements.cta, 'fade-up', 400],
                [heroElements.stats, 'fade-up', 600],
                [heroElements.image, 'fade-left', 800]
            ];

            sequence.forEach(([element, animation, delay]) => {
                if (element) {
                    element.style.opacity = '0';
                    element.style.transform = animation === 'fade-up' ? 'translateY(20px)' : 'translateX(20px)';
                    
                    setTimeout(() => {
                        element.style.transition = 'all 0.8s ease-out';
                        element.style.opacity = '1';
                        element.style.transform = 'translate(0)';
                    }, delay);
                }
            });

            // Floating cards animation
            heroElements.floatingCards.forEach((card, index) => {
                card.style.animation = `float ${3 + index * 0.5}s ease-in-out infinite`;
                card.style.animationDelay = `${index * 0.5}s`;
            });
        }
    }

    setupFeatureAnimations() {
        const featureCards = document.querySelectorAll('.feature-card');
        const featureObserver = createObserver((element) => {
            element.classList.add('animate-feature');
        });

        featureCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s ease-out';
            card.style.transitionDelay = `${index * 100}ms`;
            featureObserver.observe(card);
        });

        // Feature detail sections
        const detailSections = document.querySelectorAll('.feature-detail');
        const detailObserver = createObserver((element) => {
            const image = element.querySelector('.feature-image-container');
            const text = element.querySelector('.feature-text');
            
            if (image) {
                image.style.opacity = '1';
                image.style.transform = 'translateX(0)';
            }
            if (text) {
                text.style.opacity = '1';
                text.style.transform = 'translateX(0)';
            }
        });

        detailSections.forEach(section => {
            const image = section.querySelector('.feature-image-container');
            const text = section.querySelector('.feature-text');
            
            if (image && text) {
                image.style.opacity = '0';
                text.style.opacity = '0';
                image.style.transform = 'translateX(-50px)';
                text.style.transform = 'translateX(50px)';
                image.style.transition = 'all 0.8s ease-out';
                text.style.transition = 'all 0.8s ease-out';
                
                detailObserver.observe(section);
            }
        });
    }

    setupStatsAnimations() {
        const stats = document.querySelectorAll('.stat-number');
        const statsObserver = createObserver((element) => {
            const target = parseInt(element.getAttribute('data-target') || element.textContent);
            element.textContent = '0';
            animateValue(0, target, 2000, (value) => {
                element.textContent = value + (element.textContent.includes('%') ? '%' : '+');
            });
        });

        stats.forEach(stat => {
            stat.setAttribute('data-target', stat.textContent.replace(/[^0-9]/g, ''));
            statsObserver.observe(stat);
        });
    }

    setupTestimonialAnimations() {
        const testimonials = document.querySelectorAll('.testimonial-card');
        const testimonialObserver = createObserver((element) => {
            element.classList.add('animate-testimonial');
        });

        testimonials.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s ease-out';
            card.style.transitionDelay = `${index * 200}ms`;
            testimonialObserver.observe(card);
        });
    }

    setupScrollAnimations() {
        // Animate all sections on scroll
        const sections = document.querySelectorAll('section');
        const sectionObserver = createObserver((element) => {
            element.classList.add('section-visible');
        });

        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'all 0.8s ease-out';
            sectionObserver.observe(section);
        });
    }

    setupEventListeners() {
        // Smooth scroll handling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Navigation animation
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                link.style.transition = 'all 0.3s ease';
                link.style.transform = 'translateY(-2px)';
            });
            link.addEventListener('mouseleave', () => {
                link.style.transform = 'translateY(0)';
            });
        });

        // Mobile navigation
        const navToggle = document.querySelector('.nav-toggle');
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                const nav = document.querySelector('nav ul');
                nav.classList.toggle('active');
                
                if (nav.classList.contains('active')) {
                    nav.style.transform = 'translateX(0)';
                    nav.style.opacity = '1';
                } else {
                    nav.style.transform = 'translateX(-100%)';
                    nav.style.opacity = '0';
                }
            });
        }
    }
}

// Image Loading Optimization
class ImageLoader {
    constructor() {
        this.initializeImageLoading();
    }

    initializeImageLoading() {
        // Add loading placeholder to all images
        document.querySelectorAll('img').forEach(img => {
            // Skip if image is already handled
            if (img.classList.contains('loading-handled')) return;
            
            // Create wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'image-container placeholder-loading';
            img.parentNode.insertBefore(wrapper, img);
            wrapper.appendChild(img);
            
            // Mark as handled
            img.classList.add('loading-handled');
            
            // Load image
            if (img.complete) {
                this.onImageLoad(img);
            } else {
                img.addEventListener('load', () => this.onImageLoad(img));
                img.addEventListener('error', () => this.onImageError(img));
            }
        });
    }

    onImageLoad(img) {
        img.classList.add('loaded');
        img.parentElement.classList.remove('placeholder-loading');
    }

    onImageError(img) {
        img.parentElement.classList.remove('placeholder-loading');
        img.parentElement.classList.add('image-error');
    }
}

// Add smooth page transitions
class PageTransitionManager {
    constructor() {
        this.setupPageTransitions();
    }

    setupPageTransitions() {
        // Create transition overlay
        const overlay = document.createElement('div');
        overlay.className = 'page-transition';
        document.body.appendChild(overlay);

        // Handle all internal navigation links
        document.querySelectorAll('a').forEach(link => {
            // Skip external links and anchor links
            if (link.hostname !== window.location.hostname || link.getAttribute('href').startsWith('#')) return;

            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.href;

                // Activate transition
                overlay.classList.add('active');

                // Navigate after transition
                setTimeout(() => {
                    window.location.href = target;
                }, 500);
            });
        });
    }
}

// Initialize performance optimizations
class PerformanceOptimizer {
    constructor() {
        this.optimizeAnimations();
        this.setupLazyLoading();
    }

    optimizeAnimations() {
        // Add hardware acceleration to animated elements
        const animatedElements = document.querySelectorAll('.feature-card, .testimonial-card, .floating-card');
        animatedElements.forEach(el => {
            el.classList.add('hardware-accelerated');
        });

        // Debounce scroll animations
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                window.cancelAnimationFrame(scrollTimeout);
            }
            scrollTimeout = window.requestAnimationFrame(() => {
                // Your scroll handling code
            });
        });
    }

    setupLazyLoading() {
        if ('loading' in HTMLImageElement.prototype) {
            // Use native lazy loading
            document.querySelectorAll('img').forEach(img => {
                if (!img.hasAttribute('loading')) {
                    img.setAttribute('loading', 'lazy');
                }
            });
        } else {
            // Fallback to Intersection Observer
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        observer.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
}

// Scroll-triggered animations for pricing cards, team members, and staggered lists
class ScrollAnimator {
    constructor() {
        // Add animation functionality to specific sections
        this.initPricingCards();
        this.initTeamMembers();
        this.initStaggeredLists();
    }

    initPricingCards() {
        const cards = document.querySelectorAll('.pricing-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s ease';
            card.style.transitionDelay = `${index * 150}ms`;

            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                        if (card.classList.contains('professional')) {
                            card.style.transform = 'translateY(-20px)'; // Elevated effect for popular plan
                        }
                    }
                });
            }, { threshold: 0.2 });

            observer.observe(card);
        });
    }

    initTeamMembers() {
        const members = document.querySelectorAll('.team-member');
        members.forEach((member, index) => {
            member.style.opacity = '0';
            member.style.transform = 'scale(0.8)';
            member.style.transition = 'all 0.6s ease';
            member.style.transitionDelay = `${index * 200}ms`;

            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        member.style.opacity = '1';
                        member.style.transform = 'scale(1)';
                    }
                });
            }, { threshold: 0.2 });

            observer.observe(member);
        });
    }

    initStaggeredLists() {
        const lists = document.querySelectorAll('.features-list, .footer-column ul');
        lists.forEach(list => {
            const items = list.children;
            Array.from(items).forEach((item, index) => {
                item.style.opacity = '0';
                item.style.transform = 'translateX(-20px)';
                item.style.transition = 'all 0.4s ease';
                item.style.transitionDelay = `${index * 100}ms`;
            });

            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        Array.from(items).forEach(item => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateX(0)';
                        });
                    }
                });
            }, { threshold: 0.2 });

            observer.observe(list);
        });
    }
}

// Text Animation Classes
class TextAnimator {
    constructor() {
        this.initializeTextAnimations();
        this.setupTypewriterEffects();
        this.initializeGradientTexts();
        this.setupSplitTextAnimations();
    }

    initializeTextAnimations() {
        const animatedTexts = document.querySelectorAll('.animate-text');
        const observer = createObserver((element) => {
            element.classList.add('visible');
        });

        animatedTexts.forEach(text => {
            observer.observe(text);
        });
    }

    setupTypewriterEffects() {
        const typewriters = document.querySelectorAll('.typewriter');
        typewriters.forEach(element => {
            const text = element.textContent;
            element.textContent = '';
            let i = 0;
            
            const type = () => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, 100);
                }
            };

            const observer = createObserver(() => {
                type();
            });
            
            observer.observe(element);
        });
    }

    initializeGradientTexts() {
        const gradientTexts = document.querySelectorAll('.gradient-text');
        gradientTexts.forEach(text => {
            text.style.opacity = '0';
            text.style.transform = 'scale(0.95)';
            text.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            const observer = createObserver((element) => {
                element.style.opacity = '1';
                element.style.transform = 'scale(1)';
            });
            
            observer.observe(text);
        });
    }

    setupSplitTextAnimations() {
        const splitTexts = document.querySelectorAll('.split-text');
        splitTexts.forEach(text => {
            const words = text.textContent.split(' ');
            text.textContent = '';
            
            words.forEach((word, index) => {
                const span = document.createElement('span');
                span.textContent = word + ' ';
                span.style.animationDelay = `${index * 0.1}s`;
                text.appendChild(span);
            });
            
            const observer = createObserver((element) => {
                element.classList.add('animate');
            });
            
            observer.observe(text);
        });
    }

    static highlightTextOnScroll() {
        const highlights = document.querySelectorAll('.highlight');
        const observer = createObserver((element) => {
            element.classList.add('visible');
        });

        highlights.forEach(highlight => {
            observer.observe(highlight);
        });
    }
}

// Initialize all managers when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AnimationManager();
    new ImageLoader();
    new PageTransitionManager();
    new PerformanceOptimizer();
    new ScrollAnimator();
    new TextAnimator();
    TextAnimator.highlightTextOnScroll();
});
