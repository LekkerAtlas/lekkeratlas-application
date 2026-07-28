# Design system variations

Each file is a complete drop-in replacement for `src/index.css` and remains compatible with the component-local token architecture.

## Try a variation

```bash
cp design-system-variations/index.open-commons.css src/index.css
```

Replace the filename with one of:

- `index.open-commons.css`
- `index.signal-club.css`
- `index.open-archive.css`

The dark version is selected automatically through `prefers-color-scheme`.

## Restore before testing another variation

Keep your existing `src/index.css` in Git, then use:

```bash
git restore src/index.css
```

Alternatively, copy another variation directly over it.
