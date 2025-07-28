# Settings Page - Comprehensive Features Guide

## Overview

The Settings page has been completely redesigned with comprehensive role-based access control, team management, and integration capabilities. It maintains UI consistency with the Dashboard, Leads, Calls, and Tasks pages while providing granular control over user permissions and system configuration.

## 🎯 Key Features

### 1. **Role-Based Access Control**
- **Owner**: Full system access, can manage all users and permissions
- **Admin**: Can manage users, teams, and integrations
- **Agent**: Basic profile and preference management
- **Granular Permissions**: Discord-like permission system for fine-grained control

### 2. **User Management**
- Invite new team members with role assignment
- Manage user roles and permissions
- View user activity and statistics
- Deactivate/reactivate users
- Search and filter team members

### 3. **Team Management**
- Visual team hierarchy
- Team statistics and performance metrics
- Manage team structure and reporting relationships
- Bulk user operations

### 4. **Permission System**
- Category-based permissions (User Management, Data Access, Reports, System)
- Individual permission toggles
- Permission inheritance and role-based defaults
- Real-time permission updates

### 5. **Integrations**
- Third-party service connections (Slack, Zapier, Mailchimp, HubSpot, etc.)
- Integration status monitoring
- Configuration management
- Webhook and API key management

### 6. **Preferences & Settings**
- Profile management with image upload
- Currency and timezone settings
- Notification preferences
- Theme and UI customization

## 🏗️ Architecture

### Database Schema

```sql
-- User permissions table
CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    permissions JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Integrations table
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    integration_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    connected BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'inactive',
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, integration_id)
);

-- User invitations table
CREATE TABLE user_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'agent',
    invited_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(email, token)
);
```

### Services

#### `usePermissions` Hook
```typescript
const {
  permissions,
  featureFlags,
  can,
  canAccess,
  isAdmin,
  isOwner,
  canManageUsers,
  canManageTeam,
  // ... more permission checks
} = usePermissions();
```

#### `TeamService`
```typescript
// Invite team member
await TeamService.inviteMember({
  email: 'user@company.com',
  role: 'agent',
  permissions: ['view_all_leads', 'edit_all_leads']
});

// Update permissions
await TeamService.updateUserPermissions({
  userId: 'user-id',
  permissions: ['user_management', 'team_management']
});
```

#### `IntegrationService`
```typescript
// Connect integration
await IntegrationService.connectIntegration(
  userId,
  'slack',
  { apiKey: 'xoxb-...', channel: '#general' }
);

// Test connection
const test = await IntegrationService.testConnection('slack', config);
```

## 🎨 UI Components

### Settings Tabs
- **Profile**: Personal information and avatar
- **Users**: Team member management (Admin+)
- **Teams**: Team structure and hierarchy (Admin+)
- **Permissions**: Granular permission control (Owner)
- **Integrations**: Third-party service connections
- **Preferences**: System and UI preferences

### Permission Categories

#### User Management
- `user_management`: Create, edit, and delete users
- `team_management`: Manage team structure and hierarchy
- `role_assignment`: Assign roles and permissions to users

#### Data Access
- `view_all_leads`: Access to all leads in the system
- `edit_all_leads`: Modify any lead information
- `delete_leads`: Remove leads from the system

#### Reports & Analytics
- `view_reports`: Access to all reports and analytics
- `export_data`: Export data in various formats
- `view_analytics`: Access to advanced analytics

#### System Settings
- `system_settings`: Modify system-wide settings
- `integrations`: Configure third-party integrations
- `backup_restore`: Manage data backup and restoration

## 🔧 Integration Support

### Supported Integrations

| Integration | Purpose | Configuration |
|-------------|---------|---------------|
| **Slack** | Team communication and notifications | API Key, Channel |
| **Zapier** | Workflow automation | Webhook URL |
| **Mailchimp** | Email marketing and campaigns | API Key, List ID |
| **HubSpot** | CRM and marketing automation | API Key, Portal ID |
| **Google Calendar** | Calendar integration and scheduling | OAuth2 |
| **Stripe** | Payment processing and billing | API Keys |

