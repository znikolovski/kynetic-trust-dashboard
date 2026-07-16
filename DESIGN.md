---
name: Kinetic Trust Dashboard
description: Institutional command surface — real-time portfolio intelligence at a single authenticated view
colors:
  obsidian: "#0a0c10"
  surface: "#111318"
  surface-lowest: "#0c0e12"
  surface-container-low: "#1a1c20"
  surface-container: "#1e2024"
  surface-container-high: "#282a2e"
  primary: "#00dbe9"
  primary-container: "#00f0ff"
  secondary: "#dfb7ff"
  tertiary: "#ebffa9"
  status-completed: "#00ff80"
  status-pending: "#ebffa9"
  error: "#ffb4ab"
  on-surface: "#e2e2e8"
  on-surface-variant: "#b9cacb"
  outline: "#849495"
  outline-variant: "#3b494b"
typography:
  display:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3.5rem)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "'adobe-clean', system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.625rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.1em"
  data:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
  badge:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.625rem"
    fontWeight: 500
    letterSpacing: "0.1em"
  icon:
    fontFamily: "'Material Symbols Outlined'"
    fontSize: "20px"
    fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24"
rounded:
  default: "4px"
  lg: "8px"
  full: "9999px"
spacing:
  sidebar-width: "220px"
  sidebar-gap: "32px"
  card-pad: "24px"
  gutter: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.obsidian}"
    rounded: "{rounded.lg}"
    padding: "8px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.obsidian}"
    rounded: "{rounded.lg}"
    padding: "8px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "8px 20px"
  glass-card:
    backgroundColor: "rgba(255,255,255,0.03)"
    rounded: "{rounded.lg}"
    padding: "{spacing.card-pad}"
  status-badge-completed:
    backgroundColor: "rgba(0,255,128,0.12)"
    textColor: "{colors.status-completed}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  status-badge-pending:
    backgroundColor: "rgba(235,255,169,0.12)"
    textColor: "{colors.status-pending}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  status-badge-settled:
    backgroundColor: "rgba(0,219,233,0.12)"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
---

# Design System: Kinetic Trust Dashboard

## 1. Overview

**Creative North Star: "The Neon Vault"**

The dashboard is the interior of the vault — authenticated, alive, precise. Where the marketing site presents the vault door (the brand promise), the dashboard is the vault itself: a live command surface where institutional clients manage their entire SecurBank relationship in a single authenticated view. The obsidian depth system carries through unchanged; what changes is the density and the register. Data is not presented — it is displayed at operational precision, in real time, at the speed of the markets.

This system explicitly rejects the Bloomberg terminal aesthetic: grey-grid density, zero visual intention, information-first with beauty treated as an afterthought. The data rigour is correct; the visual register is wrong. It rejects generic SaaS dashboard patterns: cream or white backgrounds, hero-metric cards with gradient orbs, identical icon-heading-text card grids (Linear, Stripe, Notion style). Every pattern that makes the dashboard look like a startup product is a trust break for an institutional user who has operated real trading infrastructure. It rejects legacy banking portal design: slow and form-heavy screens, light-on-dark tables with accents on every heading, loading friction as a substitute for depth.

The shared brand vocabulary — Hanken Grotesk, Adobe Clean, JetBrains Mono, obsidian/surface depth, primary cyan — ensures continuity from the logged-out marketing site to this authenticated surface. An institutional client who moves from the credit-cards page to their portfolio view must feel the same vault, now with the lights fully on.

**Key Characteristics:**
- Data density: every pixel carries information or enables action — no decorative surfaces
- Live register: balances, tickers, and status indicators communicate that the interface is always-current
- JetBrains Mono for all numeric data: separates the data layer from the editorial layer typographically
- Sidebar as command rail: 220px fixed sidebar provides constant spatial orientation across all screens
- Status vocabulary is closed: COMPLETED (green), SETTLED (cyan), PENDING (lime) — never improvised

## 2. Colors: The Active Vault Palette

The palette is identical to the marketing site. In the product context, the emphasis shifts: status colors join the primary vocabulary because they appear at every transaction row, replacing decorative accents with functional signals.

