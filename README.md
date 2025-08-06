# SCI-Ventory Pro

**Sistem Manajemen Inventaris Gudang Modern untuk Perusahaan Jasa Kebersihan**

![SCI-Ventory Pro](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![Node.js](https://img.shields.io/badge/Node.js-20.x-brightgreen.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)

## 📋 Deskripsi

SCI-Ventory Pro adalah aplikasi web full-stack modern yang dirancang khusus untuk manajemen inventaris gudang perusahaan jasa kebersihan. Aplikasi ini menyediakan sistem komprehensif untuk mengelola stok barang consumable (kimia, peralatan, mesin) dengan kontrol inventaris lengkap, manajemen aset, dan pencatatan transaksi yang detail.

### ✨ Fitur Utama

- **Dashboard Analytics**: Visualisasi data inventaris dengan grafik interaktif
- **Manajemen Item**: CRUD lengkap untuk barang dengan kategori (Kimia, Peralatan, Mesin)
- **Manajemen Aset**: Tracking aset individual dengan status (Tersedia, Dipinjam, Perbaikan)
- **Transaksi Log**: Audit trail lengkap untuk semua pergerakan inventaris
- **Panel Admin**: Kustomisasi website (nama, logo, deskripsi, tema, warna)
- **Autentikasi**: Sistem login tradisional dengan role-based access control
- **Mobile Responsive**: Optimized untuk smartphone dan tablet
- **Dark/Light Mode**: Tema dengan kustomisasi warna RGB
- **Notifikasi**: Alert untuk stok minimum dan transaksi
- **Export/Print**: Laporan dalam format PDF dan Excel

## 🏗️ Teknologi yang Digunakan

### Frontend
- **React 18** dengan **TypeScript** untuk type safety
- **Vite** sebagai build tool dengan hot module replacement
- **Tailwind CSS** + **Shadcn/UI** untuk styling modern
- **Wouter** untuk lightweight client-side routing
- **React Hook Form** + **Zod** untuk form validation
- **TanStack React Query** untuk server state management
- **Recharts** untuk data visualization

### Backend
- **Node.js** dengan **Express.js** framework
- **TypeScript** untuk type safety di server-side
- **Drizzle ORM** untuk database operations
- **bcrypt** untuk password hashing
- **JSON Web Tokens (JWT)** untuk authentication
- **Express Session** untuk session management

### Database
- **PostgreSQL** sebagai primary database
- **Neon Database** sebagai serverless PostgreSQL provider
- **Drizzle Kit** untuk database migrations

### Development Tools
- **ESBuild** untuk fast compilation
- **Replit** development environment
- **GitHub** untuk version control

## 🚀 Instalasi dan Deployment

### Prasyarat Sistem

- Node.js 18.x atau lebih tinggi
- PostgreSQL 14.x atau lebih tinggi
- npm atau yarn package manager
- Git untuk version control

### 1. Instalasi Lokal (Development)

```bash
# Clone repository
git clone https://github.com/your-username/sci-ventory-pro.git
cd sci-ventory-pro

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Edit .env file dengan konfigurasi database
nano .env

# Setup database
npm run db:push

# Start development server
npm run dev
```

#### Konfigurasi Environment Variables (.env)

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/sci_ventory"
PGHOST=localhost
PGPORT=5432
PGUSER=your_username
PGPASSWORD=your_password
PGDATABASE=sci_ventory

# Session Secret (generate random string)
SESSION_SECRET="your-super-secret-session-key-here"

# Application Configuration
NODE_ENV=production
PORT=5000
```

### 2. Deployment di Shared Hosting (cPanel)

#### Langkah-langkah:

1. **Persiapan File**
   ```bash
   # Build untuk production
   npm run build
   
   # Compress semua file
   tar -czf sci-ventory-pro.tar.gz .
   ```

2. **Upload ke cPanel**
   - Login ke cPanel hosting Anda
   - Buka File Manager
   - Upload file `sci-ventory-pro.tar.gz` ke directory `public_html`
   - Extract file di cPanel File Manager

3. **Setup Database**
   - Buka MySQL Databases di cPanel
   - Buat database baru: `sci_ventory`
   - Buat user dan berikan privileges
   - Update connection string di `.env`

4. **Konfigurasi Node.js (jika didukung)**
   ```bash
   # Di terminal cPanel
   cd public_html
   npm install --production
   npm run db:push
   ```

5. **Setup .htaccess**
   ```apache
   # .htaccess di public_html
   RewriteEngine On
   RewriteRule ^(.*)$ http://localhost:5000/$1 [P,L]
   ```

### 3. Deployment di VPS (Ubuntu/CentOS)

#### Langkah-langkah:

1. **Setup Server**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18.x
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PostgreSQL
   sudo apt install postgresql postgresql-contrib -y
   
   # Install PM2 untuk process management
   sudo npm install -g pm2
   ```

2. **Setup Database**
   ```bash
   # Switch ke postgres user
   sudo -u postgres psql
   
   # Buat database dan user
   CREATE DATABASE sci_ventory;
   CREATE USER sci_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE sci_ventory TO sci_user;
   \q
   ```

3. **Deploy Aplikasi**
   ```bash
   # Clone repository
   git clone https://github.com/your-username/sci-ventory-pro.git
   cd sci-ventory-pro
   
   # Install dependencies
   npm install --production
   
   # Setup environment
   cp .env.example .env
   nano .env  # Edit dengan konfigurasi VPS
   
   # Build aplikasi
   npm run build
   
   # Setup database
   npm run db:push
   
   # Start dengan PM2
   pm2 start server/index.js --name "sci-ventory"
   pm2 startup
   pm2 save
   ```

4. **Setup Nginx Reverse Proxy**
   ```nginx
   # /etc/nginx/sites-available/sci-ventory
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Enable SSL dengan Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d your-domain.com
   ```

### 4. Deployment di Heroku

1. **Persiapan**
   ```bash
   # Install Heroku CLI
   npm install -g heroku
   
   # Login ke Heroku
   heroku login
   ```

2. **Setup Aplikasi**
   ```bash
   # Create Heroku app
   heroku create sci-ventory-pro
   
   # Add PostgreSQL addon
   heroku addons:create heroku-postgresql:essential-0
   
   # Set environment variables
   heroku config:set SESSION_SECRET="your-secret-key"
   heroku config:set NODE_ENV=production
   ```

3. **Deploy**
   ```bash
   # Deploy ke Heroku
   git push heroku main
   
   # Run migrations
   heroku run npm run db:push
   ```

### 5. Deployment di DigitalOcean App Platform

1. **Setup melalui Dashboard**
   - Connect GitHub repository
   - Pilih branch `main`
   - Set build command: `npm run build`
   - Set run command: `npm start`

2. **Environment Variables**
   ```
   DATABASE_URL=your_postgresql_connection_string
   SESSION_SECRET=your_secret_key
   NODE_ENV=production
   ```

3. **Database Setup**
   - Gunakan DigitalOcean Managed PostgreSQL
   - Update DATABASE_URL di environment variables

### 6. Deployment di Vercel

1. **Persiapan**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Environment Variables di Vercel Dashboard**
   - DATABASE_URL
   - SESSION_SECRET
   - NODE_ENV=production

## 🔧 Konfigurasi

### Default Admin Access
```
Email: admin@admin.com
Password: admin
```

### Struktur Database
```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  role VARCHAR(50) DEFAULT 'USER',
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Items table  
CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  kodeBarang VARCHAR(255) UNIQUE NOT NULL,
  namaBarang VARCHAR(255) NOT NULL,
  kategori VARCHAR(50) NOT NULL,
  stok INTEGER DEFAULT 0,
  satuan VARCHAR(50),
  batasMinimumStok INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Assets table
CREATE TABLE assets (
  id SERIAL PRIMARY KEY,
  itemId INTEGER REFERENCES items(id),
  serialNumber VARCHAR(255),
  status VARCHAR(50) DEFAULT 'TERSEDIA',
  kondisi TEXT,
  lokasiPenyimpanan VARCHAR(255),
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Transaction logs table
CREATE TABLE transaction_logs (
  id SERIAL PRIMARY KEY,
  itemId INTEGER REFERENCES items(id),
  jenisTransaksi VARCHAR(50) NOT NULL,
  jumlah INTEGER NOT NULL,
  pemohon VARCHAR(255),
  area VARCHAR(255),
  keterangan TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Site settings table
CREATE TABLE site_settings (
  id SERIAL PRIMARY KEY,
  siteName VARCHAR(255) DEFAULT 'SCI-Ventory Pro',
  logoUrl VARCHAR(500),
  description TEXT,
  theme VARCHAR(20) DEFAULT 'LIGHT',
  primaryColor VARCHAR(7) DEFAULT '#3b82f6',
  secondaryColor VARCHAR(7) DEFAULT '#64748b',
  accentColor VARCHAR(7) DEFAULT '#10b981',
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

## 📱 Fitur Mobile

Aplikasi ini dirancang responsive dengan fitur:
- **Mobile Navigation**: Hamburger menu untuk smartphone
- **Touch-friendly Interface**: Button dan form optimal untuk touch
- **Responsive Tables**: Horizontal scroll pada tabel data
- **Mobile-first Design**: Layout yang mengutamakan pengalaman mobile

## 🎨 Kustomisasi

### Tema dan Warna
- Light/Dark mode switching
- Kustomisasi warna primer, sekunder, dan aksen
- RGB color picker untuk personalisasi
- Logo dan branding customization

### Panel Admin
Akses `/admin` untuk:
- Mengubah nama website
- Upload logo custom
- Edit deskripsi website  
- Kustomisasi tema dan warna
- Manajemen pengguna
- Pengaturan sistem

## 📊 Monitoring dan Maintenance

### Log Files
```bash
# Application logs
tail -f logs/app.log

# Error logs  
tail -f logs/error.log

# Database logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Backup Database
```bash
# Manual backup
pg_dump sci_ventory > backup_$(date +%Y%m%d).sql

# Automated daily backup (crontab)
0 2 * * * pg_dump sci_ventory > /backups/sci_ventory_$(date +\%Y\%m\%d).sql
```

### Update Aplikasi
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Run migrations
npm run db:push

# Restart application
pm2 restart sci-ventory
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Restart PostgreSQL
   sudo systemctl restart postgresql
   ```

2. **Port Already in Use**
   ```bash
   # Find process using port 5000
   sudo lsof -i :5000
   
   # Kill process
   sudo kill -9 <PID>
   ```

3. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER /path/to/sci-ventory-pro
   chmod -R 755 /path/to/sci-ventory-pro
   ```

4. **Node.js Memory Issues**
   ```bash
   # Increase memory limit
   export NODE_OPTIONS="--max-old-space-size=4096"
   ```

## 📞 Support

Untuk bantuan teknis dan support:

- **Email**: support@sci-ventory.com
- **Documentation**: [docs.sci-ventory.com](https://docs.sci-ventory.com)
- **GitHub Issues**: [github.com/sci-ventory/issues](https://github.com/sci-ventory/issues)

## 📄 License

MIT License - lihat file [LICENSE](LICENSE) untuk detail lengkap.

## 🤝 Contributing

Kontribusi sangat diterima! Silakan baca [CONTRIBUTING.md](CONTRIBUTING.md) untuk guidelines.

---

**SCI-Ventory Pro** - Memudahkan manajemen inventaris dengan teknologi modern.