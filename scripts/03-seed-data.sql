-- Insert sample admin user (password: admin123)
INSERT INTO admins (email, password_hash, name) VALUES 
('admin@wellness.com', '$2b$10$rQZ9QmjlZKZK5Z5Z5Z5Z5uJ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Admin User');

-- Insert sample clients
INSERT INTO clients (external_id, name, email, phone) VALUES 
('client_1', 'John Doe', 'john.doe@email.com', '+1-555-0101'),
('client_2', 'Jane Smith', 'jane.smith@email.com', '+1-555-0102'),
('client_3', 'Bob Johnson', 'bob.johnson@email.com', '+1-555-0103'),
('client_4', 'Alice Brown', 'alice.brown@email.com', '+1-555-0104'),
('client_5', 'Charlie Wilson', 'charlie.wilson@email.com', '+1-555-0105');

-- Insert sample appointments
INSERT INTO appointments (external_id, client_id, title, description, appointment_date, duration_minutes, status)
SELECT 
    'appt_' || generate_random_uuid()::text,
    c.id,
    'Wellness Consultation',
    'Regular wellness check-up and consultation',
    CURRENT_TIMESTAMP + INTERVAL '1 day' + (RANDOM() * INTERVAL '30 days'),
    60,
    'scheduled'
FROM clients c
LIMIT 3;

INSERT INTO appointments (external_id, client_id, title, description, appointment_date, duration_minutes, status)
SELECT 
    'appt_' || generate_random_uuid()::text,
    c.id,
    'Follow-up Session',
    'Follow-up session for previous consultation',
    CURRENT_TIMESTAMP + INTERVAL '2 days' + (RANDOM() * INTERVAL '20 days'),
    45,
    'scheduled'
FROM clients c
ORDER BY RANDOM()
LIMIT 2;
