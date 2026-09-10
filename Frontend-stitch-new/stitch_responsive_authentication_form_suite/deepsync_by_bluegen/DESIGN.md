---
name: DeepSync by Bluegen
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#40474f'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#707881'
  outline-variant: '#c0c7d1'
  surface-tint: '#006399'
  primary: '#00507d'
  on-primary: '#ffffff'
  primary-container: '#0369a1'
  on-primary-container: '#cbe4ff'
  inverse-primary: '#94ccff'
  secondary: '#006398'
  on-secondary: '#ffffff'
  secondary-container: '#5bb8fe'
  on-secondary-container: '#00476e'
  tertiary: '#005463'
  on-tertiary: '#ffffff'
  tertiary-container: '#006e81'
  on-tertiary-container: '#a9ecff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cde5ff'
  primary-fixed-dim: '#94ccff'
  on-primary-fixed: '#001d32'
  on-primary-fixed-variant: '#004b74'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  display-sm-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 3rem
  gutter-compact: 0.75rem
  gutter-default: 1rem
  dock-padding: 1.25rem
---

## Brand & Style
This design system establishes an institutional-grade, high-fidelity spatial telemetry environment for interactive oceanographic monitoring and numerical simulation. Designed for research scientists, marine operations officers, and environmental policy analysts, the platform pairs the precision of high-density scientific tooling with crisp, daylight-informed interfaces.

The aesthetic fuses **Modern Technical Instrument Minimalism** with **Atmospheric Glassmorphic Accents**. Visual space is organized to yield maximum contrast against deep-sea bathymetry and 3D hydrodynamic models. The interface projects authority, analytical precision, and immediacy—reminiscent of mission-control telemetry filtered through clean, daylight laboratory surfaces. High-velocity spatial rendering is balanced by pristine, low-noise white backgrounds, crisp hairline borders, and targeted cyan/teal data accents that punctuate mission-critical parameters.

## Colors
The palette balances pure daylight whites, deep bathymetric blues, and spectral oceanic accents calibrated for high-density legibility and rapid cognitive parsing under varying display environments.

### Surface and Canvas Architecture
- **Canvas Base (`#F8FAFC`)**: The primary structural surface providing soft daylight illumination without optical glare.
- **Surface Elevation (`#FFFFFF`)**: Pure white cards and instrument docks delivering maximum tonal separation against the canvas.
- **Surface Translucent (`rgba(255, 255, 255, 0.85)`)**: Frosted viewport HUD layers for overlays directly on 3D map views and bathymetric sweeps.

### Primary Oceanic Progression
- **Deep Marine (`#0F172A`)**: Base neutral tone for critical text hierarchy, active coordinates, and dark telemetry accents.
- **Ocean Trench (`#1D4ED8`)**: High-contrast interactive anchors and key metric highlights.
- **Abyssal Blue (`#0369A1`)**: The foundational brand tone; applied to active navigation states, primary buttons, and focal analytical controls.
- **Pelagic Blue (`#0284C7`)**: Secondary interactive states, focused telemetry bars, and selected vector traces.
- **Daylight Surface Blue (`#0EA5E9`)**: Informational highlights, hovering selections, and active trajectory curves.

### Telemetry Accents
- **Cyan Surge (`#06B6D4`)**: Primary vector accent for current velocities, isobaths, and real-time sensor pings.
- **Bioluminescent Teal (`#14B8A6`)**: In-situ buoy health indicators, salinity contours, and verified nominal statuses.
- **Warning Amber (`#F59E0B`)**: Wave surge thresholds, thermal anomalies, and latency warnings.
- **Critical Coral (`#EF4444`)**: Tsunami advisories, sea-state alarms, and sensor disconnections.

## Typography
Plus Jakarta Sans serves as the singular typographic foundation across all visual hierarchies, chosen for its geometric precision, contemporary proportions, and open counters. In scientific dashboards, tabular figures and uppercase tracking guarantee immediate scanning across dynamic spatial coordinate feeds.

### Typographic Implementation Rules
- **Coordinates & Numeric Metrics**: Numeric readings (lat/long, bathymetric depths, drift velocity) must enforce font feature settings `font-variant-numeric: tabular-nums lining-nums` to eliminate layout shift during real-time streaming.
- **Micro-Labels & Telemetry Tags**: `label-sm` and `label-md` default to uppercase transforms (`text-transform: uppercase`) paired with expanded tracking (`0.04em` to `0.06em`) to preserve legibility when superimposed over high-frequency geographic textures.
- **Section Headers**: Analytical widgets leverage `headline-sm` with tight tracking (`-0.01em`) and medium-bold weights (`600`), establishing an orderly data hierarchy without overwhelming dense statistical sidebars.

## Layout & Spacing
The layout architecture is organized around a dual-layer strategy: a fixed 12-column viewport grid for dashboard analysis views, and an absolute viewport HUD layout for 3D oceanographic visualization canvases.

### Rhythm and Grids
- **Spatial Grid Units**: A strict 4px base increments every coordinate, module padding, and spatial margin.
- **Sidebar & Telemetry Docks**: Primary navigation sidebar is pinned at 64px collapsed, 260px expanded. The auxiliary telemetry panel snaps to a deterministic 360px width on desktop monitors.
- **Floating Overlays**: Data inspection cards float with a uniform `16px` inset from the screen boundary, stacking vertically with an `8px` gap to prevent occlusion of critical central map viewports.

