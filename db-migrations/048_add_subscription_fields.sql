-- Migration: Add subscription fields to tenants table for FastSpring integration
-- Purpose: Support subscription management with FastSpring
-- Date: 2024-12-19

-- Add subscription fields to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS trial_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_ends TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(100) DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS fastspring_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS billing_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS billing_address JSONB,
ADD COLUMN IF NOT EXISTS payment_method JSONB,
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_metadata JSONB DEFAULT '{}';

-- Create subscription_events table for tracking FastSpring webhooks
CREATE TABLE IF NOT EXISTS subscription_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_id VARCHAR(255) UNIQUE NOT NULL,
    fastspring_order_id VARCHAR(255),
    fastspring_subscription_id VARCHAR(255),
    customer_id VARCHAR(255),
    product_id VARCHAR(255),
    status VARCHAR(50),
    amount DECIMAL(10, 2),
    currency VARCHAR(3),
    event_data JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create subscription_plans table for managing different plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_cycle VARCHAR(20) DEFAULT 'monthly',
    trial_days INTEGER DEFAULT 14,
    max_users INTEGER,
    max_leads INTEGER,
    max_properties INTEGER,
    features JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default subscription plans
INSERT INTO subscription_plans (plan_id, name, description, price, currency, billing_cycle, trial_days, max_users, max_leads, max_properties, features) VALUES
('modulyn-one-plus', 'Modulyn One+', 'Full-featured CRM for growing teams', 9.00, 'USD', 'monthly', 14, 10, 1000, 500, '{"cold_calls": true, "chat": true, "documents": true, "advanced_analytics": true, "priority_support": true}'),
('modulyn-one-pro', 'Modulyn One Pro', 'Enterprise-grade CRM with unlimited features', 29.00, 'USD', 'monthly', 14, -1, -1, -1, '{"cold_calls": true, "chat": true, "documents": true, "advanced_analytics": true, "priority_support": true, "white_label": true, "api_access": true}'),
('modulyn-one-starter', 'Modulyn One Starter', 'Perfect for small teams getting started', 0.00, 'USD', 'monthly', 14, 3, 100, 50, '{"cold_calls": true, "chat": false, "documents": false, "advanced_analytics": false, "priority_support": false}')
ON CONFLICT (plan_id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_status ON tenants(subscription_status);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_id ON tenants(subscription_id);
CREATE INDEX IF NOT EXISTS idx_tenants_fastspring_customer_id ON tenants(fastspring_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_tenant_id ON subscription_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_event_type ON subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_events_processed ON subscription_events(processed);

-- Add trigger for subscription_plans updated_at
CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update tenant subscription status
CREATE OR REPLACE FUNCTION update_tenant_subscription(
    p_tenant_id UUID,
    p_subscription_status VARCHAR(50),
    p_subscription_plan VARCHAR(100),
    p_fastspring_subscription_id VARCHAR(255),
    p_fastspring_customer_id VARCHAR(255)
) RETURNS void AS $$
BEGIN
    UPDATE tenants 
    SET 
        subscription_status = p_subscription_status,
        subscription_plan = p_subscription_plan,
        subscription_id = p_fastspring_subscription_id,
        fastspring_customer_id = p_fastspring_customer_id,
        is_paid = CASE 
            WHEN p_subscription_status IN ('active', 'trialing') THEN TRUE
            ELSE FALSE
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_tenant_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get subscription plan details
CREATE OR REPLACE FUNCTION get_subscription_plan(p_plan_id VARCHAR(100))
RETURNS TABLE (
    plan_id VARCHAR(100),
    name VARCHAR(255),
    description TEXT,
    price DECIMAL(10, 2),
    currency VARCHAR(3),
    billing_cycle VARCHAR(20),
    trial_days INTEGER,
    max_users INTEGER,
    max_leads INTEGER,
    max_properties INTEGER,
    features JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.plan_id,
        sp.name,
        sp.description,
        sp.price,
        sp.currency,
        sp.billing_cycle,
        sp.trial_days,
        sp.max_users,
        sp.max_leads,
        sp.max_properties,
        sp.features
    FROM subscription_plans sp
    WHERE sp.plan_id = p_plan_id AND sp.is_active = TRUE;
END;
$$ LANGUAGE plpgsql;
