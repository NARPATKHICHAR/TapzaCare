import type { ThemeConfig } from './types';

export function createTheme(config: ThemeConfig) {
  return {
    colors: {
      primary: config.primary,
      secondary: config.secondary,
      background: config.background,
      surface: config.surface,
      textPrimary: config.textPrimary,
      textSecondary: config.textSecondary,
      accent: config.accent,
      border: `${config.textSecondary}30`,
      success: '#166534',
      error: '#B91C1C',
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    typography: { caption: 12, body: 16, subtitle: 18, title: 24, heading: 30 },
    radius: { sm: 8, md: 14, lg: 22, pill: 999 },
    festival: config.festival,
  } as const;
}

export type AppTheme = ReturnType<typeof createTheme>;
