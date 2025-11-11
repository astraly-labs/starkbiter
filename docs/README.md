# Starkbiter Documentation

This directory contains the Starkbiter documentation built with mdBook.

## 🌐 Live Documentation

Visit [starkbiter.rs](https://starkbiter.rs) to read the docs.

## 🛠️ Building Locally

### Prerequisites

```bash
cargo install mdbook mdbook-katex
```

### Build and Serve

```bash
# Serve with hot reload
mdbook serve

# Or just build
mdbook build
```

Open http://localhost:3000

## 🚀 Deployment

Documentation is automatically deployed to `starkbiter.rs` via GitHub Actions when changes are pushed to `main`.

### GitHub Pages Setup

1. **Repository Settings** → **Pages**
   - Source: `gh-pages` branch
   - Custom domain: `starkbiter.rs`
   - ✅ Enforce HTTPS

2. **DNS Configuration** (at your registrar):
   ```
   Type    Name    Value
   A       @       185.199.108.153
   A       @       185.199.109.153
   A       @       185.199.110.153
   A       @       185.199.111.153
   CNAME   www     astraly-labs.github.io
   ```

### Alternative: Cloudflare Pages

For faster deployment and built-in analytics:

1. Connect GitHub repo to Cloudflare Pages
2. **Build settings:**
   - Build command: `cd docs && mdbook build`
   - Build output: `docs/book`
3. **Custom domain:** `starkbiter.rs`

The workflow file handles everything automatically!

## 📝 Contributing to Docs

### Adding a New Page

1. Create markdown file in `src/`
2. Add entry to `src/SUMMARY.md`
3. Test locally: `mdbook serve`
4. Commit and push

### Documentation Structure

```
docs/src/
├── index.md              # Homepage
├── SUMMARY.md            # Table of contents
├── getting_started/      # Installation & tutorials
├── core_concepts/        # Architecture & concepts
├── usage/                # API reference & guides
├── advanced/             # Advanced topics
└── contributing/         # Contributing guide
```

### Writing Guidelines

- Use clear, concise language
- Include code examples
- Add links to related sections
- Test all code examples
- Keep examples up to date

## 🔧 Maintenance

### Updating Dependencies

```bash
cargo install mdbook --force
cargo install mdbook-katex --force
```

### Checking Links

```bash
mdbook build
# Check for broken links in output
```

### Preview PRs

GitHub Actions automatically builds previews for pull requests.

## 📚 Resources

- [mdBook Documentation](https://rust-lang.github.io/mdBook/)
- [mdBook Katex Plugin](https://github.com/lzanini/mdbook-katex)
- [Markdown Guide](https://www.markdownguide.org/)

