USE fashion_company;

-- 1. Settings Table (For Logo, Slogan, Address)
CREATE TABLE IF NOT EXISTS site_settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Contact Messages Table (For the Contact Form)
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    status ENUM('unread', 'read', 'replied') DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Default Data (So the site isn't empty)
INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES 
('company_name', 'Fashion Co.'),
('company_slogan', 'Phong cách dẫn đầu xu hướng'),
('contact_address', '123 Cybertron Street, HCM City'),
('contact_email', 'contact@fashion.com'),
('contact_phone', '0909123456');