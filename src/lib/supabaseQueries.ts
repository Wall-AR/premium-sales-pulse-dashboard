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

export async function getSalesRecordsBySalesperson(
  salespersonId: string,
  filters?: { startDate?: string; endDate?: string; month_year?: string }
): Promise<SaleRecord[]> {
  if (!salespersonId) {
    console.warn('[getSalesRecordsBySalesperson] salespersonId is required.');
    return [];
  }

  let query = supabase
    .from('sales_records')
    .select('*') // Selects all columns defined in SaleRecord
    .eq('salesperson_id', salespersonId);

  if (filters?.month_year && typeof filters.month_year === 'string' && filters.month_year.match(/^\d{4}-\d{2}$/)) {
    console.log(`[getSalesRecordsBySalesperson] Applying month_year filter: ${filters.month_year}`);
    const year = parseInt(filters.month_year.substring(0, 4));
    const month = parseInt(filters.month_year.substring(5, 7));
    const startDate = `${filters.month_year}-01`;
    const lastDay = new Date(year, month, 0).getDate(); // Day before the 1st of next month
    const endDate = `${filters.month_year}-${String(lastDay).padStart(2, '0')}`;
    query = query.gte('sale_date', startDate).lte('sale_date', endDate);
    console.log(`[getSalesRecordsBySalesperson] Date range for month_year: ${startDate} to ${endDate}`);
  } else if (filters?.startDate && filters?.endDate) {
    console.log(`[getSalesRecordsBySalesperson] Applying startDate: ${filters.startDate}, endDate: ${filters.endDate}`);
    query = query.gte('sale_date', filters.startDate).lte('sale_date', filters.endDate);
  } else if (filters?.startDate) {
    console.log(`[getSalesRecordsBySalesperson] Applying startDate: ${filters.startDate}`);
    query = query.gte('sale_date', filters.startDate);
  } else if (filters?.endDate) {
    console.log(`[getSalesRecordsBySalesperson] Applying endDate: ${filters.endDate}`);
    query = query.lte('sale_date', filters.endDate);
  }

  query = query.order('sale_date', { ascending: false }); // Order after filtering

  const { data, error } = await query;

  if (error) {
    console.error(`[getSalesRecordsBySalesperson] Error fetching sales records for salesperson ${salespersonId} with filters ${JSON.stringify(filters)}:`, error);
    return [];
  }

  // console.log(`[getSalesRecordsBySalesperson] Fetched sales records for ${salespersonId}:`, data);
  return data || [];
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
  previous_period_total_sales_amount?: number;
  // New fields for individual targets for the current period
  current_goal_value?: number;
  current_challenge_value?: number;
  current_mega_goal_value?: number;
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


export async function getDailySales(month_year_filter?: string): Promise<{ currentMonthSales: DailySale[], previousMonthSales: DailySale[] }> {
  let targetMonthYear = month_year_filter;
  const emptyReturn = { currentMonthSales: [], previousMonthSales: [] };

  if (!targetMonthYear) {
    console.log('[getDailySales] No month_year_filter provided, attempting to fetch latest from kpis.');
    const { data: kpiMonthDataArray, error: kpiError } = await supabase
      .from('kpis')
      .select('month_year')
      .order('month_year', { ascending: false })
      .limit(1); // Fetch the most recent one as an array

    if (kpiError) {
      console.error('[getDailySales] Error fetching latest month_year from kpis:', kpiError);
      return emptyReturn;
    }

    if (!kpiMonthDataArray || kpiMonthDataArray.length === 0 || !kpiMonthDataArray[0]?.month_year) {
      console.warn('[getDailySales] Failed to fetch latest month_year from kpis (no data or month_year field missing). Returning empty sales arrays.');
      return emptyReturn;
    }
    targetMonthYear = kpiMonthDataArray[0].month_year;
    console.log("[getDailySales] Using month_year from kpis for targetMonthYear:", targetMonthYear);
  }

  if (!targetMonthYear) {
    console.error('[getDailySales] Could not determine targetMonthYear. Returning empty arrays.');
    return emptyReturn;
  }

  // Calculate previousMonthYear
  let previousMonthYear = '';
  const [year, month] = targetMonthYear.split('-').map(Number);
  const targetDate = new Date(year, month - 1, 1); // month is 0-indexed for Date constructor
  targetDate.setMonth(targetDate.getMonth() - 1);
  const prevYear = targetDate.getFullYear();
  const prevMonth = (targetDate.getMonth() + 1).toString().padStart(2, '0'); // month back to 1-indexed for YYYY-MM
  previousMonthYear = `${prevYear}-${prevMonth}`;
  console.log(`[getDailySales] Target month: ${targetMonthYear}, Previous month: ${previousMonthYear}`);

  // Fetch Current Month Sales
  const { data: currentMonthData, error: currentError } = await supabase
    .from('daily_sales')
    .select('date, sales, goal')
    .eq('month_year', targetMonthYear)
    .order('date', { ascending: true });

  if (currentError) {
    console.error(`[getDailySales] Error fetching daily sales for target month ${targetMonthYear}:`, currentError);
    return emptyReturn; // Return empty for both if current month fails
  }
  const currentMonthSales = currentMonthData || [];

  // Fetch Previous Month Sales
  let previousMonthSales: DailySale[] = [];
  if (previousMonthYear) {
    const { data: previousMonthData, error: previousError } = await supabase
      .from('daily_sales')
      .select('date, sales, goal') // Not selecting 'goal' for previous month as per original thought, but can be added if needed for comparison
      .eq('month_year', previousMonthYear)
      .order('date', { ascending: true });

    if (previousError) {
      console.error(`[getDailySales] Error fetching daily sales for previous month ${previousMonthYear}:`, previousError);
      // If previous month fails, we still return current month's data
    } else {
      previousMonthSales = previousMonthData || [];
    }
  }

  console.log(`[getDailySales] Fetched ${currentMonthSales.length} records for current month (${targetMonthYear}) and ${previousMonthSales.length} for previous month (${previousMonthYear}).`);
  return { currentMonthSales, previousMonthSales };
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

  // 2. Determine date ranges for current and previous periods if month_year_filter is provided
  let targetStartDate: string | undefined, targetEndDate: string | undefined;
  let previousStartDate: string | undefined, previousEndDate: string | undefined;
  let targetMonthDate: string | undefined; // To store YYYY-MM-01 for fetching targets

  if (month_year_filter && typeof month_year_filter === 'string' && month_year_filter.match(/^\d{4}-\d{2}$/)) {
    const year = parseInt(month_year_filter.substring(0, 4));
    const month = parseInt(month_year_filter.substring(5, 7));

    targetStartDate = `${month_year_filter}-01`;
    targetMonthDate = targetStartDate; // YYYY-MM-01
    const targetMonthLastDay = new Date(year, month, 0).getDate();
    targetEndDate = `${month_year_filter}-${String(targetMonthLastDay).padStart(2, '0')}`;

    const prevMonthDate = new Date(year, month - 1, 1);
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = (prevMonthDate.getMonth() + 1).toString().padStart(2, '0'); // Back to 1-indexed
    previousStartDate = `${prevYear}-${prevMonth}-01`;
    const prevMonthLastDay = new Date(prevYear, parseInt(prevMonth), 0).getDate();
    previousEndDate = `${prevYear}-${prevMonth}-${String(prevMonthLastDay).padStart(2, '0')}`;

    console.log(`[getSalespeopleWithPerformance] Current period: ${targetStartDate} to ${targetEndDate}`);
    console.log(`[getSalespeopleWithPerformance] Previous period: ${previousStartDate} to ${previousEndDate}`);
  } else if (month_year_filter) {
    console.warn('[getSalespeopleWithPerformance] Invalid month_year_filter format. Fetching all-time sales data. Expected YYYY-MM, got:', month_year_filter);
  } else {
    console.log('[getSalespeopleWithPerformance] No month_year_filter. Fetching all-time sales data.');
  }

  // 3. Fetch all sales records (RLS will apply). We will filter client-side or could make this more complex.
  // For simplicity with potentially two date ranges, fetching all relevant sales and filtering might be easier than complex OR queries.
  // However, for performance with large datasets, two separate queries filtered by date ranges would be better. Let's do two queries.

  let currentPeriodSalesRecords: SaleRecord[] = [];
  if (targetStartDate && targetEndDate) {
    const { data, error } = await supabase
      .from('sales_records')
      .select('salesperson_id, amount, sale_date')
      .gte('sale_date', targetStartDate)
      .lte('sale_date', targetEndDate);
    if (error) {
      console.error('Error fetching current period sales records:', error);
      // Decide if we should return empty or proceed without this data
    } else {
      currentPeriodSalesRecords = data || [];
    }
  } else if (!month_year_filter) { // Fetch all if no filter
    const { data, error } = await supabase.from('sales_records').select('salesperson_id, amount, sale_date');
    if (error) console.error('Error fetching all sales records:', error);
    else currentPeriodSalesRecords = data || [];
  }
  // If month_year_filter was invalid, currentPeriodSalesRecords remains empty, leading to 0 sales for current period.

  let previousPeriodSalesRecords: SaleRecord[] = [];
  if (previousStartDate && previousEndDate) {
    const { data, error } = await supabase
      .from('sales_records')
      .select('salesperson_id, amount') // Only need amount for previous period sum
      .gte('sale_date', previousStartDate)
      .lte('sale_date', previousEndDate);
    if (error) {
      console.error('Error fetching previous period sales records:', error);
    } else {
      previousPeriodSalesRecords = data || [];
    }
  }

  console.log(`[getSalespeopleWithPerformance] Fetched ${sellerProfiles.length} seller profiles.`);
  console.log(`[getSalespeopleWithPerformance] Fetched ${currentPeriodSalesRecords.length} current period sales records.`);
  console.log(`[getSalespeopleWithPerformance] Fetched ${previousPeriodSalesRecords.length} previous period sales records.`);

  // Fetch seller targets for the target month if applicable
  let sellerTargetsForMonth: SellerTarget[] = [];
  if (targetMonthDate) {
    sellerTargetsForMonth = await getSellerTargetsForMonth(targetMonthDate);
    console.log(`[getSalespeopleWithPerformance] Fetched ${sellerTargetsForMonth.length} targets for month ${targetMonthDate}`);
  }

  // 4. Combine data
  const performanceData: SalespersonPerformance[] = sellerProfiles.map(profile => {
    const currentSales = currentPeriodSalesRecords.filter(sr => sr.salesperson_id === profile.id);
    const total_sales_amount = currentSales.reduce((sum, sr) => sum + (sr.amount || 0), 0);
    const number_of_sales = currentSales.length;

    let previous_period_total_sales_amount: number | undefined = undefined;
    if (previousStartDate && previousEndDate) {
      const previousSales = previousPeriodSalesRecords.filter(sr => sr.salesperson_id === profile.id);
      previous_period_total_sales_amount = previousSales.reduce((sum, sr) => sum + (sr.amount || 0), 0);
    }

    const relevantTarget = targetMonthDate ? sellerTargetsForMonth.find(t => t.seller_id === profile.id) : undefined;

    return {
      ...profile,
      total_sales_amount,
      number_of_sales,
      previous_period_total_sales_amount,
      current_goal_value: relevantTarget?.goal_value ?? 0,
      current_challenge_value: relevantTarget?.challenge_value ?? 0,
      current_mega_goal_value: relevantTarget?.mega_goal_value ?? 0,
    };
  });

  performanceData.sort((a, b) => b.total_sales_amount - a.total_sales_amount);

  console.log('[getSalespeopleWithPerformance] Processed performanceData count:', performanceData.length);
  return performanceData;
}

// --- Seller Targets ---

export interface SellerTarget {
  id: string; // UUID
  seller_id: string; // UUID FK to public.salespeople
  month: string; // YYYY-MM-DD (first day of month)
  goal_value: number;
  challenge_value: number;
  mega_goal_value: number;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export type NewSellerTargetData = Omit<SellerTarget, 'id' | 'created_at' | 'updated_at'>;

export type UpdateSellerTargetData = Partial<Omit<SellerTarget, 'id' | 'seller_id' | 'month' | 'created_at' | 'updated_at'>>;

export async function addSellerTarget(
  targetData: NewSellerTargetData
): Promise<{ data: SellerTarget | null; error: any }> {
  // RLS considerations: Ensure calling user has rights, or use service key for admin actions.
  // The current RLS for seller_targets allows insert if auth.uid() = targetData.seller_id.
  // This means an admin using their own UID cannot set a target for another seller unless
  // targetData.seller_id is set to the admin's UID, which is likely not the intention if
  // seller_id is meant to be a FK to the salespeople table.
  // This might require 'created_by' on the table and RLS checking that, or role-based RLS.
  // For now, proceeding with the assumption that the calling context handles RLS appropriately.
  const { data, error } = await supabase
    .from('seller_targets')
    .insert(targetData)
    .select()
    .single();
  if (error) console.error('[addSellerTarget] Error:', error);
  return { data, error };
}

export async function updateSellerTarget(
  targetId: string,
  targetData: UpdateSellerTargetData
): Promise<{ data: SellerTarget | null; error: any }> {
  // Similar RLS considerations as addSellerTarget.
  const { data, error } = await supabase
    .from('seller_targets')
    .update(targetData)
    .eq('id', targetId)
    .select()
    .single();
  if (error) console.error(`[updateSellerTarget] Error updating ${targetId}:`, error);
  return { data, error };
}

export async function deleteSellerTarget(
  targetId: string
): Promise<{ error: any }> {
  // Similar RLS considerations.
  const { error } = await supabase
    .from('seller_targets')
    .delete()
    .eq('id', targetId);
  if (error) console.error(`[deleteSellerTarget] Error deleting ${targetId}:`, error);
  return { error };
}

export async function getSellerTargetForSellerAndMonth(
  sellerId: string,
  monthDate: string // Expects "YYYY-MM-DD", first day of month
): Promise<SellerTarget | null> {
  if (!sellerId || !monthDate || !monthDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
    console.warn('[getSellerTargetForSellerAndMonth] Invalid sellerId or monthDate format provided.');
    return null;
  }
  const { data, error } = await supabase
    .from('seller_targets')
    .select('*')
    .eq('seller_id', sellerId)
    .eq('month', monthDate)
    .maybeSingle();

  if (error) {
    console.error(`[getSellerTargetForSellerAndMonth] Error fetching target for seller ${sellerId}, month ${monthDate}:`, error);
    return null;
  }
  return data;
}

export async function getSellerTargetsForMonth(
  monthDate: string // Expects "YYYY-MM-DD", first day of month
): Promise<SellerTarget[]> {
   if (!monthDate || !monthDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
    console.warn('[getSellerTargetsForMonth] Invalid monthDate format provided.');
    return [];
  }
  const { data, error } = await supabase
    .from('seller_targets')
    .select('*, salespeople(id, name, email, photo_url)') // Join with salespeople
    .eq('month', monthDate);

  if (error) {
    console.error(`[getSellerTargetsForMonth] Error fetching targets for month ${monthDate}:`, error);
    return [];
  }
  return data || [];
}

// --- Billing Reports --- (Renamed section)

export interface BillingEntry { // Renamed from BillingStatement
  id: string; // UUID
  entry_date: string; // YYYY-MM-DD - New
  month_year: string; // "YYYY-MM" - Auto-populated by DB trigger from entry_date
  faturamento_released: number;
  faturamento_atr: number;
  notes?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

// Update utility types
export type NewBillingEntryData = Omit<BillingEntry, 'id' | 'created_at' | 'updated_at' | 'updated_by' | 'month_year'> & {
  created_by: string; // month_year is removed as DB will populate it
};

export type UpdateBillingEntryData = Partial<Omit<BillingEntry, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'month_year'>> & {
  // seller_id was a typo in prompt, removed. month_year is not directly updatable.
  updated_by: string;
};

export async function addBillingEntry(
  entryData: NewBillingEntryData
): Promise<{ data: BillingEntry | null; error: any }> {
  // month_year will be auto-populated by the database trigger from entry_date
  const { data, error } = await supabase
    .from('billing_reports') // Renamed table
    .insert(entryData)
    .select()
    .single();
  if (error) console.error('[addBillingEntry] Error:', error);
  return { data, error };
}

export async function updateBillingEntry(
  id: string,
  entryData: UpdateBillingEntryData
): Promise<{ data: BillingEntry | null; error: any }> {
  const { data, error } = await supabase
    .from('billing_reports') // Renamed table
    .update(entryData)
    .eq('id', id)
    .select()
    .single();
  if (error) console.error(`[updateBillingEntry] Error updating ${id}:`, error);
  return { data, error };
}

export async function deleteBillingEntry( // Renamed function
  id: string
): Promise<{ error: any }> {
  const { error } = await supabase
    .from('billing_reports') // Renamed table
    .delete()
    .eq('id', id);
  if (error) console.error(`[deleteBillingEntry] Error deleting ${id}:`, error);
  return { error };
}

export async function getBillingEntriesForMonth( // Renamed function
  month_year: string // "YYYY-MM"
): Promise<BillingEntry[]> { // Returns array
  if (!month_year || !month_year.match(/^\d{4}-\d{2}$/)) {
      console.warn('[getBillingEntriesForMonth] Invalid month_year format provided:', month_year);
      return [];
  }
  const { data, error } = await supabase
    .from('billing_reports') // Renamed table
    .select('*')
    .eq('month_year', month_year)
    .order('entry_date', { ascending: true }); // Order by entry_date

  if (error) {
    console.error(`[getBillingEntriesForMonth] Error fetching entries for ${month_year}:`, error);
    return [];
  }
  return data || [];
}

export async function getAllBillingEntries(): Promise<BillingEntry[]> { // Renamed function
  const { data, error } = await supabase
    .from('billing_reports') // Renamed table
    .select('*')
    .order('entry_date', { ascending: false }); // Order by entry_date

  if (error) {
    console.error('[getAllBillingEntries] Error fetching entries:', error);
    return [];
  }
  return data || [];
}
