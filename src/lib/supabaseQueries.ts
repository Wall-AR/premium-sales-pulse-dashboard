import { supabase } from '@/integrations/supabase/client';
import { addHistoryLogEntry, NewHistoryLogEntryData } from './historyLog'; 

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

    if (kpiError || !kpiData?.month_year) { // Check month_year specifically
      console.error('KPI lookup failed for month_year. Trying fallback to most recent month_year in salespeople table.', kpiError);
      const { data: latestSalespeopleMonth, error: latestSalespeopleMonthError } = await supabase
        .from('salespeople')
        .select('month_year') 
        .order('month_year', { ascending: false })
        .limit(1)
        .maybeSingle(); // Use maybeSingle to handle null result without error

      if (latestSalespeopleMonthError || !latestSalespeopleMonth?.month_year) {
        console.error('Could not determine most recent month_year from salespeople table either:', latestSalespeopleMonthError);
        return []; // Fallback to empty if no month_year found anywhere
      }
      targetMonthYear = latestSalespeopleMonth.month_year;
      console.log("Using fallback targetMonthYear from salespeople table:", targetMonthYear);
    } else if (kpiData?.month_year) { // Ensure kpiData and month_year exist
      targetMonthYear = kpiData.month_year;
    }
  }

  if (!targetMonthYear) { // This check might be redundant if the above logic always sets it or returns
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


// --- Sales Records CRUD ---

export interface SaleRecord {
  id: string; // UUID
  salesperson_id: string; // FK to salespeople.id
  amount: number;
  sale_date: string; // YYYY-MM-DD
  is_new_customer: boolean;
  order_number: string;
  customer_name?: string | null;
  created_at: string; // ISO timestamp
  created_by: string; // User ID from auth.users
  updated_at?: string | null; // ISO timestamp
  updated_by?: string | null; // User ID from auth.users
}

// Type for inserting new sale records. `created_by` will be added before sending.
// `id`, `created_at`, `updated_at`, `updated_by` are handled by DB or subsequent updates.
export type NewSaleRecordData = Omit<SaleRecord, 'id' | 'created_at' | 'updated_at' | 'updated_by'>;

export async function addSaleRecord(
  // The actual data passed to this function will have created_by already merged.
  saleData: NewSaleRecordData 
): Promise<{ data: SaleRecord | null; error: any }> {
  const { data, error } = await supabase
    .from('sales_records')
    .insert(saleData)
    .select()
    .single();

  if (error) {
    console.error('Error adding sale record:', error);
  }
  return { data, error };
}

export async function updateSaleRecord(
  saleId: string,
  // The actual data passed will have updated_by already merged.
  saleData: Partial<Omit<NewSaleRecordData, 'created_by' | 'salesperson_id'>> & { updated_by: string } 
): Promise<{ data: SaleRecord | null; error: any }> {
  // `created_by` and `salesperson_id` are typically not changed on update.
  // `salesperson_id` could be updatable if requirements allow, but often it's fixed.
  // For this function, we assume `salesperson_id` is not part of the updatable fields directly.
  // If it needs to be, the type Partial<Omit<NewSaleRecordData, 'created_by'>> would include it.
  
  const dataToUpdate = {
    ...saleData,
    updated_at: new Date().toISOString(), // Manually set updated_at, though DB can also handle this.
  };

  const { data, error } = await supabase
    .from('sales_records')
    .update(dataToUpdate)
    .eq('id', saleId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating sale record ${saleId}:`, error);
  }
  return { data, error };
}

export async function getSaleRecordById(
  saleId: string
): Promise<{ data: SaleRecord | null; error: any }> {
  const { data, error } = await supabase
    .from('sales_records')
    .select('*') // Select all columns for a SaleRecord
    .eq('id', saleId)
    .single();

  if (error) {
    console.error(`Error fetching sale record ${saleId}:`, error);
  }
  return { data, error };
}

export async function deleteSaleRecord(saleId: string): Promise<{ error: any }> {
  const { error } = await supabase
    .from('sales_records')
    .delete()
    .eq('id', saleId);

  if (error) {
    console.error(`Error deleting sale record ${saleId}:`, error);
  }
  return { error };
}

// Phase 1: Seller Management - New Interface and Query Function
export interface SellerProfile {
  id: string; // Assuming 'id' exists on the 'salespeople' table and is a unique identifier for the seller.
  name: string;
  email: string; // Assuming 'email' exists on the 'salespeople' table.
  status: 'active' | 'inactive' | 'pending'; // Assuming 'status' exists on the 'salespeople' table.
  photo_url: string | null;
}

export async function getAllSellerProfiles(): Promise<SellerProfile[]> {
  // This function now queries the 'salespeople' table.
  // It assumes that the 'salespeople' table contains columns like 'id', 'email', and 'status'
  // for each seller profile. If the 'salespeople' table primarily stores monthly performance data
  // (meaning multiple rows for the same seller with different month_year), this query might return
  // duplicate seller profiles if not handled by table structure (e.g. unique constraint on user_id/email)
  // or if additional logic for deduplication isn't added.
  // For now, we select directly, assuming the table can provide these profile details.
  const { data, error } = await supabase
    .from('salespeople') // Changed from 'seller_profiles'
    .select('id, name, email, status, photo_url') // Ensure these columns exist on 'salespeople' table
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching all seller profiles from salespeople table:', error);
    return [];
  }

  return data || [];
}

export type NewSellerProfileData = Omit<SellerProfile, 'id'>; 

export async function addSellerProfile(
  sellerData: NewSellerProfileData,
  userId: string,
  userEmail: string
): Promise<{ data: SellerProfile | null, error: any }> {
  
  // Ensure photo_url is explicitly null if not provided or an empty string, to avoid DB constraint issues.
  const dataToInsert = {
    ...sellerData,
    photo_url: sellerData.photo_url || null,
  };

  const { data, error } = await supabase
    .from('salespeople')
    .insert(dataToInsert)
    .select() // Select the inserted row(s)
    .single(); // Assuming we insert one record and want it returned

  if (error) {
    console.error('Error adding seller profile:', error);
    return { data: null, error };
  }

  if (data) {
    // Log history
    const logEntry: NewHistoryLogEntryData = {
      user_id: userId,
      user_email: userEmail,
      action_type: 'SELLER_CREATED',
      record_type: 'seller',
      record_id: data.id, // data is the created seller profile
      details: `Vendedor "${data.name}" (ID: ${data.id}) criado.`,
    };
    const logResult = await addHistoryLogEntry(logEntry);
    if (logResult.error) {
      console.error("Failed to add history log for SELLER_CREATED:", logResult.error);
      // Do not block the main operation due to logging failure
    }
  }

  return { data, error: null };
}

export async function updateSellerProfile(
  sellerId: string, 
  sellerData: Partial<NewSellerProfileData>,
  userId: string, // Added
  userEmail: string // Added
): Promise<{ data: SellerProfile | null, error: any }> {
  // Ensure photo_url is explicitly null if an empty string is passed for an update
  const dataToUpdate = { ...sellerData };
  if (sellerData.photo_url === '') {
    dataToUpdate.photo_url = null;
  }

  const { data, error } = await supabase
    .from('salespeople')
    .update(dataToUpdate)
    .eq('id', sellerId)
    .select()
    .single();

  if (error) {
    console.error('Error updating seller profile:', error);
    return { data: null, error };
  }

  // The erroneous logging block that was here has been removed.
  // Correct logging for deleteSellerProfile will be added in a subsequent step
  // if it's part of the requirements for that function.

  return { data, error: null };
}

export async function deleteSellerProfile(
  sellerId: string
  // userId, userEmail, and sellerName will be added in a subsequent step for this function
): Promise<{ error: any }> {
  const { error } = await supabase
    .from('salespeople')
    .delete()
    .eq('id', sellerId);

  if (error) {
    console.error('Error deleting seller profile:', error);
    return { error };
  }

  return { error: null };
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

    if (kpiError || !kpiData?.month_year) { // Check month_year specifically
      console.log("KPI lookup failed for month_year. Trying fallback to most recent month_year in salespeople table.");
      const { data: latestSalespeopleMonth, error: latestSalespeopleMonthError } = await supabase
        .from('salespeople')
        .select('month_year') // Select the month_year column
        .order('month_year', { ascending: false })
        .limit(1)
        .maybeSingle(); // Use maybeSingle to handle null result without error

      if (latestSalespeopleMonthError || !latestSalespeopleMonth?.month_year) {
        console.error('Could not determine most recent month_year from salespeople table either:', latestSalespeopleMonthError);
        return []; // Fallback to empty if no month_year found anywhere
      }
      targetMonthYear = latestSalespeopleMonth.month_year;
      console.log("Using fallback targetMonthYear from salespeople table:", targetMonthYear);
    } else if (kpiData?.month_year) { // Ensure kpiData and month_year exist
      targetMonthYear = kpiData.month_year;
    }
  }

  if (!targetMonthYear) { // This check might be redundant if the above logic always sets it or returns
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
