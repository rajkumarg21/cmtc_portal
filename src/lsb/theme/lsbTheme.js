import { createTheme } from '@mui/material/styles';

const lsbTheme = createTheme({
  palette: {
    primary: {
      main: '#1f4e79',
      light: '#2e75b6',
      dark: '#163a5c',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff8f00',
      light: '#ffb300',
      dark: '#e65100',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#616161',
    },
    divider: '#e0e0e0',
    success: {
      main: '#2e7d32',
      light: '#e8f5e9',
    },
    error: {
      main: '#d32f2f',
      light: '#ffebee',
    },
    warning: {
      main: '#f57c00',
      light: '#fff3e0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 600, fontSize: '0.875rem' },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { width: 6, height: 6 },
          '&::-webkit-scrollbar-thumb': { backgroundColor: '#bdbdbd', borderRadius: 3 },
        },
      },
    },
    // ========== BUTTONS ==========
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 20px',
          fontSize: '0.875rem',
          transition: 'all 0.2s ease',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1f4e79 0%, #2e75b6 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #163a5c 0%, #1f4e79 100%)',
            boxShadow: '0 4px 12px rgba(31,78,121,0.3)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #ff8f00 0%, #ffb300 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #e65100 0%, #ff8f00 100%)',
            boxShadow: '0 4px 12px rgba(255,143,0,0.3)',
          },
        },
        containedSuccess: {
          backgroundColor: '#2e7d32',
          '&:hover': { backgroundColor: '#1b5e20', boxShadow: '0 4px 12px rgba(46,125,50,0.3)' },
        },
        containedError: {
          backgroundColor: '#d32f2f',
          '&:hover': { backgroundColor: '#b71c1c', boxShadow: '0 4px 12px rgba(211,47,47,0.3)' },
        },
        outlinedPrimary: {
          borderColor: '#1f4e79',
          color: '#1f4e79',
          borderWidth: 1.5,
          '&:hover': { borderWidth: 1.5, backgroundColor: 'rgba(31,78,121,0.05)' },
        },
        sizeSmall: { padding: '4px 12px', fontSize: '0.8rem' },
        sizeLarge: { padding: '12px 28px', fontSize: '1rem' },
      },
    },
    MuiLoadingButton: {
      styleOverrides: {
        root: { borderRadius: 6, textTransform: 'none', fontWeight: 600 },
      },
    },
    // ========== INPUT FIELDS ==========
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'medium' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
            backgroundColor: '#ffffff',
            '& fieldset': { borderColor: '#d0d5dd', borderWidth: 1.5 },
            '&:hover fieldset': { borderColor: '#2e75b6' },
            '&.Mui-focused fieldset': { borderColor: '#1f4e79', borderWidth: 2 },
          },
          '& .MuiInputLabel-root': { color: '#616161', fontSize: '0.875rem' },
          '& .MuiInputLabel-root.Mui-focused': { color: '#1f4e79', fontWeight: 500 },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          '& fieldset': { borderColor: '#d0d5dd', borderWidth: 1.5 },
          '&:hover fieldset': { borderColor: '#2e75b6' },
          '&.Mui-focused fieldset': { borderColor: '#1f4e79', borderWidth: 2 },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { borderRadius: 6 },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: { fontSize: '0.9rem' },
      },
    },
    // ========== TABLES ==========
    MuiTableContainer: {
      styleOverrides: {
        root: {
          overflowX: 'auto',
          maxWidth: '100%',
          borderRadius: 8,
          border: '1px solid #e0e0e0',
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-thumb': { backgroundColor: '#bdbdbd', borderRadius: 3 },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            background: 'linear-gradient(135deg, #1f4e79 0%, #2e75b6 100%)',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.8125rem',
            borderBottom: 'none',
            padding: '12px 16px',
            whiteSpace: 'nowrap',
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& .MuiTableRow-root': {
            '&:nth-of-type(even)': { backgroundColor: '#f8fafb' },
            '&:hover': { backgroundColor: '#eef4fa' },
            transition: 'background-color 0.15s ease',
          },
          '& .MuiTableCell-root': {
            padding: '10px 16px',
            fontSize: '0.8125rem',
            borderBottom: '1px solid #f0f0f0',
          },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: { borderTop: '1px solid #e0e0e0' },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: '1px solid #e0e0e0',
          borderRadius: 8,
          '& .MuiDataGrid-columnHeaders': {
            background: 'linear-gradient(135deg, #1f4e79 0%, #2e75b6 100%)',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.8125rem',
          },
          '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 600 },
          '& .MuiDataGrid-row:hover': { backgroundColor: '#eef4fa' },
          '& .MuiDataGrid-row:nth-of-type(even)': { backgroundColor: '#f8fafb' },
          '& .MuiDataGrid-virtualScroller': { overflowX: 'auto' },
          '& .MuiDataGrid-main': { overflow: 'auto' },
        },
      },
    },
    // ========== CARDS & PAPER ==========
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { borderRadius: 8, border: '1px solid #e0e0e0' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid #e0e0e0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          transition: 'box-shadow 0.2s ease',
          '&:hover': { boxShadow: '0 4px 16px rgba(31,78,121,0.1)' },
        },
      },
    },
    // ========== CHIPS ==========
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 500, fontSize: '0.75rem' },
        colorSuccess: { backgroundColor: '#e8f5e9', color: '#2e7d32' },
        colorError: { backgroundColor: '#ffebee', color: '#d32f2f' },
        colorWarning: { backgroundColor: '#fff3e0', color: '#e65100' },
        colorPrimary: { backgroundColor: '#e3f2fd', color: '#1f4e79' },
      },
    },
    // ========== TABS ==========
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: '#1f4e79', height: 3, borderRadius: '3px 3px 0 0' },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          '&.Mui-selected': { color: '#1f4e79', fontWeight: 600 },
        },
      },
    },
    // ========== DIALOGS ==========
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 12, border: 'none' },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: '1.1rem', color: '#1f4e79' },
      },
    },
    // ========== MISC ==========
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #1f4e79 0%, #2e75b6 100%)',
          boxShadow: '0 2px 8px rgba(31,78,121,0.3)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: { paper: { backgroundColor: '#163a5c', borderRight: 'none' } },
    },
    MuiTooltip: { styleOverrides: { tooltip: { backgroundColor: '#212121', borderRadius: 6, fontSize: '0.75rem' } } },
    MuiMenu: { styleOverrides: { paper: { borderRadius: 8, border: '1px solid #e0e0e0', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } } },
    MuiListItemButton: { styleOverrides: { root: { borderRadius: 6 } } },
    MuiPagination: {
      styleOverrides: {
        root: { '& .Mui-selected': { backgroundColor: '#1f4e79', color: '#fff' } },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 6 },
        standardSuccess: { backgroundColor: '#e8f5e9', color: '#2e7d32' },
        standardError: { backgroundColor: '#ffebee', color: '#d32f2f' },
        standardWarning: { backgroundColor: '#fff3e0', color: '#e65100' },
        standardInfo: { backgroundColor: '#e3f2fd', color: '#1f4e79' },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          '& .MuiStepIcon-root.Mui-active': { color: '#1f4e79' },
          '& .MuiStepIcon-root.Mui-completed': { color: '#2e7d32' },
        },
      },
    },
  },
});

export default lsbTheme;
