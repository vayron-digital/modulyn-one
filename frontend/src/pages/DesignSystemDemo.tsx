import React, { useState } from 'react';
import { 
  Button, 
  Input, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  FormGroup,
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { designTokens } from '@/lib/designSystem';

const DesignSystemDemo: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedTab, setSelectedTab] = useState('buttons');

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-text-primary">
            Fortune CRM Design System
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            A unified design system for consistent, maintainable, and scalable UI components.
            All components use centralized design tokens for global updates.
          </p>
        </div>

        {/* Design Tokens Display */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Design Tokens</CardTitle>
            <CardDescription>
              Centralized design values that can be updated globally
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Colors</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-primary rounded"></div>
                    <span className="text-sm">Primary: {designTokens.colors.primary}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-danger rounded"></div>
                    <span className="text-sm">Danger: {designTokens.colors.danger}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-success rounded"></div>
                    <span className="text-sm">Success: {designTokens.colors.success}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Spacing</h3>
                <div className="space-y-2">
                  <div className="text-sm">XS: {designTokens.spacing.xs}</div>
                  <div className="text-sm">SM: {designTokens.spacing.sm}</div>
                  <div className="text-sm">MD: {designTokens.spacing.md}</div>
                  <div className="text-sm">LG: {designTokens.spacing.lg}</div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Typography</h3>
                <div className="space-y-2">
                  <div className="text-sm">Base: {designTokens.typography.fontSize.base}</div>
                  <div className="text-sm">Font: {designTokens.typography.fontFamily.sans.split(',')[0]}</div>
                  <div className="text-sm">Weight: {designTokens.typography.fontWeight.medium}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Component Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="inputs">Inputs</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="tables">Tables</TabsTrigger>
          </TabsList>

          {/* Buttons Tab */}
          <TabsContent value="buttons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
                <CardDescription>All button variants using design system tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button variant="default">Default</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                  <Button variant="success">Success</Button>
                  <Button variant="warning">Warning</Button>
                  <Button variant="info">Info</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Button Sizes</CardTitle>
                <CardDescription>Different button sizes for various use cases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="xs">Extra Small</Button>
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                  <Button size="icon">🔍</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inputs Tab */}
          <TabsContent value="inputs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Input Variants</CardTitle>
                <CardDescription>Input states and validation feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FormGroup label="Default Input">
                    <Input placeholder="Enter text here" />
                  </FormGroup>
                  <FormGroup label="Error Input" error="This field is required">
                    <Input variant="error" placeholder="Error state" />
                  </FormGroup>
                  <FormGroup label="Success Input">
                    <Input variant="success" placeholder="Success state" />
                  </FormGroup>
                  <FormGroup label="Warning Input">
                    <Input variant="warning" placeholder="Warning state" />
                  </FormGroup>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Input Sizes</CardTitle>
                <CardDescription>Different input sizes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FormGroup label="Small Input">
                    <Input size="sm" placeholder="Small input" />
                  </FormGroup>
                  <FormGroup label="Default Input">
                    <Input size="default" placeholder="Default input" />
                  </FormGroup>
                  <FormGroup label="Large Input">
                    <Input size="lg" placeholder="Large input" />
                  </FormGroup>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cards Tab */}
          <TabsContent value="cards" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="default">
                <CardHeader>
                  <CardTitle>Default Card</CardTitle>
                  <CardDescription>Standard card with default styling</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This card uses the default variant with standard padding and styling.</p>
                </CardContent>
                <CardFooter>
                  <Button>Action</Button>
                </CardFooter>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Elevated Card</CardTitle>
                  <CardDescription>Card with enhanced shadow and hover effects</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This card has an elevated appearance with enhanced shadows.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Confirm</Button>
                </CardFooter>
              </Card>

              <Card variant="outline">
                <CardHeader>
                  <CardTitle>Outline Card</CardTitle>
                  <CardDescription>Card with prominent border</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This card has a prominent border for emphasis.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost">View Details</Button>
                </CardFooter>
              </Card>

              <Card variant="ghost">
                <CardHeader>
                  <CardTitle>Ghost Card</CardTitle>
                  <CardDescription>Minimal card without background or border</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This card has minimal styling for subtle content presentation.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="link">Learn More</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          {/* Tables Tab */}
          <TabsContent value="tables" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Table</CardTitle>
                <CardDescription>Table component with design system styling</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>John Doe</TableCell>
                      <TableCell>john@example.com</TableCell>
                      <TableCell>
                        <Badge variant="default">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">Edit</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Jane Smith</TableCell>
                      <TableCell>jane@example.com</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Inactive</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">Edit</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Bob Johnson</TableCell>
                      <TableCell>bob@example.com</TableCell>
                      <TableCell>
                        <Badge variant="destructive">Suspended</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">Edit</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Dialog/Modal Component</CardTitle>
            <CardDescription>Modal dialogs with design system styling</CardDescription>
          </CardHeader>
          <CardContent>
            <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>Open Dialog</Button>
              </DialogTrigger>
              <DialogContent size="lg" variant="elevated">
                <DialogHeader>
                  <DialogTitle>Design System Dialog</DialogTitle>
                  <DialogDescription>
                    This dialog demonstrates the design system's modal component with consistent styling.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <FormGroup label="Name" required>
                    <Input placeholder="Enter your name" />
                  </FormGroup>
                  <FormGroup label="Email" required>
                    <Input type="email" placeholder="Enter your email" />
                  </FormGroup>
                  <FormGroup label="Role">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="guest">Guest</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormGroup>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setDialogOpen(false)}>
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </DialogRoot>
          </CardContent>
        </Card>

        {/* Global Update Demo */}
        <Card variant="outline">
          <CardHeader>
            <CardTitle>Global Updates</CardTitle>
            <CardDescription>
              Change design tokens in designSystem.ts to update all components globally
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-text-secondary">
                To update the design system globally:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-text-secondary">
                <li>Update colors in <code className="bg-accent px-1 rounded">src/lib/designSystem.ts</code></li>
                <li>Update Tailwind config in <code className="bg-accent px-1 rounded">tailwind.config.js</code></li>
                <li>All components automatically use the new tokens</li>
              </ol>
              <div className="flex gap-4">
                <Button variant="default">Primary Button</Button>
                <Button variant="destructive">Danger Button</Button>
                <Button variant="success">Success Button</Button>
                <p className="text-sm text-text-secondary self-center">
                  ← These will all update when you change the design tokens
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DesignSystemDemo; 