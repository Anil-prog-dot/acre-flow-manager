import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Tractor, Receipt } from "lucide-react";

const Dashboard = () => {
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
      value: "$15,420",
      description: "This month",
      icon: BarChart3,
      color: "text-success"
    },
    {
      title: "Expenses",
      value: "$3,240",
      description: "This month",
      icon: Receipt,
      color: "text-warning"
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
    </div>
  );
};

export default Dashboard;