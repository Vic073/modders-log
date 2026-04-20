---
name: modders-log-design
description: >
  Personal frontend design system for building apps in the "Modder's Log" aesthetic.
  Use this skill whenever building any UI, component, artifact, HTML page, or React app
  for this user. Applies the dark terminal aesthetic with lime accent, mono-first typography,
  and soft micro-animations. Trigger on any request to build, style, improve, or redesign
  a UI — even if the user doesn't say "use my design system". This is the default style
  for ALL frontend work for this user.
---

# Modder's Log — Personal Design System

A dark, terminal-coded aesthetic for tooling UIs. Every surface is near-black. Every label is monospace. The single accent is electric lime. Animations are subtle and purposeful.

---

## 1. Fonts

Always import all three from Google Fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
```

| Role | Font | Usage |
|---|---|---|
| Display / Logo | `Syne` 800 | App name, section heroes, big headings |
| Body | `DM Sans` 300–500 | Paragraphs, descriptions, UI labels |
| Mono (primary code) | `JetBrains Mono` 400–600 | Command snippets, tags, nav links, badges, hint text, table headers, ALL code |

> **Shift from the original:** swap `Fira Code` → `JetBrains Mono`. Same mono role, better ligatures and legibility at small sizes for terminal content.

---

## 2. CSS Custom Properties (Design Tokens)

Paste this `:root` block at the top of every project:

```css
:root {
  /* Backgrounds — stacked dark surfaces */
  --bg:   #0a0a0a;   /* page canvas */
  --s1:   #111111;   /* card base */
  --s2:   #181818;   /* demo / code area */
  --s3:   #222222;   /* input, button rest state */
  --s4:   #2a2a2a;   /* subtle hover fill */

  /* Borders — white alpha layers */
  --b1: rgba(255,255,255,.07);   /* hairline dividers */
  --b2: rgba(255,255,255,.13);   /* input borders, card outlines */
  --b3: rgba(255,255,255,.22);   /* active / focus borders */

  /* Text — warm off-white */
  --t1: #f0ead6;                   /* primary text */
  --t2: rgba(240,234,214,.55);     /* secondary / muted */
  --t3: rgba(240,234,214,.28);     /* hints, placeholders */

  /* Accent — electric lime */
  --y:  #d4ff47;
  --yd: rgba(212,255,71,.12);      /* lime ghost fill */
  --yb: rgba(212,255,71,.25);      /* lime hover fill */

  /* Semantic status colors */
  --green:  #86efac;  --green-bg:  rgba(134,239,172,.12);
  --red:    #f87171;  --red-bg:    rgba(248,113,113,.15);
  --orange: #fdba74;  --orange-bg: rgba(253,186,116,.15);
  --blue:   #7dd3fc;  --blue-bg:   rgba(125,211,252,.12);

  /* Shape */
  --r:    12px;
  --r-sm: 8px;
  --r-xs: 6px;

  /* Nav height — use as scroll offset */
  --hdr: 60px;
}
```

---

## 3. Base Resets

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; color-scheme: dark; }
body {
  background: var(--bg);
  color: var(--t1);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* Thin custom scrollbar */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--b3); border-radius: 3px; }

/* Inline code */
code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  background: rgba(255,255,255,.08);
  padding: 1px 6px;
  border-radius: 4px;
  color: var(--y);
}

/* Selection */
::selection { background: var(--yd); color: var(--t1); }
```

---

## 4. Navigation

Fixed top bar with blur backdrop:

```css
.nav {
  position: fixed; top: 0; left: 0; right: 0;
  height: var(--hdr);
  background: rgba(10,10,10,.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--b1);
  display: flex; align-items: center;
  padding: 0 1.5rem; gap: 1.5rem;
  z-index: 200;
}
.nav-logo {
  font-family: 'Syne', sans-serif;
  font-weight: 800; font-size: 17px;
  letter-spacing: -.03em;
  color: var(--y); text-decoration: none;
}
.nav-link {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  padding: 5px 11px; border-radius: var(--r-xs);
  background: none; border: 1px solid transparent;
  color: var(--t2); cursor: pointer;
  text-decoration: none; white-space: nowrap;
  transition: all .15s;
}
.nav-link:hover { color: var(--t1); border-color: var(--b2); }
.nav-link.active { color: var(--t1); background: var(--s2); border-color: var(--b2); }
```

---

## 5. Buttons

