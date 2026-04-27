/* ============================================================================
   UTILITY FUNCTIONS
   ============================================================================ */

// DOM Manipulation
export const DOM = {
  query: (selector) => document.querySelector(selector),
  queryAll: (selector) => Array.from(document.querySelectorAll(selector)),
  create: (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.firstElementChild;
  },
  on: (element, event, callback) => {
    if (Array.isArray(element)) {
      element.forEach(el => el.addEventListener(event, callback));
    } else {
      element?.addEventListener(event, callback);
    }
  },
  off: (element, event, callback) => {
    element?.removeEventListener(event, callback);
  },
  addClass: (element, className) => {
    element?.classList.add(className);
  },
  removeClass: (element, className) => {
    element?.classList.remove(className);
  },
  toggleClass: (element, className) => {
    element?.classList.toggle(className);
  },
  hasClass: (element, className) => {
    return element?.classList.contains(className) ?? false;
  },
  setAttr: (element, attr, value) => {
    element?.setAttribute(attr, value);
  },
  getAttr: (element, attr) => {
    return element?.getAttribute(attr);
  },
  setStyle: (element, styles) => {
    Object.assign(element?.style || {}, styles);
  },
  setText: (element, text) => {
    if (element) element.textContent = text;
  },
  setHTML: (element, html) => {
    if (element) element.innerHTML = html;
  }
};

// Local Storage
export const Storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage.set failed:', e);
    }
  },
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Storage.get failed:', e);
      return defaultValue;
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Storage.remove failed:', e);
    }
  },
  clear: () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Storage.clear failed:', e);
    }
  }
};

// Formatting
export const Format = {
  currency: (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  },
  number: (num, decimals = 0) => {
    return Number(num).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  },
  date: (date, format = 'short') => {
    const options = {
      short: { month: 'short', day: 'numeric', year: '2-digit' },
      long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
      time: { hour: '2-digit', minute: '2-digit' }
    };
    return new Date(date).toLocaleDateString('en-US', options[format] || options.short);
  },
  bytes: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  },
  slug: (str) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]/g, '-')
      .replace(/-+/g, '-');
  }
};

// Validation
export const Validate = {
  email: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  phone: (phone) => {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
  },
  required: (value) => {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  },
  minLength: (value, min) => {
    return value?.length >= min;
  },
  maxLength: (value, max) => {
    return value?.length <= max;
  },
  url: (str) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }
};

// Notifications
export const Toast = {
  show: (message, type = 'info', duration = 4000) => {
    const container = DOM.query('.toast-container') || Toast.createContainer();
    const toast = DOM.create(`
      <div class="toast ${type}">
        <div class="toast-icon">
          ${Toast.getIcon(type)}
        </div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" aria-label="Close">&times;</button>
      </div>
    `);
    
    container.appendChild(toast);
    
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn?.addEventListener('click', () => Toast.remove(toast));
    
    if (duration) {
      setTimeout(() => Toast.remove(toast), duration);
    }
    
    return toast;
  },
  
  success: (message, duration = 4000) => {
    return Toast.show(message, 'success', duration);
  },
  
  error: (message, duration = 4000) => {
    return Toast.show(message, 'error', duration);
  },
  
  warning: (message, duration = 4000) => {
    return Toast.show(message, 'warning', duration);
  },
  
  info: (message, duration = 4000) => {
    return Toast.show(message, 'info', duration);
  },
  
  remove: (toast) => {
    toast?.style.animation = 'slideInRight 250ms ease-out reverse';
    setTimeout(() => toast?.remove(), 250);
  },
  
  createContainer: () => {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  },
  
  getIcon: (type) => {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ⓘ'
    };
    return icons[type] || icons.info;
  }
};

// Debounce & Throttle
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

export const throttle = (func, delay = 300) => {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(this, args);
    }
  };
};

// HTTP Requests
export const HTTP = {
  get: async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      return HTTP.handleResponse(response);
    } catch (error) {
      return HTTP.handleError(error);
    }
  },

  post: async (url, data, options = {}) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: JSON.stringify(data),
        ...options
      });
      return HTTP.handleResponse(response);
    } catch (error) {
      return HTTP.handleError(error);
    }
  },

  put: async (url, data, options = {}) => {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: JSON.stringify(data),
        ...options
      });
      return HTTP.handleResponse(response);
    } catch (error) {
      return HTTP.handleError(error);
    }
  },

  delete: async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      return HTTP.handleResponse(response);
    } catch (error) {
      return HTTP.handleError(error);
    }
  },

  handleResponse: async (response) => {
    const data = await response.json().catch(() => null);
    
    if (!response.ok) {
      throw {
        status: response.status,
        message: data?.message || response.statusText,
        data
      };
    }
    
    return data;
  },

  handleError: (error) => {
    console.error('HTTP Error:', error);
    throw {
      status: 0,
      message: error.message || 'Network error',
      data: null
    };
  }
};

// Animation helpers
export const Animation = {
  addAnimation: (element, animationClass) => {
    DOM.addClass(element, animationClass);
    element?.addEventListener('animationend', () => {
      DOM.removeClass(element, animationClass);
    }, { once: true });
  },

  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  requestAnimationFrame: (callback) => {
    return window.requestAnimationFrame(callback);
  }
};

// Event delegation
export const EventDelegation = {
  on: (parent, eventType, selector, callback) => {
    parent?.addEventListener(eventType, (e) => {
      const target = e.target.closest(selector);
      if (target) {
        callback.call(target, e);
      }
    });
  }
};

// Lazy loading
export const LazyLoad = {
  init: () => {
    if ('IntersectionObserver' in window) {
      const images = DOM.queryAll('img[data-src]');
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      });
      images.forEach(img => imageObserver.observe(img));
    }
  }
};

// UUID generation
export const generateUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default {
  DOM,
  Storage,
  Format,
  Validate,
  Toast,
  debounce,
  throttle,
  HTTP,
  Animation,
  EventDelegation,
  LazyLoad,
  generateUID
};
