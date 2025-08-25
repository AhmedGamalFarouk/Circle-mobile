export const COLORS = {
  // Primary colors based on new design system
  primary: "#908bdb", // --color-primary
  primaryLight: "#a09bdf",
  primaryDark: "#807bd7",
  primaryGradient: ["#9f8de0", "#c6c1e7"], // --color-bg-gradient
  
  // Secondary colors based on new design system
  secondary: "#4ea7debf", // --color-secondary
  secondaryLight: "#6bb8e8",
  secondaryDark: "#3c98d4",
  secondaryGradient: ["#4ea7debf", "#6bb8e8"],
  
  // Accent colors
  accent: "#f78fb3",
  accentLight: "#f9a5c2",
  accentDark: "#f579a4",
  accentGradient: ["#f78fb3", "#f9a5c2"],
  
  // Enhanced success, error, warning colors
  success: "#10b981",
  successLight: "#34d399",
  successDark: "#059669",
  
  error: "#ef4444",
  errorLight: "#f87171",
  errorDark: "#dc2626",
  
  warning: "#f59e0b",
  warningLight: "#fbbf24",
  warningDark: "#d97706",
  
  // Enhanced neutral colors based on new design system
  dark: "#1c3161", // --color-text
  darker: "#0b0c10",
  light: "#f6f4ff", // --color-main
  text: "#1c3161", // --color-text
  textLight: "#f0f0f0",
  textDark: "#94a3b8",
  
  // Enhanced glass and overlay colors
  glass: "rgba(108, 95, 199, 0.4)", // --shadow-glass
  glassLight: "rgba(108, 95, 199, 0.2)",
  glassDark: "rgba(108, 95, 199, 0.7)", // --shadow-main
  
  // Interactive colors based on new design system
  interactive: "#908bdb", // --color-primary
  interactiveLight: "#a09bdf",
  interactiveDark: "#807bd7",
  
  // New highlight colors
  highlight: "#fbbf24",
  highlightLight: "#fcd34d",
  highlightDark: "#f59e0b",
  
  // Border colors
  border: "#e2e8f0",
  borderLight: "#f1f5f9",
  borderDark: "#cbd5e1",
  
  // Background variations based on new design system
  background: "#f6f4ff", // --color-main
  backgroundLight: "#ffffff", // --color-bg-primary
  backgroundLighter: "#f1f5f9",
  backgroundDark: "#dbe8fc", // --color-bg-secondary
  
  // Surface colors based on new design system
  surface: "#dddaf2", // --color-main-card
  surfaceLight: "#f8fafc",
  surfaceDark: "#f1f5f9",
  
  // Card colors based on new design system
  card: "#dddaf2", // --color-main-card
  cardLight: "#f8fafc",
  cardDark: "#f1f5f9",
  
  // Shadow colors based on new design system
  shadow: "rgba(108, 95, 199, 0.7)", // --shadow-main
  shadowLight: "rgba(108, 95, 199, 0.4)", // --shadow-glass
  shadowMedium: "rgba(108, 95, 199, 0.5)",
  shadowDark: "rgba(108, 95, 199, 0.8)",
};

