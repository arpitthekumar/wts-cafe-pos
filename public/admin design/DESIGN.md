---
name: Vivid Cravings
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#574236'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#8b7264'
  outline-variant: '#dec1b0'
  surface-tint: '#984800'
  primary: '#984800'
  on-primary: '#ffffff'
  primary-container: '#fc8019'
  on-primary-container: '#5e2a00'
  inverse-primary: '#ffb689'
  secondary: '#b52330'
  on-secondary: '#ffffff'
  secondary-container: '#ff5a5f'
  on-secondary-container: '#60000e'
  tertiary: '#5f5e5e'
  on-tertiary: '#ffffff'
  tertiary-container: '#a4a2a2'
  on-tertiary-container: '#393939'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbc8'
  primary-fixed-dim: '#ffb689'
  on-primary-fixed: '#311300'
  on-primary-fixed-variant: '#733500'
  secondary-fixed: '#ffdad8'
  secondary-fixed-dim: '#ffb3b0'
  on-secondary-fixed: '#410007'
  on-secondary-fixed-variant: '#92001b'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system is engineered for a high-energy, modern food delivery experience. It targets a fast-paced urban demographic that values speed, appetite appeal, and frictionless navigation. 

The aesthetic is **Modern & High-Contrast**, blending a "Corporate Modern" foundation with **Glassmorphism** accents to signify premium technology. The UI evokes an emotional response of hunger and excitement through vibrant primary tones, while maintaining trust through a clean, structured layout. Motion is a key pillar, using subtle scaling and translucency to provide immediate tactile feedback.

## Colors
The palette is dominated by **#FC8019 (Orange)**, chosen for its psychological association with appetite and energy. **#FF5A5F (Red)** serves as a high-action accent for urgent status indicators (e.g., "Hot Deals," "Live Tracking"). 

The background uses a soft **#F8F9FA** to reduce eye strain and provide contrast against the pure **#FFFFFF** cards. Typography and iconography utilize **#1C1C1C** to ensure AAA accessibility and a grounded, professional feel.

## Typography
The system uses **Plus Jakarta Sans** for headings to provide a friendly, rounded, and welcoming personality. Its geometric nature ensures clarity even at high weights. 

For functional text and body copy, **Be Vietnam Pro** is used. It offers a contemporary, approachable feel with excellent legibility in dense lists and menu descriptions. On mobile devices, headline sizes scale down to prevent excessive line breaks, maintaining a tight information density.

## Layout & Spacing
The design system utilizes a **Fluid Grid** model. 
- **Desktop:** 12-column grid with 20px gutters and 48px side margins.
- **Mobile:** 4-column grid with 16px gutters and 16px side margins.

Horizontal scrolling "shelves" are used for restaurant categories and featured items to maximize vertical real estate. Content cards should span 12 columns on mobile, and 3 or 4 columns on desktop depending on the importance of the item.

## Elevation & Depth
Depth is created using a mixture of **Ambient Shadows** and **Glassmorphism**:
- **Cards:** Use a `shadow-xl` (diffused 25% opacity shadow with a 20px blur) to appear lifted off the neutral background.
- **Search Bar & Navigation:** Employs a frosted glass effect (backdrop-filter: blur(12px)) with a 10% white tint to maintain visibility over vibrant food imagery.
- **Hover States:** All interactive cards must scale to `1.03` with a smooth 200ms transition to provide a tactile, "squishy" feel.

## Shapes
The system uses a generous roundedness to appear appetizing and friendly. 
- **Cards:** 20px radius to create a soft, container-like feel.
- **Buttons:** 14px radius for a modern, slightly less circular appearance than a pill, but softer than a standard square.
- **Product Images:** 16px radius to ensure consistency with the card containers while remaining distinct.

## Components
- **Buttons:** Primary buttons use the Orange #FC8019 background with white text. Secondary buttons use a light tint of orange (10% opacity) with #FC8019 text.
- **Chips:** Category filters use the 14px button radius. When active, they switch to #FC8019; when inactive, they use a subtle #F8F9FA background with a 1px border.
- **Cards:** Must include the `shadow-xl` and 20px radius. Imagery should be top-aligned and bleed to the edges with a 16px inner corner radius.
- **Input Fields:** Search bars utilize the Glassmorphism style—translucent backgrounds with a subtle inner border for definition.
- **Lists:** Menu items should be separated by whitespace rather than lines, using the `spacing.sm` unit for internal padding.
- **Selection Controls:** Checkboxes and radio buttons use the #FC8019 primary color when active to ensure high visibility.