import { createTheme } from '@mui/material/styles';
import { colors } from './tokens/colors';
import { typography } from './tokens/typography';
import { spacing } from './tokens/spacing';

export const theme = createTheme({
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    text: {
      primary: colors.neutral[600],
      secondary: colors.neutral[500],
      disabled: colors.neutral[400]
    },
    background: colors.background,
    error: {
      main: colors.feedback.error
    },
    warning: {
      main: colors.feedback.warning
    },
    success: {
      main: colors.feedback.success
    },
    info: {
      main: colors.feedback.info
    },
    neutral: colors.neutral
  },
  
  typography: {
    fontFamily: typography.fontFamily.primary,
    ...typography.styles
  },

  shape: {
    borderRadius: 8
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          padding: '10px 24px',
          fontWeight: typography.weight.medium,
          '&:hover': {
            boxShadow: 'none'
          }
        },
        contained: {
          boxShadow: 'none'
        },
        outlined: {
          borderColor: colors.primary.main,
          color: colors.primary.main,
          '&:hover': {
            backgroundColor: `${colors.primary.main}10`,
            borderColor: colors.primary.main
          }
        },
        text: {
          color: colors.primary.main,
          '&:hover': {
            backgroundColor: `${colors.primary.main}10`
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
          borderRadius: '12px'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: colors.background.paper,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary.light
            }
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontWeight: typography.weight.medium
        }
      }
    }
  }
});
