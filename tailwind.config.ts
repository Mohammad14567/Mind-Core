import type { Config } from "tailwindcss";

/**
 * Mind Core — design tokens.
 *
 * Light is the design language. The palette is a deep, slightly blue black
 * with a narrow band of luminous blue-whites. Violet is reserved for
 * "intelligence" moments only.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#05060A", // page canvas
        carbon: "#0B0D14", // raised surfaces
        graphite: "#13161F", // hover surfaces
        hairline: "rgba(168, 190, 255, 0.10)",
        mist: "#9AA3B5", // secondary text
        frost: "#E8ECF6", // primary text
        beam: "#9CC2FF", // primary light, blue-white
        core: "#5E8BFF", // saturated core blue
        pulse: "#8E7BFF", // reserved violet — intelligence only
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.045em",
        label: "0.22em",
      },
      maxWidth: {
        line: "44ch",
      },
      transitionTimingFunction: {
        glide: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
