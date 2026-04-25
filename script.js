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
      button.classList.toggle("active", isActive);
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

  const handleSystemThemeChange = () => {
    const currentChoice = root.dataset.themeChoice || "system";
    if (currentChoice !== "system") {
      return;
    }

    applyThemeChoice("system");
  };

  mediaQuery.addEventListener("change", handleSystemThemeChange);

  document.querySelectorAll("[data-email-user][data-email-domain]").forEach((element) => {
    const { emailUser, emailDomain } = element.dataset;
    if (!emailUser || !emailDomain) {
      return;
    }

    const email = `${emailUser}@${emailDomain}`;
    const link = document.createElement("a");
    link.href = `mailto:${email}`;
    link.textContent = email;
    element.replaceChildren(link);
  });

  tabGroups.forEach((group) => {
    const buttons = Array.from(group.querySelectorAll(".tab-nav .button"));
    const panes = Array.from(group.querySelectorAll(".tab-pane"));

    const activateTab = (button) => {
      const targetId = button.dataset.tabTarget;

      buttons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("active", isActive);
        item.setAttribute("aria-selected", String(isActive));
        item.tabIndex = isActive ? 0 : -1;
      });

      panes.forEach((pane) => {
        pane.classList.toggle("active", pane.id === targetId);
      });
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        activateTab(button);
      });

      button.addEventListener("keydown", (event) => {
        const currentIndex = buttons.indexOf(button);
        let nextIndex;

        if (event.key === "ArrowRight") {
          nextIndex = (currentIndex + 1) % buttons.length;
        } else if (event.key === "ArrowLeft") {
          nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = buttons.length - 1;
        } else {
          return;
        }

        event.preventDefault();
        activateTab(buttons[nextIndex]);
        buttons[nextIndex].focus();
      });
    });
  });
});
