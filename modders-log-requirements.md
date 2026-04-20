# The Modder's Log — Improved MVP Requirements

> A terminal-aesthetic command library for Android modders. Built for one-handed use on a second phone while your primary device sits in fastboot.

---

## Vision in One Sentence

A fast, offline-capable snippet vault that gets you the right command in under 5 seconds — with context, warnings, and one tap to copy.

---

## 1. Command Library (Enhanced)

**Original:** A central list of ADB, Fastboot, and Python scripts.

**Improved:**

Each command entry is a structured record, not just a text blob:

| Field | Type | Notes |
|---|---|---|
| `title` | string | Short human name — "Unlock OEM bootloader" |
| `command` | string (or multiline) | The actual shell/Python code |
| `description` | markdown string | What it does, when to use it, what it changes |
| `category` | enum | `bootloader`, `recovery`, `flashing`, `backup`, `debugging`, `partition`, `sideload`, `scripting` |
| `chipset` | enum (multi) | `qualcomm`, `unisoc`, `mediatek`, `samsung-exynos`, `generic` |
| `type` | enum | `adb`, `fastboot`, `python`, `shell`, `edl` |
| `risk` | enum | `safe`, `caution`, `destructive` |
| `tags` | string[] | Free-form extras: `brom`, `sp-flash-tool`, `9008`, `twrp` |
| `notes` | markdown (optional) | ⚠️ warnings, device-specific gotchas, required prerequisites |
| `source` | string (optional) | XDA thread URL, git repo, or author credit |
| `created_at` | ISO date | Auto-stamped |
| `updated_at` | ISO date | Auto-updated on edit |

**Why it matters:** Risk levels prevent disasters. The `source` field means you can trace back to the XDA thread when the command breaks on a new OTA. Device-specific notes surface in-context so you never have to remember "wait, does this work on MIUI 14?"

---

## 2. Categorization (Enhanced)

**Original:** Tags by Category or Chipset.

**Improved:**

Use **two independent filtering axes**, both present simultaneously on the UI:

### Axis 1 — Workflow Category
`bootloader` · `recovery` · `flashing` · `backup` · `debugging` · `partition` · `sideload` · `scripting`

### Axis 2 — Chipset / Platform
`qualcomm` · `unisoc` · `mediatek` · `samsung-exynos` · `generic`

### Axis 3 — Command Type (quick filter chips)
`adb` · `fastboot` · `python` · `edl` · `shell`

### Axis 4 — Risk Level (optional toggle)
`safe` · `caution` · `destructive` — with an "⚠ show destructive" toggle that's **off by default** so dangerous commands don't show while you're scanning fast.

**Implementation:** All filters are stored in the URL as query params (`?cat=bootloader&chip=unisoc`) so you can bookmark "Unisoc flashing commands" as a link.

---

## 3. Instant Search (Enhanced)

**Original:** A high-speed search bar to filter snippets by keyword.

**Improved:**

