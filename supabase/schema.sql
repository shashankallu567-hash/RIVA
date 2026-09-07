-- ============================================================
-- RIVA Store Database Schema + FMCG Seed Data
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vygubrpugmcxbfczwklo/sql
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT ('prod-' || substr(uuid_generate_v4()::text, 1, 8)),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  mrp NUMERIC(10,2),
  discount INTEGER DEFAULT 0,
  unit TEXT NOT NULL,
  image_url TEXT,
  aisle TEXT,
  shelf TEXT,
  store TEXT DEFAULT 'RIVA Store Bangalore',
  store_id TEXT DEFAULT 'store-blr-01',
  return_policy TEXT DEFAULT '7 days return',
  exchange_policy TEXT DEFAULT '7 days exchange',
  shelf_life TEXT,
  expiry_required BOOLEAN DEFAULT false,
  reorder_level INTEGER DEFAULT 10,
  return_window_days INTEGER DEFAULT 7,
  barcode TEXT,
  tags TEXT[],
  is_veg BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. INVENTORY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY DEFAULT ('inv-' || substr(uuid_generate_v4()::text, 1, 8)),
  product_id TEXT NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_threshold INTEGER DEFAULT 10,
  availability TEXT DEFAULT 'IN_STOCK' CHECK (availability IN ('IN_STOCK','LOW_STOCK','OUT_STOCK')),
  aisle TEXT,
  shelf TEXT,
  store TEXT DEFAULT 'RIVA Store Bangalore',
  batch_number TEXT,
  expiry_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. CUSTOMERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY DEFAULT ('cust-' || substr(uuid_generate_v4()::text, 1, 8)),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT DEFAULT 'CUSTOMER',
  avatar_url TEXT,
  store_id TEXT DEFAULT 'store-blr-01',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. CART ITEMS TABLE (session-based)
-- ============================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id TEXT PRIMARY KEY DEFAULT ('cart-' || substr(uuid_generate_v4()::text, 1, 8)),
  session_id TEXT NOT NULL,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, product_id)
);

-- ============================================================
-- 5. ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  delivery_fee NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'CONFIRMED' CHECK (status IN ('PLACED','CONFIRMED','PACKING','READY_FOR_PICKUP','OUT_FOR_DELIVERY','DELIVERED','CANCELLED')),
  payment_method TEXT DEFAULT 'MOCK_UPI',
  payment_status TEXT DEFAULT 'PAID',
  delivery_type TEXT DEFAULT 'HOME_DELIVERY',
  delivery_address JSONB,
  pickup_store TEXT,
  estimated_delivery TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. ORDER ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY DEFAULT ('oi-' || substr(uuid_generate_v4()::text, 1, 8)),
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  price NUMERIC(10,2) NOT NULL,
  mrp NUMERIC(10,2),
  quantity INTEGER NOT NULL DEFAULT 1,
  image_url TEXT,
  unit TEXT
);

