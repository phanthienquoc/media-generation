import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background))",
        foreground: "rgb(var(--foreground))",
        muted: "rgb(var(--muted))",
        "muted-foreground": "rgb(var(--muted-foreground))",
        border: "rgb(var(--border))",
        primary: "rgb(var(--primary))",
        "primary-foreground": "rgb(var(--primary-foreground))",
        destructive: "rgb(var(--destructive))",
        card: "rgb(var(--card))",
        "card-foreground": "rgb(var(--card-foreground))"
      }
    }
  },
  plugins: []
};

export default config;
