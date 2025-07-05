import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt } from "lucide-react";

const Expenses = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
        <p className="text-muted-foreground">Track and manage your expenses</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="mr-2 h-5 w-5" />
            Expenses Management
          </CardTitle>
          <CardDescription>
            This section will help you track all your business expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Expense tracking functionality will be implemented here. You'll be able to:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• Add expense records</li>
            <li>• Categorize expenses</li>
            <li>• Track monthly/yearly totals</li>
            <li>• Generate expense reports</li>
            <li>• Upload receipts and documentation</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Expenses;