-- ============================================================
-- 7. RETURNS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS returns (
  id TEXT PRIMARY KEY DEFAULT ('ret-' || substr(uuid_generate_v4()::text, 1, 8)),
  order_id TEXT,
  product_id TEXT,
  product_name TEXT NOT NULL,
  category TEXT,
  brand TEXT,
  price NUMERIC(10,2),
  amount NUMERIC(10,2),
  purchase_date TEXT,
  customer_id TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  store_id TEXT DEFAULT 'store-blr-01',
  reason TEXT NOT NULL,
  condition TEXT CHECK (condition IN ('SEALED','OPENED_UNUSED','OPENED_USED','DEFECTIVE','EXPIRED','DAMAGED')),
  has_receipt BOOLEAN DEFAULT true,
  is_opened BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED','ESCALATED','COMPLETED','AUTO_APPROVED','MANUAL_REVIEW')),
  eligibility TEXT DEFAULT 'ELIGIBLE_AUTO',
  resolution_type TEXT DEFAULT 'REFUND' CHECK (resolution_type IN ('REFUND','EXCHANGE','STORE_CREDIT')),
  exchange_product_id TEXT,
  exchange_product_name TEXT,
  notes TEXT,
  ticket_id TEXT,
  reference_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. SUPPORT TICKETS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY DEFAULT ('tkt-' || substr(uuid_generate_v4()::text, 1, 8)),
  customer_id TEXT,
  customer_name TEXT,
  customer_contact TEXT,
  type TEXT DEFAULT 'GENERAL_QUERY' CHECK (type IN ('RETURN_DISPUTE','STOCK_OUT','LOCATION_CONFUSION','DAMAGED_ITEM','GENERAL_QUERY')),
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW','MEDIUM','HIGH','URGENT')),
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN','IN_PROGRESS','RESOLVED','CLOSED')),
  title TEXT NOT NULL,
  description TEXT,
  source TEXT DEFAULT 'MANUAL' CHECK (source IN ('ASSISTANT','MANUAL','ESCALATED','INVENTORY_ALERT')),
  assigned_staff_id TEXT,
  assigned_staff_name TEXT,
  related_entity_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT ('notif-' || substr(uuid_generate_v4()::text, 1, 8)),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  target_role TEXT DEFAULT 'ALL',
  target_user_id TEXT,
  reference_id TEXT,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. AUDIT LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT ('aud-' || substr(uuid_generate_v4()::text, 1, 8)),
  user_id TEXT,
  user_name TEXT,
  role TEXT,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR HIGH-PERFORMANCE SEARCH
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_session ON orders(session_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_customer ON returns(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_target ON notifications(target_role);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read and write for web app demo
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read inventory" ON inventory FOR SELECT USING (true);
CREATE POLICY "Public read notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Session cart access" ON cart_items FOR ALL USING (true);
CREATE POLICY "Demo order access" ON orders FOR ALL USING (true);
CREATE POLICY "Demo order items access" ON order_items FOR ALL USING (true);
CREATE POLICY "Demo returns access" ON returns FOR ALL USING (true);
CREATE POLICY "Demo tickets access" ON support_tickets FOR ALL USING (true);
CREATE POLICY "Demo audit access" ON audit_logs FOR ALL USING (true);

-- Allow full access for anon/public inserts during demo
CREATE POLICY "Public insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update products" ON products FOR UPDATE USING (true);
CREATE POLICY "Public insert inventory" ON inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update inventory" ON inventory FOR UPDATE USING (true);

-- ============================================================
-- FMCG CATALOG SEED (50+ Real Indian FMCG Products)
-- ============================================================
INSERT INTO products (id, sku, name, brand, category, description, price, mrp, unit, image_url, aisle, shelf, store_id, return_window_days, tags, is_veg, shelf_life, expiry_required, reorder_level) VALUES

-- Dairy (Aisle 1)
('prod-dairy-01','DAI-AML-500','Amul Taaza Homogenised Toned Milk','Amul','Dairy','Fresh toned pasteurized milk with 3.0% fat and 8.5% SNF. Needs refrigeration.',32,34,'500 ml','https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80','Aisle 1','Shelf A1 (Chiller)','store-blr-01',1,ARRAY['milk','dairy','amul','toned milk'],true,'3 days',true,15),
('prod-dairy-02','DAI-AML-1000','Amul Gold Full Cream Milk','Amul','Dairy','Rich full cream milk with 6% fat. Ideal for making paneer, kheer and desserts.',64,68,'1 Litre','https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80','Aisle 1','Shelf A1 (Chiller)','store-blr-01',1,ARRAY['milk','dairy','amul','full cream'],true,'3 days',true,12),
('prod-dairy-03','DAI-NAN-GHE','Nandini GoodLife Pure Cow Ghee','Nandini','Dairy','Traditional aroma granulated texture pure cow ghee certified by KMF.',610,650,'1 Litre','https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=400&auto=format&fit=crop&q=80','Aisle 1','Shelf B2','store-blr-01',7,ARRAY['ghee','dairy','nandini','cow ghee'],true,'12 months',false,5),
('prod-dairy-04','DAI-AML-GHE','Amul Pure Ghee','Amul','Dairy','Pure ghee from fresh cream. Rich and aromatic with traditional taste.',550,580,'500 g','https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=400&auto=format&fit=crop&q=80','Aisle 1','Shelf B2','store-blr-01',7,ARRAY['ghee','amul','dairy'],true,'12 months',false,8),
('prod-dairy-05','DAI-AML-BUT','Amul Butter','Amul','Dairy','Pasteurised table butter. Perfect for toast, cooking, and baking.',55,58,'100 g','https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&auto=format&fit=crop&q=80','Aisle 1','Shelf A1 (Chiller)','store-blr-01',3,ARRAY['butter','amul','dairy'],true,'45 days',true,20),
('prod-dairy-06','DAI-AML-CHE','Amul Processed Cheese','Amul','Dairy','Mild, creamy processed cheese slices. Ready to eat or melt.',155,165,'200 g','https://images.unsplash.com/photo-1631379578550-7038263db699?w=400&auto=format&fit=crop&q=80','Aisle 1','Shelf A2 (Chiller)','store-blr-01',3,ARRAY['cheese','amul','dairy'],true,'6 months',true,10),
('prod-dairy-07','DAI-MTH-CUR','Mother Dairy Fresh Curd','Mother Dairy','Dairy','Thick and creamy set curd with live cultures. Naturally fermented.',32,35,'400 g','https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&auto=format&fit=crop&q=80','Aisle 1','Shelf A1 (Chiller)','store-blr-01',1,ARRAY['curd','yogurt','mother dairy','dairy'],true,'3 days',true,15),
('prod-dairy-08','DAI-AML-PAN','Amul Fresh Paneer','Amul','Dairy','Soft and moist Indian cottage cheese. High protein dairy product.',105,112,'200 g','https://images.unsplash.com/photo-1631379578550-7038263db699?w=400&auto=format&fit=crop&q=80','Aisle 1','Shelf A2 (Chiller)','store-blr-01',2,ARRAY['paneer','cottage cheese','amul','dairy'],true,'7 days',true,8),

-- Beverages (Aisle 2)
('prod-bev-01','BEV-PEP-500','Pepsi Cola','Pepsi','Beverages','Refreshing cola drink with bold cola taste.',38,40,'500 ml','https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&auto=format&fit=crop&q=80','Aisle 2','Shelf C1','store-blr-01',7,ARRAY['pepsi','cola','soft drink','beverage'],false,'9 months',false,30),
('prod-bev-02','BEV-THM-750','Thums Up','Coca-Cola','Beverages','Strong sparkling cola with a daring bold taste loved across India.',40,42,'750 ml','https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&auto=format&fit=crop&q=80','Aisle 2','Shelf C1','store-blr-01',7,ARRAY['thums up','cola','soft drink','coca cola'],false,'9 months',false,25),
('prod-bev-03','BEV-SPR-500','Sprite Lime Fresh','Coca-Cola','Beverages','Clear, crisp lemon-lime flavoured sparkling drink.',35,38,'500 ml','https://images.unsplash.com/photo-1620416489295-dad3e3d6db56?w=400&auto=format&fit=crop&q=80','Aisle 2','Shelf C1','store-blr-01',7,ARRAY['sprite','lime','soft drink','beverage'],false,'9 months',false,25),
('prod-bev-04','BEV-MZZ-200','Maaza Mango Drink','Coca-Cola','Beverages','Real mango pulp blended with refreshing juice. No artificial flavours.',25,28,'200 ml','https://images.unsplash.com/photo-1546173159-315724a31696?w=400&auto=format&fit=crop&q=80','Aisle 2','Shelf C2','store-blr-01',7,ARRAY['maaza','mango','juice','beverage'],true,'9 months',false,40),
('prod-bev-05','BEV-SOB-1000','Minute Maid Orange Juice','Coca-Cola','Beverages','100% pure orange juice with no added sugar. Rich in Vitamin C.',95,105,'1 Litre','https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&auto=format&fit=crop&q=80','Aisle 2','Shelf C2','store-blr-01',3,ARRAY['orange juice','minute maid','juice','beverage'],true,'12 months',false,12),
('prod-bev-06','BEV-RED-250','Red Bull Energy Drink','Red Bull','Beverages','Original energy drink that gives you wings. With caffeine, taurine, B-vitamins.',115,125,'250 ml','https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&auto=format&fit=crop&q=80','Aisle 2','Shelf C3','store-blr-01',7,ARRAY['red bull','energy drink','beverage'],false,'24 months',false,10),
('prod-bev-07','BEV-KIN-600','Kinley Packaged Water','Coca-Cola','Beverages','Pure, hygienic packaged drinking water with essential minerals.',20,20,'1 Litre','https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&auto=format&fit=crop&q=80','Aisle 2','Shelf D1','store-blr-01',7,ARRAY['water','kinley','mineral water'],true,'2 years',false,50),

-- Tea & Coffee (Aisle 3)
('prod-tea-01','TEA-TTA-500','Tata Tea Premium','Tata','Tea & Coffee','India favourite tea brand. Rich, strong CTC blend for a perfect cup.',210,220,'500 g','https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&auto=format&fit=crop&q=80','Aisle 3','Shelf E1','store-blr-01',30,ARRAY['tata tea','tea','beverage','premium'],true,'24 months',false,15),
('prod-tea-02','TEA-TTA-250','Tata Tea Gold','Tata','Tea & Coffee','Premium long leaf tea blend with fine aroma for a superior cup.',125,135,'250 g','https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&auto=format&fit=crop&q=80','Aisle 3','Shelf E1','store-blr-01',30,ARRAY['tata tea gold','tea','premium'],true,'24 months',false,10),
('prod-tea-03','TEA-RED-500','Red Label Natural Care Tea','Brooke Bond','Tea & Coffee','Unique blend of CTC tea and 5 ayurvedic ingredients for immunity.',245,260,'500 g','https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&auto=format&fit=crop&q=80','Aisle 3','Shelf E1','store-blr-01',30,ARRAY['red label','tea','ayurvedic','brooke bond'],true,'24 months',false,12),
('prod-tea-04','COF-BRU-200','Bru Instant Coffee','Bru','Tea & Coffee','India most loved instant coffee with bold chicory blend.',195,210,'200 g','https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=400&auto=format&fit=crop&q=80','Aisle 3','Shelf E2','store-blr-01',30,ARRAY['bru','coffee','instant coffee'],true,'24 months',false,12),
('prod-tea-05','COF-NES-100','Nescafé Classic Instant Coffee','Nestlé','Tea & Coffee','Rich and roasted pure Arabica coffee for the perfect cup every time.',280,295,'100 g','https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=400&auto=format&fit=crop&q=80','Aisle 3','Shelf E2','store-blr-01',30,ARRAY['nescafe','coffee','instant coffee','nestle'],true,'24 months',false,10),

-- Snacks & Chips (Aisle 4)
('prod-snk-01','SNK-LAY-HIL','Lay''s Classic Salted Chips','Lay''s','Snacks','Crispy potato chips with just the right amount of salt. Classic American style.',20,20,'26 g','https://images.unsplash.com/photo-1621798880983-04a7de37d9aa?w=400&auto=format&fit=crop&q=80','Aisle 4','Shelf F1','store-blr-01',30,ARRAY['lays','chips','potato chips','snacks'],true,'4 months',false,30),
('prod-snk-02','SNK-LAY-MAS','Lay''s Magic Masala Chips','Lay''s','Snacks','Zingy masala flavoured potato chips. India''s most loved crisp flavour.',20,20,'26 g','https://images.unsplash.com/photo-1621798880983-04a7de37d9aa?w=400&auto=format&fit=crop&q=80','Aisle 4','Shelf F1','store-blr-01',30,ARRAY['lays','masala chips','snacks'],true,'4 months',false,30),
('prod-snk-03','SNK-KRK-HTC','Kurkure Masala Munch','Kurkure','Snacks','Crunchy corn puff snack with spicy masala twist. Finger licking good.',20,20,'90 g','https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&auto=format&fit=crop&q=80','Aisle 4','Shelf F1','store-blr-01',30,ARRAY['kurkure','corn puffs','snacks','masala'],true,'4 months',false,25),
('prod-snk-04','SNK-HAL-MIX','Haldiram''s Aloo Bhujia','Haldiram''s','Snacks','Authentic Rajasthani style crispy potato bhujia. Perfect with tea.',150,160,'400 g','https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&auto=format&fit=crop&q=80','Aisle 4','Shelf F2','store-blr-01',30,ARRAY['haldirams','bhujia','namkeen','snacks'],true,'6 months',false,15),

-- Biscuits & Cookies (Aisle 5)
('prod-bis-01','BIS-PAR-GLD','Parle-G Original Glucose Biscuits','Parle','Biscuits & Cookies','India''s most iconic glucose biscuit. A perfect snack for all ages.',10,10,'100 g','https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop&q=80','Aisle 5','Shelf G1','store-blr-01',30,ARRAY['parle g','glucose biscuit','parle','biscuit'],true,'6 months',false,50),
('prod-bis-02','BIS-BRT-GDY','Britannia Good Day Cashew Cookies','Britannia','Biscuits & Cookies','Buttery shortbread cookies loaded with real cashew pieces.',65,70,'150 g','https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop&q=80','Aisle 5','Shelf G1','store-blr-01',30,ARRAY['britannia','good day','cookies','cashew'],true,'6 months',false,20),
('prod-bis-03','BIS-BRT-MRG','Britannia Marie Gold Biscuits','Britannia','Biscuits & Cookies','Light, crispy Marie biscuits. Perfect with tea, coffee or on its own.',35,38,'250 g','https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop&q=80','Aisle 5','Shelf G1','store-blr-01',30,ARRAY['britannia','marie gold','biscuit'],true,'6 months',false,25),
('prod-bis-04','BIS-SUN-ORE','Sunfeast Dark Fantasy Choco Fills','Sunfeast','Biscuits & Cookies','Dark chocolate filled premium biscuits. A truly indulgent experience.',60,65,'150 g','https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop&q=80','Aisle 5','Shelf G2','store-blr-01',30,ARRAY['sunfeast','dark fantasy','chocolate','biscuit'],true,'6 months',false,15),
('prod-bis-05','BIS-ORL-VNL','Oreo Vanilla Cream Biscuits','Cadbury','Biscuits & Cookies','Classic chocolate sandwich biscuit with vanilla cream filling.',35,38,'120 g','https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop&q=80','Aisle 5','Shelf G2','store-blr-01',30,ARRAY['oreo','vanilla','cream biscuit','chocolate'],true,'12 months',false,20),

-- Instant Food (Aisle 5)
('prod-ins-01','INS-MAG-MAS','Maggi 2-Minute Masala Noodles','Maggi','Instant Food','India''s favourite instant noodles with iconic masala taste.',14,14,'70 g','https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&auto=format&fit=crop&q=80','Aisle 5','Shelf H1','store-blr-01',30,ARRAY['maggi','noodles','instant food','masala'],true,'12 months',false,50),
('prod-ins-02','INS-MAG-PKT','Maggi Masala Noodles Pack of 4','Maggi','Instant Food','Value pack of 4 Maggi Masala Noodles. Perfect family pack.',56,60,'280 g','https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&auto=format&fit=crop&q=80','Aisle 5','Shelf H1','store-blr-01',30,ARRAY['maggi','noodles','pack','family'],true,'12 months',false,30),
('prod-ins-03','INS-TOP-CHK','Top Ramen Chicken Noodles','Nissin','Instant Food','Flavourful chicken masala noodles. Ready in 2 minutes.',15,15,'70 g','https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&auto=format&fit=crop&q=80','Aisle 5','Shelf H1','store-blr-01',30,ARRAY['top ramen','noodles','chicken','instant food'],false,'12 months',false,25),
('prod-ins-04','INS-MTR-IDL','MTR Instant Idli Rava Mix','MTR','Instant Food','Ready-to-cook soft idli mix. Just add water and steam.',95,105,'500 g','https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&auto=format&fit=crop&q=80','Aisle 5','Shelf H2','store-blr-01',30,ARRAY['mtr','idli mix','instant food','south indian'],true,'12 months',false,12),

-- Grocery & Staples (Aisle 6)
('prod-gro-01','GRO-IND-1KG','India Gate Classic Basmati Rice','India Gate','Grocery & Staples','Premium aged basmati rice with long grains, rich aroma and fluffy texture.',185,195,'1 kg','https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80','Aisle 6','Shelf I1','store-blr-01',30,ARRAY['india gate','basmati rice','rice','staples'],true,'18 months',false,20),
('prod-gro-03','GRO-ASH-1KG','Aashirvaad Whole Wheat Atta','Aashirvaad','Grocery & Staples','100% whole wheat flour for soft rotis. Selected from best farms.',58,62,'1 kg','https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&auto=format&fit=crop&q=80','Aisle 6','Shelf I2','store-blr-01',30,ARRAY['aashirvaad','atta','wheat flour','staples'],true,'6 months',false,20),
('prod-gro-05','GRO-FOR-1LT','Fortune Sunflower Refined Oil','Fortune','Grocery & Staples','Light, cholesterol-free refined sunflower oil. Ideal for everyday cooking.',140,150,'1 Litre','https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80','Aisle 6','Shelf I3','store-blr-01',30,ARRAY['fortune','sunflower oil','cooking oil','staples'],true,'18 months',false,15),
('prod-gro-07','GRO-TTG-MUS','Tata Salt Crystal Iodised Salt','Tata','Grocery & Staples','Pure white iodised salt for health. Free flowing and fine-grained.',20,22,'1 kg','https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=400&auto=format&fit=crop&q=80','Aisle 6','Shelf I4','store-blr-01',90,ARRAY['tata salt','salt','iodised'],true,'2 years',false,25),

-- Personal Care (Aisle 9)
('prod-pc-01','PC-DVE-SHA','Dove Intense Repair Shampoo','Dove','Personal Care','Nourishing shampoo with keratin serum for damaged and rough hair.',299,325,'340 ml','https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&auto=format&fit=crop&q=80','Aisle 9','Shelf L1','store-blr-01',30,ARRAY['dove','shampoo','hair care','personal care'],true,'3 years',false,12),
('prod-pc-04','PC-COL-SOA','Colgate Strong Teeth Toothpaste','Colgate','Personal Care','With Calcium Boost for stronger teeth. Gives up to 2x stronger enamel.',98,110,'200 g','https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400&auto=format&fit=crop&q=80','Aisle 9','Shelf L2','store-blr-01',30,ARRAY['colgate','toothpaste','oral care','strong teeth'],true,'2 years',false,20),
('prod-pc-06','PC-LUX-SOA','Lux Soft Touch Bar Soap','Lux','Personal Care','Gentle moisturising soap with lotus and cream. For soft silky skin.',45,50,'4x125 g','https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&auto=format&fit=crop&q=80','Aisle 9','Shelf L3','store-blr-01',30,ARRAY['lux','soap','bath','personal care'],true,'3 years',false,20),

-- Household (Aisle 10)
('prod-hh-01','HH-SRF-1KG','Surf Excel Easy Wash Detergent','Surf Excel','Household','Removes tough stains easily even in cold water. 60 washes per kg.',215,230,'1 kg','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop&q=80','Aisle 10','Shelf M1','store-blr-01',30,ARRAY['surf excel','detergent','laundry','washing powder'],true,'2 years',false,15),
('prod-hh-04','HH-HRP-500','Harpic Power Plus Toilet Cleaner','Harpic','Household','Kills 99.9% germs under the rim. Removes tough stains effortlessly.',120,130,'500 ml','https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&auto=format&fit=crop&q=80','Aisle 10','Shelf M3','store-blr-01',30,ARRAY['harpic','toilet cleaner','disinfectant','household'],false,'2 years',false,12),
('prod-hh-05','HH-DTL-500','Dettol Original Antiseptic Liquid','Dettol','Household','Multi-use antiseptic for wounds, bathing, laundry and floor cleaning.',130,145,'500 ml','https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&auto=format&fit=crop&q=80','Aisle 10','Shelf M4','store-blr-01',30,ARRAY['dettol','antiseptic','disinfectant','household'],false,'3 years',false,15),

-- Fresh Produce (Aisle 14)
('prod-fv-01','FV-BAN-DOZ','Fresh Bananas (1 Dozen)','RIVA Fresh','Fruits & Vegetables','Ripe yellow bananas. Rich in potassium and natural energy. Sourced locally.',45,50,'1 dozen (approx 1 kg)','https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop&q=80','Aisle 14','Shelf R1','store-blr-01',2,ARRAY['banana','fruit','fresh','healthy'],true,'4 days',true,20),
('prod-fv-03','FV-TOM-500','Fresh Tomatoes','RIVA Fresh','Fruits & Vegetables','Firm, ripe red tomatoes. Essential for Indian cooking. Farm fresh.',30,35,'500 g','https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&auto=format&fit=crop&q=80','Aisle 14','Shelf R2','store-blr-01',2,ARRAY['tomato','vegetable','fresh','cooking'],true,'4 days',true,20),
('prod-fv-05','FV-POT-1KG','Fresh Potatoes','RIVA Fresh','Fruits & Vegetables','Fresh clean potatoes. Versatile for all Indian dishes. Farm to store.',35,40,'1 kg','https://images.unsplash.com/photo-1508313880080-c4bef0730395?w=400&auto=format&fit=crop&q=80','Aisle 14','Shelf R2','store-blr-01',5,ARRAY['potato','vegetable','fresh','cooking'],true,'2 weeks',true,20)

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED INVENTORY FOR ALL PRODUCTS
-- ============================================================
INSERT INTO inventory (product_id, stock_quantity, min_threshold, availability, aisle, shelf)
SELECT 
  p.id,
  CASE 
    WHEN p.category IN ('Fruits & Vegetables','Dairy') THEN FLOOR(RANDOM() * 30 + 10)::INT
    ELSE FLOOR(RANDOM() * 60 + 20)::INT
  END as stock_quantity,
  CASE 
    WHEN p.price > 200 THEN 5
    ELSE 10
  END as min_threshold,
  'IN_STOCK' as availability,
  p.aisle,
  p.shelf
FROM products p
ON CONFLICT (product_id) DO NOTHING;

-- Sample Customers
INSERT INTO customers (id, name, email, phone, role) VALUES
('cust-demo-01', 'Rahul Sharma', 'rahul.sharma@example.com', '+91 98765 43210', 'CUSTOMER'),
('cust-demo-02', 'Priya Nair', 'priya.nair@example.com', '+91 87654 32109', 'CUSTOMER')
ON CONFLICT (id) DO NOTHING;
