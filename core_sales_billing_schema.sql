-- SQL Schema for Core Sales and Billing Tables
-- File: core_sales_billing_schema.sql
-- Generated on: 2023-10-28

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

--
-- Daily Sales Table for aggregated daily sales figures for charts.
--
CREATE TABLE public.daily_sales (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    sale_date date NOT NULL UNIQUE, -- Assuming one summary entry per day for the entire company
    sales_amount numeric(12,2) NOT NULL DEFAULT 0,
    goal_amount numeric(12,2) NOT NULL DEFAULT 0, -- Daily goal for the company
    month_year TEXT NOT NULL, -- "YYYY-MM", for indexing and filtering
    -- salesperson_id uuid REFERENCES public.salespeople(id) ON DELETE SET NULL, -- Optional: if daily sales are tracked per salesperson
    created_at timestamp with time zone DEFAULT timezone('utc', now()),
    updated_at timestamp with time zone DEFAULT timezone('utc', now())
);

COMMENT ON TABLE public.daily_sales IS 'Aggregated daily sales figures and goals for company-wide charts.';
COMMENT ON COLUMN public.daily_sales.sale_date IS 'Specific date of the sales summary. Should be unique.';
COMMENT ON COLUMN public.daily_sales.month_year IS 'Format YYYY-MM, derived from sale_date for easier filtering.';

-- Create an index on month_year for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_sales_month_year ON public.daily_sales(month_year);
CREATE INDEX IF NOT EXISTS idx_daily_sales_sale_date ON public.daily_sales(sale_date);


-- Trigger to automatically update updated_at on row update for daily_sales
CREATE TRIGGER handle_daily_sales_updated_at BEFORE UPDATE ON public.daily_sales
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at_column();

-- Trigger to automatically populate month_year from sale_date
CREATE OR REPLACE FUNCTION public.populate_month_year_for_daily_sales()
RETURNS TRIGGER AS $$
BEGIN
   NEW.month_year = to_char(NEW.sale_date, 'YYYY-MM');
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_daily_sales_month_year BEFORE INSERT OR UPDATE ON public.daily_sales
  FOR EACH ROW
  EXECUTE PROCEDURE public.populate_month_year_for_daily_sales();

-- RLS Policies for 'daily_sales' table
ALTER TABLE public.daily_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read all daily sales"
  ON public.daily_sales FOR SELECT
  TO authenticated
  USING (true);

-- For now, allow authenticated users to also write.
-- This should be reviewed based on how data is populated (manual entry vs. aggregation job).
CREATE POLICY "Allow authenticated users to manage daily sales"
  ON public.daily_sales FOR ALL -- INSERT, UPDATE, DELETE
  TO authenticated
  USING (true) -- Or add created_by if users manage their own entries
  WITH CHECK (true);

--
-- Billing Reports Table (Refactored from monthly_billing_reports)
--
CREATE TABLE public.billing_reports (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE, -- Date of the billing entry
    month_year TEXT NOT NULL, -- "YYYY-MM", auto-populated from entry_date
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

-- Trigger to automatically update updated_at on row update for billing_reports
CREATE TRIGGER handle_billing_reports_updated_at BEFORE UPDATE ON public.billing_reports
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at_column();

-- Function to automatically populate month_year from entry_date for billing_reports
CREATE OR REPLACE FUNCTION public.populate_month_year_for_billing_reports()
RETURNS TRIGGER AS $$
BEGIN
   NEW.month_year = to_char(NEW.entry_date, 'YYYY-MM');
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to set month_year before insert or update on billing_reports
CREATE TRIGGER set_billing_reports_month_year BEFORE INSERT OR UPDATE ON public.billing_reports
  FOR EACH ROW
  EXECUTE PROCEDURE public.populate_month_year_for_billing_reports();

-- RLS Policies for 'billing_reports' table
ALTER TABLE public.billing_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to select all billing reports"
  ON public.billing_reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert billing reports"
  ON public.billing_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow users to update their own billing reports"
  ON public.billing_reports FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = updated_by);

CREATE POLICY "Allow creator to delete their billing reports"
  ON public.billing_reports FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);
