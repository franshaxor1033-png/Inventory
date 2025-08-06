import { 
  users, items, assets, transactionLogs,
  type User, type InsertUser, type UpsertUser,
  type Item, type InsertItem,
  type Asset, type InsertAsset,
  type TransactionLog, type InsertTransactionLog
} from "@shared/schema";
import { db } from "./db";
import { eq, lte, desc, and, or, like, gte } from "drizzle-orm";
import { sql } from "drizzle-orm";

export interface IStorage {
  // User methods (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Item methods
  getItems(): Promise<Item[]>;
  getItem(id: string): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: string, item: Partial<InsertItem>): Promise<Item>;
  deleteItem(id: string): Promise<void>;
  getCriticalStockItems(): Promise<Item[]>;
  getItemsByCategory(category: string): Promise<Item[]>;

  // Asset methods
  getAssets(): Promise<(Asset & { item: Item })[]>;
  getAsset(id: string): Promise<Asset | undefined>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: string, asset: Partial<InsertAsset>): Promise<Asset>;
  deleteAsset(id: string): Promise<void>;
  getAvailableAssetsByItem(itemId: string): Promise<Asset[]>;

  // Transaction methods
  getTransactions(): Promise<(TransactionLog & { item: Item; user: User; asset?: Asset })[]>;
  getTransaction(id: string): Promise<TransactionLog | undefined>;
  createTransaction(transaction: InsertTransactionLog): Promise<TransactionLog>;
  getRecentTransactions(limit: number): Promise<(TransactionLog & { item: Item; user: User; asset?: Asset })[]>;
  getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<(TransactionLog & { item: Item; user: User; asset?: Asset })[]>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalItems: number;
    assetsOnLoan: number;
    criticalStock: number;
    monthlyTransactions: number;
  }>;
  
  getUsageTrendData(days: number): Promise<Array<{ date: string; count: number }>>;
  getInventoryComposition(): Promise<Array<{ category: string; count: number }>>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Item methods
  async getItems(): Promise<Item[]> {
    return await db.select().from(items).orderBy(desc(items.createdAt));
  }

  async getItem(id: string): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item || undefined;
  }

  async createItem(item: InsertItem): Promise<Item> {
    const [newItem] = await db.insert(items).values(item).returning();
    return newItem;
  }

  async updateItem(id: string, item: Partial<InsertItem>): Promise<Item> {
    const [updatedItem] = await db
      .update(items)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(items.id, id))
      .returning();
    return updatedItem;
  }

  async deleteItem(id: string): Promise<void> {
    await db.delete(items).where(eq(items.id, id));
  }

  async getCriticalStockItems(): Promise<Item[]> {
    return await db
      .select()
      .from(items)
      .where(
        and(
          lte(items.stok, sql`${items.batasMinimumStok}`),
          or(eq(items.kategori, "KIMIA"), eq(items.kategori, "PERALATAN"))
        )
      );
  }

  async getItemsByCategory(category: string): Promise<Item[]> {
    return await db.select().from(items).where(eq(items.kategori, category as any));
  }

  // Asset methods
  async getAssets(): Promise<(Asset & { item: Item })[]> {
    return await db
      .select()
      .from(assets)
      .leftJoin(items, eq(assets.barangId, items.id))
      .then(rows => rows.map(row => ({ ...row.assets, item: row.items! })));
  }

  async getAsset(id: string): Promise<Asset | undefined> {
    const [asset] = await db.select().from(assets).where(eq(assets.id, id));
    return asset || undefined;
  }

  async createAsset(asset: InsertAsset): Promise<Asset> {
    const [newAsset] = await db.insert(assets).values(asset).returning();
    return newAsset;
  }

  async updateAsset(id: string, asset: Partial<InsertAsset>): Promise<Asset> {
    const [updatedAsset] = await db
      .update(assets)
      .set({ ...asset, updatedAt: new Date() })
      .where(eq(assets.id, id))
      .returning();
    return updatedAsset;
  }

  async deleteAsset(id: string): Promise<void> {
    await db.delete(assets).where(eq(assets.id, id));
  }

  async getAvailableAssetsByItem(itemId: string): Promise<Asset[]> {
    return await db
      .select()
      .from(assets)
      .where(and(eq(assets.barangId, itemId), eq(assets.status, "TERSEDIA")));
  }

  // Transaction methods
  async getTransactions(): Promise<(TransactionLog & { item: Item; user: User; asset?: Asset })[]> {
    return await db
      .select()
      .from(transactionLogs)
      .leftJoin(items, eq(transactionLogs.barangId, items.id))
      .leftJoin(users, eq(transactionLogs.userId, users.id))
      .leftJoin(assets, eq(transactionLogs.asetId, assets.id))
      .orderBy(desc(transactionLogs.createdAt))
      .then(rows => 
        rows.map(row => ({
          ...row.transaction_logs,
          item: row.items!,
          user: row.users!,
          asset: row.assets || undefined
        }))
      );
  }

  async getTransaction(id: string): Promise<TransactionLog | undefined> {
    const [transaction] = await db
      .select()
      .from(transactionLogs)
      .where(eq(transactionLogs.id, id));
    return transaction || undefined;
  }

  async createTransaction(transaction: InsertTransactionLog): Promise<TransactionLog> {
    const [newTransaction] = await db
      .insert(transactionLogs)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getRecentTransactions(limit: number): Promise<(TransactionLog & { item: Item; user: User; asset?: Asset })[]> {
    return await db
      .select()
      .from(transactionLogs)
      .leftJoin(items, eq(transactionLogs.barangId, items.id))
      .leftJoin(users, eq(transactionLogs.userId, users.id))
      .leftJoin(assets, eq(transactionLogs.asetId, assets.id))
      .orderBy(desc(transactionLogs.createdAt))
      .limit(limit)
      .then(rows => 
        rows.map(row => ({
          ...row.transaction_logs,
          item: row.items!,
          user: row.users!,
          asset: row.assets || undefined
        }))
      );
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<(TransactionLog & { item: Item; user: User; asset?: Asset })[]> {
    return await db
      .select()
      .from(transactionLogs)
      .leftJoin(items, eq(transactionLogs.barangId, items.id))
      .leftJoin(users, eq(transactionLogs.userId, users.id))
      .leftJoin(assets, eq(transactionLogs.asetId, assets.id))
      .where(
        and(
          gte(transactionLogs.tanggalPermintaan, startDate),
          lte(transactionLogs.tanggalPermintaan, endDate)
        )
      )
      .orderBy(desc(transactionLogs.createdAt))
      .then(rows => 
        rows.map(row => ({
          ...row.transaction_logs,
          item: row.items!,
          user: row.users!,
          asset: row.assets || undefined
        }))
      );
  }

  async getDashboardStats(): Promise<{
    totalItems: number;
    assetsOnLoan: number;
    criticalStock: number;
    monthlyTransactions: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalItemsResult,
      assetsOnLoanResult,
      criticalStockResult,
      monthlyTransactionsResult
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(items),
      db.select({ count: sql<number>`count(*)` }).from(assets).where(eq(assets.status, "DIPINJAM")),
      db.select({ count: sql<number>`count(*)` }).from(items).where(
        and(
          lte(items.stok, sql`${items.batasMinimumStok}`),
          or(eq(items.kategori, "KIMIA"), eq(items.kategori, "PERALATAN"))
        )
      ),
      db.select({ count: sql<number>`count(*)` }).from(transactionLogs).where(
        gte(transactionLogs.tanggalPermintaan, startOfMonth)
      )
    ]);

    return {
      totalItems: totalItemsResult[0]?.count || 0,
      assetsOnLoan: assetsOnLoanResult[0]?.count || 0,
      criticalStock: criticalStockResult[0]?.count || 0,
      monthlyTransactions: monthlyTransactionsResult[0]?.count || 0,
    };
  }

  async getUsageTrendData(days: number): Promise<Array<{ date: string; count: number }>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await db
      .select({
        date: sql<string>`DATE(${transactionLogs.tanggalPermintaan})`,
        count: sql<number>`count(*)`
      })
      .from(transactionLogs)
      .where(
        and(
          gte(transactionLogs.tanggalPermintaan, startDate),
          eq(transactionLogs.tipe, "KELUAR")
        )
      )
      .groupBy(sql`DATE(${transactionLogs.tanggalPermintaan})`)
      .orderBy(sql`DATE(${transactionLogs.tanggalPermintaan})`);

    return result;
  }

  async getInventoryComposition(): Promise<Array<{ category: string; count: number }>> {
    const result = await db
      .select({
        category: items.kategori,
        count: sql<number>`count(*)`
      })
      .from(items)
      .groupBy(items.kategori);

    return result.map(row => ({ category: row.category, count: row.count }));
  }
}

export const storage = new DatabaseStorage();
