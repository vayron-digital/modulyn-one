import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  granted: boolean;
}

export interface FeatureFlags {
  dashboard: boolean;
  leads: boolean;
  properties: boolean;
  tasks: boolean;
  calls: boolean;
  team: boolean;
  reports: boolean;
  settings: boolean;
  documents: boolean;
  chat: boolean;
  cold_calls: boolean;
  scheduler: boolean;
  user_management: boolean;
  team_management: boolean;
  integrations: boolean;
  analytics: boolean;
}

export const usePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
    dashboard: true,
    leads: true,
    properties: true,
    tasks: true,
    calls: true,
    team: false,
    reports: false,
    settings: true,
    documents: false,
    chat: true,
    cold_calls: false,
    scheduler: true,
    user_management: false,
    team_management: false,
    integrations: true,
    analytics: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchPermissions();
    }
  }, [user?.id]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      
      // Fetch user permissions from database
      const { data: userPermissions, error } = await supabase
        .from('user_permissions')
        .select('permissions')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching permissions:', error);
      }

      // If no permissions found, set default based on role
      if (!userPermissions?.permissions) {
        setDefaultPermissions();
      } else {
        setPermissions(userPermissions.permissions);
        updateFeatureFlags(userPermissions.permissions);
      }
    } catch (error) {
      console.error('Error in fetchPermissions:', error);
      setDefaultPermissions();
    } finally {
      setLoading(false);
    }
  };

  const setDefaultPermissions = () => {
    const isAdmin = user?.is_admin || user?.role === 'admin';
    const isOwner = user?.role === 'owner';
    
    const defaultPermissions: Permission[] = [
      // User Management
      { id: 'user_management', name: 'User Management', description: 'Create, edit, and delete users', category: 'User Management', granted: isAdmin || isOwner },
      { id: 'team_management', name: 'Team Management', description: 'Manage team structure and hierarchy', category: 'User Management', granted: isAdmin || isOwner },
      { id: 'role_assignment', name: 'Role Assignment', description: 'Assign roles and permissions to users', category: 'User Management', granted: isOwner },
      
      // Data Access
      { id: 'view_all_leads', name: 'View All Leads', description: 'Access to all leads in the system', category: 'Data Access', granted: isAdmin || isOwner },
      { id: 'edit_all_leads', name: 'Edit All Leads', description: 'Modify any lead information', category: 'Data Access', granted: isAdmin || isOwner },
      { id: 'delete_leads', name: 'Delete Leads', description: 'Remove leads from the system', category: 'Data Access', granted: isOwner },
      
      // Reports & Analytics
      { id: 'view_reports', name: 'View Reports', description: 'Access to all reports and analytics', category: 'Reports', granted: isAdmin || isOwner },
      { id: 'export_data', name: 'Export Data', description: 'Export data in various formats', category: 'Reports', granted: isAdmin || isOwner },
      { id: 'view_analytics', name: 'View Analytics', description: 'Access to advanced analytics', category: 'Reports', granted: isAdmin || isOwner },
      
      // System Settings
      { id: 'system_settings', name: 'System Settings', description: 'Modify system-wide settings', category: 'System', granted: isOwner },
      { id: 'integrations', name: 'Manage Integrations', description: 'Configure third-party integrations', category: 'System', granted: isAdmin || isOwner },
      { id: 'backup_restore', name: 'Backup & Restore', description: 'Manage data backup and restoration', category: 'System', granted: isOwner },
    ];

    setPermissions(defaultPermissions);
    updateFeatureFlags(defaultPermissions);
  };

  const updateFeatureFlags = (perms: Permission[]) => {
    const flags: FeatureFlags = {
      dashboard: true, // Always accessible
      leads: hasPermission(perms, 'view_all_leads'),
      properties: true, // Basic access for all
      tasks: true, // Basic access for all
      calls: true, // Basic access for all
      team: hasPermission(perms, 'team_management'),
      reports: hasPermission(perms, 'view_reports'),
      settings: true, // Always accessible
      documents: true, // Basic access for all
      chat: true, // Basic access for all
      cold_calls: hasPermission(perms, 'view_all_leads'),
      scheduler: true, // Basic access for all
      user_management: hasPermission(perms, 'user_management'),
      team_management: hasPermission(perms, 'team_management'),
      integrations: hasPermission(perms, 'integrations'),
      analytics: hasPermission(perms, 'view_analytics'),
    };

    setFeatureFlags(flags);
  };

  const hasPermission = (perms: Permission[], permissionId: string): boolean => {
    return perms.some(p => p.id === permissionId && p.granted);
  };

  const can = (permissionId: string): boolean => {
    return hasPermission(permissions, permissionId);
  };

  const canAccess = (feature: keyof FeatureFlags): boolean => {
    return featureFlags[feature];
  };

  const isAdmin = (): boolean => {
    return user?.is_admin || user?.role === 'admin';
  };

  const isOwner = (): boolean => {
    return user?.role === 'owner';
  };

  const canManageUsers = (): boolean => {
    return can('user_management');
  };

  const canManageTeam = (): boolean => {
    return can('team_management');
  };

  const canViewAllLeads = (): boolean => {
    return can('view_all_leads');
  };

  const canEditAllLeads = (): boolean => {
    return can('edit_all_leads');
  };

  const canDeleteLeads = (): boolean => {
    return can('delete_leads');
  };

  const canViewReports = (): boolean => {
    return can('view_reports');
  };

  const canExportData = (): boolean => {
    return can('export_data');
  };

  const canViewAnalytics = (): boolean => {
    return can('view_analytics');
  };

  const canManageIntegrations = (): boolean => {
    return can('integrations');
  };

  const canManageSystemSettings = (): boolean => {
    return can('system_settings');
  };

  return {
    permissions,
    featureFlags,
    loading,
    can,
    canAccess,
    isAdmin,
    isOwner,
    canManageUsers,
    canManageTeam,
    canViewAllLeads,
    canEditAllLeads,
    canDeleteLeads,
    canViewReports,
    canExportData,
    canViewAnalytics,
    canManageIntegrations,
    canManageSystemSettings,
    refreshPermissions: fetchPermissions,
  };
}; 