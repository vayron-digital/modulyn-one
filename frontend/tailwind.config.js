/** @type {import('tailwindcss').Config} */
import theme from './src/lib/theme.js'

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Use centralized theme colors
        'modulyn-flame': theme.personalized.modulynFlame,
        'snowfield': theme.personalized.snowfield,
        'obsidian-veil': theme.personalized.obsidianVeil,
        'mist-grey': theme.personalized.mistGrey,
        'charcoal-tint': theme.personalized.charcoalTint,
        'lumen-pink': theme.personalized.lumenPink,
        'skyline-blue': theme.personalized.skylineBlue,
        'inferno-red': theme.personalized.infernoRed,
        'amber-pulse': theme.personalized.amberPulse,
        'emerald-rise': theme.personalized.emeraldRise,
        
        // Functional colors
        'surface': {
          'primary': theme.functional.surface.primary,
          'secondary': theme.functional.surface.secondary,
        },
        'on-surface': {
          'strong': theme.functional.onSurface.strong,
          'soft': theme.functional.onSurface.soft,
        },
        'primary': {
          'default': theme.functional.primary.default,
          'on-primary': theme.functional.primary.onPrimary,
        },
        'secondary': {
          'default': theme.functional.secondary.default,
          'on-secondary': theme.functional.secondary.onSecondary,
        },
        'interactive': {
          'default': theme.functional.interactive.default,
          'hover': theme.functional.interactive.hover,
          'disabled': theme.functional.interactive.disabled,
        },
        'critical': {
          'default': theme.functional.critical.default,
          'on-critical': theme.functional.critical.onCritical,
        },
        'warning': {
          'default': theme.functional.warning.default,
          'on-warning': theme.functional.warning.onWarning,
        },
        'success': {
          'default': theme.functional.success.default,
          'on-success': theme.functional.success.onSuccess,
        },
        'highlight': {
          'default': theme.functional.highlight.default,
        },
        'decorative': {
          'default': theme.functional.decorative.default,
        },
        
        // Semantic colors
        'text': {
          'heading': theme.semantic.text.heading,
          'body': theme.semantic.text.body,
          'link': theme.semantic.text.link,
          'link-hover': theme.semantic.text.linkHover,
          'disabled': theme.semantic.text.disabled,
          'on-dark': theme.semantic.text.onDark,
        },
        'fields': {
          'background': theme.semantic.fields.background,
          'border': theme.semantic.fields.border,
          'placeholder': theme.semantic.fields.placeholder,
          'text': theme.semantic.fields.text,
          'focus-border': theme.semantic.fields.focusBorder,
        },
        'states': {
          'error': theme.semantic.states.error,
          'warning': theme.semantic.states.warning,
          'success': theme.semantic.states.success,
          'info': theme.semantic.states.info,
        },
        
        // Legacy support - map old colors to new theme
        background: {
          DEFAULT: theme.functional.surface.primary,
          dark: theme.personalized.obsidianVeil,
        },
        card: {
          DEFAULT: theme.functional.surface.primary,
          dark: theme.personalized.charcoalTint,
        },
        surface: {
          DEFAULT: theme.functional.surface.secondary,
          dark: theme.personalized.charcoalTint,
        },
        primary: theme.functional.primary.default,
        accent: theme.functional.secondary.default,
        text: {
          DEFAULT: theme.functional.onSurface.strong,
          dark: theme.semantic.text.onDark,
          secondary: theme.functional.onSurface.soft,
          secondaryDark: theme.semantic.text.onDark,
          disabled: theme.semantic.text.disabled,
          disabledDark: theme.semantic.text.disabled,
        },
        divider: {
          DEFAULT: theme.semantic.fields.border,
          dark: theme.semantic.fields.border,
        },
      },
      
      // Typography tokens
      fontFamily: {
        'heading': theme.typography.fontFamily.heading,
        'body': theme.typography.fontFamily.body,
        'mono': theme.typography.fontFamily.mono,
        'sans': theme.typography.fontFamily.body,
      },
      fontSize: {
        'xs': theme.typography.fontSize.xs,
        'sm': theme.typography.fontSize.sm,
        'base': theme.typography.fontSize.base,
        'lg': theme.typography.fontSize.lg,
        'xl': theme.typography.fontSize.xl,
        '2xl': theme.typography.fontSize['2xl'],
        '3xl': theme.typography.fontSize['3xl'],
        '4xl': theme.typography.fontSize['4xl'],
      },
      fontWeight: {
        'light': theme.typography.fontWeight.light,
        'normal': theme.typography.fontWeight.regular,
        'medium': theme.typography.fontWeight.medium,
        'semibold': theme.typography.fontWeight.semibold,
        'bold': theme.typography.fontWeight.bold,
        'extrabold': theme.typography.fontWeight.extrabold,
      },
      lineHeight: {
        'tight': theme.typography.lineHeight.tight,
        'normal': theme.typography.lineHeight.normal,
        'relaxed': theme.typography.lineHeight.relaxed,
      },
      
      // Spacing tokens
      spacing: {
        'xs': theme.spacing.xs,
        'sm': theme.spacing.sm,
        'md': theme.spacing.md,
        'lg': theme.spacing.lg,
        'xl': theme.spacing.xl,
        '2xl': theme.spacing['2xl'],
        '3xl': theme.spacing['3xl'],
      },
      
      // Shadow tokens
      boxShadow: {
        'none': theme.shadows.none,
        'sm': theme.shadows.sm,
        'md': theme.shadows.md,
        'lg': theme.shadows.lg,
        'xl': theme.shadows.xl,
        '2xl': theme.shadows['2xl'],
        'inner': theme.shadows.inner,
      },
      
      // Border radius
      borderRadius: {
        none: '0px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        full: '9999px',
      },
      
      // Transitions
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '350ms',
      },
      
      // Keyframes
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 