### Primary
- **Phosphor Cyan** (`#00dbe9`): Primary interactive color — buttons, links, active nav items, chart primary series, SETTLED status badge text. Same rarity constraint as marketing: ≤10% of any screen surface.
- **Phosphor Cyan Bright** (`#00f0ff`): Hover and active state of Phosphor Cyan.

### Secondary
- **Sovereign Violet** (`#dfb7ff`): Secondary accent for specific chart series, YIELD type badges, and select UI signals. Never appears simultaneously with Phosphor Cyan as a focal accent.

### Tertiary
- **Kinetic Lime** (`#ebffa9`): PENDING status badge text and tertiary chart series. High-visibility confirmation signal.

### Neutral
- **Obsidian** (`#0a0c10`): Body background and deepest depth layer.
- **Surface** (`#111318`): Primary card and panel background. Glass cards must sit on Surface, not Obsidian.
- **Surface Lowest** (`#0c0e12`): Sidebar background. Deepest recessed surface — conveys navigation subordination without a border.
- **Surface Container Low** (`#1a1c20`): Recessed panel backgrounds for secondary content areas.
- **Surface Container** (`#1e2024`) / **Surface Container High** (`#282a2e`): Additional depth steps for nested panels and hover states.
- **On-Surface** (`#e2e2e8`): All primary text — balance amounts, account names, table column values.
- **On-Surface Variant** (`#b9cacb`): Secondary text — timestamps, metadata, supporting columns, nav labels at rest.
- **Outline Variant** (`#3b494b`): Card borders at rest; table row dividers at `rgba(255,255,255,0.04)`.

### Status Color Vocabulary
- **COMPLETED** (`#00ff80`): Positive-terminal state. Background tint: `rgba(0,255,128,0.12)`.
- **SETTLED** (`#00dbe9`): Shares the primary accent to signal confirmed institutional clearing.
- **PENDING** (`#ebffa9`): Awaiting state. Background tint: `rgba(235,255,169,0.12)`.

### Named Rules

**The Status Vocabulary Rule.** COMPLETED, SETTLED, and PENDING are the complete transaction status set. Do not introduce new status colors without updating all screens and the status badge component simultaneously. Improvised status colors break the institutional user's cognitive model.

**The One Signal Rule.** Primary cyan covers ≤10% of any given screen surface. In a data-dense dashboard, cyan appears on a primary button, the active nav item, the SETTLED badge, and chart series — no further. More than that and the signal collapses.

## 3. Typography: The Data Register

**Display Font:** Hanken Grotesk (700–900 weight)
**Body Font:** Adobe Clean (400–500 weight)
**Data/Label Font:** JetBrains Mono (500–600 weight)

**Character:** In the product context, typography is a data display system first and an editorial voice second. JetBrains Mono carries the heaviest visual weight on most screens — balance figures, rates, timestamps — while Hanken Grotesk anchors structure (page titles, panel headings). Adobe Clean handles supporting prose. The three-font register is the primary way the dashboard separates data from label from narrative at a glance.

### Hierarchy
- **Display** (900 weight, `clamp(2rem, 4vw, 3.5rem)`, line-height 1, letter-spacing -0.02em): Page titles and balance hero figures in the overview. Rarely used; never repeated within a view.
- **Headline** (800 weight, `1.5rem`, line-height 1.1, letter-spacing -0.02em): Panel headings, chart titles, sidebar section headers.
- **Title** (700 weight, `1.125rem`, line-height 1.2): Card section headings, table column group labels.
- **Body** (400 weight, `0.9375rem` / 15px, line-height 1.6): Supporting prose — empty states, onboarding hints, settings descriptions. Never used in data tables.
- **Label** (500 weight, `0.625rem` / 10px, letter-spacing 0.1em, uppercase, JetBrains Mono): Table column headers (`th`), data annotation labels, sidebar section dividers.
- **Data** (600 weight, `1.5rem`, line-height 1.2, JetBrains Mono): Balance figures, portfolio totals, large numeric display values. The most distinctive typographic voice in the system.

