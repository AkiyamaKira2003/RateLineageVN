import { DOM, Storage, Format, Toast, debounce, HTTP, LazyLoad } from './utils.js';

// ============================================================================
// MARKETPLACE APPLICATION
// ============================================================================

class Marketplace {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.cart = Storage.get('cart', []);
    this.currentPage = 1;
    this.itemsPerPage = 12;
    this.filters = {
      category: '',
      priceRange: '',
      rating: '',
      search: ''
    };
    this.sortBy = 'featured';

    this.init();
  }

  init() {
    this.loadProducts();
    this.setupEventListeners();
    this.renderProducts();
    this.updateCartUI();
    LazyLoad.init();
  }

  loadProducts() {
    // Mock product data - in a real app, this would come from an API
    this.products = [
      {
        id: 1,
        title: 'Premium UI Kit Pro',
        category: 'templates',
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop',
        rating: 4.8,
        reviews: 128,
        badge: 'Best Seller',
        description: 'Comprehensive UI kit with 500+ components for design systems'
      },
      {
        id: 2,
        title: 'Advanced React Components',
        category: 'plugins',
        price: 39.99,
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=400&fit=crop',
        rating: 4.9,
        reviews: 342,
        badge: 'Trending',
        description: 'Production-ready React component library with TypeScript'
      },
      {
        id: 3,
        title: 'Business Landing Page Templates',
        category: 'templates',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1460925895917-aaf4236c12c7?w=400&h=400&fit=crop',
        rating: 4.7,
        reviews: 256,
        badge: 'New',
        description: 'Beautiful, responsive landing page templates for any business'
      },
      {
        id: 4,
        title: 'Web Development Course',
        category: 'courses',
        price: 99.99,
        image: 'https://images.unsplash.com/photo-1516321318423-f06f70d504d0?w=400&h=400&fit=crop',
        rating: 4.6,
        reviews: 512,
        badge: 'Popular',
        description: 'Complete guide to modern web development from beginner to pro'
      },
      {
        id: 5,
        title: 'Design System Documentation',
        category: 'templates',
        price: 19.99,
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop',
        rating: 4.5,
        reviews: 87,
        badge: null,
        description: 'Professional design system documentation template'
      },
      {
        id: 6,
        title: 'CSS Animation Library',
        category: 'plugins',
        price: 24.99,
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=400&fit=crop',
        rating: 4.9,
        reviews: 203,
        badge: 'Featured',
        description: 'Advanced CSS animations and transitions library'
      },
      {
        id: 7,
        title: 'Icon Pack - 5000+ Icons',
        category: 'assets',
        price: 34.99,
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop',
        rating: 4.8,
        reviews: 421,
        badge: 'Best Seller',
        description: 'Comprehensive icon set for web and app development'
      },
      {
        id: 8,
        title: 'Mobile App UI Kit',
        category: 'templates',
        price: 59.99,
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop',
        rating: 4.7,
        reviews: 189,
        badge: 'New',
        description: 'Complete mobile UI kit for iOS and Android design'
      },
      {
        id: 9,
        title: 'JavaScript Snippets Bundle',
        category: 'plugins',
        price: 14.99,
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=400&fit=crop',
        rating: 4.6,
        reviews: 312,
        badge: null,
        description: '100+ useful JavaScript code snippets and utilities'
      },
      {
        id: 10,
        title: 'WordPress Theme Pro',
        category: 'templates',
        price: 79.99,
        image: 'https://images.unsplash.com/photo-1460925895917-aaf4236c12c7?w=400&h=400&fit=crop',
        rating: 4.9,
        reviews: 278,
        badge: 'Popular',
        description: 'Professional WordPress theme with full customization'
      },
      {
        id: 11,
        title: 'Database Design Course',
        category: 'courses',
        price: 69.99,
        image: 'https://images.unsplash.com/photo-1516321318423-f06f70d504d0?w=400&h=400&fit=crop',
        rating: 4.7,
        reviews: 145,
        badge: null,
        description: 'Master database design and optimization techniques'
      },
      {
        id: 12,
        title: 'Vector Graphics Bundle',
        category: 'assets',
        price: 44.99,
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop',
        rating: 4.8,
        reviews: 156,
        badge: 'Trending',
        description: 'Premium vector graphics for web and print design'
      }
    ];

    this.applyFiltersAndSort();
  }

  setupEventListeners() {
    // Filter and sort
    DOM.on(DOM.query('#category-select'), 'change', (e) => {
      this.filters.category = e.target.value;
      this.applyFiltersAndSort();
      this.currentPage = 1;
      this.renderProducts();
    });

    DOM.on(DOM.query('#price-select'), 'change', (e) => {
      this.filters.priceRange = e.target.value;
      this.applyFiltersAndSort();
      this.currentPage = 1;
      this.renderProducts();
    });

    DOM.on(DOM.query('#rating-select'), 'change', (e) => {
      this.filters.rating = e.target.value;
      this.applyFiltersAndSort();
      this.currentPage = 1;
      this.renderProducts();
    });

    DOM.on(DOM.query('#sort-select'), 'change', (e) => {
      this.sortBy = e.target.value;
      this.applyFiltersAndSort();
      this.currentPage = 1;
      this.renderProducts();
    });

    // Search
    DOM.on(DOM.query('.search-input'), 'input', debounce((e) => {
      this.filters.search = e.target.value.toLowerCase();
      this.applyFiltersAndSort();
      this.currentPage = 1;
      this.renderProducts();
    }, 300));

    // Clear filters
    DOM.on(DOM.query('#clear-filters-btn'), 'click', () => {
      this.filters = { category: '', priceRange: '', rating: '', search: '' };
      this.sortBy = 'featured';
      document.querySelectorAll('.filter-select').forEach(select => select.value = '');
      DOM.query('.search-input').value = '';
      this.applyFiltersAndSort();
      this.currentPage = 1;
      this.renderProducts();
      Toast.info('Filters cleared');
    });

    // Cart
    DOM.on(DOM.query('.btn-cart'), 'click', () => {
      this.toggleCart();
    });

    DOM.on(DOM.query('.modal-close'), 'click', () => {
      this.closeCart();
    });

    DOM.on(DOM.query('#cart-modal'), 'click', (e) => {
      if (e.target.id === 'cart-modal') {
        this.closeCart();
      }
    });

    // Event delegation for product actions
    DOM.on(document, 'click', (e) => {
      if (e.target.classList.contains('btn-add-to-cart')) {
        const productId = parseInt(e.target.dataset.productId);
        this.addToCart(productId);
        e.target.disabled = true;
        e.target.textContent = 'Added to Cart';
        setTimeout(() => {
          e.target.disabled = false;
          e.target.textContent = 'Add to Cart';
        }, 2000);
      }
    });

    DOM.on(document, 'click', (e) => {
      if (e.target.classList.contains('btn-remove-item')) {
        const index = parseInt(e.target.dataset.index);
        this.removeFromCart(index);
      }
    });

    // Checkout
    DOM.on(DOM.query('.modal-footer .btn-primary'), 'click', () => {
      if (this.cart.length > 0) {
        this.checkout();
      }
    });

    // User menu dropdown
    const dropdown = DOM.query('.dropdown');
    DOM.on(dropdown?.querySelector('.dropdown-trigger'), 'click', () => {
      DOM.toggleClass(dropdown.querySelector('.dropdown-menu'), 'is-open');
    });

    document.addEventListener('click', (e) => {
      if (!dropdown?.contains(e.target)) {
        DOM.removeClass(dropdown?.querySelector('.dropdown-menu'), 'is-open');
      }
    });
  }

  applyFiltersAndSort() {
    let filtered = this.products.filter(product => {
      // Category filter
      if (this.filters.category && product.category !== this.filters.category) {
        return false;
      }

      // Price range filter
      if (this.filters.priceRange) {
        const [min, max] = this.filters.priceRange.split('-').map(Number);
        if (max === undefined) {
          if (product.price < min) return false;
        } else if (product.price < min || product.price > max) {
          return false;
        }
      }

      // Rating filter
      if (this.filters.rating) {
        if (product.rating < parseFloat(this.filters.rating)) {
          return false;
        }
      }

      // Search filter
      if (this.filters.search) {
        const search = this.filters.search;
        if (!product.title.toLowerCase().includes(search) &&
            !product.description.toLowerCase().includes(search) &&
            !product.category.toLowerCase().includes(search)) {
          return false;
        }
      }

      return true;
    });

    // Apply sorting
    switch (this.sortBy) {
      case 'newest':
        // Sort by id descending (newer items have higher ids)
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'trending':
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'featured':
      default:
        // Keep original order
        break;
    }

    this.filteredProducts = filtered;
    this.updateResultsCount();
  }

  renderProducts() {
    const grid = DOM.query('#products-grid');
    const loadingState = DOM.query('#loading-state');
    const emptyState = DOM.query('#empty-state');

    // Hide all states
    grid.style.display = 'none';
    loadingState.style.display = 'none';
    emptyState.style.display = 'none';

    if (this.filteredProducts.length === 0) {
      emptyState.style.display = 'flex';
      return;
    }

    // Show loading briefly for better UX
    loadingState.style.display = 'flex';
    setTimeout(() => {
      loadingState.style.display = 'none';
      grid.style.display = 'grid';
      grid.innerHTML = '';

      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      const pageProducts = this.filteredProducts.slice(start, end);

      pageProducts.forEach((product) => {
        const productCard = this.createProductCard(product);
        grid.appendChild(productCard);
      });

      this.renderPagination();
    }, 300);
  }

  createProductCard(product) {
    const card = DOM.create(`
      <div class="product-card">
        <div class="product-image-container">
          <img 
            src="${product.image}" 
            alt="${product.title}" 
            class="product-image"
            loading="lazy"
          >
          ${product.badge ? `<span class="product-badge badge badge-primary">${product.badge}</span>` : ''}
        </div>
        <div class="product-info">
          <span class="product-category">${product.category}</span>
          <h3 class="product-title">${product.title}</h3>
          <p class="product-description">${product.description}</p>
          <div class="product-footer">
            <div class="product-price">${Format.currency(product.price)}</div>
            <div class="product-rating">
              <span>⭐ ${product.rating}</span>
              <span class="text-muted">(${product.reviews})</span>
            </div>
          </div>
          <button 
            class="btn btn-primary btn-add-to-cart"
            data-product-id="${product.id}"
            style="width: 100%; margin-top: var(--spacing-md);"
          >
            Add to Cart
          </button>
        </div>
      </div>
    `);
    return card;
  }

  renderPagination() {
    const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    const pagination = DOM.query('#pagination');
    pagination.innerHTML = '';

    // Previous button
    const prevBtn = DOM.create(`
      <button class="pagination-item ${this.currentPage === 1 ? 'is-disabled' : ''}" 
              ${this.currentPage === 1 ? 'disabled' : ''}>
        ← Prev
      </button>
    `);
    prevBtn.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
    pagination.appendChild(prevBtn);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = DOM.create(`
        <button class="pagination-item ${i === this.currentPage ? 'is-active' : ''}">
          ${i}
        </button>
      `);
      pageBtn.addEventListener('click', () => {
        this.currentPage = i;
        this.renderProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      pagination.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = DOM.create(`
      <button class="pagination-item ${this.currentPage === totalPages ? 'is-disabled' : ''}" 
              ${this.currentPage === totalPages ? 'disabled' : ''}>
        Next →
      </button>
    `);
    nextBtn.addEventListener('click', () => {
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.renderProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
    pagination.appendChild(nextBtn);
  }

  updateResultsCount() {
    const count = this.filteredProducts.length;
    const countSpan = DOM.query('#results-count');
    if (countSpan) {
      countSpan.textContent = `Showing ${count === 0 ? 0 : count} product${count !== 1 ? 's' : ''}`;
    }
  }

  addToCart(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = this.cart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        ...product,
        quantity: 1
      });
    }

    Storage.set('cart', this.cart);
    this.updateCartUI();
    Toast.success(`${product.title} added to cart!`);
  }

  removeFromCart(index) {
    this.cart.splice(index, 1);
    Storage.set('cart', this.cart);
    this.updateCartUI();
    Toast.info('Item removed from cart');
  }

  updateCartUI() {
    const cartCount = DOM.query('.cart-count');
    const cartItems = DOM.query('#cart-items');
    const cartEmpty = DOM.query('#cart-empty');
    const totalPrice = DOM.query('#cart-total-price');

    // Update cart count badge
    if (this.cart.length > 0) {
      cartCount.style.display = 'flex';
      cartCount.textContent = this.cart.length;
    } else {
      cartCount.style.display = 'none';
    }

    // Update cart items
    if (this.cart.length === 0) {
      cartItems.style.display = 'none';
      cartEmpty.style.display = 'flex';
      totalPrice.textContent = '$0.00';
    } else {
      cartItems.style.display = 'flex';
      cartEmpty.style.display = 'none';

      cartItems.innerHTML = '';
      let total = 0;

      this.cart.forEach((item, index) => {
        const cartItem = DOM.create(`
          <div class="cart-item">
            <div class="cart-item-image"></div>
            <div class="cart-item-details">
              <div class="cart-item-title">${item.title}</div>
              <div class="cart-item-price">${Format.currency(item.price)} × ${item.quantity}</div>
            </div>
            <button class="btn-icon btn-remove-item" data-index="${index}" title="Remove item">
              ✕
            </button>
          </div>
        `);
        cartItems.appendChild(cartItem);
        total += item.price * item.quantity;
      });

      totalPrice.textContent = Format.currency(total);
    }
  }

  toggleCart() {
    const modal = DOM.query('#cart-modal');
    if (DOM.hasClass(modal, 'is-open')) {
      this.closeCart();
    } else {
      this.openCart();
    }
  }

  openCart() {
    const modal = DOM.query('#cart-modal');
    DOM.addClass(modal, 'is-open');
    modal.style.display = 'flex';
  }

  closeCart() {
    const modal = DOM.query('#cart-modal');
    DOM.removeClass(modal, 'is-open');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 250);
  }

  checkout() {
    if (this.cart.length === 0) {
      Toast.warning('Your cart is empty');
      return;
    }

    Toast.success('Proceeding to checkout...');
    console.log('Checkout with items:', this.cart);

    // In a real app, this would redirect to a checkout page or payment provider
    setTimeout(() => {
      Toast.success('Order placed successfully!');
      this.cart = [];
      Storage.set('cart', this.cart);
      this.updateCartUI();
      this.closeCart();
    }, 2000);
  }
}

// Initialize marketplace when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new Marketplace();
});
