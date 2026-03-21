CREATE TABLE IF NOT EXISTS marketplace_products (
  id UUID PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  seller_role TEXT NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  martial_art TEXT,
  price_vnd BIGINT NOT NULL,
  compare_at_price_vnd BIGINT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'VND',
  stock_quantity INT NOT NULL DEFAULT 0,
  minimum_order_quantity INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  location TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  images JSONB NOT NULL DEFAULT '[]',
  tags JSONB NOT NULL DEFAULT '[]',
  specs JSONB NOT NULL DEFAULT '[]',
  shipping JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marketplace_orders (
  id UUID PRIMARY KEY,
  order_code TEXT NOT NULL UNIQUE,
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  buyer_email TEXT,
  buyer_address TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  subtotal_vnd BIGINT NOT NULL DEFAULT 0,
  shipping_fee_vnd BIGINT NOT NULL DEFAULT 0,
  discount_vnd BIGINT NOT NULL DEFAULT 0,
  total_vnd BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marketplace_order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES marketplace_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE RESTRICT,
  product_slug TEXT NOT NULL,
  product_title TEXT NOT NULL,
  unit_price_vnd BIGINT NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 1,
  line_total_vnd BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_marketplace_products_status
  ON marketplace_products(status, featured, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_seller
  ON marketplace_products(seller_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_category
  ON marketplace_products(category, status);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_seller
  ON marketplace_orders(seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_status
  ON marketplace_orders(status, payment_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_order_items_order
  ON marketplace_order_items(order_id);