// Theme color schemes based on new design system
export const THEMES = {
  dark: {
    primary: "#908bdb", // --color-primary
    primaryLight: "#a09bdf",
    primaryDark: "#807bd7",
    secondary: "#4ea7debf", // --color-secondary
    secondaryLight: "#6bb8e8",
    secondaryDark: "#3c98d4",
    accent: "#f78fb3",
    accentLight: "#f9a5c2",
    accentDark: "#f579a4",
    success: "#10b981",
    successLight: "#34d399",
    successDark: "#059669",
    error: "#ef4444",
    errorLight: "#f87171",
    errorDark: "#dc2626",
    warning: "#f59e0b",
    warningLight: "#fbbf24",
    warningDark: "#d97706",
    background: "#1a1a1a", // Keep dark theme background dark
    backgroundLight: "#2a2a2a",
    backgroundLighter: "#3a3a3a",
    backgroundDark: "#04102b",
    surface: "#2a2a2a", // Keep dark theme surface dark
    surfaceLight: "#3a3a3a",
    surfaceDark: "#1a1a1a",
    card: "#2a2a2a", // Keep dark theme cards dark
    cardLight: "#3a3a3a",
    cardDark: "#1a1a1a",
    text: "#ffffff", // Keep dark theme text light
    textSecondary: "#f0f0f0",
    textLight: "#f0f0f0",
    textDark: "#94a3b8",
    border: "#555555", // Keep dark theme borders dark
    borderLight: "#6b6b6b",
    borderDark: "#3f3f3f",
    glass: "rgba(22, 23, 30, 0.7)", // Keep dark theme glass dark
    glassLight: "rgba(22, 23, 30, 0.4)",
    glassDark: "rgba(22, 23, 30, 0.9)",
    shadow: "rgba(108, 95, 199, 0.7)", // --shadow-main
    shadowLight: "rgba(108, 95, 199, 0.4)", // --shadow-glass
    shadowMedium: "rgba(108, 95, 199, 0.5)",
    shadowDark: "rgba(108, 95, 199, 0.8)",
    interactive: "#908bdb", // --color-primary
    interactiveLight: "#a09bdf",
    interactiveDark: "#807bd7",
    highlight: "#fbbf24",
    highlightLight: "#fcd34d",
    highlightDark: "#f59e0b",
    inputsBg: "rgba(108, 95, 199, 0.15)", // --color-input-bg
  },
  light: {
    primary: "#908bdb", // --color-primary
    primaryLight: "#a09bdf",
    primaryDark: "#807bd7",
    secondary: "#4ea7debf", // --color-secondary
    secondaryLight: "#6bb8e8",
    secondaryDark: "#3c98d4",
    accent: "#f78fb3",
    accentLight: "#f9a5c2",
    accentDark: "#f579a4",
    success: "#22c55e",
    successLight: "#4ade80",
    successDark: "#16a34a",
    error: "#dc2626",
    errorLight: "#ef4444",
    errorDark: "#b91c1c",
    warning: "#d97706",
    warningLight: "#f59e0b",
    warningDark: "#b45309",
    background: "#f6f4ff", // --color-main
    backgroundLight: "#ffffff", // --color-bg-primary
    backgroundLighter: "#f1f5f9",
    backgroundDark: "#dbe8fc", // --color-bg-secondary
    surface: "#dddaf2", // --color-main-card
    surfaceLight: "#f8fafc",
    surfaceDark: "#f1f5f9",
    card: "#dddaf2", // --color-main-card
    cardLight: "#f8fafc",
    cardDark: "#f1f5f9",
    text: "#1c3161", // --color-text
    textSecondary: "#475569",
    textLight: "#64748b",
    textDark: "#334155",
    border: "#e2e8f0",
    borderLight: "#f1f5f9",
    borderDark: "#cbd5e1",
    glass: "rgba(108, 95, 199, 0.4)", // --shadow-glass
    glassLight: "rgba(108, 95, 199, 0.2)",
    glassDark: "rgba(108, 95, 199, 0.7)", // --shadow-main
    shadow: "rgba(108, 95, 199, 0.7)", // --shadow-main
    shadowLight: "rgba(108, 95, 199, 0.4)", // --shadow-glass
    shadowMedium: "rgba(108, 95, 199, 0.5)",
    shadowDark: "rgba(108, 95, 199, 0.8)",
    interactive: "#908bdb", // --color-primary
    interactiveLight: "#a09bdf",
    interactiveDark: "#807bd7",
    highlight: "#fbbf24",
    highlightLight: "#fcd34d",
    highlightDark: "#f59e0b",
    inputsBg: "rgba(108, 95, 199, 0.15)", // --color-input-bg
  },
};

export const FONTS = {
  primary: "Inter",
  secondary: "Kode Mono",
  body: "Inter",
  heading: "Inter",
  mono: "Kode Mono",
};

export const SHADOWS = {
  main: {
    shadowColor: "rgba(108, 95, 199, 0.7)", // --shadow-main
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 1,
    shadowRadius: 29,
    elevation: 8,
  },
  softPrimary: {
    shadowColor: "rgba(108, 95, 199, 0.5)", // Updated to match new primary
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 5,
  },
  btnPrimary: {
    shadowColor: "rgba(108, 95, 199, 0.5)", // Updated to match new primary
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 25,
    elevation: 6,
  },
  btnPrimaryHover: {
    shadowColor: "rgba(108, 95, 199, 0.7)", // Updated to match new primary
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 8,
  },
  btnSecondaryHover: {
    shadowColor: "rgba(78, 167, 222, 0.3)", // Updated to match new secondary
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 5,
  },
  card: {
    shadowColor: "rgba(108, 95, 199, 0.4)", // --shadow-glass
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 10,
  },
  glassCard: {
    shadowColor: "rgba(108, 95, 199, 0.4)", // --shadow-glass
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 1,
    shadowRadius: 50,
    elevation: 12,
  },
  small: {
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  medium: {
    shadowColor: COLORS.shadowMedium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  large: {
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export const RADII = {
  circle: 200,
  pill: 50, // --rounded-pill
  rounded: 20, // --rounded-rounded
  largeRounded: 30,
  small: 8,
  medium: 12,
  large: 16,
};

export const Z_INDEX = {
  header: 1000,
  modal: 1100,
  tooltip: 1200,
};