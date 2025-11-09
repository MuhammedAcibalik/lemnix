/**
 * @fileoverview Custom hook for CuttingListBuilder API operations
 * @module useCuttingListData
 * @version 1.1.0 - Migrated to FSD API Client
 */

import { useCallback, useRef } from "react";
import {
  addItemToSection as addItemToSectionAPI,
  createCuttingList as createCuttingListApi,
} from "@/entities/cutting-list/api/cuttingListApi";
import { apiClient } from "@/shared/api/client";
import axios, { AxiosError } from "axios";
import {
  CuttingList,
  ProductSection,
  WorkOrderItem,
  WorkOrderForm,
  ApiResponse,
  LoadingState,
} from "../types";

interface UseCuttingListDataProps {
  cuttingList: CuttingList | null;
  setCuttingList: (list: CuttingList | null) => void;
  setCuttingLists: (lists: CuttingList[]) => void;
  title: string;
  selectedWeekNumber: number;
  productName: string;
  currentSectionId: string;
  newItemForm: WorkOrderForm;
  editingItem: WorkOrderItem | null;
  isFormValid: boolean;
  setLoadingState: (state: LoadingState) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  setShowNewProductDialog: (show: boolean) => void;
  setShowNewItemDialog: (show: boolean) => void;
  setShowEditItemDialog: (show: boolean) => void;
  setEditingItem: (item: WorkOrderItem | null) => void;
  resetNewItemForm: () => void;
}