### Named Rules

**The Data Mono Rule.** Every numeric value in the dashboard — balances, rates, timestamps, transaction amounts — uses JetBrains Mono. No exceptions. A balance figure in Adobe Clean or Hanken Grotesk is a typography error and a trust signal failure.

**The Table Header Rule.** `th` elements use JetBrains Mono at 10px, 0.1em letter-spacing, uppercase, `color: #b9cacb` (on-surface-variant). This is the system's standard for machine-generated column labels and must never be overridden with a display or body font.

## 4. Elevation

Identical tonal elevation system to the marketing site: Obsidian (0) → Surface (1) → Surface Lowest (recessed), with glass cards floating above Surface. The product context adds a permanent pattern: the sidebar sits at Surface Lowest (`#0c0e12`) below the main content area at Surface (`#111318`), creating spatial hierarchy between navigation and content without any border or separator line.

Charts render on Surface cards. Chart bars use `rgba(0,219,233,0.55)` — reduced opacity from the Phosphor Cyan token, providing a data-density register that doesn't compete with interactive elements. Projected line segments use a dashed stroke to distinguish actual from projected values.

### Shadow Vocabulary
- **Cyan Aura** (`box-shadow: 0 0 24px -4px rgba(0, 219, 233, 0.3)`): Hover state only. Applied to interactive glass cards and action buttons. Never at rest. Not applied to metric cards at table density — too much noise.

### Named Rules

**The No-Border Sidebar Rule.** The sidebar and main content are separated by tonal difference alone (Surface Lowest vs. Surface). No border, no separator line, no divider. A border breaks the depth illusion.

## 5. Components

### Buttons
- **Shape:** Soft rectangular (8px radius). Pill shape reserved for status badges only.
- **Primary:** Phosphor Cyan fill, Obsidian text, `8px 20px` padding, JetBrains Mono label, uppercase.
- **Ghost:** Transparent background, `1px solid rgba(255,255,255,0.1)` border, cyan text.
- **Hover:** Primary brightens to `#00f0ff`; Cyan Aura applied. Ghost border brightens to `rgba(0,219,233,0.4)`.
- **Focus:** `outline: 2px solid #00dbe9`, 3px offset. Visible at all times for keyboard navigation (WCAG 2.1 AAA).

### Status Badges
- **COMPLETED:** `background: rgba(0,255,128,0.12)`, text `#00ff80`, `border-radius: 9999px`, `padding: 2px 10px`, JetBrains Mono 500 10px uppercase.
- **SETTLED:** `background: rgba(0,219,233,0.12)`, text `#00dbe9`. Same pill treatment.
- **PENDING:** `background: rgba(235,255,169,0.12)`, text `#ebffa9`. Same pill treatment.
- **Type badges (TRADE / TRANSFER / YIELD):** Same pill shape. TRADE = tertiary lime tint; TRANSFER = on-surface-variant tint; YIELD = sovereign violet tint.

### Data Tables
- **Column headers (`th`):** JetBrains Mono 10px, 0.1em letter-spacing, uppercase, `color: #b9cacb`.
- **Row data (`td`):** Adobe Clean 15px for string fields; JetBrains Mono for numeric, date, and status fields.
- **Row separator:** `border-bottom: 1px solid rgba(255,255,255,0.04)`. Barely perceptible — enough for parsing rows, not enough to add visual weight.
- **Column alignment:** Amount columns right-aligned. All other columns left-aligned. Status and type badges centered.

### Charts
- **BarChart:** SVG, cyan bars at `rgba(0,219,233,0.55)`. Hover: full `#00dbe9`. No legend when the single series is labeled by the axis.
- **LineChart:** Actual line solid `#00dbe9`. Projected segment dashed `rgba(0,219,233,0.5)`. Area fill: `rgba(0,219,233,0.08)` to transparent gradient.
- **DonutChart:** Stroke-based SVG, 180px diameter, 30px stroke. Primary arc `#00dbe9`. Background track `rgba(255,255,255,0.05)`.
- **MiniTrend (sparklines):** 60×30px inline SVG. Positive: cyan stroke. Negative: `#ffb4ab`. No axes or labels — the trend shape is the signal.

