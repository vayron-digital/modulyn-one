-- This is a sample seed file that would be run after a user signs up
-- In a real application, you would run this when a user first signs up

-- Insert sample leads
INSERT INTO leads (user_id, name, email, phone, company, status, source, notes)
VALUES 
    ('00000000-0000-0000-0000-000000000000', 'John Smith', 'john@example.com', '555-0101', 'ABC Corp', 'active', 'Website', 'Interested in premium properties'),
    ('00000000-0000-0000-0000-000000000000', 'Sarah Johnson', 'sarah@example.com', '555-0102', 'XYZ Inc', 'new', 'Referral', 'Looking for commercial space'),
    ('00000000-0000-0000-0000-000000000000', 'Michael Brown', 'michael@example.com', '555-0103', '123 LLC', 'cold', 'Cold Call', 'Budget: $500k-$1M'),
    ('00000000-0000-0000-0000-000000000000', 'Emily Davis', 'emily@example.com', '555-0104', 'Tech Solutions', 'active', 'Social Media', 'First-time homebuyer'),
    ('00000000-0000-0000-0000-000000000000', 'Robert Wilson', 'robert@example.com', '555-0105', 'Wilson Group', 'converted', 'Partner', 'Closed on luxury condo');

-- Insert sample calls
INSERT INTO calls (user_id, lead_id, call_type, call_date, duration, notes, outcome)
SELECT 
    '00000000-0000-0000-0000-000000000000',
    id,
    'cold',
    CURRENT_DATE - INTERVAL '2 days',
    15,
    'Initial contact made, interested in learning more',
    'scheduled'
FROM leads WHERE name = 'John Smith';

INSERT INTO calls (user_id, lead_id, call_type, call_date, duration, notes, outcome)
SELECT 
    '00000000-0000-0000-0000-000000000000',
    id,
    'follow-up',
    CURRENT_DATE - INTERVAL '1 day',
    30,
    'Discussed property requirements, sending listing',
    'interested'
FROM leads WHERE name = 'Sarah Johnson';

INSERT INTO calls (user_id, lead_id, call_type, call_date, duration, notes, outcome)
SELECT 
    '00000000-0000-0000-0000-000000000000',
    id,
    'scheduled',
    CURRENT_DATE,
    45,
    'Property tour scheduled for next week',
    'scheduled'
FROM leads WHERE name = 'Michael Brown';

-- Insert sample tasks
INSERT INTO tasks (user_id, lead_id, title, description, due_date, status, priority)
SELECT 
    '00000000-0000-0000-0000-000000000000',
    id,
    'Send Property Listings',
    'Send curated list of properties matching requirements',
    CURRENT_DATE + INTERVAL '2 days',
    'pending',
    'high'
FROM leads WHERE name = 'John Smith';

INSERT INTO tasks (user_id, lead_id, title, description, due_date, status, priority)
SELECT 
    '00000000-0000-0000-0000-000000000000',
    id,
    'Schedule Property Tour',
    'Arrange viewing of commercial properties',
    CURRENT_DATE + INTERVAL '3 days',
    'pending',
    'medium'
FROM leads WHERE name = 'Sarah Johnson';

INSERT INTO tasks (user_id, lead_id, title, description, due_date, status, priority)
SELECT 
    '00000000-0000-0000-0000-000000000000',
    id,
    'Follow-up Call',
    'Check interest level and answer questions',
    CURRENT_DATE + INTERVAL '1 day',
    'pending',
    'high'
FROM leads WHERE name = 'Michael Brown';

-- Insert sample activities
INSERT INTO activities (user_id, lead_id, activity_type, description)
SELECT 
    '00000000-0000-0000-0000-000000000000',
    id,
    'lead_created',
    'New lead added: John Smith'
FROM leads WHERE name = 'John Smith';

INSERT INTO activities (user_id, lead_id, activity_type, description)
SELECT 
    '00000000-0000-0000-0000-000000000000',
    id,
    'call_completed',
    'Cold call completed with John Smith'
FROM leads WHERE name = 'John Smith';

INSERT INTO activities (user_id, lead_id, activity_type, description)
SELECT 
    '00000000-0000-0000-0000-000000000000',
    id,
    'task_created',
    'New task created for John Smith: Send Property Listings'
FROM leads WHERE name = 'John Smith'; 