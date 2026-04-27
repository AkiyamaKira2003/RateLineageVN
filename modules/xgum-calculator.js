/**
 * XGum Calculator Module
 * KRW <-> VND Exchange Rate Calculator
 */

const STORAGE_XGUM_RATE_KEY = "xgum_krw_vnd_rate";
const STORAGE_XGUM_FEE_KEY = "xgum_platform_fee";
const STORAGE_XGUM_COMPARE_FEE_KEY = "xgum_compare_fee";
const STORAGE_XGUM_ORDERS_KEY = "xgum_orders";
const STORAGE_XGUM_DIRECTION_KEY = "xgum_direction";

const DEFAULT_KRW_VND_RATE = 0.023; // Approximate
const DEFAULT_FEE_RATE = 0.025; // 2.5%
const EXCHANGE_RATE_CACHE_MS = 5 * 60 * 1000; // 5 minutes
const EXCHANGE_RATE_API =
  "https://api.exchangerate-api.com/v4/latest/KRW";

class XGumCalculator {
  constructor() {
    this.quickDirection = "KRW_TO_VND"; // or VND_TO_KRW
    this.krwToVndRate = DEFAULT_KRW_VND_RATE;
    this.platformFeeRate = DEFAULT_FEE_RATE;
    this.compareFeeRate = DEFAULT_FEE_RATE;
    this.orders = [];
    this.rateLastFetched = 0;
    this.rateData = null;

    this.init();
    this.loadState();
    this.loadExchangeRate();
  }

  init() {
    // Quick conversion inputs
    const quickInput = document.getElementById("xgumQuickInput");
    const quickOutput = document.getElementById("xgumQuickOutput");
    const quickToggle = document.getElementById("xgumQuickToggle");
    const rateInput = document.getElementById("xgumRateInput");
    const feeInput = document.getElementById("xgumFeeInput");
    const refreshRateBtn = document.getElementById("xgumRefreshRate");
    const addOrderBtn = document.getElementById("xgumAddOrder");
    const clearOrdersBtn = document.getElementById("xgumClearOrders");
    const ordersList = document.getElementById("xgumOrdersList");

    if (!quickInput || !quickToggle) {
      console.warn("[XGumCalculator] Required elements not found");
      return;
    }

    // Quick conversion
    quickInput.addEventListener("input", () => {
      this.updateQuickConversion();
    });

    quickToggle.addEventListener("click", () => {
      this.toggleQuickDirection();
    });

    // Rate management
    if (rateInput) {
      rateInput.addEventListener("input", (e) => {
        this.krwToVndRate = parseFloat(e.target.value) || DEFAULT_KRW_VND_RATE;
        this.updateQuickConversion();
        this.saveState();
      });
    }

    // Fee management
    if (feeInput) {
      feeInput.addEventListener("input", (e) => {
        const percent = parseFloat(e.target.value) || 0;
        this.platformFeeRate = Math.max(0, Math.min(100, percent)) / 100;
        this.updateQuickConversion();
        this.saveState();
      });
    }

    // Rate refresh
    if (refreshRateBtn) {
      refreshRateBtn.addEventListener("click", () => {
        this.loadExchangeRate(true);
      });
    }

    // Orders
    if (addOrderBtn) {
      addOrderBtn.addEventListener("click", () => {
        this.addOrder();
      });
    }

    if (clearOrdersBtn) {
      clearOrdersBtn.addEventListener("click", () => {
        if (confirm("Clear all orders?")) {
          this.clearOrders();
        }
      });
    }

    // Sync inputs
    this.updateRateDisplay();
    this.updateFeeDisplay();
    this.renderOrders();
  }

