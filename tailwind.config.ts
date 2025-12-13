import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{css}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: { DEFAULT: "#F8FAFC" },
        surface: { DEFAULT: "#FFFFFF" },
        "border-subtle": { DEFAULT: "#E2E8F0" },
        primary: {
          DEFAULT: "#1A1A1A",
          muted: "#64748B",
        },
        brand: {
          DEFAULT: "#D10000",
          hover: "#B00000",
          primary: "#D10000",
          dark: "#1A1A1A",
          light: "#F5F5F5",
        },
        status: {
          success: { DEFAULT: "#10B981" },
          warning: { DEFAULT: "#F59E0B" },
          critical: { DEFAULT: "#D10000" },
        },
      },
      boxShadow: {
        surface: "0 8px 24px rgba(15, 23, 42, 0.08)",
        float: "0 16px 40px rgba(2, 132, 199, 0.16)",
      },
      borderRadius: {
        nexus: "1.5rem",
        xl: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
