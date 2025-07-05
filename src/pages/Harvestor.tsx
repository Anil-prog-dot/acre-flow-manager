import { useState } from "react";
import { Plus, Edit, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Sample harvestor data
const initialHarvestorData = [
  {
    id: 1,
    date: "2024-01-15",
    name: "John Smith",
    acres: 25,
    cost: 150,
    total: 3750,
    status: "Paid"
  },
  {
    id: 2,
    date: "2024-01-20",
    name: "Mary Johnson",
    acres: 40,
    cost: 200,
    total: 8000,
    status: "Pending"
  },
  {
    id: 3,
    date: "2024-01-25",
    name: "Robert Brown",
    acres: 30,
    cost: 120,
    total: 3600,
    status: "Overdue"
  },
];

const Harvestor = () => {
  const [harvestorData, setHarvestorData] = useState(initialHarvestorData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    name: "",
    acres: "",
    cost: "",
    status: "Pending"
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleStatusChange = (value: string) => {
    setFormData({
      ...formData,
      status: value
    });
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.name || !formData.acres || !formData.cost) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const acres = parseFloat(formData.acres);
    const cost = parseFloat(formData.cost);
    const total = acres * cost;

    const newRecord = {
      id: harvestorData.length + 1,
      date: formData.date,
      name: formData.name,
      acres: acres,
      cost: cost,
      total: total,
      status: formData.status
    };

    setHarvestorData([...harvestorData, newRecord]);
    setFormData({ date: "", name: "", acres: "", cost: "", status: "Pending" });
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Harvestor record added successfully",
    });
  };

  const updatePaymentStatus = (id: number, newStatus: string) => {
    setHarvestorData(harvestorData.map(record => 
      record.id === id ? { ...record, status: newStatus } : record
    ));
    
    toast({
      title: "Status Updated",
      description: `Payment status updated to ${newStatus}`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <Badge className="bg-success text-success-foreground">Paid</Badge>;
      case "Pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "Overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalAmount = harvestorData.reduce((sum, record) => sum + record.total, 0);
  const totalAcres = harvestorData.reduce((sum, record) => sum + record.acres, 0);
  const paidAmount = harvestorData.filter(r => r.status === "Paid").reduce((sum, record) => sum + record.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Harvestor</h1>
          <p className="text-muted-foreground">Manage harvestor operations and payments</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Record
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Harvestor Record</DialogTitle>
              <DialogDescription>
                Enter the harvestor operation details
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddRecord} className="space-y-4">
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
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="acres">No of Acres *</Label>
                <Input
                  id="acres"
                  name="acres"
                  type="number"
                  step="0.1"
                  value={formData.acres}
                  onChange={handleInputChange}
                  placeholder="Enter number of acres"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cost">Cost per Acre *</Label>
                <Input
                  id="cost"
                  name="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={handleInputChange}
                  placeholder="Enter cost per acre"
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Payment Status</Label>
                <Select onValueChange={handleStatusChange} defaultValue="Pending">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Record</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{harvestorData.length}</div>
            <p className="text-sm text-muted-foreground">
              {totalAcres} acres total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">
              All operations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">${paidAmount.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">
              Outstanding: ${(totalAmount - paidAmount).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Harvestor Records</CardTitle>
          <CardDescription>All harvestor operations and payment status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>No of Acres</TableHead>
                <TableHead>Cost per Acre</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {harvestorData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.date}</TableCell>
                  <TableCell className="font-medium">{record.name}</TableCell>
                  <TableCell>{record.acres}</TableCell>
                  <TableCell>${record.cost}</TableCell>
                  <TableCell className="font-medium">${record.total.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {record.status !== "Paid" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePaymentStatus(record.id, "Paid")}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      {record.status === "Paid" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePaymentStatus(record.id, "Pending")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Harvestor;