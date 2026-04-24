document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const themeToggle = document.querySelector("#theme-toggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const tabGroups = document.querySelectorAll(".tabs");
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const getPreferredTheme = () => {
    try {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark" || savedTheme === "light") {
        return savedTheme;
      }
    } catch (error) {
      return mediaQuery.matches ? "dark" : "light";
    }

    return mediaQuery.matches ? "dark" : "light";
  };

  const applyTheme = (theme) => {
    root.dataset.theme = theme;

    if (themeToggle) {
      const nextLabel = theme === "dark" ? "Light mode" : "Dark mode";
      themeToggle.textContent = nextLabel;
      themeToggle.setAttribute("aria-label", `Switch to ${nextLabel.toLowerCase()}`);
      themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
    }

    if (themeMeta) {
      themeMeta.setAttribute("content", theme === "dark" ? "#0f1419" : "#ffffff");
    }
  };

  applyTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);

      try {
        localStorage.setItem("theme", nextTheme);
      } catch (error) {
        // Ignore storage failures and keep the current session theme.
      }
    });
  }

  const handleSystemThemeChange = (event) => {
    try {
      if (localStorage.getItem("theme")) {
        return;
      }
    } catch (error) {
      // Fall through and update from system preference.
    }

    applyTheme(event.matches ? "dark" : "light");
  };

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleSystemThemeChange);
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(handleSystemThemeChange);
  }

  tabGroups.forEach((group) => {
    const buttons = group.querySelectorAll(".tab-nav .button");
    const panes = group.querySelectorAll(".tab-pane");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const targetId = button.dataset.tabTarget;

        buttons.forEach((item) => {
          item.classList.remove("active");
          item.setAttribute("aria-selected", "false");
        });

        panes.forEach((pane) => {
          pane.classList.remove("active");
        });

        button.classList.add("active");
        button.setAttribute("aria-selected", "true");

        const target = group.querySelector(`#${targetId}`);
        if (target) {
          target.classList.add("active");
        }
      });
    });
  });
});
