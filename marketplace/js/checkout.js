import { DOM, Storage, Format, Toast, debounce } from './utils.js';

class Checkout {
  constructor() {
    this.cart = Storage.get('cart', []);
    this.currentStep = 1;
    this.formData = {
      shipping: {},
      payment: {}
    };
    this.discounts = {
      'SAVE10': 0.10,
      'SAVE20': 0.20,
      'WELCOME5': 0.05
    };
    this.appliedDiscount = 0;

    this.init();
  }

  init() {
    if (this.cart.length === 0) {
      Toast.warning('Your cart is empty. Redirecting to marketplace...');
      setTimeout(() => {
        window.location.href = './index.html';
      }, 2000);
      return;
    }

    this.renderOrderItems();
    this.updateOrderSummary();
    this.setupEventListeners();
    this.setupFormValidation();
  }

  renderOrderItems() {
    const itemsContainer = DOM.query('#order-items');
    itemsContainer.innerHTML = '';

    this.cart.forEach((item, index) => {
      const itemEl = DOM.create(`
        <div class="order-item stagger-item">
          <div class="order-item-image"></div>
          <div class="order-item-details">
            <div class="order-item-title">${item.title}</div>
            <div class="order-item-price">${Format.currency(item.price)} × ${item.quantity}</div>
          </div>
        </div>
      `);
      itemsContainer.appendChild(itemEl);
    });
  }

  updateOrderSummary() {
    let subtotal = 0;
    this.cart.forEach(item => {
      subtotal += item.price * item.quantity;
    });

    const tax = subtotal * 0.08; // 8% tax
    const discountAmount = subtotal * this.appliedDiscount;
    const total = subtotal + tax - discountAmount;

    DOM.setText(DOM.query('#subtotal'), Format.currency(subtotal));
    DOM.setText(DOM.query('#tax'), Format.currency(tax));
    DOM.setText(DOM.query('#total'), Format.currency(total));
    DOM.setText(DOM.query('#order-total'), Format.currency(total));
    DOM.setText(DOM.query('#confirmation-total'), Format.currency(total));

    // Show/hide discount row
    const discountRow = DOM.query('#discount-row');
    if (this.appliedDiscount > 0) {
      discountRow.style.display = 'flex';
      DOM.setText(DOM.query('#discount-amount'), `-${Format.currency(discountAmount)}`);
    } else {
      discountRow.style.display = 'none';
    }
  }

