---
name: Vibrant Meme Engine
colors:
  surface: '#081425'
  surface-dim: '#081425'
  surface-bright: '#2f3a4c'
  surface-container-lowest: '#040e1f'
  surface-container-low: '#111c2d'
  surface-container: '#152031'
  surface-container-high: '#1f2a3c'
  surface-container-highest: '#2a3548'
  on-surface: '#d8e3fb'
  on-surface-variant: '#dbc2ad'
  inverse-surface: '#d8e3fb'
  inverse-on-surface: '#263143'
  outline: '#a38d7a'
  outline-variant: '#554334'
  surface-tint: '#ffb874'
  primary: '#ffbd7f'
  on-primary: '#4b2800'
  primary-container: '#ff9500'
  on-primary-container: '#643700'
  inverse-primary: '#8c5000'
  secondary: '#bec6e0'
  on-secondary: '#283044'
  secondary-container: '#3f465c'
  on-secondary-container: '#adb4ce'
  tertiary: '#c8cacc'
  on-tertiary: '#2d3133'
  tertiary-container: '#acafb1'
  on-tertiary-container: '#3f4344'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdcbf'
  primary-fixed-dim: '#ffb874'
  on-primary-fixed: '#2d1600'
  on-primary-fixed-variant: '#6a3b00'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#081425'
  on-background: '#d8e3fb'
  surface-variant: '#2a3548'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '900'
    lineHeight: 52px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Montserrat
    fontSize: 36px
    fontWeight: '900'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Archivo Narrow
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Archivo Narrow
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '800'
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is engineered for a premium meme creation experience, balancing high-energy creativity with professional-grade UI structure. The brand personality is witty, confident, and "loud but legible," moving away from the cluttered aesthetics often associated with meme generators toward a polished, editorial feel.

The design style is a hybrid of **High-Contrast Bold** and **Modern Minimalism**. It utilizes heavy weight typography and a saturated primary palette to evoke a sense of urgency and humor, while maintaining a strict, systematic grid and clean iconography to ensure the product feels like a sophisticated tool rather than a toy. The absence of emojis in the system's core UI ensures the user's content remains the focal point.

## Colors

This design system utilizes a high-impact, dark-mode default palette to make content and the primary action color pop.

- **Primary (Energetic Orange):** Used for main actions, highlights, and active states. It represents the "spark" of creativity.
- **Secondary (Midnight Blue):** Serves as the primary surface color. It provides a deep, stable background that enhances the vibrancy of the primary orange.
- **Accents & Neutrals:** 
    - **Sharp White (#FFFFFF):** Reserved for primary headers and high-contrast text.
    - **Slate Grays:** Used for secondary text, borders, and component backgrounds to create internal hierarchy within the dark interface.

## Typography

Typography is the cornerstone of the meme aesthetic. We use **Montserrat** for headings to provide a heavy, punchy, and modern geometric feel. Its thick strokes mirror the "Impact" font legacy of memes but in a contemporary, premium execution.

For body copy and functional UI elements, **Archivo Narrow** is utilized. Its slightly condensed nature allows for high information density in settings and toolbars without sacrificing legibility, maintaining a technical, structured appearance. 

Use `label-caps` for small metadata, category headers, and button text to maintain the "bold" brand voice even at small scales.

## Layout & Spacing

The system follows a **Fluid Grid** model with a base-4 rhythm. On mobile, the layout uses a 4-column system with 20px outer margins. On desktop, it scales to a 12-column system centered within a maximum container width of 1440px.

Spacing is aggressive to allow the bold typography room to breathe. Components should favor vertical "stacking" with clear separation. Use `stack-lg` for separating distinct content sections and `stack-sm` for grouping related input controls.

## Elevation & Depth

To maintain a "Modern Premium" feel, depth is achieved through **Tonal Layering** and subtle **Glassmorphism**, rather than heavy shadows.

- **Surface 0 (Background):** The Secondary Midnight Blue (#0F172A).
- **Surface 1 (Cards/Inputs):** A slightly lighter Slate Gray (#1E293B).
- **Overlays:** Use a backdrop-blur (12px) with a 60% opacity fill of the background color for modals and navigation bars.
- **Shadows:** Only used on primary buttons and active cards. Use a focused, 15% opacity black shadow with a 4px blur and 2px offset to give a tactile "pressed" or "float" feel.
- **Borders:** Low-contrast 1px strokes (#334155) are used to define boundaries on Surface 1 elements.

## Shapes

The shape language is "Softly Geometric." A 0.5rem (8px) base radius provides a friendly, tactile feel that balances the aggressive, sharp typography.

- **Buttons:** Use 8px radius for a rugged, tool-like appearance.
- **Cards & Modals:** Use 16px (rounded-lg) to soften the large surface areas.
- **Inputs:** Use 8px to match buttons, creating a cohesive form-factor.

## Components

### Buttons
- **Primary:** Vibrant Orange background, Montserrat Bold caps text in Secondary Blue. 8px corner radius.
- **Secondary:** Transparent background with a 2px Sharp White border.
- **Tactile State:** On hover/active, the button should shift 2px down with a slightly intensified shadow.

### Cards
- Minimalist containers with a 1px border (#334155). 
- For "Featured" memes, use a subtle glassmorphic background blur to pull the element forward.

### Inputs
- **Field:** Dark Slate background with a 1px border. 
- **Focus State:** Border color changes to Primary Orange with a 2px outer glow (ring).
- **Icons:** Use 2px stroke weight, solid-style icons for high visibility. No emojis.

### Chips & Tags
- Used for meme categories (e.g., #Trending, #Vintage). 
- Use the `label-caps` typography style with a dark fill and high-contrast white text.

### Toolbars
- Floating toolbars should use the glassmorphic style (Backdrop-filter: blur) to maintain context of the canvas underneath.