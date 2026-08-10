import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    env: {
        NEXT_PUBLIC_AI_MODEL: process.env.AI_MODEL || process.env.NEXT_PUBLIC_AI_MODEL || "",
    },
    experimental: {
        optimizePackageImports: [
            "@mui/material",
            "@mui/x-charts",
            "@mui/x-date-pickers",
            "lucide-react",
        ],
    },
};

export default nextConfig;
