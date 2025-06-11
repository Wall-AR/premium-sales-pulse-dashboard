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
  let queryBuilder = supabase.from('kpis').select('total_sold, total_goal, total_clients, new_clients, global_avg_ticket');
  if (month_year_filter) {
    queryBuilder = queryBuilder.eq('month_year', month_year_filter);
  } else {
    queryBuilder = queryBuilder.order('month_year', { ascending: false });
  }
  queryBuilder = queryBuilder.limit(1); // Keep limit(1)

  const { data: kpiResult, error } = await queryBuilder;

  if (error) {
    console.error('Error fetching KPIs:', error);
    return null;
  }
  if (!kpiResult || kpiResult.length === 0) {
    console.log('[getKPIs] No KPI data found for filter:', month_year_filter);
    return null;
  }
  // console.log('[getKPIs] Raw KPI data:', kpiResult[0]); // Optional: for debugging if needed
  return kpiResult[0] as KPI; // Return the first (and only) item
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

    if (kpiError || !kpiData?.month_year) {
      console.error('Failed to fetch latest month_year from kpis for getSalespeople. Returning empty array.', kpiError);
      return [];
    }
    targetMonthYear = kpiData.month_year;
    console.log("Using month_year from kpis for getSalespeople:", targetMonthYear);
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

export async function getSellerProfileById(
  sellerId: string
): Promise<{ data: SellerProfile | null; error: any }> {
  if (!sellerId) { // Basic check
    return { data: null, error: { message: "Seller ID is required." } };
  }
  const { data, error } = await supabase
    .from('salespeople')
    .select('id, name, email, status, photo_url') // Select SellerProfile fields
    .eq('id', sellerId)
    .single();

  if (error) {
    console.error(`Error fetching seller profile by ID ${sellerId}:`, error);
  }
  return { data, error };
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
  saleData: NewSaleRecordData,
  userEmail: string // Added userEmail for logging
): Promise<{ data: SaleRecord | null; error: any }> {
  console.log('[supabaseQueries.ts] addSaleRecord received saleData:', JSON.stringify(saleData, null, 2));
  const { data, error } = await supabase
    .from('sales_records')
    .insert(saleData)
    .select()
    .single();
  console.log('[supabaseQueries.ts] Supabase response from insert:', { data: JSON.stringify(data, null, 2), error: JSON.stringify(error, null, 2) });

  if (error) {
    console.error('Error adding sale record:', error);
  } else if (data) { // If sale record creation was successful and data is available
    const logEntry: NewHistoryLogEntryData = {
      user_id: saleData.created_by,
      user_email: userEmail,
      action_type: 'SALE_CREATED',
      record_type: 'sale',
      record_id: data.id,
      details: `Venda (Nº Pedido: ${data.order_number}, Valor: ${data.amount}) registrada.`
    };
    const logResult = await addHistoryLogEntry(logEntry);
    if (logResult.error) {
      console.error("Failed to add history log for SALE_CREATED:", logResult.error);
    }
  }
  return { data, error };
}

