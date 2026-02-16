# IE11 Retro Samples

Runnable examples for the article:
"Do you remember IE11? Looking back at 2010s HTML coding"

## Quick Start

1. Run a local web server from the project root:
```bash
python3 -m http.server 8080
```
2. Open:
`http://localhost:8080/samples/ie11-retro/`

## Included Demos

- `Flexbox + min-width: 0` overflow fix
- `object-fit` fallback using background image
- `aspect-ratio` fallback using `padding-top`
- `position: sticky` fallback using scroll + fixed class
- `loading="lazy"` fallback using manual lazy loader
- `classList.toggle(name, force)` replacement via add/remove
- `fetch()` fallback using `XMLHttpRequest`
- `details/summary` style behavior with `div + button + ARIA`
- `X-UA-Compatible` meta snippet
