-- Update order statuses in the orders table
UPDATE orders SET status = 'ORDER_CREATED' WHERE status = 'Created';
UPDATE orders SET status = 'PRODUCTION' WHERE status = 'In Progress';
UPDATE orders SET status = 'QA' WHERE status = 'In QA';
UPDATE orders SET status = 'DELIVERED' WHERE status = 'Delivered';
UPDATE orders SET status = 'RETURNED' WHERE status = 'Returned';

-- Update order statuses in the order_status_history table
UPDATE order_status_history SET status = 'ORDER_CREATED' WHERE status = 'Created';
UPDATE order_status_history SET status = 'PRODUCTION' WHERE status = 'In Progress';
UPDATE order_status_history SET status = 'QA' WHERE status = 'In QA';
UPDATE order_status_history SET status = 'DELIVERED' WHERE status = 'Delivered';
UPDATE order_status_history SET status = 'RETURNED' WHERE status = 'Returned';
