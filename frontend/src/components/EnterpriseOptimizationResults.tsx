/**
 * @fileoverview Kurumsal Optimizasyon Sonuç Ekranı
 * @module EnterpriseOptimizationResults
 * @version 1.0.0
 *
 * Enterprise-grade sonuç görselleştirme ve analiz komponenti
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Chip,
  Avatar,
  Stack,
  Divider,
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  useTheme,
  alpha,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Speed as SpeedIcon,
  Science as ScienceIcon,
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon,
  AccountTree as TreeIcon,
  Insights as InsightsIcon,
  Engineering as EngineeringIcon,
  Recycling as RecyclingIcon,
  LocalShipping as ShippingIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Description as DescriptionIcon,
  Close as CloseIcon,
  ContentCut as CutIcon,
} from "@mui/icons-material";
import ProfileOptimizationResults from "./ProfileOptimizationResults";
import ModernCuttingPlan from "./ModernCuttingPlan";

interface OptimizationResult {
  id?: string;
  cuts: Array<{
    id: string;
    stockLength: number;
    segments: Array<{
      id: string;
      length: number;
      quantity: number;
      workOrderId?: string;
      workOrderItemId?: string;
      profileType: string;
    }>;
    usedLength: number;
    remainingLength: number;
    isReclaimable?: boolean;
    workOrderId?: string;
    profileType?: string;
    quantity?: number;
    segmentCount?: number;
    planLabel?: string;
    // Pooling-specific fields
    workOrderBreakdown?: Array<{ workOrderId: string | number; count: number }>;
    isMixed?: boolean;
    poolKey?: string;
  }>;
  efficiency: number;
  wastePercentage: number;
  totalCost: number;
  totalWaste: number;
  stockCount: number;
  totalSegments?: number;
  confidence: number;
  costBreakdown?: Record<string, number>;
  costPerMeter?: number;
  recommendations?: Array<{
    severity?: string;
    message: string;
    description?: string;
    suggestion?: string;
    expectedImprovement?: number;
  }>;
  executionTimeMs: number;
  algorithm?: string;
  performanceMetrics?: {
    algorithmComplexity?: string;
    convergenceRate?: number;
    cpuUsage?: number;
    memoryUsage?: number;
    scalability?: number;
  };
  // Advanced optimization specific fields
  paretoFrontier?: Array<{
    waste: number;
    cost: number;
    time: number;
    efficiency: number;
  }>;
  totalKerfLoss?: number;
  totalSafetyReserve?: number;
}

interface OptimizationResultsProps {
  result: OptimizationResult | null;
  cuttingList?: Array<{
    id: string;
    workOrderId: string;
    color: string;
    version: string;
    size: string;
    profileType: string;
    length: number;
    quantity: number;
    cuttingPattern: string;
  }>;
  onNewOptimization?: () => void;
  onExport?: () => void;
}

interface ExportOptions {
  format: "pdf" | "excel" | "json" | "csv";
  includeCharts: boolean;
  includeDetails: boolean;
  language: "tr" | "en";
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const EnterpriseOptimizationResults: React.FC<
  OptimizationResultsProps
> = ({ result, cuttingList = [], onNewOptimization, onExport }) => {
  const theme = useTheme();
  // Results component initialized

  // cuttingList'i result.cuts'tan oluştur
  const processedCuttingList = React.useMemo(() => {
    if (!result?.cuts) return [];

    const items: Array<{
      id: string;
      workOrderId: string;
      version: string;
      color: string;
      size: string;
      profileType: string;
      length: number;
      quantity: number;
      cuttingPattern: string;
    }> = [];

    result.cuts.forEach((cut) => {
      cut.segments?.forEach((segment) => {
        // Use workOrderId, workOrderItemId, or fallback to cut ID
        const workOrderId =
          segment.workOrderId ||
          segment.workOrderItemId ||
          cut.id ||
          "DEFAULT_WORK_ORDER";

        if (workOrderId) {
          items.push({
            id: `${workOrderId}-${segment.profileType}-${segment.length}`,
            workOrderId: workOrderId,
            version: "V1.0",
            color: "Eloksal",
            size: "40x40",
            profileType: segment.profileType,
            length: segment.length,
            quantity: segment.quantity,
            cuttingPattern: "Standart",
          });
        }
      });
    });

    // Tekrarları kaldır ve grupla
    const uniqueItems = items.reduce(
      (acc, item) => {
        const key = `${item.workOrderId}-${item.profileType}-${item.length}`;
        if (!acc[key]) {
          acc[key] = item;
        } else {
          acc[key].quantity += item.quantity;
        }
        return acc;
      },
      {} as Record<string, (typeof items)[0]>
    );

    const finalItems = Object.values(uniqueItems);
    // Processing cutting list data
    return finalItems;
  }, [result?.cuts]);
  const [tabValue, setTabValue] = useState(0);
  const [expandedCut, setExpandedCut] = useState<number | null>(null);
  const [cuttingPlanModal, setCuttingPlanModal] = useState<{
    open: boolean;
    stock: any;
  }>({ open: false, stock: null });
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [useProfileOptimization, setUseProfileOptimization] = useState(false);
  const [profileOptimizationResult, setProfileOptimizationResult] =
    useState(null);
  const [showProfileInfo, setShowProfileInfo] = useState(false);

  const handleCuttingPlanDetails = (stock: any) => {
    setCuttingPlanModal({ open: true, stock });
  };
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "pdf",
    includeCharts: true,
    includeDetails: true,
    language: "tr",
  });
  const [isExporting, setIsExporting] = useState(false);
  const [analytics, setAnalytics] = useState<{
    timeRange: string;
    metrics: Record<
      string,
      { current: number; average: number; trend: string }
    >;
    algorithm?: string;
    generatedAt: string;
  } | null>(null);
  const [systemHealth, setSystemHealth] = useState<{
    status: string;
    services: Record<string, { status: string; responseTime: number }>;
    metrics: Record<string, number>;
    uptime: number;
    version: string;
  } | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isLoadingSystemHealth, setIsLoadingSystemHealth] = useState(false);
  const [expandedWorkOrder, setExpandedWorkOrder] = useState<string | null>(
    null
  );

  // Metinsel açıklama state'leri
  const [textExplanationOpen, setTextExplanationOpen] = useState<{
    [key: string]: boolean;
  }>({});
  const [explanationData, setExplanationData] = useState<{
    [key: string]: string;
  }>({});

  // Metinsel açıklama fonksiyonları
  const generateCuttingPatternExplanation = (group: any, groupData: any) => {
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

    group.cuts.forEach((cut: any, index: number) => {
      const usedLength = cut.usedLength || 0;
      const waste = cut.remainingLength || 0;
      const segmentCount = cut.segments?.length || 0;

      explanation += `\n**${index + 1}. Profil:**\n`;
      explanation += `   • Kullanılan uzunluk: ${usedLength} mm\n`;
      explanation += `   • Kalan atık: ${waste} mm\n`;
      explanation += `   • Kesilen parça sayısı: ${segmentCount} adet\n`;

      if (cut.segments && cut.segments.length > 0) {
        explanation += `   • Parça detayları:\n`;
        cut.segments.forEach((segment: any, segIndex: number) => {
          explanation += `     - ${segment.length} mm × ${segment.quantity} adet\n`;
        });
      }
    });

    // Verimlilik analizi
    explanation += `\n📈 **Verimlilik Analizi:**\n`;
    if (groupEfficiency >= 90) {
      explanation += `✅ Mükemmel verimlilik! Atık oranı çok düşük.\n`;
    } else if (groupEfficiency >= 80) {
      explanation += `✅ İyi verimlilik. Atık oranı kabul edilebilir seviyede.\n`;
    } else if (groupEfficiency >= 70) {
      explanation += `⚠️ Orta verimlilik. Atık oranı yüksek, optimizasyon önerilir.\n`;
    } else {
      explanation += `❌ Düşük verimlilik. Atık oranı çok yüksek, yeniden optimizasyon gerekli.\n`;
    }

    // Öneriler
    explanation += `\n💡 **Öneriler:**\n`;
    if (avgRemaining > 200) {
      explanation += `• Ortalama atık yüksek (${avgRemaining} mm). Parça boyutlarını gözden geçirin.\n`;
    }
    if (barCount > 10) {
      explanation += `• Çok fazla profil kullanılıyor (${barCount} adet). Parça gruplandırmasını optimize edin.\n`;
    }
    if (groupEfficiency < 85) {
      explanation += `• Farklı optimizasyon algoritması deneyin.\n`;
    }

    return explanation;
  };

  const handleTextExplanation = (
    cardId: string,
    group: any,
    groupData: any
  ) => {
    const explanation = generateCuttingPatternExplanation(group, groupData);
    setExplanationData((prev) => ({
      ...prev,
      [cardId]: explanation,
    }));
    setTextExplanationOpen((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  // Data validation helper functions
  const validateAnalyticsData = (data: any): boolean => {
    try {
      if (!data || typeof data !== "object") return false;
      if (!data.timeRange || typeof data.timeRange !== "string") return false;
      if (!data.metrics || typeof data.metrics !== "object") return false;
      if (!data.generatedAt || typeof data.generatedAt !== "string")
        return false;

      const requiredMetrics = ["efficiency", "cost", "waste", "performance"];
      for (const metric of requiredMetrics) {
        if (!data.metrics[metric] || typeof data.metrics[metric] !== "object")
          return false;
        if (typeof data.metrics[metric].current !== "number") return false;
        if (typeof data.metrics[metric].average !== "number") return false;
        if (!["up", "down", "stable"].includes(data.metrics[metric].trend))
          return false;
      }

      return true;
    } catch (error) {
      console.error("Analytics data validation error:", error);
      return false;
    }
  };

  const validateSystemHealthData = (data: any): boolean => {
    try {
      if (!data || typeof data !== "object") return false;
      if (!data.status || typeof data.status !== "string") return false;
      if (!data.services || typeof data.services !== "object") return false;
      if (!data.metrics || typeof data.metrics !== "object") return false;
      if (typeof data.uptime !== "number") return false;
      if (!data.version || typeof data.version !== "string") return false;

      const requiredServices = [
        "Optimization Engine",
        "Database",
        "Cache",
        "API Gateway",
      ];
      for (const service of requiredServices) {
        if (
          !data.services[service] ||
          typeof data.services[service] !== "object"
        )
          return false;
        if (typeof data.services[service].status !== "string") return false;
        if (typeof data.services[service].responseTime !== "number")
          return false;
      }

      const requiredMetrics = [
        "cpuUsage",
        "memoryUsage",
        "diskUsage",
        "networkLatency",
      ];
      for (const metric of requiredMetrics) {
        if (typeof data.metrics[metric] !== "number") return false;
      }

      return true;
    } catch (error) {
      console.error("System health data validation error:", error);
      return false;
    }
  };

  // API çağrıları
  const handleExport = async () => {
    if (!result) return;

    setIsExporting(true);
    try {
      const response = await fetch("/api/enterprise/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resultId: result.id || `result_${Date.now()}`,
          ...exportOptions,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Simulate download
        const link = document.createElement("a");
        link.href = data.data.downloadUrl;
        link.download = `optimization_report.${exportOptions.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Real-time analytics and system health data from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoadingAnalytics(true);
      let retryCount = 0;
      const maxRetries = 3;
      const retryDelay = 1000; // 1 second

      while (retryCount < maxRetries) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          const response = await fetch(
            "/api/enterprise/analytics?timeRange=day",
            {
              signal: controller.signal,
              headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
              },
            }
          );

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              // Validate analytics data structure
              if (validateAnalyticsData(data.data)) {
                setAnalytics(data.data);
                return; // Success, exit retry loop
              } else {
                console.warn("Invalid analytics data structure:", data.data);
              }
            } else {
              console.warn("API returned unsuccessful response:", data);
            }
          } else {
            console.warn(
              `Analytics API returned ${response.status}: ${response.statusText}`
            );
          }
        } catch (error) {
          retryCount++;
          console.error(`Analytics fetch attempt ${retryCount} failed:`, {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            url: "/api/enterprise/analytics",
            timestamp: new Date().toISOString(),
            retryCount,
            maxRetries,
          });

          if (retryCount < maxRetries) {
            console.log(`Retrying analytics fetch in ${retryDelay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            continue;
          }
        }
      }

      // All retries failed, use fallback
      console.error("All analytics fetch attempts failed, using fallback data");
      setAnalytics({
        timeRange: "day",
        metrics: {
          efficiency: { current: 0, average: 0, trend: "stable" },
          cost: { current: 0, average: 0, trend: "stable" },
          waste: { current: 0, average: 0, trend: "stable" },
          performance: { current: 0, average: 0, trend: "stable" },
        },
        algorithm: "N/A",
        generatedAt: new Date().toISOString(),
      });
    };

    const fetchSystemHealth = async () => {
      setIsLoadingSystemHealth(true);
      let retryCount = 0;
      const maxRetries = 3;
      const retryDelay = 1000; // 1 second

      while (retryCount < maxRetries) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          const response = await fetch("/api/enterprise/system-health", {
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
            },
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              // Validate system health data structure
              if (validateSystemHealthData(data.data)) {
                setSystemHealth(data.data);
                return; // Success, exit retry loop
              } else {
                console.warn(
                  "Invalid system health data structure:",
                  data.data
                );
              }
            } else {
              console.warn("API returned unsuccessful response:", data);
            }
          } else {
            console.warn(
              `System health API returned ${response.status}: ${response.statusText}`
            );
          }
        } catch (error) {
          retryCount++;
          console.error(`System health fetch attempt ${retryCount} failed:`, {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            url: "/api/enterprise/system-health",
            timestamp: new Date().toISOString(),
            retryCount,
            maxRetries,
          });

          if (retryCount < maxRetries) {
            console.log(`Retrying system health fetch in ${retryDelay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            continue;
          }
        }
      }

      // All retries failed, use fallback
      console.error(
        "All system health fetch attempts failed, using fallback data"
      );
      setSystemHealth({
        status: "unknown",
        services: {
          "Optimization Engine": { status: "unknown", responseTime: 0 },
          Database: { status: "unknown", responseTime: 0 },
          Cache: { status: "unknown", responseTime: 0 },
          "API Gateway": { status: "unknown", responseTime: 0 },
        },
        metrics: {
          cpuUsage: 0,
          memoryUsage: 0,
          diskUsage: 0,
          networkLatency: 0,
        },
        uptime: 0,
        version: "1.0.0",
      });
    };

    // Fetch initial data
    fetchAnalytics();
    fetchSystemHealth();

    // Set up real-time updates every 30 seconds
    const analyticsInterval = setInterval(fetchAnalytics, 30000);
    const healthInterval = setInterval(fetchSystemHealth, 30000);

    return () => {
      clearInterval(analyticsInterval);
      clearInterval(healthInterval);
    };
  }, []);

  // Aynı profil tiplerini tespit et
  const checkDuplicateProfileTypes = useMemo(() => {
    if (!result?.cuts) return { hasDuplicates: false, duplicates: [] };

    const profileTypeCount = new Map();
    result.cuts.forEach((cut) => {
      cut.segments?.forEach((segment) => {
        const profileType = segment.profileType;
        if (profileTypeCount.has(profileType)) {
          profileTypeCount.set(
            profileType,
            profileTypeCount.get(profileType) + 1
          );
        } else {
          profileTypeCount.set(profileType, 1);
        }
      });
    });

    const duplicates = Array.from(profileTypeCount.entries())
      .filter(([_, count]) => count > 1)
      .map(([profileType, count]) => ({ profileType, count }));

    return {
      hasDuplicates: duplicates.length > 0,
      duplicates,
    };
  }, [result?.cuts]);

  // Profil optimizasyonu API çağrısı
  const fetchProfileOptimization = async () => {
    if (!result?.cuts) return;

    try {
      // Mevcut kesim sonuçlarından items oluştur
      const items = result.cuts.flatMap(
        (cut) =>
          cut.segments?.map((segment) => ({
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
  };

  // Profil optimizasyonu toggle değiştiğinde API çağrısı yap
  useEffect(() => {
    if (useProfileOptimization && result?.cuts) {
      fetchProfileOptimization();
    }
  }, [useProfileOptimization, result?.cuts]);

  // Aynı profil tipleri varsa bilgilendirme kartını göster
  useEffect(() => {
    if (checkDuplicateProfileTypes.hasDuplicates && result?.cuts) {
      setShowProfileInfo(true);
      // 10 saniye sonra kartı gizle
      const timer = setTimeout(() => {
        setShowProfileInfo(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [checkDuplicateProfileTypes.hasDuplicates, result?.cuts]);

  // Performans metrikleri hesaplama
  const performanceMetrics = useMemo(() => {
    if (!result) return null;

    // result is now directly the optimizationResult
    const efficiency = result.efficiency || 0;
    const wastePercentage = result.wastePercentage || 0;
    const utilizationRate = 100 - wastePercentage;
    const costPerUnit = result.totalCost / (result.cuts?.length || 1);
    const savingsPercentage = (
      (1 - result.totalCost / (result.totalCost * 1.3)) *
      100
    ).toFixed(1);

    return {
      efficiency,
      wastePercentage,
      utilizationRate,
      costPerUnit,
      savingsPercentage,
      qualityScore: result.confidence || 95,
      performanceScore: ((efficiency + utilizationRate) / 2).toFixed(1),
    };
  }, [result]);

  // Atık kategorileri analizi
  const wasteAnalysis = useMemo(() => {
    if (!result?.cuts) return null;

    const categories = {
      minimal: 0,
      small: 0,
      medium: 0,
      large: 0,
      excessive: 0,
      reclaimable: 0,
    };

    result.cuts.forEach((cut) => {
      const waste = cut.remainingLength || 0;
      if (waste < 50) categories.minimal++;
      else if (waste < 100) categories.small++;
      else if (waste < 200) categories.medium++;
      else if (waste < 500) categories.large++;
      else categories.excessive++;

      if (cut.isReclaimable) categories.reclaimable++;
    });

    return categories;
  }, [result]);

  const getSeverityColor = (
    value: number,
    thresholds: { good: number; warning: number }
  ) => {
    if (value >= thresholds.good) return "success";
    if (value >= thresholds.warning) return "warning";
    return "error";
  };

  const getRecommendationIcon = (severity: string) => {
    switch (severity) {
      case "critical":
      case "error":
        return <ErrorIcon color="error" />;
      case "warning":
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  // Algorithm profile descriptions (Turkish)
  const getAlgorithmProfile = (algorithm?: string) => {
    switch (algorithm?.toLowerCase()) {
      case "ffd":
        return {
          name: "FFD",
          description:
            "Azalan sırada ilk sığan çubuğa yerleştirir; hızlı ve deterministiktir.",
          details: "Sıralama: uzunluk desc • Yerleştirme: ilk uygun çubuk",
        };
      case "bfd":
        return {
          name: "BFD",
          description:
            "En az boşluk bırakacak çubuğu seçer; fireyi agresif düşürür.",
          details: "Yerleştirme: en az kalan boşluk",
        };
      case "nfd":
        return {
          name: "NFD",
          description:
            "Mevcut çubuk dolana dek doldurur; sonra yeni çubuğa geçer; çok hızlıdır.",
          details: "Yerleştirme: tek aktif çubuk",
        };
      case "wfd":
        return {
          name: "WFD",
          description:
            "En çok boşluğu olan çubuğu seçer; kaba ama bazı durumlarda işe yarar.",
          details: "Yerleştirme: en çok boşluk",
        };
      case "genetic":
        return {
          name: "GA",
          description:
            "Sıra-tabanlı arama; hedef ağırlıklarını dikkate alır (verim↑, fire↓, maliyet↓).",
          details: "Genetik algoritma optimizasyonu",
        };
      case "simulated-annealing":
        return {
          name: "SA",
          description: "Bu sürüm FFD/BFD fallback ile hesaplandı.",
          details: "Geçici implementasyon",
        };
      case "branch-and-bound":
        return {
          name: "BnB",
          description: "Bu sürüm FFD/BFD fallback ile hesaplandı.",
          details: "Geçici implementasyon",
        };
      default:
        return {
          name: "Bilinmeyen",
          description: "Algoritma bilgisi mevcut değil.",
          details: "Varsayılan optimizasyon",
        };
    }
  };

  // Central formatter for consistent length display
  const fmtMm = (n: number): string =>
    Number.isFinite(n) ? `${Math.round(n)} mm` : "—";

  // ✅ Alüminyum Profil Tipi İkonları
  const getProfileTypeIcon = (profileType: string) => {
    const type = profileType.toLowerCase();

    // T Profil - T şekli
    if (type.includes("t") || type.includes("tee")) {
      return (
        <Box
          sx={{
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <Box
            sx={{
              width: 16,
              height: 2,
              bgcolor: "currentColor",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
          <Box
            sx={{
              width: 2,
              height: 12,
              bgcolor: "currentColor",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </Box>
      );
    }

    // L Profil - L şekli
    if (type.includes("l") || type.includes("angle") || type.includes("köşe")) {
      return (
        <Box
          sx={{
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <Box
            sx={{
              width: 12,
              height: 2,
              bgcolor: "currentColor",
              position: "absolute",
              bottom: 4,
              left: 4,
            }}
          />
          <Box
            sx={{
              width: 2,
              height: 12,
              bgcolor: "currentColor",
              position: "absolute",
              bottom: 4,
              left: 4,
            }}
          />
        </Box>
      );
    }

    // U Profil - U şekli
    if (
      type.includes("u") ||
      type.includes("channel") ||
      type.includes("kanal")
    ) {
      return (
        <Box
          sx={{
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <Box
            sx={{
              width: 16,
              height: 2,
              bgcolor: "currentColor",
              position: "absolute",
              top: 4,
            }}
          />
          <Box
            sx={{
              width: 2,
              height: 12,
              bgcolor: "currentColor",
              position: "absolute",
              left: 4,
              top: 4,
            }}
          />
          <Box
            sx={{
              width: 2,
              height: 12,
              bgcolor: "currentColor",
              position: "absolute",
              right: 4,
              top: 4,
            }}
          />
        </Box>
      );
    }

    // Kutu Profil - Kare şekli
    if (
      type.includes("kutu") ||
      type.includes("box") ||
      type.includes("square") ||
      type.includes("kare")
    ) {
      return (
        <Box
          sx={{
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <Box
            sx={{
              width: 16,
              height: 16,
              border: "2px solid currentColor",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </Box>
      );
    }

    // Çubuk Profil - Yuvarlak şekil
    if (
      type.includes("çubuk") ||
      type.includes("bar") ||
      type.includes("round") ||
      type.includes("yuvarlak")
    ) {
      return (
        <Box
          sx={{
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <Box
            sx={{
              width: 16,
              height: 4,
              bgcolor: "currentColor",
              borderRadius: 2,
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </Box>
      );
    }

    // I Profil - I şekli
    if (type.includes("i") || type.includes("beam") || type.includes("kiriş")) {
      return (
        <Box
          sx={{
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <Box
            sx={{
              width: 16,
              height: 2,
              bgcolor: "currentColor",
              position: "absolute",
              top: 4,
            }}
          />
          <Box
            sx={{
              width: 2,
              height: 8,
              bgcolor: "currentColor",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
          <Box
            sx={{
              width: 16,
              height: 2,
              bgcolor: "currentColor",
              position: "absolute",
              bottom: 4,
            }}
          />
        </Box>
      );
    }

    // Sigma Profil - S şekli
    if (type.includes("sigma") || type.includes("s")) {
      return (
        <Box
          sx={{
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <Box
            sx={{
              width: 12,
              height: 2,
              bgcolor: "currentColor",
              position: "absolute",
              top: 4,
              left: 4,
            }}
          />
          <Box
            sx={{
              width: 2,
              height: 4,
              bgcolor: "currentColor",
              position: "absolute",
              top: 4,
              right: 4,
            }}
          />
          <Box
            sx={{
              width: 12,
              height: 2,
              bgcolor: "currentColor",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
          <Box
            sx={{
              width: 2,
              height: 4,
              bgcolor: "currentColor",
              position: "absolute",
              bottom: 4,
              left: 4,
            }}
          />
          <Box
            sx={{
              width: 12,
              height: 2,
              bgcolor: "currentColor",
              position: "absolute",
              bottom: 4,
              right: 4,
            }}
          />
        </Box>
      );
    }

    // LED Profil - Işık şekli
    if (type.includes("led") || type.includes("ışık")) {
      return (
        <Box
          sx={{
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <Box
            sx={{
              width: 16,
              height: 2,
              bgcolor: "currentColor",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
          <Box
            sx={{
              width: 2,
              height: 2,
              bgcolor: "currentColor",
              borderRadius: "50%",
              position: "absolute",
              top: 4,
              left: 4,
            }}
          />
          <Box
            sx={{
              width: 2,
              height: 2,
              bgcolor: "currentColor",
              borderRadius: "50%",
              position: "absolute",
              top: 4,
              right: 4,
            }}
          />
        </Box>
      );
    }

    // Varsayılan ikon - Genel profil
    return (
      <Box
        sx={{
          width: 24,
          height: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <Box
          sx={{
            width: 16,
            height: 2,
            bgcolor: "currentColor",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
        <Box
          sx={{
            width: 2,
            height: 8,
            bgcolor: "currentColor",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      </Box>
    );
  };

  // Fallback formatter for legacy responses
  const formatPlanLabelFromSegments = (
    segments: Array<{ length: number }>
  ): string => {
    if (!segments || segments.length === 0) return "Plan yok";
    const count = new Map<number, number>();
    segments.forEach((s) =>
      count.set(s.length, (count.get(s.length) ?? 0) + 1)
    );
    return [...count.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([L, n]) => `${n} × ${L} mm`)
      .join(" + ");
  };

  // Safe "has results" detection
  const hasResults = useMemo(() => {
    return Array.isArray(result?.cuts) && result.cuts.length > 0;
  }, [result?.cuts]);

  // Typed aggregator (dedupe Work Orders; group cuts)
  type Cut = {
    id?: string;
    stockLength: number;
    usedLength: number;
    remainingLength: number;
    segmentCount: number;
    planLabel?: string;
    segments?: Array<{
      length: number;
      workOrderId?: string;
      workOrderItemId?: string;
      profileType: string;
    }>;
    workOrderId?: string | number;
  };

  function buildEnterpriseRows(result: any): {
    workOrders: Array<{
      workOrderId: string | number;
      algorithm?: string;
      stockCount: number;
      totalSegments: number;
      efficiency?: number;
      cuts: Cut[];
    }>;
  } {
    const cuts: Cut[] = Array.isArray(result?.cuts) ? result.cuts : [];

    // Filter & narrow strictly
    const validCuts = cuts.filter(
      (c): c is Cut =>
        c &&
        Number.isFinite(c.stockLength) &&
        Number.isFinite(c.usedLength) &&
        Number.isFinite(c.remainingLength) &&
        Number.isFinite(c.segmentCount)
    );

    // Backfill workOrderId if missing (prefer parent on result/items)
    const defaultWO: string | number | undefined = result?.workOrderId;
    const grouped = new Map<string | number, Cut[]>();

    for (const c of validCuts) {
      // Try to find workOrderId from segments first, then cut level, then default
      let wo: string | number | undefined = undefined;

      // Check segments for workOrderId
      if (c.segments && c.segments.length > 0) {
        const segmentWithWO = c.segments.find(
          (s) => s.workOrderId || s.workOrderItemId
        );
        wo = segmentWithWO?.workOrderId || segmentWithWO?.workOrderItemId;
      }

      // Fallback to cut-level workOrderId
      if (!wo) {
        wo = c.workOrderId || defaultWO;
      }

      // If still no workOrderId, use a default
      if (wo === undefined || wo === null) {
        wo = "DEFAULT_WORK_ORDER";
      }

      const key = typeof wo === "number" ? wo : String(wo);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(c);
    }

    const workOrders = [...grouped.entries()].map(([wo, list]) => {
      const stockCount = list.length;
      const totalSegments = list.reduce((s, x) => s + (x.segmentCount || 0), 0);

      // ✅ Stabil ve tutarlı verimlilik hesaplaması
      const efficiencyResult = calculateWorkOrderEfficiency(list);

      // Debug logging for efficiency calculation
      if (import.meta.env.DEV) {
        console.log(`📊 Work Order ${wo} Efficiency Calculation:`, {
          workOrderId: wo,
          cutsCount: list.length,
          efficiency: efficiencyResult.efficiency,
          totalStockLength: efficiencyResult.totalStockLength,
          totalUsedLength: efficiencyResult.totalUsedLength,
          totalWaste: efficiencyResult.totalWaste,
          isValid: efficiencyResult.isValid,
          errors: efficiencyResult.errors,
        });
      }

      // Hata durumunda uyarı göster
      if (!efficiencyResult.isValid && efficiencyResult.errors.length > 0) {
        console.warn(
          `⚠️ Efficiency calculation errors for Work Order ${wo}:`,
          efficiencyResult.errors
        );
      }

      return {
        workOrderId: wo,
        algorithm: result?.algorithm,
        stockCount,
        totalSegments,
        efficiency: efficiencyResult.efficiency,
        cuts: list,
      };
    });

    return { workOrders };
  }

  // ✅ Stabil ve tutarlı verimlilik hesaplama fonksiyonu
  function calculateWorkOrderEfficiency(cuts: Cut[]): {
    efficiency: number;
    totalStockLength: number;
    totalUsedLength: number;
    totalWaste: number;
    isValid: boolean;
    errors: string[];
  } {
    // Edge Case 1: Boş cuts array
    if (!cuts || !Array.isArray(cuts) || cuts.length === 0) {
      return {
        efficiency: 0,
        totalStockLength: 0,
        totalUsedLength: 0,
        totalWaste: 0,
        isValid: true,
        errors: [],
      };
    }
    const errors: string[] = [];
    let totalStockLength = 0;
    let totalUsedLength = 0;
    let totalWaste = 0;

    // 1. Her cut için matematiksel doğruluk kontrolü
    for (const cut of cuts) {
      // Null/undefined kontrolü
      if (!cut || typeof cut !== "object") {
        errors.push(`Invalid cut object: ${JSON.stringify(cut)}`);
        continue;
      }

      // Edge Case 2: Cut ID kontrolü
      if (!cut.id || typeof cut.id !== "string") {
        errors.push(`Invalid cut ID: ${cut.id}`);
      }

      // Sayısal değer kontrolü
      const stockLength = Number(cut.stockLength);
      const usedLength = Number(cut.usedLength);
      const remainingLength = Number(cut.remainingLength);

      if (!isFinite(stockLength) || stockLength <= 0) {
        errors.push(
          `Invalid stockLength: ${cut.stockLength} for cut ${cut.id}`
        );
        continue;
      }

      if (!isFinite(usedLength) || usedLength < 0) {
        errors.push(`Invalid usedLength: ${cut.usedLength} for cut ${cut.id}`);
        continue;
      }

      if (!isFinite(remainingLength) || remainingLength < 0) {
        errors.push(
          `Invalid remainingLength: ${cut.remainingLength} for cut ${cut.id}`
        );
        continue;
      }

      // Edge Case 3: Çok büyük değerler kontrolü (overflow protection)
      if (stockLength > 1e6 || usedLength > 1e6 || remainingLength > 1e6) {
        errors.push(
          `Value too large (potential overflow): stockLength=${stockLength}, usedLength=${usedLength}, remainingLength=${remainingLength} for cut ${cut.id}`
        );
        continue;
      }

      // Edge Case 4: Çok küçük değerler kontrolü (precision issues)
      if (stockLength < 1e-6 && stockLength > 0) {
        errors.push(
          `Value too small (precision issues): stockLength=${stockLength} for cut ${cut.id}`
        );
      }

      // ✅ Invariant kontrolü: usedLength + remainingLength === stockLength
      const tolerance = 1e-9;
      const sum = usedLength + remainingLength;
      if (Math.abs(sum - stockLength) > tolerance) {
        errors.push(
          `Invariant violation: usedLength (${usedLength}) + remainingLength (${remainingLength}) !== stockLength (${stockLength}) for cut ${cut.id}`
        );
        continue;
      }

      // Değerleri topla
      totalStockLength += stockLength;
      totalUsedLength += usedLength;
      totalWaste += remainingLength;
    }

    // 2. Toplam değerlerin doğruluğunu kontrol et
    if (totalStockLength <= 0) {
      errors.push(
        `Total stock length is zero or negative: ${totalStockLength}`
      );
      return {
        efficiency: 0,
        totalStockLength: 0,
        totalUsedLength: 0,
        totalWaste: 0,
        isValid: false,
        errors,
      };
    }

    // Edge Case 5: Toplam değerlerin overflow kontrolü
    if (
      !isFinite(totalStockLength) ||
      !isFinite(totalUsedLength) ||
      !isFinite(totalWaste)
    ) {
      errors.push(
        `Total values are not finite: stockLength=${totalStockLength}, usedLength=${totalUsedLength}, waste=${totalWaste}`
      );
      return {
        efficiency: 0,
        totalStockLength: 0,
        totalUsedLength: 0,
        totalWaste: 0,
        isValid: false,
        errors,
      };
    }

    // Edge Case 6: Kullanılan uzunluk çubuk uzunluğundan fazla olamaz
    if (totalUsedLength > totalStockLength) {
      errors.push(
        `Used length (${totalUsedLength}) cannot be greater than stock length (${totalStockLength})`
      );
    }

    // 3. Verimlilik hesaplaması (tutarlı formül)
    // Formül: (Kullanılan Uzunluk / Toplam Çubuk Uzunluğu) × 100
    const efficiency = (totalUsedLength / totalStockLength) * 100;

    // 4. Verimlilik değerinin geçerliliğini kontrol et
    if (!isFinite(efficiency) || efficiency < 0 || efficiency > 100) {
      errors.push(`Invalid efficiency calculated: ${efficiency}`);
      return {
        efficiency: 0,
        totalStockLength,
        totalUsedLength,
        totalWaste,
        isValid: false,
        errors,
      };
    }

    // 5. Son kontrol: Toplam tutarlılık
    const totalCheck = totalUsedLength + totalWaste;
    if (Math.abs(totalCheck - totalStockLength) > 1e-9) {
      errors.push(
        `Total consistency check failed: usedLength (${totalUsedLength}) + waste (${totalWaste}) !== stockLength (${totalStockLength})`
      );
    }

    // 6. Precision ve rounding işlemleri
    const precision = 100; // 2 decimal places
    const roundedEfficiency = Math.round(efficiency * precision) / precision;
    const roundedStockLength =
      Math.round(totalStockLength * precision) / precision;
    const roundedUsedLength =
      Math.round(totalUsedLength * precision) / precision;
    const roundedWaste = Math.round(totalWaste * precision) / precision;

    // 7. Final validation
    const finalEfficiency = Math.max(0, Math.min(100, roundedEfficiency)); // Clamp between 0-100

    return {
      efficiency: finalEfficiency,
      totalStockLength: roundedStockLength,
      totalUsedLength: roundedUsedLength,
      totalWaste: roundedWaste,
      isValid: errors.length === 0,
      errors,
    };
  }

  // Build pool-based rows for pooling optimization
  function buildPoolRows(result: any): {
    pools: Array<{
      poolKey: string;
      profileType: string;
      workOrderCount: number;
      stockCount: number;
      totalSegments: number;
      efficiency: number;
      cuts: Array<
        Cut & {
          workOrderBreakdown?: Array<{
            workOrderId: string | number;
            count: number;
          }>;
          isMixed?: boolean;
          poolKey?: string;
        }
      >;
    }>;
  } {
    const cuts: Array<
      Cut & {
        workOrderBreakdown?: Array<{
          workOrderId: string | number;
          count: number;
        }>;
        isMixed?: boolean;
        poolKey?: string;
      }
    > = Array.isArray(result?.cuts) ? result.cuts : [];

    // Group cuts by poolKey
    const poolMap = new Map<
      string,
      Array<
        Cut & {
          workOrderBreakdown?: Array<{
            workOrderId: string | number;
            count: number;
          }>;
          isMixed?: boolean;
          poolKey?: string;
        }
      >
    >();

    cuts.forEach((cut) => {
      const poolKey = cut.poolKey || "default";
      if (!poolMap.has(poolKey)) {
        poolMap.set(poolKey, []);
      }
      poolMap.get(poolKey)!.push(cut);
    });

    const pools = Array.from(poolMap.entries()).map(([poolKey, poolCuts]) => {
      const stockCount = poolCuts.length;
      const totalSegments = poolCuts.reduce(
        (sum, cut) => sum + (cut.segmentCount || 0),
        0
      );

      // Calculate work order count from breakdowns
      const workOrderIds = new Set<string>();
      poolCuts.forEach((cut) => {
        if (cut.workOrderBreakdown) {
          cut.workOrderBreakdown.forEach((breakdown) => {
            workOrderIds.add(String(breakdown.workOrderId));
          });
        } else if (cut.workOrderId && cut.workOrderId !== "MIXED") {
          workOrderIds.add(String(cut.workOrderId));
        }
      });

      return {
        poolKey,
        profileType: poolCuts[0]?.segments?.[0]?.profileType || "Unknown",
        workOrderCount: workOrderIds.size,
        stockCount,
        totalSegments,
        efficiency: result?.efficiency || 0,
        cuts: poolCuts,
      };
    });

    return { pools };
  }

  // Check if result uses pooling optimization
  const isPoolingOptimization = useMemo(() => {
    return result?.cuts?.some((cut) => cut.poolKey) || false;
  }, [result?.cuts]);

  // Deduplicate Work Orders and aggregate cuts
  const aggregatedWorkOrders = useMemo(() => {
    if (!hasResults) return [];
    return buildEnterpriseRows(result).workOrders;
  }, [result, hasResults]);

  // Build pool-based rows for pooling optimization
  const aggregatedPools = useMemo(() => {
    if (!hasResults || !isPoolingOptimization) return [];
    return buildPoolRows(result).pools;
  }, [result, hasResults, isPoolingOptimization]);

  // Calculate cutting details for a specific work order
  const getWorkOrderCuttingDetails = (workOrderId: string) => {
    // Getting work order cutting details

    if (!result?.cuts) {
      return [];
    }

    // Group cuts by stock length for this work order
    const stockGroups: Record<
      number,
      {
        stockLength: number;
        cuts: any[]; // Keep original Cut objects to preserve planLabel, segmentCount, etc.
        totalPieces: number;
      }
    > = {};

    result.cuts.forEach((cut, cutIndex: number) => {
      // Processing cut data

      // Check if this cut contains segments for the work order
      let hasWorkOrderSegments = false;
      if (cut.segments) {
        hasWorkOrderSegments = cut.segments.some(
          (segment: any) =>
            segment.workOrderId === workOrderId ||
            segment.workOrderItemId === workOrderId
        );
      }

      // Include the cut if it has segments for this work order
      if (hasWorkOrderSegments) {
        const stockLength = cut.stockLength;
        if (!stockGroups[stockLength]) {
          stockGroups[stockLength] = {
            stockLength,
            cuts: [],
            totalPieces: 0,
          };
        }
        // Keep the original cut object to preserve planLabel, segmentCount, etc.
        stockGroups[stockLength].cuts.push(cut);
        stockGroups[stockLength].totalPieces += cut.segmentCount || 0;
        console.log(
          `✅ Added cut to stock group ${stockLength}mm with planLabel: ${cut.planLabel}`
        );
      }
    });

    const result_groups = Object.values(stockGroups);
    console.log("📋 Final stock groups:", result_groups);
    return result_groups;
  };

  const handleWorkOrderClick = (workOrderId: string) => {
    console.log("🖱️ Work order clicked:", workOrderId);
    console.log("📊 Current expanded:", expandedWorkOrder);
    const newExpanded = expandedWorkOrder === workOrderId ? null : workOrderId;
    console.log("🔄 Setting expanded to:", newExpanded);
    setExpandedWorkOrder(newExpanded);
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Aynı Profil Tipi Bilgilendirme Kartı */}
      {showProfileInfo && checkDuplicateProfileTypes.hasDuplicates && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          onClose={() => setShowProfileInfo(false)}
        >
          <AlertTitle>Profil Optimizasyonu Önerisi</AlertTitle>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Bu optimizasyonda aynı profil tipinden birden fazla parça tespit
            edildi:
          </Typography>
          <Box sx={{ ml: 2 }}>
            {checkDuplicateProfileTypes.duplicates.map((dup, index) => (
              <Typography key={index} variant="body2" color="text.secondary">
                • {dup.profileType}: {dup.count} parça
              </Typography>
            ))}
          </Box>
          <Typography variant="body2" sx={{ mt: 1 }}>
            "Algoritma ve Parametreler" sekmesinden profil optimizasyonunu
            aktifleştirerek daha verimli kesim planları oluşturabilirsiniz.
          </Typography>
        </Alert>
      )}

      {!result && (
        <Card sx={{ mb: 3, p: 3, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            Optimizasyon sonucu bekleniyor...
          </Typography>
        </Card>
      )}

      {result && (
        <>
          {/* Header Section */}
          <Card
            sx={{
              mb: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            }}
          >
            <CardContent>
              <Grid container alignItems="center" spacing={3}>
                <Grid item>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: "success.main",
                      boxShadow: theme.shadows[3],
                    }}
                  >
                    <CheckIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="success.dark"
                  >
                    Optimizasyon Tamamlandı
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Chip
                      icon={<TrendingUpIcon />}
                      label={`Verimlilik: ${performanceMetrics?.efficiency.toFixed(1)}%`}
                      color={getSeverityColor(
                        performanceMetrics?.efficiency || 0,
                        {
                          good: 85,
                          warning: 70,
                        }
                      )}
                    />
                    <Chip
                      icon={<MoneyIcon />}
                      label={`Toplam Maliyet: ₺${result.totalCost?.toFixed(2)}`}
                      color="primary"
                    />
                    <Chip
                      icon={<SpeedIcon />}
                      label={`${result.stockCount} Stok`}
                      color="info"
                    />
                    <Chip
                      icon={<ScienceIcon />}
                      label={`Güven: ${result.confidence || 95}%`}
                      color="secondary"
                    />
                  </Stack>
                </Grid>
                <Grid item>
                  <Stack spacing={1}>
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={handleExport}
                      disabled={isExporting}
                      sx={{ minWidth: 150 }}
                    >
                      {isExporting ? "İndiriliyor..." : "Rapor İndir"}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<PrintIcon />}
                      sx={{ minWidth: 150 }}
                    >
                      Yazdır
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* KPI Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        mr: 2,
                      }}
                    >
                      <TrendingUpIcon color="success" />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="success.main"
                      >
                        {performanceMetrics?.efficiency.toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Verimlilik Oranı
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={performanceMetrics?.efficiency}
                    color="success"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                        mr: 2,
                      }}
                    >
                      <RecyclingIcon color="warning" />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="warning.main"
                      >
                        {result.totalWaste} mm
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Toplam Atık
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {wasteAnalysis?.reclaimable} adet geri kazanılabilir
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        mr: 2,
                      }}
                    >
                      <MoneyIcon color="primary" />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="primary.main"
                      >
                        ₺{result.totalCost?.toFixed(0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Toplam Maliyet
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="success.main">
                    %{performanceMetrics?.savingsPercentage} tasarruf
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        mr: 2,
                      }}
                    >
                      <EngineeringIcon color="info" />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="info.main"
                      >
                        {performanceMetrics?.performanceScore}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Performans Skoru
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Kalite: {performanceMetrics?.qualityScore}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Detailed Analysis Tabs */}
          <Card>
            <CardContent>
              <Tabs
                value={tabValue}
                onChange={(e, v) => {
                  console.log("🔥 Tab changed to:", v);
                  setTabValue(v);
                }}
              >
                <Tab icon={<TreeIcon />} label="Kesim Planı" />
                <Tab icon={<PieChartIcon />} label="Maliyet Analizi" />
                <Tab icon={<BarChartIcon />} label="Atık Analizi" />
                <Tab icon={<ShowChartIcon />} label="Performans" />
                <Tab
                  icon={<SettingsIcon />}
                  label="🔥 Algoritma ve Parametreler"
                />
                <Tab icon={<InsightsIcon />} label="Öneriler" />
              </Tabs>

              <TabPanel value={tabValue} index={0}>
                {/* Stok Kullanım Planı */}
                {result.cuts && result.cuts.length > 0 && (
                  <Card
                    sx={{
                      mb: 3,
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
                      backdropFilter: "blur(20px)",
                      border: "2px solid rgba(0,0,0,0.08)",
                      boxShadow:
                        "0 8px 32px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
                      borderRadius: 3,
                      overflow: "hidden",
                      position: "relative",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "4px",
                        background:
                          "linear-gradient(90deg, #3b82f6 0%, #1d4ed8 50%, #3b82f6 100%)",
                        zIndex: 1,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3, position: "relative", zIndex: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 3,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            background:
                              "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                            color: "white",
                            boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
                          }}
                        >
                          <BarChartIcon sx={{ fontSize: 24 }} />
                        </Avatar>
                        <Box>
                          <Typography
                            variant="h5"
                            fontWeight="bold"
                            color="primary"
                          >
                            📊 Stok Kullanım Özeti
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Optimizasyon sonuçlarına göre stok kullanım analizi
                          </Typography>
                        </Box>
                      </Box>

                      <Grid container spacing={3}>
                        {(() => {
                          interface StockSummaryItem {
                            length: number;
                            count: number;
                            used: number;
                            waste: number;
                          }

                          const stockSummary =
                            result.cuts?.reduce(
                              (acc: Record<string, StockSummaryItem>, cut) => {
                                const key = String(cut.stockLength);
                                if (!acc[key]) {
                                  acc[key] = {
                                    length: cut.stockLength,
                                    count: 0,
                                    used: 0,
                                    waste: 0,
                                  };
                                }
                                acc[key].count++;
                                acc[key].used += cut.usedLength;
                                acc[key].waste += cut.remainingLength;
                                return acc;
                              },
                              {}
                            ) || {};

                          return (
                            Object.values(stockSummary) as StockSummaryItem[]
                          )
                            .sort((a, b) => b.length - a.length)
                            .map((stock) => {
                              const efficiency =
                                (stock.used / (stock.length * stock.count)) *
                                100;
                              const wastePercentage =
                                (stock.waste / (stock.length * stock.count)) *
                                100;

                              return (
                                <Grid
                                  item
                                  xs={12}
                                  sm={6}
                                  md={4}
                                  key={stock.length}
                                >
                                  <Card
                                    sx={{
                                      background:
                                        "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
                                      backdropFilter: "blur(20px)",
                                      border: "2px solid rgba(0,0,0,0.08)",
                                      boxShadow:
                                        "0 8px 32px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
                                      position: "relative",
                                      overflow: "hidden",
                                      borderRadius: 2,
                                      "&::before": {
                                        content: '""',
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: "4px",
                                        background:
                                          efficiency >= 90
                                            ? "linear-gradient(90deg, #10b981 0%, #059669 100%)"
                                            : efficiency >= 80
                                              ? "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)"
                                              : "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)",
                                        zIndex: 1,
                                      },
                                      "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow:
                                          "0 16px 48px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.95)",
                                        border:
                                          "2px solid rgba(59,130,246,0.2)",
                                      },
                                      transition:
                                        "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                                    }}
                                  >
                                    <CardContent
                                      sx={{
                                        p: 3,
                                        position: "relative",
                                        zIndex: 2,
                                      }}
                                    >
                                      {/* Header Section */}
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          mb: 2,
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                          }}
                                        >
                                          <Avatar
                                            sx={{
                                              width: 40,
                                              height: 40,
                                              background:
                                                "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                                              color: "white",
                                              boxShadow:
                                                "0 3px 8px rgba(59,130,246,0.25)",
                                            }}
                                          >
                                            <EngineeringIcon
                                              sx={{ fontSize: 20 }}
                                            />
                                          </Avatar>
                                          <Box>
                                            <Typography
                                              variant="h6"
                                              fontWeight="bold"
                                              color="text.primary"
                                            >
                                              {stock.length}mm
                                            </Typography>
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                            >
                                              Stok Uzunluğu
                                            </Typography>
                                          </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Chip
                                            label={`${stock.count} adet`}
                                            color="primary"
                                            variant="filled"
                                            size="small"
                                            sx={{
                                              fontWeight: "bold",
                                              fontSize: "0.75rem",
                                              px: 1.5,
                                              py: 0.5,
                                              background:
                                                "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                                              color: "white",
                                              boxShadow:
                                                "0 2px 8px rgba(59,130,246,0.3)",
                                            }}
                                          />
                                          <Tooltip title="Kesim Planı Detayları" arrow>
                                            <IconButton
                                              onClick={() => handleCuttingPlanDetails(stock)}
                                              sx={{
                                                width: 28,
                                                height: 28,
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                color: 'white',
                                                boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                                                border: '2px solid rgba(255,255,255,0.2)',
                                                animation: 'lemnixRotate 3s linear infinite',
                                                '&:hover': {
                                                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                                  transform: 'scale(1.1)',
                                                  animation: 'lemnixRotate 1s linear infinite',
                                                },
                                              }}
                                            >
                                              <InfoIcon sx={{ fontSize: 14 }} />
                                            </IconButton>
                                          </Tooltip>
                                        </Box>
                                      </Box>

                                      {/* Metrics Grid */}
                                      <Grid
                                        container
                                        spacing={2}
                                        sx={{ mb: 2 }}
                                      >
                                        <Grid item xs={6}>
                                          <Paper
                                            sx={{
                                              p: 1.5,
                                              textAlign: "center",
                                              background:
                                                "rgba(16,185,129,0.05)",
                                              border:
                                                "1px solid rgba(16,185,129,0.1)",
                                              borderRadius: 2,
                                            }}
                                          >
                                            <Typography
                                              variant="h6"
                                              fontWeight="bold"
                                              color="success.main"
                                            >
                                              {stock.used.toLocaleString()}
                                            </Typography>
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                            >
                                              Kullanım (mm)
                                            </Typography>
                                          </Paper>
                                        </Grid>
                                        <Grid item xs={6}>
                                          <Paper
                                            sx={{
                                              p: 1.5,
                                              textAlign: "center",
                                              background:
                                                wastePercentage > 10
                                                  ? "rgba(239,68,68,0.05)"
                                                  : "rgba(16,185,129,0.05)",
                                              border: `1px solid ${wastePercentage > 10 ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)"}`,
                                              borderRadius: 2,
                                            }}
                                          >
                                            <Typography
                                              variant="h6"
                                              fontWeight="bold"
                                              color={
                                                wastePercentage > 10
                                                  ? "error.main"
                                                  : "success.main"
                                              }
                                            >
                                              {stock.waste.toLocaleString()}
                                            </Typography>
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                            >
                                              Atık (mm)
                                            </Typography>
                                          </Paper>
                                        </Grid>
                                      </Grid>

                                      {/* Efficiency Progress Bar */}
                                      <Box sx={{ mb: 2 }}>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            mb: 1,
                                          }}
                                        >
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                          >
                                            Verimlilik Oranı
                                          </Typography>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography
                                              variant="body2"
                                              fontWeight="bold"
                                              color="text.primary"
                                            >
                                              {efficiency.toFixed(1)}%
                                            </Typography>
                                            <Tooltip title="Kesim Planı Detayları" arrow>
                                              <IconButton
                                                onClick={() => handleCuttingPlanDetails(stock)}
                                                sx={{
                                                  width: 24,
                                                  height: 24,
                                                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                  color: 'white',
                                                  boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
                                                  border: '1px solid rgba(255,255,255,0.2)',
                                                  animation: 'lemnixRotate 3s linear infinite',
                                                  '&:hover': {
                                                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                                    transform: 'scale(1.1)',
                                                    animation: 'lemnixRotate 1s linear infinite',
                                                  },
                                                }}
                                              >
                                                <InfoIcon sx={{ fontSize: 12 }} />
                                              </IconButton>
                                            </Tooltip>
                                          </Box>
                                        </Box>
                                        <LinearProgress
                                          variant="determinate"
                                          value={efficiency}
                                          color={
                                            efficiency >= 90
                                              ? "success"
                                              : efficiency >= 80
                                                ? "warning"
                                                : "error"
                                          }
                                          sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            bgcolor: "rgba(0,0,0,0.1)",
                                            "& .MuiLinearProgress-bar": {
                                              borderRadius: 4,
                                            },
                                          }}
                                        />
                                      </Box>

                                      {/* Summary Stats */}
                                      <Box
                                        sx={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          p: 1.5,
                                          background: "rgba(0,0,0,0.02)",
                                          borderRadius: 1,
                                        }}
                                      >
                                        <Box sx={{ textAlign: "center" }}>
                                          <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            color="primary.main"
                                          >
                                            {efficiency.toFixed(1)}%
                                          </Typography>
                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                          >
                                            Verimlilik
                                          </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: "center" }}>
                                          <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            color="warning.main"
                                          >
                                            {wastePercentage.toFixed(1)}%
                                          </Typography>
                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                          >
                                            Atık Oranı
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </CardContent>
                                  </Card>
                                </Grid>
                              );
                            });
                        })()}
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* Premium Kesim Listesi */}
                <TableContainer
                  component={Paper}
                  sx={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
                    backdropFilter: "blur(20px)",
                    border: "2px solid rgba(0,0,0,0.08)",
                    boxShadow:
                      "0 8px 32px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
                    borderRadius: 3,
                    overflow: "hidden",
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "4px",
                      background:
                        "linear-gradient(90deg, #3b82f6 0%, #1d4ed8 50%, #3b82f6 100%)",
                      zIndex: 1,
                    },
                  }}
                >
                  <Table sx={{ tableLayout: "fixed" }}>
                    <TableHead>
                      <TableRow
                        sx={{
                          background:
                            "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(29,78,216,0.1) 100%)",
                          position: "relative",
                          zIndex: 2,
                        }}
                      >
                        {isPoolingOptimization ? (
                          <>
                            <TableCell
                              sx={{
                                width: "20%",
                                textAlign: "center",
                                fontWeight: "bold",
                                color: "primary.main",
                                fontSize: "0.95rem",
                                py: 2,
                                borderBottom: "2px solid rgba(59,130,246,0.2)",
                              }}
                            >
                              Profil Havuzu
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "12%",
                                textAlign: "center",
                                fontWeight: "bold",
                                color: "primary.main",
                                fontSize: "0.95rem",
                                py: 2,
                                borderBottom: "2px solid rgba(59,130,246,0.2)",
                              }}
                            >
                              İş Emri Sayısı
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "12%",
                                textAlign: "center",
                                fontWeight: "bold",
                                color: "primary.main",
                                fontSize: "0.95rem",
                                py: 2,
                                borderBottom: "2px solid rgba(59,130,246,0.2)",
                              }}
                            >
                              Boy Profil
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "12%",
                                textAlign: "center",
                                fontWeight: "bold",
                                color: "primary.main",
                                fontSize: "0.95rem",
                                py: 2,
                                borderBottom: "2px solid rgba(59,130,246,0.2)",
                              }}
                            >
                              Toplam Parça
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "12%",
                                textAlign: "center",
                                fontWeight: "bold",
                                color: "primary.main",
                                fontSize: "0.95rem",
                                py: 2,
                                borderBottom: "2px solid rgba(59,130,246,0.2)",
                              }}
                            >
                              Verimlilik
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "12%",
                                textAlign: "center",
                                fontWeight: "bold",
                                color: "primary.main",
                                fontSize: "0.95rem",
                                py: 2,
                                borderBottom: "2px solid rgba(59,130,246,0.2)",
                              }}
                            >
                              Plan Sayısı
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "20%",
                                textAlign: "center",
                                fontWeight: "bold",
                                color: "primary.main",
                                fontSize: "0.95rem",
                                py: 2,
                                borderBottom: "2px solid rgba(59,130,246,0.2)",
                              }}
                            >
                              Detaylar
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell
                              sx={{
                                width: "15%",
                                textAlign: "center",
                                fontWeight: "bold",
                                color: "primary.main",
                                fontSize: "0.95rem",
                                py: 2,
                                borderBottom: "2px solid rgba(59,130,246,0.2)",
                              }}
                            >
                              İş Emri
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "12%",
                                textAlign: "center",
                                fontWeight: "bold",
                                color: "primary.main",
                                fontSize: "0.95rem",
                                py: 2,
                                borderBottom: "2px solid rgba(59,130,246,0.2)",
                              }}
                            >
                              Algoritma
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "12%",
                                textAlign: "center",
                                fontWeight: "bold",
                                color: "primary.main",
                                fontSize: "0.95rem",
                                py: 2,
                                borderBottom: "2px solid rgba(59,130,246,0.2)",
                              }}
                            >
                              Boy Profil
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "12%",
                                textAlign: "center",
                                fontWeight: "bold",
                                color: "primary.main",
                                fontSize: "0.95rem",
                                py: 2,
                                borderBottom: "2px solid rgba(59,130,246,0.2)",
                              }}
                            >
                              Toplam Parça
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "12%",
                                textAlign: "center",
                                fontWeight: "bold",
                                color: "primary.main",
                                fontSize: "0.95rem",
                                py: 2,
                                borderBottom: "2px solid rgba(59,130,246,0.2)",
                              }}
                            >
                              Verimlilik
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "12%",
                                textAlign: "center",
                                fontWeight: "bold",
                                color: "primary.main",
                                fontSize: "0.95rem",
                                py: 2,
                                borderBottom: "2px solid rgba(59,130,246,0.2)",
                              }}
                            >
                              Plan Sayısı
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "12%",
                                textAlign: "center",
                                fontWeight: "bold",
                                color: "primary.main",
                                fontSize: "0.95rem",
                                py: 2,
                                borderBottom: "2px solid rgba(59,130,246,0.2)",
                              }}
                            >
                              Toplam Kesim
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "13%",
                                textAlign: "center",
                                fontWeight: "bold",
                                color: "primary.main",
                                fontSize: "0.95rem",
                                py: 2,
                                borderBottom: "2px solid rgba(59,130,246,0.2)",
                              }}
                            >
                              Detaylar
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(() => {
                        // Two-stage guard: differentiate between no results vs filtered empty
                        if (!hasResults) {
                          return (
                            <TableRow>
                              <TableCell
                                colSpan={8}
                                sx={{ textAlign: "center", py: 4 }}
                              >
                                <Alert severity="info">
                                  <AlertTitle>Veri Bulunamadı</AlertTitle>
                                  Optimizasyon sonuçları henüz mevcut değil.
                                  Lütfen önce bir optimizasyon çalıştırın.
                                </Alert>
                              </TableCell>
                            </TableRow>
                          );
                        }

                        if (isPoolingOptimization) {
                          if (aggregatedPools.length === 0) {
                            return (
                              <TableRow>
                                <TableCell
                                  colSpan={7}
                                  sx={{ textAlign: "center", py: 4 }}
                                >
                                  <Alert severity="warning">
                                    <AlertTitle>
                                      Profil Havuzu Bulunamadı
                                    </AlertTitle>
                                    Profil optimizasyonu sonuçları mevcut değil.
                                  </Alert>
                                </TableCell>
                              </TableRow>
                            );
                          }

                          return aggregatedPools.map((pool) => {
                            const isExpanded =
                              expandedWorkOrder === pool.poolKey;
                            const algorithmProfile = getAlgorithmProfile(
                              result?.algorithm
                            );

                            return (
                              <React.Fragment key={pool.poolKey}>
                                <TableRow hover>
                                  <TableCell sx={{ textAlign: "center" }}>
                                    <Chip
                                      label={pool.profileType}
                                      color="primary"
                                      variant="filled"
                                      size="small"
                                      sx={{
                                        fontWeight: "bold",
                                        fontSize: "0.8rem",
                                        mb: 0.5,
                                      }}
                                    />
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      display="block"
                                    >
                                      {pool.poolKey}
                                    </Typography>
                                  </TableCell>
                                  <TableCell sx={{ textAlign: "center" }}>
                                    <Typography
                                      variant="body2"
                                      fontWeight="medium"
                                      noWrap
                                    >
                                      {pool.workOrderCount} iş emri
                                    </Typography>
                                  </TableCell>
                                  <TableCell sx={{ textAlign: "center" }}>
                                    <Typography
                                      variant="body2"
                                      fontWeight="medium"
                                      noWrap
                                    >
                                      {pool.stockCount} çubuk
                                    </Typography>
                                  </TableCell>
                                  <TableCell sx={{ textAlign: "center" }}>
                                    <Typography
                                      variant="body2"
                                      fontWeight="medium"
                                      noWrap
                                    >
                                      {pool.totalSegments} parça
                                    </Typography>
                                  </TableCell>
                                  <TableCell sx={{ textAlign: "center" }}>
                                    <Typography
                                      variant="body2"
                                      fontWeight="bold"
                                      color="success.main"
                                      noWrap
                                    >
                                      {pool.efficiency.toFixed(1)}%
                                    </Typography>
                                  </TableCell>
                                  <TableCell sx={{ textAlign: "center" }}>
                                    <Typography
                                      variant="body2"
                                      fontWeight="medium"
                                      noWrap
                                    >
                                      {pool.cuts.length} plan
                                    </Typography>
                                  </TableCell>
                                  <TableCell sx={{ textAlign: "center" }}>
                                    <Button
                                      variant="contained"
                                      color="success"
                                      size="small"
                                      onClick={() =>
                                        handleWorkOrderClick(pool.poolKey)
                                      }
                                      sx={{
                                        minWidth: "120px",
                                        textTransform: "none",
                                        fontWeight: "bold",
                                        fontSize: "0.75rem",
                                      }}
                                    >
                                      Havuz Detayları
                                    </Button>
                                  </TableCell>
                                </TableRow>

                                {/* Expandable Pool Details */}
                                {isExpanded && (
                                  <TableRow>
                                    <TableCell
                                      colSpan={7}
                                      sx={{ p: 0, border: "none" }}
                                    >
                                      <Collapse
                                        in={isExpanded}
                                        timeout="auto"
                                        unmountOnExit
                                      >
                                        <Box
                                          sx={{
                                            p: 2,
                                            bgcolor: "grey.50",
                                            borderTop: "1px solid",
                                            borderColor: "divider",
                                          }}
                                        >
                                          {/* Pool Header */}
                                          <Box sx={{ mb: 2 }}>
                                            <Stack
                                              direction="row"
                                              spacing={2}
                                              alignItems="center"
                                              sx={{ mb: 1 }}
                                            >
                                              <Chip
                                                label={`Profil Tipi: ${pool.profileType}`}
                                                color="primary"
                                                variant="filled"
                                                sx={{
                                                  fontWeight: "bold",
                                                  fontSize: "0.9rem",
                                                }}
                                              />
                                              <Chip
                                                label={`Verimlilik: ${pool.efficiency.toFixed(1)}%`}
                                                color={
                                                  pool.efficiency >= 90
                                                    ? "success"
                                                    : pool.efficiency >= 80
                                                      ? "warning"
                                                      : "error"
                                                }
                                                variant="outlined"
                                                sx={{ fontWeight: "bold" }}
                                              />
                                            </Stack>
                                            <Typography
                                              variant="body2"
                                              color="text.secondary"
                                            >
                                              İş Emri Sayısı:{" "}
                                              {pool.workOrderCount} • Çubuk:{" "}
                                              {pool.stockCount} • Toplam parça:{" "}
                                              {pool.totalSegments}
                                            </Typography>
                                            <Tooltip
                                              title={`${algorithmProfile.description} ${algorithmProfile.details}`}
                                              arrow
                                            >
                                              <Chip
                                                label={
                                                  algorithmProfile.description
                                                }
                                                color="info"
                                                size="small"
                                                icon={<InfoIcon />}
                                              />
                                            </Tooltip>
                                          </Box>

                                          {/* Grouped Summary by Stock Length and Plan */}
                                          <Box sx={{ mb: 2 }}>
                                            {(() => {
                                              const barGroups = new Map<
                                                string,
                                                {
                                                  stockLength: number;
                                                  planLabel: string;
                                                  bars: any[];
                                                }
                                              >();
                                              pool.cuts.forEach((cut: any) => {
                                                const key = `${cut.stockLength}|${cut.planLabel || "No plan"}`;
                                                if (!barGroups.has(key)) {
                                                  barGroups.set(key, {
                                                    stockLength:
                                                      cut.stockLength,
                                                    planLabel:
                                                      cut.planLabel ||
                                                      "No plan",
                                                    bars: [],
                                                  });
                                                }
                                                barGroups
                                                  .get(key)!
                                                  .bars.push(cut);
                                              });

                                              const groups = Array.from(
                                                barGroups.values()
                                              ).sort(
                                                (a, b) =>
                                                  b.stockLength -
                                                    a.stockLength ||
                                                  b.bars.length - a.bars.length
                                              );

                                              return groups.map(
                                                (group, idx) => {
                                                  const barCount =
                                                    group.bars.length;
                                                  const totalPieces =
                                                    group.bars.reduce(
                                                      (sum: number, bar: any) =>
                                                        sum +
                                                        (bar.segmentCount || 0),
                                                      0
                                                    );
                                                  const avgRemaining =
                                                    Math.round(
                                                      group.bars.reduce(
                                                        (
                                                          sum: number,
                                                          bar: any
                                                        ) =>
                                                          sum +
                                                          bar.remainingLength,
                                                        0
                                                      ) / barCount
                                                    );

                                                  return (
                                                    <Box
                                                      key={idx}
                                                      sx={{
                                                        mb: 1,
                                                        p: 1,
                                                        bgcolor:
                                                          "background.paper",
                                                        borderRadius: 1,
                                                      }}
                                                    >
                                                      <Typography
                                                        variant="body1"
                                                        fontWeight="medium"
                                                      >
                                                        <strong>
                                                          {group.stockLength} mm
                                                          Stok — {barCount}{" "}
                                                          çubuk × (
                                                          {group.planLabel})
                                                        </strong>
                                                      </Typography>
                                                      <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                      >
                                                        Toplam parça:{" "}
                                                        {totalPieces} • Ortalama
                                                        kalan: {avgRemaining} mm
                                                      </Typography>
                                                    </Box>
                                                  );
                                                }
                                              );
                                            })()}
                                          </Box>

                                          {/* Per-bar table */}
                                          <TableContainer
                                            component={Paper}
                                            variant="outlined"
                                            sx={{ mt: 2 }}
                                          >
                                            <Table size="small">
                                              <TableHead>
                                                <TableRow>
                                                  <TableCell>#</TableCell>
                                                  <TableCell>
                                                    Stok (mm)
                                                  </TableCell>
                                                  <TableCell>Plan</TableCell>
                                                  <TableCell>Parça</TableCell>
                                                  <TableCell>
                                                    Kullanılan (mm)
                                                  </TableCell>
                                                  <TableCell>
                                                    Kalan (mm)
                                                  </TableCell>
                                                  <TableCell>
                                                    Doluluk %
                                                  </TableCell>
                                                  <TableCell>
                                                    İş Emri Katkısı
                                                  </TableCell>
                                                </TableRow>
                                              </TableHead>
                                              <TableBody>
                                                {pool.cuts
                                                  .slice(0, 10)
                                                  .map(
                                                    (
                                                      cut: any,
                                                      index: number
                                                    ) => (
                                                      <TableRow key={cut.id}>
                                                        <TableCell>
                                                          {index + 1}
                                                        </TableCell>
                                                        <TableCell>
                                                          {cut.stockLength}
                                                        </TableCell>
                                                        <TableCell>
                                                          <Box
                                                            sx={{
                                                              display: "flex",
                                                              alignItems:
                                                                "center",
                                                              gap: 1,
                                                            }}
                                                          >
                                                            <Typography variant="body2">
                                                              {cut.planLabel}
                                                            </Typography>
                                                            {cut.isMixed && (
                                                              <Chip
                                                                label="Karışık plan"
                                                                size="small"
                                                                color="warning"
                                                              />
                                                            )}
                                                          </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                          {cut.segmentCount ||
                                                            0}
                                                        </TableCell>
                                                        <TableCell>
                                                          {cut.usedLength}
                                                        </TableCell>
                                                        <TableCell>
                                                          {cut.remainingLength}
                                                        </TableCell>
                                                        <TableCell>
                                                          {(
                                                            (cut.usedLength /
                                                              cut.stockLength) *
                                                            100
                                                          ).toFixed(1)}
                                                          %
                                                        </TableCell>
                                                        <TableCell>
                                                          {cut.workOrderBreakdown ? (
                                                            <Typography variant="caption">
                                                              {cut.workOrderBreakdown
                                                                .map(
                                                                  (
                                                                    breakdown: any,
                                                                    idx: number
                                                                  ) =>
                                                                    `${breakdown.workOrderId}→${breakdown.count}${idx < cut.workOrderBreakdown.length - 1 ? ", " : ""}`
                                                                )
                                                                .join("")}
                                                            </Typography>
                                                          ) : (
                                                            <Typography
                                                              variant="caption"
                                                              color="text.secondary"
                                                            >
                                                              {cut.workOrderId}
                                                            </Typography>
                                                          )}
                                                        </TableCell>
                                                      </TableRow>
                                                    )
                                                  )}
                                              </TableBody>
                                            </Table>
                                          </TableContainer>
                                        </Box>
                                      </Collapse>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </React.Fragment>
                            );
                          });
                        }

                        if (aggregatedWorkOrders.length === 0) {
                          return (
                            <TableRow>
                              <TableCell
                                colSpan={8}
                                sx={{ textAlign: "center", py: 4 }}
                              >
                                <Alert severity="warning">
                                  <AlertTitle>Sonuç Bulunamadı</AlertTitle>
                                  Geçerli filtrelerle sonuç bulunamadı.
                                </Alert>
                              </TableCell>
                            </TableRow>
                          );
                        }

                        return aggregatedWorkOrders.map((workOrder) => {
                          const isExpanded =
                            expandedWorkOrder === String(workOrder.workOrderId);
                          const algorithmProfile = getAlgorithmProfile(
                            workOrder.algorithm
                          );

                          return (
                            <React.Fragment key={workOrder.workOrderId}>
                              <TableRow
                                hover
                                sx={{
                                  background:
                                    "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.8) 100%)",
                                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                                  "&:hover": {
                                    background:
                                      "linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(29,78,216,0.05) 100%)",
                                    transform: "translateY(-1px)",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                  },
                                  transition:
                                    "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                                }}
                              >
                                <TableCell
                                  sx={{
                                    textAlign: "center",
                                    py: 2,
                                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <Avatar
                                      sx={{
                                        width: 32,
                                        height: 32,
                                        background:
                                          "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                                        color: "white",
                                        fontSize: "0.8rem",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      <EngineeringIcon sx={{ fontSize: 16 }} />
                                    </Avatar>
                                    <Typography
                                      variant="body2"
                                      fontWeight="bold"
                                      color="primary"
                                      noWrap
                                      sx={{ fontSize: "0.9rem" }}
                                    >
                                      {workOrder.workOrderId}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "center",
                                    py: 2,
                                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                                  }}
                                >
                                  <Chip
                                    label={algorithmProfile.name}
                                    color="primary"
                                    variant="filled"
                                    size="medium"
                                    sx={{
                                      fontWeight: "bold",
                                      fontSize: "0.8rem",
                                      px: 1.5,
                                      py: 0.5,
                                      background:
                                        "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                                      color: "white",
                                      boxShadow:
                                        "0 2px 8px rgba(59,130,246,0.3)",
                                    }}
                                  />
                                </TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "center",
                                    py: 2,
                                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "primary.main",
                                      }}
                                    >
                                      {getProfileTypeIcon(
                                        workOrder.cuts[0]?.segments?.[0]
                                          ?.profileType || "default"
                                      )}
                                    </Box>
                                    <Typography
                                      variant="body2"
                                      fontWeight="bold"
                                      noWrap
                                      sx={{ fontSize: "0.9rem" }}
                                    >
                                      {workOrder.stockCount}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "center",
                                    py: 2,
                                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <AssessmentIcon
                                      sx={{
                                        fontSize: 16,
                                        color: "success.main",
                                      }}
                                    />
                                    <Typography
                                      variant="body2"
                                      fontWeight="bold"
                                      noWrap
                                      sx={{ fontSize: "0.9rem" }}
                                    >
                                      {workOrder.totalSegments}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "center",
                                    py: 2,
                                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                                  }}
                                >
                                  <Chip
                                    label={`${workOrder.efficiency?.toFixed(1) ?? "—"}%`}
                                    color={
                                      (workOrder.efficiency ?? 0) >= 95
                                        ? "success"
                                        : (workOrder.efficiency ?? 0) >= 90
                                          ? "warning"
                                          : "error"
                                    }
                                    variant="filled"
                                    size="medium"
                                    sx={{
                                      fontWeight: "bold",
                                      fontSize: "0.8rem",
                                      px: 1.5,
                                      py: 0.5,
                                      boxShadow:
                                        (workOrder.efficiency ?? 0) >= 95
                                          ? "0 2px 8px rgba(16,185,129,0.3)"
                                          : (workOrder.efficiency ?? 0) >= 90
                                            ? "0 2px 8px rgba(245,158,11,0.3)"
                                            : "0 2px 8px rgba(239,68,68,0.3)",
                                    }}
                                  />
                                </TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "center",
                                    py: 2,
                                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <TimelineIcon
                                      sx={{ fontSize: 16, color: "info.main" }}
                                    />
                                    <Typography
                                      variant="body2"
                                      fontWeight="bold"
                                      noWrap
                                      sx={{ fontSize: "0.9rem" }}
                                    >
                                      {workOrder.cuts.length}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "center",
                                    py: 2,
                                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <ShowChartIcon
                                      sx={{
                                        fontSize: 16,
                                        color: "secondary.main",
                                      }}
                                    />
                                    <Typography
                                      variant="body2"
                                      fontWeight="bold"
                                      noWrap
                                      sx={{ fontSize: "0.9rem" }}
                                    >
                                      {workOrder.cuts.reduce(
                                        (sum, cut) =>
                                          sum + (cut.segmentCount || 0),
                                        0
                                      )}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "center",
                                    py: 2,
                                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                                  }}
                                >
                                  <Button
                                    variant="contained"
                                    size="medium"
                                    onClick={() =>
                                      handleWorkOrderClick(
                                        String(workOrder.workOrderId)
                                      )
                                    }
                                    sx={{
                                      minWidth: "140px",
                                      textTransform: "none",
                                      fontWeight: "bold",
                                      fontSize: "0.8rem",
                                      background:
                                        "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                      color: "white",
                                      px: 2,
                                      py: 1,
                                      borderRadius: 2,
                                      boxShadow:
                                        "0 4px 12px rgba(16,185,129,0.3)",
                                      "&:hover": {
                                        background:
                                          "linear-gradient(135deg, #059669 0%, #047857 100%)",
                                        transform: "translateY(-2px)",
                                        boxShadow:
                                          "0 6px 16px rgba(16,185,129,0.4)",
                                      },
                                      transition:
                                        "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                                    }}
                                    startIcon={<ExpandMoreIcon />}
                                  >
                                    Kesim Detayları
                                  </Button>
                                </TableCell>
                              </TableRow>

                              {/* Expandable Cutting Details */}
                              {isExpanded && (
                                <TableRow>
                                  <TableCell
                                    colSpan={9}
                                    sx={{ p: 0, border: "none" }}
                                  >
                                    <Collapse
                                      in={isExpanded}
                                      timeout="auto"
                                      unmountOnExit
                                    >
                                      <Box
                                        sx={{
                                          p: 2,
                                          bgcolor: "grey.50",
                                          borderTop: "1px solid",
                                          borderColor: "divider",
                                        }}
                                      >
                                        {/* Work Order Header */}
                                        <Box sx={{ mb: 2 }}>
                                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography
                                              variant="h6"
                                              color="primary"
                                              fontWeight="bold"
                                            >
                                              İş Emri: {workOrder.workOrderId} —{" "}
                                              {algorithmProfile.name}
                                            </Typography>
                                            <Tooltip title="Kesim Planı Açıklaması" arrow>
                                              <IconButton
                                                onClick={() => {
                                                  // Get real cutting data from the work order
                                                  const realStock = {
                                                    length: workOrder.cuts?.[0]?.stockLength || 7000,
                                                    count: workOrder.stockCount || 10,
                                                    used: workOrder.cuts?.reduce((sum: number, cut: any) => sum + (cut.usedLength || 0), 0) || 0,
                                                    waste: workOrder.cuts?.reduce((sum: number, cut: any) => sum + (cut.remainingLength || 0), 0) || 0,
                                                    workOrderId: workOrder.workOrderId,
                                                    algorithmName: algorithmProfile.name,
                                                    cuts: workOrder.cuts || [],
                                                    totalPieces: workOrder.totalSegments || 0,
                                                    efficiency: workOrder.efficiency ? workOrder.efficiency.toFixed(1) : "0.0"
                                                  };
                                                  setCuttingPlanModal({ open: true, stock: realStock });
                                                }}
                                                sx={{
                                                  width: 32,
                                                  height: 32,
                                                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                  color: 'white',
                                                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                                                  border: '2px solid rgba(255,255,255,0.2)',
                                                  animation: 'lemnixRotate 3s linear infinite',
                                                  '&:hover': {
                                                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                                    transform: 'scale(1.1)',
                                                    animation: 'lemnixRotate 1s linear infinite',
                                                    boxShadow: '0 6px 20px rgba(16,185,129,0.4)',
                                                  },
                                                  transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                                }}
                                              >
                                                <InfoIcon fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                          </Box>
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mb: 1 }}
                                          >
                                            Profil: {workOrder.stockCount} •
                                            Toplam parça:{" "}
                                            {workOrder.totalSegments} •
                                            Verimlilik:{" "}
                                            {workOrder.efficiency?.toFixed(2) ??
                                              "—"}
                                            %
                                          </Typography>
                                          <Tooltip
                                            title={`${algorithmProfile.description} ${algorithmProfile.details}`}
                                            arrow
                                          >
                                            <Chip
                                              label={
                                                algorithmProfile.description
                                              }
                                              color="info"
                                              size="small"
                                              icon={<InfoIcon />}
                                            />
                                          </Tooltip>
                                        </Box>

                                        {workOrder.cuts.length === 0 ? (
                                          <Alert
                                            severity="warning"
                                            sx={{ mb: 2 }}
                                          >
                                            <AlertTitle>
                                              Kesim Detayları Bulunamadı
                                            </AlertTitle>
                                            Bu iş emri için optimizasyon
                                            sonuçlarında kesim detayları mevcut
                                            değil.
                                          </Alert>
                                        ) : (
                                          <Box
                                            sx={{
                                              display: "flex",
                                              flexDirection: "column",
                                              gap: 3,
                                            }}
                                          >
                                            {/* Premium Grouped Summary */}
                                            <Box sx={{ mb: 2 }}>
                                              {(() => {
                                                // Group cuts by (stockLength, planLabel, profileType) for compact summary
                                                const barGroups = new Map<
                                                  string,
                                                  {
                                                    stockLength: number;
                                                    planLabel: string;
                                                    profileType: string;
                                                    bars: any[];
                                                  }
                                                >();
                                                workOrder.cuts.forEach(
                                                  (cut: any) => {
                                                    // Profil tipini cut'tan veya segments'ten al
                                                    let profileType =
                                                      cut.profileType ||
                                                      "Bilinmeyen";
                                                    if (
                                                      !profileType ||
                                                      profileType ===
                                                        "Bilinmeyen"
                                                    ) {
                                                      // Segments'ten profil tipini al
                                                      const firstSegment =
                                                        cut.segments?.[0];
                                                      if (
                                                        firstSegment?.profileType
                                                      ) {
                                                        profileType =
                                                          firstSegment.profileType;
                                                      }
                                                    }

                                                    // Debug logging
                                                    if (import.meta.env.DEV) {
                                                      console.log(
                                                        `🔍 Cut ${cut.id} profile type detection:`,
                                                        {
                                                          cutProfileType:
                                                            cut.profileType,
                                                          segmentProfileType:
                                                            cut.segments?.[0]
                                                              ?.profileType,
                                                          finalProfileType:
                                                            profileType,
                                                          segments:
                                                            cut.segments
                                                              ?.length || 0,
                                                        }
                                                      );
                                                    }

                                                    const key = `${cut.stockLength}|${cut.planLabel || "No plan"}|${profileType}`;
                                                    if (!barGroups.has(key)) {
                                                      barGroups.set(key, {
                                                        stockLength:
                                                          cut.stockLength,
                                                        planLabel:
                                                          cut.planLabel ||
                                                          "No plan",
                                                        profileType:
                                                          profileType,
                                                        bars: [],
                                                      });
                                                    }
                                                    barGroups
                                                      .get(key)!
                                                      .bars.push(cut);
                                                  }
                                                );

                                                const groups = Array.from(
                                                  barGroups.values()
                                                ).sort(
                                                  (a, b) =>
                                                    b.stockLength -
                                                      a.stockLength ||
                                                    b.bars.length -
                                                      a.bars.length
                                                );

                                                return groups.map(
                                                  (group, idx) => {
                                                    const barCount =
                                                      group.bars.length;
                                                    const totalPieces =
                                                      group.bars.reduce(
                                                        (
                                                          sum: number,
                                                          bar: any
                                                        ) =>
                                                          sum +
                                                          (bar.segmentCount ||
                                                            0),
                                                        0
                                                      );
                                                    const avgRemaining =
                                                      Math.round(
                                                        group.bars.reduce(
                                                          (
                                                            sum: number,
                                                            bar: any
                                                          ) =>
                                                            sum +
                                                            bar.remainingLength,
                                                          0
                                                        ) / barCount
                                                      );
                                                    const totalStockLength =
                                                      group.bars.reduce(
                                                        (
                                                          sum: number,
                                                          bar: any
                                                        ) =>
                                                          sum + bar.stockLength,
                                                        0
                                                      );
                                                    const totalUsedLength =
                                                      group.bars.reduce(
                                                        (
                                                          sum: number,
                                                          bar: any
                                                        ) =>
                                                          sum + bar.usedLength,
                                                        0
                                                      );
                                                    const groupEfficiency =
                                                      totalStockLength > 0
                                                        ? (totalUsedLength /
                                                            totalStockLength) *
                                                          100
                                                        : 0;

                                                    return (
                                                      <Card
                                                        key={idx}
                                                        sx={{
                                                          mb: 2,
                                                          background:
                                                            "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
                                                          backdropFilter:
                                                            "blur(20px)",
                                                          border:
                                                            "2px solid rgba(0,0,0,0.08)",
                                                          boxShadow:
                                                            "0 8px 32px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
                                                          position: "relative",
                                                          overflow: "hidden",
                                                          borderRadius: 2,
                                                          "&::before": {
                                                            content: '""',
                                                            position:
                                                              "absolute",
                                                            top: 0,
                                                            left: 0,
                                                            right: 0,
                                                            height: "4px",
                                                            background:
                                                              groupEfficiency >=
                                                              90
                                                                ? "linear-gradient(90deg, #10b981 0%, #059669 100%)"
                                                                : groupEfficiency >=
                                                                    80
                                                                  ? "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)"
                                                                  : "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)",
                                                            zIndex: 1,
                                                          },
                                                          "&:hover": {
                                                            transform:
                                                              "translateY(-2px)",
                                                            boxShadow:
                                                              "0 16px 48px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.95)",
                                                            border:
                                                              "2px solid rgba(59,130,246,0.2)",
                                                          },
                                                          transition:
                                                            "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                                                        }}
                                                      >
                                                        <CardContent
                                                          sx={{
                                                            p: 3,
                                                            position:
                                                              "relative",
                                                            zIndex: 2,
                                                          }}
                                                        >
                                                          {/* Header Section */}
                                                          <Box
                                                            sx={{
                                                              display: "flex",
                                                              alignItems:
                                                                "center",
                                                              justifyContent:
                                                                "space-between",
                                                              mb: 2,
                                                            }}
                                                          >
                                                            <Box
                                                              sx={{
                                                                display: "flex",
                                                                alignItems:
                                                                  "center",
                                                                gap: 2,
                                                              }}
                                                            >
                                                              <Avatar
                                                                sx={{
                                                                  width: 48,
                                                                  height: 48,
                                                                  background:
                                                                    groupEfficiency >=
                                                                    90
                                                                      ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                                                                      : groupEfficiency >=
                                                                          80
                                                                        ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                                                                        : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                                                  color:
                                                                    "white",
                                                                  boxShadow:
                                                                    "0 4px 12px rgba(0,0,0,0.15)",
                                                                }}
                                                              >
                                                                <EngineeringIcon
                                                                  sx={{
                                                                    fontSize: 24,
                                                                  }}
                                                                />
                                                              </Avatar>
                                                              <Box>
                                                                <Typography
                                                                  variant="h6"
                                                                  fontWeight="bold"
                                                                  color="text.primary"
                                                                >
                                                                  {
                                                                    group.stockLength
                                                                  }{" "}
                                                                  mm Stok
                                                                  Uzunluğu
                                                                </Typography>
                                                                <Typography
                                                                  variant="body2"
                                                                  color="text.secondary"
                                                                >
                                                                  {barCount}{" "}
                                                                  profil ×{" "}
                                                                  {
                                                                    group.planLabel
                                                                  }
                                                                </Typography>
                                                              </Box>
                                                            </Box>
                                                            <Chip
                                                              label={`${groupEfficiency.toFixed(1)}% Verimlilik`}
                                                              color={
                                                                groupEfficiency >=
                                                                90
                                                                  ? "success"
                                                                  : groupEfficiency >=
                                                                      80
                                                                    ? "warning"
                                                                    : "error"
                                                              }
                                                              variant="filled"
                                                              sx={{
                                                                fontWeight:
                                                                  "bold",
                                                                fontSize:
                                                                  "0.85rem",
                                                                px: 2,
                                                                py: 1,
                                                              }}
                                                            />
                                                          </Box>

                                                          {/* Profile Type Badge with Custom Icon */}
                                                          <Box sx={{ mb: 2 }}>
                                                            <Chip
                                                              label={`Profil Tipi: ${group.profileType}`}
                                                              color="primary"
                                                              variant="filled"
                                                              size="medium"
                                                              icon={
                                                                <Box
                                                                  sx={{
                                                                    display:
                                                                      "flex",
                                                                    alignItems:
                                                                      "center",
                                                                    justifyContent:
                                                                      "center",
                                                                    color:
                                                                      "white",
                                                                  }}
                                                                >
                                                                  {getProfileTypeIcon(
                                                                    group.profileType
                                                                  )}
                                                                </Box>
                                                              }
                                                              sx={{
                                                                fontSize:
                                                                  "0.85rem",
                                                                fontWeight:
                                                                  "bold",
                                                                bgcolor:
                                                                  "primary.main",
                                                                color: "white",
                                                                px: 2,
                                                                py: 1,
                                                                "& .MuiChip-label":
                                                                  {
                                                                    px: 2,
                                                                  },
                                                                "& .MuiChip-icon":
                                                                  {
                                                                    color:
                                                                      "white",
                                                                    fontSize:
                                                                      "1.2rem",
                                                                  },
                                                              }}
                                                            />
                                                          </Box>

                                                          {/* Stats Grid */}
                                                          <Grid
                                                            container
                                                            spacing={2}
                                                            sx={{ mb: 2 }}
                                                          >
                                                            <Grid
                                                              item
                                                              xs={6}
                                                              sm={3}
                                                            >
                                                              <Paper
                                                                sx={{
                                                                  p: 2,
                                                                  textAlign:
                                                                    "center",
                                                                  background:
                                                                    "rgba(59,130,246,0.05)",
                                                                  border:
                                                                    "1px solid rgba(59,130,246,0.1)",
                                                                  borderRadius: 2,
                                                                  position:
                                                                    "relative",
                                                                  overflow:
                                                                    "visible",
                                                                }}
                                                              >
                                                                {/* Metinsel Açıklama Butonu */}
                                                                <IconButton
                                                                  onClick={() =>
                                                                    handleTextExplanation(
                                                                      `totalPieces-${group.profileType}-${group.stockLength}`,
                                                                      group,
                                                                      {
                                                                        totalPieces,
                                                                        barCount,
                                                                        avgRemaining,
                                                                        groupEfficiency,
                                                                      }
                                                                    )
                                                                  }
                                                                  sx={{
                                                                    position:
                                                                      "absolute",
                                                                    top: 4,
                                                                    right: 4,
                                                                    width: 28,
                                                                    height: 28,
                                                                    background:
                                                                      "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.2) 100%)",
                                                                    border:
                                                                      "1px solid rgba(59,130,246,0.3)",
                                                                    backdropFilter:
                                                                      "blur(10px)",
                                                                    "&:hover": {
                                                                      background:
                                                                        "linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0.3) 100%)",
                                                                      transform:
                                                                        "scale(1.1)",
                                                                      boxShadow:
                                                                        "0 4px 12px rgba(59,130,246,0.3)",
                                                                    },
                                                                    transition:
                                                                      "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                                  }}
                                                                >
                                                                  <DescriptionIcon
                                                                    sx={{
                                                                      fontSize: 16,
                                                                      color:
                                                                        "primary.main",
                                                                      animation:
                                                                        textExplanationOpen[
                                                                          `totalPieces-${group.profileType}-${group.stockLength}`
                                                                        ]
                                                                          ? "spin 0.5s ease-in-out"
                                                                          : "none",
                                                                      "@keyframes spin":
                                                                        {
                                                                          "0%": {
                                                                            transform:
                                                                              "rotate(0deg)",
                                                                          },
                                                                          "100%":
                                                                            {
                                                                              transform:
                                                                                "rotate(360deg)",
                                                                            },
                                                                        },
                                                                    }}
                                                                  />
                                                                </IconButton>

                                                                <Typography
                                                                  variant="h5"
                                                                  fontWeight="bold"
                                                                  color="primary.main"
                                                                >
                                                                  {totalPieces}
                                                                </Typography>
                                                                <Typography
                                                                  variant="caption"
                                                                  color="text.secondary"
                                                                >
                                                                  Toplam Parça
                                                                </Typography>
                                                              </Paper>
                                                            </Grid>
                                                            <Grid
                                                              item
                                                              xs={6}
                                                              sm={3}
                                                            >
                                                              <Paper
                                                                sx={{
                                                                  p: 2,
                                                                  textAlign:
                                                                    "center",
                                                                  background:
                                                                    "rgba(16,185,129,0.05)",
                                                                  border:
                                                                    "1px solid rgba(16,185,129,0.1)",
                                                                  borderRadius: 2,
                                                                  position:
                                                                    "relative",
                                                                  overflow:
                                                                    "visible",
                                                                }}
                                                              >
                                                                {/* Metinsel Açıklama Butonu */}
                                                                <IconButton
                                                                  onClick={() =>
                                                                    handleTextExplanation(
                                                                      `profileCount-${group.profileType}-${group.stockLength}`,
                                                                      group,
                                                                      {
                                                                        totalPieces,
                                                                        barCount,
                                                                        avgRemaining,
                                                                        groupEfficiency,
                                                                      }
                                                                    )
                                                                  }
                                                                  sx={{
                                                                    position:
                                                                      "absolute",
                                                                    top: 4,
                                                                    right: 4,
                                                                    width: 28,
                                                                    height: 28,
                                                                    background:
                                                                      "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.2) 100%)",
                                                                    border:
                                                                      "1px solid rgba(16,185,129,0.3)",
                                                                    backdropFilter:
                                                                      "blur(10px)",
                                                                    "&:hover": {
                                                                      background:
                                                                        "linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.3) 100%)",
                                                                      transform:
                                                                        "scale(1.1)",
                                                                      boxShadow:
                                                                        "0 4px 12px rgba(16,185,129,0.3)",
                                                                    },
                                                                    transition:
                                                                      "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                                  }}
                                                                >
                                                                  <DescriptionIcon
                                                                    sx={{
                                                                      fontSize: 16,
                                                                      color:
                                                                        "success.main",
                                                                      animation:
                                                                        textExplanationOpen[
                                                                          `profileCount-${group.profileType}-${group.stockLength}`
                                                                        ]
                                                                          ? "spin 0.5s ease-in-out"
                                                                          : "none",
                                                                      "@keyframes spin":
                                                                        {
                                                                          "0%": {
                                                                            transform:
                                                                              "rotate(0deg)",
                                                                          },
                                                                          "100%":
                                                                            {
                                                                              transform:
                                                                                "rotate(360deg)",
                                                                            },
                                                                        },
                                                                    }}
                                                                  />
                                                                </IconButton>

                                                                <Typography
                                                                  variant="h5"
                                                                  fontWeight="bold"
                                                                  color="success.main"
                                                                >
                                                                  {barCount}
                                                                </Typography>
                                                                <Typography
                                                                  variant="caption"
                                                                  color="text.secondary"
                                                                >
                                                                  Profil Sayısı
                                                                </Typography>
                                                              </Paper>
                                                            </Grid>
                                                            <Grid
                                                              item
                                                              xs={6}
                                                              sm={3}
                                                            >
                                                              <Paper
                                                                sx={{
                                                                  p: 2,
                                                                  textAlign:
                                                                    "center",
                                                                  background:
                                                                    "rgba(245,158,11,0.05)",
                                                                  border:
                                                                    "1px solid rgba(245,158,11,0.1)",
                                                                  borderRadius: 2,
                                                                  position:
                                                                    "relative",
                                                                  overflow:
                                                                    "visible",
                                                                }}
                                                              >
                                                                {/* Metinsel Açıklama Butonu */}
                                                                <IconButton
                                                                  onClick={() =>
                                                                    handleTextExplanation(
                                                                      `avgWaste-${group.profileType}-${group.stockLength}`,
                                                                      group,
                                                                      {
                                                                        totalPieces,
                                                                        barCount,
                                                                        avgRemaining,
                                                                        groupEfficiency,
                                                                      }
                                                                    )
                                                                  }
                                                                  sx={{
                                                                    position:
                                                                      "absolute",
                                                                    top: 4,
                                                                    right: 4,
                                                                    width: 28,
                                                                    height: 28,
                                                                    background:
                                                                      "linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.2) 100%)",
                                                                    border:
                                                                      "1px solid rgba(245,158,11,0.3)",
                                                                    backdropFilter:
                                                                      "blur(10px)",
                                                                    "&:hover": {
                                                                      background:
                                                                        "linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.3) 100%)",
                                                                      transform:
                                                                        "scale(1.1)",
                                                                      boxShadow:
                                                                        "0 4px 12px rgba(245,158,11,0.3)",
                                                                    },
                                                                    transition:
                                                                      "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                                  }}
                                                                >
                                                                  <DescriptionIcon
                                                                    sx={{
                                                                      fontSize: 16,
                                                                      color:
                                                                        "warning.main",
                                                                      animation:
                                                                        textExplanationOpen[
                                                                          `avgWaste-${group.profileType}-${group.stockLength}`
                                                                        ]
                                                                          ? "spin 0.5s ease-in-out"
                                                                          : "none",
                                                                      "@keyframes spin":
                                                                        {
                                                                          "0%": {
                                                                            transform:
                                                                              "rotate(0deg)",
                                                                          },
                                                                          "100%":
                                                                            {
                                                                              transform:
                                                                                "rotate(360deg)",
                                                                            },
                                                                        },
                                                                    }}
                                                                  />
                                                                </IconButton>

                                                                <Typography
                                                                  variant="h5"
                                                                  fontWeight="bold"
                                                                  color="warning.main"
                                                                >
                                                                  {avgRemaining}
                                                                </Typography>
                                                                <Typography
                                                                  variant="caption"
                                                                  color="text.secondary"
                                                                >
                                                                  Ort. Atık (mm)
                                                                </Typography>
                                                              </Paper>
                                                            </Grid>
                                                            <Grid
                                                              item
                                                              xs={6}
                                                              sm={3}
                                                            >
                                                              <Paper
                                                                sx={{
                                                                  p: 2,
                                                                  textAlign:
                                                                    "center",
                                                                  background:
                                                                    "rgba(139,92,246,0.05)",
                                                                  border:
                                                                    "1px solid rgba(139,92,246,0.1)",
                                                                  borderRadius: 2,
                                                                  position:
                                                                    "relative",
                                                                  overflow:
                                                                    "visible",
                                                                }}
                                                              >
                                                                {/* Metinsel Açıklama Butonu */}
                                                                <IconButton
                                                                  onClick={() =>
                                                                    handleTextExplanation(
                                                                      `efficiency-${group.profileType}-${group.stockLength}`,
                                                                      group,
                                                                      {
                                                                        totalPieces,
                                                                        barCount,
                                                                        avgRemaining,
                                                                        groupEfficiency,
                                                                      }
                                                                    )
                                                                  }
                                                                  sx={{
                                                                    position:
                                                                      "absolute",
                                                                    top: 4,
                                                                    right: 4,
                                                                    width: 28,
                                                                    height: 28,
                                                                    background:
                                                                      "linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.2) 100%)",
                                                                    border:
                                                                      "1px solid rgba(139,92,246,0.3)",
                                                                    backdropFilter:
                                                                      "blur(10px)",
                                                                    "&:hover": {
                                                                      background:
                                                                        "linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(139,92,246,0.3) 100%)",
                                                                      transform:
                                                                        "scale(1.1)",
                                                                      boxShadow:
                                                                        "0 4px 12px rgba(139,92,246,0.3)",
                                                                    },
                                                                    transition:
                                                                      "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                                  }}
                                                                >
                                                                  <DescriptionIcon
                                                                    sx={{
                                                                      fontSize: 16,
                                                                      color:
                                                                        "secondary.main",
                                                                      animation:
                                                                        textExplanationOpen[
                                                                          `efficiency-${group.profileType}-${group.stockLength}`
                                                                        ]
                                                                          ? "spin 0.5s ease-in-out"
                                                                          : "none",
                                                                      "@keyframes spin":
                                                                        {
                                                                          "0%": {
                                                                            transform:
                                                                              "rotate(0deg)",
                                                                          },
                                                                          "100%":
                                                                            {
                                                                              transform:
                                                                                "rotate(360deg)",
                                                                            },
                                                                        },
                                                                    }}
                                                                  />
                                                                </IconButton>

                                                                <Typography
                                                                  variant="h5"
                                                                  fontWeight="bold"
                                                                  color="secondary.main"
                                                                >
                                                                  {groupEfficiency.toFixed(
                                                                    1
                                                                  )}
                                                                  %
                                                                </Typography>
                                                                <Typography
                                                                  variant="caption"
                                                                  color="text.secondary"
                                                                >
                                                                  Verimlilik
                                                                </Typography>
                                                              </Paper>
                                                            </Grid>
                                                          </Grid>

                                                          {/* Efficiency Progress Bar */}
                                                          <Box sx={{ mb: 2 }}>
                                                            <Box
                                                              sx={{
                                                                display: "flex",
                                                                justifyContent:
                                                                  "space-between",
                                                                mb: 1,
                                                              }}
                                                            >
                                                              <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                              >
                                                                Verimlilik Oranı
                                                              </Typography>
                                                              <Typography
                                                                variant="body2"
                                                                fontWeight="bold"
                                                                color="text.primary"
                                                              >
                                                                {groupEfficiency.toFixed(
                                                                  1
                                                                )}
                                                                %
                                                              </Typography>
                                                            </Box>
                                                            <LinearProgress
                                                              variant="determinate"
                                                              value={
                                                                groupEfficiency
                                                              }
                                                              color={
                                                                groupEfficiency >=
                                                                90
                                                                  ? "success"
                                                                  : groupEfficiency >=
                                                                      80
                                                                    ? "warning"
                                                                    : "error"
                                                              }
                                                              sx={{
                                                                height: 8,
                                                                borderRadius: 4,
                                                                bgcolor:
                                                                  "rgba(0,0,0,0.1)",
                                                                "& .MuiLinearProgress-bar":
                                                                  {
                                                                    borderRadius: 4,
                                                                  },
                                                              }}
                                                            />
                                                          </Box>

                                                          {/* Summary Text */}
                                                          <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{
                                                              fontStyle:
                                                                "italic",
                                                              textAlign:
                                                                "center",
                                                              p: 1,
                                                              background:
                                                                "rgba(0,0,0,0.02)",
                                                              borderRadius: 1,
                                                            }}
                                                          >
                                                            Bu gruptan kesilen
                                                            toplam parça:{" "}
                                                            {totalPieces} adet •
                                                            Her profilden
                                                            ortalama kalan atık:{" "}
                                                            {avgRemaining} mm
                                                          </Typography>
                                                        </CardContent>
                                                      </Card>
                                                    );
                                                  }
                                                );
                                              })()}
                                            </Box>

                                            {/* Detaylı tablo görünümü kaldırıldı - sadece gruplandırılmış özet gösteriliyor */}
                                          </Box>
                                        )}
                                      </Box>
                                    </Collapse>
                                  </TableCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                          );
                        });
                      })()}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                {/* Maliyet Analizi */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Maliyet Dağılımı
                      </Typography>
                      <List>
                        {result.costBreakdown &&
                          Object.entries(result.costBreakdown).map(
                            ([key, value]) => (
                              <ListItem key={key}>
                                <ListItemText
                                  primary={key
                                    .replace(/([A-Z])/g, " $1")
                                    .trim()}
                                  secondary={`₺${typeof value === "number" ? value.toFixed(2) : "0.00"}`}
                                />
                                <LinearProgress
                                  variant="determinate"
                                  value={
                                    typeof value === "number"
                                      ? (value / result.totalCost) * 100
                                      : 0
                                  }
                                  sx={{ width: 100, ml: 2 }}
                                />
                              </ListItem>
                            )
                          )}
                      </List>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Birim Maliyetler
                      </Typography>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Stok Başına Maliyet
                          </Typography>
                          <Typography variant="h5">
                            ₺{(result.totalCost / result.stockCount).toFixed(2)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Metre Başına Maliyet
                          </Typography>
                          <Typography variant="h5">
                            ₺{result.costPerMeter?.toFixed(2) || 0}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Parça Başına Maliyet
                          </Typography>
                          <Typography variant="h5">
                            ₺
                            {(
                              result.totalCost /
                              result.cuts?.reduce(
                                (sum: number, c) =>
                                  sum + (c.segments?.length || 0),
                                0
                              )
                            ).toFixed(2)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                {/* Atık Analizi */}
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Alert
                      severity={
                        result.wastePercentage < 10 ? "success" : "warning"
                      }
                    >
                      <AlertTitle>
                        Atık Oranı: %{result.wastePercentage?.toFixed(1)}
                      </AlertTitle>
                      {result.wastePercentage < 10
                        ? "Mükemmel! Atık oranı endüstri standardının altında."
                        : "Atık oranını azaltmak için farklı algoritmalar deneyin."}
                    </Alert>
                  </Grid>
                  {wasteAnalysis && (
                    <Grid item xs={12}>
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Kategori</TableCell>
                              <TableCell align="center">Adet</TableCell>
                              <TableCell align="center">Yüzde</TableCell>
                              <TableCell>Durum</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(wasteAnalysis).map(
                              ([key, value]) => (
                                <TableRow key={key}>
                                  <TableCell>
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                  </TableCell>
                                  <TableCell align="center">{value}</TableCell>
                                  <TableCell align="center">
                                    {(
                                      (value / result.stockCount) *
                                      100
                                    ).toFixed(1)}
                                    %
                                  </TableCell>
                                  <TableCell>
                                    {key === "reclaimable" && value > 0 && (
                                      <Chip
                                        label="Geri Kazanılabilir"
                                        color="success"
                                        size="small"
                                      />
                                    )}
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  )}
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                {/* Performans Metrikleri */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Algoritma Performansı
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <SpeedIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="İşlem Süresi"
                            secondary={`${result.executionTimeMs}ms`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <ScienceIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="Algoritma Karmaşıklığı"
                            secondary={
                              result.performanceMetrics?.algorithmComplexity ||
                              "O(n²)"
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <AssessmentIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="Yakınsama Oranı"
                            secondary={`${((result.performanceMetrics?.convergenceRate || 0) * 100).toFixed(1)}%`}
                          />
                        </ListItem>
                      </List>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Sistem Kullanımı
                      </Typography>
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          CPU Kullanımı
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={result.performanceMetrics?.cpuUsage || 0}
                          color="primary"
                        />
                      </Box>
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Bellek Kullanımı
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={result.performanceMetrics?.memoryUsage || 0}
                          color="secondary"
                        />
                      </Box>
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Ölçeklenebilirlik
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={
                            (result.performanceMetrics?.scalability || 0) * 10
                          }
                          color="success"
                        />
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Analytics Data */}
                  {analytics && (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Performans Analizi
                        </Typography>
                        <Grid container spacing={2}>
                          {Object.entries(analytics.metrics || {}).map(
                            ([key, value]) => (
                              <Grid item xs={6} md={3} key={key}>
                                <Box
                                  sx={{
                                    textAlign: "center",
                                    p: 2,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 2,
                                  }}
                                >
                                  <Typography
                                    variant="h5"
                                    color="primary.main"
                                    fontWeight="bold"
                                  >
                                    {typeof value === "object" &&
                                    value !== null &&
                                    "current" in value
                                      ? typeof value.current === "number"
                                        ? value.current.toFixed(1)
                                        : "0"
                                      : "0"}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                  </Typography>
                                  <Chip
                                    label={
                                      typeof value === "object" &&
                                      value !== null &&
                                      "trend" in value
                                        ? String(value.trend)
                                        : "stable"
                                    }
                                    size="small"
                                    color={
                                      typeof value === "object" &&
                                      value !== null &&
                                      "trend" in value
                                        ? value.trend === "up"
                                          ? "success"
                                          : value.trend === "down"
                                            ? "error"
                                            : "default"
                                        : "default"
                                    }
                                    sx={{ mt: 1 }}
                                  />
                                </Box>
                              </Grid>
                            )
                          )}
                        </Grid>
                      </Paper>
                    </Grid>
                  )}

                  {/* System Health */}
                  {systemHealth && (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Sistem Sağlığı
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>
                              Servis Durumu
                            </Typography>
                            {Object.entries(systemHealth.services || {}).map(
                              ([service, status]) => (
                                <Box
                                  key={service}
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    mb: 1,
                                  }}
                                >
                                  <Typography variant="body2">
                                    {service}
                                  </Typography>
                                  <Chip
                                    label={
                                      typeof status === "object" &&
                                      status !== null &&
                                      "status" in status
                                        ? String(status.status)
                                        : "unknown"
                                    }
                                    size="small"
                                    color={
                                      typeof status === "object" &&
                                      status !== null &&
                                      "status" in status &&
                                      status.status === "up"
                                        ? "success"
                                        : "error"
                                    }
                                  />
                                </Box>
                              )
                            )}
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>
                              Sistem Metrikleri
                            </Typography>
                            {Object.entries(systemHealth.metrics || {}).map(
                              ([metric, value]) => (
                                <Box
                                  key={metric}
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    mb: 1,
                                  }}
                                >
                                  <Typography variant="body2">
                                    {metric}
                                  </Typography>
                                  <Typography variant="body2" fontWeight="bold">
                                    {typeof value === "number"
                                      ? `${value.toFixed(1)}%`
                                      : value}
                                  </Typography>
                                </Box>
                              )
                            )}
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={4}>
                {/* Algoritma ve Parametreler */}
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 3,
                          border: "2px solid red",
                          p: 2,
                        }}
                      >
                        <Typography variant="h6">
                          🔥 Profil Tipi Bazlı Optimizasyon
                        </Typography>
                        <Switch
                          checked={useProfileOptimization}
                          onChange={(e) => {
                            console.log("🔥 Toggle clicked:", e.target.checked);
                            setUseProfileOptimization(e.target.checked);
                          }}
                          color="primary"
                          sx={{ transform: "scale(1.5)" }}
                        />
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        Aynı profil tiplerindeki parçaları gruplandırarak daha
                        verimli kesim planları oluşturur. Bu özellik
                        açıldığında, sistem aynı profil tipindeki parçaları bir
                        araya getirerek stok kullanımını optimize eder ve atık
                        miktarını azaltır.
                      </Typography>

                      {useProfileOptimization && profileOptimizationResult && (
                        <Box sx={{ mt: 3 }}>
                          <ProfileOptimizationResults
                            result={profileOptimizationResult}
                            onNewOptimization={() => fetchProfileOptimization()}
                            onExport={() =>
                              console.log("Export profile optimization")
                            }
                          />
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={5}>
                {/* Öneriler */}
                <Stack spacing={2}>
                  {result.recommendations?.map((rec, index: number) => (
                    <Alert
                      key={index}
                      severity={
                        (rec.severity as
                          | "error"
                          | "warning"
                          | "info"
                          | "success") || "info"
                      }
                      icon={getRecommendationIcon(rec.severity || "info")}
                    >
                      <AlertTitle>{rec.message}</AlertTitle>
                      <Typography variant="body2">
                        {rec.description || rec.suggestion}
                      </Typography>
                      {(rec.expectedImprovement ?? 0) > 0 && (
                        <Chip
                          label={`%${rec.expectedImprovement} iyileştirme potansiyeli`}
                          size="small"
                          color="success"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Alert>
                  ))}
                  {(!result.recommendations ||
                    result.recommendations.length === 0) && (
                    <Alert severity="success">
                      <AlertTitle>Mükemmel!</AlertTitle>
                      Optimizasyon sonuçları ideal seviyede. Herhangi bir
                      iyileştirme önerisi bulunmuyor.
                    </Alert>
                  )}
                </Stack>
              </TabPanel>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box
            sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "center" }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={onNewOptimization}
              startIcon={<RefreshIcon />}
            >
              Yeni Optimizasyon
            </Button>
            <Button variant="outlined" size="large" startIcon={<ShareIcon />}>
              Paylaş
            </Button>
          </Box>
        </>
      )}

      {/* DEV ONLY: Diagnostic renderer for self-test */}
      {(window as any).__EO_DIAG === true && (
        <Box sx={{ display: "none" }}>
          <pre data-testid="eo-diag">
            {(() => {
              if (isPoolingOptimization && aggregatedPools.length > 0) {
                const firstPool = aggregatedPools[0];
                const firstCut = firstPool.cuts?.[0];
                if (firstCut) {
                  return `${firstCut.stockLength} mm Stok — ${firstPool.stockCount} çubuk × (${firstCut.planLabel})`;
                }
              }
              return "NO GROUP";
            })()}
          </pre>
        </Box>
      )}

      {/* Metinsel Açıklama Dialog'ları */}
      {Object.entries(textExplanationOpen).map(
        ([cardId, isOpen]) =>
          isOpen && (
            <Dialog
              key={cardId}
              open={isOpen}
              onClose={() =>
                setTextExplanationOpen((prev) => ({ ...prev, [cardId]: false }))
              }
              maxWidth="md"
              fullWidth
              PaperProps={{
                sx: {
                  background:
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)",
                  backdropFilter: "blur(20px)",
                  border: "2px solid rgba(59, 130, 246, 0.2)",
                  borderRadius: 3,
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background:
                      "linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4, #10b981)",
                    borderRadius: "12px 12px 0 0",
                  },
                },
              }}
            >
              <DialogTitle
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
                  borderBottom: "1px solid rgba(59, 130, 246, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  py: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                    }}
                  >
                    <DescriptionIcon sx={{ color: "white", fontSize: 20 }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontWeight: "bold",
                    }}
                  >
                    Kesim Deseni Detaylı Açıklaması
                  </Typography>
                </Box>
                <IconButton
                  onClick={() =>
                    setTextExplanationOpen((prev) => ({
                      ...prev,
                      [cardId]: false,
                    }))
                  }
                  sx={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    "&:hover": {
                      background: "rgba(239, 68, 68, 0.2)",
                      transform: "scale(1.1)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  <CloseIcon sx={{ color: "error.main", fontSize: 20 }} />
                </IconButton>
              </DialogTitle>

              <DialogContent
                sx={{
                  p: 3,
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "rgba(0, 0, 0, 0.05)",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    borderRadius: "4px",
                    "&:hover": {
                      background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    background: "rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(59, 130, 246, 0.1)",
                    borderRadius: 2,
                    p: 3,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: "pre-line",
                      lineHeight: 1.8,
                      fontSize: "0.95rem",
                      color: "text.primary",
                      "& strong": {
                        color: "primary.main",
                        fontWeight: "bold",
                      },
                    }}
                  >
                    {explanationData[cardId] || "Açıklama yükleniyor..."}
                  </Typography>
                </Box>
              </DialogContent>
            </Dialog>
          )
      )}

      {/* Cutting Plan Details Modal */}
      <Dialog
        open={cuttingPlanModal.open}
        onClose={() => setCuttingPlanModal({ open: false, stock: null })}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(59,130,246,0.1)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.08)',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: 'white',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <EngineeringIcon />
          Kesim Planı Detayları
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {cuttingPlanModal.stock && (
            <Stack spacing={3}>
              {/* Header Info */}
              <Box sx={{ 
                p: 2, 
                background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(147,197,253,0.05) 100%)',
                borderRadius: 2,
                border: '1px solid rgba(59,130,246,0.1)'
              }}>
                <Typography variant="h5" fontWeight="bold" color="primary.main" gutterBottom>
                  İş Emri: {cuttingPlanModal.stock.workOrderId}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Algoritma:</strong> {cuttingPlanModal.stock.algorithmName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Stok Uzunluğu:</strong> {cuttingPlanModal.stock.length}mm • <strong>Profil Sayısı:</strong> {cuttingPlanModal.stock.count} adet
                </Typography>
              </Box>

              {/* Cutting Details */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight="semibold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CutIcon />
                    Kesim Detayları
                  </Typography>
                  <Tooltip title="Kesim Planı Açıklaması" arrow>
                    <IconButton
                      onClick={() => setCuttingPlanModal({ open: true, stock: cuttingPlanModal.stock })}
                      sx={{
                        width: 32,
                        height: 32,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                        border: '2px solid rgba(255,255,255,0.2)',
                        animation: 'lemnixRotate 3s linear infinite',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                          transform: 'scale(1.1)',
                          animation: 'lemnixRotate 1s linear infinite',
                          boxShadow: '0 6px 20px rgba(59,130,246,0.4)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      }}
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)' }}>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        {cuttingPlanModal.stock.used.toLocaleString()}mm
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Kullanılan Uzunluk
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}>
                      <Typography variant="h6" fontWeight="bold" color="error.main">
                        {cuttingPlanModal.stock.waste.toLocaleString()}mm
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Atık Uzunluk
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
                      <Typography variant="h6" fontWeight="bold" color="primary.main">
                        {cuttingPlanModal.stock.count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Profil Sayısı
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)' }}>
                      <Typography variant="h6" fontWeight="bold" color="warning.main">
                        {((cuttingPlanModal.stock.used / (cuttingPlanModal.stock.length * cuttingPlanModal.stock.count)) * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Verimlilik
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              {/* Detailed Cutting Plan */}
              <Box sx={{ 
                p: 3, 
                background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(147,197,253,0.05) 100%)',
                borderRadius: 3,
                border: '2px solid rgba(59,130,246,0.1)',
                boxShadow: '0 8px 32px rgba(59,130,246,0.1)'
              }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EngineeringIcon />
                  Kesim Deseni Detaylı Açıklaması
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  <strong>İş Emri {cuttingPlanModal.stock.workOrderId}</strong> için yapılan kesim işleminin detaylı analizi:
                </Typography>

                {/* Detailed Cutting Pattern */}
                <Box sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.05) 0%, rgba(251,191,36,0.05) 100%)',
                  borderRadius: 3,
                  border: '2px solid rgba(245,158,11,0.1)',
                  boxShadow: '0 8px 32px rgba(245,158,11,0.1)',
                  mb: 3
                }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CutIcon />
                    Kesim Deseni Analizi
                  </Typography>
                  
                  {cuttingPlanModal.stock.cuts && cuttingPlanModal.stock.cuts.length > 0 ? (
                    <Stack spacing={2}>
                      {(() => {
                        // Group cuts by profile type and stock length to avoid duplicates
                        const groupedCuts = cuttingPlanModal.stock.cuts.reduce((acc: any, cut: any) => {
                          const profileType = cut.profileType || "19X25";
                          const stockLength = cut.stockLength || 7000;
                          const key = `${profileType}-${stockLength}`;
                          
                          if (!acc[key]) {
                            acc[key] = {
                              profileType,
                              stockLength,
                              usedLength: cut.usedLength || 0,
                              waste: cut.remainingLength || 0,
                              segments: cut.segments || [],
                              count: 1
                            };
                          } else {
                            // Merge segments and accumulate data
                            acc[key].usedLength += cut.usedLength || 0;
                            acc[key].waste += cut.remainingLength || 0;
                            acc[key].segments = [...acc[key].segments, ...(cut.segments || [])];
                            acc[key].count += 1;
                          }
                          return acc;
                        }, {});

                        return Object.values(groupedCuts).map((cut: any, index: number) => {
                          const profileType = cut.profileType;
                          const stockLength = cut.stockLength;
                          const usedLength = cut.usedLength;
                          const waste = cut.waste;
                          const segments = cut.segments;
                          const profileCount = cut.count;
                          
                          // Grup parçaları uzunluğa göre
                          const groupedSegments = segments.reduce((acc: any, segment: any) => {
                            const length = segment.length;
                            if (!acc[length]) {
                              acc[length] = { count: 0, length };
                            }
                            acc[length].count++;
                            return acc;
                          }, {});

                          return (
                            <Paper key={index} sx={{ 
                              p: 2, 
                              background: 'rgba(255,255,255,0.9)', 
                              borderRadius: 2,
                              border: '1px solid rgba(245,158,11,0.2)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                            }}>
                              <Typography variant="subtitle1" fontWeight="bold" color="warning.dark" gutterBottom>
                                📐 {profileType} Profil Tipi {profileCount > 1 ? `(${profileCount} profil)` : ''}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                <strong>Stok Boyu:</strong> {stockLength}mm • <strong>Kullanılan:</strong> {usedLength}mm • <strong>Fire:</strong> {waste}mm
                              </Typography>
                              
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" fontWeight="bold" color="primary.main" gutterBottom>
                                  🔹 Kesim Detayları:
                                </Typography>
                                <Stack spacing={1}>
                                  {Object.values(groupedSegments).map((segment: any, segIndex: number) => (
                                    <Typography key={segIndex} variant="body2">
                                      • <strong>{segment.count} adet</strong> × <strong>{segment.length}mm</strong> = <strong>{segment.count * segment.length}mm</strong>
                                    </Typography>
                                  ))}
                                  <Typography variant="body2" fontWeight="bold" color="success.main">
                                    ✅ Toplam kullanılan: {usedLength}mm
                                  </Typography>
                                  <Typography variant="body2" fontWeight="bold" color="error.main">
                                    ⚠️ Kalan fire: {waste}mm ({((waste / stockLength) * 100).toFixed(1)}%)
                                  </Typography>
                                </Stack>
                              </Box>

                              <Box sx={{ 
                                p: 2, 
                                background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(34,197,94,0.05) 100%)', 
                                borderRadius: 1,
                                border: '1px solid rgba(16,185,129,0.2)'
                              }}>
                                <Typography variant="body2" fontWeight="bold" color="success.dark" gutterBottom>
                                  💡 Fire Açıklaması:
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {waste > 0 ? (
                                    `Bu profil tipi için ${profileCount} profil kullanıldı. Toplam ${waste}mm fire kaldı. 
                                    ${stockLength}mm'lik stoktan ${usedLength}mm kullanıldı, 
                                    ${((usedLength / (stockLength * profileCount)) * 100).toFixed(1)}% verimlilik sağlandı. 
                                    ${waste < 100 ? 'Çok düşük fire oranı - mükemmel optimizasyon!' : 
                                      waste < 300 ? 'Düşük fire oranı - iyi optimizasyon.' : 
                                      'Orta seviye fire - kabul edilebilir.'}`
                                  ) : (
                                    `Bu profil tipi için ${profileCount} profil kullanıldı ve hiç fire kalmadı - %100 verimlilik!`
                                  )}
                                </Typography>
                              </Box>
                            </Paper>
                          );
                        });
                      })()}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Bu iş emri için kesim detayları mevcut değil.
                    </Typography>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ 
                      p: 2, 
                      background: 'rgba(255,255,255,0.9)', 
                      borderRadius: 2,
                      border: '1px solid rgba(59,130,246,0.2)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary.main" gutterBottom>
                        📐 Kesim Detayları
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          <strong>İş Emri ID:</strong> {cuttingPlanModal.stock.workOrderId}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Stok Uzunluğu:</strong> {cuttingPlanModal.stock.length}mm
                        </Typography>
                        <Typography variant="body2">
                          <strong>Kullanılan Profil:</strong> {cuttingPlanModal.stock.count} adet
                        </Typography>
                        <Typography variant="body2">
                          <strong>Toplam Kesilen Parça:</strong> {cuttingPlanModal.stock.totalPieces} adet
                        </Typography>
                        <Typography variant="body2">
                          <strong>Kullanılan Uzunluk:</strong> {cuttingPlanModal.stock.used.toLocaleString()}mm
                        </Typography>
                        <Typography variant="body2">
                          <strong>Toplam Atık:</strong> {cuttingPlanModal.stock.waste.toLocaleString()}mm
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ 
                      p: 2, 
                      background: 'rgba(255,255,255,0.9)', 
                      borderRadius: 2,
                      border: '1px solid rgba(16,185,129,0.2)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="success.main" gutterBottom>
                        📊 Verimlilik Analizi
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          <strong>Verimlilik Oranı:</strong> {cuttingPlanModal.stock.efficiency}%
                        </Typography>
                        <Typography variant="body2">
                          <strong>Ortalama Atık:</strong> {cuttingPlanModal.stock.count > 0 ? Math.round(cuttingPlanModal.stock.waste / cuttingPlanModal.stock.count) : 0}mm
                        </Typography>
                        <Typography variant="body2">
                          <strong>Kullanılan Algoritma:</strong> {cuttingPlanModal.stock.algorithmName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Ortalama Parça Uzunluğu:</strong> {cuttingPlanModal.stock.totalPieces > 0 ? Math.round(cuttingPlanModal.stock.used / cuttingPlanModal.stock.totalPieces) : 0}mm
                        </Typography>
                        <Typography variant="body2">
                          <strong>Atık Oranı:</strong> {cuttingPlanModal.stock.count > 0 && cuttingPlanModal.stock.length > 0 ? ((cuttingPlanModal.stock.waste / (cuttingPlanModal.stock.length * cuttingPlanModal.stock.count)) * 100).toFixed(1) : "0.0"}%
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>

                <Box sx={{ 
                  mt: 3, 
                  p: 2, 
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(34,197,94,0.1) 100%)', 
                  borderRadius: 2,
                  border: '1px solid rgba(16,185,129,0.3)'
                }}>
                  <Typography variant="h6" fontWeight="bold" color="success.dark" gutterBottom>
                    🎯 Sonuç Özeti
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      ✅ <strong>İş Emri {cuttingPlanModal.stock.workOrderId}</strong> için {cuttingPlanModal.stock.count} profil kullanıldı
                    </Typography>
                    <Typography variant="body2">
                      ✅ <strong>{cuttingPlanModal.stock.totalPieces}</strong> adet parça kesildi
                    </Typography>
                    <Typography variant="body2">
                      ✅ <strong>{cuttingPlanModal.stock.used.toLocaleString()}</strong>mm toplam kesim yapıldı
                    </Typography>
                    <Typography variant="body2">
                      ✅ <strong>{cuttingPlanModal.stock.efficiency}%</strong> verimlilik sağlandı ({cuttingPlanModal.stock.algorithmName})
                    </Typography>
                    <Typography variant="body2">
                      ⚠️ Toplam <strong>{cuttingPlanModal.stock.waste.toLocaleString()}</strong>mm atık oluştu
                    </Typography>
                  </Stack>
                </Box>
              </Box>

              {/* Summary */}
              <Box sx={{ 
                p: 2, 
                background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(147,197,253,0.05) 100%)',
                borderRadius: 2,
                border: '1px solid rgba(59,130,246,0.1)'
              }}>
                <Typography variant="h6" fontWeight="semibold" gutterBottom color="primary.dark">
                  ✅ Sonuç
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    • <strong>{cuttingPlanModal.stock.count}</strong> boy profil kullanıldı
                  </Typography>
                  <Typography variant="body2">
                    • <strong>{cuttingPlanModal.stock.used.toLocaleString()}</strong>mm toplam kesim yapıldı
                  </Typography>
                  <Typography variant="body2">
                    • <strong>{((cuttingPlanModal.stock.used / (cuttingPlanModal.stock.length * cuttingPlanModal.stock.count)) * 100).toFixed(1)}%</strong> verimlilik sağlandı
                  </Typography>
                  <Typography variant="body2">
                    • Ortalama <strong>{Math.round(cuttingPlanModal.stock.waste / cuttingPlanModal.stock.count)}mm</strong> atık
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setCuttingPlanModal({ open: false, stock: null })}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              fontWeight: 'bold',
              px: 3,
              py: 1,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(59,130,246,0.4)',
              },
            }}
          >
            Tamam
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnterpriseOptimizationResults;
