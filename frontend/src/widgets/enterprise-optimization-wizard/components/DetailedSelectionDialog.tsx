/**
 * @fileoverview Detailed Selection Dialog - Hierarchical Product/WorkOrder/Profile Selection
 * @module DetailedSelectionDialog
 * @version 1.0.0
 */

import React, { useState, useEffect, useMemo } from "react";
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

  // Refresh data when dialog opens
  useEffect(() => {
    if (open) {
      console.log(
        "[DetailedSelectionDialog] 🔄 Dialog opened, refreshing profile data...",
      );
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: ["profile-management", "active"],
      });
      queryClient.invalidateQueries({
        queryKey: ["workOrderProfileMappings", week, year],
      });
      refetchActiveProfiles();
      refetchMappings();
    }
  }, [open, week, year, queryClient, refetchActiveProfiles, refetchMappings]);

  // Initialize selection state from cutting list data
  useEffect(() => {
    // ✅ FIX: Reset state whenever dialog opens (when `open` changes to true)
    if (open && cuttingList?.sections) {
      console.log(
        "[DetailedSelectionDialog] 🔄 Initializing/Resetting selection state",
      );
      const initialProducts: Record<string, ProductSelection> = {};

      cuttingList.sections.forEach((section: CuttingListSection) => {
        const workOrders: WorkOrderSelection[] = section.items.map(
          (item: CuttingListItem) => {
            // ✅ DEBUG: Log raw item data from backend
            console.log("[DetailedSelectionDialog] 🔍 Raw item from backend:", {
              workOrderId: item.workOrderId,
              profiles: item.profiles,
              sampleProfile: item.profiles?.[0],
            });

            // Convert CuttingListItem to WorkOrderItem format
            const workOrderItem: WorkOrderItem = {
              id: item.id || `item-${Date.now()}`,
              workOrderId: item.workOrderId || "Bilinmeyen İş Emri",
              date: new Date().toISOString().split("T")[0], // Default date
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

            console.log("[DetailedSelectionDialog] 🔍 Mapped workOrderItem:", {
              workOrderId: workOrderItem.workOrderId,
              profiles: workOrderItem.profiles,
              sampleProfile: workOrderItem.profiles?.[0],
            });

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

      console.log(
        "[DetailedSelectionDialog] ✅ Selection state initialized with",
        Object.keys(initialProducts).length,
        "products",
      );
    }
  }, [cuttingList, open]); // ✅ FIX: Added `open` dependency

  // Calculate statistics
  const statistics = useMemo(() => {
    console.log(
      "[DetailedSelectionDialog] 🔵 useMemo recalculating statistics...",
    );
    let totalProfiles = 0;
    let totalQuantity = 0;
    let selectedProducts = 0;
    let selectedWorkOrders = 0;
    let selectedProfiles = 0;

    Object.values(selectionState.products).forEach((product) => {
      if (product.selected) selectedProducts++;

      product.workOrders.forEach((workOrder) => {
        if (workOrder.selected) selectedWorkOrders++;

        if (Array.isArray(workOrder.profiles)) {
          workOrder.profiles.forEach((profile) => {
            totalProfiles++;
            totalQuantity += profile.quantity;

            if (profile.selected) {
              selectedProfiles++;
            }
          });
        }
      });
    });

    const result = {
      totalProducts: Object.keys(selectionState.products).length,
      selectedProducts,
      totalWorkOrders: Object.values(selectionState.products).reduce(
        (sum, p) => sum + p.workOrders.length,
        0,
      ),
      selectedWorkOrders,
      totalProfiles,
      selectedProfiles,
      totalQuantity,
      selectedQuantity: Object.values(selectionState.products)
        .flatMap((p) => p.workOrders)
        .flatMap((w) => (Array.isArray(w.profiles) ? w.profiles : []))
        .filter((p) => p.selected)
        .reduce((sum, p) => sum + p.quantity, 0),
    };

    console.log("[DetailedSelectionDialog] 📊 Statistics calculated:", result);
    return result;
  }, [selectionState]);

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
  }, [selectionState]);

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
  const handleProductToggle = (productId: string) => {
    console.log("[DetailedSelectionDialog] 🔵 handleProductToggle called:", {
      productId,
    });

    setSelectionState((prev) => {
      const product = prev.products[productId];
      if (!product) {
        console.error(
          "[DetailedSelectionDialog] ❌ Product not found:",
          productId,
        );
        return prev;
      }

      const newSelected = !product.selected;

      console.log("[DetailedSelectionDialog] 🔵 Product current state:", {
        productId,
        currentSelected: product.selected,
        newSelected,
        workOrderCount: product.workOrders.length,
      });

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

      console.log("[DetailedSelectionDialog] ✅ Product toggled, new state:", {
        productId,
        newSelected,
        workOrderCount: updatedWorkOrders.length,
        totalProfiles,
        selectedProfiles,
      });

      return newState;
    });
  };

  const handleProductExpand = (productId: string) => {
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
  };

  const handleWorkOrderToggle = (productId: string, workOrderId: string) => {
    console.log("[DetailedSelectionDialog] 🔵 handleWorkOrderToggle called:", {
      productId,
      workOrderId,
    });

    setSelectionState((prev) => {
      const product = prev.products[productId];
      if (!product) {
        console.error(
          "[DetailedSelectionDialog] ❌ Product not found:",
          productId,
        );
        return prev;
      }

      const workOrderIndex = product.workOrders.findIndex(
        (w) => w.workOrderId === workOrderId,
      );
      if (workOrderIndex === -1) {
        console.error(
          "[DetailedSelectionDialog] ❌ WorkOrder not found:",
          workOrderId,
        );
        return prev;
      }

      const workOrder = product.workOrders[workOrderIndex];
      const newSelected = !workOrder.selected;

      console.log("[DetailedSelectionDialog] 🔵 WorkOrder current state:", {
        workOrderId,
        currentSelected: workOrder.selected,
        newSelected,
        profileCount: Array.isArray(workOrder.profiles)
          ? workOrder.profiles.length
          : 0,
      });

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
      const allWorkOrdersSelected = updatedWorkOrders.every((w) => w.selected);

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

      console.log(
        "[DetailedSelectionDialog] ✅ WorkOrder toggled, new state:",
        {
          workOrderId,
          newSelected,
          selectedProfiles: updatedProfiles.filter((p) => p.selected).length,
          totalProfiles: updatedProfiles.length,
        },
      );

      return newState;
    });
  };

  const handleWorkOrderExpand = (productId: string, workOrderId: string) => {
    setSelectionState((prev) => {
      const product = prev.products[productId];
      const workOrderIndex = product.workOrders.findIndex(
        (w) => w.workOrderId === workOrderId,
      );
      const updatedWorkOrders = [...product.workOrders];
      updatedWorkOrders[workOrderIndex] = {
        ...updatedWorkOrders[workOrderIndex],
        expanded: !updatedWorkOrders[workOrderIndex].expanded,
      };

      return {
        ...prev,
        products: {
          ...prev.products,
          [productId]: {
            ...product,
            workOrders: updatedWorkOrders,
          },
        },
      };
    });
  };

  const handleProfileToggle = (
    productId: string,
    workOrderId: string,
    profileId: string,
  ) => {
    console.log("[DetailedSelectionDialog] 🔵 handleProfileToggle called:", {
      productId,
      workOrderId,
      profileId,
    });

    setSelectionState((prev) => {
      console.log(
        "[DetailedSelectionDialog] 🔍 BEFORE toggle - prev.products:",
        Object.keys(prev.products),
      );

      const product = prev.products[productId];
      if (!product) {
        console.error(
          "[DetailedSelectionDialog] ❌ Product not found:",
          productId,
          "Available products:",
          Object.keys(prev.products),
        );
        return prev;
      }

      console.log(
        "[DetailedSelectionDialog] ✅ Product found:",
        product.productId,
        "workOrders:",
        product.workOrders.length,
      );

      const workOrderIndex = product.workOrders.findIndex(
        (w) => w.workOrderId === workOrderId,
      );
      if (workOrderIndex === -1) {
        console.error(
          "[DetailedSelectionDialog] ❌ WorkOrder not found:",
          workOrderId,
          "Available workOrders:",
          product.workOrders.map((w) => w.workOrderId),
        );
        return prev;
      }

      const workOrder = product.workOrders[workOrderIndex];
      console.log(
        "[DetailedSelectionDialog] ✅ WorkOrder found:",
        workOrder.workOrderId,
        "profiles:",
        Array.isArray(workOrder.profiles) ? workOrder.profiles.length : 0,
      );

      if (!Array.isArray(workOrder.profiles)) {
        console.error(
          "[DetailedSelectionDialog] ❌ WorkOrder has no profiles array:",
          workOrder.workOrderId,
        );
        return prev;
      }

      const profileIndex = workOrder.profiles.findIndex(
        (p) => p.profileId === profileId,
      );
      if (profileIndex === -1) {
        console.error(
          "[DetailedSelectionDialog] ❌ Profile not found:",
          profileId,
          "Available profiles:",
          workOrder.profiles.map((p) => p.profileId),
        );
        return prev;
      }

      const profile = workOrder.profiles[profileIndex];
      const newSelected = !profile.selected;

      console.log("[DetailedSelectionDialog] 🔵 Profile toggle:", {
        profileId,
        currentSelected: profile.selected,
        newSelected,
        profile: profile.profile,
        measurement: profile.measurement,
      });

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
      const allWorkOrdersSelected = updatedWorkOrders.every((w) => w.selected);

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

      console.log(
        "[DetailedSelectionDialog] 🔵 AFTER toggle - newState products:",
        Object.keys(newState.products),
      );
      console.log(
        "[DetailedSelectionDialog] 🔵 Updated profile selected:",
        newSelected,
      );

      // ✅ FIX: Return state with updated products (totals recalculated by useMemo)
      return newState;
    });
  };

  // Bulk selection handlers
  const handleSelectAll = () => {
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
  };

  const handleSelectNone = () => {
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
  };

  // Confirm selection
  const handleConfirm = () => {
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

    console.log(
      "[DetailedSelectionDialog] 🔍 handleConfirm called, selectionState:",
      {
        productCount: Object.keys(selectionState.products).length,
        products: Object.values(selectionState.products).map((p) => ({
          productId: p.productId,
          selected: p.selected,
          workOrderCount: p.workOrders.length,
          workOrders: p.workOrders.map((wo) => ({
            workOrderId: wo.workOrderId,
            selected: wo.selected,
            profileCount: wo.profiles.length,
            profiles: wo.profiles.map((prof) => ({
              profile: prof.profile,
              measurement: prof.measurement,
              selected: prof.selected,
            })),
          })),
        })),
        statistics: statistics,
      },
    );

    // ✅ FIX: İterate through all products, then check work orders and profiles
    // Don't require product.selected to be true (user might select only some work orders)
    Object.values(selectionState.products).forEach((product) => {
      console.log(
        "[DetailedSelectionDialog] 🔍 Processing product:",
        product.productId,
      );

      product.workOrders.forEach((workOrder) => {
        if (workOrder.selected) {
          console.log(
            "[DetailedSelectionDialog] ✅ WorkOrder selected:",
            workOrder.workOrderId,
          );

          // ✅ FIX: Ensure profiles is an array before iterating
          if (Array.isArray(workOrder.profiles)) {
            workOrder.profiles.forEach((profile) => {
              if (profile.selected) {
                console.log("[DetailedSelectionDialog] ✅ Profile selected:", {
                  profileId: profile.profileId,
                  profile: profile.profile,
                  measurement: profile.measurement,
                  quantity: profile.quantity,
                });
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
          } else {
            console.warn(
              "[DetailedSelectionDialog] ⚠️ WorkOrder has no profiles array:",
              workOrder.workOrderId,
            );
          }
        }
      });
    });

    console.log(
      "[DetailedSelectionDialog] 🔍 Total selected items:",
      selectedItems.length,
    );
    onConfirm(selectedItems, selectedProfiles);
  };

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
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          background: "#ffffff",
          borderRadius: "20px",
          border: "1px solid rgba(148, 163, 184, 0.35)",
          boxShadow:
            "0 25px 80px rgba(15, 23, 42, 0.2), 0 10px 32px rgba(0, 0, 0, 0.12)",
          maxHeight: "90vh",
          minHeight: "80vh",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
          color: "white",
          fontWeight: 700,
          fontSize: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "system-ui, -apple-system, sans-serif",
          py: 3,
          px: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px rgba(255, 255, 255, 0.1)",
            }}
          >
            <CategoryIcon sx={{ fontSize: 24, color: "white" }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              Detaylı Seçim
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
              {cuttingList?.title} - Ürün, İş Emri ve Profil Seçimi
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: "white",
            background: "rgba(255, 255, 255, 0.1)",
            "&:hover": {
              background: "rgba(255, 255, 255, 0.2)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: 0 }}>
        {/* Statistics Panel */}
        {showStatistics && (
          <Box
            sx={{
              p: 3,
              background:
                "linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(59, 130, 246, 0.08) 100%)",
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: "center",
                    background:
                      "linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(59, 130, 246, 0.15) 100%)",
                    border: "1px solid rgba(37, 99, 235, 0.2)",
                    borderRadius: "12px",
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 800, color: "#1d4ed8", mb: 0.5 }}
                  >
                    {statistics.selectedProducts}/{statistics.totalProducts}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748b", fontWeight: 600 }}
                  >
                    Ürün Seçildi
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: "center",
                    background:
                      "linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(56, 189, 248, 0.15) 100%)",
                    border: "1px solid rgba(14, 165, 233, 0.2)",
                    borderRadius: "12px",
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 800, color: "#0ea5e9", mb: 0.5 }}
                  >
                    {statistics.selectedWorkOrders}/{statistics.totalWorkOrders}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748b", fontWeight: 600 }}
                  >
                    İş Emri Seçildi
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: "center",
                    background:
                      "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(34, 197, 94, 0.15) 100%)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    borderRadius: "12px",
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 800, color: "#10b981", mb: 0.5 }}
                  >
                    {statistics.selectedProfiles}/{statistics.totalProfiles}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748b", fontWeight: 600 }}
                  >
                    Profil Seçildi
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: "center",
                    background:
                      "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 146, 60, 0.15) 100%)",
                    border: "1px solid rgba(245, 158, 11, 0.2)",
                    borderRadius: "12px",
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 800, color: "#f59e0b", mb: 0.5 }}
                  >
                    {statistics.selectedQuantity.toLocaleString()}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748b", fontWeight: 600 }}
                  >
                    Toplam Adet
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Bulk Actions */}
        <Box sx={{ p: 3, borderBottom: "1px solid rgba(148, 163, 184, 0.2)" }}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#0f172a" }}>
              Toplu İşlemler
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<SelectAllIcon />}
                onClick={handleSelectAll}
                sx={{
                  borderRadius: "10px",
                  borderColor: "#10b981",
                  color: "#10b981",
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: "#059669",
                    background: "rgba(16, 185, 129, 0.05)",
                  },
                }}
              >
                Tümünü Seç
              </Button>
              <Button
                variant="outlined"
                startIcon={<DeselectIcon />}
                onClick={handleSelectNone}
                sx={{
                  borderRadius: "10px",
                  borderColor: "#ef4444",
                  color: "#ef4444",
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: "#dc2626",
                    background: "rgba(239, 68, 68, 0.05)",
                  },
                }}
              >
                Tümünü Temizle
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Product List */}
        <Box sx={{ p: 3, maxHeight: "50vh", overflowY: "auto" }}>
          {Object.values(selectionState.products).map((product) => (
            <Accordion
              key={product.productId}
              expanded={product.expanded}
              sx={{
                mb: 2,
                borderRadius: "12px",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
                "&:before": { display: "none" },
                "&.Mui-expanded": {
                  margin: "0 0 16px 0",
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                onClick={() => handleProductExpand(product.productId)}
                sx={{
                  background: product.selected
                    ? "linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(59, 130, 246, 0.15) 100%)"
                    : "#ffffff",
                  borderRadius: "12px",
                  minHeight: 64,
                  "&.Mui-expanded": {
                    minHeight: 64,
                  },
                  "& .MuiAccordionSummary-content": {
                    alignItems: "center",
                    margin: "12px 0",
                  },
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={product.selected}
                      onChange={() => handleProductToggle(product.productId)}
                      icon={<CheckBoxOutlineBlankIcon />}
                      checkedIcon={<CheckBoxIcon />}
                      sx={{
                        color: "#2563eb",
                        "&.Mui-checked": {
                          color: "#1d4ed8",
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
                      <CategoryIcon sx={{ color: "#2563eb", fontSize: 24 }} />
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, color: "#0f172a" }}
                        >
                          {product.productName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#64748b" }}>
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

              <AccordionDetails sx={{ p: 0, background: "#fafbfc" }}>
                <Box sx={{ p: 2 }}>
                  {product.workOrders.map((workOrder) => (
                    <Box key={workOrder.workOrderId} sx={{ mb: 2 }}>
                      <Card
                        sx={{
                          borderRadius: "10px",
                          border: workOrder.selected
                            ? "2px solid #10b981"
                            : "1px solid rgba(148, 163, 184, 0.2)",
                          background: workOrder.selected
                            ? "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(34, 197, 94, 0.08) 100%)"
                            : "#ffffff",
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
                                        background: "rgba(59, 130, 246, 0.1)",
                                        color: "#2563eb",
                                      }}
                                    />
                                    <Chip
                                      icon={<RulerIcon sx={{ fontSize: 16 }} />}
                                      label={workOrder.workOrderItem.size}
                                      size="small"
                                      sx={{
                                        background: "rgba(16, 185, 129, 0.1)",
                                        color: "#10b981",
                                      }}
                                    />
                                    <Chip
                                      icon={<DateIcon sx={{ fontSize: 16 }} />}
                                      label={workOrder.workOrderItem.date}
                                      size="small"
                                      sx={{
                                        background: "rgba(245, 158, 11, 0.1)",
                                        color: "#f59e0b",
                                      }}
                                    />
                                  </Stack>
                                </Box>
                                <IconButton
                                  onClick={() =>
                                    handleWorkOrderExpand(
                                      product.productId,
                                      workOrder.workOrderId,
                                    )
                                  }
                                  size="small"
                                >
                                  {workOrder.expanded ? (
                                    <ExpandLessIcon />
                                  ) : (
                                    <ExpandMoreIcon />
                                  )}
                                </IconButton>
                              </Box>
                            }
                            sx={{ margin: 0, width: "100%" }}
                          />

                          <Collapse in={workOrder.expanded}>
                            <Box sx={{ mt: 2, pl: 4 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 600,
                                  mb: 1,
                                  color: "#475569",
                                }}
                              >
                                Profil Tipleri:
                              </Typography>
                              <Stack spacing={2}>
                                {Array.isArray(workOrder.profiles)
                                  ? workOrder.profiles.map((profile) => (
                                      <Box key={profile.profileId}>
                                        <Card
                                          sx={{
                                            border: profile.selected
                                              ? "2px solid #2563eb"
                                              : "1px solid rgba(148, 163, 184, 0.2)",
                                            background: profile.selected
                                              ? "linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(59, 130, 246, 0.08) 100%)"
                                              : "#ffffff",
                                          }}
                                        >
                                          <CardContent sx={{ p: 2 }}>
                                            <Box
                                              sx={{
                                                display: "flex",
                                                alignItems: "start",
                                                gap: 2,
                                              }}
                                            >
                                              <Checkbox
                                                checked={profile.selected}
                                                onChange={() =>
                                                  handleProfileToggle(
                                                    product.productId,
                                                    workOrder.workOrderId,
                                                    profile.profileId,
                                                  )
                                                }
                                                sx={{
                                                  color: "#2563eb",
                                                  "&.Mui-checked": {
                                                    color: "#1d4ed8",
                                                  },
                                                }}
                                              />
                                              <Box sx={{ flex: 1 }}>
                                                <Typography
                                                  variant="body2"
                                                  sx={{
                                                    fontWeight: 600,
                                                    color: "#0f172a",
                                                    mb: 1,
                                                  }}
                                                >
                                                  {profile.profile}
                                                </Typography>
                                                <Stack
                                                  direction="row"
                                                  spacing={1}
                                                  sx={{ mb: 1 }}
                                                >
                                                  <Chip
                                                    label={`${profile.measurement}mm`}
                                                    size="small"
                                                    sx={{
                                                      background:
                                                        "rgba(37, 99, 235, 0.1)",
                                                      color: "#2563eb",
                                                      fontSize: "0.7rem",
                                                      height: 20,
                                                    }}
                                                  />
                                                  <Chip
                                                    label={`${profile.quantity} adet`}
                                                    size="small"
                                                    sx={{
                                                      background:
                                                        "rgba(16, 185, 129, 0.1)",
                                                      color: "#10b981",
                                                      fontSize: "0.7rem",
                                                      height: 20,
                                                    }}
                                                  />
                                                </Stack>
                                                <FormControl
                                                  fullWidth
                                                  size="small"
                                                  disabled={
                                                    profilesLoading ||
                                                    mappingsLoading
                                                  }
                                                >
                                                  <InputLabel>
                                                    Profil Tanımı Seç
                                                  </InputLabel>
                                                  <Select
                                                    value={
                                                      selectedProfiles[
                                                        profile.profile
                                                      ]?.profileId || ""
                                                    }
                                                    onChange={(e) => {
                                                      const selectedProfile =
                                                        activeProfiles?.find(
                                                          (p) =>
                                                            p.profileId ===
                                                            e.target.value,
                                                        );
                                                      handleProfileSelect(
                                                        profile.profile,
                                                        selectedProfile || null,
                                                      );
                                                    }}
                                                    label="Profil Tanımı Seç"
                                                  >
                                                    <MenuItem value="">
                                                      <em>
                                                        Otomatik seç
                                                        (mapping'den)
                                                      </em>
                                                    </MenuItem>
                                                    {/* Only show profiles that match this profileType */}
                                                    {(() => {
                                                      const allowedProfileIds =
                                                        profileTypeToProfileIds.get(
                                                          profile.profile,
                                                        ) || [];
                                                      return activeProfiles
                                                        ?.filter((pro) =>
                                                          allowedProfileIds.includes(
                                                            pro.profileId,
                                                          ),
                                                        )
                                                        .map((pro) => (
                                                          <MenuItem
                                                            key={pro.profileId}
                                                            value={
                                                              pro.profileId
                                                            }
                                                          >
                                                            <Box
                                                              sx={{
                                                                display: "flex",
                                                                flexDirection:
                                                                  "column",
                                                              }}
                                                            >
                                                              <Typography
                                                                variant="body2"
                                                                fontWeight={600}
                                                              >
                                                                {
                                                                  pro.profileCode
                                                                }
                                                              </Typography>
                                                              <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                              >
                                                                {
                                                                  pro.profileName
                                                                }{" "}
                                                                -{" "}
                                                                {
                                                                  pro
                                                                    .stockLengths
                                                                    .length
                                                                }{" "}
                                                                stok boyu
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
                                      </Box>
                                    ))
                                  : null}
                              </Stack>
                            </Box>
                          </Collapse>
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
          p: 3,
          background:
            "linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.9) 100%)",
          borderTop: "1px solid rgba(148, 163, 184, 0.2)",
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: "12px",
            borderColor: "#94a3b8",
            color: "#475569",
            fontWeight: 600,
            px: 3,
            py: 1.5,
            "&:hover": {
              borderColor: "#64748b",
              background: "rgba(148, 163, 184, 0.05)",
            },
          }}
        >
          İptal
        </Button>

        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={statistics.selectedProfiles === 0 || loading}
          startIcon={<SaveIcon />}
          sx={{
            borderRadius: "12px",
            background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
            color: "white",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            boxShadow: "0 4px 16px rgba(37, 99, 235, 0.3)",
            "&:hover": {
              background: "linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)",
              boxShadow: "0 6px 20px rgba(37, 99, 235, 0.4)",
            },
            "&:disabled": {
              background: "#94a3b8",
              boxShadow: "none",
            },
          }}
        >
          {loading
            ? "İşleniyor..."
            : `${statistics.selectedProfiles} Profil Seç`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
