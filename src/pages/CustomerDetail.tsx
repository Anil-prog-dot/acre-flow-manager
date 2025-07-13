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
import { useToast } from "@/hooks/use-toast";
import { useCustomers } from "@/hooks/useCustomers";
import { useCustomerRecords } from "@/hooks/useCustomerRecords";
import { useAuth } from "@/components/auth/AuthProvider";

const CustomerDetail = () => {
  const { id } = useParams();
  const { customers, loading: customersLoading, updateCustomer } = useCustomers();
  const { records, loading: recordsLoading, addRecord, updateRecord, deleteRecord } = useCustomerRecords(id);
  const { isAdmin } = useAuth();
  const [customer, setCustomer] = useState<any>(null);
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");

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
    phone: ""
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
      paid: false
    };

    await addRecord(newRecord);
    setFormData({ date: "", type: "", acres: "", cost: "", phone: "" });
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

  const isOverdue = (dateString: string) => {
    const recordDate = new Date(dateString);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > 30; // Consider overdue if more than 30 days
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
  const displayRecords = showPaidRecords ? paidRecords : activeRecords;

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

      <div>
        <h1 className="text-3xl font-bold text-foreground">{customer.name}</h1>
        <p className="text-muted-foreground">Customer Details & Records</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Email:</strong> {customer.email || 'Not provided'}</p>
            <p className="flex items-center gap-2">
              <strong>Phone:</strong> 
              {editingPhone ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="tel"
                    value={phoneValue}
                    onChange={(e) => setPhoneValue(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-40"
                  />
                  <Button size="sm" onClick={handlePhoneUpdate}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setEditingPhone(false);
                    setPhoneValue(customer?.phone || "");
                  }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{customer.phone || 'Not provided'}</span>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setEditingPhone(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </p>
            <p><strong>Location:</strong> {customer.location || 'Not provided'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Total Records:</strong> {records.length}</p>
            <p><strong>Total Acres:</strong> {totalAcres}</p>
            <p><strong>Total Amount:</strong> ₹{totalAmount.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {records.length > 0 ? (
              <p>Last service: {records[0].type} on {records[0].date}</p>
            ) : (
              <p>No recent activity</p>
            )}
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
                      <div>
                        <Label htmlFor="phone">Phone Number (Optional)</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter phone number (optional)"
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
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>No of Acres</TableHead>
                <TableHead>Cost per Acre</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Final Amount</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayRecords.map((record) => {
                const finalAmount = record.total - record.discount;
                const paymentStatus = record.paid 
                  ? 'paid' 
                  : isOverdue(record.date) 
                    ? 'overdue' 
                    : 'pending';
                
                return (
                  <TableRow key={record.id}>
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
                      {editingDiscount === record.id && !record.paid ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            step="0.01"
                            defaultValue={record.discount}
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
                              const input = document.querySelector(`input[defaultValue="${record.discount}"]`) as HTMLInputElement;
                              if (input) {
                                handleDiscountChange(record.id, Number(input.value));
                              }
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
                          <span>₹{record.discount}</span>
                          {!record.paid && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setEditingDiscount(record.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-bold">₹{finalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={paymentStatus === 'paid' ? 'default' : paymentStatus === 'overdue' ? 'destructive' : 'secondary'}
                      >
                        {paymentStatus}
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
  );
};

export default CustomerDetail;