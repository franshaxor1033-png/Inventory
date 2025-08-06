import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, BarChart3, Users, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            SCI-Ventory Pro
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Manajemen inventaris gudang komprehensif untuk perusahaan jasa kebersihan
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-3"
            onClick={() => window.location.href = "/api/login"}
          >
            Masuk untuk Memulai
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Package className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>Manajemen Inventaris</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Lacak barang habis pakai, peralatan, dan mesin dengan kategorisasi cerdas dan peringatan stok
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <CardTitle>Analitik Lanjutan</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Dashboard real-time dengan tren penggunaan, komposisi inventaris, dan pemantauan stok kritis
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 mx-auto text-purple-600 mb-4" />
              <CardTitle>Pelacakan Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Jejak audit lengkap dari semua pergerakan inventaris dengan informasi peminta dan penugasan area
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 mx-auto text-red-600 mb-4" />
              <CardTitle>Akses Aman</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Kontrol akses berbasis peran dengan autentikasi aman untuk pengguna admin dan staf
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Categories Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Khusus untuk Layanan Kebersihan
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">K</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">KIMIA (Chemicals)</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Lacak bahan kimia pembersih dengan pengurangan stok otomatis dan peringatan batas minimum
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600 dark:text-green-300">P</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">PERALATAN (Equipment)</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Kelola peralatan dan perlengkapan habis pakai dengan pelacakan inventaris yang cerdas
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-300">M</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">MESIN (Machines)</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Lacak aset mesin individual dengan pemantauan status dan pelacakan penugasan
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Siap untuk merampingkan manajemen inventaris Anda?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Mulai kelola inventaris gudang Anda dengan alat tingkat profesional yang dirancang khusus untuk layanan kebersihan
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-3"
            onClick={() => window.location.href = "/api/login"}
          >
            Akses SCI-Ventory Pro
          </Button>
        </div>
      </div>
    </div>
  );
}