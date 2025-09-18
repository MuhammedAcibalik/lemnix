import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Snackbar,
  Alert,
  IconButton,
  useMediaQuery
} from '@mui/material';

import { Menu as MenuIcon } from '@mui/icons-material';
import { Logo } from './components/Logo';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './components/pages/HomePage';
import { CuttingListBuilder } from './components/CuttingListBuilder';
import { EnterpriseOptimizationForm } from './components/EnterpriseOptimizationForm';
import { EnterpriseOptimizationWizard } from './components/EnterpriseOptimizationWizard';
import { OptimizationItem, OptimizationResult } from './types';
import { colors, typography, spacing, shadows, borderRadius, gradients, componentSizes } from './theme/designSystem';
import { UploadResponse } from './services/excelApi';

// Global CSS Animations
const globalStyles = `
  @keyframes lemnixRotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary[900], // #1a237e
      light: colors.primary[600], // #3949ab  
      dark: colors.primary[900],
      50: colors.primary[50],
      100: colors.primary[100],
      200: colors.primary[200],
      300: colors.primary[300],
      400: colors.primary[400],
      500: colors.primary[500],
      600: colors.primary[600],
      700: colors.primary[700],
      800: colors.primary[800],
      900: colors.primary[900],
    },
    secondary: {
      main: colors.secondary[600], // #fb8c00
      light: colors.secondary[400], // #ffa726
      dark: colors.secondary[800], // #ef6c00
    },
    background: {
      default: colors.neutral[50], // #f8fafc
      paper: '#ffffff',
    },
    text: {
      primary: colors.primary[900], // #1a237e
      secondary: colors.neutral[500], // #64748b
    },
    divider: colors.neutral[200],
    success: {
      main: colors.success[500],
      light: colors.success[50],
      dark: colors.success[700],
    },
    warning: {
      main: colors.warning[500],
      light: colors.warning[50],
      dark: colors.warning[700],
    },
    error: {
      main: colors.error[500],
      light: colors.error[50],
      dark: colors.error[700],
    },
    info: {
      main: colors.info[500],
      light: colors.info[50],
      dark: colors.info[700],
    },
  },
  typography: {
    fontFamily: typography.fontFamily.primary,
    h1: {
      fontSize: typography.fontSize['5xl'],
      fontWeight: typography.fontWeight.bold,
      lineHeight: typography.lineHeight.tight,
    },
    h2: {
      fontSize: typography.fontSize['4xl'],
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.snug,
    },
    h3: {
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.snug,
    },
    h4: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.snug,
    },
    h5: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.normal,
    },
    h6: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.normal,
    },
    body1: {
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.relaxed,
    },
    body2: {
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.relaxed,
    },
    caption: {
      fontSize: typography.fontSize.xs,
      lineHeight: typography.lineHeight.normal,
    },
  },
  shape: {
    borderRadius: borderRadius.md,
  },
  shadows: [
    shadows.none,
    shadows.sm,
    shadows.base,
    shadows.md,
    shadows.lg,
    shadows.xl,
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
  ],
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: gradients.primary,
          boxShadow: shadows.md,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: gradients.card,
          border: `1px solid ${colors.neutral[200]}`,
          boxShadow: shadows.md,
          borderRadius: borderRadius.md,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: typography.fontWeight.semibold,
          borderRadius: borderRadius.base,
          minHeight: componentSizes.button.medium.height,
          padding: componentSizes.button.medium.padding,
          fontSize: componentSizes.button.medium.fontSize,
          boxShadow: shadows.base,
          '&:hover': {
            boxShadow: shadows.md,
          },
        },
        contained: {
          background: gradients.primary,
          '&:hover': {
            background: gradients.primaryReverse,
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
        sizeSmall: {
          minHeight: componentSizes.button.small.height,
          padding: componentSizes.button.small.padding,
          fontSize: componentSizes.button.small.fontSize,
        },
        sizeLarge: {
          minHeight: componentSizes.button.large.height,
          padding: componentSizes.button.large.padding,
          fontSize: componentSizes.button.large.fontSize,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: borderRadius.base,
            minHeight: componentSizes.input.medium.height,
            fontSize: componentSizes.input.medium.fontSize,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary[900],
              borderWidth: '1.5px',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary[900],
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            fontSize: typography.fontSize.sm,
            color: colors.neutral[500],
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.base,
          minHeight: componentSizes.input.medium.height,
          fontSize: componentSizes.input.medium.fontSize,
        },
        outlined: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderWidth: '1.5px',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.sm,
          fontWeight: typography.fontWeight.medium,
          height: 24,
          fontSize: typography.fontSize.xs,
        },
        sizeSmall: {
          height: 20,
          fontSize: typography.fontSize.xs,
        },
        sizeMedium: {
          height: 28,
          fontSize: typography.fontSize.sm,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.base,
          fontSize: typography.fontSize.sm,
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          minWidth: 200,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.base,
          '&:hover': {
            backgroundColor: `${colors.primary[900]}14`, // 8% opacity
          },
        },
        sizeSmall: {
          padding: spacing.xs,
        },
        sizeMedium: {
          padding: spacing.sm,
        },
        sizeLarge: {
          padding: spacing.md,
        },
      },
    },
  },
});

function App() {
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [excelItems, setExcelItems] = useState<OptimizationItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const isMobile = useMediaQuery('(max-width:1024px)');

  const handleOptimizationSubmit = async (data: any) => {
    // Optimization request started
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/optimization/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setOptimizationResult(result.data);
        setSnackbar({
          open: true,
          message: result.message || 'Optimizasyon başarıyla tamamlandı',
          severity: 'success',
        });
      } else if (result.success && result.cuts) { // Fallback for old response format
        // console.log('Optimization data (fallback):', result);
        setOptimizationResult(result);
        setSnackbar({
          open: true,
          message: 'Optimizasyon başarıyla tamamlandı',
          severity: 'success',
        });
      } else {
        throw new Error(result.error?.message || 'Optimizasyon başarısız');
      }
    } catch (error) {
      // Optimization failed
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Optimizasyon sırasında hata oluştu',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkOrdersSelected = (items: OptimizationItem[]) => {
    setExcelItems(items);
    setSnackbar({
      open: true,
      message: `${items.length} adet iş emri başarıyla eklendi`,
      severity: 'success',
    });
  };

  const handleExcelUploadSuccess = (data: UploadResponse) => {
    setSnackbar({
      open: true,
      message: `Excel dosyası başarıyla yüklendi: ${data.filename}`,
      severity: 'success',
    });
  };

  const handleExcelUploadError = (error: string) => {
    setSnackbar({
      open: true,
      message: `Excel yükleme hatası: ${error}`,
      severity: 'error',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handlePageChange = (page: string) => {
    setActivePage(page);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'cutting-list':
        return <CuttingListBuilder />;
      case 'enterprise-optimization':
        return <EnterpriseOptimizationWizard />;
      case 'dashboard':
        return (
          <Box sx={{ p: { xs: 2, md: 3, lg: 4 } }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e', mb: 2 }}>
              Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Genel istatistikler ve raporlar burada görüntülenecek.
            </Typography>
          </Box>
        );
      case 'settings':
        return (
          <Box sx={{ p: { xs: 2, md: 3, lg: 4 } }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e', mb: 2 }}>
              Ayarlar
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sistem ayarları burada yapılandırılacak.
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <style>{globalStyles}</style>
               <Box sx={{ display: 'flex' }}>
           {/* Sidebar */}
           <Sidebar
             open={isMobile ? sidebarOpen : true}
             onClose={() => setSidebarOpen(false)}
             activePage={activePage}
             onPageChange={handlePageChange}
           />

                   {/* Ana İçerik */}
           <Box
             component="main"
             sx={{
               flexGrow: 1,
               background: colors.neutral[50],
               display: 'flex',
               flexDirection: 'column',
             }}
           >
            {/* Mobile Menu Button - Only on mobile */}
            {isMobile && (
              <Box sx={{ 
                position: 'fixed', 
                top: 16, 
                left: 16, 
                zIndex: 1300,
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                backdropFilter: 'blur(10px)',
              }}>
                <IconButton
                  color="primary"
                  aria-label="toggle sidebar"
                  onClick={toggleSidebar}
                  sx={{ 
                    p: 1.5,
                    '&:hover': {
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            )}

            {/* Sayfa İçeriği */}
            <Box sx={{ 
              flexGrow: 1,
              minHeight: '100vh', // Full height without AppBar
              overflow: 'auto'
            }}>
              {renderPage()}
            </Box>

            {/* Snackbar */}
            <Snackbar
              open={snackbar.open}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Alert
                onClose={handleCloseSnackbar}
                severity={snackbar.severity}
                sx={{ width: '100%' }}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
          </Box>
        </Box>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