export const useCuttingListData = ({
  cuttingList,
  setCuttingList,
  setCuttingLists,
  title,
  selectedWeekNumber,
  productName,
  currentSectionId,
  newItemForm,
  editingItem,
  isFormValid,
  setLoadingState,
  setError,
  setSuccess,
  setShowNewProductDialog,
  setShowNewItemDialog,
  setShowEditItemDialog,
  setEditingItem,
  resetNewItemForm,
}: UseCuttingListDataProps) => {
  const abortControllerRef = useRef<AbortController | null>(null);

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  const handleError = useCallback(
    (error: unknown, context: string): void => {
      let errorMessage = "Beklenmeyen bir hata oluştu";

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{
          error?: string;
          message?: string;
        }>;

        if (axiosError.response?.status === 404) {
          errorMessage = "İstenen kaynak bulunamadı. Lütfen sayfayı yenileyin.";
        } else if (axiosError.response?.status === 500) {
          errorMessage = "Sunucu hatası. Lütfen daha sonra tekrar deneyin.";
        } else if (axiosError.response?.status === 400) {
          errorMessage = "Geçersiz istek. Lütfen verilerinizi kontrol edin.";
        } else if (axiosError.response?.status === 401) {
          errorMessage = "Yetkilendirme hatası. Lütfen tekrar giriş yapın.";
        } else if (axiosError.response?.status === 403) {
          errorMessage = "Bu işlem için yetkiniz bulunmuyor.";
        } else if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.message) {
          errorMessage = `Ağ hatası: ${axiosError.message}`;
        } else {
          errorMessage =
            "Sunucu ile bağlantı kurulamadı. İnternet bağlantınızı kontrol edin.";
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = String(error.message);
      }

      setError(`${context}: ${errorMessage}`);
      setLoadingState(LoadingState.ERROR);
      console.error(`Error in ${context}:`, error);
    },
    [setError, setLoadingState],
  );

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  const loadCuttingListsFromBackend = useCallback(async (): Promise<void> => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController
    abortControllerRef.current = new AbortController();
    setLoadingState(LoadingState.LOADING);

    try {
      // ✅ FIXED: Using correct API client
      const response = await apiClient.get<ApiResponse<CuttingList[]>>(
        "/cutting-list",
        { signal: abortControllerRef.current.signal },
      );

      console.log("[CuttingListData] API Response:", {
        success: response.data.success,
        dataLength: response.data.data?.length,
        data: response.data.data,
      });

      if (response.data.success && response.data.data) {
        // ✅ CRITICAL FIX: Ensure data is always an array
        const lists = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        console.log("[CuttingListData] Setting lists:", lists.length);
        setCuttingLists(lists);
        setLoadingState(LoadingState.SUCCESS);
      } else {
        console.warn("[CuttingListData] API returned no data or unsuccessful");
        setCuttingLists([]);
        setLoadingState(LoadingState.SUCCESS);
      }
    } catch (error) {
      // Silently ignore abort errors (React Strict Mode)
      if (error instanceof Error && error.name === "CanceledError") {
        console.log("[CuttingListData] Request aborted (React Strict Mode)");
        return;
      }
      console.error("[CuttingListData] Error loading cutting lists:", error);
      handleError(error, "loadCuttingLists");
      setCuttingLists([]); // ✅ Set empty array on error
    }
  }, [handleError, setCuttingLists, setLoadingState]);

  const createCuttingList = useCallback(async (): Promise<void> => {
    if (!title.trim()) {
      handleError(new Error("Başlık gereklidir"), "createCuttingList");
      return;
    }

    setLoadingState(LoadingState.LOADING);

    try {
      console.log("🚀 [createCuttingList] Starting API call with:", {
        title: title.trim(),
        weekNumber: selectedWeekNumber,
      });

      // ✅ FIXED: Using proper API function from entities layer
      const newCuttingList = await createCuttingListApi({
        name: title.trim(), // Backend expects 'name' field
        weekNumber: selectedWeekNumber,
      });

      console.log(
        "✅ [createCuttingList] API call successful:",
        newCuttingList,
      );

      setCuttingList(newCuttingList as CuttingList);
      await loadCuttingListsFromBackend();
      setSuccess(`${selectedWeekNumber}. hafta kesim listesi oluşturuldu`);
      setLoadingState(LoadingState.SUCCESS);
    } catch (error) {
      handleError(error, "createCuttingList");
    }
  }, [
    title,
    selectedWeekNumber,
    handleError,
    setCuttingList,
    loadCuttingListsFromBackend,
    setSuccess,
    setLoadingState,
  ]);

  const addProductSection = useCallback(
    async (productNameParam?: string): Promise<void> => {
      // ✅ CRITICAL FIX: Accept productName as parameter to avoid race condition
      const effectiveProductName = productNameParam ?? productName;

      if (!effectiveProductName.trim() || !cuttingList) {
        handleError(
          new Error("Ürün adı ve kesim listesi gereklidir"),
          "addProductSection",
        );
        return;
      }

      // ✅ P1-6: Optimistic update - Save previous state
      const previousCuttingList = cuttingList;

      // ✅ P1-6: Create optimistic product section
      const optimisticSection: ProductSection = {
        id: `temp-${Date.now()}`,
        productName: effectiveProductName.trim(),
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setLoadingState(LoadingState.LOADING);

      try {
        // ✅ MIGRATED: Using cuttingListApi function with proper auth
        const { addProductSection } = await import(
          "@/entities/cutting-list/api/cuttingListApi"
        );

        const realSection = await addProductSection(cuttingList.id, {
          productName: effectiveProductName.trim(),
        });

        // ✅ DIRECT UPDATE: No optimistic update, direct real data
        const finalSections = [
          ...cuttingList.sections,
          realSection as unknown as ProductSection, // Type compatibility fix
        ];

        // ✅ CRITICAL FIX: Create a new object reference to trigger React re-render
        const updatedCuttingList: CuttingList = {
          ...cuttingList,
          sections: finalSections,
          updatedAt: new Date().toISOString(),
        };

        setCuttingList(updatedCuttingList);
        setShowNewProductDialog(false);
        setSuccess("Ürün bölümü eklendi");
        setLoadingState(LoadingState.SUCCESS);
      } catch (error) {
        handleError(error, "addProductSection");
      }
    },
    [
      productName,
      cuttingList,
      handleError,
      setCuttingList,
      setShowNewProductDialog,
      setSuccess,
      setLoadingState,
    ],
  );

  const addItemToSection = useCallback(async (): Promise<void> => {
    if (!isFormValid || !currentSectionId || !cuttingList) return;

    setLoadingState(LoadingState.LOADING);

    try {
      const priorityMapped: "low" | "medium" | "high" | "urgent" =
        newItemForm.priority === "1" ? "medium" : "high";
      const itemData = {
        workOrderId: newItemForm.workOrderId,
        date: newItemForm.date,
        version: newItemForm.version,
        color: newItemForm.color,
        note: newItemForm.note,
        orderQuantity: parseInt(newItemForm.orderQuantity),
        size: newItemForm.size,
        priority: priorityMapped,
        status: "draft" as const,
        profiles: newItemForm.profiles.map((p) => ({
          id: p.id,
          profile: p.profile,
          measurement:
            p.measurement && !p.measurement.includes("mm")
              ? `${p.measurement}mm`
              : p.measurement,
          quantity: parseInt(p.quantity),
        })),
      };

      // ✅ FIXED: Using centralized API client
      const response = await addItemToSectionAPI(
        cuttingList.id,
        currentSectionId,
        itemData,
      );

      // ✅ FIXED: cuttingListApi.addItemToSection returns CuttingListItem, cast to WorkOrderItem
      const newItem = response as unknown as WorkOrderItem;

      const updatedSections = cuttingList.sections.map((section) => {
        if (section.id === currentSectionId) {
          return { ...section, items: [...section.items, newItem] };
        }
        return section;
      });

      setCuttingList({ ...cuttingList, sections: updatedSections });
      resetNewItemForm();
      setShowNewItemDialog(false);
      setSuccess("İş emri eklendi");
      setLoadingState(LoadingState.SUCCESS);
    } catch (error) {
      const axiosError = error as {
        message?: string;
        response?: { status?: number; data?: unknown };
        config?: { url?: string };
      };
      console.error("❌ addItemToSection FAILED:", {
        errorMessage: axiosError?.message,
        responseStatus: axiosError?.response?.status,
        responseData: axiosError?.response?.data,
        requestURL: axiosError?.config?.url,
        cuttingListId: cuttingList?.id,
        sectionId: currentSectionId,
        itemData: {
          workOrderId: newItemForm.workOrderId,
          date: newItemForm.date,
          version: newItemForm.version,
          color: newItemForm.color,
          orderQuantity: newItemForm.orderQuantity,
          size: newItemForm.size,
          profiles: newItemForm.profiles,
        },
      });
      handleError(error, "addItemToSection");
    }
  }, [
    isFormValid,
    currentSectionId,
    cuttingList,
    newItemForm,
    handleError,
    setCuttingList,
    resetNewItemForm,
    setShowNewItemDialog,
    setSuccess,
    setLoadingState,
  ]);

  const updateItemInSection = useCallback(async (): Promise<void> => {
    if (!editingItem || !currentSectionId || !cuttingList) return;

    setLoadingState(LoadingState.LOADING);

    try {
      // ✅ Use editingItem directly - it's already updated by dialog
      const updatedPriority: "low" | "medium" | "high" | "urgent" =
        editingItem.priority === "1" ? "medium" : "high";
      const itemData = {
        workOrderId: editingItem.workOrderId,
        date: editingItem.date,
        version: editingItem.version,
        color: editingItem.color,
        note: editingItem.note,
        orderQuantity:
          typeof editingItem.orderQuantity === "string"
            ? parseInt(editingItem.orderQuantity)
            : editingItem.orderQuantity,
        size: editingItem.size,
        priority: updatedPriority,
        status: editingItem.status ?? "draft",
        // ✅ FIX: Ensure profiles is always an array
        profiles: (Array.isArray(editingItem.profiles)
          ? editingItem.profiles
          : []
        ).map((p) => ({
          id: p.id,
          profile: p.profile,
          measurement:
            p.measurement && !p.measurement.includes("mm")
              ? `${p.measurement}mm`
              : p.measurement,
          quantity:
            typeof p.quantity === "string" ? parseInt(p.quantity) : p.quantity,
        })),
      };

      // DEBUG: Log item update details
      console.log("🔍 Frontend update debug", {
        cuttingListId: cuttingList.id,
        sectionId: currentSectionId,
        itemId: editingItem.id,
        itemData: itemData,
      });

      // ✅ MIGRATED: Using new shared API client
      const response = await apiClient.put<ApiResponse<WorkOrderItem>>(
        `/cutting-list/${cuttingList.id}/sections/${currentSectionId}/items/${editingItem.id}`,
        itemData,
      );

      if (response.data.success && response.data.data) {
        const updatedSections = cuttingList.sections.map((section) => {
          if (section.id === currentSectionId) {
            return {
              ...section,
              items: section.items.map((item) =>
                item.id === editingItem.id ? response.data.data! : item,
              ),
            };
          }
          return section;
        });

        setCuttingList({ ...cuttingList, sections: updatedSections });
        resetNewItemForm();
        setEditingItem(null);
        setShowEditItemDialog(false);
        setSuccess("İş emri güncellendi");
        setLoadingState(LoadingState.SUCCESS);
      } else {
        throw new Error(response.data.error || "İş emri güncellenemedi");
      }
    } catch (error) {
      handleError(error, "updateItemInSection");
    }
  }, [
    editingItem,
    currentSectionId,
    cuttingList,
    handleError,
    setCuttingList,
    resetNewItemForm,
    setEditingItem,
    setShowEditItemDialog,
    setSuccess,
    setLoadingState,
  ]);

  const deleteItem = useCallback(
    async (sectionId: string, itemId: string): Promise<void> => {
      if (!cuttingList) return;

      setLoadingState(LoadingState.LOADING);

      try {
        // ✅ MIGRATED: Using new shared API client
        await apiClient.delete(
          `/cutting-list/${cuttingList.id}/sections/${sectionId}/items/${itemId}`,
        );

        const updatedSections = cuttingList.sections.map((section) => {
          if (section.id === sectionId) {
            return {
              ...section,
              items: section.items.filter((item) => item.id !== itemId),
            };
          }
          return section;
        });

        setCuttingList({ ...cuttingList, sections: updatedSections });
        setSuccess("İş emri silindi");
        setLoadingState(LoadingState.SUCCESS);
      } catch (error) {
        handleError(error, "deleteItem");
      }
    },
    [cuttingList, handleError, setCuttingList, setSuccess, setLoadingState],
  );

  const deleteSection = useCallback(
    async (sectionId: string): Promise<void> => {
      if (!cuttingList) return;

      setLoadingState(LoadingState.LOADING);

      try {
        // ✅ MIGRATED: Using new shared API client
        await apiClient.delete(
          `/cutting-list/${cuttingList.id}/sections/${sectionId}`,
        );

        const updatedSections = cuttingList.sections.filter(
          (section) => section.id !== sectionId,
        );
        setCuttingList({ ...cuttingList, sections: updatedSections });
        setSuccess("Ürün kategorisi silindi");
        setLoadingState(LoadingState.SUCCESS);
      } catch (error) {
        handleError(error, "deleteSection");
      }
    },
    [cuttingList, handleError, setCuttingList, setSuccess, setLoadingState],
  );

  const exportToPDF = useCallback(async (): Promise<void> => {
    if (!cuttingList) return;

    setLoadingState(LoadingState.LOADING);

    try {
      // ✅ MIGRATED: Using new shared API client
      const response = await apiClient.post(
        "/cutting-list/export/pdf",
        { cuttingList },
        { responseType: "blob" },
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${cuttingList.title.replace(/[^a-zA-Z0-9\s]/g, "")}_${cuttingList.weekNumber}_hafta.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess("PDF başarıyla indirildi");
      setLoadingState(LoadingState.SUCCESS);
    } catch (error) {
      handleError(error, "exportToPDF");
    }
  }, [cuttingList, handleError, setSuccess, setLoadingState]);

  const exportToExcel = useCallback(async (): Promise<void> => {
    if (!cuttingList) return;

    setLoadingState(LoadingState.LOADING);

    try {
      // ✅ MIGRATED: Using new shared API client
      const response = await apiClient.post(
        "/cutting-list/export/excel",
        { cuttingList },
        { responseType: "blob" },
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${cuttingList.title.replace(/[^a-zA-Z0-9\s]/g, "")}_${cuttingList.weekNumber}_hafta.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess("Excel başarıyla indirildi");
      setLoadingState(LoadingState.SUCCESS);
    } catch (error) {
      handleError(error, "exportToExcel");
    }
  }, [cuttingList, handleError, setSuccess, setLoadingState]);

  // Update Section
  const updateSection = useCallback(
    async (sectionId: string, updatedData: { productName: string }) => {
      if (!cuttingList) return;

      try {
        setLoadingState(LoadingState.LOADING);

        // Update section in the current cutting list
        const updatedSections = cuttingList.sections.map((section) =>
          section.id === sectionId
            ? { ...section, productName: updatedData.productName }
            : section,
        );

        const updatedCuttingList = {
          ...cuttingList,
          sections: updatedSections,
        };

        setCuttingList(updatedCuttingList);
        setSuccess("Ürün bölümü başarıyla güncellendi");
      } catch (error) {
        handleError(error, "Ürün bölümü güncellenirken hata oluştu");
      } finally {
        setLoadingState(LoadingState.IDLE);
      }
    },
    [cuttingList, setCuttingList, setLoadingState, setSuccess, handleError],
  );

  return {
    loadCuttingListsFromBackend,
    createCuttingList,
    addProductSection,
    addItemToSection,
    updateItemInSection,
    updateSection,
    deleteItem,
    deleteSection,
    exportToPDF,
    exportToExcel,
    handleError,
  };
};
