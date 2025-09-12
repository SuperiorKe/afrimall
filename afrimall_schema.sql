-- =====================================================
-- AFRIMALL E-COMMERCE DATABASE SCHEMA
-- PostgreSQL Production Database Schema
-- =====================================================

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table (Admin users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'editor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    date_of_birth DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    customer_group VARCHAR(50) DEFAULT 'regular' CHECK (customer_group IN ('regular', 'vip', 'wholesale')),
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    total_orders INTEGER DEFAULT 0,
    last_order_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customer addresses table
CREATE TABLE customer_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('shipping', 'billing')),
    is_default BOOLEAN DEFAULT FALSE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    address1 VARCHAR(255) NOT NULL,
    address2 VARCHAR(255),
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255),
    postal_code VARCHAR(50) NOT NULL,
    country VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customer preferences table
CREATE TABLE customer_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    currency VARCHAR(10) DEFAULT 'USD' CHECK (currency IN ('USD', 'NGN', 'KES', 'ZAR', 'GHS', 'UGX')),
    language VARCHAR(10) DEFAULT 'en' CHECK (language IN ('en', 'fr', 'ar', 'sw')),
    newsletter BOOLEAN DEFAULT FALSE,
    sms_marketing BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Media table
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alt VARCHAR(255),
    caption TEXT,
    prefix VARCHAR(255),
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    filesize BIGINT,
    width INTEGER,
    height INTEGER,
    focal_x DECIMAL(5,2),
    focal_y DECIMAL(5,2),
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    image_id UUID REFERENCES media(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    breadcrumb_path TEXT,
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    full_description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    compare_at_price DECIMAL(10,2) CHECK (compare_at_price >= 0),
    sku VARCHAR(255) UNIQUE NOT NULL,
    track_quantity BOOLEAN DEFAULT TRUE,
    quantity INTEGER DEFAULT 0 CHECK (quantity >= 0),
    allow_backorder BOOLEAN DEFAULT FALSE,
    low_stock_threshold INTEGER DEFAULT 5 CHECK (low_stock_threshold >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    featured BOOLEAN DEFAULT FALSE,
    weight DECIMAL(8,3) CHECK (weight >= 0),
    length DECIMAL(8,2) CHECK (length >= 0),
    width DECIMAL(8,2) CHECK (width >= 0),
    height DECIMAL(8,2) CHECK (height >= 0),
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product images table
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    alt VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product categories junction table
CREATE TABLE product_categories (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- Product tags table
CREATE TABLE product_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    tag VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product variants table
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    sku VARCHAR(255) UNIQUE NOT NULL,
    price DECIMAL(10,2) CHECK (price >= 0),
    compare_at_price DECIMAL(10,2) CHECK (compare_at_price >= 0),
    quantity INTEGER DEFAULT 0 CHECK (quantity >= 0),
    reserved INTEGER DEFAULT 0 CHECK (reserved >= 0),
    available INTEGER GENERATED ALWAYS AS (quantity - reserved) STORED,
    weight DECIMAL(8,3) CHECK (weight >= 0),
    is_default BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product variant options table
CREATE TABLE product_variant_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product variant images table
CREATE TABLE product_variant_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    image_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    alt VARCHAR(255) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Shopping cart table
CREATE TABLE shopping_cart (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    subtotal DECIMAL(10,2) DEFAULT 0.00 CHECK (subtotal >= 0),
    item_count INTEGER DEFAULT 0 CHECK (item_count >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'NGN', 'KES', 'ZAR', 'GHS', 'UGX')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'abandoned', 'converted')),
    expires_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Shopping cart items table
CREATE TABLE shopping_cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES shopping_cart(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(255) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'NGN', 'KES', 'ZAR', 'GHS', 'UGX')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
    payment_method VARCHAR(50) CHECK (payment_method IN ('credit_card', 'paypal', 'mpesa', 'mtn_mobile_money', 'airtel_money', 'bank_transfer', 'cod')),
    payment_reference VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    stripe_client_secret VARCHAR(255),
    notes TEXT,
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    product_title VARCHAR(255) NOT NULL,
    product_sku VARCHAR(255) NOT NULL,
    product_image_id UUID REFERENCES media(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order shipping table
CREATE TABLE order_shipping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    method VARCHAR(50) NOT NULL CHECK (method IN ('standard', 'express', 'overnight', 'pickup')),
    cost DECIMAL(10,2) NOT NULL CHECK (cost >= 0),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    address1 VARCHAR(255) NOT NULL,
    address2 VARCHAR(255),
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255),
    postal_code VARCHAR(50) NOT NULL,
    country VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    tracking_number VARCHAR(255),
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order billing table
CREATE TABLE order_billing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    address1 VARCHAR(255) NOT NULL,
    address2 VARCHAR(255),
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255),
    postal_code VARCHAR(50) NOT NULL,
    country VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order tax table
CREATE TABLE order_tax (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) DEFAULT 0.00 CHECK (amount >= 0),
    rate DECIMAL(5,4) DEFAULT 0.0000 CHECK (rate >= 0 AND rate <= 1),
    inclusive BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Customers indexes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_customer_group ON customers(customer_group);
CREATE INDEX idx_customers_total_spent ON customers(total_spent DESC);

-- Customer addresses indexes
CREATE INDEX idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX idx_customer_addresses_type ON customer_addresses(type);
CREATE INDEX idx_customer_addresses_is_default ON customer_addresses(is_default);

-- Media indexes
CREATE INDEX idx_media_filename ON media(filename);
CREATE INDEX idx_media_mime_type ON media(mime_type);

-- Categories indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_status ON categories(status);
CREATE INDEX idx_categories_featured ON categories(featured);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);

