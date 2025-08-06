import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { format } from "date-fns";

export default function RecentActivityTable() {
  const { data: recentTransactions, isLoading } = useQuery({
    queryKey: ["/api/transactions/recent/5"],
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="text-slate-500">Loading recent activity...</div>
        </div>
      </div>
    );
  }

  const transactions = recentTransactions || [];

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
          <Link href="/reports/transactions">
            <button className="text-sm text-slate-500 hover:text-slate-700">View All</button>
          </Link>
        </div>
      </div>
      
      {transactions.length === 0 ? (
        <div className="p-6 text-center text-slate-500">
          No recent transactions
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Requested By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transactions.map((transaction: any) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {transaction.item?.namaBarang}
                      </div>
                      <div className="text-sm text-slate-500">
                        {transaction.areaKebutuhan}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {transaction.namaPeminta}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={transaction.tipe === "KELUAR" ? "destructive" : "default"}
                        className={
                          transaction.tipe === "KELUAR" 
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" 
                            : "bg-green-100 text-green-800 hover:bg-green-200"
                        }
                      >
                        {transaction.tipe}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {format(new Date(transaction.tanggalPermintaan), "MMM dd, yyyy")}
                      </div>
                      <div className="text-sm text-slate-500">
                        {format(new Date(transaction.tanggalPermintaan), "h:mm a")}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 border-t border-slate-200">
            <Link href="/reports/transactions">
              <Button variant="outline" className="w-full bg-slate-50 text-slate-700 hover:bg-slate-100">
                View All Transactions
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
