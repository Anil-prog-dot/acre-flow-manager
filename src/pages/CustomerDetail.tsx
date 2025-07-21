import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, Edit, Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useCustomers } from "@/hooks/useCustomers";
import { useCustomerRecords } from "@/hooks/useCustomerRecords";
import { useAuth } from "@/components/auth/AuthProvider";
import { RealtimeVoiceRecorder } from "@/components/RealtimeVoiceRecorder";
import { Textarea } from "@/components/ui/textarea";

const CustomerDetail = () => {
  const { id } = useParams();
  const { customers, loading: customersLoading, updateCustomer } = useCustomers();
  const { records, loading: recordsLoading, addRecord, updateRecord, deleteRecord } = useCustomerRecords(id);
  const { isAdmin } = useAuth();
  const [customer, setCustomer] = useState<any>(null);
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [bulkDiscount, setBulkDiscount] = useState(0);

  useEffect(() => {
    if (customers.length > 0 && id) {
      const foundCustomer = customers.find((c: any) => c.id === id);
      setCustomer(foundCustomer || null);
      setPhoneValue(foundCustomer?.phone || "");
    }
  }, [customers, id]);
  const [showPaidRecords, setShowPaidRecords] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [editingDiscount, setEditingDiscount] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    type: "",
    acres: "",
    cost: "",
    phone: "",
    description: ""
  });
  const { toast } = useToast();

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
    if (!formData.date || !formData.type || !formData.acres || !formData.cost || !id) {
      return;
    }

    const newRecord = {
      customer_id: id,
      date: formData.date,
      type: formData.type,
      acres: Number(formData.acres),
      cost: Number(formData.cost),
      total: Number(formData.acres) * Number(formData.cost),
      discount: 0,
      paid: false,
      description: formData.description
    };

    await addRecord(newRecord);
    setFormData({ date: "", type: "", acres: "", cost: "", phone: "", description: "" });
    setIsDialogOpen(false);
  };

  const handleEditCost = async (recordId: string, newCost: number) => {
    const record = records.find(r => r.id === recordId);
    if (record) {
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
    if (record) {
      const newTotal = (record.acres * record.cost) - discount;
      await updateRecord(recordId, { 
        discount: discount,
        total: newTotal 
      });
    }
    setEditingDiscount(null);
  };

  const togglePaymentStatus = async (recordId: string, currentStatus: boolean) => {
    // No confirmation needed, will be handled by AlertDialog
    await updateRecord(recordId, { paid: !currentStatus });
  };

  const handleDeleteRecord = async (recordId: string) => {
    await deleteRecord(recordId);
  };

  const handlePhoneUpdate = async () => {
    if (id && customer) {
      await updateCustomer(id, { phone: phoneValue });
      setEditingPhone(false);
    }
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

  if (customersLoading || recordsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link to="/customers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customers
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link to="/customers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customers
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Customer not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalAmount = records.reduce((sum, record) => sum + record.total, 0);
  const totalAcres = records.reduce((sum, record) => sum + record.acres, 0);
  const paidRecords = records.filter(record => record.paid);
  const activeRecords = records.filter(record => !record.paid);
  const displayRecords = showPaidRecords ? 
    [...paidRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : 
    [...activeRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const selectedRecordsData = selectedRecords.map(id => records.find(r => r.id === id)).filter(Boolean);
  const selectedTotalAmount = selectedRecordsData.reduce((sum, record) => sum + ((record.acres * record.cost) - (record.discount || 0)), 0);
  const balanceAmount = selectedTotalAmount - bulkDiscount;

  return (
    <div className="space-y-6">
      <div className="flex-1 space-y-6">
        {/* Graph positioned at top right */}
        <div className="absolute top-4 right-4 w-80 h-60">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Amount Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Amount</span>
                  <span className="font-semibold text-lg">₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Balance Amount</span>
                  <span className="font-semibold text-lg text-destructive">₹{activeRecords.reduce((sum, record) => sum + record.total, 0).toLocaleString()}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className="bg-primary h-3 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${totalAmount > 0 ? ((totalAmount - activeRecords.reduce((sum, record) => sum + record.total, 0)) / totalAmount) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  {totalAmount > 0 ? Math.round(((totalAmount - activeRecords.reduce((sum, record) => sum + record.total, 0)) / totalAmount) * 100) : 0}% Paid
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Bulk Payment Summary below graph */}
        {selectedRecords.length > 0 && (
          <div className="absolute top-72 right-4 w-80">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Bulk Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Selected Records:</span>
                    <span>{selectedRecords.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Selected Amount:</span>
                    <span>₹{selectedTotalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <Label htmlFor="bulk-discount">Discount:</Label>
                    <Input
                      id="bulk-discount"
                      type="number"
                      value={bulkDiscount}
                      onChange={(e) => setBulkDiscount(Number(e.target.value))}
                      className="w-20 h-8 text-xs"
                      min="0"
                      max={selectedTotalAmount}
                    />
                  </div>
                  <div className="flex justify-between font-semibold text-sm border-t pt-2">
                    <span>Final Amount:</span>
                    <span>₹{Math.max(0, selectedTotalAmount - bulkDiscount).toLocaleString()}</span>
                  </div>
                </div>
                <Button 
                  onClick={handleBulkPayment}
                  className="w-full"
                  size="sm"
                >
                  Process Payment
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
        <div className="flex items-center space-x-4">
          <Link to="/customers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customers
            </Button>
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-foreground">{customer.name}</h1>
          <p className="text-muted-foreground">Customer Details & Records</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Paid Amount</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Paid Records:</strong> {paidRecords.length}</p>
              <p><strong>Paid Amount:</strong> ₹{paidRecords.reduce((sum, record) => sum + record.total, 0).toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Total Records:</strong> {records.length}</p>
              <p><strong>Total Acres:</strong> {totalAcres}</p>
              {isAdmin && <p><strong>Total Amount:</strong> ₹{totalAmount.toLocaleString()}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Balance Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Active Records:</strong> {activeRecords.length}</p>
              <p><strong>Balance Amount:</strong> ₹{activeRecords.reduce((sum, record) => sum + record.total, 0).toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{showPaidRecords ? "Paid Records" : "Active Service Records"}</CardTitle>
                <CardDescription>{showPaidRecords ? "Completed payments" : "Complete history of services provided"}</CardDescription>
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
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Record
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Record</DialogTitle>
                        <DialogDescription>
                          Add a new service record for {customer.name}
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
                          <Label htmlFor="type">Service Type *</Label>
                          <Input
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            placeholder="e.g., Plowing, Seeding, Harvesting"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="acres">Number of Acres *</Label>
                          <Input
                            id="acres"
                            name="acres"
                            type="number"
                            step="0.01"
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
            <Table>
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
                  <TableHead>Type</TableHead>
                  <TableHead>No of Acres</TableHead>
                  <TableHead>Cost per Acre</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRecords.map((record) => {
                  const finalAmount = (record.acres * record.cost) - (record.discount || 0);
                  
                  return (
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
                      <TableCell>{record.type}</TableCell>
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
                      <Badge 
                        variant={getPaymentStatus(record.date)}
                        className={
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
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Service Record</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this service record for {customer.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteRecord(record.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDetail;