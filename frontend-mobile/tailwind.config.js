/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A6640', // Kente Green
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#F2A115', // Gold/Yellow
          foreground: '#000000',
        },
        destructive: {
          DEFAULT: '#E65100', // Ankara Red/Orange
          foreground: '#FFFFFF',
        },
        background: '#F8F9FA',
        card: '#FFFFFF',
      },
    },
  },
  plugins: [],
}
