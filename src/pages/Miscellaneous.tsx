import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Miscellaneous = () => {
  const [records, setRecords] = useState<Array<{id: number, date: string, amount: number, description: string}>>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    amount: "",
    description: ""
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.amount || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const newRecord = {
      id: records.length + 1,
      date: formData.date,
      amount: Number(formData.amount),
      description: formData.description
    };

    setRecords([...records, newRecord]);
    setFormData({ date: "", amount: "", description: "" });
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Record added successfully",
    });
  };

  const deleteRecord = (id: number) => {
    setRecords(records.filter(record => record.id !== id));
    toast({
      title: "Record Deleted",
      description: "Record has been deleted successfully",
      variant: "destructive"
    });
  };

  const totalAmount = records.reduce((sum, record) => sum + record.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Miscellaneous</h1>
        <p className="text-muted-foreground">Additional records and notes</p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Miscellaneous Records
              </CardTitle>
              <CardDescription>
                Track additional expenses and notes
              </CardDescription>
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
                    Enter the record details below
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
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter description"
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
          {records.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>${record.amount.toLocaleString()}</TableCell>
                      <TableCell>{record.description}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteRecord(record.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 pt-4 border-t">
                <p className="text-lg font-semibold">Total Amount: ${totalAmount.toLocaleString()}</p>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-center py-8">No records yet. Click "Add Record" to get started.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Miscellaneous;