export async function updateSaleRecord(
  saleId: string,
  saleData: Partial<Omit<NewSaleRecordData, 'created_by' | 'salesperson_id'>> & { updated_by: string },
  userEmail: string // Added userEmail for logging
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
  } else if (data) { // If sale record update was successful
    const logEntry: NewHistoryLogEntryData = {
      user_id: saleData.updated_by, // updated_by is the userId
      user_email: userEmail,        // Passed as a new parameter
      action_type: 'SALE_UPDATED',
      record_type: 'sale',
      record_id: data.id,       // 'data' is the successfully updated sale
      details: `Venda (Nº Pedido: ${data.order_number}, Valor: ${data.amount}) atualizada.`
    };
    const logResult = await addHistoryLogEntry(logEntry);
    if (logResult.error) {
      console.error("Failed to add history log for SALE_UPDATED:", logResult.error);
    }
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

export interface SalespersonPerformance extends SellerProfile {
  total_sales_amount: number;
  number_of_sales: number;
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
    .select('*') // Changed to select all columns
    .order('name', { ascending: true });

  console.log('[getAllSellerProfiles] Raw Supabase data:', data);
  console.error('[getAllSellerProfiles] Supabase error:', error); // Use console.error for errors

  if (error) {
    console.error('Error fetching all seller profiles (select *):', error.message); // More specific log
    return [];
  }
  // Ensure data is an array before returning, or default to empty array
  return Array.isArray(data) ? data : [];
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

  if (data) { // Check if data is not null (successful update)
    // Log history
    const logEntry: NewHistoryLogEntryData = {
      user_id: userId,
      user_email: userEmail,
      action_type: 'SELLER_UPDATED',
      record_type: 'seller',
      record_id: data.id, // 'data' here is the successfully updated seller
      details: `Vendedor "${data.name}" (ID: ${data.id}) atualizado.`
    };
    const logResult = await addHistoryLogEntry(logEntry);
    if (logResult.error) {
      console.error("Failed to add history log for SELLER_UPDATED:", logResult.error);
      // Do not block the main operation due to logging failure
    }
  }

  return { data, error: null };
}

export async function deleteSellerProfile(
  sellerId: string,
  userId: string, // Added
  userEmail: string, // Added
  sellerName?: string // Added
): Promise<{ error: any }> {
  const { error } = await supabase
    .from('salespeople')
    .delete()
    .eq('id', sellerId);

  if (error) {
    console.error('Error deleting seller profile:', error);
    return { error };
  }

  // If delete was successful, log history
  const logEntry: NewHistoryLogEntryData = {
    user_id: userId,
    user_email: userEmail,
    action_type: 'SELLER_DELETED',
    record_type: 'seller',
    record_id: sellerId,
    details: sellerName ? `Vendedor "${sellerName}" (ID: ${sellerId}) excluído.` : `Vendedor (ID: ${sellerId}) excluído.`
  };
  const logResult = await addHistoryLogEntry(logEntry);
  if (logResult.error) {
    console.error("Failed to add history log for SELLER_DELETED:", logResult.error);
    // Do not block the main operation due to logging failure, but the original error (if any) for delete is already handled.
  }

  return { error: null }; // Successfully deleted seller profile
}


export async function getDailySales(month_year_filter?: string): Promise<DailySale[]> {
  let targetMonthYear = month_year_filter;

  if (!targetMonthYear) {
    // Fetch the latest month_year from the kpis table
    const { data: kpiMonthData, error: kpiError } = await supabase
      .from('kpis')
      .select('month_year')
      .order('month_year', { ascending: false })
      .limit(1);

    if (kpiError) {
      console.error('Failed to fetch latest month_year from kpis for getDailySales due to query error:', kpiError);
      return []; // Return empty array as per original error handling
    }
    if (!kpiMonthData || kpiMonthData.length === 0 || !kpiMonthData[0]?.month_year) {
      console.warn('Failed to fetch latest month_year from kpis for getDailySales (no data or month_year field missing). Returning empty array.');
      return []; // Return empty array
    }
    targetMonthYear = kpiMonthData[0].month_year;
    console.log("Using month_year from kpis for getDailySales:", targetMonthYear);
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

export async function getSalespeopleWithPerformance(
  month_year_filter?: string // Optional filter for sales records
): Promise<SalespersonPerformance[]> {
  // 1. Fetch all seller profiles
  const { data: sellerProfiles, error: sellerError } = await supabase
    .from('salespeople')
    .select('id, name, email, status, photo_url'); // Explicitly select SellerProfile fields

  if (sellerError) {
    console.error('Error fetching seller profiles for performance data:', sellerError);
    return [];
  }
  if (!sellerProfiles) {
    console.log('[getSalespeopleWithPerformance] No seller profiles found.');
    return [];
  }

  // 2. Fetch relevant sales records
  // Note: RLS policies will apply to this query.
  let salesQuery = supabase.from('sales_records').select('salesperson_id, amount, sale_date'); // Added sale_date for filtering

  // Apply month_year_filter if provided.
  // This assumes sale_date is stored in 'YYYY-MM-DD' format.
  // And month_year_filter is 'YYYY-MM'.
  if (month_year_filter) {
    // Ensure the filter only applies if the month_year_filter is a valid string.
    if (typeof month_year_filter === 'string' && month_year_filter.match(/^\d{4}-\d{2}$/)) {
         // Get the first day of the month
        const startDate = `${month_year_filter}-01`;
        // Get the last day of the month
        const year = parseInt(month_year_filter.substring(0, 4));
        const month = parseInt(month_year_filter.substring(5, 7));
        const lastDay = new Date(year, month, 0).getDate(); // Day before the 1st of next month
        const endDate = `${month_year_filter}-${String(lastDay).padStart(2, '0')}`;

        salesQuery = salesQuery.gte('sale_date', startDate).lte('sale_date', endDate);
        console.log(`[getSalespeopleWithPerformance] Filtering sales from ${startDate} to ${endDate}`);
    } else {
        console.warn('[getSalespeopleWithPerformance] Invalid month_year_filter format. Skipping date filter. Expected YYYY-MM, got:', month_year_filter);
    }
  }

  const { data: salesRecords, error: salesError } = await salesQuery;

  if (salesError) {
    console.error('Error fetching sales records for performance data:', salesError);
    // Return profiles with zero sales if sales records fetch fails
    return sellerProfiles.map(profile => ({
      ...profile,
      total_sales_amount: 0,
      number_of_sales: 0,
    }));
  }

  console.log('[getSalespeopleWithPerformance] Fetched sellerProfiles:', sellerProfiles.length);
  console.log('[getSalespeopleWithPerformance] Fetched salesRecords:', salesRecords?.length || 0);

  // 3. Combine data
  const performanceData: SalespersonPerformance[] = sellerProfiles.map(profile => {
    const relevantSales = salesRecords?.filter(sr => sr.salesperson_id === profile.id) || [];
    const total_sales_amount = relevantSales.reduce((sum, sr) => sum + (sr.amount || 0), 0);
    const number_of_sales = relevantSales.length;

    return {
      ...profile,
      total_sales_amount,
      number_of_sales,
    };
  });

  // Optional: sort by performance (e.g., total sales amount)
  performanceData.sort((a, b) => b.total_sales_amount - a.total_sales_amount);

  console.log('[getSalespeopleWithPerformance] Processed performanceData:', performanceData.length);
  return performanceData;
}
