import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface HarvestorRecord {
  id: string;
  date: string;
  customer_name: string;
  acres: number;
  cost: number;
  discount?: number;
  total: number;
}

export const useHarvestorRecords = () => {
  const [records, setRecords] = useState<HarvestorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecords();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('harvestor-records-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'harvestor_records' },
        () => fetchRecords()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('harvestor_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching harvestor records:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRecord = async (recordData: Omit<HarvestorRecord, 'id'>) => {
    try {
      const { error } = await supabase
        .from('harvestor_records')
        .insert([recordData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Harvestor record added successfully",
      });
    } catch (error) {
      console.error('Error adding harvestor record:', error);
      toast({
        title: "Error",
        description: "Failed to add harvestor record",
        variant: "destructive"
      });
    }
  };

  const updateRecord = async (id: string, updateData: Partial<Omit<HarvestorRecord, 'id'>>) => {
    try {
      const { error } = await supabase
        .from('harvestor_records')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Harvestor record updated successfully",
      });
    } catch (error) {
      console.error('Error updating harvestor record:', error);
      toast({
        title: "Error",
        description: "Failed to update harvestor record",
        variant: "destructive"
      });
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('harvestor_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Record Deleted",
        description: "Harvestor record has been deleted successfully",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error deleting harvestor record:', error);
      toast({
        title: "Error",
        description: "Failed to delete harvestor record",
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