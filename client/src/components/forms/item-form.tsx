import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertItemSchema, type Item } from "@shared/schema";
import { z } from "zod";

const formSchema = insertItemSchema.extend({
  stok: z.coerce.number().min(0, "Stock must be 0 or greater"),
  batasMinimumStok: z.coerce.number().min(0, "Minimum stock must be 0 or greater"),
});

type ItemFormData = z.infer<typeof formSchema>;

interface ItemFormProps {
  item?: Item;
  onSuccess?: () => void;
}

export default function ItemForm({ item, onSuccess }: ItemFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ItemFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kodeBarang: item?.kodeBarang || "",
      namaBarang: item?.namaBarang || "",
      kategori: item?.kategori || "KIMIA",
      stok: item?.stok || 0,
      satuan: item?.satuan || "",
      batasMinimumStok: item?.batasMinimumStok || 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: ItemFormData) => apiRequest("POST", "/api/items", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Item created",
        description: "The item has been successfully created.",
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Create failed",
        description: "Failed to create the item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ItemFormData) => apiRequest("PUT", `/api/items/${item?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Item updated",
        description: "The item has been successfully updated.",
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update the item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ItemFormData) => {
    if (item) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="mt-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="kodeBarang"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., KB001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="kategori"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="KIMIA">Chemical</SelectItem>
                      <SelectItem value="PERALATAN">Equipment</SelectItem>
                      <SelectItem value="MESIN">Machine</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="namaBarang"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Floor Cleaner Concentrate" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="stok"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Stock</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="satuan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Liter, Pcs, Botol" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="batasMinimumStok"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Stock Threshold</FormLabel>
                <FormControl>
                  <Input type="number" min="0" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : item ? "Update Item" : "Create Item"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
