import { supabase } from '../lib/supabase';

export async function getDashboardKPIs(userId?: string) {
  // Dates for filtering
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Total Leads
  const { count: totalLeads, error: totalLeadsError, data: totalLeadsData } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true });
  console.log('Total Leads:', totalLeads, 'Error:', totalLeadsError, 'Data:', totalLeadsData);

  // New Leads Today
  const { count: newLeadsToday, error: newLeadsTodayError, data: newLeadsTodayData } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', startOfToday.toISOString());
  console.log('New Leads Today:', newLeadsToday, 'Error:', newLeadsTodayError, 'Data:', newLeadsTodayData);

  // New Leads This Week
  const { count: newLeadsThisWeek, error: newLeadsThisWeekError, data: newLeadsThisWeekData } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', startOfWeek.toISOString());
  console.log('New Leads This Week:', newLeadsThisWeek, 'Error:', newLeadsThisWeekError, 'Data:', newLeadsThisWeekData);

  // New Leads This Month
  const { count: newLeadsThisMonth, error: newLeadsThisMonthError, data: newLeadsThisMonthData } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', startOfMonth.toISOString());
  console.log('New Leads This Month:', newLeadsThisMonth, 'Error:', newLeadsThisMonthError, 'Data:', newLeadsThisMonthData);

  // Leads Converted This Month
  const { count: leadsConvertedThisMonth, error: leadsConvertedThisMonthError, data: leadsConvertedThisMonthData } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'closed')
    .gte('updated_at', startOfMonth.toISOString());
  console.log('Leads Converted This Month:', leadsConvertedThisMonth, 'Error:', leadsConvertedThisMonthError, 'Data:', leadsConvertedThisMonthData);

  // Average Lead Response Time (placeholder, requires response time tracking)
  const avgLeadResponseTime = null;

  // Active Tasks
  const { count: activeTasks, error: activeTasksError, data: activeTasksData } = await supabase
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active');
  console.log('Active Tasks:', activeTasks, 'Error:', activeTasksError, 'Data:', activeTasksData);

  // Overdue Tasks
  const { count: overdueTasks, error: overdueTasksError, data: overdueTasksData } = await supabase
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')
    .lt('due_date', now.toISOString());
  console.log('Overdue Tasks:', overdueTasks, 'Error:', overdueTasksError, 'Data:', overdueTasksData);

  // Properties Sold This Month
  const { count: propertiesSoldThisMonth, error: propertiesSoldThisMonthError, data: propertiesSoldThisMonthData } = await supabase
    .from('properties')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'sold')
    .gte('updated_at', startOfMonth.toISOString());
  console.log('Properties Sold This Month:', propertiesSoldThisMonth, 'Error:', propertiesSoldThisMonthError, 'Data:', propertiesSoldThisMonthData);

  // Revenue This Month (placeholder, requires revenue tracking)
  const revenueThisMonth = 0;

  // Revenue Last Month (for trend)
  const revenueLastMonth = 0;

  // Call Success Rate
  const { count: totalCalls, error: totalCallsError, data: totalCallsData } = await supabase
    .from('calls')
    .select('id', { count: 'exact', head: true });
  console.log('Total Calls:', totalCalls, 'Error:', totalCallsError, 'Data:', totalCallsData);

  const { count: successfulCalls, error: successfulCallsError, data: successfulCallsData } = await supabase
    .from('calls')
    .select('id', { count: 'exact', head: true })
    .eq('outcome', 'success');
  console.log('Successful Calls:', successfulCalls, 'Error:', successfulCallsError, 'Data:', successfulCallsData);

  const callSuccessRate = totalCalls && successfulCalls ? successfulCalls / totalCalls : null;

  // Average Deal Size (placeholder, requires deal value tracking)
  const avgDealSize = null;

  // Trends
  const { count: totalLeadsLastMonth, error: totalLeadsLastMonthError, data: totalLeadsLastMonthData } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', startOfLastMonth.toISOString())
    .lte('created_at', endOfLastMonth.toISOString());
  console.log('Total Leads Last Month:', totalLeadsLastMonth, 'Error:', totalLeadsLastMonthError, 'Data:', totalLeadsLastMonthData);

  // Lost Leads
  const { count: lostLeads } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'lost');

  return {
    totalLeads: totalLeads || 0,
    newLeadsToday: newLeadsToday || 0,
    newLeadsThisWeek: newLeadsThisWeek || 0,
    newLeadsThisMonth: newLeadsThisMonth || 0,
    leadsConvertedThisMonth: leadsConvertedThisMonth || 0,
    avgLeadResponseTime,
    activeTasks: activeTasks || 0,
    overdueTasks: overdueTasks || 0,
    propertiesSoldThisMonth: propertiesSoldThisMonth || 0,
    revenueThisMonth,
    callSuccessRate,
    avgDealSize,
    lostLeads: lostLeads || 0,
    trends: {
      totalLeads: { current: totalLeads || 0, previous: totalLeadsLastMonth || 0 },
      revenueThisMonth: { current: revenueThisMonth, previous: revenueLastMonth }
    }
  };
} 