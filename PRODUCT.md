# Product

## Register

product

## Platform

web

## Users

**Institutional clients** — fund managers, corporate treasurers, family office principals, and senior portfolio analysts — who are managing their own positions directly within SecurBank. They access the dashboard to monitor live balances across account types, track market movements against their holdings, execute or initiate trades, review transaction history for audit and compliance, and manage account settings. They are financially literate, time-pressured, and have high tolerance for density and zero tolerance for unreliability. The dashboard is a professional tool, not a consumer experience. A user who waits more than two seconds for a balance to load is a user who has lost trust.

## Product Purpose

The SecurBank institutional dashboard gives authenticated clients a single command surface for their entire relationship with SecurBank — real-time portfolio position, market intelligence, transaction ledger, and account management — in one authenticated, always-current view. Success looks like a client who opens the dashboard, gets the information they need in under ten seconds, and either takes an action or closes it with confidence. The dashboard does not need to be impressive; it needs to be trustworthy.

## Positioning

Banking at the speed and precision of the markets it serves — expressed through tool responsiveness and data fidelity, not marketing language.

## Brand Personality

**Authoritative · Kinetic · Rare.** In the product context, these words mean: precision over decoration (every element carries data or enables action, nothing decorates); kinetic means the interface feels live — balances update, market tickers move, transitions are immediate; rare means the vocabulary and density feel genuinely institutional, not like a dressed-up retail portal. The design system (obsidian/surface depth layers, primary cyan accent, JetBrains Mono for data, Hanken Grotesk for display) is shared with the marketing site — the brand is continuous across logged-out and logged-in states.

## Anti-references

- **Bloomberg terminal** (grey grid, dense, zero visual intention): the data rigour is correct, the visual register is wrong. SecurBank has institutional depth with a completely different aesthetic posture.
- **Generic SaaS dashboard** (cream or white background, hero-metric cards with big numbers and gradient orbs, identical icon + heading + text card grids, glassmorphism used decoratively): the failure mode the dashboard must escape. Every metric card that looks like a Linear or Stripe dashboard is a trust break for the institutional user.
- **Legacy banking portal** (slow, form-heavy, light-on-dark tables with cyan accents on every heading): institutional gravity expressed as visual weight and loading friction. The opposite of "speed and precision."

## Design Principles

1. **Data is the design.** Every visual element earns its space by carrying information or enabling action. Decoration is noise. A gradient orb behind a balance figure adds visual weight without adding meaning — replace with typographic precision.
2. **Speed over ceremony.** The interface must feel live, not fetched. Loading states are first-class design problems: skeleton screens over spinners, optimistic updates where safe, no transitions that delay task completion.
3. **Earned familiarity.** Component vocabulary must be identical across all five screens. A button that looks different on Markets than it does on Transactions is a trust break. Consistency is a feature, not a constraint.
4. **Precision at every scale.** Whether displaying a nine-figure balance or a three-basis-point rate change, the display must be exact, unambiguous, and correctly formatted. Rounding, truncation, or ambiguous signs (`+`/`-`) must be deliberate and consistent.
5. **Error states are first-class citizens.** A dashboard that loads "Loading…" forever when an API fails is not a tool — it is a wall. Every data-fetching surface has a defined error state, a retry path, and a graceful partial-data fallback.

## Accessibility & Inclusion

Target: **WCAG 2.1 AAA**. The institutional audience includes traders and analysts who may use screen readers, keyboard-only navigation, or high-contrast modes. All data tables require proper `scope` attributes; all interactive elements require visible focus indicators; all form inputs require programmatic labels. Colour-only positive/negative indicators must have textual backup (`+`/`-` signs or `CREDIT`/`DEBIT` labels). Range sliders must be keyboard-operable with visible focus states. `prefers-reduced-motion` must suppress all chart and panel animations.
