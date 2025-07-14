import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CustomerRecord {
  id: string;
  customer_id: string;
  date: string;
  type: string;
  acres: number;
  cost: number;
  total: number;
  discount: number;
  paid: boolean;
  description?: string;
}

export const useCustomerRecords = (customerId?: string) => {
  const [records, setRecords] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (customerId) {
      fetchRecords();
      
      // Set up realtime subscription
      const channel = supabase
        .channel('customer-records-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'customer_records' },
          () => fetchRecords()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [customerId]);

  const fetchRecords = async () => {
    if (!customerId) return;
    
    try {
      const { data, error } = await supabase
        .from('customer_records')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching customer records:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRecord = async (recordData: Omit<CustomerRecord, 'id'>) => {
    try {
      const { error } = await supabase
        .from('customer_records')
        .insert([recordData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Record added successfully",
      });
    } catch (error) {
      console.error('Error adding record:', error);
      toast({
        title: "Error",
        description: "Failed to add record",
        variant: "destructive"
      });
    }
  };

  const updateRecord = async (id: string, updates: Partial<CustomerRecord>) => {
    try {
      const { error } = await supabase
        .from('customer_records')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Record updated successfully",
      });
    } catch (error) {
      console.error('Error updating record:', error);
      toast({
        title: "Error",
        description: "Failed to update record",
        variant: "destructive"
      });
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customer_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Record Deleted",
        description: "Service record has been deleted successfully",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: "Error",
        description: "Failed to delete record",
        variant: "destructive"
      });
    }
  };

  return {
    records,
    loading,
    addRecord,
    updateRecord,
    deleteRecord,
    refetch: fetchRecords
  };
};