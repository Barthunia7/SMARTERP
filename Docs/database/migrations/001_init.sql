-- 1. Users Access Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Multi-Tenant Companies Profile Table.
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(150) NOT NULL,
    gst_number VARCHAR(15),
    state VARCHAR(50) NOT NULL,
    financial_year_start DATE NOT NULL
);

-- 3. Consolidated Ledgers Table (Supplier / Customer Only)
CREATE TABLE ledgers (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    ledger_type VARCHAR(50) NOT NULL, -- STRICTLY: 'CUSTOMER' or 'SUPPLIER'
    current_balance DECIMAL(15, 2) DEFAULT 0.00,
    UNIQUE(company_id, name)
);

-- 4. Units of Measure Table
CREATE TABLE units_of_measure (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    uom_code VARCHAR(10) NOT NULL, -- 'PCS', 'KG', 'BOX'
    UNIQUE(company_id, uom_code)
);

-- 5. Inventory Stock Items Table
CREATE TABLE stock_items (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    uom_id INT NOT NULL REFERENCES units_of_measure(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    purchase_price DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    selling_price DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    current_quantity DECIMAL(12, 3) NOT NULL DEFAULT 0.000,
    UNIQUE(company_id, name),
    UNIQUE(company_id, sku)
);

-- 6. Core Master Vouchers Header Table
CREATE TABLE vouchers (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    voucher_type VARCHAR(50) NOT NULL, -- STRICTLY: 'SALES' or 'PURCHASE'
    voucher_number VARCHAR(100) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    narration TEXT,
    UNIQUE(company_id, voucher_type, voucher_number)
);

-- 7. Voucher Inventory Line Items Table
CREATE TABLE voucher_inventory_lines (
    id SERIAL PRIMARY KEY,
    voucher_id INT NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
    item_id INT NOT NULL REFERENCES stock_items(id) ON DELETE RESTRICT,
    quantity DECIMAL(12, 3) NOT NULL,
    rate DECIMAL(15, 2) NOT NULL,
    line_total DECIMAL(15, 2) NOT NULL
);
CREATE OR REPLACE FUNCTION process_mvp_inventory_flow()
RETURNS TRIGGER AS $$
DECLARE
    v_type VARCHAR(50);
BEGIN
    -- Pull the context voucher type to verify direction
    SELECT voucher_type INTO v_type FROM vouchers WHERE id = NEW.voucher_id;
    
    IF v_type = 'PURCHASE' THEN
        UPDATE stock_items 
        SET current_quantity = current_quantity + NEW.quantity 
        WHERE id = NEW.item_id;
    ELSIF v_type = 'SALES' THEN
        UPDATE stock_items 
        SET current_quantity = current_quantity - NEW.quantity 
        WHERE id = NEW.item_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mvp_inventory_update
AFTER INSERT ON voucher_inventory_lines
FOR EACH ROW
EXECUTE FUNCTION process_mvp_inventory_flow();
