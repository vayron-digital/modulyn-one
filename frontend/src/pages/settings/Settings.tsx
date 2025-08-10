import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectWithSearch } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { getCurrencyDisplay } from '../../utils/currency';
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useCurrencyStore, AVAILABLE_CURRENCIES } from '../../utils/currency';

// Helper function to get currency symbols
const getCurrencySymbol = (currency: string) => {
  const symbols: Record<string, string> = {
    'USD': '$',
    'AED': 'د.إ',
    'INR': '₹',
    'GBP': '£',
    'EUR': '€',
    'RUB': '₽',
    'SAR': 'ر.س',
    'CNY': '¥',
    'CAD': 'C$',
    'TRY': '₺',
    'PKR': '₨',
    'KWD': 'د.ك',
    'LBP': 'ل.ل',
    'IRR': '﷼',
    'ZAR': 'R'
  };
  return symbols[currency] || currency;
};
import { supabase } from '../../lib/supabase';
import { 
  Camera, 
  Save, 
  Users, 
  Shield, 
  Settings as SettingsIcon, 
  UserPlus, 
  Building, 
  Key, 
  Bell, 
  Globe, 
  Palette,
  Mail,
  Phone,
  Calendar,
  FileText,
  BarChart3,
  Zap,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  User,
  Clock,
  RefreshCw,
  Download,
  Link
} from 'lucide-react';
import { Switch } from '../../components/ui/switch';
import FullScreenLoader from '../../components/FullScreenLoader';
import { useLocation } from 'react-router-dom';
import UserManagement from '../../components/settings/UserManagement';
import TeamManagement from '../../components/settings/TeamManagement';
import JobsManagement from '../../components/settings/JobsManagement';
import PasswordChange from '../../components/settings/PasswordChange';
import ImageCropModal from '../../components/common/ImageCropModal';
import ConfirmUploadModal from '../../components/common/ConfirmUploadModal';

interface UserSettings {
  full_name: string;
  email: string;
  phone: string;
  profile_image: string;
  currency: string;
  timezone: string;
  secondary_currencies: string[];
  job_title?: string;
  department?: string;
  location?: string;
  bio?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  github?: string;
}

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_admin: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  profile_image_url?: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  granted: boolean;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  status: 'active' | 'inactive' | 'error';
  category?: string;
  features?: string[];
}

const DEFAULT_SETTINGS: UserSettings = {
  full_name: '',
  email: '',
  phone: '',
  profile_image: '',
  currency: 'AED',
  timezone: 'UTC',
  secondary_currencies: ['USD', 'GBP', 'EUR']
};

const CURRENCY_COUNTRY_MAP: Record<string, string> = {
  USD: 'United States',
  AED: 'United Arab Emirates',
  INR: 'India',
  GBP: 'United Kingdom',
  EUR: 'European Union',
  RUB: 'Russia',
  SAR: 'Saudi Arabia',
  CNY: 'China',
  CAD: 'Canada',
  TRY: 'Turkey',
  PKR: 'Pakistan',
  KWD: 'Kuwait',
  LBP: 'Lebanon',
  IRR: 'Iran',
  ZAR: 'South Africa',
};

const PERMISSIONS: Permission[] = [
  // User Management
  { id: 'user_management', name: 'User Management', description: 'Create, edit, and delete users', category: 'User Management', granted: false },
  { id: 'team_management', name: 'Team Management', description: 'Manage team structure and hierarchy', category: 'User Management', granted: false },
  { id: 'role_assignment', name: 'Role Assignment', description: 'Assign roles and permissions to users', category: 'User Management', granted: false },
  
  // Data Access
  { id: 'view_all_leads', name: 'View All Leads', description: 'Access to all leads in the system', category: 'Data Access', granted: false },
  { id: 'edit_all_leads', name: 'Edit All Leads', description: 'Modify any lead information', category: 'Data Access', granted: false },
  { id: 'delete_leads', name: 'Delete Leads', description: 'Remove leads from the system', category: 'Data Access', granted: false },
  
  // Reports & Analytics
  { id: 'view_reports', name: 'View Reports', description: 'Access to all reports and analytics', category: 'Reports', granted: false },
  { id: 'export_data', name: 'Export Data', description: 'Export data in various formats', category: 'Reports', granted: false },
  { id: 'view_analytics', name: 'View Analytics', description: 'Access to advanced analytics', category: 'Reports', granted: false },
  
  // System Settings
  { id: 'system_settings', name: 'System Settings', description: 'Modify system-wide settings', category: 'System', granted: false },
  { id: 'integrations', name: 'Manage Integrations', description: 'Configure third-party integrations', category: 'System', granted: false },
  { id: 'backup_restore', name: 'Backup & Restore', description: 'Manage data backup and restoration', category: 'System', granted: false },
];

const INTEGRATION_ICONS: Record<string, string> = {
  slack: '💬',
  zapier: '⚡',
  mailchimp: '📧',
  hubspot: '🎯',
  google_calendar: '📅',
  stripe: '💳',
};

