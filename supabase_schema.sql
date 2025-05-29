-- Supabase Schema for Sales Dashboard
-- This file contains the SQL statements to create the necessary tables for the application.
-- Review and adjust Row Level Security (RLS) policies as per your application's specific security requirements.

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

-- Table for unique seller profiles
CREATE TABLE public.salespeople (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.salespeople IS 'Stores profiles of unique salespeople.';
ALTER TABLE public.salespeople ENABLE ROW LEVEL SECURITY;
-- Example RLS policies (adjust as needed):
-- For owner-based update/delete RLS on salespeople, consider adding a 'created_by UUID REFERENCES auth.users(id)' column.
-- CREATE POLICY "Allow public read access" ON public.salespeople FOR SELECT USING (true);
-- CREATE POLICY "Allow authenticated users to insert" ON public.salespeople FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "Allow specific roles to update" ON public.salespeople FOR UPDATE USING (check_user_role('admin')) WITH CHECK (check_user_role('admin')); -- Requires a function like check_user_role
-- CREATE POLICY "Allow specific roles to delete" ON public.salespeople FOR DELETE USING (check_user_role('admin')); -- Requires a function like check_user_role

-- Table for Key Performance Indicators
CREATE TABLE public.kpis (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    month_year TEXT UNIQUE NOT NULL, -- Format YYYY-MM
    total_sold NUMERIC DEFAULT 0,
    total_goal NUMERIC DEFAULT 0,
    total_clients INTEGER DEFAULT 0,
    new_clients INTEGER DEFAULT 0,
    global_avg_ticket NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.kpis IS 'Stores Key Performance Indicators on a monthly basis.';
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;
-- Example RLS:
-- CREATE POLICY "Allow public read access" ON public.kpis FOR SELECT USING (true);
-- CREATE POLICY "Allow authenticated users to manage" ON public.kpis FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Table for individual sales transaction records
CREATE TABLE public.sales_records (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    salesperson_id UUID NOT NULL REFERENCES public.salespeople(id),
    amount NUMERIC NOT NULL,
    sale_date DATE NOT NULL,
    is_new_customer BOOLEAN DEFAULT false,
    order_number TEXT NOT NULL,
    customer_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);
COMMENT ON TABLE public.sales_records IS 'Stores individual sales transaction records.';
ALTER TABLE public.sales_records ENABLE ROW LEVEL SECURITY;
-- Example RLS:
-- CREATE POLICY "Allow owner to manage their own records" ON public.sales_records FOR ALL USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
-- CREATE POLICY "Allow salesperson to read their own sales records" ON public.sales_records FOR SELECT USING (EXISTS (SELECT 1 FROM public.salespeople sp WHERE sp.id = salesperson_id AND sp.email = (SELECT email FROM auth.users WHERE id = auth.uid())));
-- CREATE POLICY "Allow managers to view all sales records" ON public.sales_records FOR SELECT USING (check_user_role('manager')); -- Requires a role check function

-- Table for activity log
CREATE TABLE public.activity_log (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT now(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    user_email TEXT NOT NULL, -- Denormalized for easy display
    action_type TEXT NOT NULL,
    record_type TEXT NOT NULL,
    record_id TEXT, -- Can be UUID or other text ID.
    details TEXT
);
COMMENT ON TABLE public.activity_log IS 'Stores a log of important activities within the application.';
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
-- Example RLS (typically more restrictive for logs):
-- CREATE POLICY "Allow admin read access" ON public.activity_log FOR SELECT USING (check_user_role('admin')); -- Requires custom admin check function
-- CREATE POLICY "Allow system to insert logs" ON public.activity_log FOR INSERT WITH CHECK (auth.role() = 'service_role'); -- Or specific user for logging
-- Application code should handle inserts, typically using a service role key or a designated backend user.
-- Users should generally not be able to directly insert into this table other than through defined application logic.
-- CREATE POLICY "Allow authenticated users to insert their own activity logs if user_id matches"
--   ON public.activity_log FOR INSERT
--   WITH CHECK (auth.uid() = user_id AND auth.jwt()->>'email' = user_email);
-- (Consider if users should directly log their own actions or if this should be backend-driven)
