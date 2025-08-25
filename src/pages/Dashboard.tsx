
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Tractor, Receipt, Clock, Activity } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useCustomers } from "@/hooks/useCustomers";
import { useCustomerRecords } from "@/hooks/useCustomerRecords";
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useHarvestorRecords } from "@/hooks/useHarvestorRecords";
import { useExpenses } from "@/hooks/useExpenses";
import { useMiscellaneous } from "@/hooks/useMiscellaneous";
import { useTrailerRecords } from "@/hooks/useTrailerRecords";
import { useAuth } from "@/components/auth/AuthProvider";

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const { customers, loading: customersLoading } = useCustomers();
  const { records: harvestorData, loading: harvestorLoading } = useHarvestorRecords();
  const { expenses, loading: expensesLoading } = useExpenses();
  const { records: miscellaneous, loading: miscLoading } = useMiscellaneous();
  const { trailerRecords, isLoading: trailerLoading } = useTrailerRecords();
  
  // Get all customer records for revenue calculation
  const [allCustomerRecords, setAllCustomerRecords] = useState<any[]>([]);
  const [customerRecordsLoading, setCustomerRecordsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchAllCustomerRecords = async () => {
      try {
        const { data, error } = await supabase
          .from('customer_records')
          .select('*');
        
        if (error) throw error;
        setAllCustomerRecords(data || []);
      } catch (error) {
        console.error('Error fetching customer records:', error);
      } finally {
        setCustomerRecordsLoading(false);
      }
    };

    const fetchRecentActivities = async () => {
      try {
        // Fetch recent activities from all tables
        const [customerRecords, harvestorRecords, expenses, miscRecords, trailerRecords] = await Promise.all([
          supabase.from('customer_records').select('*, customers(name)').order('created_at', { ascending: false }).limit(3),
          supabase.from('harvestor_records').select('*').order('created_at', { ascending: false }).limit(3),
          supabase.from('expenses').select('*').order('created_at', { ascending: false }).limit(2),
          supabase.from('miscellaneous').select('*').order('created_at', { ascending: false }).limit(1),
          supabase.from('trailer_records').select('*').order('created_at', { ascending: false }).limit(1)
        ]);

        const activities = [
          ...(customerRecords.data?.map(record => ({
            type: 'Customer Record',
            description: `${record.customers?.name || 'Customer'} - ₹${record.total}`,
            date: record.created_at,
            icon: 'customer'
          })) || []),
          ...(harvestorRecords.data?.map(record => ({
            type: 'Harvestor Record',
            description: `${record.customer_name} - ${record.acres} acres`,
            date: record.created_at,
            icon: 'harvestor'
          })) || []),
          ...(expenses.data?.map(expense => ({
            type: 'Expense',
            description: `${expense.description} - ₹${expense.amount}`,
            date: expense.created_at,
            icon: 'expense'
          })) || []),
          ...(miscRecords.data?.map(record => ({
            type: 'Miscellaneous',
            description: `${record.description} - ₹${record.amount}`,
            date: record.created_at,
            icon: 'misc'
          })) || []),
          ...(trailerRecords.data?.map(record => ({
            type: 'Trailer Record',
            description: `${record.name} - ${record.no_of_trips} trips`,
            date: record.created_at,
            icon: 'trailer'
          })) || [])
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 15);

        setRecentActivities(activities);
      } catch (error) {
        console.error('Error fetching recent activities:', error);
      }
    };

    fetchAllCustomerRecords();
    fetchRecentActivities();
  }, []);

  const loading = customersLoading || harvestorLoading || expensesLoading || miscLoading || trailerLoading || customerRecordsLoading;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Calculate real statistics from stored data
  const harvestorRevenue = harvestorData.reduce((sum, record) => sum + (record.total || 0), 0);
  const customerRevenue = allCustomerRecords.reduce((sum, record) => sum + (record.total || 0), 0);
  const trailerRevenue = trailerRecords.reduce((sum, record) => sum + (record.total || 0), 0);
  const totalRevenue = harvestorRevenue + customerRevenue + trailerRevenue;
  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const miscellaneousTotal = miscellaneous.reduce((sum, record) => sum + (record.amount || 0), 0);
  
  // Calculate total paid from all sections
  const harvestorPaid = harvestorData.filter(record => record.paid).reduce((sum, record) => sum + (record.total || 0), 0);
  const customerPaid = allCustomerRecords.filter(record => record.paid).reduce((sum, record) => sum + (record.total || 0), 0);
  const trailerPaid = trailerRecords.filter(record => record.paid).reduce((sum, record) => sum + (record.total || 0), 0);
  const totalPaid = harvestorPaid + customerPaid + trailerPaid;
  
  // Calculate remaining amount (Total Revenue - Total Paid)
  const remainingAmount = totalRevenue - totalPaid;
  
  // Calculate profit (Total Revenue - Total Expenses)
  const profit = totalRevenue - (totalExpenses + miscellaneousTotal);

  const stats = [
    ...(isAdmin ? [{
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      description: "All revenue sources",
      icon: BarChart3,
      color: "text-revenue"
    }] : []),
    {
      title: "Total Expenses",
      value: `₹${(totalExpenses + miscellaneousTotal).toLocaleString()}`,
      description: "All expenses",
      icon: Receipt,
      color: "text-expenses"
    },
    ...(isAdmin ? [{
      title: "Total Paid",
      value: `₹${totalPaid.toLocaleString()}`,
      description: "Paid records from all sections",
      icon: Activity,
      color: "text-paid"
    }] : []),
    ...(isAdmin ? [{
      title: "Remaining Amount",
      value: `₹${remainingAmount.toLocaleString()}`,
      description: "Total revenue - Total paid",
      icon: Clock,
      color: "text-remaining"
    }] : []),
    ...(isAdmin ? [{
      title: "Profit",
      value: `₹${profit.toLocaleString()}`,
      description: profit >= 0 ? "Net profit" : "Net loss",
      icon: TrendingUp,
      color: "text-profit"
    }] : [])
  ];

  const chartData = [
    {
      name: "Total Revenue",
      value: totalRevenue,
      fill: "hsl(var(--primary))"
    },
    {
      name: "Total Expenses", 
      value: totalExpenses + miscellaneousTotal,
      fill: "hsl(var(--destructive))"
    },
    {
      name: "Total Paid",
      value: totalPaid,
      fill: "hsl(var(--paid))"
    },
    {
      name: "Remaining Amount",
      value: remainingAmount,
      fill: "hsl(var(--remaining))"
    },
    {
      name: "Profit",
      value: profit,
      fill: profit >= 0 ? "hsl(var(--success))" : "hsl(var(--warning))"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your farm management system</p>
      </div>
      
      <div className="mobile-stats-grid">{stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow mobile-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 md:h-4 md:w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-xl md:text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-2' : ''} gap-6`}>
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Expenses Breakdown</CardTitle>
              <CardDescription>Comprehensive view of all revenue sources vs expenses</CardDescription>
            </CardHeader>
            <CardContent>
               <ResponsiveContainer width="100%" height={400}>
                 <BarChart data={chartData}>
                   <CartesianGrid strokeDasharray="3 3" />
                   <XAxis dataKey="name" />
                   <YAxis />
                   <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, '']} />
                   <Legend />
                   {chartData.map((entry, index) => (
                     <Bar key={index} dataKey="value" fill={entry.fill} />
                   ))}
                 </BarChart>
               </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Recent activities from all sections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="mt-1">
                    {activity.icon === 'customer' && <BarChart3 className="h-4 w-4 text-primary" />}
                    {activity.icon === 'harvestor' && <Tractor className="h-4 w-4 text-success" />}
                    {activity.icon === 'expense' && <Receipt className="h-4 w-4 text-destructive" />}
                    {activity.icon === 'misc' && <Activity className="h-4 w-4 text-warning" />}
                    {activity.icon === 'trailer' && <TrendingUp className="h-4 w-4 text-info" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.type}</p>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent activities found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
