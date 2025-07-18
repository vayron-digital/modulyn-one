# 🎨 Fortune CRM Design System

A unified design system for consistent, maintainable, and scalable UI components across the Fortune CRM application.

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Design Tokens](#design-tokens)
- [Components](#components)
- [Usage Examples](#usage-examples)
- [Global Updates](#global-updates)
- [Best Practices](#best-practices)
- [Dark Mode](#dark-mode)
- [Migration Guide](#migration-guide)

## 🎯 Overview

The Fortune CRM Design System provides:

- **Centralized Design Tokens**: All colors, spacing, typography, and other design values in one place
- **Consistent Components**: Pre-built UI components with multiple variants and sizes
- **Global Theme Updates**: Change design tokens once, update everywhere
- **Dark Mode Support**: Automatic dark mode switching
- **Type Safety**: Full TypeScript support with proper types

## 🚀 Quick Start

### Import Components

```tsx
import { Button, Input, Card, FormGroup } from '@/components/ui';
import { designTokens } from '@/lib/designSystem';
```

### Basic Usage

```tsx
// Button with variants
<Button variant="default">Primary Action</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Secondary Action</Button>

// Input with states
<Input placeholder="Enter text" />
<Input variant="error" placeholder="Error state" />

// Card with variants
<Card variant="elevated">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>Card content</CardContent>
</Card>

// Form with validation
<FormGroup label="Email" required error="Please enter a valid email">
  <Input type="email" placeholder="Enter your email" />
</FormGroup>
```

## 🎨 Design Tokens

### Colors

```tsx
import { designTokens } from '@/lib/designSystem';

// Primary colors
designTokens.colors.primary    // "#000000"
designTokens.colors.secondary  // "#FFFFFF"
designTokens.colors.accent     // "#F0F0F0"

// Semantic colors
designTokens.colors.danger     // "#FF4D4F"
designTokens.colors.success    // "#52C41A"
designTokens.colors.warning    // "#FAAD14"
designTokens.colors.info       // "#1890FF"

// Text colors
designTokens.colors.text.primary   // "#111111"
designTokens.colors.text.secondary // "#666666"
designTokens.colors.text.muted     // "#999999"
```

### Spacing

```tsx
designTokens.spacing.xs   // "4px"
designTokens.spacing.sm   // "8px"
designTokens.spacing.md   // "16px"
designTokens.spacing.lg   // "24px"
designTokens.spacing.xl   // "32px"
```

### Typography

```tsx
designTokens.typography.fontFamily.sans  // "'Inter', 'Mona Sans', ..."
designTokens.typography.fontSize.base    // "16px"
designTokens.typography.fontWeight.medium // 500
```

## 🧩 Components

### Button

```tsx
// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>
<Button variant="info">Info</Button>

// Sizes
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
<Button size="icon"><Icon /></Button>
```

### Input

```tsx
// Variants
<Input placeholder="Default input" />
<Input variant="error" placeholder="Error state" />
<Input variant="success" placeholder="Success state" />
<Input variant="warning" placeholder="Warning state" />

// Sizes
<Input size="sm" placeholder="Small input" />
<Input size="default" placeholder="Default input" />
<Input size="lg" placeholder="Large input" />
```

### Card

```tsx
// Variants
<Card variant="default">Default card</Card>
<Card variant="elevated">Elevated card</Card>
<Card variant="outline">Outline card</Card>
<Card variant="ghost">Ghost card</Card>

// Padding options
<Card padding="none">No padding</Card>
<Card padding="sm">Small padding</Card>
<Card padding="default">Default padding</Card>
<Card padding="lg">Large padding</Card>
```

### FormGroup

```tsx
// Basic form group
<FormGroup label="Email" required>
  <Input type="email" placeholder="Enter your email" />
</FormGroup>

// With error state
<FormGroup label="Email" required error="Please enter a valid email">
  <Input type="email" placeholder="Enter your email" />
</FormGroup>

// With help text
<FormGroup label="Password" required helpText="Must be at least 8 characters">
  <Input type="password" placeholder="Enter your password" />
</FormGroup>

// Horizontal layout
<FormGroup label="Remember me" variant="horizontal">
  <Checkbox />
</FormGroup>
```

### Table

```tsx
<Table variant="striped">
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Dialog/Modal

```tsx
<DialogRoot>
  <DialogTrigger>Open Dialog</DialogTrigger>
  <DialogContent size="lg" variant="elevated">
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
```

## 🔄 Global Updates

To update the design system globally:

1. **Update Design Tokens** in `src/lib/designSystem.ts`:
```tsx
export const colors = {
  primary: "#NEW_COLOR", // Change primary color
  // ... other colors
};
```

2. **Update Tailwind Config** in `tailwind.config.js`:
```js
colors: {
  primary: {
    DEFAULT: '#NEW_COLOR',
    // ... other variants
  },
}
```

3. **All components automatically update** - no per-page changes needed!

## 🎯 Best Practices

### ✅ Do's

- Use design system components instead of custom HTML elements
- Use semantic color names (`text-primary`, `bg-background`)
- Use consistent spacing (`space-y-4`, `p-6`)
- Use component variants instead of custom styling
- Import from the centralized UI components

### ❌ Don'ts

- Don't use hardcoded colors (`bg-black`, `text-white`)
- Don't create custom button styles when variants exist
- Don't use inconsistent spacing
- Don't bypass the design system components

### Examples

```tsx
// ✅ Good
<Button variant="destructive">Delete</Button>
<div className="space-y-4 p-6 bg-background text-text-primary">

// ❌ Bad
<button className="bg-red-500 text-white">Delete</button>
<div className="space-y-2 p-8 bg-white text-black">
```

## 🌙 Dark Mode

All components support dark mode automatically:

```tsx
// Light mode
<div className="bg-background text-text-primary">

// Dark mode (automatic)
<div className="bg-background text-text-primary dark:bg-background-dark dark:text-text-primary">
```

The design system handles dark mode variants automatically based on the `dark` class on the HTML element.

## 🔧 Migration Guide

### From Custom Components

1. **Replace custom buttons**:
```tsx
// Old
<button className="bg-blue-500 text-white px-4 py-2 rounded">Submit</button>

// New
<Button variant="default">Submit</Button>
```

2. **Replace custom inputs**:
```tsx
// Old
<input className="border border-gray-300 px-3 py-2 rounded" />

// New
<Input placeholder="Enter text" />
```

3. **Replace custom cards**:
```tsx
// Old
<div className="bg-white border border-gray-200 p-6 rounded-lg shadow">

// New
<Card>
  <CardContent>Content</CardContent>
</Card>
```

### From Inline Styles

1. **Replace inline styles with design tokens**:
```tsx
// Old
<div style={{ color: '#000000', padding: '16px' }}>

// New
<div className="text-text-primary p-4">
```

## 📚 Additional Resources

- **Design System Documentation**: `src/lib/designSystemDocs.ts`
- **Design System Utilities**: `src/lib/designSystemUtils.ts`
- **Component Examples**: See individual component files in `src/components/ui/`
- **Tailwind Configuration**: `tailwind.config.js`

## 🤝 Contributing

When adding new components or updating the design system:

1. Update design tokens in `src/lib/designSystem.ts`
2. Update Tailwind config to match
3. Add component variants using `cva`
4. Update documentation
5. Test in both light and dark modes

## 📝 Notes

- All components are built with TypeScript for type safety
- Components use Radix UI primitives for accessibility
- Design tokens are the single source of truth
- Global updates require changes in only 2 files
- Dark mode support is automatic
- Responsive design is handled by Tailwind CSS 