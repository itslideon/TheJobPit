import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-jakarta)", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        pit: "0 0 60px -12px rgba(225, 29, 72, 0.18), 0 25px 50px -12px rgba(0, 0, 0, 0.45)"
      }
    }
  },
  plugins: []
};

export default config;
