-- SQL Schema for Core Sales and Billing Tables
-- File: consolidated_schema.sql
-- Generated on: 2023-10-29

-- Ensure pgcrypto extension is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = timezone('utc', now());
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to automatically populate month_year from sale_date for daily_sales
CREATE OR REPLACE FUNCTION public.populate_month_year_for_daily_sales()
RETURNS TRIGGER AS $$
BEGIN
   NEW.month_year = to_char(NEW.sale_date, 'YYYY-MM');
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to automatically populate month_year from entry_date for billing_reports
CREATE OR REPLACE FUNCTION public.populate_month_year_for_billing_reports()
RETURNS TRIGGER AS $$
BEGIN
   NEW.month_year = to_char(NEW.entry_date, 'YYYY-MM');
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Enum Type for User Roles
CREATE TYPE public.user_role_enum AS ENUM ('adm', 'sales', 'finance');

--
-- Table Definitions
--

-- Table for unique seller profiles
CREATE TABLE public.salespeople (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()), -- Standardized timestamp
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())  -- Standardized timestamp
);
COMMENT ON TABLE public.salespeople IS 'Stores profiles of unique salespeople.';
CREATE TRIGGER handle_salespeople_updated_at BEFORE UPDATE ON public.salespeople
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Table for Key Performance Indicators
CREATE TABLE public.kpis (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    month_year TEXT UNIQUE NOT NULL, -- Format YYYY-MM
    total_sold NUMERIC DEFAULT 0,
    total_goal NUMERIC DEFAULT 0,
    total_clients INTEGER DEFAULT 0,
    new_clients INTEGER DEFAULT 0,
    global_avg_ticket NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) -- Standardized timestamp
    -- No updated_at in original kpis, can be added if needed
);
COMMENT ON TABLE public.kpis IS 'Stores Key Performance Indicators on a monthly basis.';
-- If KPIs are mutable and need updated_at:
-- ALTER TABLE public.kpis ADD COLUMN updated_at TIMESTAMPTZ DEFAULT timezone('utc', now());
-- CREATE TRIGGER handle_kpis_updated_at BEFORE UPDATE ON public.kpis
--   FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();


-- Table for user roles
CREATE TABLE public.user_roles (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.user_role_enum NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc', now()),
    updated_at timestamp with time zone DEFAULT timezone('utc', now())
);
COMMENT ON TABLE public.user_roles IS 'Stores roles for authenticated users.';
CREATE TRIGGER handle_user_roles_updated_at BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Table for individual sales transaction records
CREATE TABLE public.sales_records (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    sale_date DATE NOT NULL,
    is_new_customer BOOLEAN DEFAULT false,
    order_number TEXT NOT NULL,
    customer_name TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()), -- Standardized
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()), -- Standardized
    updated_by UUID REFERENCES auth.users(id)
);
COMMENT ON TABLE public.sales_records IS 'Stores individual sales transaction records.';
CREATE TRIGGER handle_sales_records_updated_at BEFORE UPDATE ON public.sales_records
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Table for activity log
CREATE TABLE public.activity_log (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT timezone('utc', now()), -- Standardized
    user_id UUID NOT NULL REFERENCES auth.users(id),
    user_email TEXT NOT NULL,
    action_type TEXT NOT NULL,
    record_type TEXT NOT NULL,
    record_id TEXT,
    details TEXT
    -- No updated_at typically for logs, they are immutable once created.
);
COMMENT ON TABLE public.activity_log IS 'Stores a log of important activities within the application.';

-- Seller Targets Table
CREATE TABLE public.seller_targets (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    seller_id uuid NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
    month date NOT NULL,
    goal_value numeric(12,2) NOT NULL DEFAULT 0,
    challenge_value numeric(12,2) NOT NULL DEFAULT 0,
    mega_goal_value numeric(12,2) NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc', now()),
    updated_at timestamp with time zone DEFAULT timezone('utc', now()),
    UNIQUE (seller_id, month)
);
COMMENT ON TABLE public.seller_targets IS 'Stores monthly sales targets (goal, challenge, mega) for each salesperson.';
COMMENT ON COLUMN public.seller_targets.month IS 'First day of the target month (YYYY-MM-01).';
CREATE TRIGGER handle_seller_targets_updated_at BEFORE UPDATE ON public.seller_targets
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Daily Sales Table
CREATE TABLE public.daily_sales (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    sale_date date NOT NULL UNIQUE,
    sales_amount numeric(12,2) NOT NULL DEFAULT 0,
    goal_amount numeric(12,2) NOT NULL DEFAULT 0,
    month_year TEXT NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc', now()),
    updated_at timestamp with time zone DEFAULT timezone('utc', now())
);
COMMENT ON TABLE public.daily_sales IS 'Aggregated daily sales figures and goals for company-wide charts.';
COMMENT ON COLUMN public.daily_sales.sale_date IS 'Specific date of the sales summary. Should be unique.';
COMMENT ON COLUMN public.daily_sales.month_year IS 'Format YYYY-MM, derived from sale_date for easier filtering.';
CREATE INDEX IF NOT EXISTS idx_daily_sales_month_year ON public.daily_sales(month_year);
CREATE INDEX IF NOT EXISTS idx_daily_sales_sale_date ON public.daily_sales(sale_date);
CREATE TRIGGER handle_daily_sales_updated_at BEFORE UPDATE ON public.daily_sales
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER set_daily_sales_month_year BEFORE INSERT OR UPDATE ON public.daily_sales
  FOR EACH ROW EXECUTE PROCEDURE public.populate_month_year_for_daily_sales();

