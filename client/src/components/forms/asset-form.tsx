import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertAssetSchema, type Asset, type Item } from "@shared/schema";
import { z } from "zod";

const formSchema = insertAssetSchema;

type AssetFormData = z.infer<typeof formSchema>;
type AssetWithItem = Asset & { item: { namaBarang: string; kodeBarang: string } };

interface AssetFormProps {
  asset?: AssetWithItem;
  onSuccess?: () => void;
}

export default function AssetForm({ asset, onSuccess }: AssetFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items } = useQuery({
    queryKey: ["/api/items"],
  });

  const form = useForm<AssetFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomorSeri: asset?.nomorSeri || "",
      status: asset?.status || "TERSEDIA",
      barangId: asset?.barangId || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: AssetFormData) => apiRequest("POST", "/api/assets", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Asset created",
        description: "The asset has been successfully created.",
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Create failed",
        description: "Failed to create the asset. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: AssetFormData) => apiRequest("PUT", `/api/assets/${asset?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Asset updated",
        description: "The asset has been successfully updated.",
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update the asset. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AssetFormData) => {
    if (asset) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const machineItems = (items as Item[] || []).filter(item => item.kategori === "MESIN");

  return (
    <div className="mt-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="nomorSeri"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serial Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., VC001-2024" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="barangId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Machine Item</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a machine item" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {machineItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.namaBarang} ({item.kodeBarang})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="TERSEDIA">Available</SelectItem>
                    <SelectItem value="DIPINJAM">On Loan</SelectItem>
                    <SelectItem value="PERBAIKAN">Under Repair</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : asset ? "Update Asset" : "Create Asset"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
