
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Tractor, Receipt } from "lucide-react";
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

    fetchAllCustomerRecords();
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
  const totalHarvestorAcres = harvestorData.reduce((sum, record) => sum + (record.acres || 0), 0);
  
  // Calculate profit (Total Revenue - Total Expenses)
  const profit = totalRevenue - (totalExpenses + miscellaneousTotal);

  const stats = [
    ...(isAdmin ? [{
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      description: "All revenue sources",
      icon: BarChart3,
      color: "text-success"
    }] : []),
    {
      title: "Total Expenses",
      value: `₹${(totalExpenses + miscellaneousTotal).toLocaleString()}`,
      description: "All expenses",
      icon: Receipt,
      color: "text-warning"
    },
    ...(isAdmin ? [{
      title: "Profit",
      value: `₹${profit.toLocaleString()}`,
      description: profit >= 0 ? "Net profit" : "Net loss",
      icon: TrendingUp,
      color: profit >= 0 ? "text-success" : "text-destructive"
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
              <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

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
    </div>
  );
};

export default Dashboard;
