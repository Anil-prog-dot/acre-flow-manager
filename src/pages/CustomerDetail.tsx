import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Sample customer data with details
const customerData = {
  1: {
    name: "John Smith",
    email: "john@example.com",
    phone: "555-0123",
    location: "Farm Valley",
    records: [
      { id: 1, date: "2024-01-15", type: "Plowing", acres: 25, cost: 150, total: 3750 },
      { id: 2, date: "2024-02-20", type: "Seeding", acres: 25, cost: 120, total: 3000 },
      { id: 3, date: "2024-03-10", type: "Fertilizing", acres: 25, cost: 80, total: 2000 },
    ]
  },
  2: {
    name: "Mary Johnson",
    email: "mary@example.com",
    phone: "555-0124",
    location: "Green Acres",
    records: [
      { id: 1, date: "2024-01-20", type: "Harvesting", acres: 40, cost: 200, total: 8000 },
      { id: 2, date: "2024-02-15", type: "Plowing", acres: 40, cost: 150, total: 6000 },
    ]
  },
  3: {
    name: "Robert Brown",
    email: "robert@example.com",
    phone: "555-0125",
    location: "Sunset Farm",
    records: [
      { id: 1, date: "2024-01-10", type: "Seeding", acres: 30, cost: 120, total: 3600 },
      { id: 2, date: "2024-02-25", type: "Irrigation", acres: 30, cost: 100, total: 3000 },
      { id: 3, date: "2024-03-15", type: "Pest Control", acres: 30, cost: 90, total: 2700 },
    ]
  }
};

const CustomerDetail = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(customerData[Number(id) as keyof typeof customerData]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
      id: customer.records.length + 1,
      date: formData.date,
      type: formData.type,
      acres: Number(formData.acres),
      cost: Number(formData.cost),
      total: Number(formData.acres) * Number(formData.cost)
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
              <CardTitle>Service Records</CardTitle>
              <CardDescription>Complete history of services provided</CardDescription>
            </div>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {customer.records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.type}</TableCell>
                  <TableCell>{record.acres}</TableCell>
                  <TableCell>${record.cost}</TableCell>
                  <TableCell className="font-medium">${record.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDetail;