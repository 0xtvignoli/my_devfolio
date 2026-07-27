import { createTheme, responsiveFontSizes } from '@mui/material/styles';

/**
 * OpenCode "manpage" theme for MUI.
 * Monospaced everywhere, warm cream canvas / near-black ink, flat surfaces
 * (elevation 0, no shadows), sharp 0px containers, 4px radius on interactive
 * controls, and 1px hairline dividers. The dark mode is a coherent inversion.
 */
const MONO =
  'var(--font-mono-stack), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

const oc = {
  light: {
    canvas: '#fdfcfc',
    surfaceSoft: '#f8f7f7',
    surfaceCard: '#f1eeee',
    ink: '#201d1d',
    inkDeep: '#0f0000',
    body: '#424245',
    mute: '#646262',
    ash: '#9a9898',
    hairline: '#e0dede',
    hairlineStrong: '#646262',
    danger: '#c0271f', // darker than #ff3b30 so white-on-red / red-on-cream meet WCAG AA
  },
  dark: {
    canvas: '#201d1d',
    surfaceSoft: '#302c2c',
    surfaceCard: '#302c2c',
    ink: '#fdfcfc',
    inkDeep: '#fdfcfc',
    body: '#c9c6c6',
    mute: '#9a9898',
    ash: '#9a9898',
    hairline: '#3a3636',
    hairlineStrong: '#6e6e73',
    danger: '#ff6961',
  },
} as const;

export function createAppTheme(mode: 'light' | 'dark') {
  const c = oc[mode];

  // responsiveFontSizes only scales headings *down* below lg, which is exactly
  // what a mono face needs on a 390px window (h4 was 2 lines / ~130px there).
  return responsiveFontSizes(createTheme({
    palette: {
      mode,
      primary: { main: c.ink, dark: c.inkDeep, contrastText: c.canvas },
      secondary: { main: c.mute, contrastText: c.canvas },
      error: { main: c.danger },
      background: { default: c.canvas, paper: c.canvas },
      text: { primary: c.ink, secondary: c.mute },
      divider: c.hairline,
    },
    shape: {
      // 4px on interactive controls (buttons/inputs); containers overridden to 0
      borderRadius: 4,
    },
    spacing: 8,
    typography: {
      fontFamily: MONO,
      // Single face, hierarchy comes from size + weight only
      h1: { fontFamily: MONO, fontWeight: 700, letterSpacing: 0 },
      h2: { fontFamily: MONO, fontWeight: 700, letterSpacing: 0 },
      h3: { fontFamily: MONO, fontWeight: 700, letterSpacing: 0 },
      h4: { fontFamily: MONO, fontWeight: 700, letterSpacing: 0 },
      h5: { fontFamily: MONO, fontWeight: 700, letterSpacing: 0 },
      h6: { fontFamily: MONO, fontWeight: 700, letterSpacing: 0 },
      button: { fontFamily: MONO, fontWeight: 500, letterSpacing: 0 },
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
          size: 'medium',
        },
        styleOverrides: {
          root: {
            borderRadius: 4,
            textTransform: 'none',
            fontWeight: 500,
            fontFamily: MONO,
            minHeight: 44,
            minWidth: 44,
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
            '&:active': { boxShadow: 'none' },
          },
        },
      },
      MuiIconButton: {
        defaultProps: {
          size: 'medium',
        },
        styleOverrides: {
          root: {
            borderRadius: 4,
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
            borderRadius: 0, // sharp container
            border: '1px solid',
            borderColor: c.hairline,
            boxShadow: 'none',
            backgroundImage: 'none',
            transition: 'border-color 0.2s ease',
            '&:hover': {
              boxShadow: 'none',
              borderColor: c.hairlineStrong,
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
            borderRadius: 0,
            backgroundImage: 'none',
            boxShadow: 'none',
          },
        },
      },
      MuiAppBar: {
        defaultProps: {
          elevation: 0,
          position: 'sticky',
          color: 'default',
        },
        styleOverrides: {
          root: {
            background: c.canvas,
            backgroundImage: 'none',
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none',
            boxShadow: 'none',
            borderBottom: `1px solid ${c.hairline}`,
            color: c.ink,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
            backgroundImage: 'none',
            borderRight: `1px solid ${c.hairline}`,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 0, // sharp container
            border: `1px solid ${c.hairline}`,
            backgroundImage: 'none',
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
            borderRadius: 4,
            fontFamily: MONO,
            borderColor: c.hairlineStrong,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 4,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          size: 'medium',
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            fontFamily: MONO,
          },
          notchedOutline: {
            borderColor: c.hairlineStrong,
          },
        },
      },
      MuiLink: {
        defaultProps: {
          underline: 'always',
        },
        styleOverrides: {
          root: {
            color: c.ink,
            textDecorationColor: c.hairlineStrong,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 4,
            fontFamily: MONO,
            backgroundColor: c.ink,
            color: c.canvas,
          },
        },
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            height: 64,
            bgcolor: 'transparent',
            borderTop: `1px solid ${c.hairline}`,
          },
        },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            minWidth: 56,
            fontFamily: MONO,
            color: c.mute, // AA-safe unselected label (was falling back to a low-contrast gray)
            '&.Mui-selected': {
              color: c.ink,
            },
          },
          label: {
            fontFamily: MONO,
            fontSize: '0.75rem', // MD3 label-medium floor; 0.7rem rendered at 11.2px
            '&.Mui-selected': {
              fontSize: '0.75rem',
            },
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            textTransform: 'none',
            fontWeight: 500,
            fontFamily: MONO,
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
        },
      },
    },
  }));
}
