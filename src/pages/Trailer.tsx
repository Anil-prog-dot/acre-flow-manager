import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, Edit2, Trash2, Check, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTrailerRecords, TrailerRecord } from "@/hooks/useTrailerRecords";

const formSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  no_of_trips: z.number().min(1, "Number of trips must be at least 1"),
  cost: z.number().min(0, "Cost must be non-negative"),
  discount: z.number().min(0, "Discount must be non-negative").default(0),
});

type FormData = z.infer<typeof formSchema>;

export default function Trailer() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TrailerRecord | null>(null);
  const [editingField, setEditingField] = useState<{ id: string; field: string } | null>(null);
  const [editValues, setEditValues] = useState<{ [key: string]: number }>({});
  const { trailerRecords, addTrailerRecord, updateTrailerRecord, deleteTrailerRecord, markPaid, isAdding } = useTrailerRecords();
  const { isAdmin } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      name: "",
      type: "",
      no_of_trips: 1,
      cost: 0,
      discount: 0,
    },
  });

  const activeRecords = trailerRecords.filter(record => !record.paid);
  const paidRecords = trailerRecords.filter(record => record.paid);

  const onSubmit = (data: FormData) => {
    const total = data.no_of_trips * data.cost - data.discount;
    
    const recordData = {
      date: format(data.date, "yyyy-MM-dd"),
      name: data.name,
      type: data.type,
      no_of_trips: data.no_of_trips,
      cost: data.cost,
      discount: data.discount,
      total,
      paid: false,
    };

    if (editingRecord) {
      updateTrailerRecord({ id: editingRecord.id, ...recordData });
    } else {
      addTrailerRecord(recordData);
    }

    form.reset();
    setIsDialogOpen(false);
    setEditingRecord(null);
  };

  const handleEdit = (record: TrailerRecord) => {
    setEditingRecord(record);
    form.reset({
      date: new Date(record.date),
      name: record.name,
      type: record.type,
      no_of_trips: record.no_of_trips,
      cost: record.cost,
      discount: record.discount,
    });
    setIsDialogOpen(true);
  };

  const handleInlineEdit = (id: string, field: string, currentValue: number) => {
    setEditingField({ id, field });
    setEditValues({ ...editValues, [`${id}-${field}`]: currentValue });
  };

  const handleInlineUpdate = (record: TrailerRecord, field: string) => {
    const newValue = editValues[`${record.id}-${field}`];
    const updates: Partial<TrailerRecord> = { [field]: newValue };
    
    // Recalculate total if cost, discount, or no_of_trips changes
    if (field === 'cost' || field === 'discount' || field === 'no_of_trips') {
      const cost = field === 'cost' ? newValue : record.cost;
      const discount = field === 'discount' ? newValue : record.discount;
      const no_of_trips = field === 'no_of_trips' ? newValue : record.no_of_trips;
      updates.total = no_of_trips * cost - discount;
    }
    
    updateTrailerRecord({ id: record.id, ...updates });
    setEditingField(null);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const renderEditableCell = (record: TrailerRecord, field: string, value: number) => {
    const isEditing = editingField?.id === record.id && editingField?.field === field;
    
    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            value={editValues[`${record.id}-${field}`] || 0}
            onChange={(e) => setEditValues({ 
              ...editValues, 
              [`${record.id}-${field}`]: parseFloat(e.target.value) || 0 
            })}
            className="w-20 h-8"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleInlineUpdate(record, field)}
            className="h-8 w-8 p-0"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancelEdit}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <div 
        className="cursor-pointer hover:bg-muted p-1 rounded flex items-center justify-between"
        onClick={() => handleInlineEdit(record.id, field, value)}
      >
        <span>{field === 'cost' || field === 'discount' ? formatCurrency(value) : value}</span>
        <Edit2 className="h-3 w-3 opacity-50" />
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Trailer Records</h1>
          <p className="text-muted-foreground">Manage your trailer records and payments</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingRecord(null); form.reset(); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Record
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingRecord ? "Edit Trailer Record" : "Add New Trailer Record"}</DialogTitle>
              <DialogDescription>
                {editingRecord ? "Update the trailer record details." : "Enter the details for the new trailer record."}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date()}
                              defaultMonth={new Date(2020, 0)}
                              captionLayout="dropdown-buttons"
                              fromYear={2000}
                              toYear={new Date().getFullYear()}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter type" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="no_of_trips"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Trips</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost per Trip</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            step="0.01"
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            step="0.01"
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isAdding}>
                    {editingRecord ? "Update Record" : "Add Record"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Records ({activeRecords.length})</TabsTrigger>
          <TabsTrigger value="paid">Paid Records ({paidRecords.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Trailer Records</CardTitle>
              <CardDescription>Records that haven't been paid yet</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Trips</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{format(new Date(record.date), "MMM dd, yyyy")}</TableCell>
                      <TableCell>{record.name}</TableCell>
                      <TableCell>{record.type}</TableCell>
                      <TableCell>{record.no_of_trips}</TableCell>
                      <TableCell>{renderEditableCell(record, 'cost', record.cost)}</TableCell>
                      <TableCell>{renderEditableCell(record, 'discount', record.discount)}</TableCell>
                      <TableCell>{formatCurrency(record.total)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Unpaid</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(record)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => markPaid({ id: record.id, paid: true })}
                          >
                            Mark Paid
                          </Button>
                          {isAdmin && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteTrailerRecord(record.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {activeRecords.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">
                        No active records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid">
          <Card>
            <CardHeader>
              <CardTitle>Paid Trailer Records</CardTitle>
              <CardDescription>Records that have been paid</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Trips</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paidRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{format(new Date(record.date), "MMM dd, yyyy")}</TableCell>
                      <TableCell>{record.name}</TableCell>
                      <TableCell>{record.type}</TableCell>
                      <TableCell>{record.no_of_trips}</TableCell>
                      <TableCell>{formatCurrency(record.cost)}</TableCell>
                      <TableCell>{formatCurrency(record.discount)}</TableCell>
                      <TableCell>{formatCurrency(record.total)}</TableCell>
                      <TableCell>
                        <Badge variant="default">Paid</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markPaid({ id: record.id, paid: false })}
                          >
                            Mark Unpaid
                          </Button>
                          {isAdmin && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteTrailerRecord(record.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paidRecords.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">
                        No paid records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}