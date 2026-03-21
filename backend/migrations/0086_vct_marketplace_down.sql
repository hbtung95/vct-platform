DROP INDEX IF EXISTS idx_marketplace_order_items_order;
DROP INDEX IF EXISTS idx_marketplace_orders_status;
DROP INDEX IF EXISTS idx_marketplace_orders_seller;
DROP INDEX IF EXISTS idx_marketplace_products_category;
DROP INDEX IF EXISTS idx_marketplace_products_seller;
DROP INDEX IF EXISTS idx_marketplace_products_status;

DROP TABLE IF EXISTS marketplace_order_items;
DROP TABLE IF EXISTS marketplace_orders;
DROP TABLE IF EXISTS marketplace_products;
