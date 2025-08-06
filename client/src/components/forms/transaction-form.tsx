import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertTransactionLogSchema, type Item, type Asset } from "@shared/schema";
import { z } from "zod";

const formSchema = insertTransactionLogSchema.omit({ userId: true });

type TransactionFormData = z.infer<typeof formSchema>;

interface TransactionFormProps {
  onSuccess?: () => void;
}

export default function TransactionForm({ onSuccess }: TransactionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const { data: items } = useQuery({
    queryKey: ["/api/items"],
  });

  const { data: availableAssets } = useQuery({
    queryKey: ["/api/assets/available", selectedItem?.id],
    enabled: !!selectedItem?.id && selectedItem?.kategori === "MESIN",
  });

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      namaPeminta: "",
      areaKebutuhan: "",
      jumlah: undefined,
      tipe: "KELUAR",
      barangId: "",
      asetId: undefined,
      tanggalPermintaan: new Date(),
    },
  });

  const watchedItemId = form.watch("barangId");

  useEffect(() => {
    if (watchedItemId && items) {
      const item = (items as Item[]).find(i => i.id === watchedItemId);
      setSelectedItem(item || null);
      
      // Reset dependent fields when item changes
      form.setValue("jumlah", undefined);
      form.setValue("asetId", undefined);
    }
  }, [watchedItemId, items, form]);

  const createMutation = useMutation({
    mutationFn: (data: TransactionFormData) => apiRequest("POST", "/api/transactions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      toast({
        title: "Transaksi dibuat",
        description: "Transaksi berhasil dicatat.",
      });
      form.reset();
      setSelectedItem(null);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Transaksi gagal",
        description: error.message || "Gagal membuat transaksi. Silakan coba lagi.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TransactionFormData) => {
    createMutation.mutate(data);
  };

  const isLoading = createMutation.isPending;
  const isConsumable = selectedItem && (selectedItem.kategori === "KIMIA" || selectedItem.kategori === "PERALATAN");
  const isMachine = selectedItem && selectedItem.kategori === "MESIN";

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="namaPeminta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Peminta</FormLabel>
                  <FormControl>
                    <Input placeholder="contoh: Budi Santoso" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="areaKebutuhan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area Kebutuhan</FormLabel>
                  <FormControl>
                    <Input placeholder="contoh: Kantor Lantai 2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="tipe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Transaksi</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="KELUAR">Keluar (Permintaan)</SelectItem>
                      <SelectItem value="MASUK">Masuk (Pengembalian)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="barangId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barang</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih barang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(items as Item[] || []).map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.namaBarang} ({item.kodeBarang})
                          {(item.kategori === "KIMIA" || item.kategori === "PERALATAN") && 
                            ` - Stok: ${item.stok} ${item.satuan}`
                          }
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Conditional fields based on item type */}
          {isConsumable && (
            <FormField
              control={form.control}
              name="jumlah"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Jumlah 
                    {selectedItem && (
                      <span className="text-sm text-slate-500 ml-2">
                        (Tersedia: {selectedItem.stok} {selectedItem.satuan})
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      max={selectedItem?.stok || undefined}
                      placeholder="Masukkan jumlah" 
                      value={field.value?.toString() || ""}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {isMachine && (
            <FormField
              control={form.control}
              name="asetId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aset (Nomor Seri)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih aset yang tersedia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(availableAssets as Asset[] || []).map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.nomorSeri}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setSelectedItem(null);
              }}
              disabled={isLoading}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Mencatat..." : "Catat Transaksi"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
