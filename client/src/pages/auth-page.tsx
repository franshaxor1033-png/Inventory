import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Shield, BarChart3 } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [location, setLocation] = useLocation();
  
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">SCI-Ventory Pro</h1>
            <p className="text-slate-600 mt-2">Sistem manajemen inventaris gudang</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Masuk</TabsTrigger>
              <TabsTrigger value="register">Daftar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Masuk ke Akun</CardTitle>
                  <CardDescription>
                    Masukkan kredensial Anda untuk mengakses sistem
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username/Email</Label>
                      <Input
                        id="username"
                        type="text"
                        value={loginData.username}
                        onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                        required
                        data-testid="input-username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                        required
                        data-testid="input-password"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={loginMutation.isPending}
                      data-testid="button-login"
                    >
                      {loginMutation.isPending ? "Memproses..." : "Masuk"}
                    </Button>
                  </form>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Admin Default:</strong><br />
                      Username: admin@admin.com<br />
                      Password: admin
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Buat Akun Baru</CardTitle>
                  <CardDescription>
                    Daftarkan akun baru untuk mengakses sistem
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nama Depan</Label>
                        <Input
                          id="firstName"
                          type="text"
                          value={registerData.firstName}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, firstName: e.target.value }))}
                          data-testid="input-first-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nama Belakang</Label>
                        <Input
                          id="lastName"
                          type="text"
                          value={registerData.lastName}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, lastName: e.target.value }))}
                          data-testid="input-last-name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="regUsername">Username</Label>
                      <Input
                        id="regUsername"
                        type="text"
                        value={registerData.username}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                        required
                        data-testid="input-reg-username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                        data-testid="input-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="regPassword">Password</Label>
                      <Input
                        id="regPassword"
                        type="password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                        required
                        data-testid="input-reg-password"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={registerMutation.isPending}
                      data-testid="button-register"
                    >
                      {registerMutation.isPending ? "Mendaftar..." : "Daftar"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="flex-1 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-8">
        <div className="text-center text-white max-w-md">
          <div className="mb-8">
            <Settings className="w-20 h-20 mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl font-bold mb-4">
              Kelola Inventaris dengan Mudah
            </h2>
            <p className="text-blue-100 text-lg mb-6">
              Sistem manajemen inventaris gudang modern untuk perusahaan jasa kebersihan
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3 text-blue-100">
              <BarChart3 className="w-5 h-5" />
              <span>Dashboard analytics lengkap</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-blue-100">
              <Settings className="w-5 h-5" />
              <span>Manajemen aset dan stok real-time</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-blue-100">
              <Shield className="w-5 h-5" />
              <span>Keamanan dan audit trail</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}