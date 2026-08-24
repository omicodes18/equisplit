/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#091E15",
        surface: "#03170e",
        "surface-container": "#0f231a",
        "surface-container-low": "#0a1f16",
        "surface-container-lowest": "#001209",
        "surface-container-high": "#192e24",
        "surface-container-highest": "#24392f",
        "surface-bright": "#293e33",
        "surface-variant": "#24392f",
        "on-surface": "#d0e8d9",
        "on-surface-variant": "#dac0c9",
        "on-background": "#d0e8d9",
        primary: "#F472B6", // Pastel Pink
        "primary-container": "#f472b6",
        "primary-fixed-dim": "#ffafd3",
        "on-primary": "#620040",
        secondary: "#C084FC", // Lavender
        "secondary-container": "#62259b",
        "secondary-fixed": "#f0dbff",
        "secondary-fixed-dim": "#ddb8ff",
        "on-secondary": "#490081",
        "on-secondary-container": "#d1a1ff",
        tertiary: "#FBBF24", // Soft Gold
        "tertiary-container": "#ca9700",
        "tertiary-fixed": "#ffdf9f",
        "tertiary-fixed-dim": "#f9bd22",
        "on-tertiary": "#402d00",
        outline: "#a28a93",
        "outline-variant": "#544249",
        error: "#ffb4ab",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        "display-currency": ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        "headline-md": ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        "label-caps": ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "sans-serif"],
      },
      spacing: {
        "container-padding": "20px",
        "stack-sm": "4px",
        "stack-md": "12px",
        "stack-lg": "24px",
      },
    },
  },
  plugins: [],
};
