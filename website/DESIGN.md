---
name: Impeccable - Five Star Chicken
description: Neo kinpaku design system. Dark mineral lacquer ground, kinpaku gold leaf accents, verdigris patina status indicators, and crisp geometric typography.

colors:
  # Brand anchors
  kinpaku-gold: "oklch(84% 0.19 80.46)"       # primary accent / brand anchor
  kinpaku-rich: "oklch(77% 0.13 82)"          # active CTA fill, medium emphasis
  kinpaku-deep: "oklch(61% 0.085 78)"         # hairline borders against brand
  dark-ink: "oklch(14% 0.018 95)"             # high-contrast foreground on gold
  verdigris-patina: "oklch(70% 0.12 188)"     # halal badge, open status, success
  patina-deep: "oklch(46% 0.08 188)"          # readable patina text on light surfaces
  vermilion-warning: "oklch(58% 0.15 35)"     # sold out badge, errors, alerts

  # Surfaces
  lacquer-black: "oklch(7% 0.006 95)"         # base ground (warm mineral black, not #000)
  lacquer-deep: "oklch(4% 0.004 95)"          # deep inset containers, footer background
  raised-lacquer: "oklch(11% 0.006 95)"       # panels, cards, cart drawer
  graphite: "oklch(15% 0.008 95)"             # input fields, inactive tabs, steppers
  graphite-2: "oklch(19% 0.008 95)"           # secondary button hover, inactive pills

  # Text
  champagne: "oklch(91% 0 0)"                 # crisp headlines and emphasis
  text-warm: "oklch(88% 0 0)"                 # primary body copy
  text-muted: "oklch(72% 0 0)"                # secondary labels, captions, metadata
  text-faint: "oklch(62% 0 0)"                # subdued footnotes
  text-mute-deep: "oklch(52% 0 0)"            # disabled states

  # Hairlines & Rules
  gold-hairline: "oklch(78% 0 0 / 0.16)"      # default 1px structural hairline
  gold-hairline-strong: "oklch(74% 0.09 82 / 0.6)" # active borders, focus rings

typography:
  scale:
    "8": "0.5rem"
    "9": "0.5625rem"
    "10": "0.625rem"
    "11": "0.6875rem"
    "12": "0.75rem"
    "13": "0.8125rem"
    "14": "0.875rem"
    "15": "0.9375rem"
    "16": "1rem"
    "18": "1.125rem"
    "20": "1.25rem"
    "24": "1.5rem"
    "28": "1.75rem"
    "32": "2rem"
    "40": "2.5rem"
    "48": "3rem"
    "56": "3.5rem"
    "64": "4rem"
    "72": "4.5rem"
    "80": "5rem"
    "88": "5.5rem"
  display:
    fontFamily: "Alumni Sans, Albert Sans, system-ui, sans-serif"
    fontSize: "clamp(3.2rem, 6.2vw, 5.6rem)"
    fontWeight: 100
    letterSpacing: "-0.01em"
    lineHeight: 1.02
  headline:
    fontFamily: "Alumni Sans, Albert Sans, system-ui, sans-serif"
    fontSize: "clamp(2.2rem, 3.8vw, 3.2rem)"
    fontWeight: 300
    letterSpacing: "0"
    lineHeight: 1.06
  title:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.06em"

rounded:
  xs: "2px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  pill: "999px"

spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  xl: "48px"
  "2xl": "80px"

motion:
  ease: "cubic-bezier(0.16, 1, 0.3, 1)"
  quick: "120ms"
  settle: "220ms"
---

# Design System: Impeccable (Neo Kinpaku)

## 1. Creative North Star: Neo Kinpaku
The website interface is constructed as a physical, dark lacquer instrument marked by authentic Kinpaku gold leaf seams, Verdigris patina for verified quality signals (such as 100% Halal cut chicken and live kitchen active states), and restrained hairline geometry.

## 2. Core Prohibitions & Anti-Pattern Bans
- **Banned: Nested Cards.** Never wrap a card inside another card. Use flat bento tiles with 1px hairlines.
- **Banned: Kickers / Eyebrows above Headings.** The heading must carry its own authority. Do not prepend a floating badge or eyebrow above an H2.
- **Banned: Gradient Text.** Never use CSS gradient text or `-webkit-background-clip: text`. Visual emphasis comes strictly from font weight or scale.
- **Banned: Cheesy Glows & Halos.** No zero-offset blurred halos (`box-shadow: 0 0 25px rgba(...)`). Elevation is achieved via 1px gold/neutral hairlines and subtle directional soft shadow.
- **Banned: Decorative Glassmorphism.** Avoid arbitrary `backdrop-filter: blur(...)` panels that look like frosted glass. Use solid lacquer surfaces with crisp borders.
- **Banned: Bouncy or Elastic Easing.** Use clean exponential ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Banned: Gimmick Effects.** No custom mouse cursors and no SVG feTurbulence grain overlays.

## 3. Typography Rules
- **Headlines (H1/H2):** Set in Alumni Sans. Weight inversion is mandatory: H1 at ultra-light weight 100/200; H2 at crisp weight 300.
- **Body & Controls:** Set in Albert Sans at weight 400 (body) and 600 (titles/labels). Measure stays between 65–75ch.
- **Numerical & Tabular Data:** Prices, quantities, GSTIN, FSSAI numbers, and timestamps must use JetBrains Mono with `tabular-nums`.

## 4. Components & Interactive States
- **Primary Buttons:** Solid kinpaku gold (`oklch(84% 0.19 80.46)`) with dark ink text (`oklch(14% 0.018 95)`), 2px–4px radius, subtle hover lift.
- **Secondary Buttons:** Transparent lacquer surface with 1px gold hairline (`oklch(74% 0.09 82 / 0.6)`), champagne text.
- **Cards & Bento Tiles:** Raised lacquer ground (`oklch(11% 0.006 95)`), 1px border (`oklch(78% 0 0 / 0.16)`), 6px–8px radius.
- **Halal & Status Badges:** Verdigris patina (`oklch(70% 0.12 188)`) with subtle hairline border.
- **Sold Out / Stock Warning:** Vermilion (`oklch(58% 0.15 35)`).
