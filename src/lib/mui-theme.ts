import { createTheme } from '@mui/material/styles';

/** Material Design 3 inspired palette – minimal blue primary, neutral surfaces */
const md3 = {
  light: {
    primary: { main: '#1A73E8', light: '#4285F4', dark: '#1557B0', contrastText: '#FFFFFF' },
    secondary: { main: '#5F6368', contrastText: '#FFFFFF' },
    error: { main: '#B3261E' },
    background: { default: '#FAFAFA', paper: '#FFFFFF' },
    text: { primary: '#1F1F1F', secondary: '#5F6368' },
    divider: '#E0E0E0',
  },
  dark: {
    primary: { main: '#8AB4F8', light: '#AECBFA', dark: '#669DF6', contrastText: '#062E6F' },
    secondary: { main: '#9AA0A6', contrastText: '#121212' },
    error: { main: '#F2B8B5' },
    background: { default: '#121212', paper: '#1E1E1E' },
    text: { primary: '#E3E3E3', secondary: '#9AA0A6' },
    divider: '#424242',
  },
} as const;

export function createAppTheme(mode: 'light' | 'dark') {
  const tokens = md3[mode];
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: tokens.primary,
      secondary: tokens.secondary,
      error: tokens.error,
      background: tokens.background,
      text: tokens.text,
      divider: tokens.divider,
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
            borderColor: tokens.divider,
            transition: 'box-shadow 0.2s ease',
            '&:hover': {
              boxShadow: isDark
                ? '0 2px 8px rgba(0,0,0,0.4)'
                : '0 2px 8px rgba(0,0,0,0.08)',
            },
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundImage: 'none',
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
            borderBottom: `1px solid ${tokens.divider}`,
            color: theme.palette.text.primary,
          }),
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
            borderRight: `1px solid ${tokens.divider}`,
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
            borderRadius: 8,
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
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            height: 64,
            bgcolor: 'transparent',
          },
        },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            minWidth: 56,
            '&.Mui-selected': {
              color: tokens.primary.main,
            },
          },
          label: {
            fontSize: '0.7rem',
            '&.Mui-selected': {
              fontSize: '0.75rem',
            },
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
    },
  });
}
