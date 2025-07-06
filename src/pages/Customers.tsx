import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCustomers } from "@/hooks/useCustomers";
import { useAuth } from "@/components/auth/AuthProvider";

const Customers = () => {
  const { customers, loading, addCustomer, deleteCustomer } = useCustomers();
  const { isAdmin } = useAuth();
  const [showPaidRecords, setShowPaidRecords] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: ""
  });

  // For now, paid customers functionality is disabled until we implement it properly
  const paidCustomers: any[] = [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      return;
    }

    await addCustomer({
      name: formData.name,
      email: "",
      phone: "",
      location: ""
    });

    setFormData({ name: "" });
    setIsDialogOpen(false);
  };

  const handleDeleteCustomer = async (id: string) => {
    await deleteCustomer(id);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Customers</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant={!showPaidRecords ? "default" : "outline"}
            onClick={() => setShowPaidRecords(false)}
          >
            Active Customers
          </Button>
          <Button 
            variant={showPaidRecords ? "default" : "outline"}
            onClick={() => setShowPaidRecords(true)}
          >
            Paid Records ({paidCustomers.length})
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Enter the customer details below
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCustomer} className="space-y-4">
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
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Customer</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(showPaidRecords ? paidCustomers : customers).map((customer) => (
          <Card key={customer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <Link 
                  to={`/customers/${customer.id}`}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  {customer.name}
                </Link>
                <div className="flex space-x-1">
                  <Link to={`/customers/${customer.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {!showPaidRecords && isAdmin && (
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
                          <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {customer.name}? This will permanently remove the customer and all their records. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCustomer(customer.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardTitle>
              <CardDescription>{customer.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {customer.phone && (
                  <p className="text-sm text-muted-foreground">
                    📞 {customer.phone}
                  </p>
                )}
                {customer.location && (
                  <p className="text-sm text-muted-foreground">
                    📍 {customer.location}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Customers;