-- Products indexes
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Product images indexes
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_sort_order ON product_images(sort_order);

-- Product categories indexes
CREATE INDEX idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX idx_product_categories_category_id ON product_categories(category_id);

-- Product tags indexes
CREATE INDEX idx_product_tags_product_id ON product_tags(product_id);
CREATE INDEX idx_product_tags_tag ON product_tags(tag);

-- Product variants indexes
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_product_variants_status ON product_variants(status);
CREATE INDEX idx_product_variants_is_default ON product_variants(is_default);

-- Product variant options indexes
CREATE INDEX idx_product_variant_options_variant_id ON product_variant_options(variant_id);

-- Shopping cart indexes
CREATE INDEX idx_shopping_cart_customer_id ON shopping_cart(customer_id);
CREATE INDEX idx_shopping_cart_session_id ON shopping_cart(session_id);
CREATE INDEX idx_shopping_cart_status ON shopping_cart(status);
CREATE INDEX idx_shopping_cart_expires_at ON shopping_cart(expires_at);

-- Shopping cart items indexes
CREATE INDEX idx_shopping_cart_items_cart_id ON shopping_cart_items(cart_id);
CREATE INDEX idx_shopping_cart_items_product_id ON shopping_cart_items(product_id);

-- Orders indexes
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Order items indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Order shipping indexes
CREATE INDEX idx_order_shipping_order_id ON order_shipping(order_id);

-- Order billing indexes
CREATE INDEX idx_order_billing_order_id ON order_billing(order_id);

-- Order tax indexes
CREATE INDEX idx_order_tax_order_id ON order_tax(order_id);

-- =====================================================
-- TRIGGERS FOR DATA CONSISTENCY
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_addresses_updated_at BEFORE UPDATE ON customer_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_preferences_updated_at BEFORE UPDATE ON customer_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shopping_cart_updated_at BEFORE UPDATE ON shopping_cart FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := 'AFR' || EXTRACT(EPOCH FROM NOW())::BIGINT || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply order number generation trigger
CREATE TRIGGER generate_order_number_trigger BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Function to update customer statistics after order creation
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
        UPDATE customers 
        SET 
            total_spent = total_spent + NEW.total,
            total_orders = total_orders + 1,
            last_order_date = NEW.created_at
        WHERE id = NEW.customer_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply customer stats update trigger
CREATE TRIGGER update_customer_stats_trigger AFTER INSERT ON orders FOR EACH ROW EXECUTE FUNCTION update_customer_stats();

-- =====================================================
-- USEFUL VIEWS FOR REPORTING
-- =====================================================

-- Product catalog view with category information
CREATE VIEW product_catalog AS
SELECT 
    p.id,
    p.title,
    p.slug,
    p.description,
    p.price,
    p.compare_at_price,
    p.sku,
    p.status,
    p.featured,
    p.created_at,
    p.updated_at,
    COALESCE(
        (SELECT string_agg(c.title, ', ' ORDER BY c.title)
         FROM product_categories pc
         JOIN categories c ON pc.category_id = c.id
         WHERE pc.product_id = p.id), 
        'Uncategorized'
    ) as categories,
    (SELECT COUNT(*) FROM product_images pi WHERE pi.product_id = p.id) as image_count,
    (SELECT COUNT(*) FROM product_variants pv WHERE pv.product_id = p.id) as variant_count