  loadState() {
    try {
      const rate = localStorage.getItem(STORAGE_XGUM_RATE_KEY);
      if (rate) this.krwToVndRate = parseFloat(rate) || DEFAULT_KRW_VND_RATE;

      const fee = localStorage.getItem(STORAGE_XGUM_FEE_KEY);
      if (fee) this.platformFeeRate = parseFloat(fee) / 100 || DEFAULT_FEE_RATE;

      const compareFee = localStorage.getItem(STORAGE_XGUM_COMPARE_FEE_KEY);
      if (compareFee) this.compareFeeRate = parseFloat(compareFee) / 100 || DEFAULT_FEE_RATE;

      const orders = localStorage.getItem(STORAGE_XGUM_ORDERS_KEY);
      if (orders) {
        try {
          this.orders = JSON.parse(orders) || [];
        } catch {
          this.orders = [];
        }
      }

      const direction = localStorage.getItem(STORAGE_XGUM_DIRECTION_KEY);
      if (direction && ["KRW_TO_VND", "VND_TO_KRW"].includes(direction)) {
        this.quickDirection = direction;
      }
    } catch {
      // Ignore storage errors
    }
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_XGUM_RATE_KEY, this.krwToVndRate.toString());
      localStorage.setItem(
        STORAGE_XGUM_FEE_KEY,
        (this.platformFeeRate * 100).toString()
      );
      localStorage.setItem(
        STORAGE_XGUM_COMPARE_FEE_KEY,
        (this.compareFeeRate * 100).toString()
      );
      localStorage.setItem(STORAGE_XGUM_ORDERS_KEY, JSON.stringify(this.orders));
      localStorage.setItem(STORAGE_XGUM_DIRECTION_KEY, this.quickDirection);
    } catch {
      // Ignore storage errors
    }
  }

  loadExchangeRate(force = false) {
    const now = Date.now();
    if (!force && this.rateLastFetched && now - this.rateLastFetched < EXCHANGE_RATE_CACHE_MS) {
      return;
    }

    const statusEl = document.getElementById("xgumRateStatus");
    if (statusEl) {
      statusEl.textContent = "Đang tải...";
      statusEl.className = "rate-status loading";
    }

    fetch(EXCHANGE_RATE_API, { signal: AbortSignal.timeout(8000) })
      .then((res) => res.json())
      .then((data) => {
        if (data.rates && data.rates.VND) {
          const rate = 1 / (data.rates.VND / data.rates.KRW || DEFAULT_KRW_VND_RATE);
          this.krwToVndRate = rate;
          this.rateLastFetched = now;
          this.saveState();
          this.updateRateDisplay();
          this.updateQuickConversion();

          if (statusEl) {
            statusEl.textContent = `✓ Cập nhật lúc ${new Date().toLocaleTimeString("vi-VN")}`;
            statusEl.className = "rate-status success";
          }
        }
      })
      .catch(() => {
        if (statusEl) {
          statusEl.textContent = "Không thể tải tỷ giá";
          statusEl.className = "rate-status error";
        }
      });
  }

  toggleQuickDirection() {
    this.quickDirection =
      this.quickDirection === "KRW_TO_VND" ? "VND_TO_KRW" : "KRW_TO_VND";
    this.saveState();

    const input = document.getElementById("xgumQuickInput");
    const output = document.getElementById("xgumQuickOutput");
    const toggle = document.getElementById("xgumQuickToggle");

    if (input && output && toggle) {
      // Swap placeholders
      const tempInput = input.value;
      input.value = output.value;
      output.value = tempInput;

      // Update toggle label
      toggle.textContent =
        this.quickDirection === "KRW_TO_VND"
          ? "KRW → VND"
          : "VND → KRW";

      this.updateQuickConversion();
    }
  }

  updateQuickConversion() {
    const input = document.getElementById("xgumQuickInput");
    const output = document.getElementById("xgumQuickOutput");
    const feeDisplay = document.getElementById("xgumFeeDisplay");

    if (!input || !output) return;

    const inputAmount = parseFloat(input.value) || 0;
    if (inputAmount <= 0) {
      output.value = "";
      if (feeDisplay) feeDisplay.textContent = "";
      return;
    }

    let result, feeAmount;

    if (this.quickDirection === "KRW_TO_VND") {
      result = inputAmount * this.krwToVndRate;
      feeAmount = result * this.platformFeeRate;
      result -= feeAmount;
    } else {
      result = inputAmount / this.krwToVndRate;
      feeAmount = result * this.platformFeeRate;
      result -= feeAmount;
    }

    output.value = result.toFixed(0);

    if (feeDisplay) {
      const unit = this.quickDirection === "KRW_TO_VND" ? "VND" : "KRW";
      feeDisplay.textContent = `Phí: ${formatNumber(Math.abs(feeAmount))} ${unit}`;
    }
  }

  updateRateDisplay() {
    const rateInput = document.getElementById("xgumRateInput");
    if (rateInput) {
      rateInput.value = this.krwToVndRate.toFixed(6);
    }
  }

  updateFeeDisplay() {
    const feeInput = document.getElementById("xgumFeeInput");
    if (feeInput) {
      feeInput.value = (this.platformFeeRate * 100).toFixed(2);
    }
  }

  addOrder() {
    const input = document.getElementById("xgumQuickInput");
    const output = document.getElementById("xgumQuickOutput");

    if (!input || !output) return;

    const inputAmount = parseFloat(input.value) || 0;
    const outputAmount = parseFloat(output.value) || 0;

    if (inputAmount <= 0 || outputAmount <= 0) return;

    const order = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      direction: this.quickDirection,
      inputAmount,
      outputAmount,
      rate: this.krwToVndRate,
      feePercent: this.platformFeeRate * 100
    };

    this.orders.unshift(order);
    if (this.orders.length > 20) this.orders.pop(); // Keep last 20

    this.saveState();
    this.renderOrders();

    // Clear inputs
    input.value = "";
    output.value = "";
  }

  clearOrders() {
    this.orders = [];
    this.saveState();
    this.renderOrders();
  }

  renderOrders() {
    const list = document.getElementById("xgumOrdersList");
    if (!list) return;

    if (this.orders.length === 0) {
      list.innerHTML =
        '<div class="orders-empty">Chưa có đơn hàng nào</div>';
      return;
    }

    const html = this.orders
      .map((order) => {
        const date = new Date(order.timestamp);
        const timeStr = date.toLocaleTimeString("vi-VN");
        const arrow =
          order.direction === "KRW_TO_VND" ? "KRW →" : "← VND";

        return `
          <div class="order-item">
            <div class="order-time">${timeStr}</div>
            <div class="order-convert">
              <span class="amount">${formatNumber(order.inputAmount)}</span>
              <span class="arrow">${arrow}</span>
              <span class="amount">${formatNumber(order.outputAmount)}</span>
            </div>
            <div class="order-rate">
              Tỷ giá: ${order.rate.toFixed(6)} (-${order.feePercent.toFixed(1)}%)
            </div>
          </div>
        `;
      })
      .join("");

    list.innerHTML = html;
  }
}

// Export as global
if (typeof window !== "undefined") {
  window.XGumCalculator = XGumCalculator;
}
