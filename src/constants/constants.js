export const COLORS = {
  primary: "#ff6b8b",
  secondary: "#6a5acd",
  accent: "#00c9b1",
  dark: "#12131a",
  darker: "#0b0c10",
  light: "#f8f9fc",
  text: "#c5c6c7",
  glass: "rgba(22, 23, 30, 0.7)",
};

// Theme color schemes
export const THEMES = {
  dark: {
    primary: "#ff6b8b",
    secondary: "#6a5acd",
    accent: "#00c9b1",
    background: "#12131a",
    surface: "#1a1b23",
    card: "#1e1f2a",
    text: "#ffffff",
    textSecondary: "#c5c6c7",
    border: "#2a2b35",
    glass: "rgba(22, 23, 30, 0.7)",
    shadow: "#000000",
  },
  light: {
    primary: "#ff6b8b",
    secondary: "#6a5acd",
    accent: "#00c9b1",
    background: "#f0f2f5",
    surface: "#ffffff",
    card: "#ffffff",
    text: "#1a1b23",
    textSecondary: "#525252",
    border: "#d1d5db",
    glass: "rgba(240, 242, 245, 0.7)",
    shadow: "#000000",
  },
};

export const FONTS = {
  body: "Poppins",
  heading: "Quicksand",
};

export const SHADOWS = {
  softPrimary: {
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  btnPrimary: {
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  btnPrimaryHover: {
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  btnSecondaryHover: {
    shadowColor: COLORS.accent,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  glassCard: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
  },
};

export const RADII = {
  circle: 200,
  pill: 50,
  rounded: 20,
  largeRounded: 30,
  small: 8,
};

export const Z_INDEX = {
  header: 1000,
  modal: 1100,
  tooltip: 1200,
};