import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "./db";
import { user, session, account, verification } from "./db/schema";

console.log("[BetterAuth Debug] Tables loaded:", {
    user: !!user,
    session: !!session,
    account: !!account,
    verification: !!verification
});

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
        provider: "mysql",
        schema: {
            user,
            session,
            account,
            verification,
            // @ts-ignore
            verificationValue: verification
        }
    }),
    trustedOrigins: ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"],
    logger: {
        enabled: true,
        level: "debug",
    },

    account: {
        accountLinking: {
            enabled: true
        }
    },

    emailAndPassword: {
        enabled: true
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        },
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "user"
            },
            plan: {
                type: "string",
                defaultValue: "free"
            },
            firstName: {
                type: "string"
            },
            lastName: {
                type: "string"
            }
        }
    }
});