  setupEventListeners() {
    // Shipping Form
    DOM.on(DOM.query('#next-payment-btn'), 'click', () => {
      if (this.validateShippingForm()) {
        this.captureShippingData();
        this.goToStep(2);
      }
    });

    // Back to Shipping
    DOM.on(DOM.query('#back-shipping-btn'), 'click', () => {
      this.goToStep(1);
    });

    // Place Order
    DOM.on(DOM.query('#place-order-btn'), 'click', () => {
      if (this.validatePaymentForm()) {
        this.processOrder();
      }
    });

    // Apply Discount
    DOM.on(DOM.query('#apply-discount-btn'), 'click', () => {
      this.applyDiscount();
    });

    // Discount code enter key
    DOM.on(DOM.query('#discount-code'), 'keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.applyDiscount();
      }
    });

    // Card number formatting
    DOM.on(DOM.query('#card-number'), 'input', (e) => {
      let value = e.target.value.replace(/\s/g, '');
      let formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
      e.target.value = formattedValue;
      this.updateCardType(value);
    });

    // Expiration date formatting
    DOM.on(DOM.query('#exp-date'), 'input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      e.target.value = value;
    });

    // Download receipt
    DOM.on(DOM.query('#download-receipt-btn'), 'click', () => {
      this.downloadReceipt();
    });

    // Payment method selector
    const paymentRadios = DOM.queryAll('input[name="payment-method"]');
    paymentRadios.forEach(radio => {
      DOM.on(radio, 'change', (e) => {
        this.updatePaymentMethod(e.target.value);
      });
    });
  }

  setupFormValidation() {
    // Real-time validation feedback
    const inputs = DOM.queryAll('.checkout-form input, .checkout-form select');
    inputs.forEach(input => {
      DOM.on(input, 'blur', (e) => {
        this.validateField(e.target);
      });
    });
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;

    switch (field.type) {
      case 'email':
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        break;
      case 'text':
        isValid = value.length >= 2;
        break;
      default:
        isValid = value.length > 0;
    }

    if (isValid) {
      field.style.borderColor = 'var(--color-success)';
    } else {
      field.style.borderColor = 'var(--color-error)';
    }
  }

  validateShippingForm() {
    const form = DOM.query('#shipping-form');
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
      if (input.value.trim() === '') {
        isValid = false;
        input.style.borderColor = 'var(--color-error)';
        input.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
      }
    });

    if (!isValid) {
      Toast.error('Please fill in all required fields');
      return false;
    }

    return true;
  }

  validatePaymentForm() {
    const cardNumber = DOM.query('#card-number').value.replace(/\s/g, '');
    const expDate = DOM.query('#exp-date').value;
    const cvc = DOM.query('#cvc').value;

    if (!/^\d{13,19}$/.test(cardNumber)) {
      Toast.error('Invalid card number');
      return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(expDate)) {
      Toast.error('Invalid expiration date (use MM/YY)');
      return false;
    }

    if (!/^\d{3,4}$/.test(cvc)) {
      Toast.error('Invalid CVC');
      return false;
    }

    return true;
  }

  captureShippingData() {
    this.formData.shipping = {
      firstName: DOM.query('#first-name').value,
      lastName: DOM.query('#last-name').value,
      email: DOM.query('#email').value,
      address: DOM.query('#address').value,
      city: DOM.query('#city').value,
      state: DOM.query('#state').value,
      zip: DOM.query('#zip').value,
      country: DOM.query('#country').value
    };
  }

  capturePaymentData() {
    this.formData.payment = {
      cardName: DOM.query('#card-name').value,
      cardNumber: DOM.query('#card-number').value.slice(-4),
      expDate: DOM.query('#exp-date').value,
      method: document.querySelector('input[name="payment-method"]:checked').value
    };
  }

  updateCardType(cardNumber) {
    const firstDigit = cardNumber[0];
    const cardTypeEl = DOM.query('.card-type');
    let cardType = 'Card';

    if (cardNumber.length > 0) {
      if (firstDigit === '4') cardType = 'Visa';
      else if (firstDigit === '5') cardType = 'Mastercard';
      else if (firstDigit === '3') cardType = 'Amex';
      else if (firstDigit === '6') cardType = 'Discover';
    }

    DOM.setText(cardTypeEl, cardType);
  }

  updatePaymentMethod(method) {
    const paymentForm = DOM.query('#payment-form');
    if (method === 'paypal') {
      Toast.info('PayPal integration coming soon!');
    } else if (method === 'crypto') {
      Toast.info('Cryptocurrency payment coming soon!');
    }
  }

  applyDiscount() {
    const code = DOM.query('#discount-code').value.toUpperCase();
    const message = DOM.query('#discount-message');

    if (code === '') {
      DOM.setText(message, 'Please enter a discount code');
      message.className = 'error';
      return;
    }

    if (this.discounts[code]) {
      this.appliedDiscount = this.discounts[code];
      DOM.setText(message, `Discount code "${code}" applied! (${(this.appliedDiscount * 100).toFixed(0)}% off)`);
      message.className = 'success';
      this.updateOrderSummary();
      Toast.success('Discount applied successfully!');
    } else {
      this.appliedDiscount = 0;
      DOM.setText(message, 'Invalid discount code');
      message.className = 'error';
      this.updateOrderSummary();
      Toast.error('Discount code not found');
    }
  }

  goToStep(step) {
    // Hide all steps
    DOM.queryAll('.checkout-step').forEach(el => {
      DOM.removeClass(el, 'active');
    });

    // Show current step
    const stepEl = DOM.query(`#${this.getStepId(step)}`);
    if (stepEl) {
      DOM.addClass(stepEl, 'active');
    }

    this.currentStep = step;

    // Update progress indicator
    DOM.queryAll('.checkout-progress .step').forEach((el, index) => {
      if (index < step) {
        DOM.addClass(el, 'active');
      } else {
        DOM.removeClass(el, 'active');
      }
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getStepId(step) {
    const steps = ['shipping-step', 'payment-step', 'confirmation-step'];
    return steps[step - 1];
  }

  processOrder() {
    this.capturePaymentData();

    // Simulate payment processing
    const placeOrderBtn = DOM.query('#place-order-btn');
    const originalText = placeOrderBtn.innerHTML;
    placeOrderBtn.disabled = true;
    placeOrderBtn.innerHTML = '<span>Processing...</span>';

    setTimeout(() => {
      // Generate order number
      const orderNumber = `KL-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000)}`;
      
      // Update confirmation details
      DOM.setText(DOM.query('#order-number'), orderNumber);
      DOM.setText(DOM.query('#order-date'), Format.date(new Date()));

      // Clear cart
      Storage.set('cart', []);

      // Show confirmation
      this.goToStep(3);

      // Reset button
      placeOrderBtn.disabled = false;
      placeOrderBtn.innerHTML = originalText;

      Toast.success('Order placed successfully!');
    }, 2000);
  }

  downloadReceipt() {
    const receipt = this.generateReceipt();
    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'receipt.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    Toast.success('Receipt downloaded');
  }

  generateReceipt() {
    let receipt = 'KIRA LC - ORDER RECEIPT\n';
    receipt += '='.repeat(50) + '\n\n';
    receipt += `Order Number: ${DOM.query('#order-number').textContent}\n`;
    receipt += `Date: ${DOM.query('#order-date').textContent}\n\n`;

    receipt += 'CUSTOMER INFORMATION\n';
    receipt += '-'.repeat(50) + '\n';
    receipt += `Name: ${this.formData.shipping.firstName} ${this.formData.shipping.lastName}\n`;
    receipt += `Email: ${this.formData.shipping.email}\n`;
    receipt += `Address: ${this.formData.shipping.address}\n`;
    receipt += `${this.formData.shipping.city}, ${this.formData.shipping.state} ${this.formData.shipping.zip}\n`;
    receipt += `Country: ${this.formData.shipping.country}\n\n`;

    receipt += 'ORDER ITEMS\n';
    receipt += '-'.repeat(50) + '\n';
    this.cart.forEach(item => {
      receipt += `${item.title}\n`;
      receipt += `  Quantity: ${item.quantity}\n`;
      receipt += `  Price: ${Format.currency(item.price)}\n\n`;
    });

    receipt += 'ORDER SUMMARY\n';
    receipt += '-'.repeat(50) + '\n';
    receipt += `Subtotal: ${DOM.query('#subtotal').textContent}\n`;
    receipt += `Tax: ${DOM.query('#tax').textContent}\n`;
    if (this.appliedDiscount > 0) {
      receipt += `Discount: ${DOM.query('#discount-amount').textContent}\n`;
    }
    receipt += `Total: ${DOM.query('#confirmation-total').textContent}\n\n`;

    receipt += 'PAYMENT METHOD\n';
    receipt += '-'.repeat(50) + '\n';
    receipt += `Method: ${this.formData.payment.method.toUpperCase()}\n`;
    receipt += `Card: ****${this.formData.payment.cardNumber}\n\n`;

    receipt += 'THANK YOU FOR YOUR PURCHASE!\n';
    receipt += 'Downloads are available in your account.\n';
    receipt += 'Contact us at support@kiralc.com for assistance.\n';

    return receipt;
  }
}

// Initialize checkout when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new Checkout();
});
