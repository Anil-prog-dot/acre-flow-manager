import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TrailerRecord {
  id: string;
  date: string;
  name: string;
  type: string;
  no_of_trips: number;
  cost: number;
  discount: number;
  total: number;
  paid: boolean;
  created_at: string;
  updated_at: string;
  description?: string;
}

export const useTrailerRecords = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["trailer-records"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("trailer_records")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching trailer records:", error);
          // Return empty array instead of throwing to prevent app crash
          return [];
        }

        return data as TrailerRecord[];
      } catch (err) {
        console.error("Unexpected error fetching trailer records:", err);
        return [];
      }
    },
  });

  const addMutation = useMutation({
    mutationFn: async (record: Omit<TrailerRecord, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("trailer_records")
        .insert([record])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trailer-records"] });
      toast({
        title: "Success",
        description: "Trailer record added successfully",
      });
    },
    onError: (error) => {
      console.error("Error adding trailer record:", error);
      toast({
        title: "Error",
        description: "Failed to add trailer record",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TrailerRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from("trailer_records")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trailer-records"] });
    },
    onError: (error) => {
      console.error("Error updating trailer record:", error);
      toast({
        title: "Error",
        description: "Failed to update trailer record",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("trailer_records")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trailer-records"] });
      toast({
        title: "Success",
        description: "Trailer record deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error deleting trailer record:", error);
      toast({
        title: "Error",
        description: "Failed to delete trailer record",
        variant: "destructive",
      });
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: async ({ id, paid }: { id: string; paid: boolean }) => {
      const { data, error } = await supabase
        .from("trailer_records")
        .update({ paid })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trailer-records"] });
      toast({
        title: "Success",
        description: "Trailer record updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating trailer record:", error);
      toast({
        title: "Error",
        description: "Failed to update trailer record",
        variant: "destructive",
      });
    },
  });

  return {
    trailerRecords: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    addTrailerRecord: addMutation.mutate,
    updateTrailerRecord: updateMutation.mutate,
    deleteTrailerRecord: deleteMutation.mutate,
    markPaid: markPaidMutation.mutate,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};