import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fef3f2",
          500: "#e84c3d",
          600: "#d43d2e",
          700: "#b01a12",
        },
        neutral: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          800: "#262626",
          900: "#171717",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
