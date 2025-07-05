import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Tractor, Receipt } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Dashboard = () => {
  // Sample data - in real app, this would come from your data sources
  const harvestorRevenue = 15420;
  const dieselExpenses = 1800;
  const laborExpenses = 1350;
  const generalExpenses = 400;
  const miscellaneousExpenses = 690;
  
  const totalExpenses = dieselExpenses + laborExpenses + generalExpenses + miscellaneousExpenses;

  const stats = [
    {
      title: "Total Customers",
      value: "24",
      description: "Active customers",
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Harvestor Jobs",
      value: "12",
      description: "This month",
      icon: Tractor,
      color: "text-accent"
    },
    {
      title: "Total Revenue",
      value: `$${harvestorRevenue.toLocaleString()}`,
      description: "This month",
      icon: BarChart3,
      color: "text-success"
    },
    {
      title: "Total Expenses",
      value: `$${totalExpenses.toLocaleString()}`,
      description: "This month",
      icon: Receipt,
      color: "text-warning"
    }
  ];

  const chartData = [
    {
      name: 'Revenue vs Expenses',
      Revenue: harvestorRevenue,
      Diesel: dieselExpenses,
      Labor: laborExpenses,
      Expenses: generalExpenses,
      Miscellaneous: miscellaneousExpenses,
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your farm management system</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
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
          <CardDescription>Monthly comparison of revenue and expense categories</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
              <Legend />
              <Bar dataKey="Revenue" fill="hsl(var(--success))" name="Revenue" />
              <Bar dataKey="Diesel" fill="hsl(var(--warning))" name="Diesel" />
              <Bar dataKey="Labor" fill="hsl(var(--accent))" name="Labor" />
              <Bar dataKey="Expenses" fill="hsl(var(--destructive))" name="General Expenses" />
              <Bar dataKey="Miscellaneous" fill="hsl(var(--primary))" name="Miscellaneous" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;