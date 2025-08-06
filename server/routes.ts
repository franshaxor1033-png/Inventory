import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { insertUserSchema, insertItemSchema, insertAssetSchema, insertTransactionLogSchema } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      }
    });
  });

  // Items routes
  app.get("/api/items", authenticateToken, async (req, res) => {
    try {
      const items = await storage.getItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/items/:id", authenticateToken, async (req, res) => {
    try {
      const item = await storage.getItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/items", authenticateToken, async (req, res) => {
    try {
      const itemData = insertItemSchema.parse(req.body);
      const item = await storage.createItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/items/:id", authenticateToken, async (req, res) => {
    try {
      const itemData = insertItemSchema.partial().parse(req.body);
      const item = await storage.updateItem(req.params.id, itemData);
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/items/:id", authenticateToken, async (req, res) => {
    try {
      await storage.deleteItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/items/critical/stock", authenticateToken, async (req, res) => {
    try {
      const items = await storage.getCriticalStockItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Assets routes
  app.get("/api/assets", authenticateToken, async (req, res) => {
    try {
      const assets = await storage.getAssets();
      res.json(assets);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/assets/:id", authenticateToken, async (req, res) => {
    try {
      const asset = await storage.getAsset(req.params.id);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      res.json(asset);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/assets", authenticateToken, async (req, res) => {
    try {
      const assetData = insertAssetSchema.parse(req.body);
      const asset = await storage.createAsset(assetData);
      res.status(201).json(asset);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/assets/:id", authenticateToken, async (req, res) => {
    try {
      const assetData = insertAssetSchema.partial().parse(req.body);
      const asset = await storage.updateAsset(req.params.id, assetData);
      res.json(asset);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/assets/:id", authenticateToken, async (req, res) => {
    try {
      await storage.deleteAsset(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/assets/available/:itemId", authenticateToken, async (req, res) => {
    try {
      const assets = await storage.getAvailableAssetsByItem(req.params.itemId);
      res.json(assets);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Transactions routes
  app.get("/api/transactions", authenticateToken, async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/transactions/recent/:limit", authenticateToken, async (req, res) => {
    try {
      const limit = parseInt(req.params.limit) || 5;
      const transactions = await storage.getRecentTransactions(limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/transactions", authenticateToken, async (req: any, res) => {
    try {
      const transactionData = insertTransactionLogSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      // Get item to check category
      const item = await storage.getItem(transactionData.barangId);
      if (!item) {
        return res.status(400).json({ message: "Item not found" });
      }

      // Handle stock updates for consumables
      if (transactionData.tipe === "KELUAR" && (item.kategori === "KIMIA" || item.kategori === "PERALATAN")) {
        if (!transactionData.jumlah || transactionData.jumlah <= 0) {
          return res.status(400).json({ message: "Quantity required for consumable items" });
        }
        
        if (item.stok < transactionData.jumlah) {
          return res.status(400).json({ message: "Insufficient stock" });
        }

        await storage.updateItem(item.id, {
          stok: item.stok - transactionData.jumlah
        });
      }

      // Handle asset status updates for machines
      if (item.kategori === "MESIN" && transactionData.asetId) {
        const asset = await storage.getAsset(transactionData.asetId);
        if (!asset) {
          return res.status(400).json({ message: "Asset not found" });
        }

        if (transactionData.tipe === "KELUAR" && asset.status !== "TERSEDIA") {
          return res.status(400).json({ message: "Asset not available" });
        }

        const newStatus = transactionData.tipe === "KELUAR" ? "DIPINJAM" : "TERSEDIA";
        await storage.updateAsset(asset.id, { status: newStatus });
      }

      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/dashboard/usage-trend/:days", authenticateToken, async (req, res) => {
    try {
      const days = parseInt(req.params.days) || 30;
      const data = await storage.getUsageTrendData(days);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/dashboard/inventory-composition", authenticateToken, async (req, res) => {
    try {
      const data = await storage.getInventoryComposition();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
