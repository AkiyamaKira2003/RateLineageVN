/**
 * Sidebar Manager
 * Handles sidebar panel switching and visibility
 */

const STORAGE_ACTIVE_PANEL_KEY = "rateline_active_panel";
const DEFAULT_ACTIVE_PANEL = "check-rate";

class SidebarManager {
  constructor() {
    this.activePanel = this.loadActivePanel();
    this.sidebarVisible = false;
    this.animating = false;
    this.init();
  }

  init() {
    const sidebarContainer = document.getElementById("sidebarPanel");
    const tabButtons = document.querySelectorAll("[data-feature]");

    if (!sidebarContainer) {
      console.warn("[SidebarManager] Sidebar container not found");
      return;
    }

    // Tab switching
    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const feature = btn.dataset.feature;
        this.switchPanel(feature);
      });
    });

    // Set initial active panel
    this.updateActivePanel();
  }

  loadActivePanel() {
    try {
      const stored = localStorage.getItem(STORAGE_ACTIVE_PANEL_KEY);
      if (stored && ["check-rate", "xgum-calc"].includes(stored)) return stored;
    } catch {
      // Ignore storage issues
    }
    return DEFAULT_ACTIVE_PANEL;
  }

  saveActivePanel() {
    try {
      localStorage.setItem(STORAGE_ACTIVE_PANEL_KEY, this.activePanel);
    } catch {
      // Ignore storage issues
    }
  }

  switchPanel(feature) {
    if (this.animating || this.activePanel === feature) return;

    this.animating = true;
    this.activePanel = feature;
    this.saveActivePanel();

    const currentPanel = document.querySelector(".feature-panel.is-active");
    const newPanel = document.getElementById(`${feature}-panel`);

    if (!currentPanel || !newPanel) {
      this.animating = false;
      return;
    }

    // Fade out current
    currentPanel.classList.remove("is-active");
    setTimeout(() => {
      // Fade in new
      newPanel.classList.add("is-active");
      this.animating = false;
    }, 150);

    // Update tab styling
    document.querySelectorAll("[data-feature]").forEach((btn) => {
      btn.classList.toggle(
        "is-active",
        btn.dataset.feature === feature
      );
    });
  }

  updateActivePanel() {
    const activePanel = document.getElementById(`${this.activePanel}-panel`);
    const tabs = document.querySelectorAll("[data-feature]");

    if (activePanel) {
      activePanel.classList.add("is-active");
    }

    tabs.forEach((tab) => {
      if (tab.dataset.feature === this.activePanel) {
        tab.classList.add("is-active");
      } else {
        tab.classList.remove("is-active");
      }
    });
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    const sidebar = document.getElementById("sidebarPanel");
    if (sidebar) {
      sidebar.classList.toggle("is-visible", this.sidebarVisible);
    }
  }

  showSidebar() {
    if (!this.sidebarVisible) {
      this.toggleSidebar();
    }
  }

  hideSidebar() {
    if (this.sidebarVisible) {
      this.toggleSidebar();
    }
  }
}

// Export as global or module
if (typeof window !== "undefined") {
  window.SidebarManager = SidebarManager;
}
