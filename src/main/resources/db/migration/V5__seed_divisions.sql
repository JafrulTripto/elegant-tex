-- Migration to seed divisions table with Bangladesh administrative divisions
-- This migration inserts 8 divisions of Bangladesh with their Bengali names and URLs

INSERT INTO divisions (id, name, bn_name, url, created_at, updated_at) VALUES
(1, 'Chattogram', 'চট্টগ্রাম', 'www.chittagongdiv.gov.bd', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Rajshahi', 'রাজশাহী', 'www.rajshahidiv.gov.bd', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Khulna', 'খুলনা', 'www.khulnadiv.gov.bd', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Barisal', 'বরিশাল', 'www.barisaldiv.gov.bd', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'Sylhet', 'সিলেট', 'www.sylhetdiv.gov.bd', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'Dhaka', 'ঢাকা', 'www.dhakadiv.gov.bd', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 'Rangpur', 'রংপুর', 'www.rangpurdiv.gov.bd', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 'Mymensingh', 'ময়মনসিংহ', 'www.mymensinghdiv.gov.bd', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
