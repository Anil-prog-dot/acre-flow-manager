import { useState, useEffect } from "react";
import { Plus, Edit, Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
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
    diesel: 500,
    labor: 300,
    total: 4550,
    discount: 0,
    finalAmount: 4550,
    status: "Paid"
  },
  {
    id: 2,
    date: "2024-01-20",
    name: "Mary Johnson",
    acres: 40,
    cost: 200,
    diesel: 800,
    labor: 600,
    total: 9400,
    discount: 0,
    finalAmount: 9400,
    status: "Pending"
  },
  {
    id: 3,
    date: "2024-01-25",
    name: "Robert Brown",
    acres: 30,
    cost: 120,
    diesel: 400,
    labor: 250,
    total: 4250,
    discount: 250,
    finalAmount: 4000,
    status: "Overdue"
  },
];

const initialPaidRecords = [
  {
    id: 4,
    date: "2024-01-10",
    name: "Alice Cooper",
    acres: 35,
    cost: 180,
    diesel: 600,
    labor: 400,
    total: 7300,
    discount: 300,
    finalAmount: 7000,
    status: "Paid"
  }
];

const Harvestor = () => {
  const [harvestorData, setHarvestorData] = useState(() => {
    const saved = localStorage.getItem('harvestor_data');
    return saved ? JSON.parse(saved) : initialHarvestorData;
  });
  const [paidRecords, setPaidRecords] = useState(() => {
    const saved = localStorage.getItem('paid_records');
    return saved ? JSON.parse(saved) : initialPaidRecords;
  });
  const [showPaidRecords, setShowPaidRecords] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    name: "",
    acres: "",
    cost: "",
    diesel: "",
    labor: "",
    status: "Pending"
  });
  const { toast } = useToast();

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('harvestor_data', JSON.stringify(harvestorData));
  }, [harvestorData]);

  useEffect(() => {
    localStorage.setItem('paid_records', JSON.stringify(paidRecords));
  }, [paidRecords]);

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
    
    if (!formData.date || !formData.name || !formData.acres || !formData.cost || !formData.diesel || !formData.labor) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const acres = parseFloat(formData.acres);
    const cost = parseFloat(formData.cost);
    const diesel = parseFloat(formData.diesel);
    const labor = parseFloat(formData.labor);
    const total = (acres * cost) + diesel + labor;

    const newRecord = {
      id: Date.now(), // Use timestamp for unique ID
      date: formData.date,
      name: formData.name,
      acres: acres,
      cost: cost,
      diesel: diesel,
      labor: labor,
      total: total,
      discount: 0,
      finalAmount: total,
      status: formData.status
    };

    setHarvestorData([...harvestorData, newRecord]);
    setFormData({ date: "", name: "", acres: "", cost: "", diesel: "", labor: "", status: "Pending" });
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Harvestor record added successfully",
    });
  };

  const updatePaymentStatus = (id: number, newStatus: string) => {
    const updatedData = harvestorData.map(record => 
      record.id === id ? { ...record, status: newStatus } : record
    );
    
    if (newStatus === "Paid") {
      const paidRecord = updatedData.find(r => r.id === id);
      if (paidRecord) {
        setPaidRecords([...paidRecords, paidRecord]);
        setHarvestorData(updatedData.filter(r => r.id !== id));
      }
    }
    
    setHarvestorData(updatedData);
    
    toast({
      title: "Status Updated",
      description: `Payment status updated to ${newStatus}`,
    });
  };

  const handleDiscountChange = (id: number, discount: number) => {
    setHarvestorData(harvestorData.map(record => {
      if (record.id === id) {
        const finalAmount = record.total - discount;
        return { ...record, discount, finalAmount };
      }
      return record;
    }));
  };

  const deleteRecord = (id: number) => {
    setHarvestorData(harvestorData.filter(record => record.id !== id));
    toast({
      title: "Record Deleted",
      description: "Harvestor record has been deleted successfully",
      variant: "destructive"
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
        
         <div className="flex space-x-2">
          <Button 
            variant={!showPaidRecords ? "default" : "outline"}
            onClick={() => setShowPaidRecords(false)}
          >
            Active Records
          </Button>
          <Button 
            variant={showPaidRecords ? "default" : "outline"}
            onClick={() => setShowPaidRecords(true)}
          >
            Paid Records ({paidRecords.length})
          </Button>
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
                  <Label htmlFor="diesel">Diesel Cost *</Label>
                  <Input
                    id="diesel"
                    name="diesel"
                    type="number"
                    step="0.01"
                    value={formData.diesel}
                    onChange={handleInputChange}
                    placeholder="Enter diesel cost"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="labor">Labor Cost *</Label>
                  <Input
                    id="labor"
                    name="labor"
                    type="number"
                    step="0.01"
                    value={formData.labor}
                    onChange={handleInputChange}
                    placeholder="Enter labor cost"
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
          <CardTitle>{showPaidRecords ? "Paid Records" : "Active Harvestor Records"}</CardTitle>
          <CardDescription>{showPaidRecords ? "Completed payments" : "All harvestor operations and payment status"}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>No of Acres</TableHead>
                <TableHead>Cost/Acre</TableHead>
                <TableHead>Diesel</TableHead>
                <TableHead>Labor</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Final Amount</TableHead>
                <TableHead>Status</TableHead>
                {!showPaidRecords && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(showPaidRecords ? paidRecords : harvestorData).map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.date}</TableCell>
                  <TableCell className="font-medium">{record.name}</TableCell>
                  <TableCell>{record.acres}</TableCell>
                  <TableCell>${record.cost}</TableCell>
                  <TableCell>${record.diesel}</TableCell>
                  <TableCell>${record.labor}</TableCell>
                  <TableCell className="font-medium">${record.total.toLocaleString()}</TableCell>
                  <TableCell>
                    {!showPaidRecords ? (
                      <Input 
                        type="number" 
                        className="w-20" 
                        value={record.discount} 
                        onChange={(e) => handleDiscountChange(record.id, parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    ) : (
                      `$${record.discount}`
                    )}
                  </TableCell>
                  <TableCell className="font-medium">${record.finalAmount.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  {!showPaidRecords && (
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
                              <AlertDialogTitle>Delete Record</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this harvestor record for {record.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteRecord(record.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  )}
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