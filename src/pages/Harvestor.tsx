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
import { Checkbox } from "@/components/ui/checkbox";
import { useHarvestorRecords } from "@/hooks/useHarvestorRecords";
import { useAuth } from "@/components/auth/AuthProvider";
import { RealtimeVoiceRecorder } from "@/components/RealtimeVoiceRecorder";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Harvestor = () => {
  const { records, loading, addRecord, updateRecord, deleteRecord } = useHarvestorRecords();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPaidRecords, setShowPaidRecords] = useState(false);
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [bulkDiscount, setBulkDiscount] = useState(0);
  const [formData, setFormData] = useState({
    date: "",
    customer_name: "",
    acres: "",
    cost: "",
    discount: "",
    description: ""
  });

  const togglePaymentStatus = async (recordId: string, currentStatus: boolean) => {
    // No confirmation needed, will be handled by AlertDialog
    if (updateRecord) {
      await updateRecord(recordId, { paid: !currentStatus });
    }
  };

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleVoiceTranscription = (text: string, field: string) => {
    setFormData({
      ...formData,
      [field]: text
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
      total: total,
      paid: false,
      description: formData.description
    });

    setFormData({ date: "", customer_name: "", acres: "", cost: "", discount: "", description: "" });
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

  const handleSelectRecord = (recordId: string, checked: boolean) => {
    if (checked) {
      setSelectedRecords([...selectedRecords, recordId]);
    } else {
      setSelectedRecords(selectedRecords.filter(id => id !== recordId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRecords(activeRecords.map(record => record.id));
    } else {
      setSelectedRecords([]);
    }
  };

  const getSelectedTotal = () => {
    return selectedRecords.reduce((sum, recordId) => {
      const record = records.find(r => r.id === recordId);
      return record ? sum + ((record.acres * record.cost) - (record.discount || 0)) : sum;
    }, 0);
  };

  const handleBulkPayment = async () => {
    for (const recordId of selectedRecords) {
      await updateRecord(recordId, { paid: true });
    }
    setSelectedRecords([]);
    setBulkDiscount(0);
    toast({
      title: "Payment Processed",
      description: `${selectedRecords.length} records marked as paid`,
    });
  };

  const getPaymentStatus = (dateString: string) => {
    const recordDate = new Date(dateString);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
    const monthsDiff = daysDiff / 30;
    
    if (monthsDiff < 6) return 'default';
    if (monthsDiff < 9) return 'secondary';
    return 'destructive';
  };

  const totalAmount = records.reduce((sum, record) => sum + record.total, 0);
  const totalAcres = records.reduce((sum, record) => sum + record.acres, 0);
  const paidRecords = records.filter(record => record.paid);
  const activeRecords = records.filter(record => !record.paid);
  const displayRecords = showPaidRecords ? 
    [...paidRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : 
    [...activeRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Harvestor</h1>
        <p className="text-muted-foreground">Manage harvestor operations and payments</p>
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

        {isAdmin && (
          <Card className="mobile-card">
            <CardHeader>
              <CardTitle>Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">₹{totalAmount.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">
                All operations
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="mobile-card">
          <CardHeader>
            <CardTitle>Amount Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">₹{paidRecords.reduce((sum, record) => sum + record.total, 0).toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">
              {paidRecords.length} paid records
            </p>
          </CardContent>
        </Card>

        <Card className="mobile-card">
          <CardHeader>
            <CardTitle>Balance Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">₹{activeRecords.reduce((sum, record) => sum + record.total, 0).toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">
              {activeRecords.length} pending records
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{showPaidRecords ? "Paid Records" : "Active Harvestor Records"}</CardTitle>
              <CardDescription>{showPaidRecords ? "Completed payments" : "All harvestor operations"}</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant={!showPaidRecords ? "default" : "outline"}
                onClick={() => setShowPaidRecords(false)}
              >
                Active Records ({activeRecords.length})
              </Button>
              <Button 
                variant={showPaidRecords ? "default" : "outline"}
                onClick={() => setShowPaidRecords(true)}
              >
                Paid Records ({paidRecords.length})
              </Button>
              {!showPaidRecords && (
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
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!showPaidRecords && selectedRecords.length > 0 && (
            <div className="mb-4 p-4 bg-muted rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Bulk Payment Summary</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedRecords([])}
                >
                  Clear Selection
                </Button>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <span><strong>Selected Records:</strong> {selectedRecords.length}</span>
                <span><strong>Total Amount:</strong> ₹{getSelectedTotal().toLocaleString()}</span>
                <div className="flex items-center gap-2">
                  <Label htmlFor="bulk-discount">Discount:</Label>
                  <Input
                    id="bulk-discount"
                    type="number"
                    value={bulkDiscount}
                    onChange={(e) => setBulkDiscount(Number(e.target.value))}
                    className="w-20"
                    min="0"
                  />
                </div>
                <span><strong>Final Amount:</strong> ₹{(getSelectedTotal() - bulkDiscount).toLocaleString()}</span>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full" disabled={selectedRecords.length === 0}>
                    Process Bulk Payment
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Process Bulk Payment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to mark {selectedRecords.length} record(s) as paid?
                      Total amount: ₹{(getSelectedTotal() - bulkDiscount).toLocaleString()}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkPayment}>
                      Process Payment
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
          <div className="mobile-table-container">
            <Table className="mobile-table">
              <TableHeader>
                <TableRow>
                  {!showPaidRecords && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedRecords.length === activeRecords.length && activeRecords.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                  )}
                  <TableHead>Date</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Acres</TableHead>
                   <TableHead>Cost/Acre</TableHead>
                   <TableHead>Total</TableHead>
                   <TableHead>Description</TableHead>
                   <TableHead>Payment Status</TableHead>
                   <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRecords.map((record) => (
                  <TableRow key={record.id}>
                    {!showPaidRecords && (
                      <TableCell>
                        <Checkbox
                          checked={selectedRecords.includes(record.id)}
                          onCheckedChange={(checked) => handleSelectRecord(record.id, checked as boolean)}
                        />
                      </TableCell>
                    )}
                    <TableCell>{record.date}</TableCell>
                    <TableCell className="font-medium">{record.customer_name}</TableCell>
                    <TableCell>{record.acres}</TableCell>
                    <TableCell>
                      {editingRecord === record.id && !record.paid ? (
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
                              if (input) {
                                handleEditCost(record.id, Number(input.value));
                              }
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
                          <span>₹{record.cost}</span>
                          {!record.paid && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setEditingRecord(record.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                     <TableCell className="font-medium">₹{record.total.toLocaleString()}</TableCell>
                     <TableCell>
                       <div className="max-w-[200px] truncate" title={record.description || ''}>
                         {record.description || 'No description'}
                       </div>
                     </TableCell>
                     <TableCell>
                      <Badge 
                        variant={
                          record.paid ? 'default' : 
                          getPaymentStatus(record.date) === 'default' ? 'secondary' :
                          getPaymentStatus(record.date) === 'secondary' ? 'outline' : 
                          'destructive'
                        }
                        className={
                          record.paid ? '' :
                          getPaymentStatus(record.date) === 'default' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                          getPaymentStatus(record.date) === 'secondary' ? 'bg-orange-100 text-orange-800 hover:bg-orange-100' :
                          'bg-red-100 text-red-800 hover:bg-red-100'
                        }
                      >
                        {record.paid ? 'Paid' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {!showPaidRecords && !record.paid && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="default">
                                Mark Paid
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>⚠️ Mark as Paid</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to mark this record as paid? This action will move the record to the paid section.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => togglePaymentStatus(record.id, record.paid)}>
                                  Mark as Paid
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {showPaidRecords && record.paid && isAdmin && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                Mark Unpaid
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>⚠️ Mark as Unpaid</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to mark this record as unpaid? This action will move the record back to active records. Only administrators can perform this action.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => togglePaymentStatus(record.id, record.paid)}>
                                  Mark as Unpaid
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {isAdmin && (
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
                        )}
                      </div>
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