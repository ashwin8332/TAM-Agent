/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgMain: "#0f172a",
        bgCard: "#1e293b",
        bgCardHover: "#334155",
        textMain: "#f8fafc",
        textMuted: "#94a3b8",
        border: "#334155",
        accentBlue: "#3b82f6",
        accentCyan: "#06b6d4",
        accentGreen: "#10b981",
        accentRed: "#ef4444",
        accentYellow: "#f59e0b",
      }
    },
  },
  plugins: [],
}