### Primary (lime)
```css
.btn-primary {
  padding: 9px 20px; border-radius: var(--r-sm);
  background: var(--y); color: #000;
  font-weight: 500; font-size: 13px;
  border: none; cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  display: inline-flex; align-items: center; gap: 7px;
  transition: opacity .15s, transform .1s;
}
.btn-primary:hover { opacity: .88; }
.btn-primary:active { transform: scale(.98); }
.btn-primary:disabled { opacity: .45; cursor: not-allowed; }
```

### Ghost / Secondary
```css
.btn-ghost {
  padding: 8px 16px; border-radius: var(--r-sm);
  background: var(--s3); border: 1px solid var(--b2);
  color: var(--t1); font-size: 13px; cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: background .15s, border-color .15s;
}
.btn-ghost:hover { background: var(--s4); border-color: var(--b3); }
```

### Icon / Action button
```css
.btn-icon {
  width: 34px; height: 34px;
  border-radius: var(--r-xs);
  background: var(--s3); border: 1px solid var(--b2);
  color: var(--t2); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; transition: all .15s;
}
.btn-icon:hover { background: var(--b2); color: var(--t1); }
```

### Danger
```css
.btn-danger {
  padding: 7px 14px; border-radius: var(--r-xs);
  background: var(--red-bg); color: var(--red);
  border: none; cursor: pointer; font-size: 12px;
  font-family: 'DM Sans', sans-serif;
  transition: background .15s;
}
.btn-danger:hover { background: rgba(248,113,113,.28); }
```

### Copy-to-Clipboard button (critical for Modder's Log)
```css
.btn-copy {
  padding: 5px 10px; border-radius: var(--r-xs);
  background: var(--yd); border: 1px solid rgba(212,255,71,.2);
  color: var(--y); font-family: 'JetBrains Mono', monospace;
  font-size: 10px; cursor: pointer; letter-spacing: .04em;
  transition: all .2s;
}
.btn-copy:hover { background: var(--yb); border-color: var(--y); }
.btn-copy.copied {
  background: var(--green-bg); color: var(--green);
  border-color: rgba(134,239,172,.3);
}
```

---

## 6. Cards & Surfaces

```css
.card {
  background: var(--s1);
  border: 1px solid var(--b1);
  border-radius: var(--r);
  overflow: hidden;
  transition: border-color .2s;
}
.card:hover { border-color: var(--b2); }

/* Command/snippet card — the most common element */
.snippet-card {
  background: var(--s1);
  border: 1px solid var(--b1);
  border-radius: var(--r);
  overflow: hidden;
  transition: border-color .2s, box-shadow .2s;
}
.snippet-card:hover {
  border-color: var(--b2);
  box-shadow: 0 4px 20px rgba(0,0,0,.4);
}
.snippet-header {
  padding: .75rem 1rem;
  display: flex; align-items: center; gap: .6rem;
  border-bottom: 1px solid var(--b1);
}
.snippet-body {
  background: var(--s2);
  padding: 1rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--t1);
  overflow-x: auto;
}
.snippet-footer {
  padding: .5rem 1rem;
  display: flex; align-items: center; gap: .5rem;
  border-top: 1px solid var(--b1);
}
```

---

## 7. Inputs & Search

```css
.input {
  padding: 9px 12px;
  border-radius: var(--r-sm);
  background: var(--s3);
  border: 1px solid var(--b2);
  color: var(--t1);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  outline: none;
  width: 100%;
  transition: border-color .15s;
}
.input::placeholder { color: var(--t3); }
.input:focus { border-color: var(--y); }
.input:focus-visible { outline: none; }

/* Search — with icon */
.search-wrap {
  position: relative;
  display: flex; align-items: center;
}
.search-icon {
  position: absolute; left: 11px;
  color: var(--t3); font-size: 14px; pointer-events: none;
}
.search-input {
  padding-left: 34px;
  /* inherits .input styles */
}
.search-shortcut {
  position: absolute; right: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; color: var(--t3);
  background: var(--s2); border: 1px solid var(--b2);
  border-radius: 4px; padding: 1px 5px;
}
```

---

## 8. Badges & Tags

