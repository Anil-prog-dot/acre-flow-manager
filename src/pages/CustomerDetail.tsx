import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, Edit, Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const CustomerDetail = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    // Load customers from localStorage
    const savedCustomers = localStorage.getItem('customers_data');
    const parsedCustomers = savedCustomers ? JSON.parse(savedCustomers) : [];
    setCustomers(parsedCustomers);
    
    // Find the specific customer by ID
    const foundCustomer = parsedCustomers.find((c: any) => c.id === Number(id));
    if (foundCustomer) {
      // Initialize records array if it doesn't exist
      if (!foundCustomer.records) {
        foundCustomer.records = [];
      }
      setCustomer(foundCustomer);
    }
  }, [id]);

  // Save customer data whenever it changes
  useEffect(() => {
    if (customer && customers.length > 0) {
      const updatedCustomers = customers.map(c => 
        c.id === customer.id ? customer : c
      );
      setCustomers(updatedCustomers);
      localStorage.setItem('customers_data', JSON.stringify(updatedCustomers));
    }
  }, [customer, customers]);
  const [showPaidRecords, setShowPaidRecords] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<number | null>(null);
  const [editingDiscount, setEditingDiscount] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    type: "",
    acres: "",
    cost: ""
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.type || !formData.acres || !formData.cost) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const newRecord = {
      id: Date.now(),
      date: formData.date,
      type: formData.type,
      acres: Number(formData.acres),
      cost: Number(formData.cost),
      total: Number(formData.acres) * Number(formData.cost),
      discount: 0,
      paid: false
    };

    const updatedCustomer = {
      ...customer,
      records: [...customer.records, newRecord]
    };

    setCustomer(updatedCustomer);
    setFormData({ date: "", type: "", acres: "", cost: "" });
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Record added successfully",
    });
  };

  const handleEditCost = (recordId: number, newCost: number) => {
    const updatedCustomer = {
      ...customer,
      records: customer.records.map(record => 
        record.id === recordId 
          ? { ...record, cost: newCost, total: record.acres * newCost }
          : record
      )
    };
    setCustomer(updatedCustomer);
    setEditingRecord(null);
    toast({
      title: "Success",
      description: "Cost updated successfully",
    });
  };

  const handleDiscountChange = (recordId: number, discount: number) => {
    const updatedCustomer = {
      ...customer,
      records: customer.records.map(record => 
        record.id === recordId 
          ? { ...record, discount }
          : record
      )
    };
    setCustomer(updatedCustomer);
    setEditingDiscount(null);
    toast({
      title: "Success",
      description: "Discount updated successfully",
    });
  };

  const togglePaymentStatus = (recordId: number) => {
    const updatedCustomer = {
      ...customer,
      records: customer.records.map(record => 
        record.id === recordId 
          ? { ...record, paid: !record.paid }
          : record
      )
    };
    setCustomer(updatedCustomer);
    toast({
      title: "Success",
      description: "Payment status updated",
    });
  };

  const deleteRecord = (recordId: number) => {
    const updatedCustomer = {
      ...customer,
      records: customer.records.filter(record => record.id !== recordId)
    };
    setCustomer(updatedCustomer);
    toast({
      title: "Record Deleted",
      description: "Service record has been deleted successfully",
      variant: "destructive"
    });
  };

  const isOverdue = (dateString: string) => {
    const recordDate = new Date(dateString);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > 30; // Consider overdue if more than 30 days
  };

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

  const totalAmount = customer.records.reduce((sum, record) => sum + record.total, 0);
  const totalAcres = customer.records.reduce((sum, record) => sum + record.acres, 0);
  const paidRecords = customer.records.filter(record => record.paid);
  const activeRecords = customer.records.filter(record => !record.paid);
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
            <p><strong>Email:</strong> {customer.email}</p>
            <p><strong>Phone:</strong> {customer.phone}</p>
            <p><strong>Location:</strong> {customer.location}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Total Records:</strong> {customer.records.length}</p>
            <p><strong>Total Acres:</strong> {totalAcres}</p>
            <p><strong>Total Amount:</strong> ${totalAmount.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {customer.records.length > 0 ? (
              <p>Last service: {customer.records[customer.records.length - 1].type} on {customer.records[customer.records.length - 1].date}</p>
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
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>No of Acres</TableHead>
                <TableHead>Cost per Acre</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Final Amount</TableHead>
                <TableHead>Payment Status</TableHead>
                {!showPaidRecords && <TableHead>Actions</TableHead>}
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
                      {editingRecord === record.id ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
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
                    <TableCell className="font-medium">${record.total.toLocaleString()}</TableCell>
                    <TableCell>
                      {editingDiscount === record.id ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
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
                          <span>${record.discount}</span>
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
                    <TableCell className="font-bold">${finalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={paymentStatus === 'paid' ? 'default' : paymentStatus === 'overdue' ? 'destructive' : 'secondary'}
                        className={!showPaidRecords ? "cursor-pointer" : ""}
                        onClick={!showPaidRecords ? () => togglePaymentStatus(record.id) : undefined}
                      >
                        {paymentStatus}
                      </Badge>
                    </TableCell>
                    {!showPaidRecords && (
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant={record.paid ? "destructive" : "default"}
                            onClick={() => togglePaymentStatus(record.id)}
                          >
                            {record.paid ? "Mark Unpaid" : "Mark Paid"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteRecord(record.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
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