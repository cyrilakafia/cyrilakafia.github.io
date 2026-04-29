# Personal Website

This site is now a plain static GitHub Pages site.

Files you edit:

- `index.html`
- `styles.css`
- `script.js`
- `posts/post.html` reusable blog post template
- `posts/*.md` Markdown source files for blog posts
- `posts/posts.json` ordered list of blog post slugs

Assets:

- `assets/profile.jpg`
- `assets/favicon.png`

GitHub Pages:

1. In GitHub, open repository `Settings`.
2. Open `Pages`.
3. Set `Source` to `Deploy from a branch`.
4. Select your main branch and the root folder.

The `.nojekyll` file tells GitHub Pages to serve the files directly without Jekyll.

Local preview:

```bash
python3 -m http.server 8000
```

Then open `http://127.0.0.1:8000`.

Use the local server preview for blog posts. The post template loads Markdown with JavaScript, and most browsers block that when the site is opened directly as a `file://` URL.

Blog workflow:

1. Create a Markdown file in `posts/`, such as `posts/my-new-post.md`.
2. Add front matter at the top:

```markdown
---
title: My New Post
status: Draft
summary: One sentence summary shown on the Blog page.
---
```

3. Write the post body below the front matter.
4. Add the slug, without `.md`, to `posts/posts.json`.
5. Preview with `python3 -m http.server 8000`, then open `http://127.0.0.1:8000/index.html#blog`.
