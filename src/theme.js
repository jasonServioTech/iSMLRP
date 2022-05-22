import { createTheme } from '@material-ui/core/styles';

// Create a theme instance.
export const theme = createTheme({
  palette: {
    info: {
      main: '#ffffff',
    },
    primary: {
      main: '#256ce1',
    },
    secondary: {
      main: '#27ae61',
    },
  },
  MuiTypography: {
    fontFamily: 'Roboto',
    body2: {
      fontFamily: 'Roboto',
      fontSize: '1.1rem',
    },
  },
  shape: {
    borderRadius: 5,
  },
  spacing: 5,
  overrides: {
    MuiToolbar: {
      root: {
        fontSize: '.8rem',
        variant: 'dense',
        alignItems: 'flex-end',
      },
    },
    MuiSelect: {
      root: {
        fontSize: '.8rem',
        minWidth: '200px',
      },
      nativeInput: {
        fontSize: '.8rem',
      },
    },
    MuiTextField: {
      root: {},
    },
  },
  props: {
    MuiButton: {
      disableRipple: true,
      variant: 'contained',
      color: 'primary',
    },
    MuiCheckbox: {
      disableRipple: true,
    },
    MuiTextField: {
      variant: 'filled',
      InputLabelProps: {
        shrink: true,
      },
    },
    MuiPaper: {
      elevation: 12,
    },
    MuiCard: {
      elevation: 12,
    },
  },
});
