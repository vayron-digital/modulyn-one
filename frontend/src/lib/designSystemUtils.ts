import { designTokens } from './designSystem';

/**
 * Design System Utilities
 * Helper functions for working with the design system
 */

/**
 * Get CSS custom properties for design tokens
 * Useful for CSS-in-JS or custom CSS
 */
export const getCSSVariables = () => {
  const variables: Record<string, string> = {};
  
  // Colors
  Object.entries(designTokens.colors).forEach(([key, value]) => {
    if (typeof value === 'string') {
      variables[`--color-${key}`] = value;
    } else if (typeof value === 'object') {
      Object.entries(value).forEach(([subKey, subValue]) => {
        variables[`--color-${key}-${subKey}`] = subValue as string;
      });
    }
  });
  
  // Spacing
  Object.entries(designTokens.spacing).forEach(([key, value]) => {
    variables[`--spacing-${key}`] = value;
  });
  
  // Typography
  Object.entries(designTokens.typography.fontSize).forEach(([key, value]) => {
    variables[`--font-size-${key}`] = value;
  });
  
  Object.entries(designTokens.typography.fontWeight).forEach(([key, value]) => {
    variables[`--font-weight-${key}`] = value.toString();
  });
  
  // Border radius
  Object.entries(designTokens.borderRadius).forEach(([key, value]) => {
    variables[`--border-radius-${key}`] = value;
  });
  
  return variables;
};

/**
 * Generate CSS string from design tokens
 */
export const generateCSS = () => {
  const variables = getCSSVariables();
  return Object.entries(variables)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n');
};

/**
 * Get responsive breakpoints
 */
export const getBreakpoints = () => designTokens.breakpoints;

/**
 * Get color palette
 */
export const getColorPalette = () => designTokens.colors;

/**
 * Get spacing scale
 */
export const getSpacingScale = () => designTokens.spacing;

/**
 * Get typography scale
 */
export const getTypographyScale = () => designTokens.typography;

/**
 * Get component-specific tokens
 */
export const getComponentTokens = () => designTokens.components;

/**
 * Create a theme object for styled-components or emotion
 */
export const createTheme = () => ({
  colors: designTokens.colors,
  spacing: designTokens.spacing,
  typography: designTokens.typography,
  borderRadius: designTokens.borderRadius,
  shadows: designTokens.shadows,
  transitions: designTokens.transitions,
  breakpoints: designTokens.breakpoints,
  components: designTokens.components,
});

/**
 * Get semantic color mapping
 */
export const getSemanticColors = () => ({
  primary: designTokens.colors.primary,
  secondary: designTokens.colors.secondary,
  accent: designTokens.colors.accent,
  danger: designTokens.colors.danger,
  success: designTokens.colors.success,
  warning: designTokens.colors.warning,
  info: designTokens.colors.info,
  text: {
    primary: designTokens.colors.text.primary,
    secondary: designTokens.colors.text.secondary,
    muted: designTokens.colors.text.muted,
    inverse: designTokens.colors.text.inverse,
  },
  background: {
    primary: designTokens.colors.background.primary,
    secondary: designTokens.colors.background.secondary,
    dark: designTokens.colors.background.dark,
  },
  border: {
    light: designTokens.colors.border.light,
    medium: designTokens.colors.border.medium,
    dark: designTokens.colors.border.dark,
  },
});

/**
 * Validate design tokens
 * Ensures all required tokens are present and have valid values
 */
export const validateDesignTokens = () => {
  const errors: string[] = [];
  
  // Check if all required color tokens exist
  const requiredColors = ['primary', 'secondary', 'accent', 'danger', 'success', 'warning', 'info'];
  requiredColors.forEach(color => {
    if (!designTokens.colors[color]) {
      errors.push(`Missing required color: ${color}`);
    }
  });
  
  // Check if all required spacing tokens exist
  const requiredSpacing = ['xs', 'sm', 'md', 'lg', 'xl'];
  requiredSpacing.forEach(spacing => {
    if (!designTokens.spacing[spacing]) {
      errors.push(`Missing required spacing: ${spacing}`);
    }
  });
  
  // Check if all required typography tokens exist
  const requiredFontSizes = ['xs', 'sm', 'base', 'lg', 'xl'];
  requiredFontSizes.forEach(size => {
    if (!designTokens.typography.fontSize[size]) {
      errors.push(`Missing required font size: ${size}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get component variant options
 */
export const getComponentVariants = () => ({
  button: {
    variants: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'success', 'warning', 'info'],
    sizes: ['xs', 'sm', 'default', 'lg', 'xl', 'icon'],
  },
  input: {
    variants: ['default', 'error', 'success', 'warning'],
    sizes: ['sm', 'default', 'lg'],
  },
  card: {
    variants: ['default', 'elevated', 'outline', 'ghost'],
    padding: ['none', 'sm', 'default', 'lg'],
  },
  table: {
    variants: ['default', 'striped', 'bordered'],
    sizes: ['sm', 'default', 'lg'],
  },
  dialog: {
    variants: ['default', 'elevated', 'outline'],
    sizes: ['sm', 'default', 'lg', 'xl', 'full'],
  },
  formGroup: {
    variants: ['default', 'horizontal', 'inline'],
    sizes: ['sm', 'default', 'lg'],
  },
});

/**
 * Create a design token getter with fallbacks
 */
export const createTokenGetter = () => {
  return {
    color: (path: string, fallback?: string) => {
      const keys = path.split('.');
      let value: any = designTokens.colors;
      
      for (const key of keys) {
        value = value?.[key];
        if (value === undefined) break;
      }
      
      return value || fallback || designTokens.colors.primary;
    },
    
    spacing: (size: string, fallback?: string) => {
      return designTokens.spacing[size] || fallback || designTokens.spacing.md;
    },
    
    fontSize: (size: string, fallback?: string) => {
      return designTokens.typography.fontSize[size] || fallback || designTokens.typography.fontSize.base;
    },
    
    fontWeight: (weight: string, fallback?: number) => {
      return designTokens.typography.fontWeight[weight] || fallback || designTokens.typography.fontWeight.normal;
    },
    
    borderRadius: (radius: string, fallback?: string) => {
      return designTokens.borderRadius[radius] || fallback || designTokens.borderRadius.md;
    },
  };
};

export default {
  getCSSVariables,
  generateCSS,
  getBreakpoints,
  getColorPalette,
  getSpacingScale,
  getTypographyScale,
  getComponentTokens,
  createTheme,
  getSemanticColors,
  validateDesignTokens,
  getComponentVariants,
  createTokenGetter,
}; 