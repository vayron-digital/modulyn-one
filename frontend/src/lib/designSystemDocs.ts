/**
 * Design System Documentation
 * 
 * This file provides documentation and examples for using the unified design system.
 * All design tokens are centralized in designSystem.ts and can be updated globally.
 */

import { designTokens } from './designSystem';

/**
 * 🎨 Design System Overview
 * 
 * The design system provides:
 * - Centralized design tokens (colors, spacing, typography, etc.)
 * - Consistent component variants and sizes
 * - Dark mode support
 * - Global theme updates
 */

/**
 * 📚 Usage Examples
 */

// 1. Using Design Tokens in Components
export const designTokenExamples = {
  // Colors
  primaryColor: designTokens.colors.primary,
  textColor: designTokens.colors.text.primary,
  
  // Spacing
  smallGap: designTokens.spacing.sm,
  largePadding: designTokens.spacing.lg,
  
  // Typography
  fontFamily: designTokens.typography.fontFamily.sans,
  fontSize: designTokens.typography.fontSize.base,
  fontWeight: designTokens.typography.fontWeight.medium,
  
  // Border Radius
  roundedCorners: designTokens.borderRadius.md,
  
  // Shadows
  cardShadow: designTokens.shadows.md,
  
  // Transitions
  smoothTransition: designTokens.transitions.normal,
};

// 2. Tailwind CSS Classes
export const tailwindExamples = {
  // Colors
  primaryButton: "bg-primary text-secondary",
  secondaryText: "text-text-secondary",
  dangerAlert: "bg-danger text-secondary",
  successMessage: "bg-success text-secondary",
  
  // Spacing
  container: "p-6 space-y-4",
  button: "px-4 py-2",
  card: "p-lg",
  
  // Typography
  heading: "text-2xl font-bold text-text-primary",
  body: "text-base text-text-primary",
  caption: "text-sm text-text-secondary",
  
  // Border Radius
  rounded: "rounded-md",
  pill: "rounded-full",
  
  // Shadows
  elevated: "shadow-md",
  floating: "shadow-xl",
  
  // Transitions
  smooth: "transition-all duration-normal",
};

/**
 * 🧩 Component Usage Examples
 */

export const componentExamples = {
  // Button Variants
  button: {
    primary: '<Button variant="default">Primary Action</Button>',
    secondary: '<Button variant="secondary">Secondary Action</Button>',
    danger: '<Button variant="destructive">Delete</Button>',
    success: '<Button variant="success">Save</Button>',
    warning: '<Button variant="warning">Warning</Button>',
    info: '<Button variant="info">Info</Button>',
    outline: '<Button variant="outline">Outline</Button>',
    ghost: '<Button variant="ghost">Ghost</Button>',
    link: '<Button variant="link">Link Style</Button>',
  },
  
  // Button Sizes
  buttonSizes: {
    xs: '<Button size="xs">Extra Small</Button>',
    sm: '<Button size="sm">Small</Button>',
    default: '<Button size="default">Default</Button>',
    lg: '<Button size="lg">Large</Button>',
    xl: '<Button size="xl">Extra Large</Button>',
    icon: '<Button size="icon"><Icon /></Button>',
  },
  
  // Input Variants
  input: {
    default: '<Input placeholder="Default input" />',
    error: '<Input variant="error" placeholder="Error state" />',
    success: '<Input variant="success" placeholder="Success state" />',
    warning: '<Input variant="warning" placeholder="Warning state" />',
  },
  
  // Input Sizes
  inputSizes: {
    sm: '<Input size="sm" placeholder="Small input" />',
    default: '<Input size="default" placeholder="Default input" />',
    lg: '<Input size="lg" placeholder="Large input" />',
  },
  
  // Card Variants
  card: {
    default: '<Card><CardContent>Default card</CardContent></Card>',
    elevated: '<Card variant="elevated"><CardContent>Elevated card</CardContent></Card>',
    outline: '<Card variant="outline"><CardContent>Outline card</CardContent></Card>',
    ghost: '<Card variant="ghost"><CardContent>Ghost card</CardContent></Card>',
  },
  
  // Form Groups
  formGroup: {
    default: `
      <FormGroup label="Email" required>
        <Input type="email" placeholder="Enter your email" />
      </FormGroup>
    `,
    withError: `
      <FormGroup label="Email" required error="Please enter a valid email">
        <Input type="email" placeholder="Enter your email" />
      </FormGroup>
    `,
    withHelp: `
      <FormGroup label="Password" required helpText="Must be at least 8 characters">
        <Input type="password" placeholder="Enter your password" />
      </FormGroup>
    `,
    horizontal: `
      <FormGroup label="Remember me" variant="horizontal">
        <Checkbox />
      </FormGroup>
    `,
  },
  
  // Dialog/Modal
  dialog: {
    default: `
      <DialogRoot>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog description</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline">Cancel</Button>
            <Button>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    `,
    large: '<DialogContent size="lg">Large dialog content</DialogContent>',
    elevated: '<DialogContent variant="elevated">Elevated dialog</DialogContent>',
  },
};

/**
 * 🎯 Best Practices
 */

export const bestPractices = {
  // 1. Always use design system tokens
  good: "Use designTokens.colors.primary",
  bad: "Use hardcoded '#000000'",
  
  // 2. Use Tailwind classes that match design tokens
  good: "bg-primary text-secondary",
  bad: "bg-black text-white",
  
  // 3. Use component variants instead of custom styling
  good: '<Button variant="destructive">Delete</Button>',
  bad: '<button className="bg-red-500 text-white">Delete</button>',
  
  // 4. Use consistent spacing
  good: "space-y-4 p-6",
  bad: "space-y-2 p-8",
  
  // 5. Use semantic color names
  good: "text-text-primary bg-background",
  bad: "text-gray-900 bg-white",
};

/**
 * 🔄 Global Updates
 * 
 * To update the design system globally:
 * 
 * 1. Update colors in designSystem.ts
 * 2. Update Tailwind config to match
 * 3. All components will automatically use new tokens
 * 
 * Example: Change primary color
 * - Update designTokens.colors.primary
 * - Update tailwind.config.js colors.primary
 * - All primary buttons, links, etc. will update automatically
 */

/**
 * 🌙 Dark Mode Support
 * 
 * All components support dark mode automatically:
 * - Use semantic color names (text-primary, background, etc.)
 * - Dark mode variants are defined in designTokens.colors.dark
 * - Components automatically switch based on dark mode class
 */

/**
 * 📱 Responsive Design
 * 
 * Use Tailwind's responsive prefixes with design tokens:
 * - sm:bg-primary (small screens and up)
 * - md:text-lg (medium screens and up)
 * - lg:p-8 (large screens and up)
 */

export default {
  designTokenExamples,
  tailwindExamples,
  componentExamples,
  bestPractices,
}; 