-- Billing Reports Table
CREATE TABLE public.billing_reports (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    month_year TEXT NOT NULL,
    faturamento_released NUMERIC NOT NULL DEFAULT 0,
    faturamento_atr NUMERIC NOT NULL DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);
COMMENT ON TABLE public.billing_reports IS 'Stores individual billing report entries, allowing multiple per month.';
COMMENT ON COLUMN public.billing_reports.entry_date IS 'Date the billing figures refer to or were entered.';
COMMENT ON COLUMN public.billing_reports.month_year IS 'Format YYYY-MM, derived from entry_date for easier filtering and aggregation.';
CREATE TRIGGER handle_billing_reports_updated_at BEFORE UPDATE ON public.billing_reports
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER set_billing_reports_month_year BEFORE INSERT OR UPDATE ON public.billing_reports
  FOR EACH ROW EXECUTE PROCEDURE public.populate_month_year_for_billing_reports();

--
-- Role-Checking SQL Functions
--
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id uuid)
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role::TEXT INTO v_role FROM public.user_roles WHERE user_id = p_user_id;
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_user_role(p_user_id) = 'adm';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_sales_user(p_user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_user_role(p_user_id) = 'sales';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_finance_user(p_user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_user_role(p_user_id) = 'finance';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.is_admin(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.current_user_is_sales()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.is_sales_user(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.current_user_is_finance()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.is_finance_user(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

--
-- RLS Policies
--

-- salespeople
ALTER TABLE public.salespeople ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Salespeople can be read by authenticated users" ON public.salespeople FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage salespeople" ON public.salespeople FOR ALL TO authenticated USING (public.current_user_is_admin()) WITH CHECK (public.current_user_is_admin());

-- kpis
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "KPIs can be read by authenticated users" ON public.kpis FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage KPIs" ON public.kpis FOR ALL TO authenticated USING (public.current_user_is_admin()) WITH CHECK (public.current_user_is_admin());

-- user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own role, admins can read all" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.current_user_is_admin());
CREATE POLICY "Admins can manage user roles" ON public.user_roles FOR ALL TO authenticated USING (public.current_user_is_admin()) WITH CHECK (public.current_user_is_admin());

-- sales_records
ALTER TABLE public.sales_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sales users can CRUD their own sales records" ON public.sales_records FOR ALL TO authenticated
  USING (auth.uid() = created_by AND public.current_user_is_sales())
  WITH CHECK (auth.uid() = created_by AND public.current_user_is_sales());
CREATE POLICY "Assigned salespeople can view their sales records" ON public.sales_records FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.salespeople sp
    WHERE sp.id = public.sales_records.salesperson_id AND sp.email = (SELECT u.email FROM auth.users u WHERE u.id = auth.uid())
  ));
CREATE POLICY "Admins can manage all sales records" ON public.sales_records FOR ALL TO authenticated
  USING (public.current_user_is_admin())
  WITH CHECK (public.current_user_is_admin());
-- Note: Consider if Finance role needs SELECT access to all sales_records

-- activity_log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own activity logs" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can read all activity logs" ON public.activity_log FOR SELECT TO authenticated USING (public.current_user_is_admin());
-- Other roles (sales, finance) cannot read all logs unless specified.

-- seller_targets
ALTER TABLE public.seller_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read seller targets" ON public.seller_targets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage seller targets" ON public.seller_targets FOR ALL TO authenticated
  USING (public.current_user_is_admin())
  WITH CHECK (public.current_user_is_admin());
-- Policy for sellers to see their own targets (if seller_id linked to auth.users directly or via salespeople):
-- CREATE POLICY "Sellers can view their own targets" ON public.seller_targets FOR SELECT TO authenticated
--  USING (EXISTS (SELECT 1 FROM public.salespeople sp WHERE sp.id = seller_id AND sp.email = (SELECT u.email FROM auth.users u WHERE u.id = auth.uid())));

-- daily_sales
ALTER TABLE public.daily_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read daily sales" ON public.daily_sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins or Finance users can manage daily sales" ON public.daily_sales FOR ALL TO authenticated
  USING (public.current_user_is_admin() OR public.current_user_is_finance())
  WITH CHECK (public.current_user_is_admin() OR public.current_user_is_finance());

-- billing_reports
ALTER TABLE public.billing_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read billing reports" ON public.billing_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins or Finance users can manage billing reports" ON public.billing_reports FOR ALL TO authenticated
  USING (public.current_user_is_admin() OR public.current_user_is_finance())
  WITH CHECK (public.current_user_is_admin() OR public.current_user_is_finance());
-- Note: The original billing_reports RLS was creator-based. This is changed to role-based for Admin/Finance.
-- If individual users were meant to create their own billing reports under their user_id, that would need a separate policy.
-- The current created_by field on billing_reports would allow tracking, but RLS here is role-based for CUD.

-- End of consolidated_schema.sql
