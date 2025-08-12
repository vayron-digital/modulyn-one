
-- Helper functions

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = user_id AND profiles.is_admin = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_team_id(user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  team_id uuid;
BEGIN
  SELECT t.id INTO team_id
  FROM public.teams t
  JOIN public.team_members tm ON t.id = tm.team_id
  WHERE tm.user_id = get_user_team_id.user_id;
  RETURN team_id;
END;
$$;

-- Create missing tables

CREATE TABLE IF NOT EXISTS public.activity_log (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    type text,
    user_id uuid,
    details jsonb,
    tenant_id uuid
);

CREATE TABLE IF NOT EXISTS public.events (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    event_name character varying,
    user_id uuid,
    metadata jsonb,
    is_dismissed boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.presence (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    last_seen timestamp with time zone,
    tenant_id uuid,
    status text
);

CREATE TABLE IF NOT EXISTS public.task_comments (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    task_id uuid,
    user_id uuid,
    comment text,
    tenant_id uuid
);

-- Add missing columns and fix existing tables

ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS is_dumped boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS cold_call_id uuid,
    ADD COLUMN IF NOT EXISTS meeting_date timestamp with time zone,
    ADD COLUMN IF NOT EXISTS meeting_notes text,
    ADD COLUMN IF NOT EXISTS meeting_outcome text;

ALTER TABLE public.properties
    ADD COLUMN IF NOT EXISTS amenities text[],
    ADD COLUMN IF NOT EXISTS built_up_area numeric,
    ADD COLUMN IF NOT EXISTS is_rented boolean,
    ADD COLUMN IF NOT EXISTS is_exclusive boolean,
    ADD COLUMN IF NOT EXISTS is_managed boolean,
    ADD COLUMN IF NOT EXISTS is_short_term boolean,
    ADD COLUMN IF NOT EXISTS is_furnished boolean,
    ADD COLUMN IF NOT EXISTS is_fitted boolean,
    ADD COLUMN IF NOT EXISTS is_retail boolean,
    ADD COLUMN IF NOT EXISTS is_shell_and_core boolean,
    ADD COLUMN IF NOT EXISTS rental_price numeric,
    ADD COLUMN IF NOT EXISTS rental_period text,
    ADD COLUMN IF NOT EXISTS rental_commission numeric,
    ADD COLUMN IF NOT EXISTS security_deposit numeric,
    ADD COLUMN IF NOT EXISTS maintenance_fee numeric,
    ADD COLUMN IF NOT EXISTS other_fees jsonb,
    ADD COLUMN IF NOT EXISTS tenant_information jsonb,
    ADD COLUMN IF NOT EXISTS lease_start_date date,
    ADD COLUMN IF NOT EXISTS lease_end_date date,
    ADD COLUMN IF NOT EXISTS next_renewal_date date,
    ADD COLUMN IF NOT EXISTS rent_payment_schedule jsonb,
    ADD COLUMN IF NOT EXISTS is_vat_applicable boolean,
    ADD COLUMN IF NOT EXISTS vat_amount numeric,
    ADD COLUMN IF NOT EXISTS is_sold boolean,
    ADD COLUMN IF NOT EXISTS sale_price numeric,
    ADD COLUMN IF NOT EXISTS sale_date date,
    ADD COLUMN IF NOT EXISTS buyer_information jsonb,
    ADD COLUMN IF NOT EXISTS sale_commission numeric,
    ADD COLUMN IF NOT EXISTS is_mortgaged boolean,
    ADD COLUMN IF NOT EXISTS mortgage_details jsonb;

ALTER TABLE public.tasks
    ADD COLUMN IF NOT EXISTS related_to text,
    ADD COLUMN IF NOT EXISTS related_id uuid;

ALTER TABLE public.cold_calls
    ADD COLUMN IF NOT EXISTS meeting_date timestamp with time zone,
    ADD COLUMN IF NOT EXISTS meeting_notes text,
    ADD COLUMN IF NOT EXISTS meeting_outcome text;

-- Fix RLS Policies

ALTER TABLE public.brochures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.brochures FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.brochures FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for users based on user_id" ON public.brochures FOR UPDATE USING (auth.uid() = uploaded_by) WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Enable delete for users based on user_id" ON public.brochures FOR DELETE USING (auth.uid() = uploaded_by);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable full access to admins" ON public.leads FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Enable access to assigned leads" ON public.leads FOR ALL USING (auth.uid() = assigned_to) WITH CHECK (auth.uid() = assigned_to);
CREATE POLICY "Enable access to team leads" ON public.leads FOR SELECT USING (get_user_team_id(auth.uid()) = get_user_team_id(assigned_to));

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable update for own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable delete for own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable full access for admins" ON public.tasks FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Enable access to assigned tasks" ON public.tasks FOR ALL USING (auth.uid() = assigned_to) WITH CHECK (auth.uid() = assigned_to);
CREATE POLICY "Enable access to own tasks" ON public.tasks FOR ALL USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Enable team access" ON public.tasks FOR SELECT USING (get_user_team_id(auth.uid()) = get_user_team_id(assigned_to));

-- Ensure notifications schema in case it's missing
CREATE SCHEMA IF NOT EXISTS notifications;
GRANT USAGE ON SCHEMA notifications TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA notifications GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA notifications GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA notifications GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
