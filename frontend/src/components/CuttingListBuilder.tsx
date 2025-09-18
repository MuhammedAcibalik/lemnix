/**
 * @fileoverview Kesim Listesi Oluşturucu - Profesyonel İş Emri Yönetim Sistemi
 * @module CuttingListBuilder
 * @version 5.1.0 - Geliştirilmiş Tasarım ve Özellikler
 * 
 * Bu bileşen, profesyonel kesim listesi oluşturma ve yönetim sistemi sağlar.
 * Projenin genel tasarım sistemiyle tam uyumlu, modern ve kullanışlı arayüz.
 * 
 * Özellikler:
 * - Profesyonel Tasarım Sistemi Uyumlu
 * - TypeScript Strict Mode Desteği
 * - Responsive Tasarım
 * - Akıllı Form Validasyonu
 * - Gerçek Zamanlı Veri Senkronizasyonu
 * - Otomatik Kaydetme
 * - Export Özellikleri (PDF/Excel)
 * - Hata Yönetimi
 * - Loading States
 * - Tab-Based Interface
 * - Advanced Statistics
 * 
 * @author LEMNİX Development Team
 * @since 2025
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  Chip,
  Avatar,
  Tooltip,
  CircularProgress,
  Snackbar,
  Stack,
  Grid,
  Collapse,
  LinearProgress,
  Container,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Badge,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Category as CategoryIcon,
  Assignment as AssignmentIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Inventory as InventoryIcon,
  Functions as AlgorithmIcon,
  Calculate as CalculateIcon,
  PlayArrow as StartIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  GetApp as ExportIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';
import axios, { AxiosError, CancelTokenSource } from 'axios';
import { 
  colors, 
  spacing, 
  responsiveSpacing, 
  typography, 
  shadows, 
  borderRadius, 
  gradients,
  zIndex 
} from '../theme/designSystem';

// ============================================================================
// TYPE DEFINITIONS - Strict TypeScript Types
// ============================================================================

interface ProfileItem {
  id: string;
  profile: string;
  measurement: string;
  quantity: number;
}

interface WorkOrderItem {
  id: string;
  workOrderId: string;
  date: string;
  version: string;
  color: string;
  note: string;
  orderQuantity: number;
  size: string;
  profiles: ProfileItem[];
  createdAt: string;
  updatedAt: string;
  status?: 'draft' | 'ready' | 'processing' | 'completed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

interface ProductSection {
  id: string;
  productName: string;
  items: WorkOrderItem[];
  createdAt: string;
  updatedAt: string;
  isExpanded?: boolean;
}

interface CuttingList {
  id: string;
  title: string;
  weekNumber: number;
  sections: ProductSection[];
  createdAt: string;
  updatedAt: string;
  status?: 'active' | 'archived' | 'template';
}

interface ProfileFormItem {
  id: string;
  profile: string;
  measurement: string;
  quantity: string;
}

interface WorkOrderForm {
  workOrderId: string;
  date: string;
  version: string;
  color: string;
  note: string;
  orderQuantity: string;
  size: string;
  profiles: ProfileFormItem[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface CuttingListStats {
  totalSections: number;
  totalItems: number;
  totalProfiles: number;
  completedItems: number;
  efficiency: number;
  totalQuantity: number;
}

enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

// ============================================================================
// STYLED COMPONENTS - Design System Compliant
// ============================================================================

const StyledCard: React.FC<{ 
  children: React.ReactNode; 
  sx?: any; 
  variant?: 'elevation' | 'outlined';
  elevation?: number;
  [key: string]: any;
}> = ({ 
  children, 
  sx = {}, 
  variant = 'elevation',
  elevation = 1,
  ...props 
}) => (
  <Card
    {...props}
    variant={variant}
    elevation={variant === 'outlined' ? 0 : elevation}
    sx={{
      borderRadius: 1, // Tamamen keskin köşeler - modern premium görünüm
      background: variant === 'outlined' 
        ? 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)'
        : 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(249,250,251,1) 100%)',
      backdropFilter: 'blur(20px)',
      boxShadow: variant === 'outlined' 
        ? `0 2px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)`
        : `0 8px 32px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)`,
      border: variant === 'outlined' 
        ? `1px solid rgba(0,0,0,0.12)` 
        : 'none',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.8) 50%, transparent 100%)',
        zIndex: 1,
      },
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: variant === 'outlined' 
          ? `0 16px 48px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.95)`
          : `0 24px 48px rgba(0,0,0,0.15), 0 12px 24px rgba(0,0,0,0.1), 0 0 0 1px rgba(59,130,246,0.1)`,
      },
      '&:active': {
        transform: 'translateY(-2px)',
      },
      ...sx,
    }}
  >
    {children}
  </Card>
);

const StyledButton: React.FC<{ 
  children: React.ReactNode; 
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  size?: 'small' | 'medium' | 'large';
  sx?: any;
  [key: string]: any;
}> = ({ 
  children, 
  variant = 'contained', 
  color = 'primary',
  size = 'medium',
  sx = {}, 
  ...props 
}) => (
  <Button
    {...props}
    variant={variant}
    color={color}
    size={size}
    sx={{
      borderRadius: 0, // Tamamen keskin köşeler - modern premium görünüm
      textTransform: 'none',
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize.sm,
      minHeight: size === 'large' ? 52 : size === 'small' ? 36 : 44,
      px: spacing.lg,
      position: 'relative',
      overflow: 'hidden',
      background: variant === 'contained' 
        ? `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[700]} 100%)`
        : 'transparent',
      border: variant === 'outlined' 
        ? `2px solid ${colors.primary[500]}` 
        : 'none',
      color: variant === 'contained' ? 'white' : colors.primary[700],
      boxShadow: variant === 'contained' 
        ? `0 4px 14px 0 rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)`
        : 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: variant === 'contained'
          ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
          : `linear-gradient(90deg, transparent, ${colors.primary[50]}, transparent)`,
        transition: 'left 0.5s',
      },
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: variant === 'contained' 
          ? `0 8px 25px 0 rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)`
          : `0 4px 14px 0 rgba(59, 130, 246, 0.2)`,
        '&::before': {
          left: '100%',
        },
      },
      '&:active': {
        transform: 'translateY(-1px)',
      },
      ...sx,
    }}
  >
    {children}
  </Button>
);

const StyledTextField: React.FC<{ sx?: any; [key: string]: any }> = ({ sx = {}, ...props }) => (
  <TextField
    {...props}
    sx={{
      '& .MuiOutlinedInput-root': {
        borderRadius: 0, // Tamamen keskin köşeler - modern premium görünüm
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(0,0,0,0.12)',
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
        '&:hover': {
          background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(249,250,251,1) 100%)',
          border: '2px solid rgba(59, 130, 246, 0.4)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(59, 130, 246, 0.15)',
        },
        '&.Mui-focused': {
          background: 'white',
          border: '2px solid rgba(59, 130, 246, 0.8)',
          boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.15), inset 0 2px 4px rgba(0,0,0,0.06)',
        },
        '& fieldset': {
          border: 'none',
        },
      },
      '& .MuiInputLabel-root': {
        fontWeight: typography.fontWeight.bold,
        color: 'rgba(0,0,0,0.8)',
        '&.Mui-focused': {
          color: colors.primary[700],
        },
      },
      ...sx,
    }}
  />
);

const StyledChip: React.FC<{ 
  label: string;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  size?: 'small' | 'medium';
  sx?: any;
  [key: string]: any;
}> = ({ 
  label,
  color = 'default',
  size = 'medium',
  sx = {},
  ...props 
}) => (
  <Chip
    {...props}
    label={label}
    color={color}
    size={size}
    sx={{
      borderRadius: 0, // Tamamen keskin köşeler - modern premium görünüm
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize.xs,
      background: color === 'primary' 
        ? `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[700]} 100%)`
        : color === 'success'
        ? `linear-gradient(135deg, ${colors.success[500]} 0%, ${colors.success[700]} 100%)`
        : color === 'warning'
        ? `linear-gradient(135deg, ${colors.warning[500]} 0%, ${colors.warning[700]} 100%)`
        : color === 'error'
        ? `linear-gradient(135deg, ${colors.error[500]} 0%, ${colors.error[700]} 100%)`
        : 'linear-gradient(135deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.12) 100%)',
      color: color === 'default' ? 'rgba(0,0,0,0.9)' : 'white',
      boxShadow: color !== 'default' 
        ? `0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)`
        : '0 2px 6px rgba(0,0,0,0.12)',
      border: color === 'default' ? '2px solid rgba(0,0,0,0.15)' : 'none',
      transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: color !== 'default' 
          ? `0 8px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.4)`
          : '0 4px 12px rgba(0,0,0,0.2)',
      },
      ...sx,
    }}
  />
);

const PageHeader: React.FC<{ 
  title: string; 
  subtitle: string; 
  stats?: CuttingListStats;
  actions?: React.ReactNode;
}> = ({ title, subtitle, stats, actions }) => {
      return (
    <StyledCard sx={{ 
      mb: responsiveSpacing.section, 
      overflow: 'hidden',
      background: gradients.primary,
      border: 'none',
      boxShadow: shadows.lg,
    }}>
      <Box sx={{ 
        color: 'white', 
        p: responsiveSpacing.card,
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: typography.fontWeight.bold,
                mb: spacing.xs,
                fontSize: { xs: typography.fontSize['2xl'], md: typography.fontSize['3xl'] }
              }}
            >
              {title}
          </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                opacity: 0.9,
                fontSize: typography.fontSize.base
              }}
            >
              {subtitle}
            </Typography>
        </Box>
          
          {actions && (
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              {actions}
            </Box>
          )}
        </Stack>
      </Box>
      
      {stats && (
        <CardContent sx={{ p: responsiveSpacing.card }}>
          <Grid container spacing={spacing.lg}>
            <Grid item xs={6} sm={3}>
              <Stack alignItems="center" spacing={spacing.xs}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  background: `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.primary[500]} 100%)`,
                  color: colors.primary[700],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${colors.primary[500]}`,
                  boxShadow: `0 4px 12px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.3)`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                    animation: 'shimmer 2s ease-in-out infinite',
                  },
                }}>
                  <CategoryIcon />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: typography.fontWeight.bold, color: colors.primary[700] }}>
                  {stats.totalSections}
                </Typography>
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  Ürün Kategorisi
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Stack alignItems="center" spacing={spacing.xs}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  background: `linear-gradient(135deg, ${colors.info[50]} 0%, ${colors.info[500]} 100%)`,
                  color: colors.info[700],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${colors.info[500]}`,
                  boxShadow: `0 4px 12px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.3)`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                    animation: 'shimmer 2s ease-in-out infinite',
                  },
                }}>
                  <AssignmentIcon />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: typography.fontWeight.bold, color: colors.info[700] }}>
                  {stats.totalItems}
                </Typography>
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  İş Emri
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Stack alignItems="center" spacing={spacing.xs}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  background: `linear-gradient(135deg, ${colors.success[50]} 0%, ${colors.success[500]} 100%)`,
                  color: colors.success[700],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${colors.success[500]}`,
                  boxShadow: `0 4px 12px rgba(34, 197, 94, 0.2), inset 0 1px 0 rgba(255,255,255,0.3)`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                    animation: 'shimmer 2s ease-in-out infinite',
                  },
                }}>
                  <InventoryIcon />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: typography.fontWeight.bold, color: colors.success[700] }}>
                  {stats.totalProfiles}
                </Typography>
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  Profil Tipi
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Stack alignItems="center" spacing={spacing.xs}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  background: `linear-gradient(135deg, ${colors.warning[50]} 0%, ${colors.warning[500]} 100%)`,
                  color: colors.warning[700],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${colors.warning[500]}`,
                  boxShadow: `0 4px 12px rgba(245, 158, 11, 0.2), inset 0 1px 0 rgba(255,255,255,0.3)`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                    animation: 'shimmer 2s ease-in-out infinite',
                  },
                }}>
                  <TrendingUpIcon />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: typography.fontWeight.bold, color: colors.warning[700] }}>
                  %{Math.round(stats.efficiency)}
                </Typography>
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  Verimlilik
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      )}
    </StyledCard>
  );
};

const ActionToolbar: React.FC<{ 
  primaryAction?: { label: string; onClick: () => void; icon?: React.ReactNode };
  secondaryActions?: Array<{ label: string; onClick: () => void; icon?: React.ReactNode; color?: string }>;
  loading?: boolean;
}> = ({ primaryAction, secondaryActions = [], loading = false }) => (
  <Paper 
    elevation={0} 
    sx={{ 
      p: spacing.md, 
      mb: responsiveSpacing.section, 
      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(0,0,0,0.05)',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%)',
      },
    }}
  >
    <Stack 
      direction={{ xs: 'column', sm: 'row' }} 
      spacing={spacing.sm} 
      justifyContent="space-between"
      alignItems={{ xs: 'stretch', sm: 'center' }}
    >
      {primaryAction && (
        <StyledButton
          size="large"
          onClick={primaryAction.onClick}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : primaryAction.icon}
        >
          {primaryAction.label}
        </StyledButton>
      )}
      
      <Stack direction="row" spacing={spacing.sm}>
        {secondaryActions.map((action, index) => (
          <StyledButton
            key={index}
            variant="outlined"
            onClick={action.onClick}
            disabled={loading}
            startIcon={action.icon}
            color={action.color as any}
          >
            {action.label}
          </StyledButton>
        ))}
      </Stack>
    </Stack>
  </Paper>
);

// ============================================================================
// MAIN COMPONENT - CuttingListBuilder
// ============================================================================

export const CuttingListBuilder: React.FC = (): React.ReactElement => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Refs for performance
  const cancelTokenRef = useRef<CancelTokenSource | null>(null);

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Core data states
  const [cuttingList, setCuttingList] = useState<CuttingList | null>(null);
  const [cuttingLists, setCuttingLists] = useState<CuttingList[]>([]);
  const [title, setTitle] = useState<string>('');
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(1);
  const [productName, setProductName] = useState<string>('');
  
  // UI states
  const [activeTab, setActiveTab] = useState<number>(0);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dialog states
  const [showNewProductDialog, setShowNewProductDialog] = useState<boolean>(false);
  const [showNewItemDialog, setShowNewItemDialog] = useState<boolean>(false);
  const [showEditItemDialog, setShowEditItemDialog] = useState<boolean>(false);
  
  // Form states
  const [currentSectionId, setCurrentSectionId] = useState<string>('');
  const [editingItem, setEditingItem] = useState<WorkOrderItem | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Form data
  const [newItemForm, setNewItemForm] = useState<WorkOrderForm>({
      workOrderId: '',
    date: new Date().toISOString().split('T')[0],
    version: '1.0',
      color: '',
      note: '',
    orderQuantity: '1',
      size: '',
    profiles: [{ id: '1', profile: '', measurement: '', quantity: '1' }],
    priority: 'medium'
  });

  // Smart suggestions states
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [profileCombinations, setProfileCombinations] = useState<Array<{
    id: string;
    profiles: Array<{ profile: string; measurement: string; ratio: number }>;
    usageCount: number;
    lastUsed: string;
  }>>([]);
  const [showCombinationDialog, setShowCombinationDialog] = useState<boolean>(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const getCurrentWeekNumber = useCallback((): number => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
  }, []);

  const currentWeekNumber = useMemo(() => getCurrentWeekNumber(), [getCurrentWeekNumber]);

  const autoGeneratedTitle = useMemo(() => 
    `${selectedWeekNumber}. HAFTA KESİM LİSTESİ`, 
    [selectedWeekNumber]
  );

  const cuttingListStats = useMemo((): CuttingListStats | null => {
    if (!cuttingList) return null;
    
    const totalSections = cuttingList.sections.length;
    const totalItems = cuttingList.sections.reduce((total, section) => 
      total + section.items.length, 0
    );
    const totalProfiles = cuttingList.sections.reduce((total, section) => 
      total + section.items.reduce((sum, item) => sum + item.profiles.length, 0), 0
    );
    const completedItems = cuttingList.sections.reduce((total, section) => 
      total + section.items.filter(item => item.status === 'completed').length, 0
    );
    const efficiency = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    const totalQuantity = cuttingList.sections.reduce((total, section) => 
      total + section.items.reduce((sum, item) => 
        sum + item.profiles.reduce((qty, profile) => qty + profile.quantity, 0), 0
      ), 0
    );
    
    return { totalSections, totalItems, totalProfiles, completedItems, efficiency, totalQuantity };
  }, [cuttingList]);

  const isFormValid = useMemo(() => {
    if (!currentSectionId || !cuttingList) return false;
    
    const requiredFields = [
      newItemForm.workOrderId.trim(),
      newItemForm.date.trim(),
      newItemForm.version.trim(),
      newItemForm.color.trim(),
      newItemForm.orderQuantity.trim(),
      newItemForm.size.trim()
    ];

    const hasRequiredFields = requiredFields.every(field => field);
    const hasValidQuantity = !isNaN(parseInt(newItemForm.orderQuantity)) && parseInt(newItemForm.orderQuantity) > 0;
    const hasProfiles = newItemForm.profiles.length > 0;
    const hasValidProfiles = newItemForm.profiles.every(profile => 
      profile.measurement.trim() && 
      profile.quantity.trim() && 
      !isNaN(parseInt(profile.quantity)) && 
      parseInt(profile.quantity) > 0
    );

    return hasRequiredFields && hasValidQuantity && hasProfiles && hasValidProfiles;
  }, [currentSectionId, cuttingList, newItemForm]);

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  const handleError = useCallback((error: unknown, context: string): void => {
    let errorMessage = 'Bilinmeyen hata oluştu';

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      errorMessage = axiosError.response?.data?.error || 
                        axiosError.response?.data?.message || 
                        axiosError.message || 
                        'Ağ hatası';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    setError(errorMessage);
    setLoadingState(LoadingState.ERROR);
    console.error(`Error in ${context}:`, error);
  }, []);

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  const loadCuttingListsFromBackend = useCallback(async (): Promise<void> => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('New request initiated');
    }

    cancelTokenRef.current = axios.CancelToken.source();
    setLoadingState(LoadingState.LOADING);
    
    try {
      const response = await axios.get<ApiResponse<CuttingList[]>>(
        'http://localhost:3001/api/cutting-list',
        { cancelToken: cancelTokenRef.current.token }
      );
      
      if (response.data.success && response.data.data) {
        setCuttingLists(response.data.data);
        setLoadingState(LoadingState.SUCCESS);
        } else {
        throw new Error(response.data.error || 'Veri yüklenemedi');
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        handleError(error, 'loadCuttingLists');
      }
    }
  }, [handleError]);

  const createCuttingList = useCallback(async (): Promise<void> => {
    if (!title.trim()) {
      handleError(new Error('Başlık gereklidir'), 'createCuttingList');
      return;
    }

    setLoadingState(LoadingState.LOADING);
    
    try {
      const response = await axios.post<ApiResponse<CuttingList>>(
        'http://localhost:3001/api/cutting-list',
        { title: title.trim(), weekNumber: selectedWeekNumber }
      );
      
      if (response.data.success && response.data.data) {
        const newCuttingList = response.data.data;
      setCuttingList(newCuttingList);
        await loadCuttingListsFromBackend();
      setTitle('');
        setSuccess(`${selectedWeekNumber}. hafta kesim listesi oluşturuldu`);
      setLoadingState(LoadingState.SUCCESS);
        } else {
        throw new Error(response.data.error || 'Kesim listesi oluşturulamadı');
      }
    } catch (error) {
        handleError(error, 'createCuttingList');
      }
  }, [title, selectedWeekNumber, handleError, loadCuttingListsFromBackend]);

  const addProductSection = useCallback(async (): Promise<void> => {
    if (!productName.trim() || !cuttingList) {
      handleError(new Error('Ürün adı ve kesim listesi gereklidir'), 'addProductSection');
      return;
    }

    setLoadingState(LoadingState.LOADING);
    
    try {
      const response = await axios.post<ApiResponse<ProductSection>>(
        `http://localhost:3001/api/cutting-list/${cuttingList.id}/sections`,
        { productName: productName.trim() }
      );
      
      if (response.data.success && response.data.data) {
      const updatedSections = [...cuttingList.sections, response.data.data];
      setCuttingList({ ...cuttingList, sections: updatedSections });
      setProductName('');
      setShowNewProductDialog(false);
        setSuccess('Ürün bölümü eklendi');
      setLoadingState(LoadingState.SUCCESS);
      } else {
        throw new Error(response.data.error || 'Ürün bölümü eklenemedi');
      }
    } catch (error) {
      handleError(error, 'addProductSection');
    }
  }, [productName, cuttingList, handleError]);

  const addItemToSection = useCallback(async (): Promise<void> => {
    if (!isFormValid || !currentSectionId || !cuttingList) return;

    setLoadingState(LoadingState.LOADING);
    
    try {
      const itemData = {
        workOrderId: newItemForm.workOrderId,
        date: newItemForm.date,
        version: newItemForm.version,
        color: newItemForm.color,
        note: newItemForm.note,
        orderQuantity: parseInt(newItemForm.orderQuantity),
        size: newItemForm.size,
        priority: newItemForm.priority,
        status: 'draft' as const,
        profiles: newItemForm.profiles.map(p => ({
          profile: p.profile,
          measurement: p.measurement,
          quantity: parseInt(p.quantity)
        }))
      };

      const response = await axios.post<ApiResponse<WorkOrderItem>>(
        `http://localhost:3001/api/cutting-list/${cuttingList.id}/sections/${currentSectionId}/items`,
        itemData
      );
      
      if (response.data.success && response.data.data) {
      const updatedSections = cuttingList.sections.map(section => {
        if (section.id === currentSectionId) {
          return { ...section, items: [...section.items, response.data.data!] };
        }
        return section;
      });
      
      setCuttingList({ ...cuttingList, sections: updatedSections });
      resetNewItemForm();
      setShowNewItemDialog(false);
        setSuccess('İş emri eklendi');
      setLoadingState(LoadingState.SUCCESS);
      } else {
        throw new Error(response.data.error || 'İş emri eklenemedi');
      }
    } catch (error) {
      handleError(error, 'addItemToSection');
    }
  }, [isFormValid, currentSectionId, cuttingList, newItemForm, handleError]);

  const updateItemInSection = useCallback(async (): Promise<void> => {
    if (!editingItem || !isFormValid || !currentSectionId || !cuttingList) return;

    setLoadingState(LoadingState.LOADING);
    
    try {
      const itemData = {
        ...editingItem,
        workOrderId: newItemForm.workOrderId,
        date: newItemForm.date,
        version: newItemForm.version,
        color: newItemForm.color,
        note: newItemForm.note,
        orderQuantity: parseInt(newItemForm.orderQuantity),
        size: newItemForm.size,
        priority: newItemForm.priority,
        profiles: newItemForm.profiles.map(p => ({
          id: p.id,
          profile: p.profile,
          measurement: p.measurement,
          quantity: parseInt(p.quantity)
        }))
      };

      const response = await axios.put<ApiResponse<WorkOrderItem>>(
        `http://localhost:3001/api/cutting-list/${cuttingList.id}/sections/${currentSectionId}/items/${editingItem.id}`,
        itemData
      );
      
      if (response.data.success && response.data.data) {
      const updatedSections = cuttingList.sections.map(section => {
        if (section.id === currentSectionId) {
          return {
            ...section,
            items: section.items.map(item =>
              item.id === editingItem.id ? response.data.data! : item
            )
          };
        }
        return section;
      });
      
      setCuttingList({ ...cuttingList, sections: updatedSections });
      resetNewItemForm();
      setEditingItem(null);
      setShowEditItemDialog(false);
        setSuccess('İş emri güncellendi');
      setLoadingState(LoadingState.SUCCESS);
      } else {
        throw new Error(response.data.error || 'İş emri güncellenemedi');
      }
    } catch (error) {
      handleError(error, 'updateItemInSection');
    }
  }, [editingItem, isFormValid, currentSectionId, cuttingList, newItemForm, handleError]);

  const deleteItem = useCallback(async (sectionId: string, itemId: string): Promise<void> => {
    if (!cuttingList) return;

    setLoadingState(LoadingState.LOADING);
    
    try {
      await axios.delete(
        `http://localhost:3001/api/cutting-list/${cuttingList.id}/sections/${sectionId}/items/${itemId}`
      );
      
      const updatedSections = cuttingList.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.filter(item => item.id !== itemId)
          };
        }
        return section;
      });
      
      setCuttingList({ ...cuttingList, sections: updatedSections });
      setSuccess('İş emri silindi');
      setLoadingState(LoadingState.SUCCESS);
    } catch (error) {
      handleError(error, 'deleteItem');
    }
  }, [cuttingList, handleError]);

  const deleteSection = useCallback(async (sectionId: string): Promise<void> => {
    if (!cuttingList) return;

    setLoadingState(LoadingState.LOADING);
    
    try {
      await axios.delete(
        `http://localhost:3001/api/cutting-list/${cuttingList.id}/sections/${sectionId}`
      );
      
      const updatedSections = cuttingList.sections.filter(section => section.id !== sectionId);
      setCuttingList({ ...cuttingList, sections: updatedSections });
      setSuccess('Ürün kategorisi silindi');
      setLoadingState(LoadingState.SUCCESS);
    } catch (error) {
      handleError(error, 'deleteSection');
    }
  }, [cuttingList, handleError]);

  const exportToPDF = useCallback(async (): Promise<void> => {
    if (!cuttingList) return;

    setLoadingState(LoadingState.LOADING);
    
    try {
      const response = await axios.post(
        'http://localhost:3001/api/cutting-list/export/pdf',
        { cuttingList },
        { responseType: 'blob' }
      );
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cuttingList.title.replace(/[^a-zA-Z0-9\s]/g, '')}_${cuttingList.weekNumber}_hafta.pdf`;
      document.body.appendChild(link);
      link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      
      setSuccess('PDF başarıyla indirildi');
      setLoadingState(LoadingState.SUCCESS);
    } catch (error) {
      handleError(error, 'exportToPDF');
    }
  }, [cuttingList, handleError]);

  const exportToExcel = useCallback(async (): Promise<void> => {
    if (!cuttingList) return;

    setLoadingState(LoadingState.LOADING);
    
    try {
      const response = await axios.post(
        'http://localhost:3001/api/cutting-list/export/excel',
        { cuttingList },
        { responseType: 'blob' }
      );
      
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cuttingList.title.replace(/[^a-zA-Z0-9\s]/g, '')}_${cuttingList.weekNumber}_hafta.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess('Excel başarıyla indirildi');
      setLoadingState(LoadingState.SUCCESS);
    } catch (error) {
      handleError(error, 'exportToExcel');
    }
  }, [cuttingList, handleError]);

  // ============================================================================
  // SMART SUGGESTIONS API FUNCTIONS
  // ============================================================================

  const getAvailableSizes = useCallback(async (productName: string): Promise<void> => {
    if (!productName.trim()) {
      setAvailableSizes([]);
      return;
    }

    console.log('🔍 Getting available sizes for product:', productName);
    setIsLoadingSuggestions(true);
    
      try {
        const response = await axios.get<ApiResponse<string[]>>(
        `http://localhost:3001/api/cutting-list/smart-suggestions/sizes?productName=${encodeURIComponent(productName.trim())}`
      );
      
      console.log('📊 Size suggestions response:', response.data);
      
      if (response.data.success && response.data.data) {
        setAvailableSizes(response.data.data);
        console.log('✅ Available sizes set:', response.data.data);
      } else {
        setAvailableSizes([]);
        console.log('❌ No sizes found');
      }
    } catch (error) {
      console.warn('⚠️ Size suggestions could not be loaded:', error);
      setAvailableSizes([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  const getProfileCombinations = useCallback(async (productName: string, size: string): Promise<void> => {
    if (!productName.trim() || !size.trim()) {
      setProfileCombinations([]);
      return;
    }

    setIsLoadingSuggestions(true);
    
    try {
      const response = await axios.get<ApiResponse<Array<{
        id: string;
        profiles: Array<{ profile: string; measurement: string; ratio: number }>;
        usageCount: number;
        lastUsed: string;
      }>>>(
        `http://localhost:3001/api/cutting-list/smart-suggestions/combinations?productName=${encodeURIComponent(productName.trim())}&size=${encodeURIComponent(size.trim())}`
      );
      
      if (response.data.success && response.data.data) {
        setProfileCombinations(response.data.data);
      } else {
        setProfileCombinations([]);
      }
    } catch (error) {
      console.warn('Profile combinations could not be loaded:', error);
      setProfileCombinations([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  const applyProfileCombination = useCallback((combination: {
    id: string;
    profiles: Array<{ profile: string; measurement: string; ratio: number }>;
    usageCount: number;
    lastUsed: string;
  }, orderQuantity: number): void => {
    const newProfiles = combination.profiles.map((profile, index) => ({
      id: (index + 1).toString(),
        profile: profile.profile,
        measurement: profile.measurement,
      quantity: Math.round(orderQuantity * profile.ratio).toString()
      }));

      setNewItemForm(prev => ({
        ...prev,
      profiles: newProfiles
    }));

    setShowCombinationDialog(false);
    setSuccess('Profil kombinasyonu uygulandı');
  }, []);

  // ============================================================================
  // FORM HANDLERS
  // ============================================================================

  const resetNewItemForm = useCallback(() => {
    setNewItemForm({
      workOrderId: '',
      date: new Date().toISOString().split('T')[0],
      version: '1.0',
      color: '',
      note: '',
      orderQuantity: '1',
      size: '',
      profiles: [{ id: '1', profile: '', measurement: '', quantity: '1' }],
      priority: 'medium'
    });
  }, []);

  const handleFormChange = useCallback((field: keyof Omit<WorkOrderForm, 'profiles'>, value: string) => {
    setNewItemForm(prev => ({ ...prev, [field]: value }));
    
    // Smart suggestions triggers
    if (field === 'size' && value.trim()) {
      // Get profile combinations when size is selected
      const currentSection = cuttingList?.sections.find(s => s.id === currentSectionId);
      if (currentSection) {
        getProfileCombinations(currentSection.productName, value);
      }
    }
  }, [cuttingList, currentSectionId, getProfileCombinations]);

  const addProfile = useCallback(() => {
    const newProfileId = (newItemForm.profiles.length + 1).toString();
    setNewItemForm(prev => ({
      ...prev,
      profiles: [...prev.profiles, { 
        id: newProfileId, 
        profile: '', 
        measurement: '', 
        quantity: '1' 
      }]
    }));
  }, [newItemForm.profiles.length]);

  const removeProfile = useCallback((profileId: string) => {
    if (newItemForm.profiles.length > 1) {
      setNewItemForm(prev => ({
        ...prev,
        profiles: prev.profiles.filter(profile => profile.id !== profileId)
      }));
    }
  }, [newItemForm.profiles.length]);

  // Ölçü dönüşümü utility fonksiyonu
  const convertMeasurementToMM = useCallback((input: string): string => {
    if (!input || typeof input !== 'string') return input;
    
    const trimmedInput = input.trim().toUpperCase();
    
    // CM dönüşümü - sadece sayıyı döndür
    if (trimmedInput.includes('CM')) {
      const cmValue = trimmedInput.replace(/[^\d,.]/g, '').replace(',', '.');
      const cmNumber = parseFloat(cmValue);
      if (!isNaN(cmNumber)) {
        const mmValue = Math.round(cmNumber * 10);
        return `${mmValue}`; // Sadece sayı, birim yok
      }
    }
    
    // M dönüşümü - sadece sayıyı döndür
    if (trimmedInput.includes('M') && !trimmedInput.includes('MM')) {
      const mValue = trimmedInput.replace(/[^\d,.]/g, '').replace(',', '.');
      const mNumber = parseFloat(mValue);
      if (!isNaN(mNumber)) {
        const mmValue = Math.round(mNumber * 1000);
        return `${mmValue}`; // Sadece sayı, birim yok
      }
    }
    
    // Zaten MM ise sadece sayıyı al
    if (trimmedInput.includes('MM')) {
      const mmValue = trimmedInput.replace(/[^\d,.]/g, '').replace(',', '.');
      const mmNumber = parseFloat(mmValue);
      if (!isNaN(mmNumber)) {
        return `${Math.round(mmNumber)}`; // Sadece sayı, birim yok
      }
    }
    
    // Sadece sayı ise olduğu gibi döndür
    const numericValue = trimmedInput.replace(/[^\d,.]/g, '').replace(',', '.');
    const numericNumber = parseFloat(numericValue);
    if (!isNaN(numericNumber)) {
      return `${Math.round(numericNumber)}`; // Sadece sayı, birim yok
    }
    
    return input; // Dönüştürülemezse orijinal değeri döndür
  }, []);

  const handleProfileChange = useCallback((profileId: string, field: keyof ProfileFormItem, value: string) => {
    // Ölçü alanı için otomatik dönüşüm
    let processedValue = value;
    if (field === 'measurement') {
      processedValue = convertMeasurementToMM(value);
    }
    
    setNewItemForm(prev => ({
      ...prev,
      profiles: prev.profiles.map(profile => 
        profile.id === profileId ? { ...profile, [field]: processedValue } : profile
      )
    }));
  }, [convertMeasurementToMM]);

  const handleEditItem = useCallback((sectionId: string, item: WorkOrderItem) => {
    setCurrentSectionId(sectionId);
    setEditingItem(item);
    
    // Convert date to YYYY-MM-DD format if needed
    let formattedDate = item.date;
    if (formattedDate && formattedDate.includes('.')) {
      const parts = formattedDate.split('.');
      if (parts.length === 3) {
        formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    
    setNewItemForm({
      workOrderId: item.workOrderId,
      date: formattedDate,
      version: item.version,
      color: item.color,
      note: item.note,
      orderQuantity: item.orderQuantity.toString(),
      size: item.size,
      priority: item.priority || 'medium',
      profiles: item.profiles.map(profile => ({
        id: profile.id,
        profile: profile.profile,
        measurement: profile.measurement,
        quantity: profile.quantity.toString()
      }))
    });
    
    setShowEditItemDialog(true);
  }, []);

  const toggleSectionExpansion = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const copyItemToClipboard = useCallback((item: WorkOrderItem) => {
    const text = `İş Emri: ${item.workOrderId}
Tarih: ${item.date}
Versiyon: ${item.version}
Renk: ${item.color}
Sipariş Adedi: ${item.orderQuantity}
Ebat: ${item.size}
Profiller:
${item.profiles.map(p => `- ${p.profile}: ${p.measurement}mm (${p.quantity} adet)`).join('\n')}`;
    
    navigator.clipboard.writeText(text);
    setSuccess('İş emri panoya kopyalandı');
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    setTitle(autoGeneratedTitle);
  }, [autoGeneratedTitle]);

  useEffect(() => {
    loadCuttingListsFromBackend();
    
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounting');
      }
    };
  }, [loadCuttingListsFromBackend]);

  // Load available sizes when new item dialog opens
  useEffect(() => {
    if (showNewItemDialog && currentSectionId && cuttingList) {
      const currentSection = cuttingList.sections.find(s => s.id === currentSectionId);
      if (currentSection) {
        getAvailableSizes(currentSection.productName);
      }
    }
  }, [showNewItemDialog, currentSectionId, cuttingList, getAvailableSizes]);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderMainContent();
      case 1:
        return renderStatisticsTab();
      case 2:
        return renderSettingsTab();
      default:
        return renderMainContent();
    }
  };

  const renderMainContent = () => {
    if (!cuttingList) {
  return (
        <>
          {renderNewCuttingListSection()}
          {renderCuttingListsGrid()}
        </>
      );
    }
    return renderCuttingListDetails();
  };

  const renderStatisticsTab = () => (
    <StyledCard>
      <CardContent sx={{ p: responsiveSpacing.card }}>
        <Stack spacing={spacing.lg}>
          <Typography variant="h6" sx={{ fontWeight: typography.fontWeight.semibold }}>
            📊 İstatistikler ve Analizler
                  </Typography>
              
              {cuttingListStats && (
            <Grid container spacing={spacing.md}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: spacing.md, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" sx={{ fontWeight: typography.fontWeight.bold }}>
                    {cuttingListStats.totalQuantity}
                    </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toplam Profil Adedi
                    </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: spacing.md, textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: typography.fontWeight.bold }}>
                    {cuttingListStats.completedItems}
                    </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tamamlanan İş Emirleri
                    </Typography>
                </Paper>
              </Grid>
            </Grid>
              )}
            </Stack>
          </CardContent>
    </StyledCard>
  );

  const renderSettingsTab = () => (
    <StyledCard>
      <CardContent sx={{ p: responsiveSpacing.card }}>
        <Stack spacing={spacing.lg}>
          <Typography variant="h6" sx={{ fontWeight: typography.fontWeight.semibold }}>
            ⚙️ Ayarlar ve Konfigürasyon
                </Typography>
          
          <Alert severity="info">
            <AlertTitle>Geliştirilme Aşamasında</AlertTitle>
            Bu bölüm yakında daha fazla özellik ile güncellenecek.
              </Alert>
          </Stack>
      </CardContent>
    </StyledCard>
  );

  const renderNewCuttingListSection = () => (
    <StyledCard sx={{ mb: responsiveSpacing.section }}>
      <CardHeader 
        title="Yeni Kesim Listesi Oluştur"
        subheader="Hafta numarasını seçerek yeni bir kesim listesi oluşturun"
        avatar={
          <Box sx={{ 
            width: 40, 
            height: 40, 
            bgcolor: colors.primary[500], 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AddIcon />
          </Box>
        }
      />
            <CardContent>
        <Grid container spacing={spacing.sm}>
                <Grid item xs={12} md={6}>
            <StyledTextField
                    fullWidth
                    label="Kesim Listesi Başlığı"
                    value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="Otomatik oluşturulur"
              InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
            <StyledTextField
                    fullWidth
                    label="Hafta Numarası"
                    type="number"
                    value={selectedWeekNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setSelectedWeekNumber(parseInt(e.target.value) || currentWeekNumber)
              }
              inputProps={{ min: 1, max: 53 }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
            <StyledButton
                    fullWidth
              size="large"
                    onClick={createCuttingList}
              disabled={loadingState === LoadingState.LOADING || !title.trim()}
              startIcon={loadingState === LoadingState.LOADING ? <CircularProgress size={16} /> : <AddIcon />}
            >
              Oluştur
            </StyledButton>
                </Grid>
              </Grid>
            </CardContent>
    </StyledCard>
  );

  const renderCuttingListsGrid = () => (
    <StyledCard sx={{ mb: responsiveSpacing.section }}>
      <CardHeader 
        title="Mevcut Kesim Listeleri"
        subheader={`${cuttingLists.length} adet kesim listesi bulundu`}
        avatar={
          <Box sx={{ 
            width: 40, 
            height: 40, 
            bgcolor: colors.info[500], 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AssessmentIcon />
              </Box>
        }
      />
                      <CardContent>
        {cuttingLists.length === 0 ? (
          <Alert severity="info">
            <AlertTitle>Henüz kesim listesi yok</AlertTitle>
            Yukarıdan yeni bir liste oluşturarak başlayabilirsiniz.
          </Alert>
        ) : (
          <Grid container spacing={spacing.sm}>
            {cuttingLists.map((list) => (
              <Grid item xs={12} sm={6} md={4} key={list.id}>
                <StyledCard variant="outlined">
                  <CardHeader
                    avatar={
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        bgcolor: list.weekNumber === currentWeekNumber ? colors.primary[500] : colors.neutral[500], 
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                      }}>
                        {list.weekNumber}
                      </Box>
                    }
                    title={list.title}
                    subheader={new Date(list.createdAt).toLocaleDateString('tr-TR')}
                    action={
                      <StyledChip 
                        label={list.weekNumber === currentWeekNumber ? "Aktif" : "Geçmiş"} 
                              size="small" 
                        color={list.weekNumber === currentWeekNumber ? "primary" : "default"}
                            />
                    }
                  />
                  <CardContent>
                          <Typography variant="body2" color="text.secondary">
                      {list.sections.length} ürün • {list.sections.reduce((total, section) => 
                        total + section.items.length, 0)} iş emri
                          </Typography>
                  </CardContent>
                  <CardActions>
                    <StyledButton
                              fullWidth
                      variant="outlined"
                      onClick={() => setCuttingList(list)}
                      startIcon={<AssignmentIcon />}
                    >
                      Görüntüle
                    </StyledButton>
                  </CardActions>
                </StyledCard>
                  </Grid>
                ))}
              </Grid>
        )}
      </CardContent>
    </StyledCard>
  );

  const renderCuttingListDetails = () => {
    if (!cuttingList) return null;

    return (
      <>
        <ActionToolbar
          primaryAction={{
            label: "Yeni Ürün Ekle",
            onClick: () => setShowNewProductDialog(true),
            icon: <AddIcon />
          }}
          secondaryActions={[
            {
              label: "PDF İndir",
              onClick: exportToPDF,
              icon: <PdfIcon />,
              color: "error"
            },
            {
              label: "Excel İndir",
              onClick: exportToExcel,
              icon: <ExcelIcon />,
              color: "success"
            },
            {
              label: "Listele",
              onClick: () => setCuttingList(null),
              icon: <CategoryIcon />
            }
          ]}
          loading={loadingState === LoadingState.LOADING}
        />

        <StyledCard>
          <CardContent sx={{ p: responsiveSpacing.card }}>
            <Stack spacing={spacing.lg}>
              {cuttingList.sections.length === 0 ? (
                <Alert severity="info">
                  <AlertTitle>Henüz ürün bölümü yok</AlertTitle>
                  "Yeni Ürün Ekle" butonunu kullanarak başlayabilirsiniz.
                </Alert>
              ) : (
                cuttingList.sections.map((section) => (
                  <StyledCard 
                    key={section.id} 
                    variant="outlined"
                    sx={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: '2px solid rgba(0,0,0,0.08)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.6) 50%, transparent 100%)',
                        zIndex: 1,
                      },
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.95)',
                        border: '2px solid rgba(59,130,246,0.2)',
                      },
                    }}
                  >
                    <CardHeader
                      avatar={
                        <Box sx={{ 
                          width: 40, 
                          height: 40, 
                          background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 0,
                          boxShadow: '0 3px 8px rgba(255,107,53,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
                          border: '2px solid rgba(255,255,255,0.2)',
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
                            borderRadius: 'inherit',
                          }
                        }}>
                          <CategoryIcon sx={{ fontSize: 20, zIndex: 1 }} />
                        </Box>
                      }
                      title={
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: typography.fontWeight.bold,
                            color: 'rgba(0,0,0,0.9)',
                            fontSize: typography.fontSize.lg,
                            letterSpacing: '0.5px'
                          }}
                        >
                          {section.productName}
                        </Typography>
                      }
                      subheader={
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'rgba(0,0,0,0.7)',
                            fontWeight: typography.fontWeight.medium,
                            mt: 0.5
                          }}
                        >
                          {section.items.length} iş emri
                        </Typography>
                      }
                      action={
                        <Stack direction="row" spacing={spacing.xs}>
                          <Tooltip title="İş Emri Ekle">
                            <IconButton
                              sx={{
                                bgcolor: 'rgba(59,130,246,0.1)',
                                color: colors.primary[700],
                                border: '2px solid rgba(59,130,246,0.2)',
                                borderRadius: 0,
                                width: 36,
                                height: 36,
                                '&:hover': {
                                  bgcolor: colors.primary[500],
                                  color: 'white',
                                  transform: 'scale(1.05)',
                                  boxShadow: '0 3px 8px rgba(59,130,246,0.3)',
                                },
                                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                              }}
                              onClick={() => {
                                setCurrentSectionId(section.id);
                                setShowNewItemDialog(true);
                              }}
                            >
                              <AddIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Kategoriyi Sil">
                            <IconButton
                              sx={{
                                bgcolor: 'rgba(239,68,68,0.1)',
                                color: colors.error[700],
                                border: '2px solid rgba(239,68,68,0.2)',
                                borderRadius: 0,
                                width: 36,
                                height: 36,
                                '&:hover': {
                                  bgcolor: colors.error[500],
                                  color: 'white',
                                  transform: 'scale(1.05)',
                                  boxShadow: '0 3px 8px rgba(239,68,68,0.3)',
                                },
                                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                              }}
                              onClick={() => {
                                if (window.confirm('Bu kategoriyi ve tüm iş emirlerini silmek istediğinizden emin misiniz?')) {
                                  deleteSection(section.id);
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={expandedSections.has(section.id) ? "Daralt" : "Genişlet"}>
                            <IconButton
                              sx={{
                                bgcolor: 'rgba(0,0,0,0.05)',
                                color: 'rgba(0,0,0,0.7)',
                                border: '2px solid rgba(0,0,0,0.1)',
                                borderRadius: 0,
                                width: 36,
                                height: 36,
                                '&:hover': {
                                  bgcolor: 'rgba(0,0,0,0.1)',
                                  color: 'rgba(0,0,0,0.9)',
                                  transform: 'scale(1.05)',
                                  boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
                                },
                                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                              }}
                              onClick={() => toggleSectionExpansion(section.id)}
                            >
                              {expandedSections.has(section.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      }
                    />

                    <Collapse in={expandedSections.has(section.id)}>
                      <CardContent>
                        <Stack spacing={spacing.sm}>
                          {section.items.length === 0 ? (
                            <Alert severity="info">Bu ürün için henüz iş emri eklenmemiş.</Alert>
                          ) : (
                            section.items.map((item) => (
                              <StyledCard key={item.id} variant="outlined" sx={{ bgcolor: colors.neutral[50] }}>
                                <CardContent>
                                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Box flex={1}>
                                      <Stack direction="row" alignItems="center" spacing={spacing.sm} sx={{ mb: spacing.sm }}>
                                        <Box 
                  sx={{ 
                                            bgcolor: item.status === 'completed' ? colors.success[500] : 
                                                     item.status === 'processing' ? colors.warning[500] :
                                                     item.status === 'ready' ? colors.info[500] : colors.neutral[500],
                                            color: 'white',
                                            width: 32,
                                            height: 32,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: `2px solid ${item.status === 'completed' ? colors.success[50] : 
                                                     item.status === 'processing' ? colors.warning[50] :
                                                     item.status === 'ready' ? colors.info[50] : colors.neutral[50]}`
                                          }}
                                        >
                                          {item.status === 'completed' ? <CheckCircleIcon fontSize="small" /> : 
                                           <RadioButtonUncheckedIcon fontSize="small" />}
                                        </Box>
                            <Box>
                                          <Typography variant="subtitle1" sx={{ fontWeight: typography.fontWeight.semibold }}>
                                            İş Emri #{item.workOrderId}
                              </Typography>
                                          <Stack direction="row" spacing={spacing.xs}>
                                            <StyledChip 
                                              label={item.priority === 'urgent' ? '🔴 Acil' : 
                                                     item.priority === 'high' ? '🟠 Yüksek' :
                                                     item.priority === 'medium' ? '🟡 Orta' : '🟢 Düşük'}
                              size="small" 
                                            />
                                            <StyledChip 
                                              label={item.status === 'completed' ? 'Tamamlandı' : 
                                                     item.status === 'processing' ? 'İşlemde' :
                                                     item.status === 'ready' ? 'Hazır' : 'Taslak'}
                              size="small" 
                                              color={item.status === 'completed' ? 'success' : 
                                                     item.status === 'processing' ? 'warning' :
                                                     item.status === 'ready' ? 'info' : 'default'}
                            />
                          </Stack>
                                        </Box>
                                      </Stack>
                                      
                                      <Grid container spacing={spacing.sm} sx={{ mb: spacing.sm }}>
                                        <Grid item xs={6} sm={3}>
                                          <Typography variant="caption" color="text.secondary">Tarih</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: typography.fontWeight.medium }}>
                                            {item.date}
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                          <Typography variant="caption" color="text.secondary">Versiyon</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: typography.fontWeight.medium }}>
                                            {item.version}
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                          <Typography variant="caption" color="text.secondary">Renk</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: typography.fontWeight.medium }}>
                                            {item.color}
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                          <Typography variant="caption" color="text.secondary">Adet</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: typography.fontWeight.medium }}>
                                            {item.orderQuantity}
                                          </Typography>
                                        </Grid>
                                      </Grid>

                                      {item.size && (
                                        <Box sx={{ mb: spacing.sm }}>
                                          <Typography variant="caption" color="text.secondary">Ebat</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: typography.fontWeight.medium }}>
                                            {item.size}
                                          </Typography>
                                        </Box>
                                      )}

                                      {item.note && (
                                        <Box sx={{ mb: spacing.sm }}>
                                          <Typography variant="caption" color="text.secondary">Notlar</Typography>
                                          <Typography variant="body2">{item.note}</Typography>
                                        </Box>
                                      )}
                                      
                                      {item.profiles.length > 0 && (
                                        <Box>
                                          <Typography variant="caption" color="text.secondary" sx={{ mb: spacing.xs, display: 'block' }}>
                                            Profiller ({item.profiles.length} adet)
                                          </Typography>
                                          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200 }}>
                                            <Table size="small">
                                              <TableHead>
                                                <TableRow>
                                                  <TableCell>Profil</TableCell>
                                                  <TableCell align="right">Ölçü (mm)</TableCell>
                                                  <TableCell align="right">Adet</TableCell>
                                                </TableRow>
                                              </TableHead>
                                              <TableBody>
                                            {item.profiles.map((profile, index) => (
                                                  <TableRow key={index}>
                                                    <TableCell>{profile.profile}</TableCell>
                                                    <TableCell align="right">{profile.measurement}</TableCell>
                                                    <TableCell align="right">{profile.quantity}</TableCell>
                                                  </TableRow>
                                                ))}
                                              </TableBody>
                                            </Table>
                                          </TableContainer>
                                        </Box>
                                      )}
                                    </Box>
                                
                                    <Stack spacing={spacing.xs}>
                                      <Tooltip title="Kopyala">
                                        <IconButton 
                                        size="small"
                                          color="info"
                                          onClick={() => copyItemToClipboard(item)}
                                        >
                                          <CopyIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Düzenle">
                                        <IconButton 
                                          size="small" 
                                        color="primary"
                                        onClick={() => handleEditItem(section.id, item)}
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Sil">
                                        <IconButton 
                                        size="small"
                                        color="error"
                                        onClick={() => {
                                          if (window.confirm('Bu iş emrini silmek istediğinizden emin misiniz?')) {
                                            deleteItem(section.id, item.id);
                                          }
                                        }}
                                      >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Stack>
                                  </Stack>
                                </CardContent>
                              </StyledCard>
                            ))
                          )}
                        </Stack>
                      </CardContent>
                    </Collapse>
                  </StyledCard>
                ))
              )}
              </Stack>
            </CardContent>
        </StyledCard>
      </>
    );
  };

  const renderNewProductDialog = () => (
        <Dialog 
          open={showNewProductDialog} 
      onClose={() => setShowNewProductDialog(false)}
      maxWidth="sm"
          fullWidth
          PaperProps={{
        sx: { borderRadius: 0 } // Tamamen keskin köşeler - modern premium görünüm
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={spacing.sm}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            bgcolor: colors.primary[500], 
            color: 'white', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
              <CategoryIcon />
          </Box>
            <Box>
            <Typography variant="h6">Yeni Ürün Kategorisi Ekle</Typography>
            <Typography variant="caption" color="text.secondary">
              Kesim listesine yeni bir ürün kategorisi ekleyin
              </Typography>
            </Box>
        </Stack>
          </DialogTitle>
      <DialogContent>
        <StyledTextField
                    fullWidth
                    label="Ürün Adı"
          value={productName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProductName(e.target.value.toUpperCase())}
          placeholder="Örnek: 100x50x20, L PROFİL"
          sx={{ mt: spacing.sm }}
          autoFocus
        />
          </DialogContent>
      <DialogActions sx={{ p: spacing.md }}>
        <StyledButton variant="outlined" onClick={() => setShowNewProductDialog(false)}>
                İptal
        </StyledButton>
        <StyledButton 
                onClick={addProductSection}
          disabled={loadingState === LoadingState.LOADING || !productName.trim()}
          startIcon={loadingState === LoadingState.LOADING ? <CircularProgress size={16} /> : <AddIcon />}
        >
          Ekle
        </StyledButton>
          </DialogActions>
        </Dialog>
  );

  const renderNewItemDialog = () => (
        <Dialog 
          open={showNewItemDialog} 
          onClose={() => setShowNewItemDialog(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
        sx: { borderRadius: 0 } // Tamamen keskin köşeler - modern premium görünüm
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={spacing.sm}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            bgcolor: colors.info[500], 
            color: 'white', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
              <AssignmentIcon />
          </Box>
            <Box>
            <Typography variant="h6">Yeni İş Emri Ekle</Typography>
            <Typography variant="caption" color="text.secondary">
              Detaylı iş emri bilgilerini girin
              </Typography>
            </Box>
        </Stack>
          </DialogTitle>
      <DialogContent>
        <Stack spacing={spacing.md} sx={{ mt: spacing.sm }}>
          {/* Basic Information */}
          <Paper sx={{ p: spacing.md, bgcolor: colors.neutral[50] }}>
            <Typography variant="subtitle1" sx={{ fontWeight: typography.fontWeight.semibold, mb: spacing.sm }}>
              Temel Bilgiler
                    </Typography>
            <Grid container spacing={spacing.sm}>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                      fullWidth
                      label="İş Emri Numarası"
                      value={newItemForm.workOrderId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange('workOrderId', e.target.value)}
                  placeholder="Örnek: WO-2025-001"
                    />
                  </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                      fullWidth
                  label="Tarih"
                      type="date"
                      value={newItemForm.date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange('date', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
              <Grid item xs={12} sm={4}>
                <StyledTextField
                      fullWidth
                  label="Versiyon"
                      value={newItemForm.version}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange('version', e.target.value)}
                  placeholder="Örnek: v1.0"
                    />
                  </Grid>
              <Grid item xs={12} sm={4}>
                <StyledTextField
                      fullWidth
                  label="Renk"
                      value={newItemForm.color}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange('color', e.target.value)}
                  placeholder="Örnek: KIRMIZI RAL 3020"
                    />
                  </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Öncelik</InputLabel>
                  <Select
                    value={newItemForm.priority}
                    onChange={(e) => handleFormChange('priority', e.target.value)}
                    label="Öncelik"
                  >
                    <MenuItem value="low">🟢 Düşük</MenuItem>
                    <MenuItem value="medium">🟡 Orta</MenuItem>
                    <MenuItem value="high">🟠 Yüksek</MenuItem>
                    <MenuItem value="urgent">🔴 Acil</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                      fullWidth
                      label="Sipariş Adedi"
                      type="number"
                      value={newItemForm.orderQuantity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange('orderQuantity', e.target.value)}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  freeSolo
                  options={availableSizes}
                  value={newItemForm.size}
                  onChange={(_, newValue) => handleFormChange('size', newValue || '')}
                  onInputChange={(_, newInputValue) => handleFormChange('size', newInputValue)}
                  loading={isLoadingSuggestions}
                  renderInput={(params) => (
                    <StyledTextField
                      {...params}
                      fullWidth
                      label="Ürün Ebatı"
                      placeholder="Örnek: 100x50x20mm"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {isLoadingSuggestions ? <CircularProgress color="inherit" size={20} /> : null}
                            <IconButton
                              size="small"
                              onClick={() => {
                                const currentSection = cuttingList?.sections.find(s => s.id === currentSectionId);
                                if (currentSection) {
                                  getAvailableSizes(currentSection.productName);
                                }
                              }}
                      sx={{
                                color: colors.primary[500],
                                '&:hover': { bgcolor: colors.primary[50] }
                              }}
                            >
                              <ExpandMoreIcon />
                            </IconButton>
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                <StyledTextField
                      fullWidth
                  label="Notlar"
                      multiline
                      rows={3}
                  value={newItemForm.note}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange('note', e.target.value)}
                  placeholder="Özel talimatlar, kalite gereksinimleri..."
                    />
                  </Grid>
                </Grid>
          </Paper>

          {/* Profile Details */}
          <Paper sx={{ p: spacing.md, bgcolor: colors.neutral[50] }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: spacing.sm }}>
              <Typography variant="subtitle1" sx={{ fontWeight: typography.fontWeight.semibold }}>
                Profil Detayları ({newItemForm.profiles.length} adet)
                    </Typography>
              <Stack direction="row" spacing={spacing.xs}>
                {profileCombinations.length > 0 && newItemForm.size.trim() && (
                  <StyledButton
                      size="small" 
                        variant="outlined"
                    color="info"
                    onClick={() => setShowCombinationDialog(true)}
                    startIcon={<SpeedIcon />}
                  >
                    Akıllı Öneri
                  </StyledButton>
                )}
                <StyledButton
                      size="small" 
                onClick={addProfile}
                startIcon={<AddIcon />}
              >
                Profil Ekle
              </StyledButton>
                  </Stack>
                </Stack>

            <Stack spacing={spacing.sm}>
                  {newItemForm.profiles.map((profile, index) => (
                <StyledCard key={profile.id} variant="outlined">
                  <CardContent sx={{ p: spacing.sm }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: spacing.sm }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: typography.fontWeight.semibold }}>
                            Profil #{index + 1}
                          </Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeProfile(profile.id)}
                            disabled={newItemForm.profiles.length === 1}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                        
                    <Grid container spacing={spacing.sm}>
                          <Grid item xs={12} md={4}>
                        <StyledTextField
                              fullWidth
                              label="Profil Türü"
                              value={profile.profile}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            handleProfileChange(profile.id, 'profile', e.target.value)
                          }
                          placeholder="Örnek: L Profil"
                        />
                          </Grid>
                          <Grid item xs={12} md={4}>
                        <StyledTextField
                              fullWidth
                          label="Ölçü (mm, cm, m otomatik dönüşüm)"
                              value={profile.measurement}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            handleProfileChange(profile.id, 'measurement', e.target.value)
                          }
                          placeholder="Örnek: 2000, 63,8 CM, 2,5 M"
                          helperText="CM ve M otomatik olarak MM'ye dönüştürülür"
                        />
                          </Grid>
                          <Grid item xs={12} md={4}>
                        <StyledTextField
                              fullWidth
                          label="Adet"
                              type="number"
                              value={profile.quantity}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            handleProfileChange(profile.id, 'quantity', e.target.value)
                          }
                          inputProps={{ min: 1 }}
                        />
                          </Grid>
                        </Grid>
                      </CardContent>
                </StyledCard>
                  ))}
                </Stack>
          </Paper>
        </Stack>
          </DialogContent>
      <DialogActions sx={{ p: spacing.md }}>
        <Stack direction="row" spacing={spacing.sm} justifyContent="space-between" width="100%">
          <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
              <Typography variant="body2" color="text.secondary">
                Form Durumu:
              </Typography>
              {isFormValid ? (
                  <StyledChip label="Hazır" size="small" color="success" />
                ) : (
                  <StyledChip label="Eksik Bilgi" size="small" color="warning" />
                )}
              </Box>
          </Box>
          <Stack direction="row" spacing={spacing.sm}>
            <StyledButton variant="outlined" onClick={() => {
                  setShowNewItemDialog(false);
                  resetNewItemForm();
            }}>
              İptal
            </StyledButton>
            <StyledButton 
                onClick={addItemToSection}
              disabled={!isFormValid || loadingState === LoadingState.LOADING}
              startIcon={loadingState === LoadingState.LOADING ? <CircularProgress size={16} /> : <SaveIcon />}
            >
              Kaydet
            </StyledButton>
          </Stack>
            </Stack>
          </DialogActions>
        </Dialog>
  );

  const renderCombinationDialog = () => (
        <Dialog 
      open={showCombinationDialog} 
      onClose={() => setShowCombinationDialog(false)}
      maxWidth="md"
          fullWidth
          PaperProps={{
        sx: { borderRadius: 0 } // Tamamen keskin köşeler - modern premium görünüm
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={spacing.sm}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            bgcolor: colors.info[500], 
            color: 'white', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <SpeedIcon />
          </Box>
            <Box>
            <Typography variant="h6">Akıllı Profil Önerileri</Typography>
            <Typography variant="caption" color="text.secondary">
              Geçmiş verilerden profil kombinasyonlarını seçin
              </Typography>
            </Box>
        </Stack>
          </DialogTitle>
      
      <DialogContent>
        <Stack spacing={spacing.md} sx={{ mt: spacing.sm }}>
          {profileCombinations.length === 0 ? (
            <Alert severity="info">
              <AlertTitle>Öneri Bulunamadı</AlertTitle>
              Bu ürün ve ebat için henüz geçmiş veri bulunmuyor.
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary">
                Sipariş Adedi: <strong>{newItemForm.orderQuantity}</strong> adet için önerilen kombinasyonlar:
              </Typography>
              
              <Stack spacing={spacing.sm}>
                {profileCombinations.map((combination, index) => (
                  <StyledCard key={combination.id} variant="outlined">
                    <CardContent sx={{ p: spacing.sm }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box flex={1}>
                          <Stack direction="row" alignItems="center" spacing={spacing.sm} sx={{ mb: spacing.sm }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: typography.fontWeight.semibold }}>
                              Kombinasyon #{index + 1}
                    </Typography>
                            <StyledChip 
                              label={`${combination.usageCount} kez kullanıldı`}
                              size="small"
                              color="info"
                            />
                          </Stack>
                          
                          <Typography variant="caption" color="text.secondary" sx={{ mb: spacing.sm, display: 'block' }}>
                            Son kullanım: {new Date(combination.lastUsed).toLocaleDateString('tr-TR')}
                      </Typography>
                          
                          <Stack spacing={spacing.xs}>
                            {combination.profiles.map((profile, profileIndex) => {
                              const calculatedQuantity = Math.round(parseInt(newItemForm.orderQuantity) * profile.ratio);
                              return (
                                <Box key={profileIndex} sx={{ 
                                  p: spacing.sm, 
                                  bgcolor: colors.neutral[50], 
                                  borderRadius: borderRadius.sm,
                                  border: `1px solid ${colors.neutral[100]}`
                                }}>
                                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                      <Typography variant="body2" sx={{ fontWeight: typography.fontWeight.medium }}>
                                        {profile.profile}
                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {profile.measurement}mm
                      </Typography>
                                    </Box>
                                    <Box textAlign="right">
                                      <Typography variant="body2" sx={{ fontWeight: typography.fontWeight.bold }}>
                                        {calculatedQuantity} adet
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        (×{profile.ratio})
                                      </Typography>
                                    </Box>
                                  </Stack>
                                </Box>
                              );
                            })}
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
                    
                    <CardActions sx={{ p: spacing.sm, pt: 0 }}>
                      <StyledButton
                        fullWidth
                        variant="contained"
                        onClick={() => applyProfileCombination(combination, parseInt(newItemForm.orderQuantity))}
                        startIcon={<CheckIcon />}
                      >
                        Bu Kombinasyonu Uygula
                      </StyledButton>
                    </CardActions>
                  </StyledCard>
                ))}
              </Stack>
            </>
          )}
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ p: spacing.md }}>
        <StyledButton variant="outlined" onClick={() => setShowCombinationDialog(false)}>
          İptal
        </StyledButton>
      </DialogActions>
    </Dialog>
  );

  const renderEditItemDialog = () => (
        <Dialog 
          open={showEditItemDialog} 
          onClose={() => setShowEditItemDialog(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
        sx: { borderRadius: 0 } // Tamamen keskin köşeler - modern premium görünüm
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={spacing.sm}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            bgcolor: colors.warning[500], 
            color: 'white', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
              <EditIcon />
          </Box>
            <Box>
            <Typography variant="h6">İş Emri Düzenle</Typography>
            <Typography variant="caption" color="text.secondary">
              İş emri bilgilerini güncelleyin
              </Typography>
            </Box>
                    </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={spacing.md} sx={{ mt: spacing.sm }}>
          {/* Same form as new item dialog but with update functionality */}
          <Paper sx={{ p: spacing.md, bgcolor: colors.neutral[50] }}>
            <Typography variant="subtitle1" sx={{ fontWeight: typography.fontWeight.semibold, mb: spacing.sm }}>
                  Temel Bilgiler
                </Typography>
            <Grid container spacing={spacing.sm}>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                      fullWidth
                      label="İş Emri Numarası"
                      value={newItemForm.workOrderId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange('workOrderId', e.target.value)}
                    />
                  </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                      fullWidth
                  label="Tarih"
                      type="date"
                      value={newItemForm.date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange('date', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
              <Grid item xs={12} sm={4}>
                <StyledTextField
                      fullWidth
                  label="Versiyon"
                      value={newItemForm.version}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange('version', e.target.value)}
                    />
                  </Grid>
              <Grid item xs={12} sm={4}>
                <StyledTextField
                      fullWidth
                  label="Renk"
                      value={newItemForm.color}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange('color', e.target.value)}
                    />
                  </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Öncelik</InputLabel>
                  <Select
                    value={newItemForm.priority}
                    onChange={(e) => handleFormChange('priority', e.target.value)}
                    label="Öncelik"
                  >
                    <MenuItem value="low">🟢 Düşük</MenuItem>
                    <MenuItem value="medium">🟡 Orta</MenuItem>
                    <MenuItem value="high">🟠 Yüksek</MenuItem>
                    <MenuItem value="urgent">🔴 Acil</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                      fullWidth
                      label="Sipariş Adedi"
                      type="number"
                      value={newItemForm.orderQuantity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange('orderQuantity', e.target.value)}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  freeSolo
                  options={availableSizes}
                  value={newItemForm.size}
                  onChange={(_, newValue) => handleFormChange('size', newValue || '')}
                  onInputChange={(_, newInputValue) => handleFormChange('size', newInputValue)}
                  loading={isLoadingSuggestions}
                  renderInput={(params) => (
                    <StyledTextField
                      {...params}
                      fullWidth
                      label="Ürün Ebatı"
                      placeholder="Örnek: 100x50x20mm"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {isLoadingSuggestions ? <CircularProgress color="inherit" size={20} /> : null}
                            <IconButton
                              size="small"
                              onClick={() => {
                                const currentSection = cuttingList?.sections.find(s => s.id === currentSectionId);
                                if (currentSection) {
                                  getAvailableSizes(currentSection.productName);
                                }
                              }}
                              sx={{ 
                                color: colors.primary[500],
                                '&:hover': { bgcolor: colors.primary[50] }
                              }}
                            >
                              <ExpandMoreIcon />
                            </IconButton>
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                <StyledTextField
                      fullWidth
                  label="Notlar"
                      multiline
                      rows={3}
                  value={newItemForm.note}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange('note', e.target.value)}
                    />
                  </Grid>
                </Grid>
          </Paper>

          {/* Profile Details - Same as new item dialog */}
          <Paper sx={{ p: spacing.md, bgcolor: colors.neutral[50] }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: spacing.sm }}>
              <Typography variant="subtitle1" sx={{ fontWeight: typography.fontWeight.semibold }}>
                Profil Detayları ({newItemForm.profiles.length} adet)
                      </Typography>
              <StyledButton
                      size="small" 
                onClick={addProfile}
                startIcon={<AddIcon />}
              >
                Profil Ekle
              </StyledButton>
                </Stack>

            <Stack spacing={spacing.sm}>
                  {newItemForm.profiles.map((profile, index) => (
                <StyledCard key={profile.id} variant="outlined">
                  <CardContent sx={{ p: spacing.sm }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: spacing.sm }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: typography.fontWeight.semibold }}>
                            Profil #{index + 1}
                          </Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeProfile(profile.id)}
                            disabled={newItemForm.profiles.length === 1}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                        
                    <Grid container spacing={spacing.sm}>
                          <Grid item xs={12} md={4}>
                        <StyledTextField
                              fullWidth
                              label="Profil Türü"
                              value={profile.profile}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            handleProfileChange(profile.id, 'profile', e.target.value)
                          }
                        />
                          </Grid>
                          <Grid item xs={12} md={4}>
                        <StyledTextField
                              fullWidth
                          label="Ölçü (mm, cm, m otomatik dönüşüm)"
                              value={profile.measurement}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            handleProfileChange(profile.id, 'measurement', e.target.value)
                          }
                          placeholder="Örnek: 2000, 63,8 CM, 2,5 M"
                          helperText="CM ve M otomatik olarak MM'ye dönüştürülür"
                        />
                          </Grid>
                          <Grid item xs={12} md={4}>
                        <StyledTextField
                              fullWidth
                          label="Adet"
                              type="number"
                              value={profile.quantity}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            handleProfileChange(profile.id, 'quantity', e.target.value)
                          }
                              inputProps={{ min: 1 }}
                        />
                          </Grid>
                        </Grid>
                      </CardContent>
                </StyledCard>
                  ))}
                </Stack>
          </Paper>
        </Stack>
          </DialogContent>
      <DialogActions sx={{ p: spacing.md }}>
        <Stack direction="row" spacing={spacing.sm} justifyContent="space-between" width="100%">
          <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
              <Typography variant="body2" color="text.secondary">
                Form Durumu:
              </Typography>
              {isFormValid ? (
                <StyledChip label="Hazır" size="small" color="success" />
              ) : (
                <StyledChip label="Eksik Bilgi" size="small" color="warning" />
              )}
            </Box>
          </Box>
          <Stack direction="row" spacing={spacing.sm}>
            <StyledButton variant="outlined" onClick={() => {
                  setShowEditItemDialog(false);
                  setEditingItem(null);
                  resetNewItemForm();
            }}>
              İptal
            </StyledButton>
            <StyledButton 
                onClick={updateItemInSection}
              disabled={!isFormValid || loadingState === LoadingState.LOADING}
              startIcon={loadingState === LoadingState.LOADING ? <CircularProgress size={16} /> : <SaveIcon />}
            >
              Güncelle
            </StyledButton>
          </Stack>
            </Stack>
          </DialogActions>
        </Dialog>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

    return (
    <Container maxWidth="xl" sx={{ py: responsiveSpacing.page }}>
      {/* Loading Indicator */}
      {loadingState === LoadingState.LOADING && (
        <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: zIndex.banner }} />
      )}

      {/* Header */}
      <PageHeader
        title="Kesim Listesi Yönetimi"
        subtitle="Profesyonel İş Emri Oluşturma ve Yönetim Sistemi"
        stats={cuttingListStats || undefined}
        actions={
          cuttingList && (
            <Stack direction="row" spacing={spacing.xs}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={loadCuttingListsFromBackend}
                disabled={loadingState === LoadingState.LOADING}
                sx={{ 
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: borderRadius.sm,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&:disabled': {
                    color: 'rgba(255, 255, 255, 0.5)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                Yenile
              </Button>
            </Stack>
          )
        }
      />

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: responsiveSpacing.section }} onClose={() => setError(null)}>
          <AlertTitle>Hata Oluştu</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Tab Navigation */}
      {cuttingList && (
        <StyledCard sx={{ mb: responsiveSpacing.section }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
                sx={{ 
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                  textTransform: 'none',
                fontWeight: typography.fontWeight.medium,
                fontSize: typography.fontSize.sm,
              }
            }}
          >
            <Tab 
              icon={<AssignmentIcon />} 
              label="İş Emirleri" 
              iconPosition="start"
            />
            <Tab 
              icon={<AssessmentIcon />} 
              label="İstatistikler" 
              iconPosition="start"
            />
            <Tab 
              icon={<SettingsIcon />} 
              label="Ayarlar" 
              iconPosition="start"
            />
          </Tabs>
        </StyledCard>
      )}

      {/* Main Content */}
      {renderTabContent()}

      {/* Dialogs */}
      {renderNewProductDialog()}
      {renderNewItemDialog()}
      {renderEditItemDialog()}
      {renderCombinationDialog()}

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};