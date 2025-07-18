-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID,
    event_type TEXT CHECK (event_type IN ('task', 'appointment', 'meeting')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('reminder', 'update', 'assignment', 'system')),
    read BOOLEAN DEFAULT false,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle event notifications
CREATE OR REPLACE FUNCTION handle_event_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- For new events
    IF (TG_OP = 'INSERT') THEN
        -- Create notification for assigned user
        IF NEW.assigned_to IS NOT NULL THEN
            INSERT INTO notifications (user_id, event_id, event_type, title, message, type, scheduled_for)
            VALUES (
                NEW.assigned_to,
                NEW.id,
                TG_TABLE_NAME,
                'New ' || TG_TABLE_NAME || ' assigned',
                NEW.title || ' has been assigned to you',
                'assignment',
                NEW.due_date
            );
        END IF;
    END IF;

    -- For updates
    IF (TG_OP = 'UPDATE') THEN
        -- If status changed
        IF NEW.status != OLD.status THEN
            INSERT INTO notifications (user_id, event_id, event_type, title, message, type)
            VALUES (
                NEW.assigned_to,
                NEW.id,
                TG_TABLE_NAME,
                TG_TABLE_NAME || ' status updated',
                NEW.title || ' status changed to ' || NEW.status,
                'update'
            );
        END IF;

        -- If assigned_to changed
        IF NEW.assigned_to != OLD.assigned_to THEN
            -- Notify new assignee
            INSERT INTO notifications (user_id, event_id, event_type, title, message, type)
            VALUES (
                NEW.assigned_to,
                NEW.id,
                TG_TABLE_NAME,
                'New ' || TG_TABLE_NAME || ' assigned',
                NEW.title || ' has been assigned to you',
                'assignment'
            );

            -- Notify old assignee
            INSERT INTO notifications (user_id, event_id, event_type, title, message, type)
            VALUES (
                OLD.assigned_to,
                NEW.id,
                TG_TABLE_NAME,
                TG_TABLE_NAME || ' reassigned',
                NEW.title || ' has been reassigned',
                'update'
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for tasks and appointments
CREATE TRIGGER handle_task_notification
    AFTER INSERT OR UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION handle_event_notification();

CREATE TRIGGER handle_appointment_notification
    AFTER INSERT OR UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION handle_event_notification();

-- Create function to send email notifications
CREATE OR REPLACE FUNCTION send_email_notification()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
BEGIN
    -- Get user's email
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = NEW.user_id;

    -- Send email using your email service
    -- This is a placeholder - you'll need to implement actual email sending
    -- using your preferred email service (SendGrid, AWS SES, etc.)
    PERFORM net.http_post(
        url := 'https://api.your-email-service.com/send',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer your-api-key'
        ),
        body := jsonb_build_object(
            'to', user_email,
            'subject', NEW.title,
            'text', NEW.message
        )
    );

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for email notifications
CREATE TRIGGER send_email_notification_trigger
    AFTER INSERT ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION send_email_notification(); 