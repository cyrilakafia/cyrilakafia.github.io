# Personal Website

This site is now a plain static GitHub Pages site.

Files you edit:

- `index.html`
- `styles.css`
- `script.js`

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
