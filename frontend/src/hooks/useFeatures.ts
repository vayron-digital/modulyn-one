import { useTenant } from '../contexts/TenantContext';

export type FeatureFlags = {
  dashboard: boolean;
  leads: boolean;
  properties: boolean;
  chat: boolean;
  notifications: boolean;
  team: boolean;
  calendar: boolean;
  cold_calls: boolean;
  tasks: boolean;
  settings: boolean;
  extensions: boolean;
};

export interface FeaturesWithTrial extends FeatureFlags {
  trialActive: boolean;
  trialDaysLeft: number;
  trialEnds: Date | null;
  trialStart: Date | null;
  [key: string]: any;
}

export function useFeatures(): FeaturesWithTrial {
  const { tenant } = useTenant();
  const featureFlags = tenant?.feature_flags || {};
  const now = new Date();
  const trialStart = tenant?.trial_start ? new Date(tenant.trial_start) : null;
  const trialEnds = tenant?.trial_ends ? new Date(tenant.trial_ends) : null;
  const trialActive = trialEnds ? now < trialEnds : false;
  const trialDaysLeft = trialEnds ? Math.max(0, Math.ceil((trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;
  return {
    dashboard: featureFlags.dashboard !== false,
    leads: featureFlags.leads !== false,
    properties: featureFlags.properties !== false,
    chat: featureFlags.chat !== false,
    notifications: featureFlags.notifications !== false,
    team: featureFlags.team !== false,
    calendar: featureFlags.calendar !== false,
    cold_calls: featureFlags.cold_calls !== false,
    tasks: featureFlags.tasks !== false,
    settings: featureFlags.settings !== false,
    extensions: featureFlags.extensions !== false,
    trialActive,
    trialDaysLeft,
    trialEnds,
    trialStart,
  };
} 