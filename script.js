document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const themeOptions = Array.from(document.querySelectorAll(".theme-option"));
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const tabGroups = document.querySelectorAll(".tabs");
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const validThemeChoices = new Set(["light", "dark", "system"]);

  const getSavedThemeChoice = () => {
    try {
      const savedTheme = localStorage.getItem("theme");
      if (validThemeChoices.has(savedTheme)) {
        return savedTheme;
      }
    } catch (error) {
      return "system";
    }

    return "system";
  };

  const resolveTheme = (themeChoice) => {
    if (themeChoice === "light" || themeChoice === "dark") {
      return themeChoice;
    }

    return mediaQuery.matches ? "dark" : "light";
  };

  const applyThemeChoice = (themeChoice) => {
    const choice = validThemeChoices.has(themeChoice) ? themeChoice : "system";
    const resolvedTheme = resolveTheme(choice);
    root.dataset.themeChoice = choice;
    root.dataset.theme = resolvedTheme;

    themeOptions.forEach((button) => {
      const isActive = button.dataset.themeChoice === choice;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (themeMeta) {
      themeMeta.setAttribute("content", resolvedTheme === "dark" ? "#0f1419" : "#ffffff");
    }
  };

  applyThemeChoice(getSavedThemeChoice());

  themeOptions.forEach((button) => {
    button.addEventListener("click", () => {
      const themeChoice = button.dataset.themeChoice;
      applyThemeChoice(themeChoice);

      try {
        localStorage.setItem("theme", themeChoice);
      } catch (error) {
        // Ignore storage failures and keep the current session theme.
      }
    });
  });

  const handleSystemThemeChange = (event) => {
    const currentChoice = root.dataset.themeChoice || "system";
    if (currentChoice !== "system") {
      return;
    }

    applyThemeChoice("system");
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
