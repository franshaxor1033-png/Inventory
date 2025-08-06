import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table/data-table";
import AssetForm from "@/components/forms/asset-form";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { type Asset } from "@shared/schema";

type AssetWithItem = Asset & { item: { namaBarang: string; kodeBarang: string } };

export default function Assets() {
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetWithItem | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assets, isLoading } = useQuery({
    queryKey: ["/api/assets"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/assets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      toast({
        title: "Asset deleted",
        description: "The asset has been successfully deleted.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedAsset(null);
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Failed to delete the asset. Please try again.",
        variant: "destructive",
      });
    },
  });

  const columns = [
    {
      key: "nomorSeri" as keyof AssetWithItem,
      header: "Serial Number",
      sortable: true,
    },
    {
      key: "item" as keyof AssetWithItem,
      header: "Item",
      render: (value: any) => (
        <div>
          <div className="font-medium">{value.namaBarang}</div>
          <div className="text-sm text-slate-500">{value.kodeBarang}</div>
        </div>
      ),
      sortable: false,
    },
    {
      key: "status" as keyof AssetWithItem,
      header: "Status",
      render: (value: string) => (
        <Badge 
          variant="outline"
          className={
            value === "TERSEDIA" ? "bg-green-50 text-green-700" :
            value === "DIPINJAM" ? "bg-yellow-50 text-yellow-700" :
            "bg-red-50 text-red-700"
          }
        >
          {value === "TERSEDIA" ? "Available" : value === "DIPINJAM" ? "On Loan" : "Under Repair"}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "createdAt" as keyof AssetWithItem,
      header: "Added Date",
      render: (value: string) => format(new Date(value), "MMM dd, yyyy"),
      sortable: true,
    },
  ];

  const handleEdit = (asset: AssetWithItem) => {
    setSelectedAsset(asset);
    setIsEditSheetOpen(true);
  };

  const handleDelete = (asset: AssetWithItem) => {
    setSelectedAsset(asset);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setIsCreateSheetOpen(false);
    setIsEditSheetOpen(false);
    setSelectedAsset(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Assets</h1>
            <p className="text-slate-600">Manage your machine assets and their status</p>
          </div>
          
          <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Asset
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[600px] sm:max-w-[600px]">
              <SheetHeader>
                <SheetTitle>Add New Asset</SheetTitle>
              </SheetHeader>
              <AssetForm onSuccess={handleFormSuccess} />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-6">
        <DataTable
          data={assets || []}
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
            <SheetTitle>Edit Asset</SheetTitle>
          </SheetHeader>
          {selectedAsset && (
            <AssetForm 
              asset={selectedAsset} 
              onSuccess={handleFormSuccess}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the asset
              "{selectedAsset?.nomorSeri}" and remove it from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedAsset && deleteMutation.mutate(selectedAsset.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
