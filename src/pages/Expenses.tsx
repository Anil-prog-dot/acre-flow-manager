import { useState, useEffect } from "react";
import { Plus, Edit, Check, X, Trash2, Receipt } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const initialExpenses = [
  { id: 1, item: "Diesel", date: "2024-01-15", amount: 250 },
  { id: 2, item: "Suresh", date: "2024-01-20", amount: 150 },
];

const Expenses = () => {
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('expenses_data');
    return saved ? JSON.parse(saved) : initialExpenses;
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    item: "",
    date: "",
    amount: ""
  });
  const { toast } = useToast();

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('expenses_data', JSON.stringify(expenses));
  }, [expenses]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item || !formData.date || !formData.amount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const newExpense = {
      id: Date.now(),
      item: formData.item,
      date: formData.date,
      amount: Number(formData.amount)
    };

    setExpenses([...expenses, newExpense]);
    setFormData({ item: "", date: "", amount: "" });
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Expense added successfully",
    });
  };

  const deleteExpense = (id: number) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
    toast({
      title: "Expense Deleted",
      description: "Expense has been deleted successfully",
      variant: "destructive"
    });
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
        <p className="text-muted-foreground">Track and manage your expenses</p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Receipt className="mr-2 h-5 w-5" />
                Expense Records
              </CardTitle>
              <CardDescription>
                Track all your business expenses
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                  <DialogDescription>
                    Enter the expense details below
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <div>
                    <Label htmlFor="item">Item/Description *</Label>
                    <Input
                      id="item"
                      name="item"
                      value={formData.item}
                      onChange={handleInputChange}
                      placeholder="Enter expense item"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Expense</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item/Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.item}</TableCell>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell>${expense.amount.toLocaleString()}</TableCell>
                   <TableCell>
                     <AlertDialog>
                       <AlertDialogTrigger asChild>
                         <Button
                           size="sm"
                           variant="destructive"
                         >
                           <Trash2 className="h-3 w-3" />
                         </Button>
                       </AlertDialogTrigger>
                       <AlertDialogContent>
                         <AlertDialogHeader>
                           <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                           <AlertDialogDescription>
                             Are you sure you want to delete the expense "{expense.item}"? This action cannot be undone.
                           </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                           <AlertDialogCancel>Cancel</AlertDialogCancel>
                           <AlertDialogAction onClick={() => deleteExpense(expense.id)}>
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
          <div className="mt-4 pt-4 border-t">
            <p className="text-lg font-semibold">Total Expenses: ${totalExpenses.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Expenses;