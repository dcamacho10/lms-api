import { pgTable, serial, varchar, text, timestamp, numeric, boolean, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  principal: numeric("principal", { precision: 12, scale: 2 }).notNull(),
  monthlyFeeRate: numeric("monthly_fee_rate", { precision: 5, scale: 2 }).default("0.40").notNull(),
  dueDate: timestamp("due_date").notNull(),
  paid: boolean("paid").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fees = pgTable("fees", {
  id: serial("id").primaryKey(),
  loanId: integer("loan_id").references(() => loans.id).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  type: varchar("type", { length: 20 }).$type<"monthly" | "daily">().notNull(),
  isPaid: boolean("is_paid").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const clientsRelations = relations(clients, ({ many }) => ({
  loans: many(loans),
}));

export const loansRelations = relations(loans, ({ one, many }) => ({
  client: one(clients, {
    fields: [loans.clientId],
    references: [clients.id],
  }),
  fees: many(fees),
}));

export const feesRelations = relations(fees, ({ one }) => ({
  loan: one(loans, {
    fields: [fees.loanId],
    references: [loans.id],
  }),
}));
