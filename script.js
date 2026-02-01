(function() {
  'use strict';

  if (typeof window.__app === 'undefined') {
    window.__app = {};
  }

  var app = window.__app;

  function debounce(func, wait) {
    var timeout;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  function throttle(func, limit) {
    var inThrottle;
    return function() {
      var context = this;
      var args = arguments;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(function() {
          inThrottle = false;
        }, limit);
      }
    };
  }

  function initBurgerMenu() {
    if (app.burgerInitialized) return;
    app.burgerInitialized = true;

    var toggle = document.querySelector('.c-nav__toggle, .navbar-toggler');
    var nav = document.querySelector('.c-nav, .navbar-collapse');
    
    if (!toggle || !nav) return;

    function openMenu() {
      nav.classList.add('is-open', 'show');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('u-no-scroll');
    }

    function closeMenu() {
      nav.classList.remove('is-open', 'show');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('u-no-scroll');
    }

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      if (nav.classList.contains('is-open') || nav.classList.contains('show')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMenu();
      }
    });

    document.addEventListener('click', function(e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    var navLinks = document.querySelectorAll('.c-nav__link, .nav-link');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function() {
        if (nav.classList.contains('is-open')) {
          closeMenu();
        }
      });
    }

    var resizeHandler = debounce(function() {
      if (window.innerWidth >= 1024 && nav.classList.contains('is-open')) {
        closeMenu();
      }
    }, 150);

    window.addEventListener('resize', resizeHandler, { passive: true });
  }

  function initScrollSpy() {
    if (app.scrollSpyInitialized) return;
    app.scrollSpyInitialized = true;

    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.c-nav__link[href^="#"], .nav-link[href^="#"]');

    if (sections.length === 0 || navLinks.length === 0) return;

    var observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function(link) {
            var href = link.getAttribute('href');
            if (href === '#' + id) {
              link.classList.add('active');
              link.setAttribute('aria-current', 'location');
            } else {
              link.classList.remove('active');
              link.removeAttribute('aria-current');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(function(section) {
      observer.observe(section);
    });
  }

  function initSmoothScroll() {
    if (app.smoothScrollInitialized) return;
    app.smoothScrollInitialized = true;

    var currentPath = window.location.pathname;
    var isHomepage = currentPath === '/' || currentPath.endsWith('/index.html');

    document.addEventListener('click', function(e) {
      var target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (!target) return;

      var href = target.getAttribute('href');
      if (!href || !href.startsWith('#') || href === '#' || href === '#!') return;

      var targetId = href.substring(1);
      var targetElement = document.getElementById(targetId);

      if (!targetElement) {
        if (!isHomepage) {
          window.location.href = '/' + href;
        }
        return;
      }

      e.preventDefault();

      var header = document.querySelector('.l-header, header');
      var offset = header ? header.offsetHeight : 80;
      var targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  }

  function initActiveMenu() {
    if (app.activeMenuInitialized) return;
    app.activeMenuInitialized = true;

    var currentPath = window.location.pathname;
    var navLinks = document.querySelectorAll('.c-nav__link, .nav-link');

    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      var linkPath = link.getAttribute('href');

      if (!linkPath || linkPath.startsWith('#')) continue;

      var normalizedLinkPath = linkPath.split('#')[0];
      var normalizedCurrentPath = currentPath;

      if (normalizedCurrentPath === '/' || normalizedCurrentPath.endsWith('/index.html')) {
        normalizedCurrentPath = '/';
      }

      if (normalizedLinkPath === '/' || normalizedLinkPath === '/index.html') {
        normalizedLinkPath = '/';
      }

      if (normalizedLinkPath === normalizedCurrentPath) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      }
    }
  }

  function initImages() {
    if (app.imagesInitialized) return;
    app.imagesInitialized = true;

    var images = document.querySelectorAll('img');

    for (var i = 0; i < images.length; i++) {
      var img = images[i];

      if (!img.hasAttribute('loading')) {
        var isCritical = img.classList.contains('c-logo__img') || 
                        img.hasAttribute('data-critical') ||
                        img.closest('.l-header') ||
                        img.closest('header');
        if (!isCritical) {
          img.setAttribute('loading', 'lazy');
        }
      }

      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }

      img.addEventListener('error', function(e) {
        var failedImg = e.target;
        var svgPlaceholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%23e9ecef"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%236c757d"%3EObrazok%3C/text%3E%3C/svg%3E';
        failedImg.src = svgPlaceholder;
      });
    }
  }

  function initForms() {
    if (app.formsInitialized) return;
    app.formsInitialized = true;

    app.notify = function(message, type) {
      var container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
      }

      var toast = document.createElement('div');
      toast.className = 'alert alert-' + (type || 'info') + ' alert-dismissible fade show';
      toast.setAttribute('role', 'alert');
      toast.textContent = message;

      var closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'btn-close';
      closeBtn.setAttribute('aria-label', 'Zavrieť');
      closeBtn.addEventListener('click', function() {
        toast.classList.remove('show');
        setTimeout(function() {
          if (toast.parentElement) {
            toast.parentElement.removeChild(toast);
          }
        }, 150);
      });
      toast.appendChild(closeBtn);

      container.appendChild(toast);

      setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() {
          if (toast.parentElement) {
            toast.parentElement.removeChild(toast);
          }
        }, 150);
      }, 5000);
    };

    function validateField(field) {
      var value = field.value.trim();
      var type = field.type;
      var name = field.name;
      var isValid = true;
      var message = '';

      if (field.hasAttribute('required') && !value) {
        isValid = false;
        message = 'Toto pole je povinné';
      } else if (value) {
        if (type === 'email' || name === 'email') {
          var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            isValid = false;
            message = 'Zadajte platnú e-mailovú adresu';
          }
        } else if (type === 'tel' || name === 'phone') {
          var phoneRegex = /^[\+\d\s\(\)\-]{9,20}$/;
          if (!phoneRegex.test(value)) {
            isValid = false;
            message = 'Zadajte platné telefónne číslo';
          }
        } else if (name === 'name' || name === 'firstName' || name === 'lastName') {
          var nameRegex = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;
          if (!nameRegex.test(value)) {
            isValid = false;
            message = 'Meno musí obsahovať 2-50 písmen';
          }
        } else if (field.tagName === 'TEXTAREA' || name === 'message') {
          if (value.length < 10) {
            isValid = false;
            message = 'Správa musí mať aspoň 10 znakov';
          }
        }
      }

      if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
        isValid = false;
        message = 'Toto pole je povinné';
      }

      var formGroup = field.closest('.form-group, .c-form__group, .form-check');
      var feedback = formGroup ? formGroup.querySelector('.invalid-feedback, .c-form__error') : null;

      if (!isValid) {
        field.classList.add('is-invalid');
        if (formGroup) formGroup.classList.add('has-error');
        if (feedback) {
          feedback.textContent = message;
          feedback.style.display = 'block';
        }
      } else {
        field.classList.remove('is-invalid');
        if (formGroup) formGroup.classList.remove('has-error');
        if (feedback) {
          feedback.style.display = 'none';
        }
      }

      return isValid;
    }

    var forms = document.querySelectorAll('.c-form, form');

    for (var i = 0; i < forms.length; i++) {
      var form = forms[i];

      var fields = form.querySelectorAll('input, textarea, select');
      for (var j = 0; j < fields.length; j++) {
        fields[j].addEventListener('blur', function() {
          validateField(this);
        });

        fields[j].addEventListener('input', function() {
          if (this.classList.contains('is-invalid')) {
            validateField(this);
          }
        });
      }

      form.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var currentForm = e.target;
        var formFields = currentForm.querySelectorAll('input, textarea, select');
        var isFormValid = true;

        for (var k = 0; k < formFields.length; k++) {
          var field = formFields[k];
          if (field.type !== 'submit' && field.type !== 'button') {
            if (!validateField(field)) {
              isFormValid = false;
            }
          }
        }

        if (!isFormValid) {
          app.notify('Prosím, skontrolujte vyznačené polia', 'danger');
          var firstInvalid = currentForm.querySelector('.is-invalid');
          if (firstInvalid) {
            firstInvalid.focus();
          }
          return;
        }

        var submitBtn = currentForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          var originalText = submitBtn.textContent;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Odosielanie...';

          var formData = new FormData(currentForm);
          var data = {};
          formData.forEach(function(value, key) {
            data[key] = value;
          });

          setTimeout(function() {
            app.notify('Ďakujeme! Váš formulár bol úspešne odoslaný.', 'success');
            setTimeout(function() {
              window.location.href = 'thank_you.html';
            }, 1500);
          }, 1000);
        }
      });
    }
  }

  function initScrollToTop() {
    if (app.scrollToTopInitialized) return;
    app.scrollToTopInitialized = true;

    var scrollBtn = document.querySelector('[data-scroll-top], .scroll-to-top');
    if (!scrollBtn) return;

    function toggleButton() {
      if (window.pageYOffset > 300) {
        scrollBtn.classList.add('is-visible');
      } else {
        scrollBtn.classList.remove('is-visible');
      }
    }

    scrollBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    window.addEventListener('scroll', throttle(toggleButton, 100), { passive: true });
    toggleButton();
  }

  function initHeaderScroll() {
    if (app.headerScrollInitialized) return;
    app.headerScrollInitialized = true;

    var header = document.querySelector('.l-header, header');
    if (!header) return;

    function handleScroll() {
      if (window.pageYOffset > 50) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    window.addEventListener('scroll', throttle(handleScroll, 100), { passive: true });
    handleScroll();
  }

  function initModals() {
    if (app.modalsInitialized) return;
    app.modalsInitialized = true;

    var modalTriggers = document.querySelectorAll('[data-modal]');

    for (var i = 0; i < modalTriggers.length; i++) {
      modalTriggers[i].addEventListener('click', function(e) {
        e.preventDefault();
        var modalId = this.getAttribute('data-modal');
        var modal = document.getElementById(modalId);
        if (modal) {
          modal.classList.add('is-open');
          document.body.classList.add('u-no-scroll');
        }
      });
    }

    var modalCloses = document.querySelectorAll('[data-modal-close]');
    for (var j = 0; j < modalCloses.length; j++) {
      modalCloses[j].addEventListener('click', function() {
        var modal = this.closest('.c-modal, .modal');
        if (modal) {
          modal.classList.remove('is-open');
          document.body.classList.remove('u-no-scroll');
        }
      });
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        var openModal = document.querySelector('.c-modal.is-open, .modal.is-open');
        if (openModal) {
          openModal.classList.remove('is-open');
          document.body.classList.remove('u-no-scroll');
        }
      }
    });
  }

  function initCountUp() {
    if (app.countUpInitialized) return;
    app.countUpInitialized = true;

    var counters = document.querySelectorAll('[data-count]');
    if (counters.length === 0) return;

    function animateCounter(element) {
      var target = parseInt(element.getAttribute('data-count'), 10);
      var duration = parseInt(element.getAttribute('data-duration'), 10) || 2000;
      var start = 0;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var current = Math.floor(progress * target);
        element.textContent = current;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          element.textContent = target;
        }
      }

      requestAnimationFrame(step);
    }

    var observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          animateCounter(entry.target);
        }
      });
    }, observerOptions);

    counters.forEach(function(counter) {
      observer.observe(counter);
    });
  }

  function initRippleEffect() {
    if (app.rippleInitialized) return;
    app.rippleInitialized = true;

    var buttons = document.querySelectorAll('.c-button, .btn, button');

    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function(e) {
        var ripple = document.createElement('span');
        ripple.classList.add('ripple');
        this.appendChild(ripple);

        var rect = this.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height);
        var x = e.clientX - rect.left - size / 2;
        var y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        setTimeout(function() {
          ripple.remove();
        }, 600);
      });
    }
  }

  app.init = function() {
    if (app.initialized) return;
    app.initialized = true;

    initBurgerMenu();
    initScrollSpy();
    initSmoothScroll();
    initActiveMenu();
    initImages();
    initForms();
    initScrollToTop();
    initHeaderScroll();
    initModals();
    initCountUp();
    initRippleEffect();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
  } else {
    app.init();
  }

})();