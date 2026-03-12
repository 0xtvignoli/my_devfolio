import { createTheme } from '@mui/material/styles';

/**
 * MUI theme aligned with existing design tokens (globals.css).
 * Design moderno: elevation moderata, spacing 8px, typography scale, WCAG AA.
 */
export function createAppTheme(mode: 'light' | 'dark') {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#00d9ff' : '#0891b2',
        contrastText: isDark ? '#0a0e1a' : '#fff',
      },
      secondary: {
        main: isDark ? '#a855f7' : '#7b2cbf',
      },
      error: {
        main: isDark ? '#f87171' : '#dc2626',
      },
      background: {
        default: isDark ? '#0a0e1a' : 'hsl(220 30% 98%)',
        paper: isDark ? '#0f1419' : 'hsl(220 25% 99%)',
      },
      text: {
        primary: isDark ? '#e0f2fe' : 'hsl(220 20% 10%)',
        secondary: isDark ? '#7dd3fc' : 'hsl(220 10% 35%)',
      },
    },
    shape: {
      borderRadius: 12,
    },
    spacing: 8,
    typography: {
      fontFamily: 'var(--font-body), system-ui, sans-serif',
      h1: { fontFamily: 'var(--font-headline), system-ui, sans-serif', fontWeight: 700 },
      h2: { fontFamily: 'var(--font-headline), system-ui, sans-serif', fontWeight: 700 },
      h3: { fontFamily: 'var(--font-headline), system-ui, sans-serif', fontWeight: 600 },
      h4: { fontFamily: 'var(--font-headline), system-ui, sans-serif', fontWeight: 600 },
      h5: { fontFamily: 'var(--font-headline), system-ui, sans-serif', fontWeight: 600 },
      h6: { fontFamily: 'var(--font-headline), system-ui, sans-serif', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
          size: 'medium',
        },
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
            minHeight: 44,
            minWidth: 44,
          },
        },
      },
      MuiIconButton: {
        defaultProps: {
          size: 'medium',
        },
        styleOverrides: {
          root: {
            minWidth: 44,
            minHeight: 44,
          },
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            transition: 'box-shadow 0.2s ease',
            '&:hover': {
              boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.08)',
            },
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 1,
        },
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
      MuiAppBar: {
        defaultProps: {
          elevation: 0,
          position: 'sticky',
        },
        styleOverrides: {
          root: ({ theme }) => ({
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            borderBottom: '1px solid var(--glass-border)',
            // Use text.primary so navbar is visible in both light and dark (glass background overrides default primary contrast)
            color: theme.palette.text.primary,
          }),
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
            borderRight: '1px solid var(--glass-border)',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
          },
        },
      },
      MuiChip: {
        defaultProps: {
          size: 'small',
          variant: 'outlined',
        },
        styleOverrides: {
          root: {
            borderRadius: 9999,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          size: 'medium',
        },
      },
      MuiLink: {
        defaultProps: {
          underline: 'hover',
        },
      },
    },
  });
}