FROM products p;

-- Order summary view
CREATE VIEW order_summary AS
SELECT 
    o.id,
    o.order_number,
    o.created_at,
    c.first_name || ' ' || c.last_name as customer_name,
    c.email as customer_email,
    o.status,
    o.payment_status,
    o.total,
    o.currency,
    COUNT(oi.id) as item_count,
    SUM(oi.quantity) as total_quantity
FROM orders o
JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.created_at, c.first_name, c.last_name, c.email, o.status, o.payment_status, o.total, o.currency;

-- Customer analytics view
CREATE VIEW customer_analytics AS
SELECT 
    c.id,
    c.first_name || ' ' || c.last_name as customer_name,
    c.email,
    c.customer_group,
    c.status,
    c.total_spent,
    c.total_orders,
    c.last_order_date,
    c.created_at as customer_since,
    CASE 
        WHEN c.total_orders = 0 THEN 'New'
        WHEN c.total_orders BETWEEN 1 AND 5 THEN 'Regular'
        WHEN c.total_orders BETWEEN 6 AND 20 THEN 'Frequent'
        ELSE 'VIP'
    END as customer_tier
FROM customers c;

-- Inventory status view
CREATE VIEW inventory_status AS
SELECT 
    p.id as product_id,
    p.title as product_name,
    p.sku,
    p.quantity as product_quantity,
    p.track_quantity,
    p.low_stock_threshold,
    CASE 
        WHEN NOT p.track_quantity THEN 'Not Tracked'
        WHEN p.quantity = 0 THEN 'Out of Stock'
        WHEN p.quantity <= p.low_stock_threshold THEN 'Low Stock'
        ELSE 'In Stock'
    END as stock_status,
    COALESCE(SUM(pv.quantity), 0) as total_variant_quantity,
    COUNT(pv.id) as variant_count
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
GROUP BY p.id, p.title, p.sku, p.quantity, p.track_quantity, p.low_stock_threshold;

-- =====================================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- Insert sample admin user
INSERT INTO users (name, email, password, role) VALUES 
('Super Admin', 'admin@afrimall.com', '$2a$10$example_hash_here', 'super_admin');

-- Insert sample categories
INSERT INTO categories (title, slug, description, status, featured) VALUES 
('Electronics', 'electronics', 'Electronic devices and gadgets', 'active', true),
('Fashion', 'fashion', 'Clothing and accessories', 'active', true),
('Home & Garden', 'home-garden', 'Home improvement and garden supplies', 'active', false),
('Sports', 'sports', 'Sports equipment and apparel', 'active', false);

-- Insert sample products
INSERT INTO products (title, slug, description, price, sku, status, featured) VALUES 
('Smartphone Pro', 'smartphone-pro', 'Latest generation smartphone with advanced features', 599.99, 'SP-001', 'active', true),
('Wireless Headphones', 'wireless-headphones', 'High-quality wireless headphones with noise cancellation', 199.99, 'WH-001', 'active', true),
('Cotton T-Shirt', 'cotton-t-shirt', 'Comfortable 100% cotton t-shirt', 29.99, 'CT-001', 'active', false);

-- =====================================================
-- GRANTS AND PERMISSIONS (ADJUST AS NEEDED)
-- =====================================================

-- Create application user (replace 'afrimall_app' with your desired username)
-- CREATE USER afrimall_app WITH PASSWORD 'your_secure_password_here';

-- Grant necessary permissions
-- GRANT CONNECT ON DATABASE your_database_name TO afrimall_app;
-- GRANT USAGE ON SCHEMA public TO afrimall_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO afrimall_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO afrimall_app;

-- =====================================================
-- MAINTENANCE QUERIES
-- =====================================================

-- Query to clean up expired shopping carts (run periodically)
-- DELETE FROM shopping_cart WHERE expires_at < NOW() AND status = 'abandoned';

-- Query to update product availability based on variants
-- UPDATE products SET quantity = (
--     SELECT COALESCE(SUM(pv.quantity), 0) 
--     FROM product_variants pv 
--     WHERE pv.product_id = products.id AND pv.status = 'active'
-- ) WHERE track_quantity = true;

-- Query to find low stock products
-- SELECT * FROM inventory_status WHERE stock_status IN ('Low Stock', 'Out of Stock');

-- =====================================================
-- END OF SCHEMA
-- =====================================================
