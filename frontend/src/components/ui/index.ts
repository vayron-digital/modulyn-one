// Design System UI Components
// Export all components for easy importing

import { Button, buttonVariants } from './button';
import { Input, inputVariants } from './input';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants } from './card';
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption, tableVariants } from './table';
import { FormGroup, formGroupVariants } from './form-group';
import { DialogRoot, DialogPortal, DialogOverlay, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, dialogOverlayVariants, dialogContentVariants } from './dialog';
import { Badge, badgeVariants } from './badge';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
import { Label } from './label';
import { Textarea } from './textarea';
import { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator } from './select';
import { Checkbox } from './checkbox';
import { RadioGroup, RadioGroupItem } from './radio';
import { Switch } from './switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup } from './dropdown';
import { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from './toast';
import { useToast } from './use-toast';
import { Toaster } from './toaster';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { Separator } from './separator';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from './sheet';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';
import { DataTable } from './DataTable';
import { FilterBar } from './FilterBar';
import { Skeleton, SkeletonTable } from './skeleton';

// Dialog/Modal Components
export {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  dialogOverlayVariants,
  dialogContentVariants,
} from './dialog';

// Additional UI Components
export { Button, buttonVariants } from './button';
export { Badge, badgeVariants } from './badge';
export { Avatar, AvatarImage, AvatarFallback } from './avatar';
export { Label } from './label';
export { Textarea } from './textarea';
export { Input, inputVariants } from './input';
export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator } from './select';
export { Checkbox } from './checkbox';
export { RadioGroup, RadioGroupItem } from './radio';
export { Switch } from './switch';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup } from './dropdown';
export { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from './toast';
export { useToast } from './use-toast';
export { Toaster } from './toaster';
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
export { Separator } from './separator';
export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from './sheet';
export { ToggleGroup, ToggleGroupItem } from './toggle-group';
export { FormGroup, formGroupVariants } from './form-group';

// Data Table Component
export { DataTable } from './DataTable';

// Filter Bar Component
export { FilterBar } from './FilterBar';

// Skeleton Components
export { Skeleton, SkeletonTable } from './skeleton';

// Date Picker Components
// export { Calendar } from './date-picker/calendar';
// export { DatePicker } from './date-picker/date-picker';
// export { DateRangePicker } from './date-picker/date-range-picker';

// Export all components as a single object for convenience
export const UIComponents = {
  Button,
  Input,
  Card,
  Table,
  FormGroup,
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  Badge,
  Avatar,
  Label,
  Textarea,
  Select,
  Checkbox,
  RadioGroup,
  Switch,
  Tabs,
  DropdownMenu,
  Toast,
  Tooltip,
  Separator,
  Sheet,
  ToggleGroup,
  DataTable,
  FilterBar,
  Skeleton,
}; 