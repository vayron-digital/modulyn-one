-- This is a sample seed file that would be run after a user signs up
-- In a real application, you would run this when a user first signs up

-- Insert sample leads
INSERT INTO leads (tenant_id, created_by, first_name, last_name, email, phone, company, status, source, notes)
SELECT (SELECT id FROM tenants LIMIT 1), id, 'John', 'Smith', 'john@example.com', '555-0101', 'ABC Corp', 'qualified', 'website', 'Interested in premium properties' FROM auth.users LIMIT 1;
INSERT INTO leads (tenant_id, created_by, first_name, last_name, email, phone, company, status, source, notes)
SELECT (SELECT id FROM tenants LIMIT 1), id, 'Sarah', 'Johnson', 'sarah@example.com', '555-0102', 'XYZ Inc', 'new', 'referral', 'Looking for commercial space' FROM auth.users LIMIT 1;
INSERT INTO leads (tenant_id, created_by, first_name, last_name, email, phone, company, status, source, notes)
SELECT (SELECT id FROM tenants LIMIT 1), id, 'Michael', 'Brown', 'michael@example.com', '555-0103', '123 LLC', 'contacted', 'cold_call', 'Budget: $500k-$1M' FROM auth.users LIMIT 1;
INSERT INTO leads (tenant_id, created_by, first_name, last_name, email, phone, company, status, source, notes)
SELECT (SELECT id FROM tenants LIMIT 1), id, 'Emily', 'Davis', 'emily@example.com', '555-0104', 'Tech Solutions', 'contacted', 'other', 'First-time homebuyer' FROM auth.users LIMIT 1;
INSERT INTO leads (tenant_id, created_by, first_name, last_name, email, phone, company, status, source, notes)
SELECT (SELECT id FROM tenants LIMIT 1), id, 'Robert', 'Wilson', 'robert@example.com', '555-0105', 'Wilson Group', 'closed_won', 'referral', 'Closed on luxury condo' FROM auth.users LIMIT 1;

-- Insert sample properties
INSERT INTO properties (tenant_id, title, description, address, price, status, type, bedrooms, bathrooms, square_footage, year_built, property_type_detailed, property_status_detailed)
SELECT id, 'Modern Downtown Loft', 'Stunning loft in the heart of the city.', '123 Main St, Anytown, USA', 500000, 'available', 'residential', 2, 2, 1200, 2020, 'apartment', 'available' FROM tenants LIMIT 1;
INSERT INTO properties (tenant_id, title, description, address, price, status, type, bedrooms, bathrooms, square_footage, year_built, property_type_detailed, property_status_detailed)
SELECT id, 'Suburban Family Home', 'Spacious home with a large backyard.', '456 Oak Ave, Suburbia, USA', 750000, 'available', 'residential', 4, 3, 2500, 2015, 'single-family-home', 'available' FROM tenants LIMIT 1;
INSERT INTO properties (tenant_id, title, description, address, price, status, type, bedrooms, bathrooms, square_footage, year_built, property_type_detailed, property_status_detailed)
SELECT id, 'Luxury Penthouse', 'Breathtaking views from this exclusive penthouse.', '789 High St, Uptown, USA', 2500000, 'sold', 'residential', 3, 4, 3500, 2022, 'penthouse', 'sold' FROM tenants LIMIT 1;


-- Insert sample calls
INSERT INTO calls (user_id, lead_id, call_type, call_date, duration, notes, outcome)
SELECT 
    (SELECT id FROM auth.users LIMIT 1),
    id,
    'cold',
    CURRENT_DATE - INTERVAL '2 days',
    15,
    'Initial contact made, interested in learning more',
    'scheduled'
FROM leads WHERE last_name = 'Smith';

INSERT INTO calls (user_id, lead_id, call_type, call_date, duration, notes, outcome)
SELECT 
    (SELECT id FROM auth.users LIMIT 1),
    id,
    'follow-up',
    CURRENT_DATE - INTERVAL '1 day',
    30,
    'Discussed property requirements, sending listing',
    'interested'
FROM leads WHERE last_name = 'Johnson';

INSERT INTO calls (user_id, lead_id, call_type, call_date, duration, notes, outcome)
SELECT 
    (SELECT id FROM auth.users LIMIT 1),
    id,
    'scheduled',
    CURRENT_DATE,
    45,
    'Property tour scheduled for next week',
    'scheduled'
FROM leads WHERE last_name = 'Brown';

-- Insert sample tasks
INSERT INTO tasks (created_by, lead_id, title, description, due_date, status, priority)
SELECT 
    (SELECT id FROM auth.users LIMIT 1),
    id,
    'Send Property Listings',
    'Send curated list of properties matching requirements',
    CURRENT_DATE + INTERVAL '2 days',
    'pending',
    'high'
FROM leads WHERE last_name = 'Smith';

INSERT INTO tasks (created_by, lead_id, title, description, due_date, status, priority)
SELECT 
    (SELECT id FROM auth.users LIMIT 1),
    id,
    'Schedule Property Tour',
    'Arrange viewing of commercial properties',
    CURRENT_DATE + INTERVAL '3 days',
    'pending',
    'medium'
FROM leads WHERE last_name = 'Johnson';

INSERT INTO tasks (created_by, lead_id, title, description, due_date, status, priority)
SELECT 
    (SELECT id FROM auth.users LIMIT 1),
    id,
    'Follow-up Call',
    'Check interest level and answer questions',
    CURRENT_DATE + INTERVAL '1 day',
    'pending',
    'high'
FROM leads WHERE last_name = 'Brown';

-- Insert sample activities
INSERT INTO activity_log (user_id, type, details)
SELECT 
    (SELECT id FROM auth.users LIMIT 1),
    'lead_created',
    jsonb_build_object('lead_name', 'John Smith')
FROM leads WHERE last_name = 'Smith';

INSERT INTO activity_log (user_id, type, details)
SELECT 
    (SELECT id FROM auth.users LIMIT 1),
    'call_completed',
    jsonb_build_object('lead_name', 'John Smith', 'outcome', 'scheduled')
FROM leads WHERE last_name = 'Smith';

INSERT INTO activity_log (user_id, type, details)
SELECT 
    (SELECT id FROM auth.users LIMIT 1),
    'task_created',
    jsonb_build_object('lead_name', 'John Smith', 'task_title', 'Send Property Listings')
FROM leads WHERE last_name = 'Smith'; 