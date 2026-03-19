-- Competitiel V2 Initial Schema
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- PRODUCTS (User's own products)
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  cost_price NUMERIC(10, 2),
  target_margin NUMERIC(5, 2),
  category TEXT,
  active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own products" ON products
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_active ON products(active);

-- ============================================================
-- COMPETITORS
-- ============================================================
CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  website_url TEXT,
  platform TEXT,
  notes TEXT,
  active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own competitors" ON competitors
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_competitors_user_id ON competitors(user_id);

-- ============================================================
-- COMPETITOR PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS competitor_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT,
  current_price NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'AUD' NOT NULL,
  last_scraped_at TIMESTAMPTZ,
  scrape_enabled BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE competitor_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own competitor products" ON competitor_products
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_competitor_products_competitor_id ON competitor_products(competitor_id);
CREATE INDEX idx_competitor_products_user_id ON competitor_products(user_id);

-- ============================================================
-- PRICE HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_product_id UUID NOT NULL REFERENCES competitor_products(id) ON DELETE CASCADE,
  price NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'AUD' NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  source TEXT DEFAULT 'manual' NOT NULL
);

ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view price history for own competitor products" ON price_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM competitor_products cp
      WHERE cp.id = price_history.competitor_product_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert price history for own competitor products" ON price_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM competitor_products cp
      WHERE cp.id = price_history.competitor_product_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete price history for own competitor products" ON price_history
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM competitor_products cp
      WHERE cp.id = price_history.competitor_product_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE INDEX idx_price_history_competitor_product_id ON price_history(competitor_product_id);
CREATE INDEX idx_price_history_recorded_at ON price_history(recorded_at DESC);

-- ============================================================
-- PRODUCT LINKS (linking own products to competitor products)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  competitor_product_id UUID NOT NULL REFERENCES competitor_products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(product_id, competitor_product_id)
);

ALTER TABLE product_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own product links" ON product_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_links.product_id
      AND p.user_id = auth.uid()
    )
  );

CREATE INDEX idx_product_links_product_id ON product_links(product_id);
CREATE INDEX idx_product_links_competitor_product_id ON product_links(competitor_product_id);

-- ============================================================
-- PRICE ALERTS
-- ============================================================
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_link_id UUID REFERENCES product_links(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  threshold_pct NUMERIC(5, 2),
  dismissed BOOLEAN DEFAULT FALSE NOT NULL,
  actioned BOOLEAN DEFAULT FALSE NOT NULL,
  snoozed_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own price alerts" ON price_alerts
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX idx_price_alerts_dismissed ON price_alerts(dismissed);

-- ============================================================
-- ANALYSIS RESULTS
-- ============================================================
CREATE TABLE IF NOT EXISTS analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  competitor_id UUID REFERENCES competitors(id) ON DELETE SET NULL,
  analysis JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own analysis results" ON analysis_results
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_analysis_results_user_id ON analysis_results(user_id);
CREATE INDEX idx_analysis_results_created_at ON analysis_results(created_at DESC);

-- ============================================================
-- TRIGGER: Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: Update updated_at timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitor_products_updated_at
  BEFORE UPDATE ON competitor_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TRIGGER: Auto-log price history on competitor product price change
-- ============================================================
CREATE OR REPLACE FUNCTION log_price_history()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.current_price IS DISTINCT FROM NEW.current_price THEN
    INSERT INTO price_history (competitor_product_id, price, currency, source)
    VALUES (NEW.id, OLD.current_price, OLD.currency, 'manual');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_competitor_product_price_history
  BEFORE UPDATE ON competitor_products
  FOR EACH ROW EXECUTE FUNCTION log_price_history();
