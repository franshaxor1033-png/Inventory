import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { type Item } from "@shared/schema";

export default function CriticalStockTable() {
  const { data: criticalItems, isLoading } = useQuery({
    queryKey: ["/api/items/critical/stock"],
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Critical Stock Alerts</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="text-slate-500">Loading critical stock items...</div>
        </div>
      </div>
    );
  }

  const items = criticalItems as Item[] || [];

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Critical Stock Alerts</h3>
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            {items.length} Items
          </Badge>
        </div>
      </div>
      
      {items.length === 0 ? (
        <div className="p-6 text-center text-slate-500">
          No critical stock items at this time
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Min. Threshold
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.slice(0, 5).map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{item.namaBarang}</div>
                      <div className="text-sm text-slate-500">{item.kategori}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-red-600 font-medium">
                        {item.stok} {item.satuan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-900">
                        {item.batasMinimumStok} {item.satuan}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 border-t border-slate-200">
            <Link href="/inventory/items">
              <Button variant="outline" className="w-full bg-red-50 text-red-700 hover:bg-red-100 border-red-200">
                View All Critical Items
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
