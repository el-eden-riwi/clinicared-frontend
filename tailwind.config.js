/** @type {import('tailwindcss').Config} */

/*
 * Design tokens for ClínicaRed — "Almanaque clínico".
 *
 * Every colour is a CSS variable holding space-separated RGB channels (defined
 * in src/index.css), so Tailwind opacity modifiers keep working:
 *   bg-surface/80, border-tactile/50, ring-accent/40 …
 *
 * Colour logic (split-complementary on a warm-neutral ground):
 *   • Surfaces  → "Hueso" bone, hue ≈ 88°, very low chroma. Paper, not screen white.
 *   • Ink       → conifer black, hue ≈ 170°. Cool-leaning against the warm paper.
 *   • Action    → "Pino" deep conifer green, hue ≈ 172°. Structural, never neon.
 *   • Accent    → "Cobre" oxidised copper, hue ≈ 45°. The one warm signal against
 *                 the conifer family; used for focus, selection and emphasis.
 *   • Status    → madder red (≈ 8°), ochre (≈ 48°), moss (≈ 118°) — each distinct
 *                 from the copper accent by luminance and always paired with an
 *                 icon and a text label, never colour alone.
 *   • Night     → the same conifer hue at 5 % lightness, used for atmospheric
 *                 layers (infrastructure bar, hero scene, modal, footer).
 *
 * Contrast (WCAG 2.x, measured): ink/surface 14.9:1, ink-muted/surface 7.0:1,
 * ink-faint/surface 5.1:1, accent-ink/surface 6.6:1, inverse/night 14.8:1,
 * every status foreground on its soft background ≥ 7.4:1 (AAA),
 * tactile-strong control borders ≥ 3.9:1 on all surfaces.
 */

const channel = (name) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: channel('surface'),
          elevated: channel('surface-elevated'),
          sunken: channel('surface-sunken'),
          night: channel('surface-night'),
          'night-raised': channel('surface-night-raised'),
        },
        ink: {
          DEFAULT: channel('ink'),
          muted: channel('ink-muted'),
          faint: channel('ink-faint'),
          inverse: channel('ink-inverse'),
          'inverse-muted': channel('ink-inverse-muted'),
        },
        action: {
          DEFAULT: channel('action'),
          deep: channel('action-deep'),
        },
        accent: {
          DEFAULT: channel('accent'),
          ink: channel('accent-ink'),
          soft: channel('accent-soft'),
          glow: channel('accent-night'),
        },
        tactile: {
          DEFAULT: channel('tactile'),
          strong: channel('tactile-strong'),
          night: channel('tactile-night'),
        },
        status: {
          danger: channel('danger'),
          'danger-soft': channel('danger-soft'),
          'danger-night': channel('danger-night'),
          warn: channel('warn'),
          'warn-soft': channel('warn-soft'),
          'warn-night': channel('warn-night'),
          ok: channel('ok'),
          'ok-soft': channel('ok-soft'),
          'ok-night': channel('ok-night'),
        },
      },

      fontFamily: {
        display: ['Newsreader', '"Iowan Old Style"', '"Palatino Linotype"', 'Georgia', 'serif'],
        sans: ['"Hanken Grotesk"', 'ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },

      fontSize: {
        label: ['0.75rem', { lineHeight: '1.1rem', letterSpacing: '0.14em' }],
        'display-sm': ['clamp(1.625rem, 1.2rem + 1.6vw, 2.25rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(2.125rem, 1.4rem + 3vw, 3.5rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        'display-xl': ['clamp(2.5rem, 1.2rem + 5vw, 4.75rem)', { lineHeight: '0.98', letterSpacing: '-0.04em' }],
        numeral: ['clamp(3.25rem, 2.6rem + 3vw, 5.5rem)', { lineHeight: '0.9', letterSpacing: '-0.05em' }],
      },

      maxWidth: {
        frame: '82rem',
      },

      boxShadow: {
        lift: '0 1px 0 rgb(var(--ink) / 0.04), 0 18px 40px -22px rgb(var(--ink) / 0.35)',
        float: '0 28px 60px -24px rgb(0 0 0 / 0.65)',
      },

      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-soft': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },

      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translate3d(0, 20px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translate3d(0, 18px, 0) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0) scale(1)' },
        },
        'sheet-in': {
          '0%': { opacity: '0', transform: 'translate3d(0, 28px, 0) scale(0.985)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0) scale(1)' },
        },
        'ping-soft': {
          '0%': { transform: 'scale(1)', opacity: '0.55' },
          '80%, 100%': { transform: 'scale(2.8)', opacity: '0' },
        },
        'meter-grow': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
      animation: {
        rise: 'rise 0.85s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.5s ease-out both',
        'toast-in': 'toast-in 0.55s cubic-bezier(0.16, 1, 0.3, 1) both',
        'sheet-in': 'sheet-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'ping-soft': 'ping-soft 2.4s cubic-bezier(0, 0, 0.2, 1) infinite',
        'meter-grow': 'meter-grow 1s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
}