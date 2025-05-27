import { supabase } from '@/integrations/supabase/client';

interface KPI {
  total_sold: number;
  total_goal: number;
  total_clients: number;
  new_clients: number;
  global_avg_ticket: number;
}

interface Salesperson {
  name: string;
  sold: number;
  goal: number;
  challenge: boolean;
  mega: boolean;
  clients: number;
  new_clients: number;
  avg_ticket: number;
  photo_url: string;
}

interface DailySale {
  date: string; // Or Date, depending on how it's stored and returned
  sales: number;
  goal: number;
}

export async function getKPIs(month_year_filter?: string): Promise<KPI | null> {
  let query = supabase.from('kpis').select('total_sold, total_goal, total_clients, new_clients, global_avg_ticket');

  if (month_year_filter) {
    query = query.eq('month_year', month_year_filter);
  } else {
    // Fetch the latest entry based on month_year.
    // Assuming month_year is a string like "YYYY-MM".
    // If there's a created_at or a proper date field for ordering "latest", that would be more robust.
    // For now, ordering by month_year descending.
    query = query.order('month_year', { ascending: false });
  }

  // Always limit to 1 as we expect a single KPI object or the latest one.
  query = query.limit(1).single();

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching KPIs:', error);
    return null;
  }

  return data;
}

export async function getSalespeople(month_year_filter?: string): Promise<Salesperson[]> {
  let targetMonthYear = month_year_filter;

  if (!targetMonthYear) {
    // Fetch the latest month_year from the kpis table
    const { data: kpiData, error: kpiError } = await supabase
      .from('kpis')
      .select('month_year')
      .order('month_year', { ascending: false })
      .limit(1)
      .single();

    if (kpiError || !kpiData) {
      console.error('Error fetching latest month_year for salespeople:', kpiError);
      return [];
    }
    targetMonthYear = kpiData.month_year;
  }

  if (!targetMonthYear) {
    console.error('Could not determine month_year for filtering salespeople.');
    return [];
  }

  const { data, error } = await supabase
    .from('salespeople')
    .select('name, sold, goal, challenge, mega, clients, new_clients, avg_ticket, photo_url')
    .eq('month_year', targetMonthYear);

  if (error) {
    console.error('Error fetching salespeople:', error);
    return [];
  }

  return data || [];
}

export async function getDailySales(month_year_filter?: string): Promise<DailySale[]> {
  let targetMonthYear = month_year_filter;

  if (!targetMonthYear) {
    // Fetch the latest month_year from the kpis table
    const { data: kpiData, error: kpiError } = await supabase
      .from('kpis')
      .select('month_year')
      .order('month_year', { ascending: false })
      .limit(1)
      .single();

    if (kpiError || !kpiData) {
      console.error('Error fetching latest month_year for daily sales:', kpiError);
      return [];
    }
    targetMonthYear = kpiData.month_year;
  }

  if (!targetMonthYear) {
    console.error('Could not determine month_year for filtering daily sales.');
    return [];
  }

  // The daily_sales table has a 'date' column (full date) and a 'month_year' column for filtering.
  // We filter by 'month_year' to get all sales for that month.
  const { data, error } = await supabase
    .from('daily_sales')
    .select('date, sales, goal')
    .eq('month_year', targetMonthYear)
    .order('date', { ascending: true }); // Order by date to have them in sequence

  if (error) {
    console.error('Error fetching daily sales:', error);
    return [];
  }

  return data || [];
}
