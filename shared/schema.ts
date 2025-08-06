import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, pgEnum, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const roleEnum = pgEnum("role", ["ADMIN", "USER"]);
export const kategoriEnum = pgEnum("kategori", ["KIMIA", "PERALATAN", "MESIN"]);
export const statusAssetEnum = pgEnum("status_asset", ["TERSEDIA", "DIPINJAM", "PERBAIKAN"]);
export const tipeTransaksiEnum = pgEnum("tipe_transaksi", ["KELUAR", "MASUK"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default("ADMIN"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const items = pgTable("items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  kodeBarang: varchar("kode_barang", { length: 100 }).notNull().unique(),
  namaBarang: varchar("nama_barang", { length: 255 }).notNull(),
  kategori: kategoriEnum("kategori").notNull(),
  stok: integer("stok").notNull().default(0),
  satuan: varchar("satuan", { length: 50 }).notNull(),
  batasMinimumStok: integer("batas_minimum_stok").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const assets = pgTable("assets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  nomorSeri: varchar("nomor_seri", { length: 100 }).notNull().unique(),
  status: statusAssetEnum("status").notNull().default("TERSEDIA"),
  barangId: uuid("barang_id").notNull().references(() => items.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const transactionLogs = pgTable("transaction_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tanggalPermintaan: timestamp("tanggal_permintaan").notNull().defaultNow(),
  namaPeminta: varchar("nama_peminta", { length: 255 }).notNull(),
  areaKebutuhan: varchar("area_kebutuhan", { length: 255 }).notNull(),
  jumlah: integer("jumlah"),
  tipe: tipeTransaksiEnum("tipe").notNull(),
  barangId: uuid("barang_id").notNull().references(() => items.id),
  asetId: uuid("aset_id").references(() => assets.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  transactionLogs: many(transactionLogs),
}));

export const itemsRelations = relations(items, ({ many }) => ({
  assets: many(assets),
  transactionLogs: many(transactionLogs),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  item: one(items, { fields: [assets.barangId], references: [items.id] }),
  transactionLogs: many(transactionLogs),
}));

export const transactionLogsRelations = relations(transactionLogs, ({ one }) => ({
  user: one(users, { fields: [transactionLogs.userId], references: [users.id] }),
  item: one(items, { fields: [transactionLogs.barangId], references: [items.id] }),
  asset: one(assets, { fields: [transactionLogs.asetId], references: [assets.id] }),
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionLogSchema = createInsertSchema(transactionLogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type TransactionLog = typeof transactionLogs.$inferSelect;
export type InsertTransactionLog = z.infer<typeof insertTransactionLogSchema>;
