import { useState } from "react";
import { Trash2, Receipt, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCustomerRecords } from "@/hooks/useCustomerRecords";
import { useCustomers } from "@/hooks/useCustomers";
import { useHarvestorRecords } from "@/hooks/useHarvestorRecords";
import { useExpenses } from "@/hooks/useExpenses";
import { useMiscellaneous } from "@/hooks/useMiscellaneous";

const PaidRecords = () => {
  const { customers } = useCustomers();
  const { records: customerRecords, deleteRecord: deleteCustomerRecord } = useCustomerRecords();
  const { records: harvestorRecords, deleteRecord: deleteHarvestorRecord } = useHarvestorRecords();
  const { expenses, deleteExpense } = useExpenses();
  const { records: miscRecords, deleteRecord: deleteMiscRecord } = useMiscellaneous();
  
  const [filterType, setFilterType] = useState<string>("all");

  // Get paid customer records
  const paidCustomerRecords = customerRecords.filter(record => record.paid).map(record => {
    const customer = customers.find(c => c.id === record.customer_id);
    return {
      ...record,
      type: "Customer Service",
      customer_name: customer?.name || "Unknown Customer",
      source: "customer" as const
    };
  });

  // Format other records to match structure
  const formattedHarvestorRecords = harvestorRecords.map(record => ({
    ...record,
    type: "Harvestor Service",
    source: "harvestor" as const
  }));

  const formattedExpenses = expenses.map(expense => ({
    ...expense,
    type: "Expense",
    customer_name: expense.description,
    acres: 0,
    cost: 0,
    total: expense.amount,
    source: "expense" as const
  }));

  const formattedMiscRecords = miscRecords.map(record => ({
    ...record,
    type: "Miscellaneous",
    customer_name: record.description,
    acres: 0,
    cost: 0,
    total: record.amount,
    source: "miscellaneous" as const
  }));

  // Combine all records
  const allRecords = [
    ...paidCustomerRecords,
    ...formattedHarvestorRecords,
    ...formattedExpenses,
    ...formattedMiscRecords
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter records based on selected type
  const filteredRecords = filterType === "all" 
    ? allRecords 
    : allRecords.filter(record => record.source === filterType);

  const handleDeleteRecord = async (record: any) => {
    switch (record.source) {
      case "customer":
        await deleteCustomerRecord(record.id);
        break;
      case "harvestor":
        await deleteHarvestorRecord(record.id);
        break;
      case "expense":
        await deleteExpense(record.id);
        break;
      case "miscellaneous":
        await deleteMiscRecord(record.id);
        break;
    }
  };

  const totalAmount = filteredRecords.reduce((sum, record) => sum + record.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Paid Records</h1>
        <p className="text-muted-foreground">View and manage all paid transactions</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Receipt className="mr-2 h-5 w-5" />
                All Paid Records
              </CardTitle>
              <CardDescription>
                Complete record of all paid transactions
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Records</SelectItem>
                    <SelectItem value="customer">Customer Services</SelectItem>
                    <SelectItem value="harvestor">Harvestor Services</SelectItem>
                    <SelectItem value="expense">Expenses</SelectItem>
                    <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-lg font-semibold">
                Total: ${totalAmount.toLocaleString()}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mobile-table-container">
            <Table className="mobile-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Customer/Description</TableHead>
                  <TableHead>Acres</TableHead>
                  <TableHead>Cost/Amount</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record, index) => (
                  <TableRow key={`${record.source}-${record.id}-${index}`}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell className="font-medium">{record.type}</TableCell>
                    <TableCell>{record.customer_name}</TableCell>
                    <TableCell>{record.acres || "-"}</TableCell>
                    <TableCell>
                      {record.source === "expense" || record.source === "miscellaneous" 
                        ? `-$${record.total.toLocaleString()}` 
                        : `$${record.cost || 0}`}
                    </TableCell>
                    <TableCell className="font-medium">
                      {record.source === "expense" || record.source === "miscellaneous" 
                        ? `-$${record.total.toLocaleString()}` 
                        : `$${record.total.toLocaleString()}`}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="mobile-button"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Record</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this {record.type.toLowerCase()} record? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteRecord(record)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaidRecords;