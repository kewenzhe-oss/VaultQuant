import { defineConfig } from "drizzle-kit";

export default defineConfig({
    out: "./drizzle",
    schema: "./src/drizzle/schema.ts",
    dialect: "sqlite",
    dbCredentials: {
        url: "file:local.db",
    },
});
