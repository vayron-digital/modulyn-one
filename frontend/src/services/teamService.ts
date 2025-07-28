import { supabase } from '../lib/supabase';

export interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_admin: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  profile_image_url?: string;
  permissions?: string[];
}

export interface InvitationData {
  email: string;
  role: string;
  permissions: string[];
}

export interface PermissionUpdate {
  userId: string;
  permissions: string[];
}

export class TeamService {
  // Fetch all team members
  static async getTeamMembers(): Promise<TeamMember[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          role,
          is_admin,
          status,
          created_at,
          profile_image_url,
          user_permissions(permissions)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(member => ({
        ...member,
        permissions: member.user_permissions?.permissions || []
      }));
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  }

  // Invite a new team member
  static async inviteMember(invitationData: InvitationData): Promise<{ success: boolean; message: string }> {
    try {
      // Create invitation in database
      const { data, error } = await supabase
        .rpc('create_user_invitation', {
          p_email: invitationData.email,
          p_role: invitationData.role
        });

      if (error) throw error;

      // TODO: Send invitation email
      // This would integrate with your email service (SendGrid, AWS SES, etc.)
      await this.sendInvitationEmail(invitationData.email, invitationData.role);

      return {
        success: true,
        message: `Invitation sent to ${invitationData.email}`
      };
    } catch (error) {
      console.error('Error inviting member:', error);
      throw error;
    }
  }

  // Update user permissions
  static async updateUserPermissions(permissionUpdate: PermissionUpdate): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_permissions')
        .upsert({
          user_id: permissionUpdate.userId,
          permissions: permissionUpdate.permissions,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating permissions:', error);
      throw error;
    }
  }

  // Update user role
  static async updateUserRole(userId: string, newRole: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          role: newRole,
          is_admin: newRole === 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  // Deactivate user
  static async deactivateUser(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  }

  // Reactivate user
  static async reactivateUser(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error reactivating user:', error);
      throw error;
    }
  }

  // Get user permissions
  static async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permissions')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data?.permissions || [];
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      throw error;
    }
  }

  // Get team hierarchy
  static async getTeamHierarchy(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('team_hierarchy')
        .select(`
          id,
          user_id,
          reporting_to,
          team_id,
          position,
          level,
          user:profiles!user_id (
            full_name,
            role,
            designation
          ),
          team:teams!team_id (
            name
          )
        `)
        .order('level');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching team hierarchy:', error);
      throw error;
    }
  }

  // Get team statistics
  static async getTeamStats(): Promise<{
    totalMembers: number;
    activeMembers: number;
    admins: number;
    pendingInvitations: number;
  }> {
    try {
      const [members, invitations] = await Promise.all([
        this.getTeamMembers(),
        this.getPendingInvitations()
      ]);

      return {
        totalMembers: members.length,
        activeMembers: members.filter(m => m.status === 'active').length,
        admins: members.filter(m => m.is_admin).length,
        pendingInvitations: invitations.length
      };
    } catch (error) {
      console.error('Error fetching team stats:', error);
      throw error;
    }
  }

  // Get pending invitations
  static async getPendingInvitations(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
      throw error;
    }
  }

  // Cancel invitation
  static async cancelInvitation(invitationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error canceling invitation:', error);
      throw error;
    }
  }

  // Resend invitation
  static async resendInvitation(invitationId: string): Promise<void> {
    try {
      // Get invitation details
      const { data: invitation, error: fetchError } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (fetchError) throw fetchError;

      // Update expiration
      const { error: updateError } = await supabase
        .from('user_invitations')
        .update({
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
        .eq('id', invitationId);

      if (updateError) throw updateError;

      // Resend email
      await this.sendInvitationEmail(invitation.email, invitation.role);
    } catch (error) {
      console.error('Error resending invitation:', error);
      throw error;
    }
  }

  // Private method to send invitation email
  private static async sendInvitationEmail(email: string, role: string): Promise<void> {
    // TODO: Implement email sending logic
    // This would integrate with your email service
    console.log(`Sending invitation email to ${email} for role ${role}`);
    
    // Example implementation:
    // await emailService.send({
    //   to: email,
    //   subject: 'You\'ve been invited to join our team',
    //   template: 'team-invitation',
    //   data: { role, invitationUrl: `${process.env.REACT_APP_URL}/invite?token=${token}` }
    // });
  }

  // Search team members
  static async searchTeamMembers(query: string): Promise<TeamMember[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          role,
          is_admin,
          status,
          created_at,
          profile_image_url
        `)
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .order('full_name');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error searching team members:', error);
      throw error;
    }
  }

  // Get user activity
  static async getUserActivity(userId: string, days: number = 30): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching user activity:', error);
      throw error;
    }
  }
} 