```css
.badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: .04em;
  display: inline-flex; align-items: center;
  white-space: nowrap;
}

/* Category badges */
.badge-bootloader  { background: var(--blue-bg);   color: var(--blue); }
.badge-recovery    { background: var(--green-bg);  color: var(--green); }
.badge-flashing    { background: var(--orange-bg); color: var(--orange); }
.badge-fastboot    { background: rgba(212,255,71,.1); color: var(--y); }
.badge-adb         { background: rgba(196,181,253,.1); color: #c4b5fd; }
.badge-python      { background: rgba(253,164,175,.1); color: #fda4af; }

/* Chipset badges */
.badge-qualcomm    { background: rgba(125,211,252,.1); color: var(--blue); }
.badge-unisoc      { background: rgba(253,186,116,.1); color: var(--orange); }
.badge-mediatek    { background: rgba(134,239,172,.1); color: var(--green); }
.badge-samsung     { background: rgba(196,181,253,.1); color: #c4b5fd; }
```

---

## 9. Syntax Highlighting (Code Blocks)

For terminal/shell snippets, apply these token colors over `--s2` background:

```css
.token-cmd     { color: var(--y); }          /* adb, fastboot, python */
.token-flag    { color: #7dd3fc; }           /* -s, --no-reboot */
.token-string  { color: #86efac; }           /* "values in quotes" */
.token-comment { color: var(--t3); font-style: italic; } /* # comments */
.token-path    { color: #fda4af; }           /* /dev/block/... */
.token-var     { color: #fdba74; }           /* $DEVICE, ${arg} */
.token-num     { color: #c4b5fd; }           /* port numbers, offsets */
```

Shell block structure:
```html
<pre class="code-block">
  <span class="token-cmd">adb</span>
  <span class="token-flag">-s</span>
  <span class="token-var">$SERIAL</span>
  shell getprop ro.product.board
</pre>
```

---

## 10. Animations & Transitions

### Core principles
- Duration 150ms for micro-interactions (hover, button press)
- Duration 200–300ms for reveals and state changes
- Duration 400–600ms for entry animations
- Always use `transition` over `animation` unless looping
- Always respect `prefers-reduced-motion`

### Standard transitions
```css
/* Instant feedback — use on buttons, badges, icons */
.transition-fast { transition: all .15s ease; }

/* State reveals — tabs, dropdowns, side panels */
.transition-mid { transition: all .25s ease; }

/* Entry / mount — cards appearing, modals */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.anim-fade-up { animation: fadeUp .3s ease both; }

/* Stagger children */
.anim-fade-up:nth-child(1) { animation-delay: 0ms; }
.anim-fade-up:nth-child(2) { animation-delay: 50ms; }
.anim-fade-up:nth-child(3) { animation-delay: 100ms; }
/* continue as needed */

/* Shimmer skeleton loader */
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, var(--b1) 25%, var(--b3) 50%, var(--b1) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

/* Copy success flash */
@keyframes flashBorder {
  0%, 100% { border-color: var(--b1); }
  50%       { border-color: var(--y); }
}
.flash-copy { animation: flashBorder .4s ease; }

/* Spinner */
@keyframes spin { to { transform: rotate(360deg); } }
.spinner {
  width: 14px; height: 14px;
  border: 2px solid var(--b2);
  border-top-color: var(--y);
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

/* Reduced motion — always include */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
  }
}
```

---

## 11. Layout Patterns

### Page shell
```css
.page { padding-top: var(--hdr); }

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

/* Two-pane layout (sidebar + content) */
.layout-split {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 1.5rem;
  align-items: start;
}
@media (max-width: 768px) {
  .layout-split { grid-template-columns: 1fr; }
}
```

### Card grid
```css
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1px;
  background: var(--b1);
  border: 1px solid var(--b1);
  border-radius: var(--r);
  overflow: hidden;
}
/* Cells in this grid don't need their own border */

/* Gap-based grid (cards with visible gaps) */
.grid-gap {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}
```

---

## 12. Typography Scale

```css
/* Display — app name, hero */
.text-display {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: clamp(1.8rem, 4vw, 3.2rem);
  letter-spacing: -.04em;
  line-height: 1.05;
}

/* Heading — section titles */
.text-heading {
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: clamp(1.2rem, 2.5vw, 1.8rem);
  letter-spacing: -.03em;
  line-height: 1.1;
}

/* Section tag — "01 / bootloader" */
.text-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--t2);
}

/* Body */
.text-body  { font-size: 14px; font-weight: 400; line-height: 1.65; }
.text-small { font-size: 12.5px; font-weight: 300; color: var(--t2); }
.text-hint  { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--t3); }
```

