import { useState } from "react";
import { Plus, Check, Trash2, Edit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useHarvestorRecords } from "@/hooks/useHarvestorRecords";

const Harvestor = () => {
  const { records, loading, addRecord, updateRecord, deleteRecord } = useHarvestorRecords();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [editingDiscount, setEditingDiscount] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    customer_name: "",
    acres: "",
    cost: "",
    discount: ""
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Harvestor</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.customer_name || !formData.acres || !formData.cost) {
      return;
    }

    const acres = parseFloat(formData.acres);
    const cost = parseFloat(formData.cost);
    const discount = parseFloat(formData.discount) || 0;
    const total = (acres * cost) - discount;

    await addRecord({
      date: formData.date,
      customer_name: formData.customer_name,
      acres: acres,
      cost: cost,
      discount: discount,
      total: total
    });

    setFormData({ date: "", customer_name: "", acres: "", cost: "", discount: "" });
    setIsDialogOpen(false);
  };

  const handleEditCost = async (recordId: string, newCost: number) => {
    const record = records.find(r => r.id === recordId);
    if (record && updateRecord) {
      const newTotal = (record.acres * newCost) - (record.discount || 0);
      await updateRecord(recordId, { 
        cost: newCost, 
        total: newTotal 
      });
    }
    setEditingRecord(null);
  };

  const handleDiscountChange = async (recordId: string, discount: number) => {
    const record = records.find(r => r.id === recordId);
    if (record && updateRecord) {
      const newTotal = (record.acres * record.cost) - discount;
      await updateRecord(recordId, { 
        discount: discount,
        total: newTotal 
      });
    }
    setEditingDiscount(null);
  };

  const totalAmount = records.reduce((sum, record) => sum + record.total, 0);
  const totalAcres = records.reduce((sum, record) => sum + record.acres, 0);

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
                <Label htmlFor="customer_name">Customer Name *</Label>
                <Input
                  id="customer_name"
                  name="customer_name"
                  value={formData.customer_name}
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
                <Label htmlFor="discount">Discount</Label>
                <Input
                  id="discount"
                  name="discount"
                  type="number"
                  step="0.01"
                  value={formData.discount}
                  onChange={handleInputChange}
                  placeholder="Enter discount amount"
                />
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

      <div className="mobile-stats-grid">
        <Card className="mobile-card">
          <CardHeader>
            <CardTitle>Total Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{records.length}</div>
            <p className="text-sm text-muted-foreground">
              {totalAcres} acres total
            </p>
          </CardContent>
        </Card>

        <Card className="mobile-card">
          <CardHeader>
            <CardTitle>Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">${totalAmount.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">
              All operations
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Harvestor Records</CardTitle>
          <CardDescription>All harvestor operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mobile-table-container">
            <Table className="mobile-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Acres</TableHead>
                  <TableHead>Cost/Acre</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell className="font-medium">{record.customer_name}</TableCell>
                    <TableCell>{record.acres}</TableCell>
                    <TableCell>
                      {editingRecord === record.id ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            step="0.01"
                            defaultValue={record.cost}
                            className="w-20"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleEditCost(record.id, Number((e.target as HTMLInputElement).value));
                              }
                              if (e.key === 'Escape') {
                                setEditingRecord(null);
                              }
                            }}
                          />
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
                              const input = document.querySelector(`input[defaultValue="${record.cost}"]`) as HTMLInputElement;
                              handleEditCost(record.id, Number(input.value));
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setEditingRecord(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>${record.cost}</span>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setEditingRecord(record.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingDiscount === record.id ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            step="0.01"
                            defaultValue={record.discount || 0}
                            className="w-20"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleDiscountChange(record.id, Number((e.target as HTMLInputElement).value));
                              }
                              if (e.key === 'Escape') {
                                setEditingDiscount(null);
                              }
                            }}
                          />
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
                              const input = document.querySelector(`input[defaultValue="${record.discount || 0}"]`) as HTMLInputElement;
                              handleDiscountChange(record.id, Number(input.value));
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setEditingDiscount(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>${record.discount || 0}</span>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setEditingDiscount(record.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">${record.total.toLocaleString()}</TableCell>
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
                              Are you sure you want to delete this harvestor record for {record.customer_name}? This action cannot be undone.
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

export default Harvestor;