const INTEGRATIONS: Integration[] = [
  { 
    id: 'slack', 
    name: 'Slack', 
    description: 'Team communication and notifications', 
    icon: 'https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg',
    connected: false, 
    status: 'inactive' as const,
    category: 'Communication',
    features: ['Team messaging', 'Notifications', 'File sharing', 'Channel management']
  },
  { 
    id: 'zapier', 
    name: 'Zapier', 
    description: 'Automate workflows and integrations', 
    icon: 'https://cdn.worldvectorlogo.com/logos/zapier.svg',
    connected: false, 
    status: 'inactive' as const,
    category: 'Automation',
    features: ['Workflow automation', 'App connections', 'Data sync', 'Trigger actions']
  },
  { 
    id: 'mailchimp', 
    name: 'Mailchimp', 
    description: 'Email marketing and campaigns', 
    icon: 'https://cdn.worldvectorlogo.com/logos/mailchimp-1.svg',
    connected: false, 
    status: 'inactive' as const,
    category: 'Marketing',
    features: ['Email campaigns', 'Audience management', 'Analytics', 'Templates']
  },
  { 
    id: 'hubspot', 
    name: 'HubSpot', 
    description: 'CRM and marketing automation', 
    icon: 'https://cdn.worldvectorlogo.com/logos/hubspot-2.svg',
    connected: false, 
    status: 'inactive' as const,
    category: 'CRM',
    features: ['Lead management', 'Marketing automation', 'Sales pipeline', 'Analytics']
  },
  { 
    id: 'google_calendar', 
    name: 'Google Calendar', 
    description: 'Calendar integration and scheduling', 
    icon: 'https://cdn.worldvectorlogo.com/logos/google-calendar-2020.svg',
    connected: false, 
    status: 'inactive' as const,
    category: 'Productivity',
    features: ['Event scheduling', 'Calendar sync', 'Meeting management', 'Reminders']
  },
  { 
    id: 'stripe', 
    name: 'Stripe', 
    description: 'Payment processing and billing', 
    icon: 'https://cdn.worldvectorlogo.com/logos/stripe-2.svg',
    connected: false, 
    status: 'inactive' as const,
    category: 'Payments',
    features: ['Payment processing', 'Subscription billing', 'Invoice management', 'Analytics']
  },
  { 
    id: 'salesforce', 
    name: 'Salesforce', 
    description: 'Enterprise CRM and sales management', 
    icon: 'https://cdn.worldvectorlogo.com/logos/salesforce-2.svg',
    connected: false, 
    status: 'inactive' as const,
    category: 'CRM',
    features: ['Sales management', 'Lead tracking', 'Pipeline management', 'Reporting']
  },
  { 
    id: 'microsoft_teams', 
    name: 'Microsoft Teams', 
    description: 'Team collaboration and video conferencing', 
    icon: 'https://cdn.worldvectorlogo.com/logos/microsoft-teams-1.svg',
    connected: false, 
    status: 'inactive' as const,
    category: 'Communication',
    features: ['Video calls', 'Team chat', 'File sharing', 'Meeting scheduling']
  },
];

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previousImagePath, setPreviousImagePath] = useState<string | null>(null);
  const setCurrency = useCurrencyStore(state => state.setCurrency);
  const setSecondaryCurrenciesStore = useCurrencyStore(state => state.setSecondaryCurrencies);

  const location = useLocation();
  
  // New state for comprehensive settings
  const [activeTab, setActiveTab] = useState('profile');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>(PERMISSIONS);
  const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', role: 'agent', permissions: [] as string[] });
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Appearance preferences
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [selectedDensity, setSelectedDensity] = useState<'compact' | 'comfortable' | 'spacious'>('comfortable');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [activePreferenceSection, setActivePreferenceSection] = useState('appearance');
  const [notifications, setNotifications] = useState({
    newLeads: true,
    taskReminders: true,
    weeklyReports: true,
    realTimeUpdates: true,
    soundAlerts: false,
    usageAnalytics: true,
    performanceMonitoring: true
  });

  // For testing purposes, let's make the user an admin so we can see the management tabs
  const isOwner = true; // user?.role === 'owner' || user?.is_admin;
  const isAdmin = true; // user?.is_admin || user?.role === 'admin';

  useEffect(() => {
    if (user?.id) {
      // Check if user is in preview mode (no tenant_id)
      const checkUserStatus = async () => {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error checking profile:', error);
            return;
          }

          // If user doesn't have tenant_id, redirect to preview settings
          if (!profile?.tenant_id) {
            navigate('/preview/settings');
            return;
          }

          // User has full access, load normal settings
          fetchProfileAndSettings();
          if (isAdmin) {
            fetchTeamMembers();
          }
        } catch (error) {
          console.error('Error checking user status:', error);
        }
      };

      checkUserStatus();
    }
  }, [user?.id, location.pathname, isAdmin, navigate]);

  // Handle tab from URL query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    if (tab && ['profile', 'users', 'teams', 'permissions', 'integrations', 'preferences', 'jobs'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    if (settings.currency) setCurrency(settings.currency);
    if (settings.secondary_currencies) setSecondaryCurrenciesStore(settings.secondary_currencies);
  }, [settings.currency, settings.secondary_currencies]);

  const fetchProfileAndSettings = async () => {
    try {
      setLoading(true);
      
      // Use default settings if database tables don't exist yet
      const defaultSettings = {
        ...DEFAULT_SETTINGS,
        full_name: user?.email?.split('@')[0] || 'User',
        email: user?.email || '',
        profile_image: '',
        secondary_currencies: DEFAULT_SETTINGS.secondary_currencies,
        currency: DEFAULT_SETTINGS.currency
      };

      // Try to fetch from database, but don't fail if tables don't exist
      try {
        // Fetch profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, email, phone, profile_photo_url')
          .eq('id', user?.id)
          .maybeSingle(); // Use maybeSingle to avoid 400 error when no record exists

        if (!profileError && profile) {
          defaultSettings.full_name = profile.full_name || defaultSettings.full_name;
          defaultSettings.email = profile.email || defaultSettings.email;
          defaultSettings.profile_image = profile.profile_photo_url || '';
          setProfileImageUrl(profile.profile_photo_url || '');
        }

        // Fetch user settings
        const { data: userSettings, error: settingsError } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user?.id)
          .maybeSingle(); // Use maybeSingle to avoid 406 error when no record exists

        if (!settingsError && userSettings) {
          defaultSettings.currency = userSettings.currency || defaultSettings.currency;
          defaultSettings.secondary_currencies = userSettings.secondary_currencies || defaultSettings.secondary_currencies;
          defaultSettings.timezone = userSettings.timezone || defaultSettings.timezone;
        }

        // Fetch user integrations
        const { data: userIntegrations, error: integrationsError } = await supabase
          .from('integrations')
          .select('*')
          .eq('user_id', user?.id);

        // Update integrations with user data
        if (userIntegrations && !integrationsError) {
          const updatedIntegrations = INTEGRATIONS.map(integration => {
            const userIntegration = userIntegrations.find(ui => ui.integration_id === integration.id);
            return userIntegration ? { ...integration, ...userIntegration } : integration;
          });
          setIntegrations(updatedIntegrations);
        }
      } catch (dbError) {
        // Database tables don't exist yet, use default settings
        console.log('Using default settings - database tables not yet created');
      }

      setSettings(defaultSettings);
    } catch (error: any) {
      console.warn('Error fetching settings:', error);
      // Set default settings on any error
      setSettings({
        ...DEFAULT_SETTINGS,
        full_name: user?.email?.split('@')[0] || 'User',
        email: user?.email || '',
        profile_image: '',
        secondary_currencies: DEFAULT_SETTINGS.secondary_currencies,
        currency: DEFAULT_SETTINGS.currency
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      // Try to fetch from database, but don't fail if table doesn't exist
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setTeamMembers(data);
          return;
        }
      } catch (dbError) {
        console.log('Using default team data - profiles table not yet created');
      }

      // Use default team data if database table doesn't exist
      const defaultTeamMembers = [
        {
          id: user?.id || '1',
          full_name: user?.email?.split('@')[0] || 'You',
          email: user?.email || 'user@example.com',
          role: 'Owner',
          is_admin: true,
          status: 'active' as const,
          created_at: new Date().toISOString(),
          profile_image_url: ''
        }
      ];
      
      setTeamMembers(defaultTeamMembers);
    } catch (error: any) {
      console.warn('Error fetching team members:', error);
      // Set default team data on any error
      setTeamMembers([
        {
          id: user?.id || '1',
          full_name: user?.email?.split('@')[0] || 'You',
          email: user?.email || 'user@example.com',
          role: 'Owner',
          is_admin: true,
          status: 'active' as const,
          created_at: new Date().toISOString(),
          profile_image_url: ''
        }
      ]);
    }
  };

  // Function to delete previous image from storage
  const deletePreviousImage = async (imagePath: string) => {
    try {
      // Extract the file path from the URL
      const urlParts = imagePath.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${user?.id}/${fileName}`;

      const { error } = await supabase.storage
        .from('profile-images')
        .remove([filePath]);

      if (error) {
        console.warn('Failed to delete previous image:', error);
        // Don't throw error - this is not critical
      } else {
        console.log('Previous image deleted successfully');
      }
    } catch (error) {
      console.warn('Error deleting previous image:', error);
      // Don't throw error - this is not critical
    }
  };

  const handleSaveSettings = async (updates: Partial<UserSettings>) => {
    try {
      setLoading(true);
      const profileUpdates: any = {};
      const settingsUpdates: any = {};
      if ('full_name' in updates) profileUpdates.full_name = updates.full_name;
      if ('email' in updates) profileUpdates.email = updates.email;
      if ('phone' in updates) profileUpdates.phone = updates.phone;
      if ('profile_image' in updates) profileUpdates.profile_image_url = updates.profile_image;
      Object.keys(updates).forEach((key) => {
        if (!['full_name', 'email', 'phone', 'profile_image', 'profile_image_url'].includes(key)) {
          settingsUpdates[key] = (updates as any)[key];
        }
      });
      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', user?.id);
        if (profileError) throw profileError;
      }
      // Save to user_settings table
      if (Object.keys(settingsUpdates).length > 0) {
        const { error: settingsError } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user?.id,
            ...settingsUpdates,
            updated_at: new Date().toISOString()
          });
        if (settingsError) throw settingsError;
      }
      
      setSettings(prev => ({ ...prev, ...updates }));
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async () => {
    try {
      setLoading(true);
      // Create user with temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: inviteData.email,
        password: tempPassword,
        email_confirm: true
      });
      
      if (authError) throw authError;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.user.id,
          email: inviteData.email,
          role: inviteData.role,
          is_admin: inviteData.role === 'admin',
          full_name: inviteData.email.split('@')[0], // Temporary name
        });

      if (profileError) throw profileError;

      // Send invitation email (implement your email service)
      // await sendInvitationEmail(inviteData.email, tempPassword);

      toast({
        title: "Success",
        description: `Invitation sent to ${inviteData.email}`,
      });

      setInviteData({ email: '', role: 'agent', permissions: [] });
      setShowInviteModal(false);
      fetchTeamMembers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePermissions = async (memberId: string, newPermissions: string[]) => {
    try {
      setLoading(true);
      // Update user permissions in database
      const { error } = await supabase
        .from('user_permissions')
        .upsert({
          user_id: memberId,
          permissions: newPermissions,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Permissions updated successfully",
      });

      setShowPermissionModal(false);
      setSelectedMember(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleIntegration = async (integrationId: string) => {
    try {
      setLoading(true);
      const integration = integrations.find(i => i.id === integrationId);
      if (!integration) return;

      const updatedIntegrations = integrations.map(i => 
        i.id === integrationId 
          ? { ...i, connected: !i.connected, status: (!i.connected ? 'active' : 'inactive') as 'active' | 'inactive' | 'error' }
          : i
      );

      setIntegrations(updatedIntegrations);

      // Save integration status to database
      const { error } = await supabase
        .from('integrations')
        .upsert({
          user_id: user?.id,
          integration_id: integrationId,
          connected: !integration.connected,
          status: !integration.connected ? 'active' : 'inactive',
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${integration.name} ${!integration.connected ? 'connected' : 'disconnected'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection - open crop modal
  const handleFileSelect = (file: File) => {
    console.log('handleFileSelect called with file:', file);
    
    // Validate file
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "Error",
        description: "File is too large. Maximum size is 10MB.",
        variant: "destructive",
      });
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    console.log('File validation passed, setting selectedImageFile and opening crop modal');
    setSelectedImageFile(file);
    setShowCropModal(true);
  };

  // Handle crop completion
  const handleCropComplete = (croppedFile: File) => {
    console.log('handleCropComplete called with file:', croppedFile);
    console.log('Before state update - showCropModal:', showCropModal, 'showConfirmModal:', showConfirmModal);
    
    setCroppedImageFile(croppedFile);
    
    // Force immediate state updates
    setShowCropModal(false);
    
    // Use setTimeout to ensure the first state update completes
    setTimeout(() => {
      setShowConfirmModal(true);
      console.log('showConfirmModal set to true');
    }, 0);
    
    console.log('State update calls made - crop closed, confirm opened');
  };

  // Handle upload confirmation
  const handleUploadConfirm = async () => {
    console.log('handleUploadConfirm called');
    console.log('croppedImageFile:', croppedImageFile);
    console.log('user?.id:', user?.id);
    
    if (!croppedImageFile || !user?.id) {
      console.log('Early return: missing croppedImageFile or user.id');
      return;
    }

    try {
      setIsUploading(true);

      // Store current image path for deletion
      if (profileImageUrl && !profileImageUrl.includes('default-avatar.png')) {
        setPreviousImagePath(profileImageUrl);
      }

      // Upload to Supabase storage
      const fileExt = croppedImageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      console.log('Uploading cropped image to profile-images bucket:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, croppedImageFile, { 
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: "Error",
          description: `Failed to upload image: ${uploadError.message}`,
          variant: "destructive",
        });
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      if (!publicUrl) {
        toast({
          title: "Error",
          description: "Failed to get image URL",
          variant: "destructive",
        });
        return;
      }

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Database update error:', updateError);
        toast({
          title: "Error",
          description: `Failed to update profile: ${updateError.message}`,
          variant: "destructive",
        });
        return;
      }

      // Delete previous image if it exists
      if (previousImagePath) {
        await deletePreviousImage(previousImagePath);
      }

      // Update local state
      setProfileImageUrl(publicUrl);
      setSettings(prev => ({ ...prev, profile_image: publicUrl }));

      // Trigger success animation
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);

      // Show success toast
      toast({
        title: "🎉 Profile Updated!",
        description: "Your profile image has been updated successfully. Looking great!",
        duration: 4000,
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800",
      });

      // Reset state
      setShowConfirmModal(false);
      setSelectedImageFile(null);
      setCroppedImageFile(null);
      setPreviousImagePath(null);

    } catch (error: any) {
      console.error('Profile image upload error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload profile image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle modal close
  const handleCloseModals = () => {
    setShowCropModal(false);
    setShowConfirmModal(false);
    setSelectedImageFile(null);
    setCroppedImageFile(null);
  };

  // Appearance handlers
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setSelectedTheme(newTheme);
    if (newTheme === 'auto') {
      // Auto theme logic - follow system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      if (theme !== systemTheme) {
        toggleTheme();
      }
    } else if (newTheme !== theme) {
      toggleTheme();
    }
    
    toast({
      title: "Theme Updated",
      description: `Switched to ${newTheme} theme`,
    });
  };

  const handleDensityChange = (newDensity: 'compact' | 'comfortable' | 'spacious') => {
    setSelectedDensity(newDensity);
    // Apply density changes to the document
    document.documentElement.setAttribute('data-density', newDensity);
    
    toast({
      title: "Density Updated",
      description: `Switched to ${newDensity} density`,
    });
  };

  const handleDateFormatChange = (newFormat: string) => {
    setDateFormat(newFormat);
    toast({
      title: "Date Format Updated",
      description: `Changed to ${newFormat} format`,
    });
  };

  const handleTimeFormatChange = (newFormat: string) => {
    setTimeFormat(newFormat);
    toast({
      title: "Time Format Updated",
      description: `Changed to ${newFormat} format`,
    });
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    
    toast({
      title: "Notification Updated",
      description: `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} ${!notifications[key] ? 'enabled' : 'disabled'}`,
    });
  };

  const filteredTeamMembers = teamMembers.filter(member => {
    const matchesSearch = member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-100/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      {/* TOP SECTION: Premium Header with Glass Morphism */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 backdrop-blur-xl"></div>
        <div className="relative px-8 py-12">
          {/* Header with Enhanced Controls */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-8">
              <div>
                <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                  Settings Center ⚙️
                </h1>
                <p className="text-lg text-slate-600 font-medium">
                  Manage your account, team, and preferences
                </p>
              </div>
              <div className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-700 font-semibold">Real-time sync</span>
              </div>
            </div>
                    
            {/* Premium Settings Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="p-3 bg-white/80 text-slate-600 border border-white/30 hover:bg-white/90 rounded-xl transition-all duration-300 shadow-lg backdrop-blur-sm"
                title="Refresh Settings"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative px-8 pb-8">

              {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full flex-wrap bg-white/90 backdrop-blur-sm border border-white/30 rounded-2xl p-2 shadow-xl gap-2 mb-8">
          <TabsTrigger value="profile" className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-white/50 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:scale-105">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="users" className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-white/50 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:scale-105">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="teams" className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-white/50 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:scale-105">
              <Building className="h-4 w-4" />
              Teams
            </TabsTrigger>
          )}
          {isOwner && (
            <TabsTrigger value="permissions" className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-white/50 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:scale-105">
              <Shield className="h-4 w-4" />
              Permissions
            </TabsTrigger>
          )}
          <TabsTrigger value="integrations" className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-white/50 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:scale-105">
            <Zap className="h-4 w-4" />
            Integrations
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="jobs" className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-white/50 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:scale-105">
              <Clock className="h-4 w-4" />
              Jobs
            </TabsTrigger>
          )}
          <TabsTrigger value="preferences" className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-white/50 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:scale-105">
            <SettingsIcon className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-white/50 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:scale-105">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Picture & Basic Info */}
            <div className="lg:col-span-1">
              <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Picture
                  </CardTitle>
                  <CardDescription>Update your profile picture and basic information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className={`w-32 h-32 rounded-full overflow-hidden border-4 shadow-lg transition-all duration-500 ${
                        uploadSuccess 
                          ? 'border-green-400 dark:border-green-500 scale-105 shadow-green-200 dark:shadow-green-800' 
                          : 'border-gray-100 dark:border-gray-800'
                      }`}>
                        <img
                          src={profileImageUrl || '/default-avatar.png'}
                          alt="Profile"
                          className={`w-full h-full object-cover transition-all duration-500 ${
                            uploadSuccess ? 'scale-110' : 'scale-100'
                          }`}
                        />
                      </div>
                      {uploadSuccess && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 animate-pulse">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        id="profile-image-upload"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileSelect(file);
                          }
                        }}
                      />
                      <label 
                        htmlFor="profile-image-upload"
                        className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-2 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 cursor-pointer"
                      >
                        <Camera className="h-4 w-4 text-white" />
                      </label>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Click the camera icon to upload a new photo</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Recommended: 400x400px, JPG or PNG</p>
                      {uploadSuccess && (
                        <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-fade-in">
                          <p className="text-sm text-green-700 dark:text-green-300 font-medium flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Profile image updated successfully!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">Active Account</span>
                      </div>
                      <Badge variant="outline" className="text-xs">Verified</Badge>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Member since {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Personal Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update your personal details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name" className="text-sm font-medium">Full Name *</Label>
                      <Input
                        id="full_name"
                        placeholder="Enter your full name"
                        value={settings.full_name || ""}
                        onChange={e => setSettings(prev => ({ ...prev, full_name: e.target.value }))}
                        className="mt-1 bg-white/80 backdrop-blur-sm border border-white/30 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@company.com"
                        value={settings.email || ""}
                        onChange={e => setSettings(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-1 bg-white/80 backdrop-blur-sm border border-white/30 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={settings.phone || ""}
                        onChange={e => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                        className="mt-1 bg-white/80 backdrop-blur-sm border border-white/30 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="job_title" className="text-sm font-medium">Job Title</Label>
                      <Input
                        id="job_title"
                        placeholder="e.g., Sales Manager"
                        value={settings.job_title || ""}
                        onChange={e => setSettings(prev => ({ ...prev, job_title: e.target.value }))}
                        className="mt-1 bg-white/80 backdrop-blur-sm border border-white/30 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Additional Information
                  </CardTitle>
                  <CardDescription>Add more details to your profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                      <SelectWithSearch
                        value={settings.department || ""}
                        onValueChange={(value) => setSettings(prev => ({ ...prev, department: value }))}
                        placeholder="Select department"
                        searchPlaceholder="Search departments..."
                        items={[
                          { value: 'sales', label: 'Sales', description: 'Sales and Business Development' },
                          { value: 'marketing', label: 'Marketing', description: 'Marketing and Communications' },
                          { value: 'customer_success', label: 'Customer Success', description: 'Customer Support and Success' },
                          { value: 'operations', label: 'Operations', description: 'Business Operations' },
                          { value: 'finance', label: 'Finance', description: 'Finance and Accounting' },
                          { value: 'hr', label: 'Human Resources', description: 'HR and People Operations' },
                          { value: 'it', label: 'IT', description: 'Information Technology' },
                          { value: 'other', label: 'Other', description: 'Other departments' }
                        ]}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                      <Input
                        id="location"
                        placeholder="City, Country"
                        value={settings.location || ""}
                        onChange={e => setSettings(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us about yourself..."
                        value={settings.bio || ""}
                        onChange={e => setSettings(prev => ({ ...prev, bio: e.target.value }))}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="h-5 w-5" />
                    Social Links
                  </CardTitle>
                  <CardDescription>Add your professional social media profiles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="linkedin" className="text-sm font-medium">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={settings.linkedin || ""}
                        onChange={e => setSettings(prev => ({ ...prev, linkedin: e.target.value }))}
                        className="mt-1 bg-white/80 backdrop-blur-sm border border-white/30 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="twitter" className="text-sm font-medium">Twitter</Label>
                      <Input
                        id="twitter"
                        placeholder="https://twitter.com/yourhandle"
                        value={settings.twitter || ""}
                        onChange={e => setSettings(prev => ({ ...prev, twitter: e.target.value }))}
                        className="mt-1 bg-white/80 backdrop-blur-sm border border-white/30 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website" className="text-sm font-medium">Website</Label>
                      <Input
                        id="website"
                        placeholder="https://yourwebsite.com"
                        value={settings.website || ""}
                        onChange={e => setSettings(prev => ({ ...prev, website: e.target.value }))}
                        className="mt-1 bg-white/80 backdrop-blur-sm border border-white/30 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="github" className="text-sm font-medium">GitHub</Label>
                      <Input
                        id="github"
                        placeholder="https://github.com/yourusername"
                        value={settings.github || ""}
                        onChange={e => setSettings(prev => ({ ...prev, github: e.target.value }))}
                        className="mt-1 bg-white/80 backdrop-blur-sm border border-white/30 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* User Management */}
        {isAdmin && (
          <TabsContent value="users" className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <UserManagement />
          </TabsContent>
        )}

        {/* Team Management */}
        {isAdmin && (
          <TabsContent value="teams" className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <TeamManagement />
          </TabsContent>
        )}

        {/* Permissions Management */}
        {isOwner && (
          <TabsContent value="permissions" className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Permission Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(
                    permissions.reduce((acc, permission) => {
                      if (!acc[permission.category]) acc[permission.category] = [];
                      acc[permission.category].push(permission);
                      return acc;
                    }, {} as Record<string, Permission[]>)
                  ).map(([category, perms]) => (
                    <div key={category}>
                      <h3 className="text-lg font-semibold mb-3">{category}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {perms.map((permission) => (
                          <div key={permission.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{permission.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{permission.description}</p>
                            </div>
                            <Switch
                              checked={permission.granted}
                              onCheckedChange={(checked: boolean) => {
                                setPermissions(prev => 
                                  prev.map(p => p.id === permission.id ? { ...p, granted: checked } : p)
                                );
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Jobs Management */}
        {isAdmin && (
          <TabsContent value="jobs" className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <JobsManagement />
          </TabsContent>
        )}

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Integrations
                  </CardTitle>
                  <CardDescription>
                    Connect your CRM with third-party services and tools to streamline your workflow
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Status
                  </Button>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Integration
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Integration Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Integrations</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{integrations.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Connected</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{integrations.filter(i => i.connected).length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Errors</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{integrations.filter(i => i.status === 'error').length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{new Set(integrations.map(i => i.category)).size}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Integration Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.map((integration) => (
                  <Card key={integration.id} className="relative hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={integration.icon} alt={integration.name} />
                              <AvatarFallback>
                                {integration.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {integration.connected && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{integration.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{integration.description}</p>
                            {integration.category && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                {integration.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {integration.features && integration.features.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Features:</p>
                          <div className="flex flex-wrap gap-1">
                            {integration.features.slice(0, 3).map((feature, index) => (
                              <span key={index} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                                {feature}
                              </span>
                            ))}
                            {integration.features.length > 3 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                                +{integration.features.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={integration.connected ? 'default' : 'secondary'}
                            className={integration.status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : ''}
                          >
                            {integration.status === 'error' ? 'Error' : integration.connected ? 'Connected' : 'Not Connected'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={integration.connected}
                            onCheckedChange={(checked: boolean) => handleToggleIntegration(integration.id)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="space-y-6">
          <div className="flex gap-6">
            {/* Sidebar Navigation */}
            <div className="w-64 flex-shrink-0">
              <div className="sticky top-6 space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 px-3">Preferences</h3>
                <nav className="space-y-1">
                  {[
                    { id: 'appearance', label: 'Appearance', icon: Palette, active: activePreferenceSection === 'appearance' },
                    { id: 'currency', label: 'Currency', icon: Globe, active: activePreferenceSection === 'currency' },
                    { id: 'timezone', label: 'Timezone', icon: Calendar, active: activePreferenceSection === 'timezone' },
                    { id: 'notifications', label: 'Notifications', icon: Bell, active: activePreferenceSection === 'notifications' },
                    { id: 'privacy', label: 'Privacy', icon: Shield, active: activePreferenceSection === 'privacy' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActivePreferenceSection(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                        item.active 
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Appearance Section */}
                {activePreferenceSection === 'appearance' && (
                  <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Palette className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Appearance</CardTitle>
                        <CardDescription>Customize how your CRM looks and feels</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Theme Selection */}
                    <div>
                      <Label className="text-base font-medium mb-3 block">Theme</Label>
                      <div className="grid grid-cols-3 gap-3">
                        <div 
                          className={`border-2 rounded-xl p-4 bg-white dark:bg-gray-800 cursor-pointer hover:shadow-md transition-all duration-200 ${
                            selectedTheme === 'light' ? 'border-blue-500' : 'border-gray-300'
                          }`}
                          onClick={() => handleThemeChange('light')}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                            <span className="font-medium">Light</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Clean, bright interface</p>
                        </div>
                        <div 
                          className={`border-2 rounded-xl p-4 bg-gray-900 cursor-pointer hover:shadow-md transition-all duration-200 ${
                            selectedTheme === 'dark' ? 'border-blue-500' : 'border-gray-300'
                          }`}
                          onClick={() => handleThemeChange('dark')}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                            <span className="font-medium text-white">Dark</span>
                          </div>
                          <p className="text-sm text-gray-400">Easy on the eyes</p>
                        </div>
                        <div 
                          className={`border-2 rounded-xl p-4 bg-gradient-to-br from-blue-50 to-indigo-100 cursor-pointer hover:shadow-md transition-all duration-200 ${
                            selectedTheme === 'auto' ? 'border-blue-500' : 'border-gray-300'
                          }`}
                          onClick={() => handleThemeChange('auto')}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                            <span className="font-medium">Auto</span>
                          </div>
                          <p className="text-sm text-gray-600">Follows system</p>
                        </div>
                      </div>
                    </div>

                    {/* Density Selection */}
                    <div>
                      <Label className="text-base font-medium mb-3 block">Density</Label>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            id="density-compact" 
                            name="density" 
                            className="h-4 w-4" 
                            checked={selectedDensity === 'compact'}
                            onChange={() => handleDensityChange('compact')}
                          />
                          <Label htmlFor="density-compact">Compact</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            id="density-comfortable" 
                            name="density" 
                            className="h-4 w-4" 
                            checked={selectedDensity === 'comfortable'}
                            onChange={() => handleDensityChange('comfortable')}
                          />
                          <Label htmlFor="density-comfortable">Comfortable</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            id="density-spacious" 
                            name="density" 
                            className="h-4 w-4" 
                            checked={selectedDensity === 'spacious'}
                            onChange={() => handleDensityChange('spacious')}
                          />
                          <Label htmlFor="density-spacious">Spacious</Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* Currency Section */}
                {activePreferenceSection === 'currency' && (
                  <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Currency</CardTitle>
                        <CardDescription>Configure your preferred currencies</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-base font-medium mb-2 block">Primary Currency</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">This will be used as the default currency for all transactions</p>
                      <SelectWithSearch
                        value={settings.currency}
                        onValueChange={(value) => setSettings(prev => ({ ...prev, currency: value }))}
                        placeholder="Select primary currency"
                        searchPlaceholder="Search currencies..."
                        items={AVAILABLE_CURRENCIES.map((currency) => ({
                          value: currency,
                          label: currency,
                          description: `Currency code: ${currency}`,
                          icon: <span className="text-lg">{getCurrencySymbol(currency)}</span>
                        }))}
                      />
                    </div>

                    <div>
                      <Label className="text-base font-medium mb-2 block">Secondary Currencies</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Select additional currencies for multi-currency support</p>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                        {AVAILABLE_CURRENCIES.map((currency) => (
                          <div key={currency} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                            <input
                              type="checkbox"
                              id={`currency-${currency}`}
                              checked={settings.secondary_currencies?.includes(currency) || false}
                              onChange={(e) => {
                                const newCurrencies = e.target.checked
                                  ? [...(settings.secondary_currencies || []), currency]
                                  : (settings.secondary_currencies || []).filter(c => c !== currency);
                                setSettings(prev => ({ ...prev, secondary_currencies: newCurrencies }));
                              }}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor={`currency-${currency}`} className="text-sm cursor-pointer">
                              <div className="flex items-center gap-1">
                                <span>{getCurrencySymbol(currency)}</span>
                                <span className="text-gray-500">({currency})</span>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* Timezone Section */}
                {activePreferenceSection === 'timezone' && (
                  <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Timezone & Regional</CardTitle>
                        <CardDescription>Set your timezone and regional preferences</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-base font-medium mb-2 block">Timezone</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">This affects how dates and times are displayed</p>
                      <SelectWithSearch
                        value={settings.timezone}
                        onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}
                        placeholder="Select timezone"
                        searchPlaceholder="Search timezones..."
                        items={[
                          { value: 'UTC', label: 'UTC', description: 'Coordinated Universal Time' },
                          { value: 'America/New_York', label: 'Eastern Time', description: 'ET (GMT-5)' },
                          { value: 'America/Chicago', label: 'Central Time', description: 'CT (GMT-6)' },
                          { value: 'America/Denver', label: 'Mountain Time', description: 'MT (GMT-7)' },
                          { value: 'America/Los_Angeles', label: 'Pacific Time', description: 'PT (GMT-8)' },
                          { value: 'Europe/London', label: 'London', description: 'GMT (GMT+0)' },
                          { value: 'Europe/Paris', label: 'Paris', description: 'CET (GMT+1)' },
                          { value: 'Asia/Dubai', label: 'Dubai', description: 'GST (GMT+4)' },
                          { value: 'Asia/Tokyo', label: 'Tokyo', description: 'JST (GMT+9)' },
                          { value: 'Australia/Sydney', label: 'Sydney', description: 'AEST (GMT+10)' }
                        ]}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-base font-medium mb-2 block">Date Format</Label>
                        <Select value={dateFormat} onValueChange={handleDateFormatChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select date format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (EU)</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-base font-medium mb-2 block">Time Format</Label>
                        <Select value={timeFormat} onValueChange={handleTimeFormatChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                            <SelectItem value="24h">24-hour</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* Notifications Section */}
                {activePreferenceSection === 'notifications' && (
                  <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Notifications</CardTitle>
                        <CardDescription>Configure your notification preferences</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-base font-medium mb-3 block">Email Notifications</Label>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">New Lead Notifications</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when new leads are assigned to you</p>
                          </div>
                          <Switch 
                            checked={notifications.newLeads}
                            onCheckedChange={() => handleNotificationToggle('newLeads')}
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Task Reminders</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Receive reminders for upcoming tasks</p>
                          </div>
                          <Switch 
                            checked={notifications.taskReminders}
                            onCheckedChange={() => handleNotificationToggle('taskReminders')}
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Weekly Reports</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Get weekly performance summaries</p>
                          </div>
                          <Switch 
                            checked={notifications.weeklyReports}
                            onCheckedChange={() => handleNotificationToggle('weeklyReports')}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium mb-3 block">Interface Notifications</Label>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Real-time Updates</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Show live updates in the interface</p>
                          </div>
                          <Switch 
                            checked={notifications.realTimeUpdates}
                            onCheckedChange={() => handleNotificationToggle('realTimeUpdates')}
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Sound Alerts</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Play sounds for important notifications</p>
                          </div>
                          <Switch 
                            checked={notifications.soundAlerts}
                            onCheckedChange={() => handleNotificationToggle('soundAlerts')}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* Privacy Section */}
                {activePreferenceSection === 'privacy' && (
                  <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Privacy & Data</CardTitle>
                        <CardDescription>Manage your data preferences and privacy settings</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-base font-medium mb-2 block">Data Export</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Download your data in various formats</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export as CSV
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export as JSON
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium mb-3 block">Analytics & Tracking</Label>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Usage Analytics</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Help us improve by sharing usage data</p>
                          </div>
                          <Switch 
                            checked={notifications.usageAnalytics}
                            onCheckedChange={() => handleNotificationToggle('usageAnalytics')}
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Performance Monitoring</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Monitor application performance</p>
                          </div>
                          <Switch 
                            checked={notifications.performanceMonitoring}
                            onCheckedChange={() => handleNotificationToggle('performanceMonitoring')}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )}
              </div>
            </div>
            
            {/* Save Button */}
            <div className="flex justify-end mt-6">
              <Button 
                onClick={() => handleSaveSettings({
                  ...settings
                })}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Preferences
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <PasswordChange 
            onSuccess={() => {
              toast({
                title: "Password Updated",
                description: "Your password has been changed successfully.",
                variant: "default",
              });
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Invite User Modal */}
      <DialogRoot open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>Send an invitation to join your team</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="colleague@company.com"
              />
            </div>
            <div>
              <Label htmlFor="invite-role">Role</Label>
              <SelectWithSearch
                value={inviteData.role}
                onValueChange={(value) => setInviteData(prev => ({ ...prev, role: value }))}
                placeholder="Select role"
                searchPlaceholder="Search roles..."
                items={[
                  { 
                    value: 'agent', 
                    label: 'Agent', 
                    description: 'Can manage leads and tasks',
                    icon: <User className="h-4 w-4" />
                  },
                  { 
                    value: 'team_leader', 
                    label: 'Team Leader', 
                    description: 'Can manage team members and reports',
                    icon: <Users className="h-4 w-4" />
                  },
                  { 
                    value: 'admin', 
                    label: 'Admin', 
                    description: 'Full system access and management',
                    icon: <Shield className="h-4 w-4" />
                  }
                ]}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>Cancel</Button>
            <Button onClick={handleInviteMember}>Send Invitation</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Permissions Modal */}
      <DialogRoot open={showPermissionModal} onOpenChange={setShowPermissionModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Permissions - {selectedMember?.full_name}</DialogTitle>
            <DialogDescription>Configure what this user can access and modify</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(
              permissions.reduce((acc, permission) => {
                if (!acc[permission.category]) acc[permission.category] = [];
                acc[permission.category].push(permission);
                return acc;
              }, {} as Record<string, Permission[]>)
            ).map(([category, perms]) => (
              <div key={category}>
                <h3 className="font-semibold mb-2">{category}</h3>
                <div className="space-y-2">
                  {perms.map((permission) => (
                    <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{permission.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{permission.description}</p>
                      </div>
                      <Switch
                        checked={permission.granted}
                        onCheckedChange={(checked: boolean) => {
                          setPermissions(prev => 
                            prev.map(p => p.id === permission.id ? { ...p, granted: checked } : p)
                          );
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPermissionModal(false)}>Cancel</Button>
            <Button onClick={() => selectedMember && handleUpdatePermissions(selectedMember.id, permissions.filter(p => p.granted).map(p => p.id))}>
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={() => handleSaveSettings(settings)} 
          disabled={loading} 
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
      </div>

      {/* Debug modal states */}
      {(() => {
        console.log('Modal states:', { showCropModal, showConfirmModal, selectedImageFile: !!selectedImageFile, croppedImageFile: !!croppedImageFile });
        return null;
      })()}

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={showCropModal}
        onClose={handleCloseModals}
        onConfirm={handleCropComplete}
        imageFile={selectedImageFile}
        aspectRatio={1}
        title="Crop Profile Image"
        description="Adjust your image to create the perfect profile picture"
      />

      {/* Confirm Upload Modal */}
      <ConfirmUploadModal
        isOpen={showConfirmModal}
        onClose={handleCloseModals}
        onConfirm={handleUploadConfirm}
        imageUrl={croppedImageFile ? URL.createObjectURL(croppedImageFile) : ''}
        fileName={croppedImageFile?.name || ''}
        fileSize={croppedImageFile ? `${(croppedImageFile.size / 1024 / 1024).toFixed(2)} MB` : ''}
        isUploading={isUploading}
      />
    </div>
  );
};

export default Settings; 