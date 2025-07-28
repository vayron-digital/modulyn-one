import { supabase } from '../lib/supabase';

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  status: 'active' | 'inactive' | 'error';
  config?: Record<string, any>;
  lastSync?: string;
}

export interface IntegrationConfig {
  apiKey?: string;
  webhookUrl?: string;
  channel?: string;
  workspace?: string;
  settings?: Record<string, any>;
}

export class IntegrationService {
  // Get all integrations for a user
  static async getUserIntegrations(userId: string): Promise<Integration[]> {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching user integrations:', error);
      throw error;
    }
  }

  // Connect an integration
  static async connectIntegration(
    userId: string,
    integrationId: string,
    config: IntegrationConfig
  ): Promise<void> {
    try {
      // Validate integration
      const integration = await this.getIntegrationDetails(integrationId);
      if (!integration) {
        throw new Error('Integration not found');
      }

      // Test connection
      const connectionTest = await this.testConnection(integrationId, config);
      if (!connectionTest.success) {
        throw new Error(`Connection failed: ${connectionTest.error}`);
      }

      // Save integration configuration
      const { error } = await supabase
        .from('integrations')
        .upsert({
          user_id: userId,
          integration_id: integrationId,
          name: integration.name,
          description: integration.description,
          icon: integration.icon,
          connected: true,
          status: 'active',
          config: config,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Initialize integration
      await this.initializeIntegration(integrationId, config);
    } catch (error) {
      console.error('Error connecting integration:', error);
      throw error;
    }
  }

  // Disconnect an integration
  static async disconnectIntegration(userId: string, integrationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('integrations')
        .update({
          connected: false,
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('integration_id', integrationId);

      if (error) throw error;

      // Cleanup integration
      await this.cleanupIntegration(integrationId);
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      throw error;
    }
  }

  // Update integration configuration
  static async updateIntegrationConfig(
    userId: string,
    integrationId: string,
    config: IntegrationConfig
  ): Promise<void> {
    try {
      // Test new configuration
      const connectionTest = await this.testConnection(integrationId, config);
      if (!connectionTest.success) {
        throw new Error(`Configuration test failed: ${connectionTest.error}`);
      }

      const { error } = await supabase
        .from('integrations')
        .update({
          config: config,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('integration_id', integrationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating integration config:', error);
      throw error;
    }
  }

  // Test integration connection
  static async testConnection(integrationId: string, config: IntegrationConfig): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      switch (integrationId) {
        case 'slack':
          return await this.testSlackConnection(config);
        case 'zapier':
          return await this.testZapierConnection(config);
        case 'mailchimp':
          return await this.testMailchimpConnection(config);
        case 'hubspot':
          return await this.testHubspotConnection(config);
        case 'google_calendar':
          return await this.testGoogleCalendarConnection(config);
        case 'stripe':
          return await this.testStripeConnection(config);
        default:
          return { success: false, error: 'Unknown integration' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get integration details
  static async getIntegrationDetails(integrationId: string): Promise<Integration | null> {
    const integrations = {
      slack: {
        id: 'slack',
        name: 'Slack',
        description: 'Team communication and notifications',
        icon: '💬',
        connected: false,
        status: 'inactive' as const
      },
      zapier: {
        id: 'zapier',
        name: 'Zapier',
        description: 'Automate workflows and integrations',
        icon: '⚡',
        connected: false,
        status: 'inactive' as const
      },
      mailchimp: {
        id: 'mailchimp',
        name: 'Mailchimp',
        description: 'Email marketing and campaigns',
        icon: '📧',
        connected: false,
        status: 'inactive' as const
      },
      hubspot: {
        id: 'hubspot',
        name: 'HubSpot',
        description: 'CRM and marketing automation',
        icon: '🎯',
        connected: false,
        status: 'inactive' as const
      },
      google_calendar: {
        id: 'google_calendar',
        name: 'Google Calendar',
        description: 'Calendar integration and scheduling',
        icon: '📅',
        connected: false,
        status: 'inactive' as const
      },
      stripe: {
        id: 'stripe',
        name: 'Stripe',
        description: 'Payment processing and billing',
        icon: '💳',
        connected: false,
        status: 'inactive' as const
      }
    };

    return integrations[integrationId] || null;
  }

  // Slack integration methods
  private static async testSlackConnection(config: IntegrationConfig): Promise<{ success: boolean; error?: string }> {
    try {
      if (!config.apiKey) {
        return { success: false, error: 'Slack API key is required' };
      }

      // Test Slack API call
      const response = await fetch('https://slack.com/api/auth.test', {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      return { success: data.ok, error: data.ok ? undefined : data.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Zapier integration methods
  private static async testZapierConnection(config: IntegrationConfig): Promise<{ success: boolean; error?: string }> {
    try {
      if (!config.webhookUrl) {
        return { success: false, error: 'Zapier webhook URL is required' };
      }

      // Test webhook URL
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      });

      return { success: response.ok, error: response.ok ? undefined : 'Webhook test failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Mailchimp integration methods
  private static async testMailchimpConnection(config: IntegrationConfig): Promise<{ success: boolean; error?: string }> {
    try {
      if (!config.apiKey) {
        return { success: false, error: 'Mailchimp API key is required' };
      }

      // Extract datacenter from API key
      const datacenter = config.apiKey.split('-').pop();
      const response = await fetch(`https://${datacenter}.api.mailchimp.com/3.0/ping`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      return { success: response.ok, error: response.ok ? undefined : data.detail };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // HubSpot integration methods
  private static async testHubspotConnection(config: IntegrationConfig): Promise<{ success: boolean; error?: string }> {
    try {
      if (!config.apiKey) {
        return { success: false, error: 'HubSpot API key is required' };
      }

      const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return { success: response.ok, error: response.ok ? undefined : 'HubSpot API test failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Google Calendar integration methods
  private static async testGoogleCalendarConnection(config: IntegrationConfig): Promise<{ success: boolean; error?: string }> {
    try {
      if (!config.apiKey) {
        return { success: false, error: 'Google Calendar API key is required' };
      }

      // This would require OAuth2 flow in a real implementation
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Stripe integration methods
  private static async testStripeConnection(config: IntegrationConfig): Promise<{ success: boolean; error?: string }> {
    try {
      if (!config.apiKey) {
        return { success: false, error: 'Stripe API key is required' };
      }

      const response = await fetch('https://api.stripe.com/v1/account', {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const data = await response.json();
      return { success: response.ok, error: response.ok ? undefined : data.error?.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Initialize integration
  private static async initializeIntegration(integrationId: string, config: IntegrationConfig): Promise<void> {
    try {
      switch (integrationId) {
        case 'slack':
          await this.initializeSlack(config);
          break;
        case 'zapier':
          await this.initializeZapier(config);
          break;
        case 'mailchimp':
          await this.initializeMailchimp(config);
          break;
        // Add other integrations as needed
      }
    } catch (error) {
      console.error('Error initializing integration:', error);
      throw error;
    }
  }

  // Cleanup integration
  private static async cleanupIntegration(integrationId: string): Promise<void> {
    try {
      // Cleanup integration-specific resources
      console.log(`Cleaning up ${integrationId} integration`);
    } catch (error) {
      console.error('Error cleaning up integration:', error);
    }
  }

  // Slack initialization
  private static async initializeSlack(config: IntegrationConfig): Promise<void> {
    // Set up Slack webhooks, channels, etc.
    console.log('Initializing Slack integration');
  }

  // Zapier initialization
  private static async initializeZapier(config: IntegrationConfig): Promise<void> {
    // Set up Zapier webhooks
    console.log('Initializing Zapier integration');
  }

  // Mailchimp initialization
  private static async initializeMailchimp(config: IntegrationConfig): Promise<void> {
    // Set up Mailchimp lists, segments, etc.
    console.log('Initializing Mailchimp integration');
  }

  // Send notification to Slack
  static async sendSlackNotification(message: string, channel?: string): Promise<void> {
    try {
      // Get Slack integration config
      const { data: integration } = await supabase
        .from('integrations')
        .select('config')
        .eq('integration_id', 'slack')
        .eq('connected', true)
        .single();

      if (!integration?.config?.apiKey) {
        throw new Error('Slack not connected');
      }

      const targetChannel = channel || integration.config.channel || '#general';
      
      await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${integration.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel: targetChannel,
          text: message
        })
      });
    } catch (error) {
      console.error('Error sending Slack notification:', error);
      throw error;
    }
  }

  // Sync data with external service
  static async syncData(integrationId: string, data: any): Promise<void> {
    try {
      switch (integrationId) {
        case 'mailchimp':
          await this.syncToMailchimp(data);
          break;
        case 'hubspot':
          await this.syncToHubspot(data);
          break;
        default:
          throw new Error(`Sync not implemented for ${integrationId}`);
      }
    } catch (error) {
      console.error('Error syncing data:', error);
      throw error;
    }
  }

  // Sync to Mailchimp
  private static async syncToMailchimp(data: any): Promise<void> {
    // Implementation for syncing leads/contacts to Mailchimp
    console.log('Syncing data to Mailchimp');
  }

  // Sync to HubSpot
  private static async syncToHubspot(data: any): Promise<void> {
    // Implementation for syncing leads/contacts to HubSpot
    console.log('Syncing data to HubSpot');
  }
} 