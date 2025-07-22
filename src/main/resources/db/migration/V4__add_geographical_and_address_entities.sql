-- V4: Add geographical entities and addresses table
-- This migration creates the geographical hierarchy and reusable addresses entity

-- Create divisions table
CREATE TABLE divisions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    bn_name VARCHAR(100) NOT NULL,
    url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create districts table
CREATE TABLE districts (
    id BIGSERIAL PRIMARY KEY,
    division_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    bn_name VARCHAR(100) NOT NULL,
    lat DECIMAL(10, 8),
    lon DECIMAL(11, 8),
    url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (division_id) REFERENCES divisions(id)
);

-- Create upazilas table
CREATE TABLE upazilas (
    id BIGSERIAL PRIMARY KEY,
    district_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    bn_name VARCHAR(100) NOT NULL,
    url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- Create reusable addresses table
CREATE TABLE addresses (
    id BIGSERIAL PRIMARY KEY,
    division_id BIGINT NOT NULL,
    district_id BIGINT NOT NULL,
    upazila_id BIGINT NOT NULL,
    address_line VARCHAR(500) NOT NULL,
    postal_code VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (division_id) REFERENCES divisions(id),
    FOREIGN KEY (district_id) REFERENCES districts(id),
    FOREIGN KEY (upazila_id) REFERENCES upazilas(id)
);

-- Add address_id to customers table
ALTER TABLE customers 
ADD address_id BIGINT;

-- Remove legacy address column from customers table
ALTER TABLE customers 
DROP COLUMN IF EXISTS address;

-- Add foreign key constraint
ALTER TABLE customers 
ADD CONSTRAINT fk_customer_address FOREIGN KEY (address_id) REFERENCES addresses(id);

-- Create indexes for better performance
CREATE INDEX idx_districts_division_id ON districts(division_id);
CREATE INDEX idx_upazilas_district_id ON upazilas(district_id);
CREATE INDEX idx_addresses_division_id ON addresses(division_id);
CREATE INDEX idx_addresses_district_id ON addresses(district_id);
CREATE INDEX idx_addresses_upazila_id ON addresses(upazila_id);
CREATE INDEX idx_customers_address_id ON customers(address_id);

-- Insert sample Bangladesh geographical data
