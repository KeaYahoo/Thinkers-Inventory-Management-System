import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "tims-bg": "#F7F7F7",
        "tims-surface": "#FFFFFF",
        "tims-border": "#E7E7E7",
        "tims-text": "#2E2E2E",
        "tims-muted": "#6F6F6F",
        "tims-accent": "#4F6F68",
        "tims-accent-strong": "#3E5852",
        "tims-secondary": "#7C8261",
        "tims-critical": "#B67C55",
        "tims-warning": "#C9A755",
        "tims-success": "#9FB59E",
        "tims-info": "#8FA6B2",
      },
    },
  },
  plugins: [],
};

export default config;