### Breakpoints & Responsive Adaptation
- **Desktop Wide (≥1440px)**: 3-column split view (Global Navigation, Central 3D Spatial Canvas, Right Telemetry & Depth Cross-Section Inspector).
- **Desktop Standard (1024px – 1439px)**: Right telemetry panel converts into a collapsible floating drawer; canvas takes full remaining viewport.
- **Tablet (768px – 1023px)**: Sidebars collapse into docked toolbars; parameter filters shift to a top-anchored horizontal carousel.
- **Mobile (<768px)**: 3D viewport occupies 100vw/100vh; analytics snap into a bottom sheet with three detent states (peek 72px, half-sheet 40%, full-screen 92%).

## Elevation & Depth
Elevation mimics clear oceanic water columns: pure daylight ambient backdrops paired with crisp translucent layers. Heavy, muddy drop shadows are prohibited in favor of delicate cyan-tinted atmospheric diffusion and sharp 1px structural strokes.

### Elevation Architecture
1. **Base Zero (Canvas)**: Non-elevated flat surfaces `#F8FAFC` housing background map renderers and spatial viewports.
2. **Level 1 (Docked Containers & Tiles)**: Resting cards and controls set against `#FFFFFF` with a crisp outline `border: 1px solid #E2E8F0` and subtle daylight drop: `box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
3. **Level 2 (Floating Instrument HUDs)**: Glassmorphic interactive docks floating directly on top of 3D globe layers: `background: rgba(255, 255, 255, 0.88); backdrop-filter: blur(12px) saturate(160%); border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`.
4. **Level 3 (Modals & Deep-Dive Diagnostic Sheets)**: System overlays: `background: #FFFFFF; border: 1px solid #CBD5E1; box-shadow: 0 20px 35px -10px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(2, 132, 199, 0.05)`.

## Shapes
The shape language relies on controlled precision: geometric clarity with softened vertices that avoid industrial harshness. Surfaces prioritize `rounded-lg` (8px to 12px) for general modules, with smaller 6px radials on nested instrument components.

- **Panels & Canvas Cards**: `border-radius: 12px` (rounded-lg to rounded-xl) to yield approachable scientific interfaces.
- **Controls, Input Cells & Action Chips**: `border-radius: 8px` maintaining structural consistency with technical input hardware.
- **Status Pills & Coordinate Badges**: `border-radius: 9999px` to distinguish variable telemetry metrics from structural containers.

## Components

### Buttons
- **Primary Telemetry Button**: Solid `#0369A1` background, `#FFFFFF` text, `border-radius: 8px`. Hover: `#0284C7` with subtle outer glow `0 0 12px rgba(2, 132, 199, 0.3)`. Active: `#1D4ED8`.
- **Ghost/Outline Control**: `background: transparent`, `border: 1px solid #CBD5E1`, text `#0F172A`. Hover: `background: #F1F5F9; border-color: #94A3B8`.
- **HUD Viewport Button**: `background: rgba(255, 255, 255, 0.9)`, backdrop-blur 8px, `border: 1px solid rgba(226, 232, 240, 0.8)`, text `#0369A1`. Hover: text `#0284C7`, `border-color: #0284C7`.

### Chips & Parameter Tags
- **Metric Indicator Chip**: Inset compact badge, `border-radius: 9999px`, padding `2px 8px`. Uses light pastel cyan tint `rgba(6, 182, 212, 0.1)` with `#0369A1` text, displaying dynamic ocean sensor values (e.g., `+1.8°C SST`, `34.2 PSU`).
- **Filter Switch Chip**: Pill button with `border: 1px solid #E2E8F0`. When selected, fills with `#0F172A` with `#FFFFFF` text.

### Interactive Lists & Ocean Data Feeds
- Row items use clean separator lines (`1px solid #F1F5F9`). Active stream rows trigger a left border accent (`3px solid #06B6D4`) with background fill `rgba(14, 165, 233, 0.04)`.
- Timestamps and coordinate parameters adopt uppercase tabular formatting aligned right.

### Input Fields & Layer Controllers
- Standard inputs display `#FFFFFF` background, `border: 1px solid #CBD5E1`, and `border-radius: 8px`.
- Focus state: `border-color: #0284C7`, `box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15)`.
- Numeric Steppers & Depth Sliders: Slider tracks use dual-tone gradient fills from `#06B6D4` (surface) down to `#0F172A` (abyssal trench), featuring an 18px circular white thumb with a prominent cyan core.

### Checkboxes & Radios
- Square 16px checks with `rounded: 4px`. Selected state displays solid `#0369A1` fill with an angled white checkmark icon.
- Radios feature a 16px circular boundary with a 6px centered dot in `#0284C7`.

### Cards & Analytical Modules
- **Analytical Card**: Pure white surface, `1px solid #E2E8F0`, padding `16px`. Header area features an icon container tinted with `#E0F2FE` containing an ocean blue glyph.
- **Glass Floating Inspector**: Positioned directly over 3D coordinates, this card uses `rgba(255, 255, 255, 0.88)`, `border: 1px solid rgba(255, 255, 255, 0.9)`, and a header row showing latitude, longitude, and bathymetric depth.

### Specialized Platform Components
- **Vertical Bathymetry Profile Strip**: A dedicated vertical column module plotting depth layers (0m to -6000m) with dynamic color ramps and draggable horizontal slice indicators.
- **Temporal Simulation Scrubber**: A bottom-anchored HUD bar containing playback controls, forecast intervals (T+0h through T+120h), and tide/wave timeline graphs.