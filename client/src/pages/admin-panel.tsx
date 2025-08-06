import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Settings, Palette, Shield, Database, Save, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SiteSettings, InsertSiteSettings } from "@shared/schema";

export default function AdminPanel() {
  const { user, changePasswordMutation } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch site settings
  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/admin/settings"],
  });

  // Update site settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: InsertSiteSettings) => {
      const res = await apiRequest("PUT", "/api/admin/settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({
        title: "Pengaturan berhasil diperbarui",
        description: "Semua perubahan telah disimpan",
      });
    },
    onError: () => {
      toast({
        title: "Gagal memperbarui pengaturan",
        description: "Terjadi kesalahan saat menyimpan perubahan",
        variant: "destructive",
      });
    },
  });

  const [formData, setFormData] = useState<InsertSiteSettings>({
    siteName: settings?.siteName || "SCI-Ventory Pro",
    logoUrl: settings?.logoUrl || "",
    description: settings?.description || "Manajemen inventaris gudang komprehensif untuk perusahaan jasa kebersihan",
    theme: settings?.theme || "LIGHT",
    primaryColor: settings?.primaryColor || "#3b82f6",
    secondaryColor: settings?.secondaryColor || "#64748b",
    accentColor: settings?.accentColor || "#10b981",
  });

  // Initialize form when settings load
  React.useEffect(() => {
    if (settings && (!formData.siteName || formData.siteName === "SCI-Ventory Pro")) {
      setFormData({
        siteName: settings.siteName || "SCI-Ventory Pro",
        logoUrl: settings.logoUrl || "",
        description: settings.description || "Manajemen inventaris gudang komprehensif untuk perusahaan jasa kebersihan",
        theme: settings.theme || "LIGHT",
        primaryColor: settings.primaryColor || "#3b82f6",
        secondaryColor: settings.secondaryColor || "#64748b",
        accentColor: settings.accentColor || "#10b981",
      });
    }
  }, [settings]);

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(formData);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password tidak cocok",
        description: "Konfirmasi password harus sama dengan password baru",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });

    // Clear form on success
    if (changePasswordMutation.isSuccess) {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  // Add predefined assets
  const addPredefinedAssets = async () => {
    const predefinedItems = [
      {
        kodeBarang: "MSN-POL-001",
        namaBarang: "Mesin Polisher",
        kategori: "MESIN",
        stok: 1,
        satuan: "unit",
        batasMinimumStok: 1,
      },
      {
        kodeBarang: "MSN-VAK-001", 
        namaBarang: "Mesin Vakum",
        kategori: "MESIN",
        stok: 1,
        satuan: "unit",
        batasMinimumStok: 1,
      },
      {
        kodeBarang: "MSN-FOG-001",
        namaBarang: "Mesin Fogging",
        kategori: "MESIN",
        stok: 1,
        satuan: "unit",
        batasMinimumStok: 1,
      },
    ];

    try {
      for (const item of predefinedItems) {
        await apiRequest("POST", "/api/items", item);
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      toast({
        title: "Aset berhasil ditambahkan",
        description: "Mesin Polisher, Mesin Vakum, dan Mesin Fogging telah ditambahkan ke inventaris",
      });
    } catch (error) {
      toast({
        title: "Gagal menambahkan aset",
        description: "Beberapa aset mungkin sudah ada dalam sistem",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Panel Admin</h1>
            <p className="text-slate-600 text-sm sm:text-base">Kelola pengaturan sistem dan kustomisasi website</p>
          </div>
          <Badge variant="secondary" className="self-start sm:self-center">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6">
            <TabsTrigger value="general" className="text-xs sm:text-sm">
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Umum</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="text-xs sm:text-sm">
              <Palette className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Tampilan</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs sm:text-sm">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Keamanan</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="text-xs sm:text-sm">
              <Database className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Pengaturan Umum</CardTitle>
                <CardDescription>
                  Konfigurasi dasar website dan informasi perusahaan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Nama Website</Label>
                    <Input
                      id="siteName"
                      value={formData.siteName || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, siteName: e.target.value }))}
                      className="w-full"
                      data-testid="input-site-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">URL Logo</Label>
                    <Input
                      id="logoUrl"
                      value={formData.logoUrl || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                      placeholder="https://example.com/logo.png"
                      className="w-full"
                      data-testid="input-logo-url"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi Website</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full resize-none"
                    data-testid="textarea-description"
                  />
                </div>
                <Button 
                  onClick={handleSaveSettings} 
                  disabled={updateSettingsMutation.isPending}
                  className="w-full sm:w-auto"
                  data-testid="button-save-general"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateSettingsMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Pengaturan Tampilan</CardTitle>
                <CardDescription>
                  Kustomisasi tema dan warna website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Tema</Label>
                  <Select
                    value={formData.theme}
                    onValueChange={(value: "LIGHT" | "DARK") => 
                      setFormData(prev => ({ ...prev, theme: value }))
                    }
                  >
                    <SelectTrigger className="w-full sm:w-48" data-testid="select-theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LIGHT">Terang</SelectItem>
                      <SelectItem value="DARK">Gelap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Warna Primer</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-12 h-10 rounded border"
                        data-testid="input-primary-color"
                      />
                      <Input
                        value={formData.primaryColor || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="flex-1"
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Warna Sekunder</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="w-12 h-10 rounded border"
                        data-testid="input-secondary-color"
                      />
                      <Input
                        value={formData.secondaryColor || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="flex-1"
                        placeholder="#64748b"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Warna Aksen</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={formData.accentColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="w-12 h-10 rounded border"
                        data-testid="input-accent-color"
                      />
                      <Input
                        value={formData.accentColor || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="flex-1"
                        placeholder="#10b981"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleSaveSettings} 
                  disabled={updateSettingsMutation.isPending}
                  className="w-full sm:w-auto"
                  data-testid="button-save-appearance"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateSettingsMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Ubah Password</CardTitle>
                <CardDescription>
                  Perbarui password akun admin Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Password Saat Ini</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="pr-10"
                      data-testid="input-current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Password Baru</Label>
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    data-testid="input-new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    data-testid="input-confirm-password"
                  />
                </div>
                <Button 
                  onClick={handlePasswordChange}
                  disabled={changePasswordMutation.isPending || !passwordData.currentPassword || !passwordData.newPassword}
                  className="w-full sm:w-auto"
                  data-testid="button-change-password"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {changePasswordMutation.isPending ? "Mengubah..." : "Ubah Password"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Management */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Manajemen Data</CardTitle>
                <CardDescription>
                  Kelola data aset dan inventaris sistem
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-blue-50">
                  <h3 className="font-medium text-blue-900 mb-2">Tambah Aset Predefined</h3>
                  <p className="text-sm text-blue-700 mb-4">
                    Tambahkan aset standar: Mesin Polisher, Mesin Vakum, dan Mesin Fogging ke inventaris
                  </p>
                  <Button 
                    onClick={addPredefinedAssets}
                    variant="outline"
                    className="w-full sm:w-auto"
                    data-testid="button-add-predefined-assets"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Tambah Aset Predefined
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">Admin</div>
                    <div className="text-sm text-slate-600">Role Aktif</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{user?.username}</div>
                    <div className="text-sm text-slate-600">Username</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">v1.0</div>
                    <div className="text-sm text-slate-600">Versi Sistem</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}