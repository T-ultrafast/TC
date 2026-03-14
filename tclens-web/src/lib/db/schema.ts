import { mysqlTable, varchar, text, timestamp, boolean, int, decimal, index, unique } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const user = mysqlTable("user", {
    id: varchar("id", { length: 255 }).primaryKey(),
    name: text("name").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: boolean("email_verified").notNull(),
    image: text("image"),
    password: text("password"), // Added for email/password auth
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
    role: varchar("role", { length: 50 }).default("user").notNull(),
    plan: varchar("plan", { length: 50 }).default("free").notNull(),
}, (table) => ({
    emailIdx: unique("email_idx").on(table.email),
}));

export const session = mysqlTable("session", {
    id: varchar("id", { length: 255 }).primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: varchar("user_id", { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
}, (table) => ({
    tokenIdx: unique("token_idx").on(table.token),
}));

export const account = mysqlTable("account", {
    id: varchar("id", { length: 255 }).primaryKey(),
    accountId: varchar("account_id", { length: 255 }).notNull(),
    providerId: varchar("provider_id", { length: 255 }).notNull(),
    userId: varchar("user_id", { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const verification = mysqlTable("verification", {
    id: varchar("id", { length: 255 }).primaryKey(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    value: varchar("value", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// --- Professional & Content Tables ---

export const lawyer = mysqlTable("lawyer", {
    id: varchar("id", { length: 255 }).primaryKey().references(() => user.id, { onDelete: 'cascade' }),
    title: text("title"),
    licenseNumber: varchar("license_number", { length: 255 }).notNull(),
    barAssociation: varchar("bar_association", { length: 255 }).notNull(),
    specialties: text("specialties").notNull(),
    city: varchar("city", { length: 255 }),
    state: varchar("state", { length: 255 }),
    country: varchar("country", { length: 255 }).default("USA"),
    hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
    bio: text("bio"),
    rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
    reviewsCount: int("reviews_count").default(0),
    verificationStatus: varchar("verification_status", { length: 50 }).default("pending"),
    verifiedAt: timestamp("verified_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
    statusIdx: index("lawyer_status_idx").on(table.verificationStatus),
}));

export const document = mysqlTable("document", {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
    title: text("title").notNull(),
    fileUrl: text("file_url").notNull(),
    fileType: varchar("file_type", { length: 50 }).notNull(),
    contentText: text("content_text"),
    riskScore: int("risk_score"),
    summary: text("summary"),
    status: varchar("status", { length: 50 }).default("processing"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
    statusIdx: index("doc_status_idx").on(table.status),
    userIdIdx: index("doc_user_idx").on(table.userId),
}));

export const clause = mysqlTable("clause", {
    id: varchar("id", { length: 255 }).primaryKey(),
    documentId: varchar("document_id", { length: 255 }).notNull().references(() => document.id, { onDelete: 'cascade' }),
    clauseType: varchar("clause_type", { length: 100 }).notNull(),
    textContent: text("text_content").notNull(),
    riskLevel: varchar("risk_level", { length: 50 }),
    explanation: text("explanation"),
    pageNumber: int("page_number"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
    docIdx: index("clause_doc_idx").on(table.documentId),
    riskIdx: index("clause_risk_idx").on(table.riskLevel),
}));

export const consultation = mysqlTable("consultation", {
    id: varchar("id", { length: 255 }).primaryKey(),
    clientId: varchar("client_id", { length: 255 }).notNull().references(() => user.id),
    lawyerId: varchar("lawyer_id", { length: 255 }).notNull().references(() => lawyer.id),
    documentId: varchar("document_id", { length: 255 }).references(() => document.id),
    status: varchar("status", { length: 50 }).default("requested"),
    scheduledAt: timestamp("scheduled_at"),
    fee: decimal("fee", { precision: 10, scale: 2 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
    statusIdx: index("cons_status_idx").on(table.status),
}));

export const message = mysqlTable("message", {
    id: varchar("id", { length: 255 }).primaryKey(),
    consultationId: varchar("consultation_id", { length: 255 }).notNull().references(() => consultation.id, { onDelete: 'cascade' }),
    senderId: varchar("sender_id", { length: 255 }).notNull().references(() => user.id),
    content: text("content").notNull(),
    read: boolean("read").default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
    consIdx: index("msg_cons_idx").on(table.consultationId),
}));
