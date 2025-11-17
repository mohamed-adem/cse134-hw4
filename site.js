// site.js

// ---------------------
// THEME TOGGLE
// ---------------------
const root = document.documentElement;
const toggleBtn = document.querySelector("[data-theme-toggle]");
const THEME_KEY = "cse134b-theme";

function applyTheme(theme) {
  root.dataset.theme = theme; // sets html[data-theme="..."]
  if (toggleBtn) {
    const isDark = theme === "dark";
    toggleBtn.setAttribute("aria-pressed", String(isDark));
    // Just change the visible label between Dark/Light
    // (keeps the sr-only span intact)
    const textNode = toggleBtn.firstChild;
    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
      textNode.textContent = isDark ? "Light " : "Dark ";
    }
  }
}

if (toggleBtn) {
  // If you accidentally left `hidden` in HTML, this ensures it's visible
  toggleBtn.hidden = false;

  const stored = localStorage.getItem(THEME_KEY);
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const initialTheme = stored || (prefersDark ? "dark" : "light");
  applyTheme(initialTheme);

  toggleBtn.addEventListener("click", () => {
    const current = root.dataset.theme === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });
}

// ---------------------
// VIEW TRANSITION API (MPA-style)
// ---------------------
if (document.startViewTransition) {
  const vtLinks = document.querySelectorAll("a[data-vt-link]");

  vtLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const url = link.href;
      if (url === window.location.href) return;

      event.preventDefault();

      document.startViewTransition(() => {
        window.location.href = url;
      });
    });
  });
}