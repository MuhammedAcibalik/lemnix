/**
 * @fileoverview Custom hook for optimization state management
 * @module useOptimizationState
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  OptimizationResult, 
  ExportOptions, 
  CuttingPlanModalState, 
  KesimDetaylariModalState,
  WorkOrder,
  Segment,
  Cut
} from '../types';

export const useOptimizationState = (result: OptimizationResult | null, onExport?: () => void) => {
  // State management
  const [tabValue, setTabValue] = useState(0);
  const [expandedWorkOrder, setExpandedWorkOrder] = useState<string | null>(null);
  const [cuttingPlanModal, setCuttingPlanModal] = useState<CuttingPlanModalState>({ 
    open: false, 
    stock: null 
  });

  const [kesimDetaylariModal, setKesimDetaylariModal] = useState<KesimDetaylariModalState>({ 
    open: false, 
    workOrder: null 
  });
  const [useProfileOptimization, setUseProfileOptimization] = useState(false);
  const [profileOptimizationResult, setProfileOptimizationResult] = useState(null);
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [textExplanationOpen, setTextExplanationOpen] = useState<{
    [key: string]: boolean;
  }>({});
  const [explanationData, setExplanationData] = useState<{
    [key: string]: string;
  }>({});
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "pdf",
    includeCharts: true,
    includeDetails: true,
    language: "tr",
  });
  const [isExporting, setIsExporting] = useState(false);

  // Actions - ✅ FIX: useCallback to prevent re-renders
  const handleWorkOrderClick = useCallback((workOrderId: string) => {
    const newExpanded = expandedWorkOrder === workOrderId ? null : workOrderId;
    setExpandedWorkOrder(newExpanded);
  }, [expandedWorkOrder]);

  const handleCuttingPlanDetails = useCallback((stock: Cut) => {
    const normalizedStock: Cut = { 
      ...stock, 
      id: stock.id || `stock_${Math.random().toString(36).substr(2, 9)}`,
      segments: stock.segments || []
    };
    setCuttingPlanModal({ open: true, stock: normalizedStock });
  }, []);

  const handleTextExplanation = useCallback((cardId: string, group: { cuts: Cut[] }, groupData: { totalPieces: number; barCount: number; avgRemaining: number; groupEfficiency: number }) => {
    const explanation = generateCuttingPatternExplanation(group, groupData);
    setExplanationData((prev) => ({
      ...prev,
      [cardId]: explanation,
    }));
    setTextExplanationOpen((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  }, []);

  const handleExport = useCallback(async () => {
    // Early return pattern with guard clause
    if (!result) return;

    setIsExporting(true);
    
    try {
      const response = await fetch("/api/enterprise/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resultId: result.cuts?.[0]?.id || `result_${Date.now()}`,
          ...exportOptions,
        }),
      });

      const data = await response.json();

      // Modern conditional execution with optional chaining
      data.success && (() => {
        // Simulate download
        const link = document.createElement("a");
        link.href = data.data.downloadUrl;
        link.download = `optimization_report.${exportOptions.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  }, [result, exportOptions, onExport]);

  const fetchProfileOptimization = useCallback(async () => {
    if (!result?.cuts) return;

    try {
      const items = result.cuts.flatMap(
        (cut) =>
          cut.segments?.map((segment: Segment) => ({
            profileType: segment.profileType,
            length: segment.length,
            quantity: segment.quantity,
            workOrderId: segment.workOrderId || "UNKNOWN_WORK_ORDER",
            productName: segment.workOrderItemId,
          })) || []
      );

      const response = await fetch("/api/enterprise/optimize-by-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfileOptimizationResult(data.data);
        console.log("✅ Profil optimizasyonu başarılı:", data.data);
      } else {
        console.error("❌ Profil optimizasyonu hatası:", response.status);
      }
    } catch (error) {
      console.error("❌ Profil optimizasyonu API hatası:", error);
    }
  }, [result?.cuts]);

  // Profile optimization effect
  useEffect(() => {
    if (useProfileOptimization && result?.cuts) {
      fetchProfileOptimization();
    }
  }, [useProfileOptimization, result?.cuts, fetchProfileOptimization]);

  return {
    // State
    tabValue,
    setTabValue,
    expandedWorkOrder,
    setExpandedWorkOrder,
    cuttingPlanModal,
    setCuttingPlanModal,
    kesimDetaylariModal,
    setKesimDetaylariModal,
    useProfileOptimization,
    setUseProfileOptimization,
    profileOptimizationResult,
    setProfileOptimizationResult,
    showProfileInfo,
    setShowProfileInfo,
    textExplanationOpen,
    setTextExplanationOpen,
    explanationData,
    setExplanationData,
    exportOptions,
    setExportOptions,
    isExporting,
    setIsExporting,
    
    // Actions
    handleWorkOrderClick,
    handleCuttingPlanDetails,
    handleTextExplanation,
    handleExport,
    fetchProfileOptimization
  };
};

// Helper function for generating cutting pattern explanations
function generateCuttingPatternExplanation(group: { cuts: Cut[] }, groupData: { totalPieces: number; barCount: number; avgRemaining: number; groupEfficiency: number }) {
  const { totalPieces, barCount, avgRemaining, groupEfficiency } = groupData;
  const stockLength = group.cuts[0]?.stockLength || 6100;
  const profileType = group.cuts[0]?.profileType || "Bilinmeyen";

  let explanation = `📊 **${profileType} Profil Tipi Kesim Analizi**\n\n`;

  // Genel bilgiler
  explanation += `🔹 **Stok Uzunluğu:** ${stockLength} mm\n`;
  explanation += `🔹 **Kullanılan Profil Sayısı:** ${barCount} adet\n`;
  explanation += `🔹 **Toplam Kesilen Parça:** ${totalPieces} adet\n`;
  explanation += `🔹 **Ortalama Atık:** ${avgRemaining} mm\n`;
  explanation += `🔹 **Verimlilik Oranı:** %${groupEfficiency.toFixed(1)}\n\n`;

  // Detaylı kesim deseni
  explanation += `📋 **Kesim Deseni Detayları:**\n`;

  group.cuts.forEach((cut: Cut, index: number) => {
    const usedLength = cut.usedLength || 0;
    const waste = cut.remainingLength || 0;
    const segmentCount = cut.segments?.length || 0;

    explanation += `\n**${index + 1}. Profil:**\n`;
    explanation += `   • Kullanılan uzunluk: ${usedLength} mm\n`;
    explanation += `   • Kalan atık: ${waste} mm\n`;
    explanation += `   • Kesilen parça sayısı: ${segmentCount} adet\n`;

    // Modern conditional rendering with optional chaining
    const hasSegments = (cut.segments?.length || 0) > 0;
    hasSegments && (explanation += `   • Parça detayları:\n`);
    hasSegments && (cut.segments as Segment[]).forEach((segment: Segment, segIndex: number) => {
      explanation += `     - ${segment.length} mm × ${segment.quantity} adet\n`;
    });
  });

  // Verimlilik analizi - Modern pattern matching
  explanation += `\n📈 **Verimlilik Analizi:**\n`;
  
  const efficiencyAnalysis = [
    { threshold: 90, message: '✅ Mükemmel verimlilik! Atık oranı çok düşük.\n', condition: (eff: number) => eff >= 90 },
    { threshold: 80, message: '✅ İyi verimlilik. Atık oranı kabul edilebilir seviyede.\n', condition: (eff: number) => eff >= 80 },
    { threshold: 70, message: '⚠️ Orta verimlilik. Atık oranı yüksek, optimizasyon önerilir.\n', condition: (eff: number) => eff >= 70 },
    { threshold: 0, message: '❌ Düşük verimlilik. Atık oranı çok yüksek, yeniden optimizasyon gerekli.\n', condition: () => true }
  ].find(({ condition }) => condition(groupEfficiency));
  
  explanation += efficiencyAnalysis?.message || '❌ Verimlilik analizi yapılamadı.\n';

  // Öneriler - Modern conditional rendering
  explanation += `\n💡 **Öneriler:**\n`;
  
  const recommendations = [
    { condition: avgRemaining > 200, message: `• Ortalama atık yüksek (${avgRemaining} mm). Parça boyutlarını gözden geçirin.\n` },
    { condition: barCount > 10, message: `• Çok fazla profil kullanılıyor (${barCount} adet). Parça gruplandırmasını optimize edin.\n` },
    { condition: groupEfficiency < 85, message: `• Farklı optimizasyon algoritması deneyin.\n` }
  ];
  
  recommendations
    .filter(({ condition }) => condition)
    .forEach(({ message }) => explanation += message);

  return explanation;
}
