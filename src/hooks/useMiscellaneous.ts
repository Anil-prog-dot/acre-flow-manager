import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MiscellaneousRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
}

export const useMiscellaneous = () => {
  const [records, setRecords] = useState<MiscellaneousRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecords();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('miscellaneous-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'miscellaneous' },
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
        .from('miscellaneous')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching miscellaneous records:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRecord = async (recordData: Omit<MiscellaneousRecord, 'id'>) => {
    try {
      const { error } = await supabase
        .from('miscellaneous')
        .insert([recordData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Miscellaneous record added successfully",
      });
    } catch (error) {
      console.error('Error adding miscellaneous record:', error);
      toast({
        title: "Error",
        description: "Failed to add miscellaneous record",
        variant: "destructive"
      });
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('miscellaneous')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Record Deleted",
        description: "Miscellaneous record has been deleted successfully",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error deleting miscellaneous record:', error);
      toast({
        title: "Error",
        description: "Failed to delete miscellaneous record",
        variant: "destructive"
      });
    }
  };

  return {
    records,
    loading,
    addRecord,
    deleteRecord,
    refetch: fetchRecords
  };
};