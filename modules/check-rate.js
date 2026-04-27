/**
 * Check Rate Feature
 * Validates Adena prices against current market rates
 */

class CheckRate {
  constructor() {
    this.selectedServer = DEFAULT_SERVER_CODE || "S1";
    this.inputAmount = 0;
    this.inputPrice = 0;
    this.currentRate = null;
    this.comparisonResult = null;
    this.init();
  }

  init() {
    const serverSelect = document.getElementById("checkRateServerSelect");
    const amountInput = document.getElementById("checkRateAmount");
    const priceInput = document.getElementById("checkRatePrice");
    const checkBtn = document.getElementById("checkRateBtn");
    const resultArea = document.getElementById("checkRateResult");

    if (!serverSelect || !amountInput || !priceInput || !checkBtn) {
      console.warn("[CheckRate] Required elements not found");
      return;
    }

    // Event listeners
    serverSelect.addEventListener("change", (e) => {
      this.selectedServer = e.target.value;
    });

    amountInput.addEventListener("input", (e) => {
      this.inputAmount = this.parseAmount(e.target.value);
    });

    priceInput.addEventListener("input", (e) => {
      this.inputPrice = parseFloat(e.target.value) || 0;
    });

    checkBtn.addEventListener("click", () => {
      this.performCheck();
    });

    // Allow Enter key to trigger check
    priceInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.performCheck();
    });
  }

  parseAmount(value) {
    // Parse human-readable amounts like "1M" or "100k"
    if (!value) return 0;

    const num = parseFloat(value);
    if (!Number.isFinite(num)) return 0;

    const upper = value.toUpperCase();
    if (upper.includes("M")) return num * 1_000_000;
    if (upper.includes("K")) return num * 1_000;
    if (upper.includes("B")) return num * 1_000_000_000;

    return num;
  }

  getCurrentRate() {
    // Get current rate from main rate table
    if (!responseState || !responseState.modes) return null;

    const slowRows = responseState.modes.slow?.rows || [];
    const serverRow = slowRows.find(
      (row) => row.serverCode === this.selectedServer
    );

    if (!serverRow) return null;

    // Use <1m rate as base
    return {
      lt1m: serverRow.rateLt1m,
      gt1m: serverRow.rateGt1m,
      fast: serverRow.fastRate,
      updatedAt: responseState.dataUpdatedAt
    };
  }

  performCheck() {
    if (this.inputPrice <= 0) {
      this.showResult(null, "warning");
      return;
    }

    this.currentRate = this.getCurrentRate();

    if (!this.currentRate) {
      this.showResult(null, "error");
      return;
    }

    // Calculate comparison
    const baseRate = this.currentRate.lt1m;
    const difference = this.inputPrice - baseRate;
    const percentDiff = (difference / baseRate) * 100;

    this.comparisonResult = {
      inputPrice: this.inputPrice,
      baseRate,
      difference,
      percentDiff,
      quality: this.getRateQuality(percentDiff)
    };

    this.showResult(this.comparisonResult, "success");
  }

  getRateQuality(percentDiff) {
    if (percentDiff < -5) return "excellent"; // Much better
    if (percentDiff < 0) return "good"; // Better
    if (percentDiff < 2) return "fair"; // Nearly same
    if (percentDiff < 8) return "acceptable"; // Slightly worse
    return "poor"; // Much worse
  }

  showResult(result, status) {
    const resultArea = document.getElementById("checkRateResult");
    if (!resultArea) return;

    if (!result) {
      if (status === "error") {
        resultArea.innerHTML = `
          <div class="check-result-box error">
            <div class="result-icon">⚠️</div>
            <div class="result-text">${text().noData}</div>
          </div>
        `;
      } else {
        resultArea.innerHTML = "";
      }
      return;
    }

    const sign = result.difference >= 0 ? "+" : "";
    const resultHTML = `
      <div class="check-result-box ${result.quality}">
        <div class="result-header">
          <div class="quality-indicator ${result.quality}">
            ${this.getQualityLabel(result.quality)}
          </div>
        </div>
        <div class="result-grid">
          <div class="result-row">
            <span class="label">Giá của bạn:</span>
            <span class="value">${formatNumber(result.inputPrice)}</span>
          </div>
          <div class="result-row">
            <span class="label">Giá thị trường:</span>
            <span class="value">${formatNumber(result.baseRate)}</span>
          </div>
          <div class="result-row">
            <span class="label">Chênh lệch:</span>
            <span class="value diff ${result.difference >= 0 ? "up" : "down"}">
              ${sign}${formatNumber(Math.abs(result.difference))} (${sign}${result.percentDiff.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div class="result-footer">
          ${this.getQualityMessage(result.quality)}
        </div>
      </div>
    `;

    resultArea.innerHTML = resultHTML;
  }

  getQualityLabel(quality) {
    const labels = {
      excellent: "⭐ Tuyệt vời",
      good: "✓ Tốt",
      fair: "→ Bình thường",
      acceptable: "△ Chấp nhận",
      poor: "✗ Kém"
    };
    return labels[quality] || "?";
  }

  getQualityMessage(quality) {
    const messages = {
      excellent: "Giá rất tốt so với thị trường!",
      good: "Giá tốt hơn thị trường.",
      fair: "Giá gần bằng thị trường.",
      acceptable: "Giá hơi cao hơn thị trường.",
      poor: "Giá cao hơn thị trường nhiều."
    };
    return messages[quality] || "Không rõ";
  }
}

// Export as global
if (typeof window !== "undefined") {
  window.CheckRate = CheckRate;
}
