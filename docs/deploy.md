# Deploy

Live site: https://baditaflorin.github.io/vagus-reset-coach/

Repository: https://github.com/baditaflorin/vagus-reset-coach

## Publishing

GitHub Pages serves the `main` branch `/docs` directory.

```bash
make build
git add docs package.json package-lock.json
git commit -m "build: publish pages"
git push origin main
```

## Rollback

Revert the publishing commit and push `main`.

```bash
git revert <commit_sha>
git push origin main
```

## Custom Domain

No custom domain is configured. If one is added, place `CNAME` in `docs/` and configure DNS with the domain provider according to GitHub Pages documentation.

## Pages Notes

The app uses `/vagus-reset-coach/` as the base path. GitHub Pages does not support `_headers` or `_redirects`, so `404.html` is copied from `index.html` for SPA fallback behavior.
