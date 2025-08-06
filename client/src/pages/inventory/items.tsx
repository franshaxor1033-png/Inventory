import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table/data-table";
import ItemForm from "@/components/forms/item-form";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus } from "lucide-react";
import { type Item } from "@shared/schema";

export default function Items() {
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ["/api/items"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      toast({
        title: "Barang dihapus",
        description: "Barang berhasil dihapus.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
    },
    onError: () => {
      toast({
        title: "Hapus gagal",
        description: "Gagal menghapus barang. Silakan coba lagi.",
        variant: "destructive",
      });
    },
  });

  const columns = [
    {
      key: "kodeBarang" as keyof Item,
      header: "Kode",
      sortable: true,
    },
    {
      key: "namaBarang" as keyof Item,
      header: "Nama",
      sortable: true,
    },
    {
      key: "kategori" as keyof Item,
      header: "Kategori",
      render: (value: string) => (
        <Badge 
          variant="outline"
          className={
            value === "KIMIA" ? "bg-blue-50 text-blue-700" :
            value === "PERALATAN" ? "bg-green-50 text-green-700" :
            "bg-purple-50 text-purple-700"
          }
        >
          {value}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "stok" as keyof Item,
      header: "Stok",
      render: (value: number, row: Item) => (
        <span className={value <= row.batasMinimumStok ? "text-red-600 font-medium" : ""}>
          {value} {row.satuan}
        </span>
      ),
      sortable: true,
    },
    {
      key: "batasMinimumStok" as keyof Item,
      header: "Stok Min.",
      render: (value: number, row: Item) => `${value} ${row.satuan}`,
      sortable: true,
    },
  ];

  const handleEdit = (item: Item) => {
    setSelectedItem(item);
    setIsEditSheetOpen(true);
  };

  const handleDelete = (item: Item) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setIsCreateSheetOpen(false);
    setIsEditSheetOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Barang</h1>
            <p className="text-slate-600">Kelola barang inventaris dan level stok Anda</p>
          </div>
          
          <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Barang
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[600px] sm:max-w-[600px]">
              <SheetHeader>
                <SheetTitle>Tambah Barang Baru</SheetTitle>
              </SheetHeader>
              <ItemForm onSuccess={handleFormSuccess} />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-6">
        <DataTable
          data={items || []}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      </div>

      {/* Edit Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="w-[600px] sm:max-w-[600px]">
          <SheetHeader>
            <SheetTitle>Edit Barang</SheetTitle>
          </SheetHeader>
          {selectedItem && (
            <ItemForm 
              item={selectedItem} 
              onSuccess={handleFormSuccess}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus permanen barang
              "{selectedItem?.namaBarang}" dan menghapusnya dari database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedItem && deleteMutation.mutate(selectedItem.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