---

## 13. Empty, Loading & Error States

Always handle all three — never show a blank area.

```html
<!-- Empty state -->
<div class="state-empty">
  <span class="state-icon">📂</span>
  <p class="state-msg">No commands yet.</p>
  <p class="state-sub">Add your first snippet to get started.</p>
</div>

<!-- Loading -->
<div class="skeleton" style="height:20px; width:60%; margin-bottom:8px;"></div>
<div class="skeleton" style="height:20px; width:80%;"></div>

<!-- Error -->
<div class="state-error">
  <span>⚠</span> Failed to load.
  <button onclick="retry()">Retry →</button>
</div>
```

```css
.state-empty {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 3rem 1rem; gap: .5rem;
  color: var(--t3); text-align: center;
}
.state-icon  { font-size: 2rem; margin-bottom: .25rem; }
.state-msg   { font-size: 14px; color: var(--t2); }
.state-sub   { font-size: 12px; }
.state-error {
  color: var(--red); font-size: 13px;
  display: flex; align-items: center; gap: 8px;
}
.state-error button {
  background: none; border: none;
  color: var(--blue); cursor: pointer; font-size: 12px;
}
```

---

## 14. Mobile-First Rules

- Tap targets minimum **48×48px** (use padding, not explicit size)
- No hover-only interactions — every hover state must have a touch equivalent
- `overscroll-behavior: contain` on scrollable lists
- Nav links scroll horizontally on mobile, hide scrollbar
- Search bar full-width on mobile
- Code blocks horizontal scroll, never wrap

```css
@media (max-width: 640px) {
  .container { padding: 1rem; }
  .snippet-body { font-size: 12px; }
  .nav-links { overflow-x: auto; }
  .nav-links::-webkit-scrollbar { display: none; }
}
```

---

## 15. Quick Component Recipes

### Copy-to-clipboard (JS)
```javascript
async function copyCmd(text, btn) {
  await navigator.clipboard.writeText(text);
  btn.textContent = '✓ copied';
  btn.classList.add('copied');
  setTimeout(() => {
    btn.textContent = 'copy';
    btn.classList.remove('copied');
  }, 1800);
}
```

### Tag filter pill group
```html
<div class="filter-pills">
  <button class="pill active" data-filter="all">all</button>
  <button class="pill" data-filter="bootloader">bootloader</button>
  <button class="pill" data-filter="recovery">recovery</button>
</div>
```
```css
.filter-pills { display: flex; gap: 6px; flex-wrap: wrap; }
.pill {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; padding: 5px 12px;
  border-radius: 20px;
  background: var(--s3); border: 1px solid var(--b2);
  color: var(--t2); cursor: pointer;
  transition: all .15s;
}
.pill:hover  { border-color: var(--b3); color: var(--t1); }
.pill.active { background: var(--yd); border-color: rgba(212,255,71,.3); color: var(--y); }
```

### Keyboard shortcut badge
```html
<kbd class="kbd">⌘K</kbd>
```
```css
.kbd {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; padding: 2px 6px;
  border-radius: 4px;
  background: var(--s3); border: 1px solid var(--b2);
  color: var(--t3);
}
```

---

## 16. Vercel Deployment Notes

- Dark scheme: set `<meta name="theme-color" content="#0a0a0a">` and `<html style="color-scheme:dark">`
- Fonts: use Google Fonts CDN (already in template above) — no self-hosting needed for Vercel
- JSON data: store in `/data/commands.json`, fetch client-side or via Next.js `getStaticProps` / route handlers
- No build step required for plain HTML+JS — just drop in `/public` or use a Vite/Next scaffold

---

## 17. Design Do's and Don'ts

| ✅ Do | ❌ Don't |
|---|---|
| Use JetBrains Mono for ALL code, tags, hints | Use system fonts for code |
| Lime `--y` for ONE accent — CTAs, active states, focus | Use lime for decorative elements |
| Layer `--s1` → `--s2` → `--s3` for depth | Use flat same-shade surfaces |
| 1px border with alpha for card edges | Box shadows on flat cards |
| `transition: all .15s` on interactive elements | Instant state jumps |
| Monospace for category labels and chipset names | Serif or display fonts for UI labels |
| Show copy confirmation (1.8s, then reset) | Silent clipboard operations |
| Handle empty / loading / error states | Render null/blank areas |
