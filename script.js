document.addEventListener("DOMContentLoaded", () => {
  const siteNav = document.querySelector(".site-nav");
  const tabGroups = document.querySelectorAll(".tabs");
  const pageLinks = Array.from(document.querySelectorAll(".page-link[data-page]"));
  const pages = Array.from(document.querySelectorAll(".page[data-page]"));
  const postList = document.querySelector("[data-post-list]");
  const markdownPost = document.querySelector("[data-markdown-post]");
  const pageAliases = new Map([
    ["", "bio"],
    ["bio", "bio"],
    ["updates", "bio"],
    ["cv", "bio"],
    ["resume", "bio"],
    ["vitae", "bio"],
    ["research", "research"],
    ["research-projects", "research"],
    ["publications", "research"],
    ["presentations", "research"],
    ["projects", "research"],
    ["service", "service"],
    ["teaching", "service"],
    ["mentorship", "service"],
    ["leadership", "service"],
    ["blog", "blog"],
  ]);

  const updateNavScrollState = () => {
    if (!siteNav) {
      return;
    }

    siteNav.classList.toggle("scrolled", window.scrollY > 4);
  };

  updateNavScrollState();
  window.addEventListener("scroll", updateNavScrollState, { passive: true });

  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return;
    }

    try {
      const url = new URL(href, window.location.href);
      if ((url.protocol === "http:" || url.protocol === "https:") && url.hostname !== "cyrilakafia.github.io" && url.origin !== window.location.origin) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
    } catch (error) {
      // Leave malformed URLs untouched.
    }
  });

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

  const currentHash = () => window.location.hash.replace(/^#/, "");

  const pageFromHash = (hash = currentHash()) => {
    return pageAliases.get(hash) || "bio";
  };

  const linkHash = (link) => link.hash.replace(/^#/, "");

  const scrollToHash = (hash) => {
    if (!hash) {
      return;
    }

    const target = document.getElementById(hash);
    if (!target) {
      return;
    }

    const scroll = () => {
      target.scrollIntoView({ block: "start" });
    };

    requestAnimationFrame(scroll);
    window.setTimeout(scroll, 120);
    window.setTimeout(scroll, 360);
    window.setTimeout(scroll, 900);
    if (document.readyState !== "complete") {
      window.addEventListener("load", scroll, { once: true });
    }
  };

  const setActivePage = (pageName, options = {}) => {
    const { updateHash = true, hash = pageName, scroll = false } = options;
    const targetHash = hash || pageName;
    const nextPage = pageAliases.get(pageName) || pageAliases.get(targetHash) || "bio";
    const hasExactNavLink = pageLinks.some((link) => linkHash(link) === targetHash);

    pages.forEach((page) => {
      page.classList.toggle("active", page.dataset.page === nextPage);
    });

    pageLinks.forEach((link) => {
      const isActive = linkHash(link) === targetHash || (!hasExactNavLink && link.dataset.page === nextPage);
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    if (!updateHash) {
      if (scroll) {
        scrollToHash(hash);
      }
      return;
    }

    const nextHash = `#${targetHash || nextPage}`;
    if (window.location.hash !== nextHash) {
      history.pushState({ page: nextPage }, "", nextHash);
    }

    if (scroll) {
      scrollToHash(hash);
    }
  };

  pageLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const hash = linkHash(link) || link.dataset.page;
      setActivePage(link.dataset.page, { hash, scroll: true });
    });
  });

  window.addEventListener("popstate", () => {
    const hash = currentHash();
    setActivePage(pageFromHash(hash), { updateHash: false, hash, scroll: true });
  });

  window.addEventListener("hashchange", () => {
    const hash = currentHash();
    setActivePage(pageFromHash(hash), { updateHash: false, hash, scroll: true });
  });

  setActivePage(pageFromHash(), { updateHash: false, hash: currentHash(), scroll: Boolean(currentHash()) });

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

  const escapeHTML = (value) =>
    value.replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;",
    }[character]));

  const renderInlineMarkdown = (value) => {
    let output = escapeHTML(value);
    output = output.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    output = output.replace(/\*(.+?)\*/g, "<em>$1</em>");
    output = output.replace(/`(.+?)`/g, "<code>$1</code>");
    return output;
  };

  const renderMarkdown = (markdown) => {
    const lines = markdown.replace(/\r\n/g, "\n").split("\n");
    const html = [];
    let paragraph = [];
    let listItems = [];

    const flushParagraph = () => {
      if (!paragraph.length) {
        return;
      }

      html.push(`<p>${renderInlineMarkdown(paragraph.join(" "))}</p>`);
      paragraph = [];
    };

    const flushList = () => {
      if (!listItems.length) {
        return;
      }

      html.push(`<ul>${listItems.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ul>`);
      listItems = [];
    };

    lines.forEach((line) => {
      const trimmed = line.trim();

      if (!trimmed) {
        flushParagraph();
        flushList();
        return;
      }

      if (trimmed.startsWith("## ")) {
        flushParagraph();
        flushList();
        html.push(`<h2>${renderInlineMarkdown(trimmed.slice(3))}</h2>`);
        return;
      }

      if (trimmed.startsWith("# ")) {
        return;
      }

      if (trimmed.startsWith("- ")) {
        flushParagraph();
        listItems.push(trimmed.slice(2));
        return;
      }

      flushList();
      paragraph.push(trimmed);
    });

    flushParagraph();
    flushList();

    return html.join("\n");
  };

  const parseMarkdownDocument = (markdown) => {
    const normalized = markdown.replace(/\r\n/g, "\n").trim();
    const result = {
      frontMatter: {},
      content: normalized,
    };

    if (!normalized.startsWith("---\n")) {
      return result;
    }

    const endIndex = normalized.indexOf("\n---", 4);
    if (endIndex === -1) {
      return result;
    }

    const frontMatter = normalized.slice(4, endIndex).split("\n");
    result.content = normalized.slice(endIndex + 4).trim();

    frontMatter.forEach((line) => {
      const separatorIndex = line.indexOf(":");
      if (separatorIndex === -1) {
        return;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();
      if (key) {
        result.frontMatter[key] = value;
      }
    });

    return result;
  };

  const loadMarkdown = async (slug, basePath = "posts") => {
    const validSlug = /^[a-z0-9-]+$/.test(slug || "");
    if (!validSlug) {
      throw new Error("Invalid post slug.");
    }

    const response = await fetch(`${basePath}/${slug}.md`);
    if (!response.ok) {
      throw new Error("Markdown file not found.");
    }

    return parseMarkdownDocument(await response.text());
  };

  const renderPostCard = (slug, post) => {
    const { frontMatter } = post;
    const title = frontMatter.title || "Untitled post";
    const status = frontMatter.status || "Draft";
    const summary = frontMatter.summary || "Read this post.";

    return `
      <article class="post-card">
        <a class="post-card-link" href="posts/post.html?post=${encodeURIComponent(slug)}">
          <p class="post-meta">${escapeHTML(status)}</p>
          <h3>${escapeHTML(title)}</h3>
          <p>${escapeHTML(summary)}</p>
          <span class="post-cta">Read article <span aria-hidden="true">→</span></span>
        </a>
      </article>
    `;
  };

  const loadPostList = async () => {
    if (!postList) {
      return;
    }

    try {
      const response = await fetch("posts/posts.json");
      if (!response.ok) {
        throw new Error("Post index not found.");
      }

      const slugs = await response.json();
      const posts = await Promise.all(slugs.map(async (slug) => ({
        slug,
        post: await loadMarkdown(slug),
      })));

      postList.innerHTML = posts.map(({ slug, post }) => renderPostCard(slug, post)).join("");
    } catch (error) {
      postList.innerHTML = '<p class="blog-empty">Posts could not be loaded from Markdown. Preview the site through a local server or GitHub Pages so the browser can fetch the Markdown files.</p>';
    }
  };

  const loadMarkdownPost = async () => {
    if (!markdownPost) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const slug = params.get("post");
    const validSlug = /^[a-z0-9-]+$/.test(slug || "");

    if (!validSlug) {
      markdownPost.innerHTML = '<a class="post-back" href="../index.html#blog">&larr; Back to Blog</a><p>Post not found.</p>';
      return;
    }

    try {
      const { frontMatter, content } = await loadMarkdown(slug, ".");
      const title = frontMatter.title || "Blog Post";
      const meta = frontMatter.status || "Draft";
      const description = frontMatter.summary || "A blog post by Cyril Akafia.";

      const titleElement = document.querySelector("[data-post-title]");
      const metaElement = document.querySelector("[data-post-meta]");
      const descriptionElement = document.querySelector("[data-post-description]");
      const descriptionMeta = document.querySelector('meta[name="description"]');

      document.title = `${title} | Cyril Akafia`;
      if (titleElement) {
        titleElement.textContent = title;
      }
      if (metaElement) {
        metaElement.textContent = meta;
      }
      if (descriptionElement) {
        descriptionElement.textContent = description;
      }
      if (descriptionMeta) {
        descriptionMeta.setAttribute("content", description);
      }

      markdownPost.innerHTML = `<a class="post-back" href="../index.html#blog">&larr; Back to Blog</a>\n${renderMarkdown(content)}`;
    } catch (error) {
      markdownPost.innerHTML = '<a class="post-back" href="../index.html#blog">&larr; Back to Blog</a><p>This post could not be loaded from Markdown. If you are opening the site with a file URL, preview it through a local server or GitHub Pages so the browser can fetch the Markdown file.</p>';
    }
  };

  loadPostList();
  loadMarkdownPost();
});
