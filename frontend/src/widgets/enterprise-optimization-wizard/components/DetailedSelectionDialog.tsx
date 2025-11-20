/**
 * @fileoverview Detailed Selection Dialog - Hierarchical Product/WorkOrder/Profile Selection
 * @module DetailedSelectionDialog
 * @version 1.0.0
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Checkbox,
  Chip,
  Stack,
  Divider,
  Paper,
  Collapse,
  Tooltip,
  Alert,
  LinearProgress,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  FormControlLabel,
  Switch,
  TextField,
  InputAdornment,
  MenuItem,
  InputLabel,
  Select,
  alpha,
} from "@mui/material";
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  Assignment as AssignmentIcon,
  Category as CategoryIcon,
  Straighten as RulerIcon,
  ProductionQuantityLimits as QuantityIcon,
  Info as InfoIcon,
  Palette as ColorIcon,
  DateRange as DateIcon,
  Build as BuildIcon,
  ContentCopy as CopyIcon,
  SelectAll as SelectAllIcon,
  Deselect as DeselectIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  PlayArrow as PlayIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";

import {
  ProductSelection,
  WorkOrderSelection,
  ProfileSelection,
  SelectionState,
  ProductSection,
  WorkOrderItem,
  ProfileItem,
  CuttingListData,
  CuttingListSection,
  CuttingListItem,
  ProfileSelectionMap,
} from "../types";
import {
  useActiveProfiles,
  ProfileManagementApi,
} from "@/entities/profile-management/api/profileManagementApi";
import { getCurrentISOWeek } from "@/shared/lib/dateUtils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDesignSystem, useAdaptiveUIContext } from "@/shared/hooks";

interface DetailedSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  cuttingList: CuttingListData;
  onConfirm: (
    selectedItems: Array<{
      productId: string;
      productName: string;
      workOrderId: string;
      workOrderItem: WorkOrderItem;
      profileId: string;
      profile: string;
      measurement: string;
      quantity: number;
    }>,
    selectedProfiles: ProfileSelectionMap,
  ) => void;
  loading?: boolean;
}

/**
 * Detailed Selection Dialog Component
 *
 * Features:
 * - Hierarchical selection: Product > WorkOrder > Profile
 * - Multi-level selection with checkboxes
 * - Real-time statistics and preview
 * - Expandable/collapsible sections
 * - Bulk selection operations
 * - Visual feedback and progress indicators
 */
export const DetailedSelectionDialog: React.FC<
  DetailedSelectionDialogProps
