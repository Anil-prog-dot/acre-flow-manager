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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useTrailerRecords, TrailerRecord } from "@/hooks/useTrailerRecords";
import { RealtimeVoiceRecorder } from "@/components/RealtimeVoiceRecorder";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  no_of_trips: z.number().min(1, "Number of trips must be at least 1"),
  cost: z.number().min(0, "Cost must be non-negative"),
  discount: z.number().min(0, "Discount must be non-negative"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function Trailer() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TrailerRecord | null>(null);
  const [editingField, setEditingField] = useState<{ id: string; field: string } | null>(null);
  const [editValues, setEditValues] = useState<{ [key: string]: number }>({});
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [bulkDiscount, setBulkDiscount] = useState(0);
  const { trailerRecords, addTrailerRecord, updateTrailerRecord, deleteTrailerRecord, markPaid, isAdding } = useTrailerRecords();
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      name: "",
      type: "",
      no_of_trips: undefined,
      cost: undefined,
      discount: undefined,
      description: "",
    },
  });

  const handleVoiceTranscription = (text: string, field: string) => {
    form.setValue(field as keyof FormData, text);
  };

  const activeRecords = [...trailerRecords.filter(record => !record.paid)].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const paidRecords = [...trailerRecords.filter(record => record.paid)].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const onSubmit = (data: FormData) => {
    const total = data.no_of_trips * data.cost - (data.discount || 0);
    
    const recordData = {
      date: format(data.date, "yyyy-MM-dd"),
      name: data.name,
      type: data.type,
      no_of_trips: data.no_of_trips,
      cost: data.cost,
      discount: data.discount || 0,
      total,
      paid: false,
      description: data.description || "",
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
      description: record.description || "",
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
      const record = trailerRecords.find(r => r.id === recordId);
      return record ? sum + ((record.no_of_trips * record.cost) - (record.discount || 0)) : sum;
    }, 0);
  };

  const handleBulkPayment = async () => {
    for (const recordId of selectedRecords) {
      markPaid({ id: recordId, paid: true });
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const renderEditableCell = (record: TrailerRecord, field: string, value: number) => {
    const isEditing = editingField?.id === record.id && editingField?.field === field;
    
    if (isEditing && !record.paid) {
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

    if (record.paid) {
      return (
        <span>{field === 'cost' || field === 'discount' ? formatCurrency(value) : value}</span>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{trailerRecords.reduce((sum, record) => sum + record.total, 0).toLocaleString()}</div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Amount Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{paidRecords.reduce((sum, record) => sum + record.total, 0).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Balance Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{activeRecords.reduce((sum, record) => sum + record.total, 0).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

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
                            placeholder="Enter number of trips"
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
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
                            placeholder="Enter cost per trip"
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
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
                             placeholder="Enter discount amount"
                             {...field} 
                             onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
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
              {selectedRecords.length > 0 && (
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedRecords.length === activeRecords.length && activeRecords.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Trips</TableHead>
                    <TableHead>Cost</TableHead>
                     <TableHead>Total</TableHead>
                     <TableHead>Description</TableHead>
                     <TableHead>Status</TableHead>
                     <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRecords.includes(record.id)}
                          onCheckedChange={(checked) => handleSelectRecord(record.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>{format(new Date(record.date), "MMM dd, yyyy")}</TableCell>
                      <TableCell>{record.name}</TableCell>
                      <TableCell>{record.type}</TableCell>
                      <TableCell>{record.no_of_trips}</TableCell>
                      <TableCell>{renderEditableCell(record, 'cost', record.cost)}</TableCell>
                       <TableCell>{formatCurrency(record.total)}</TableCell>
                       <TableCell>
                         <div className="max-w-[200px] truncate" title={record.description || ''}>
                           {record.description || 'No description'}
                         </div>
                       </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              getPaymentStatus(record.date) === 'default' ? 'secondary' :
                              getPaymentStatus(record.date) === 'secondary' ? 'outline' : 
                              'destructive'
                            }
                            className={
                              getPaymentStatus(record.date) === 'default' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                              getPaymentStatus(record.date) === 'secondary' ? 'bg-orange-100 text-orange-800 hover:bg-orange-100' :
                              'bg-red-100 text-red-800 hover:bg-red-100'
                            }
                          >
                            Unpaid
                          </Badge>
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
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="default">
                                Mark Paid
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>⚠️ Mark as Paid</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to mark this record as paid? This action will move the record to the paid section.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex justify-end space-x-2 mt-4">
                                <Button variant="outline">Cancel</Button>
                                <Button onClick={() => markPaid({ id: record.id, paid: true })}>
                                  Mark as Paid
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
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
                       <TableCell colSpan={10} className="text-center text-muted-foreground">
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
                     
                     <TableHead>Total</TableHead>
                     <TableHead>Description</TableHead>
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
                         <TableCell>{formatCurrency(record.total)}</TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate" title={record.description || ''}>
                            {record.description || 'No description'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">Paid</Badge>
                        </TableCell>
                       <TableCell>
                         <div className="flex space-x-2">
                           {isAdmin && (
                             <Dialog>
                               <DialogTrigger asChild>
                                 <Button size="sm" variant="destructive">
                                   Mark Unpaid
                                 </Button>
                               </DialogTrigger>
                               <DialogContent>
                                 <DialogHeader>
                                   <DialogTitle>⚠️ Mark as Unpaid</DialogTitle>
                                   <DialogDescription>
                                     Are you sure you want to mark this record as unpaid? This action will move the record back to active records. Only administrators can perform this action.
                                   </DialogDescription>
                                 </DialogHeader>
                                 <div className="flex justify-end space-x-2 mt-4">
                                   <Button variant="outline">Cancel</Button>
                                   <Button onClick={() => markPaid({ id: record.id, paid: false })}>
                                     Mark as Unpaid
                                   </Button>
                                 </div>
                               </DialogContent>
                             </Dialog>
                           )}
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
                       <TableCell colSpan={10} className="text-center text-muted-foreground">
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