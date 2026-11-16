---
name: AI Study Buddy
description: Calm, clear visual system for checking anatomy study resources against a course PDF.
status: draft
sources:
  - "{planning_artifacts}/prds/prd-Programmering med AI 2026-2026-11-04/prd.md"
  - "{project-root}/product-brief.md"
updated: 2026-11-14
colors:
  canvas: '#F4F7F5'
  surface: '#FFFFFF'
  surface-muted: '#EAF2EF'
  ink-primary: '#20302E'
  ink-secondary: '#52625F'
  border: '#D5E0DC'
  brand-primary: '#1E6359'
  brand-primary-hover: '#174F48'
  brand-primary-foreground: '#FFFFFF'
  focus-ring: '#164F47'
  source-background: '#E8F3EF'
  source-ink: '#164F47'
  verified-background: '#E9F5EC'
  verified-ink: '#245B3F'
  unverified-background: '#FFF2D6'
  unverified-ink: '#704400'
  error-background: '#FFF1F0'
  error-ink: '#7F2E32'
typography:
  display:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: '-0.02em'
  heading:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 22px
    fontWeight: '650'
    lineHeight: '1.3'
  body:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.55'
  label:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
rounded:
  sm: 6px
  md: 10px
  lg: 14px
  full: 9999px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 20px
  '6': 24px
  '8': 32px
  '10': 40px
  '12': 48px
components:
  button-primary:
    background: '{colors.brand-primary}'
    foreground: '{colors.brand-primary-foreground}'
    radius: '{rounded.md}'
    min-height: 44px
  source-reference:
    background: '{colors.source-background}'
    foreground: '{colors.source-ink}'
    radius: '{rounded.sm}'
  status-unverified:
    background: '{colors.unverified-background}'
    foreground: '{colors.unverified-ink}'
    radius: '{rounded.full}'
  pdf-viewer:
    background: '{colors.surface}'
    border: '{colors.border}'
    radius: '{rounded.md}'
---

## Brand & Style

AI Study Buddy is a calm, modern study tool for physiotherapy students learning anatomy. Its visual voice is clear and supportive: the interface helps a student move between practice and source material without adding visual noise. Comfortable reading, visible references, and predictable actions take priority over decoration.

The first direction uses a light canvas, deep teal for primary actions and source links, generous spacing, and restrained cards. It should feel suitable for focused study while remaining approachable to students who are new to source-checking generated material.

## Colors

- **Canvas (`{colors.canvas}`)** gives the workspace a soft, low-glare surface.
- **Surface (`{colors.surface}`)** separates the document, resource, and form areas from the canvas.
- **Primary teal (`{colors.brand-primary}`)** marks the main action, selected controls, and interactive source-page links. It is used consistently so students can predict where an action leads.
- **Source teal (`{colors.source-background}` / `{colors.source-ink}`)** groups each excerpt with its page link. The source panel stays visually distinct from generated content.
- **Verified state (`{colors.verified-background}` / `{colors.verified-ink}`)** accompanies explicit “Kildeutdrag bekreftet” text.
- **Unverified state (`{colors.unverified-background}` / `{colors.unverified-ink}`)** accompanies the visible “Ubekreftet” label. Color is never the only way to identify this state.
- **Error state (`{colors.error-background}` / `{colors.error-ink}`)** marks recoverable failures and explains the next action.

Check text and control contrast against WCAG 2.2 AA before implementation. Do not use the accent as decoration or use color alone to communicate source status.

## Typography

Use the system sans-serif stack for predictable rendering without downloading a font. `{typography.display}` is reserved for screen titles; `{typography.heading}` establishes resource and panel headings; `{typography.body}` is used for study content and instructions; `{typography.label}` is used for controls and short metadata.

Keep line lengths comfortable in summaries and excerpts. Preserve Norwegian characters and Latin anatomical terms exactly. Avoid all-caps labels and long blocks of instructional copy.

## Layout & Spacing

The laptop-first web layout gives the generated resource and cited PDF page room to sit side by side. At wide desktop sizes, the resource column is slightly wider than the PDF viewer. The top bar stays compact; the main reading surface uses a comfortable maximum width and consistent gutters.

Use the four-pixel base scale from `{spacing.1}` through `{spacing.12}`. Keep related source text and page links close together, and use larger gaps between the resource, viewer, and resource-type navigation. On narrow screens, stack the PDF viewer below the resource and retain the selected page state.

## Elevation & Depth

Use subtle surface changes and thin borders to separate panels. Avoid layered shadows, gradients, and floating cards that compete with study content. A light border and canvas-to-surface shift provide enough depth for the reading workspace.

## Shapes

Use `{rounded.sm}` for compact controls and excerpt labels, `{rounded.md}` for buttons and panels, and `{rounded.lg}` only for large primary containers. Reserve `{rounded.full}` for compact status badges. The shape language is soft enough to feel approachable while keeping controls easy to scan.

## Components

- **Primary button** — `{components.button-primary}`. One visually dominant action per step, such as “Fortsett med 46 sider” or “Lever quiz.”
- **Secondary button** — White surface, ink text, visible border. Used for actions such as “Avbryt” and “Tilbake til ressurser.”
- **Resource choice** — Large, clearly labeled button with a short explanation. The entire tile is clickable and keyboard accessible.
- **Source reference** — `{components.source-reference}` groups the short excerpt, page number, and verification label. The page number appears as a button/link with a visible focus state.
- **Status badge** — `{components.status-unverified}` pairs a state color with the text “Ubekreftet.” A verified badge says “Kildeutdrag bekreftet.”
- **PDF viewer** — `{components.pdf-viewer}` uses a reading surface and persistent page indicator. On laptop it sits beside the resource; on mobile it follows the resource in reading order.
- **Error message** — `{colors.error-background}` with a concise explanation and one clear recovery action. It does not replace or obscure previously generated resources.
- **Focus state** — Visible outline using `{colors.focus-ring}`. Never remove the browser focus indicator without an equally visible replacement.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Keep source excerpts visually attached to their page controls | Make the student infer which excerpt belongs to which page |
| Pair status colors with text labels | Communicate “Ubekreftet” by color alone |
| Give the PDF viewer a stable place beside study content on laptop | Hide the source behind a modal that covers the resource |
| Keep mobile reading order resource first, PDF page second | Compress two reading columns onto a narrow screen |
| Use restrained borders, generous whitespace, and a single primary action | Add decorative gradients, dense dashboards, or unnecessary badges |