### Integration Features
- Connection testing and validation
- Configuration management
- Status monitoring
- Webhook management
- Data synchronization

## 🚀 Usage Examples

### Inviting a Team Member
```typescript
// In Settings component
const handleInviteMember = async () => {
  try {
    await TeamService.inviteMember({
      email: 'newuser@company.com',
      role: 'agent',
      permissions: ['view_all_leads']
    });
    
    toast({
      title: "Success",
      description: "Invitation sent successfully"
    });
  } catch (error) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive"
    });
  }
};
```

### Managing Permissions
```typescript
// Update user permissions
const handleUpdatePermissions = async (userId: string, permissions: string[]) => {
  try {
    await TeamService.updateUserPermissions({
      userId,
      permissions
    });
    
    toast({
      title: "Success",
      description: "Permissions updated successfully"
    });
  } catch (error) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive"
    });
  }
};
```

### Connecting Integrations
```typescript
// Connect Slack integration
const handleConnectSlack = async () => {
  try {
    await IntegrationService.connectIntegration(
      user.id,
      'slack',
      {
        apiKey: 'xoxb-your-token',
        channel: '#general'
      }
    );
    
    toast({
      title: "Success",
      description: "Slack connected successfully"
    });
  } catch (error) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive"
    });
  }
};
```

## 🔒 Security & Permissions

### Row Level Security (RLS)
All tables have RLS policies ensuring users can only access data they're authorized to see:

```sql
-- Example RLS policy for user_permissions
CREATE POLICY "Users can view their own permissions"
    ON user_permissions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all permissions"
    ON user_permissions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    ));
```

### Permission Inheritance
- **Owner**: Inherits all permissions
- **Admin**: Inherits most permissions except system-level settings
- **Agent**: Basic permissions only
- **Custom**: Granular permission assignment

## 📱 Responsive Design

The Settings page is fully responsive and maintains consistency across:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

### Mobile Optimizations
- Collapsible tabs for better navigation
- Touch-friendly permission toggles
- Optimized table layouts
- Simplified integration cards

## 🎯 Future Enhancements

### Planned Features
1. **Advanced Analytics Dashboard** for team performance
2. **Bulk Permission Management** for efficient team administration
3. **Integration Templates** for common workflows
4. **Audit Logging** for permission changes
5. **Custom Role Creation** with permission templates
6. **API Rate Limiting** for integrations
7. **Two-Factor Authentication** for admin accounts

### Integration Roadmap
- **Microsoft Teams** integration
- **Salesforce** CRM integration
- **Google Workspace** integration
- **Zoom** meeting integration
- **Trello** project management
- **GitHub** development integration

## 🐛 Troubleshooting

### Common Issues

#### Permission Not Working
1. Check if user has the required role
2. Verify permission is granted in database
3. Clear browser cache and reload
4. Check RLS policies

#### Integration Connection Failed
1. Verify API keys are correct
2. Check network connectivity
3. Validate integration configuration
4. Review integration logs

#### User Invitation Not Received
1. Check email spam folder
2. Verify email address is correct
3. Resend invitation if expired
4. Check email service configuration

## 📚 API Reference

### TeamService Methods
- `getTeamMembers()`: Fetch all team members
- `inviteMember(data)`: Send team invitation
- `updateUserPermissions(data)`: Update user permissions
- `updateUserRole(userId, role)`: Change user role
- `deactivateUser(userId)`: Deactivate user account
- `getTeamStats()`: Get team statistics

### IntegrationService Methods
- `getUserIntegrations(userId)`: Get user integrations
- `connectIntegration(userId, integrationId, config)`: Connect integration
- `disconnectIntegration(userId, integrationId)`: Disconnect integration
- `testConnection(integrationId, config)`: Test integration connection
- `syncData(integrationId, data)`: Sync data with external service

### usePermissions Hook
- `can(permissionId)`: Check specific permission
- `canAccess(feature)`: Check feature access
- `isAdmin()`: Check admin status
- `isOwner()`: Check owner status
- `refreshPermissions()`: Refresh permission data

---

This comprehensive Settings system provides enterprise-grade user management, permission control, and integration capabilities while maintaining the clean, modern UI that users expect from the CRM platform. 