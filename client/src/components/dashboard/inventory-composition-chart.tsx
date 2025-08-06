import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = {
  'KIMIA': 'hsl(207, 90%, 54%)',
  'PERALATAN': 'hsl(45, 93%, 47%)', 
  'MESIN': 'hsl(142, 71%, 45%)'
};

export default function InventoryCompositionChart() {
  const { data: compositionData, isLoading } = useQuery({
    queryKey: ["/api/dashboard/inventory-composition"],
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Inventory Composition</h3>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="text-slate-500">Loading chart data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Inventory Composition</h3>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={compositionData || []}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="count"
            >
              {compositionData?.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.category as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                color: '#f8fafc'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              wrapperStyle={{
                fontSize: '12px',
                paddingTop: '20px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