> = ({ open, onClose, cuttingList, onConfirm, loading = false }) => {
  const ds = useDesignSystem();
  const { device, tokens } = useAdaptiveUIContext();

  // Selection state management (products only - totals calculated by useMemo)
  const [selectionState, setSelectionState] = useState<SelectionState>({
    products: {},
    totalSelectedProfiles: 0, // Calculated by useMemo
    totalSelectedQuantity: 0, // Calculated by useMemo
  });

  const [showStatistics, setShowStatistics] = useState(true);
  const [bulkSelectMode, setBulkSelectMode] = useState<"all" | "none" | null>(
    null,
  );

  // Profile selection state
  const [selectedProfiles, setSelectedProfiles] = useState<ProfileSelectionMap>(
    {},
  );

  // Work order profiles dialog state
  const [workOrderProfilesDialog, setWorkOrderProfilesDialog] = useState<{
    open: boolean;
    productId: string;
    workOrder: WorkOrderSelection | null;
  }>({
    open: false,
    productId: "",
    workOrder: null,
  });

  const queryClient = useQueryClient();

  // Fetch current week/year for mappings
  const { week, year } = getCurrentISOWeek();

  // Fetch active profiles for dropdowns
  const {
    data: activeProfiles,
    isLoading: profilesLoading,
    refetch: refetchActiveProfiles,
  } = useActiveProfiles();

  // Fetch mappings for current week/year
  const {
    data: mappings,
    isLoading: mappingsLoading,
    refetch: refetchMappings,
  } = useQuery({
    queryKey: ["workOrderProfileMappings", week, year],
    queryFn: () =>
      ProfileManagementApi.getWorkOrderProfileMappings({
        weekNumber: week,
        year,
      }),
    enabled: open,
    staleTime: 0, // Always fetch fresh data when dialog opens
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Refresh data when dialog opens - use ref to prevent stale closures
  const weekRef = React.useRef(week);
  const yearRef = React.useRef(year);
  weekRef.current = week;
  yearRef.current = year;

  useEffect(() => {
    if (open) {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: ["profile-management", "active"],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "workOrderProfileMappings",
          weekRef.current,
          yearRef.current,
        ],
      });
      refetchActiveProfiles();
      refetchMappings();
    }
  }, [open, queryClient, refetchActiveProfiles, refetchMappings]);

  // Initialize selection state from cutting list data
  useEffect(() => {
    if (open && cuttingList?.sections) {
      const initialProducts: Record<string, ProductSelection> = {};

      cuttingList.sections.forEach((section: CuttingListSection) => {
        const workOrders: WorkOrderSelection[] = section.items.map(
          (item: CuttingListItem) => {
            // Convert CuttingListItem to WorkOrderItem format
            const workOrderItem: WorkOrderItem = {
              id: item.id || `item-${Date.now()}`,
              workOrderId: item.workOrderId || "Bilinmeyen İş Emri",
              date: new Date().toISOString().split("T")[0],
              version: item.version || "V1.0",
              color: item.color || "Bilinmeyen Renk",
              orderQuantity: item.orderQuantity || 0,
              size: item.size || "Bilinmeyen Ebat",
              profiles:
                item.profiles?.map((profile) => ({
                  id: profile.id || `${item.id}-${profile.profile}`,
                  profile: profile.profile || "Bilinmeyen Profil",
                  measurement: profile.measurement || "0",
                  quantity: profile.quantity || 0,
                })) || [],
            };

            return {
              workOrderId: item.workOrderId,
              workOrderItem: workOrderItem,
              profiles: Array.isArray(workOrderItem.profiles)
                ? workOrderItem.profiles.map((profile: ProfileItem) => ({
                    profileId: profile.id,
                    profile: profile.profile,
                    measurement: profile.measurement,
                    quantity: profile.quantity,
                    selected: false,
                  }))
                : [],
              selected: false,
              expanded: false,
            };
          },
        );

        initialProducts[section.id] = {
          productId: section.id,
          productName: section.productName || section.name || "Bilinmeyen Ürün",
          workOrders,
          selected: false,
          expanded: true,
        };
      });

      setSelectionState({
        products: initialProducts,
        totalSelectedProfiles: 0,
        totalSelectedQuantity: 0,
      });
    }
  }, [cuttingList?.sections, open]); // Only depend on sections and open

  // Calculate statistics - memoized to prevent unnecessary recalculations
  const statistics = useMemo(() => {
    const products = Object.values(selectionState.products);
    if (products.length === 0) {
      return {
        totalProducts: 0,
        selectedProducts: 0,
        totalWorkOrders: 0,
        selectedWorkOrders: 0,
        totalProfiles: 0,
        selectedProfiles: 0,
        totalQuantity: 0,
        selectedQuantity: 0,
      };
    }

    let totalProfiles = 0;
    let totalQuantity = 0;
    let selectedProducts = 0;
    let selectedWorkOrders = 0;
    let selectedProfiles = 0;
    let selectedQuantity = 0;

    for (const product of products) {
      if (product.selected) selectedProducts++;

      for (const workOrder of product.workOrders) {
        if (workOrder.selected) selectedWorkOrders++;

        if (Array.isArray(workOrder.profiles)) {
          for (const profile of workOrder.profiles) {
            totalProfiles++;
            totalQuantity += profile.quantity;

            if (profile.selected) {
              selectedProfiles++;
              selectedQuantity += profile.quantity;
            }
          }
        }
      }
    }

    return {
      totalProducts: products.length,
      selectedProducts,
      totalWorkOrders: products.reduce(
        (sum, p) => sum + p.workOrders.length,
        0,
      ),
      selectedWorkOrders,
      totalProfiles,
      selectedProfiles,
      totalQuantity,
      selectedQuantity,
    };
  }, [selectionState.products]); // Only depend on products object

  // Extract unique profile types from selection
  const uniqueProfileTypes = useMemo(() => {
    const types = new Set<string>();
    Object.values(selectionState.products).forEach((product) => {
      product.workOrders.forEach((wo) => {
        wo.profiles.forEach((profile) => {
          if (profile.profile) types.add(profile.profile);
        });
      });
    });
    return Array.from(types);
  }, [selectionState.products]); // Only depend on products

  // Build mapping of profileType -> profileIds
  const profileTypeToProfileIds = useMemo(() => {
    const map = new Map<string, string[]>();
    if (mappings) {
      mappings.forEach((mapping) => {
        const existing = map.get(mapping.profileType) || [];
        if (!existing.includes(mapping.profileId)) {
          existing.push(mapping.profileId);
        }
        map.set(mapping.profileType, existing);
      });
    }
    return map;
  }, [mappings]);

  // Selection handlers
  const handleProductToggle = useCallback((productId: string) => {
    setSelectionState((prev) => {
      const product = prev.products[productId];
      if (!product) {
        return prev;
      }

      const newSelected = !product.selected;

      // ✅ FIX: Create completely new nested objects
      const updatedWorkOrders = product.workOrders.map((workOrder) => ({
        ...workOrder, // New workOrder object
        selected: newSelected,
        profiles: Array.isArray(workOrder.profiles)
          ? workOrder.profiles.map((profile) => ({
              ...profile, // New profile object
              selected: newSelected,
            }))
          : [],
      }));

      const newState = {
        ...prev,
        products: {
          ...prev.products,
          [productId]: {
            ...product, // New product object
            selected: newSelected,
            workOrders: updatedWorkOrders, // New workOrders array
          },
        },
      };

      const totalProfiles = updatedWorkOrders.reduce(
        (sum, wo) => sum + wo.profiles.length,
        0,
      );
      const selectedProfiles = updatedWorkOrders.reduce(
        (sum, wo) => sum + wo.profiles.filter((p) => p.selected).length,
        0,
      );

      return newState;
    });
  }, []);

  const handleProductExpand = useCallback((productId: string) => {
    setSelectionState((prev) => ({
      ...prev,
      products: {
        ...prev.products,
        [productId]: {
          ...prev.products[productId],
          expanded: !prev.products[productId].expanded,
        },
      },
    }));
  }, []);

  const handleWorkOrderToggle = useCallback(
    (productId: string, workOrderId: string) => {
      setSelectionState((prev) => {
        const product = prev.products[productId];
        if (!product) {
          return prev;
        }

        const workOrderIndex = product.workOrders.findIndex(
          (w) => w.workOrderId === workOrderId,
        );
        if (workOrderIndex === -1) {
          return prev;
        }

        const workOrder = product.workOrders[workOrderIndex];
        const newSelected = !workOrder.selected;

        // ✅ FIX: Create completely new profile array with new objects
        const updatedProfiles = Array.isArray(workOrder.profiles)
          ? workOrder.profiles.map((profile) => ({
              ...profile, // Create new profile object
              selected: newSelected,
            }))
          : [];

        // ✅ FIX: Create completely new workOrder object
        const updatedWorkOrder = {
          ...workOrder,
          selected: newSelected,
          profiles: updatedProfiles, // New profiles array
        };

        // ✅ FIX: Create new workOrders array
        const updatedWorkOrders = [...product.workOrders];
        updatedWorkOrders[workOrderIndex] = updatedWorkOrder;

        // Check if all work orders are selected
        const allWorkOrdersSelected = updatedWorkOrders.every(
          (w) => w.selected,
        );

        const newState = {
          ...prev,
          products: {
            ...prev.products,
            [productId]: {
              ...product,
              selected: allWorkOrdersSelected,
              workOrders: updatedWorkOrders, // New workOrders array
            },
          },
        };

        return newState;
      });
    },
    [],
  );

  const handleProfileToggle = useCallback(
    (productId: string, workOrderId: string, profileId: string) => {
      setSelectionState((prev) => {
        const product = prev.products[productId];
        if (!product) {
          return prev;
        }

        const workOrderIndex = product.workOrders.findIndex(
          (w) => w.workOrderId === workOrderId,
        );
        if (workOrderIndex === -1) {
          return prev;
        }

        const workOrder = product.workOrders[workOrderIndex];
        if (!Array.isArray(workOrder.profiles)) {
          return prev;
        }

        const profileIndex = workOrder.profiles.findIndex(
          (p) => p.profileId === profileId,
        );
        if (profileIndex === -1) {
          return prev;
        }

        const profile = workOrder.profiles[profileIndex];
        const newSelected = !profile.selected;

        // ✅ FIX: Create completely new nested objects for immutability
        const updatedProfile = {
          ...profile,
          selected: newSelected,
        };

        const updatedProfiles = [...workOrder.profiles];
        updatedProfiles[profileIndex] = updatedProfile;

        // Check if all profiles in work order are selected
        const allProfilesSelected = updatedProfiles.every((p) => p.selected);

        const updatedWorkOrder = {
          ...workOrder,
          selected: allProfilesSelected,
          profiles: updatedProfiles,
        };

        const updatedWorkOrders = [...product.workOrders];
        updatedWorkOrders[workOrderIndex] = updatedWorkOrder;

        // Check if all work orders in product are selected
        const allWorkOrdersSelected = updatedWorkOrders.every(
          (w) => w.selected,
        );

        const newState = {
          ...prev,
          products: {
            ...prev.products,
            [productId]: {
              ...product,
              selected: allWorkOrdersSelected,
              workOrders: updatedWorkOrders,
            },
          },
        };

        return newState;
      });
    },
    [],
  );

  // Bulk selection handlers
  const handleSelectAll = useCallback(() => {
    setSelectionState((prev) => ({
      ...prev,
      products: Object.fromEntries(
        Object.entries(prev.products).map(([productId, product]) => [
          productId,
          {
            ...product,
            selected: true,
            workOrders: product.workOrders.map((workOrder) => ({
              ...workOrder,
              selected: true,
              profiles: Array.isArray(workOrder.profiles)
                ? workOrder.profiles.map((profile) => ({
                    ...profile,
                    selected: true,
                  }))
                : [],
            })),
          },
        ]),
      ),
    }));
  }, []);

  const handleSelectNone = useCallback(() => {
    setSelectionState((prev) => ({
      ...prev,
      products: Object.fromEntries(
        Object.entries(prev.products).map(([productId, product]) => [
          productId,
          {
            ...product,
            selected: false,
            workOrders: product.workOrders.map((workOrder) => ({
              ...workOrder,
              selected: false,
              profiles: Array.isArray(workOrder.profiles)
                ? workOrder.profiles.map((profile) => ({
                    ...profile,
                    selected: false,
                  }))
                : [],
            })),
          },
        ]),
      ),
    }));
  }, []);

  // Confirm selection
  const handleConfirm = useCallback(() => {
    const selectedItems: Array<{
      productId: string;
      productName: string;
      workOrderId: string;
      workOrderItem: WorkOrderItem;
      profileId: string;
      profile: string;
      measurement: string;
      quantity: number;
    }> = [];

    // Don't require product.selected to be true (user might select only some work orders)
    Object.values(selectionState.products).forEach((product) => {
      product.workOrders.forEach((workOrder) => {
        if (workOrder.selected && Array.isArray(workOrder.profiles)) {
          workOrder.profiles.forEach((profile) => {
            if (profile.selected) {
              selectedItems.push({
                productId: product.productId,
                productName: product.productName,
                workOrderId: workOrder.workOrderId,
                workOrderItem: workOrder.workOrderItem,
                profileId: profile.profileId,
                profile: profile.profile,
                measurement: profile.measurement,
                quantity: profile.quantity,
              });
            }
          });
        }
      });
    });

    onConfirm(selectedItems, selectedProfiles);
  }, [selectionState.products, selectedProfiles, onConfirm]);

  // Profile selection handler
  const handleProfileSelect = (
    profileType: string,
    profile: ProfileSelectionMap[string],
  ) => {
    setSelectedProfiles((prev) => ({
      ...prev,
      [profileType]: profile,
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={
        device.uiMode === "kiosk"
          ? "xl"
          : device.uiMode === "dense"
            ? "lg"
            : "lg"
      }
      fullWidth
      PaperProps={{
        sx: {
          background: ds.colors.background.paper,
          borderRadius: `${tokens.borderRadius.xl}px`,
          border: `1px solid ${ds.colors.neutral[200]}`,
          boxShadow: ds.shadows.soft["3xl"],
          maxHeight: "90vh",
          minHeight: {
            xs: "85vh",
            md: "80vh",
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: ds.gradients.primary,
          color: ds.colors.primary.contrast,
          fontWeight: ds.typography.fontWeight.bold,
          fontSize: {
            xs: `${tokens.typography.lg}px`,
            md: `${tokens.typography.xl}px`,
          },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: {
            xs: tokens.spacing.md,
            md: tokens.spacing.lg,
          },
          px: {
            xs: tokens.spacing.md,
            md: tokens.spacing.lg,
          },
          borderBottom: `2px solid ${alpha(ds.colors.primary.dark, 0.3)}`,
          boxShadow: `0 2px 8px ${alpha(ds.colors.primary.main, 0.2)}`,
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: tokens.spacing.md }}
        >
          <Box
            sx={{
              width: {
                xs: tokens.components.icon.lg,
                md: tokens.components.icon.xl,
              },
              height: {
                xs: tokens.components.icon.lg,
                md: tokens.components.icon.xl,
              },
              borderRadius: `${tokens.borderRadius.md}px`,
              background: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: ds.shadows.soft.md,
            }}
          >
            <CategoryIcon
              sx={{
                fontSize: {
                  xs: tokens.components.icon.md,
                  md: tokens.components.icon.lg,
                },
                color: "white",
              }}
            />
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: ds.typography.fontWeight.bold,
                fontSize: {
                  xs: `${tokens.typography.lg}px`,
                  md: `${tokens.typography.xl}px`,
                },
                mb: tokens.spacing.xs,
              }}
            >
              Detaylı Seçim
            </Typography>
            <Typography
              sx={{
                opacity: 0.9,
                fontWeight: ds.typography.fontWeight.medium,
                fontSize: {
                  xs: `${tokens.typography.sm}px`,
                  md: `${tokens.typography.base}px`,
                },
              }}
            >
              {cuttingList?.title} - Ürün, İş Emri ve Profil Seçimi
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: "white",
            background: "rgba(255, 255, 255, 0.1)",
            minWidth: device.isTouch
              ? tokens.components.minTouchTarget
              : undefined,
            minHeight: device.isTouch
              ? tokens.components.minTouchTarget
              : undefined,
            "&:hover": !device.isTouch
              ? {
                  background: "rgba(255, 255, 255, 0.2)",
                }
              : {},
          }}
        >
          <CloseIcon sx={{ fontSize: tokens.components.icon.md }} />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: 0 }}>
        {/* Statistics Panel */}
        {showStatistics && (
          <Box
            sx={{
              p: {
                xs: tokens.spacing.md,
                md: tokens.spacing.lg,
              },
              background: `linear-gradient(135deg, ${alpha(ds.colors.primary.main, 0.05)} 0%, ${alpha(ds.colors.secondary.main, 0.08)} 100%)`,
              borderBottom: `2px solid ${ds.colors.neutral[200]}`,
              boxShadow: `inset 0 -1px 0 ${alpha(ds.colors.neutral[300], 0.5)}`,
            }}
          >
            <Grid container spacing={tokens.layout.gridGap}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: tokens.spacing.md,
                    textAlign: "center",
                    background: `linear-gradient(135deg, ${alpha(ds.colors.primary.main, 0.1)} 0%, ${alpha(ds.colors.primary[600], 0.15)} 100%)`,
                    border: `2px solid ${alpha(ds.colors.primary.main, 0.3)}`,
                    borderRadius: `${tokens.borderRadius.md}px`,
                    boxShadow: `0 2px 8px ${alpha(ds.colors.primary.main, 0.15)}`,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: `0 4px 12px ${alpha(ds.colors.primary.main, 0.25)}`,
                      borderColor: alpha(ds.colors.primary.main, 0.4),
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: ds.typography.fontWeight.extrabold,
                      color: ds.colors.primary[700],
                      fontSize: {
                        xs: `${tokens.typography.xl}px`,
                        md: `${tokens.typography.xxl}px`,
                      },
                      mb: tokens.spacing.xs,
                    }}
                  >
                    {statistics.selectedProducts}/{statistics.totalProducts}
                  </Typography>
                  <Typography
                    sx={{
                      color: ds.colors.text.secondary,
                      fontWeight: ds.typography.fontWeight.semibold,
                      fontSize: {
                        xs: `${tokens.typography.xs}px`,
                        md: `${tokens.typography.sm}px`,
                      },
                    }}
                  >
                    Ürün Seçildi
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: tokens.spacing.md,
                    textAlign: "center",
                    background: `linear-gradient(135deg, ${alpha(ds.colors.info.main, 0.1)} 0%, ${alpha(ds.colors.info[600], 0.15)} 100%)`,
                    border: `2px solid ${alpha(ds.colors.info.main, 0.3)}`,
                    borderRadius: `${tokens.borderRadius.md}px`,
                    boxShadow: `0 2px 8px ${alpha(ds.colors.info.main, 0.15)}`,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: `0 4px 12px ${alpha(ds.colors.info.main, 0.25)}`,
                      borderColor: alpha(ds.colors.info.main, 0.4),
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: ds.typography.fontWeight.extrabold,
                      color: ds.colors.info[700],
                      fontSize: {
                        xs: `${tokens.typography.xl}px`,
                        md: `${tokens.typography.xxl}px`,
                      },
                      mb: tokens.spacing.xs,
                    }}
                  >
                    {statistics.selectedWorkOrders}/{statistics.totalWorkOrders}
                  </Typography>
                  <Typography
                    sx={{
                      color: ds.colors.text.secondary,
                      fontWeight: ds.typography.fontWeight.semibold,
                      fontSize: {
                        xs: `${tokens.typography.xs}px`,
                        md: `${tokens.typography.sm}px`,
                      },
                    }}
                  >
                    İş Emri Seçildi
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: tokens.spacing.md,
                    textAlign: "center",
                    background: `linear-gradient(135deg, ${alpha(ds.colors.success.main, 0.1)} 0%, ${alpha(ds.colors.success[600], 0.15)} 100%)`,
                    border: `2px solid ${alpha(ds.colors.success.main, 0.3)}`,
                    borderRadius: `${tokens.borderRadius.md}px`,
                    boxShadow: `0 2px 8px ${alpha(ds.colors.success.main, 0.15)}`,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: `0 4px 12px ${alpha(ds.colors.success.main, 0.25)}`,
                      borderColor: alpha(ds.colors.success.main, 0.4),
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: ds.typography.fontWeight.extrabold,
                      color: ds.colors.success[700],
                      fontSize: {
                        xs: `${tokens.typography.xl}px`,
                        md: `${tokens.typography.xxl}px`,
                      },
                      mb: tokens.spacing.xs,
                    }}
                  >
                    {statistics.selectedProfiles}/{statistics.totalProfiles}
                  </Typography>
                  <Typography
                    sx={{
                      color: ds.colors.text.secondary,
                      fontWeight: ds.typography.fontWeight.semibold,
                      fontSize: {
                        xs: `${tokens.typography.xs}px`,
                        md: `${tokens.typography.sm}px`,
                      },
                    }}
                  >
                    Profil Seçildi
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: tokens.spacing.md,
                    textAlign: "center",
                    background: `linear-gradient(135deg, ${alpha(ds.colors.warning.main, 0.1)} 0%, ${alpha(ds.colors.warning[600], 0.15)} 100%)`,
                    border: `2px solid ${alpha(ds.colors.warning.main, 0.3)}`,
                    borderRadius: `${tokens.borderRadius.md}px`,
                    boxShadow: `0 2px 8px ${alpha(ds.colors.warning.main, 0.15)}`,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: `0 4px 12px ${alpha(ds.colors.warning.main, 0.25)}`,
                      borderColor: alpha(ds.colors.warning.main, 0.4),
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: ds.typography.fontWeight.extrabold,
                      color: ds.colors.warning[700],
                      fontSize: {
                        xs: `${tokens.typography.xl}px`,
                        md: `${tokens.typography.xxl}px`,
                      },
                      mb: tokens.spacing.xs,
                    }}
                  >
                    {statistics.selectedQuantity.toLocaleString()}
                  </Typography>
                  <Typography
                    sx={{
                      color: ds.colors.text.secondary,
                      fontWeight: ds.typography.fontWeight.semibold,
                      fontSize: {
                        xs: `${tokens.typography.xs}px`,
                        md: `${tokens.typography.sm}px`,
                      },
                    }}
                  >
                    Toplam Adet
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Bulk Actions */}
        <Box
          sx={{
            p: {
              xs: tokens.spacing.md,
              md: tokens.spacing.lg,
            },
            borderTop: `2px solid ${ds.colors.neutral[200]}`,
            borderBottom: `2px solid ${ds.colors.neutral[200]}`,
            background: `linear-gradient(135deg, ${alpha(ds.colors.neutral[50], 0.5)} 0%, ${alpha(ds.colors.neutral[100], 0.3)} 100%)`,
            boxShadow: `inset 0 1px 0 ${alpha(ds.colors.neutral[300], 0.3)}, inset 0 -1px 0 ${alpha(ds.colors.neutral[300], 0.3)}`,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={tokens.spacing.md}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
          >
            <Typography
              sx={{
                fontWeight: ds.typography.fontWeight.semibold,
                color: ds.colors.text.primary,
                fontSize: {
                  xs: `${tokens.typography.base}px`,
                  md: `${tokens.typography.lg}px`,
                },
              }}
            >
              Toplu İşlemler
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={tokens.spacing.md}
            >
              <Button
                variant="outlined"
                startIcon={
                  <SelectAllIcon sx={{ fontSize: tokens.components.icon.sm }} />
                }
                onClick={handleSelectAll}
                sx={{
                  borderRadius: `${tokens.borderRadius.md}px`,
                  borderColor: ds.colors.success.main,
                  color: ds.colors.success.main,
                  fontWeight: ds.typography.fontWeight.semibold,
                  minHeight: device.isTouch
                    ? tokens.components.minTouchTarget
                    : undefined,
                  fontSize: {
                    xs: `${tokens.typography.sm}px`,
                    md: `${tokens.typography.base}px`,
                  },
                  "&:hover": !device.isTouch
                    ? {
                        borderColor: ds.colors.success[700],
                        background: alpha(ds.colors.success.main, 0.05),
                      }
                    : {},
                }}
              >
                Tümünü Seç
              </Button>
              <Button
                variant="outlined"
                startIcon={
                  <DeselectIcon sx={{ fontSize: tokens.components.icon.sm }} />
                }
                onClick={handleSelectNone}
                sx={{
                  borderRadius: `${tokens.borderRadius.md}px`,
                  borderColor: ds.colors.error.main,
                  color: ds.colors.error.main,
                  fontWeight: ds.typography.fontWeight.semibold,
                  minHeight: device.isTouch
                    ? tokens.components.minTouchTarget
                    : undefined,
                  fontSize: {
                    xs: `${tokens.typography.sm}px`,
                    md: `${tokens.typography.base}px`,
                  },
                  "&:hover": !device.isTouch
                    ? {
                        borderColor: ds.colors.error[700],
                        background: alpha(ds.colors.error.main, 0.05),
                      }
                    : {},
                }}
              >
                Tümünü Temizle
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Product List */}
        <Box
          sx={{
            p: {
              xs: tokens.spacing.md,
              md: tokens.spacing.lg,
            },
            maxHeight: "50vh",
            overflowY: "auto",
          }}
        >
          {Object.values(selectionState.products).map((product) => (
            <Accordion
              key={product.productId}
              expanded={product.expanded}
              sx={{
                mb: tokens.spacing.md,
                borderRadius: `${tokens.borderRadius.md}px`,
                border: `2px solid ${product.selected ? ds.colors.primary.main : ds.colors.neutral[300]}`,
                boxShadow: product.selected
                  ? `0 4px 12px ${alpha(ds.colors.primary.main, 0.2)}`
                  : `0 2px 8px ${alpha(ds.colors.neutral[900], 0.1)}`,
                "&:before": { display: "none" },
                "&.Mui-expanded": {
                  margin: `0 0 ${tokens.spacing.md}px 0`,
                },
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: product.selected
                    ? ds.colors.primary.dark
                    : ds.colors.neutral[400],
                  boxShadow: product.selected
                    ? `0 6px 16px ${alpha(ds.colors.primary.main, 0.3)}`
                    : `0 4px 12px ${alpha(ds.colors.neutral[900], 0.15)}`,
                },
              }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon
                    sx={{ fontSize: tokens.components.icon.md }}
                  />
                }
                onClick={() => handleProductExpand(product.productId)}
                sx={{
                  background: product.selected
                    ? `linear-gradient(135deg, ${alpha(ds.colors.primary.main, 0.1)} 0%, ${alpha(ds.colors.primary[600], 0.15)} 100%)`
                    : ds.colors.background.paper,
                  borderRadius: `${tokens.borderRadius.md}px`,
                  minHeight: device.isTouch
                    ? tokens.components.minTouchTarget * 1.5
                    : tokens.components.button.lg,
                  "&.Mui-expanded": {
                    minHeight: device.isTouch
                      ? tokens.components.minTouchTarget * 1.5
                      : tokens.components.button.lg,
                  },
                  "& .MuiAccordionSummary-content": {
                    alignItems: "center",
                    margin: `${tokens.spacing.sm}px 0`,
                  },
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={product.selected}
                      onChange={() => handleProductToggle(product.productId)}
                      icon={
                        <CheckBoxOutlineBlankIcon
                          sx={{ fontSize: tokens.components.icon.md }}
                        />
                      }
                      checkedIcon={
                        <CheckBoxIcon
                          sx={{ fontSize: tokens.components.icon.md }}
                        />
                      }
                      sx={{
                        color: ds.colors.primary.main,
                        "&.Mui-checked": {
                          color: ds.colors.primary[700],
                        },
                      }}
                    />
                  }
                  label={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: tokens.spacing.md,
                        ml: tokens.spacing.sm,
                      }}
                    >
                      <CategoryIcon
                        sx={{
                          color: ds.colors.primary.main,
                          fontSize: {
                            xs: tokens.components.icon.md,
                            md: tokens.components.icon.lg,
                          },
                        }}
                      />
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: ds.typography.fontWeight.semibold,
                            color: ds.colors.text.primary,
                            fontSize: {
                              xs: `${tokens.typography.base}px`,
                              md: `${tokens.typography.lg}px`,
                            },
                          }}
                        >
                          {product.productName}
                        </Typography>
                        <Typography
                          sx={{
                            color: ds.colors.text.secondary,
                            fontSize: {
                              xs: `${tokens.typography.xs}px`,
                              md: `${tokens.typography.sm}px`,
                            },
                          }}
                        >
                          {product.workOrders.length} iş emri,{" "}
                          {product.workOrders.reduce(
                            (sum, w) => sum + w.profiles.length,
                            0,
                          )}{" "}
                          profil
                        </Typography>
                      </Box>
                    </Box>
                  }
                  sx={{ margin: 0 }}
                />
              </AccordionSummary>

              <AccordionDetails
                sx={{
                  p: 0,
                  background: "#fafbfc",
                  borderTop: `1px solid ${ds.colors.neutral[200]}`,
                }}
              >
                <Box sx={{ p: tokens.spacing.md }}>
                  {product.workOrders.map((workOrder) => (
                    <Box
                      key={workOrder.workOrderId}
                      sx={{ mb: tokens.spacing.md }}
                    >
                      <Card
                        sx={{
                          borderRadius: `${tokens.borderRadius.lg}px`,
                          border: workOrder.selected
                            ? `2px solid ${ds.colors.success.main}`
                            : `1.5px solid ${ds.colors.neutral[300]}`,
                          background: workOrder.selected
                            ? `linear-gradient(135deg, ${alpha(ds.colors.success.main, 0.08)} 0%, ${alpha(ds.colors.success.main, 0.05)} 100%)`
                            : ds.colors.background.paper,
                          boxShadow: workOrder.selected
                            ? `0 4px 12px ${alpha(ds.colors.success.main, 0.2)}`
                            : `0 2px 6px ${alpha(ds.colors.neutral[900], 0.08)}`,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            borderColor: workOrder.selected
                              ? ds.colors.success.dark
                              : ds.colors.neutral[400],
                            boxShadow: workOrder.selected
                              ? `0 6px 16px ${alpha(ds.colors.success.main, 0.3)}`
                              : `0 4px 10px ${alpha(ds.colors.neutral[900], 0.12)}`,
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={workOrder.selected}
                                onChange={() =>
                                  handleWorkOrderToggle(
                                    product.productId,
                                    workOrder.workOrderId,
                                  )
                                }
                                icon={<CheckBoxOutlineBlankIcon />}
                                checkedIcon={<CheckBoxIcon />}
                                sx={{
                                  color: "#10b981",
                                  "&.Mui-checked": {
                                    color: "#059669",
                                  },
                                }}
                              />
                            }
                            label={
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                  ml: 1,
                                }}
                              >
                                <AssignmentIcon
                                  sx={{ color: "#10b981", fontSize: 20 }}
                                />
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: 600, color: "#0f172a" }}
                                  >
                                    İş Emri: {workOrder.workOrderId}
                                  </Typography>
                                  <Stack
                                    direction="row"
                                    spacing={2}
                                    sx={{ mt: 0.5 }}
                                  >
                                    <Chip
                                      icon={<ColorIcon sx={{ fontSize: 16 }} />}
                                      label={workOrder.workOrderItem.color}
                                      size="small"
                                      sx={{
                                        background: alpha(
                                          ds.colors.info.main,
                                          0.1,
                                        ),
                                        color: ds.colors.info.main,
                                        border: `1px solid ${alpha(ds.colors.info.main, 0.2)}`,
                                        fontWeight: 500,
                                      }}
                                    />
                                    <Chip
                                      icon={<RulerIcon sx={{ fontSize: 16 }} />}
                                      label={workOrder.workOrderItem.size}
                                      size="small"
                                      sx={{
                                        background: alpha(
                                          ds.colors.success.main,
                                          0.1,
                                        ),
                                        color: ds.colors.success.main,
                                        border: `1px solid ${alpha(ds.colors.success.main, 0.2)}`,
                                        fontWeight: 500,
                                      }}
                                    />
                                    <Chip
                                      icon={<DateIcon sx={{ fontSize: 16 }} />}
                                      label={workOrder.workOrderItem.date}
                                      size="small"
                                      sx={{
                                        background: alpha(
                                          ds.colors.warning.main,
                                          0.1,
                                        ),
                                        color: ds.colors.warning.main,
                                        border: `1px solid ${alpha(ds.colors.warning.main, 0.2)}`,
                                        fontWeight: 500,
                                      }}
                                    />
                                  </Stack>
                                </Box>
                                <Button
                                  onClick={() => {
                                    setWorkOrderProfilesDialog({
                                      open: true,
                                      productId: product.productId,
                                      workOrder: workOrder,
                                    });
                                  }}
                                  variant="outlined"
                                  size="small"
                                  startIcon={
                                    <BuildIcon sx={{ fontSize: 16 }} />
                                  }
                                  sx={{
                                    borderRadius: `${tokens.borderRadius.md}px`,
                                    borderColor: ds.colors.primary.main,
                                    color: ds.colors.primary.main,
                                    fontWeight: 500,
                                    px: tokens.spacing.md,
                                    py: tokens.spacing.xs,
                                    fontSize: "0.8125rem",
                                    "&:hover": {
                                      borderColor: ds.colors.primary.dark,
                                      background: alpha(
                                        ds.colors.primary.main,
                                        0.08,
                                      ),
                                    },
                                  }}
                                >
                                  Detaylar
                                </Button>
                              </Box>
                            }
                            sx={{ margin: 0, width: "100%" }}
                          />
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          p: {
            xs: tokens.spacing.md,
            md: tokens.spacing.lg,
          },
          background: `linear-gradient(135deg, ${alpha(ds.colors.neutral[50], 0.8)} 0%, ${alpha(ds.colors.neutral[100], 0.9)} 100%)`,
          borderTop: `2px solid ${ds.colors.neutral[200]}`,
          boxShadow: `inset 0 1px 0 ${alpha(ds.colors.neutral[300], 0.3)}`,
          flexDirection: { xs: "column", sm: "row" },
          gap: tokens.spacing.md,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: `${tokens.borderRadius.md}px`,
            borderColor: ds.colors.neutral[400],
            color: ds.colors.text.secondary,
            fontWeight: ds.typography.fontWeight.semibold,
            px: {
              xs: tokens.spacing.md,
              md: tokens.spacing.lg,
            },
            py: {
              xs: tokens.spacing.sm,
              md: tokens.spacing.md,
            },
            minHeight: device.isTouch
              ? tokens.components.minTouchTarget
              : undefined,
            fontSize: {
              xs: `${tokens.typography.sm}px`,
              md: `${tokens.typography.base}px`,
            },
            width: { xs: "100%", sm: "auto" },
            "&:hover": !device.isTouch
              ? {
                  borderColor: ds.colors.neutral[500],
                  background: alpha(ds.colors.neutral[400], 0.05),
                }
              : {},
          }}
        >
          İptal
        </Button>

        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={statistics.selectedProfiles === 0 || loading}
          startIcon={<SaveIcon sx={{ fontSize: tokens.components.icon.sm }} />}
          sx={{
            borderRadius: `${tokens.borderRadius.md}px`,
            background: ds.gradients.primary,
            color: ds.colors.primary.contrast,
            fontWeight: ds.typography.fontWeight.semibold,
            px: {
              xs: tokens.spacing.lg,
              md: tokens.spacing.xl,
            },
            py: {
              xs: tokens.spacing.sm,
              md: tokens.spacing.md,
            },
            minHeight: device.isTouch
              ? tokens.components.minTouchTarget
              : undefined,
            fontSize: {
              xs: `${tokens.typography.sm}px`,
              md: `${tokens.typography.base}px`,
            },
            boxShadow: ds.shadows.soft.lg,
            width: { xs: "100%", sm: "auto" },
            "&:hover": !device.isTouch
              ? {
                  background: `linear-gradient(135deg, ${ds.colors.primary[700]} 0%, ${ds.colors.primary[800]} 100%)`,
                  boxShadow: ds.shadows.soft.xl,
                }
              : {},
            "&:disabled": {
              background: ds.colors.neutral[400],
              boxShadow: "none",
            },
          }}
        >
          {loading
            ? "İşleniyor..."
            : `${statistics.selectedProfiles} Profil Seç`}
        </Button>
      </DialogActions>

      {/* Work Order Profiles Dialog */}
      {workOrderProfilesDialog.workOrder && (
        <Dialog
          open={workOrderProfilesDialog.open}
          onClose={() =>
            setWorkOrderProfilesDialog({
              open: false,
              productId: "",
              workOrder: null,
            })
          }
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: `${tokens.borderRadius.xl}px`,
              boxShadow: ds.shadows.soft.xl,
              border: `1px solid ${alpha(ds.colors.primary.main, 0.2)}`,
              maxHeight: "90vh",
              width: "95%",
              maxWidth: "1200px",
            },
          }}
        >
          <DialogTitle
            sx={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: ds.colors.text.primary,
              pb: tokens.spacing.md,
              borderBottom: `1px solid ${ds.colors.neutral[200]}`,
              display: "flex",
              alignItems: "center",
              gap: tokens.spacing.md,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: `${tokens.borderRadius.lg}px`,
                background: ds.gradients.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: ds.shadows.soft.md,
              }}
            >
              <AssignmentIcon
                sx={{
                  fontSize: 24,
                  color: ds.colors.text.inverse,
                }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: ds.colors.text.primary,
                  mb: 0.5,
                }}
              >
                İş Emri: {workOrderProfilesDialog.workOrder.workOrderId}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  icon={<ColorIcon sx={{ fontSize: 14 }} />}
                  label={workOrderProfilesDialog.workOrder.workOrderItem.color}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: "0.75rem",
                    background: alpha(ds.colors.info.main, 0.1),
                    color: ds.colors.info.main,
                  }}
                />
                <Chip
                  icon={<RulerIcon sx={{ fontSize: 14 }} />}
                  label={workOrderProfilesDialog.workOrder.workOrderItem.size}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: "0.75rem",
                    background: alpha(ds.colors.success.main, 0.1),
                    color: ds.colors.success.main,
                  }}
                />
                <Chip
                  icon={<DateIcon sx={{ fontSize: 14 }} />}
                  label={workOrderProfilesDialog.workOrder.workOrderItem.date}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: "0.75rem",
                    background: alpha(ds.colors.warning.main, 0.1),
                    color: ds.colors.warning.main,
                  }}
                />
              </Stack>
            </Box>
            <IconButton
              onClick={() =>
                setWorkOrderProfilesDialog({
                  open: false,
                  productId: "",
                  workOrder: null,
                })
              }
              sx={{
                width: 36,
                height: 36,
                borderRadius: `${tokens.borderRadius.md}px`,
                background: alpha(ds.colors.neutral[200], 0.5),
                color: ds.colors.text.secondary,
                "&:hover": {
                  background: alpha(ds.colors.neutral[300], 0.7),
                  transform: "rotate(90deg)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </DialogTitle>

          <DialogContent
            sx={{
              pt: tokens.spacing.lg,
              px: tokens.spacing.lg,
              pb: tokens.spacing.md,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                mb: tokens.spacing.md,
                color: ds.colors.text.primary,
              }}
            >
              Profil Tipleri
            </Typography>

            <Stack spacing={tokens.spacing.md}>
              {Array.isArray(workOrderProfilesDialog.workOrder.profiles) &&
              workOrderProfilesDialog.workOrder.profiles.length > 0 ? (
                workOrderProfilesDialog.workOrder.profiles.map((profile) => (
                  <Card
                    key={profile.profileId}
                    sx={{
                      border: profile.selected
                        ? `2px solid ${ds.colors.primary.main}`
                        : `1px solid ${ds.colors.neutral[200]}`,
                      background: profile.selected
                        ? `linear-gradient(135deg, ${alpha(ds.colors.primary.main, 0.05)} 0%, ${alpha(ds.colors.primary.main, 0.08)} 100%)`
                        : ds.colors.neutral[50],
                      borderRadius: `${tokens.borderRadius.lg}px`,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        boxShadow: ds.shadows.soft.md,
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: tokens.spacing.md }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "start",
                          gap: tokens.spacing.md,
                        }}
                      >
                        <Checkbox
                          checked={profile.selected}
                          onChange={() => {
                            handleProfileToggle(
                              workOrderProfilesDialog.productId,
                              workOrderProfilesDialog.workOrder!.workOrderId,
                              profile.profileId,
                            );
                            // Update workOrder in dialog state to reflect changes
                            setWorkOrderProfilesDialog((prev) => ({
                              ...prev,
                              workOrder: prev.workOrder
                                ? {
                                    ...prev.workOrder,
                                    profiles: prev.workOrder.profiles.map(
                                      (p) =>
                                        p.profileId === profile.profileId
                                          ? { ...p, selected: !p.selected }
                                          : p,
                                    ),
                                  }
                                : null,
                            }));
                          }}
                          sx={{
                            color: ds.colors.primary.main,
                            "&.Mui-checked": {
                              color: ds.colors.primary.dark,
                            },
                            mt: 0.5,
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 600,
                              color: ds.colors.text.primary,
                              mb: tokens.spacing.sm,
                            }}
                          >
                            {profile.profile}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={tokens.spacing.sm}
                            sx={{ mb: tokens.spacing.md }}
                          >
                            <Chip
                              label={`${profile.measurement}mm`}
                              size="small"
                              sx={{
                                height: 24,
                                fontSize: "0.8125rem",
                                background: alpha(ds.colors.primary.main, 0.1),
                                color: ds.colors.primary.main,
                                fontWeight: 500,
                              }}
                            />
                            <Chip
                              label={`${profile.quantity} adet`}
                              size="small"
                              sx={{
                                height: 24,
                                fontSize: "0.8125rem",
                                background: alpha(ds.colors.success.main, 0.1),
                                color: ds.colors.success.main,
                                fontWeight: 500,
                              }}
                            />
                          </Stack>
                          <FormControl
                            fullWidth
                            size="small"
                            disabled={profilesLoading || mappingsLoading}
                          >
                            <InputLabel>Profil Tanımı Seç</InputLabel>
                            <Select
                              value={
                                selectedProfiles[profile.profile]?.profileId ||
                                ""
                              }
                              onChange={(e) => {
                                const selectedProfile = activeProfiles?.find(
                                  (p) => p.profileId === e.target.value,
                                );
                                handleProfileSelect(
                                  profile.profile,
                                  selectedProfile || null,
                                );
                              }}
                              label="Profil Tanımı Seç"
                            >
                              <MenuItem value="">
                                <em>Otomatik seç (mapping'den)</em>
                              </MenuItem>
                              {(() => {
                                const allowedProfileIds =
                                  profileTypeToProfileIds.get(
                                    profile.profile,
                                  ) || [];
                                return activeProfiles
                                  ?.filter((pro) =>
                                    allowedProfileIds.includes(pro.profileId),
                                  )
                                  .map((pro) => (
                                    <MenuItem
                                      key={pro.profileId}
                                      value={pro.profileId}
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          flexDirection: "column",
                                        }}
                                      >
                                        <Typography
                                          variant="body2"
                                          fontWeight={600}
                                        >
                                          {pro.profileCode}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          {pro.profileName} -{" "}
                                          {pro.stockLengths.length} stok boyu
                                        </Typography>
                                      </Box>
                                    </MenuItem>
                                  ));
                              })()}
                            </Select>
                          </FormControl>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                    py: tokens.spacing.xl,
                    color: ds.colors.text.secondary,
                  }}
                >
                  <Typography variant="body2">
                    Bu iş emri için profil bulunamadı
                  </Typography>
                </Box>
              )}
            </Stack>
          </DialogContent>

          <DialogActions
            sx={{
              px: tokens.spacing.lg,
              pb: tokens.spacing.lg,
              pt: tokens.spacing.md,
              borderTop: `1px solid ${ds.colors.neutral[200]}`,
            }}
          >
            <Button
              onClick={() =>
                setWorkOrderProfilesDialog({
                  open: false,
                  productId: "",
                  workOrder: null,
                })
              }
              variant="outlined"
              sx={{
                borderRadius: `${tokens.borderRadius.md}px`,
                borderColor: ds.colors.neutral[300],
                color: ds.colors.text.secondary,
                fontWeight: 500,
                px: tokens.spacing.lg,
                py: tokens.spacing.sm,
                "&:hover": {
                  borderColor: ds.colors.neutral[400],
                  background: alpha(ds.colors.neutral[100], 0.5),
                },
              }}
            >
              Kapat
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Dialog>
  );
};
