import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DataTable } from "@/components/data-table/data-table";
import { useToast } from "@/hooks/use-toast";
import { 
  CalendarIcon, 
  Download, 
  FileSpreadsheet, 
  FileText,
  Filter,
  X
} from "lucide-react";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import { type Item } from "@shared/schema";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface FilterForm {
  startDate?: Date;
  endDate?: Date;
  itemIds: string[];
  searchTerm: string;
}

export default function TransactionReports() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<FilterForm>({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
    itemIds: [],
    searchTerm: ""
  });

  const form = useForm<FilterForm>({
    defaultValues: filters
  });

  // Fetch transactions
  const { data: allTransactions, isLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  // Fetch items for filter dropdown
  const { data: items } = useQuery({
    queryKey: ["/api/items"],
  });

  // Filter transactions based on current filters
  const filteredTransactions = (allTransactions || []).filter((transaction: any) => {
    const transactionDate = new Date(transaction.tanggalPermintaan);
    
    // Date range filter
    if (filters.startDate && transactionDate < filters.startDate) return false;
    if (filters.endDate && transactionDate > filters.endDate) return false;
    
    // Item filter
    if (filters.itemIds.length > 0 && !filters.itemIds.includes(transaction.barangId)) return false;
    
    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      return (
        transaction.namaPeminta.toLowerCase().includes(searchLower) ||
        transaction.areaKebutuhan.toLowerCase().includes(searchLower) ||
        transaction.item?.namaBarang.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const columns = [
    {
      key: "tanggalPermintaan" as keyof any,
      header: "Date",
      render: (value: string) => (
        <div>
          <div className="font-medium">{format(new Date(value), "MMM dd, yyyy")}</div>
          <div className="text-sm text-slate-500">{format(new Date(value), "h:mm a")}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "item" as keyof any,
      header: "Item",
      render: (value: any) => (
        <div>
          <div className="font-medium">{value?.namaBarang}</div>
          <div className="text-sm text-slate-500">{value?.kodeBarang}</div>
        </div>
      ),
      sortable: false,
    },
    {
      key: "namaPeminta" as keyof any,
      header: "Requester",
      sortable: true,
    },
    {
      key: "areaKebutuhan" as keyof any,
      header: "Area",
      sortable: true,
    },
    {
      key: "tipe" as keyof any,
      header: "Type",
      render: (value: string) => (
        <Badge 
          variant="outline"
          className={
            value === "KELUAR" 
              ? "bg-yellow-50 text-yellow-700 border-yellow-200" 
              : "bg-green-50 text-green-700 border-green-200"
          }
        >
          {value === "KELUAR" ? "OUT" : "IN"}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "jumlah" as keyof any,
      header: "Quantity",
      render: (value: number, row: any) => {
        if (!value) return "N/A";
        return `${value} ${row.item?.satuan || ""}`;
      },
      sortable: true,
    },
    {
      key: "asset" as keyof any,
      header: "Asset",
      render: (value: any) => value?.nomorSeri || "N/A",
      sortable: false,
    },
  ];

  const handleFilterSubmit = (data: FilterForm) => {
    setFilters(data);
    toast({
      title: "Filters applied",
      description: `Found ${filteredTransactions.length} transactions`,
    });
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      startDate: subDays(new Date(), 30),
      endDate: new Date(),
      itemIds: [],
      searchTerm: ""
    };
    setFilters(defaultFilters);
    form.reset(defaultFilters);
  };

  const exportToExcel = () => {
    const exportData = filteredTransactions.map((transaction: any) => ({
      Date: format(new Date(transaction.tanggalPermintaan), "yyyy-MM-dd HH:mm:ss"),
      "Item Code": transaction.item?.kodeBarang,
      "Item Name": transaction.item?.namaBarang,
      Requester: transaction.namaPeminta,
      Area: transaction.areaKebutuhan,
      Type: transaction.tipe,
      Quantity: transaction.jumlah || "",
      Unit: transaction.item?.satuan || "",
      "Asset Serial": transaction.asset?.nomorSeri || "",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    
    const filename = `transaction-report-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
    XLSX.writeFile(wb, filename);
    
    toast({
      title: "Excel exported",
      description: `Downloaded ${filename}`,
    });
  };

  const exportToPDF = () => {
    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(18);
    pdf.text("Transaction Report", 20, 20);
    
    // Add date range
    pdf.setFontSize(12);
    const dateRange = `${filters.startDate ? format(filters.startDate, "MMM dd, yyyy") : "All"} - ${filters.endDate ? format(filters.endDate, "MMM dd, yyyy") : "All"}`;
    pdf.text(`Period: ${dateRange}`, 20, 35);
    
    // Prepare table data
    const tableData = filteredTransactions.map((transaction: any) => [
      format(new Date(transaction.tanggalPermintaan), "MM/dd/yyyy"),
      transaction.item?.kodeBarang || "",
      transaction.item?.namaBarang || "",
      transaction.namaPeminta,
      transaction.areaKebutuhan,
      transaction.tipe,
      transaction.jumlah ? `${transaction.jumlah} ${transaction.item?.satuan || ""}` : "",
      transaction.asset?.nomorSeri || "",
    ]);

    // Add table
    (pdf as any).autoTable({
      head: [["Date", "Code", "Item", "Requester", "Area", "Type", "Quantity", "Asset"]],
      body: tableData,
      startY: 50,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [71, 85, 105] },
    });
    
    const filename = `transaction-report-${format(new Date(), "yyyy-MM-dd")}.pdf`;
    pdf.save(filename);
    
    toast({
      title: "PDF exported", 
      description: `Downloaded ${filename}`,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Transaction Reports</h1>
            <p className="text-slate-600">View, filter, and export transaction history</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={exportToExcel}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="outline" onClick={exportToPDF}>
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFilterSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Start Date */}
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "MMM dd, yyyy")
                                ) : (
                                  <span>Pick start date</span>
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
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />

                  {/* End Date */}
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "MMM dd, yyyy")
                                ) : (
                                  <span>Pick end date</span>
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
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />

                  {/* Items Filter */}
                  <FormField
                    control={form.control}
                    name="itemIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Items</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            const currentItems = field.value || [];
                            if (value && !currentItems.includes(value)) {
                              field.onChange([...currentItems, value]);
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select items..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(items as Item[] || []).map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.namaBarang}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {field.value && field.value.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {field.value.map((itemId) => {
                              const item = (items as Item[] || []).find(i => i.id === itemId);
                              return (
                                <Badge key={itemId} variant="secondary" className="text-xs">
                                  {item?.namaBarang}
                                  <button
                                    type="button"
                                    className="ml-1 hover:text-red-600"
                                    onClick={() => {
                                      field.onChange(field.value.filter(id => id !== itemId));
                                    }}
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              );
                            })}
                          </div>
                        )}
                      </FormItem>
                    )}
                  />

                  {/* Search */}
                  <FormField
                    control={form.control}
                    name="searchTerm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Search</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Requester or area..." 
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Button type="submit">
                    Apply Filters
                  </Button>
                  <Button type="button" variant="outline" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                  <div className="text-sm text-slate-600 ml-4">
                    Showing {filteredTransactions.length} transactions
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredTransactions}
              columns={columns}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
