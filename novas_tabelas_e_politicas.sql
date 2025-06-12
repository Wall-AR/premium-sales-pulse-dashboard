-- SQL Migrations for Seller Targets and Future Enhancements
-- File: novas_tabelas_e_politicas.sql
-- Generated on: 2023-10-27 -- Placeholder for actual date

-- Ensure pgcrypto extension is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

-- Function to update the updated_at column (if not already globally defined in your Supabase project)
-- This function is general and can be used by multiple tables.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = timezone('utc', now()); -- Ensure UTC for consistency
   RETURN NEW;
END;
$$ language 'plpgsql';

--
-- Seller Targets Table to store monthly goals for each salesperson.
--
CREATE TABLE public.seller_targets (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    seller_id uuid NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE, -- Assumes public.salespeople table exists
    month date NOT NULL, -- Store as the first day of the target month, e.g., '2024-07-01'
    goal_value numeric(12,2) NOT NULL DEFAULT 0,
    challenge_value numeric(12,2) NOT NULL DEFAULT 0,
    mega_goal_value numeric(12,2) NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc', now()),
    updated_at timestamp with time zone DEFAULT timezone('utc', now()),
    UNIQUE (seller_id, month) -- Ensures one target entry per seller per month
);

COMMENT ON TABLE public.seller_targets IS 'Stores monthly sales targets (goal, challenge, mega) for each salesperson.';
COMMENT ON COLUMN public.seller_targets.month IS 'First day of the target month (YYYY-MM-01).';

-- Trigger to automatically update updated_at on row update for seller_targets
CREATE TRIGGER handle_seller_targets_updated_at BEFORE UPDATE ON public.seller_targets
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at_column();

-- RLS Policies for seller_targets table
ALTER TABLE public.seller_targets ENABLE ROW LEVEL SECURITY;

-- Policy: Allow read for authenticated users
CREATE POLICY "Allow read for authenticated users on seller_targets"
  ON public.seller_targets
  FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated');

-- Policy: Allow write for assigned sellers (or admins/specific roles in a real scenario)
-- The current policy is restrictive: only if the user's auth.uid() matches the seller_id UUID.
-- This implies seller_id in seller_targets is the user's own auth.uid, NOT a FK to salespeople.id if salespeople are different users.
-- If an admin needs to manage these, or if seller_id links to salespeople.id and sellers log in with their own accounts,
-- this policy needs to be adjusted (e.g., role-based, or checking against an email in salespeople table linked to auth.uid()).
-- For this exercise, we implement the user's specific request, noting its implications.
CREATE POLICY "Allow write for assigned sellers or specific logic on seller_targets"
  ON public.seller_targets
  FOR ALL
  TO authenticated
  USING (auth.uid() = seller_id) -- This condition means the current user IS the seller_id (which is a UUID)
  WITH CHECK (auth.uid() = seller_id);

-- Example of a more typical admin/owner policy for future reference:
-- CREATE POLICY "Allow admins to manage all targets"
--   ON public.seller_targets
--   FOR ALL
--   TO authenticated
--   USING (is_admin_user_function(auth.uid())) -- Requires an admin check function
--   WITH CHECK (is_admin_user_function(auth.uid()));

-- CREATE POLICY "Allow sellers to manage their own targets linked via salespeople table"
--   ON public.seller_targets
--   FOR ALL
--   TO authenticated
--   USING (EXISTS (
--       SELECT 1 FROM public.salespeople sp
--       WHERE sp.id = public.seller_targets.seller_id AND sp.email = (SELECT u.email FROM auth.users u WHERE u.id = auth.uid())
--   ))
--   WITH CHECK (EXISTS (
--       SELECT 1 FROM public.salespeople sp
--       WHERE sp.id = public.seller_targets.seller_id AND sp.email = (SELECT u.email FROM auth.users u WHERE u.id = auth.uid())
--   ));


-- Add other tables or policies below as needed in the future.
-- For example, the monthly_billing_reports table from previous work could also be formally added here if desired
-- to consolidate schema definitions, though it's already in supabase_schema.sql.
-- For this task, only seller_targets is explicitly added as new.
