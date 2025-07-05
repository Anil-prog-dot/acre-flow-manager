import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  const customer = customerData[Number(id) as keyof typeof customerData];

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
          <CardTitle>Service Records</CardTitle>
          <CardDescription>Complete history of services provided</CardDescription>
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