### Glass Card (Metric Panel)
- **Style:** `background: rgba(255,255,255,0.03)`, `backdrop-filter: blur(12px)`, `border: 1px solid rgba(255,255,255,0.1)`, `border-radius: 8px` (dashboard uses `--radius-lg`, not `--radius-xl` — tighter product register).
- **Internal Padding:** 24px.
- **Content pattern:** Label (JetBrains Mono 10px, on-surface-variant) → Data value (JetBrains Mono 600, 24px) → supporting metadata (Adobe Clean, on-surface-variant). Never add icons, gradient orbs, or decorative accents to metric cards.
- **Hover:** Border brightens to `rgba(0,219,233,0.25)`. No Cyan Aura at table density.

### Sidebar Navigation
- **Width:** 220px, fixed/sticky, `background: #0c0e12` (Surface Lowest).
- **Section gap:** 32px between section groups. No separator borders.
- **Section labels:** JetBrains Mono 10px uppercase, `color: #849495`, `margin-bottom: 8px`.
- **Nav item:** Adobe Clean 15px, `color: #b9cacb` at rest; `color: #00dbe9` active; `background: rgba(0,219,233,0.06)` on active item.

## 6. Do's and Don'ts

### Do:
- **Do** use JetBrains Mono for every numeric value — balances, rates, timestamps, transaction amounts. A balance in Adobe Clean or Hanken Grotesk is a typography error.
- **Do** place glass metric cards on Surface (`#111318`). Tonal contrast registers the glass effect. Obsidian background makes glass invisible.
- **Do** use `border-radius: 8px` on all dashboard cards and badges. The `24px` radius belongs to the marketing site's bento cards only.
- **Do** use COMPLETED / SETTLED / PENDING as the complete transaction status vocabulary. The specific colors (`#00ff80`, `#00dbe9`, `#ebffa9`) are the closed set.
- **Do** right-align numeric table columns and left-align all other columns. This is the standard for institutional financial tables — misaligned amounts fail the audit.
- **Do** include `prefers-reduced-motion` alternatives for all chart animations, panel transitions, and sidebar state changes.
- **Do** provide explicit error states for every data-fetching surface: a failed balance load must show an error with a retry path, not an infinite spinner or a blank card.
- **Do** use `+`/`-` signs or CREDIT/DEBIT labels alongside color to convey value direction. Color-only positive/negative indicators fail WCAG 2.1 AAA non-colour contrast requirements.

### Don't:
- **Don't** build SaaS dashboard patterns: no cream or white backgrounds, no hero-metric cards with gradient orbs (Linear/Stripe style), no identical icon-heading-text card grids. Every pattern that makes this look like a startup product is a trust break with the institutional user.
- **Don't** replicate the Bloomberg terminal aesthetic: no grey-grid density with zero visual intention, no monochrome information-first layouts. Data rigour is correct; the Bloomberg register is wrong.
- **Don't** build legacy banking portal patterns: slow form-heavy screens, light-on-dark tables with accents on every heading, loading friction as the primary user experience.
- **Don't** use gradient text (`background-clip: text`) on balance figures. Display amounts in solid On-Surface (`#e2e2e8`) or Phosphor Cyan (`#00dbe9`).
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent on table rows or sidebar items. Use background tints and active-state fills instead.
- **Don't** add glassmorphism decoratively to chart containers, table wrappers, or sidebar sections. Glass cards are the panel primitive; blur on anything that doesn't function as a discrete panel is noise.
- **Don't** display a loading spinner on prominent data surfaces. Use skeleton screens for initial load and optimistic update patterns for actions. An institutional user who sees a spinner over their balance is a user who has lost trust.
- **Don't** use colour alone to convey positive/negative values. Accompany `+`/`-` signs with CREDIT/DEBIT labels or explicit sign notation — required by WCAG 2.1 AAA.