- **Client-side full-text search** across `title`, `command`, `description`, `tags`, and `notes` simultaneously — use [Fuse.js](https://fusejs.io/) for fuzzy matching (handles typos like `fasboot` → `fastboot`)
- **Debounced at 150ms** — no lag while typing
- **Highlighted matches** — show the matching substring in yellow so you can confirm instantly
- **Search shortcuts:** `⌘K` / `Ctrl+K` globally focuses the search bar from anywhere in the app
- **Result count badge** — "12 of 47 commands" shown live
- **Zero-results state** — helpful message: *"No results for 'edl 9008'. Try removing filters or checking spelling."*

---

## 4. One-Click Copy (Enhanced)

**Original:** A "Copy to Clipboard" button on every code snippet.

**Improved:**

- **Copy button on every snippet** — always visible (not hidden behind hover on mobile)
- **Visual confirmation** — button text changes to `✓ copied` for 1.8s then resets silently
- **Border flash animation** on the code block when copied — subtle lime pulse
- **Multi-line command support** — copies the full block including line continuations (`\`)
- **Variable substitution prompt** (nice-to-have v1.1): if the command contains `$SERIAL` or `$DEVICE`, show a small inline form to fill placeholders before copying — outputs the filled command to clipboard

---

## 5. Mobile-First UI (Enhanced)

**Original:** A responsive design for a secondary phone.

**Improved:**

- **Minimum tap target 48×48px** on all interactive elements — buttons, copy icons, filter chips
- **Persistent floating search bar** — always accessible without scrolling up
- **Swipe to reveal actions** on command cards (edit / delete) on touch devices
- **Code blocks horizontal-scroll** — never wrap terminal commands, scroll instead
- **Offline-first** — the app loads and works fully with no network (PWA manifest + service worker cache of `commands.json` and all assets)
- **"Add to Home Screen" installable** — works like a native app on the secondary phone
- **High contrast code rendering** — minimum 4.5:1 contrast ratio for all command text

---

## 6. Command Editor (New — not in original)

A simple form to add or edit commands without touching JSON:

- **Fields:** title, command (multi-line textarea with monospace font), description (textarea with basic markdown preview), category selector, chipset multi-select, type selector, risk level radio, tags (comma-separated input), notes (optional), source URL (optional)
- **Live preview** — shows how the card will render as you fill the form
- **Markdown in description and notes** — supports `**bold**`, `` `code` ``, `-` lists, and `> blockquote` for warnings
- **Autosave draft** — form state persists in `localStorage` if you close by accident
- **Import from clipboard** — paste a raw command and the editor pre-fills the command field

---

## 7. Persistent Storage (Clarified)

**Original:** Local JSON file.

**Improved spec:**

- **Single `commands.json` file** in the repo — the source of truth
- **Served as a static asset** on Vercel (`/public/data/commands.json`)
- **Edited via the in-app editor** which calls a Vercel serverless function (`/api/save`) to write the updated JSON back to the file — OR, for the simplest possible v1: **download the updated JSON** and commit it manually (no write API needed)
- **No database, no auth, no backend** for v1
- **v1.1 upgrade path:** swap the JSON file for a Vercel KV store or a Turso SQLite DB with zero schema changes — the data shape stays the same

**Recommended v1 data flow:**
```
Browser → fetch('/data/commands.json') → filter/search in memory → render
Editor save → POST /api/save → write to file → redeploy (or trigger Vercel build hook)
```

---

## 8. Syntax Highlighting (Enhanced)

**Original:** Visual differentiation for shell scripts and Python code.

**Improved:**

Apply token-level highlighting without a heavy library — a lightweight regex-based approach is fine for the command types in scope:

| Token | Color | Examples |
|---|---|---|
| Command name | Lime `#d4ff47` | `adb`, `fastboot`, `python3` |
| Flags / options | Sky blue `#7dd3fc` | `-s`, `--no-reboot`, `-w` |
| String values | Green `#86efac` | `"recovery"`, `twrp.img` |
| Variable names | Orange `#fdba74` | `$SERIAL`, `${DEVICE}` |
| File paths | Pink `#fda4af` | `/dev/block/bootdevice` |
| Comments | Muted italic | `# unlock oem` |
| Port / numbers | Purple `#c4b5fd` | `5037`, `0x9006` |

Use [Shiki](https://shiki.style/) (lightweight, no runtime) or a minimal custom tokenizer. Shiki has a `shell` and `python` grammar built-in and works with Vite/Next with zero config.

---

## 9. Quick-Log / Session Notes (New — not in original)

A scratchpad for in-session notes that doesn't require creating a full command entry:

- **Floating "quick log" panel** (bottom drawer on mobile, side panel on desktop)
- **Plain text, auto-timestamped** — e.g., `14:32 — Device serial: ABC123, on MIUI 14.0.6.0`
- **Cleared on close** (session-only) OR optionally exported as `.txt`
- **Not indexed in search** — purely ephemeral scratch space

**Why:** When you're mid-flash you often jot serial numbers, partition sizes, or error codes. Having a scratch area in the same app means you never context-switch.

---

## 10. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Initial page load | < 1.5s on mobile (3G throttled) |
| Search response | < 150ms after keystroke |
| Total JS bundle | < 80KB gzipped (no heavy frameworks unless using Next.js) |
| JSON parse + render | < 50ms for up to 500 commands |
| Offline capability | Full functionality after first load |
| Accessibility | WCAG AA contrast on all text and code |
| Browser support | Last 2 versions of Chrome, Firefox, Safari (mobile-first) |

---

## Out of Scope for MVP

- User accounts or multi-user sync
- Command versioning / git history (handled by committing `commands.json`)
- AI-assisted command generation
- Device detection via USB (browser WebUSB is too flaky for v1)
- Cloud backup (use GitHub as the backup)

---

## Suggested Tech Stack (Vercel Deploy)

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Next.js 14** (App Router) or plain **Vite + React** | Vercel-native, zero config deploy |
| Data | `commands.json` static file | No DB, instant, version-controlled |
| Search | **Fuse.js** | 10KB, fuzzy, no backend |
| Syntax highlight | **Shiki** (server) or custom tokenizer | Zero runtime cost |
| Markdown | **marked.js** | Lightweight, enough for descriptions |
| Styling | Vanilla CSS with design system tokens | Matches the Modder's Log design system |
| PWA | `next-pwa` or Vite PWA plugin | Offline + installable |
| Deployment | **Vercel** | Free tier, instant redeploy on push |
