-- Database Schema for TheJobPit
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    job_role VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Applied',
    applied_date DATE DEFAULT CURRENT_DATE,
    notes TEXT
);

-- Mock Data for testing
INSERT INTO applications (company_name, job_role, status) 
VALUES ('Google', 'Software Engineer', 'Applied'),
       ('TikTok', 'Backend Dev', 'Interviewing');