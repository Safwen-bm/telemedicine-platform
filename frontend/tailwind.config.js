/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      colors: {
        primaryColor: "#8F3D4F",
        yellowColor: "#D99A3D",
        purpleColor: "#9B6875",
        irisBlueColor: "#6B7C8F",

        headingColor: "#292527",
        textColor: "#625A5C",

        paper: "#F8F5F2",
        ink: "#292527",
        coral: "#E56B5D",
        mint: "#F0E3E0",
        line: "#DED5D1",
      },

      boxShadow: {
        panelShadow: "0 30px 60px -20px rgba(41, 37, 39, 0.18)",
      },

      fontFamily: {
        heading: ["Fraunces", "Georgia", "serif"],
        sans: ['"Instrument Sans"', "system-ui", "sans-serif"],
      },

      keyframes: {
        draw: {
          to: { strokeDashoffset: "0" },
        },

        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.25" },
        },

        rise: {
          from: {
            opacity: "0",
            transform: "translateY(14px)",
          },
          to: {
            opacity: "1",
            transform: "none",
          },
        },
      },

      animation: {
        draw: "draw 2.2s ease-out 0.4s forwards",
        blink: "blink 1.6s ease-in-out infinite",
        rise: "rise 0.7s ease-out both",
      },
    },
  },

  plugins: [],
};