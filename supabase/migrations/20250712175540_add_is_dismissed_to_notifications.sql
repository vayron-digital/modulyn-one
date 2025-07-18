ALTER TABLE public.notifications
ADD COLUMN is_dismissed boolean NOT NULL DEFAULT false;
