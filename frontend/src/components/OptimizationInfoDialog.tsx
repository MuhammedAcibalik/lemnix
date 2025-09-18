/**
 * @fileoverview Optimizasyon Bilgilendirme Diyaloğu
 * @module OptimizationInfoDialog
 * @version 1.0.0
 * 
 * Kullanıcılara optimizasyon algoritmaları ve özellikleri hakkında
 * detaylı bilgi sağlayan interaktif diyalog komponenti.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  IconButton,
  Collapse,
  Alert,
  AlertTitle,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Tooltip,
  FormControlLabel,
  Switch,
  Rating,
  Avatar
} from '@mui/material';
import {
  Info as InfoIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Nature as EcoIcon,
  Build as BuildIcon,
  Timeline as TimelineIcon,
  CompareArrows as CompareIcon,
  Psychology as PsychologyIcon,
  Science as ScienceIcon,
  Architecture as ArchitectureIcon,
  AutoGraph as AutoGraphIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Replay as ReplayIcon,
  Visibility as VisibilityIcon,
  Animation as AnimationIcon,
  Settings as SettingsIcon,
  Straighten as StraightenIcon,
  ContentCut as ContentCutIcon,
  Straighten as RulerIcon,
  Timer as TimerIcon,
  Bolt,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Quiz as QuizIcon,
  School as SchoolIcon,
  EmojiEvents as TrophyIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  GpsFixed as PrecisionIcon,
  Security as SafetyIcon,
  Engineering as EngineeringIcon
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={'info-tabpanel-' + index}
      aria-labelledby={'info-tab-' + index}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface OptimizationInfoDialogProps {
  open: boolean;
  onClose: () => void;
}

const OptimizationInfoDialog = ({ open, onClose }: OptimizationInfoDialogProps) => {
  const [tabValue, setTabValue] = useState(0);
  const [expandedAlgorithm, setExpandedAlgorithm] = useState<string | false>(false);
  const theme = useTheme();

  // Enterprise Grade Eğitim Simülasyonu State'leri
  const [trainingMode, setTrainingMode] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [currentModule, setCurrentModule] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTrainingActive, setIsTrainingActive] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [operatorScore, setOperatorScore] = useState(0);
  const [safetyViolations, setSafetyViolations] = useState(0);
  const [currentInstruction, setCurrentInstruction] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [trainingData, setTrainingData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'safety' | 'machine' | 'cutting' | 'assessment'>('overview');
  const [operatorProfile, setOperatorProfile] = useState({
    name: 'Operatör',
    experience: 0,
    certifications: [] as string[],
    performance: {
      speed: 0,
      accuracy: 0,
      safety: 100,
      efficiency: 0
    }
  });
  const [workshopState, setWorkshopState] = useState({
    machineOn: false,
    safetyGearOn: false,
    materialLoaded: false,
    cuttingInProgress: false,
    currentMaterial: null as string | null,
    machineSettings: {
      bladeSpeed: 0,
      cuttingDepth: 0,
      feedRate: 0,
      coolantFlow: 0
    }
  });
  const animationRef = useRef<number | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Enterprise Grade Eğitim Modülleri
  const trainingModules = {
    beginner: [
      {
        id: 'safety-fundamentals',
        title: 'Güvenlik Temelleri',
        description: 'Kişisel koruyucu donanım ve güvenlik protokolleri',
        duration: 45,
        points: 100,
        prerequisites: [],
        skills: ['safety', 'ppe', 'emergency'],
        steps: [
          {
            id: 'ppe-selection',
            title: 'KKD Seçimi ve Kontrolü',
            description: 'Doğru kişisel koruyucu donanım seçimi',
            interactive: true,
            validation: 'safety-gear-check',
            points: 25
          },
          {
            id: 'workspace-safety',
            title: 'Çalışma Alanı Güvenliği',
            description: 'Atölye güvenlik kuralları ve düzeni',
            interactive: true,
            validation: 'workspace-inspection',
            points: 25
          },
          {
            id: 'emergency-procedures',
            title: 'Acil Durum Prosedürleri',
            description: 'Acil durdurma ve güvenlik protokolleri',
            interactive: true,
            validation: 'emergency-test',
            points: 25
          },
          {
            id: 'safety-assessment',
            title: 'Güvenlik Değerlendirmesi',
            description: 'Güvenlik bilgisi testi ve uygulama',
            interactive: false,
            validation: 'quiz',
            points: 25
          }
        ]
      },
      {
        id: 'machine-basics',
        title: 'Makine Temelleri',
        description: 'Kesim makinesi tanıtımı ve temel operasyon',
        duration: 60,
        points: 120,
        prerequisites: ['safety-fundamentals'],
        skills: ['machine-operation', 'controls', 'maintenance'],
        steps: [
          {
            id: 'machine-overview',
            title: 'Makine Tanıtımı',
            description: 'Kesim makinesi parçaları ve fonksiyonları',
            interactive: true,
            validation: 'component-identification',
            points: 30
          },
          {
            id: 'control-panel',
            title: 'Kontrol Paneli',
            description: 'Makine kontrol paneli ve ayarları',
            interactive: true,
            validation: 'control-operation',
            points: 30
          },
          {
            id: 'basic-operation',
            title: 'Temel Operasyon',
            description: 'Makineyi güvenli şekilde çalıştırma',
            interactive: true,
            validation: 'startup-sequence',
            points: 30
          },
          {
            id: 'maintenance-basics',
            title: 'Temel Bakım',
            description: 'Günlük bakım ve kontrol prosedürleri',
            interactive: true,
            validation: 'maintenance-check',
            points: 30
          }
        ]
      }
    ],
    intermediate: [
      {
        id: 'precision-cutting',
        title: 'Hassas Kesim Teknikleri',
        description: 'Yüksek kaliteli kesim teknikleri ve ölçüm',
        duration: 75,
        points: 150,
        prerequisites: ['machine-basics'],
        skills: ['precision', 'measurement', 'quality-control'],
        steps: [
          {
            id: 'measurement-tools',
            title: 'Ölçüm Aletleri',
            description: 'Hassas ölçüm aletlerinin kullanımı',
            interactive: true,
            validation: 'measurement-accuracy',
            points: 40
          },
          {
            id: 'cutting-parameters',
            title: 'Kesim Parametreleri',
            description: 'Optimal kesim ayarları ve optimizasyon',
            interactive: true,
            validation: 'parameter-optimization',
            points: 40
          },
          {
            id: 'quality-control',
            title: 'Kalite Kontrolü',
            description: 'Kesim kalitesi değerlendirme ve iyileştirme',
            interactive: true,
            validation: 'quality-assessment',
            points: 40
          },
          {
            id: 'troubleshooting',
            title: 'Problem Çözme',
            description: 'Yaygın problemler ve çözüm yöntemleri',
            interactive: true,
            validation: 'problem-solving',
            points: 30
          }
        ]
      }
    ],
    advanced: [
      {
        id: 'advanced-operations',
        title: 'İleri Seviye Operasyonlar',
        description: 'Karmaşık kesimler ve optimizasyon teknikleri',
        duration: 90,
        points: 200,
        prerequisites: ['precision-cutting'],
        skills: ['optimization', 'complex-cutting', 'leadership'],
        steps: [
          {
            id: 'complex-geometries',
            title: 'Karmaşık Geometriler',
            description: 'Açılı ve karmaşık kesimler',
            interactive: true,
            validation: 'geometry-mastery',
            points: 50
          },
          {
            id: 'material-optimization',
            title: 'Malzeme Optimizasyonu',
            description: 'Atık minimizasyonu ve verimlilik',
            interactive: true,
            validation: 'optimization-mastery',
            points: 50
          },
          {
            id: 'process-improvement',
            title: 'Süreç İyileştirme',
            description: 'Kesim süreçlerinin optimizasyonu',
            interactive: true,
            validation: 'process-mastery',
            points: 50
          },
          {
            id: 'mentoring-skills',
            title: 'Eğitmenlik Becerileri',
            description: 'Yeni operatörlere rehberlik etme',
            interactive: true,
            validation: 'mentoring-assessment',
            points: 50
          }
        ]
      }
    ]
  };

  // Enterprise Grade Eğitim Fonksiyonları
  const startTraining = () => {
    setIsTrainingActive(true);
    setCurrentModule(0);
    setCurrentStep(0);
    setTrainingProgress(0);
    setOperatorScore(0);
    setSafetyViolations(0);
    setCurrentInstruction('');
    setShowHint(false);
    setActiveTab('overview');
    
    const modules = trainingModules[trainingMode];
    if (modules.length > 0) {
      setCurrentInstruction(`Eğitim başlatılıyor: ${modules[0].title}`);
      setTrainingData(modules[0]);
    }
  };

  const startModule = (module: any) => {
    setCurrentInstruction(module.description);
    setTrainingData(module);
    setCurrentStep(0);
    setActiveTab('safety');
  };

  const startStep = (step: any) => {
    setCurrentInstruction(step.description);
    setShowHint(false);
    
    if (step.interactive) {
      setActiveTab('machine');
      // Etkileşimli eğitim başlat
      initializeInteractiveStep(step);
    } else {
      setActiveTab('assessment');
      // Değerlendirme başlat
      initializeAssessment(step);
    }
  };

  const initializeInteractiveStep = (step: any) => {
    // Etkileşimli adım için gerekli state'leri ayarla
    switch (step.validation) {
      case 'safety-gear-check':
        setWorkshopState(prev => ({ ...prev, safetyGearOn: false }));
        break;
      case 'workspace-inspection':
        setWorkshopState(prev => ({ ...prev, machineOn: false }));
        break;
      case 'component-identification':
        setWorkshopState(prev => ({ ...prev, machineOn: true }));
        break;
      case 'control-operation':
        setWorkshopState(prev => ({ 
          ...prev, 
          machineOn: true,
          machineSettings: { ...prev.machineSettings, bladeSpeed: 0 }
        }));
        break;
    }
  };

  const initializeAssessment = (step: any) => {
    // Değerlendirme için gerekli state'leri ayarla
    setActiveTab('assessment');
  };

  const validateStep = (step: any, userAction: any) => {
    let isValid = false;
    let points = 0;
    
    switch (step.validation) {
      case 'safety-gear-check':
        isValid = userAction.safetyGearOn && userAction.ppeComplete;
        points = isValid ? step.points : 0;
        break;
      case 'workspace-inspection':
        isValid = userAction.workspaceClean && userAction.emergencyClear;
        points = isValid ? step.points : 0;
        break;
      case 'component-identification':
        isValid = userAction.componentsIdentified >= 0.8;
        points = isValid ? step.points : Math.floor(step.points * userAction.componentsIdentified);
        break;
      case 'control-operation':
        isValid = userAction.controlsCorrect >= 0.9;
        points = isValid ? step.points : Math.floor(step.points * userAction.controlsCorrect);
        break;
    }
    
    if (isValid) {
      setOperatorScore(prev => prev + points);
      setTrainingProgress(prev => prev + (100 / getTotalSteps()));
      setCurrentInstruction(`✅ ${step.title} başarıyla tamamlandı! +${points} puan`);
    } else {
      setSafetyViolations(prev => prev + 1);
      setCurrentInstruction(`❌ ${step.title} tekrar edilmeli. Güvenlik kurallarına dikkat edin.`);
    }
    
    return { isValid, points };
  };

  const getTotalSteps = () => {
    const modules = trainingModules[trainingMode];
    return modules.reduce((total, module) => total + module.steps.length, 0);
  };

  const completeModule = (module: any) => {
    setOperatorScore(prev => prev + module.points);
    setCurrentInstruction(`🎉 ${module.title} modülü tamamlandı! +${module.points} puan`);
    
    // Sertifika kontrolü
    if (module.points >= module.points * 0.8) {
      setOperatorProfile(prev => ({
        ...prev,
        certifications: [...prev.certifications, `${module.title} Sertifikası`]
      }));
    }
    
    setTimeout(() => {
      const modules = trainingModules[trainingMode];
      const nextModuleIndex = modules.findIndex(m => m.id === module.id) + 1;
      
      if (nextModuleIndex < modules.length) {
        setCurrentModule(nextModuleIndex);
        startModule(modules[nextModuleIndex]);
      } else {
        // Tüm modüller tamamlandı
        setIsTrainingActive(false);
        setCurrentInstruction(`🏆 ${trainingMode} seviye eğitimi tamamlandı! Toplam puan: ${operatorScore + module.points}`);
        setActiveTab('assessment');
      }
    }, 3000);
  };

  const stopTraining = () => {
    setIsTrainingActive(false);
    if (animationRef.current) {
      window.clearTimeout(animationRef.current);
    }
    setCurrentInstruction('Eğitim durduruldu');
  };

  const resetTraining = () => {
    stopTraining();
    setCurrentModule(0);
    setCurrentStep(0);
    setTrainingProgress(0);
    setOperatorScore(0);
    setSafetyViolations(0);
    setCurrentInstruction('');
    setShowHint(false);
    setTrainingData(null);
    setActiveTab('overview');
    setWorkshopState({
      machineOn: false,
      safetyGearOn: false,
      materialLoaded: false,
      cuttingInProgress: false,
      currentMaterial: null,
      machineSettings: {
        bladeSpeed: 0,
        cuttingDepth: 0,
        feedRate: 0,
        coolantFlow: 0
      }
    });
  };

  // Eğitim seviyesi seçimi
  const getTrainingLevelInfo = (level: string) => {
    const info = {
      beginner: {
        title: 'Başlangıç Seviyesi',
        description: 'Temel güvenlik ve makine kullanımı',
        color: '#4caf50',
        icon: '🟢'
      },
      intermediate: {
        title: 'Orta Seviye',
        description: 'Hassas ölçüm ve kesim teknikleri',
        color: '#ff9800',
        icon: '🟡'
      },
      advanced: {
        title: 'İleri Seviye',
        description: 'Karmaşık kesimler ve optimizasyon',
        color: '#f44336',
        icon: '🔴'
      }
    };
    return info[level as keyof typeof info];
  };


  useEffect(() => {
    return () => {
      if (animationRef.current) {
        window.clearTimeout(animationRef.current);
      }
    };
  }, []);

  const algorithms = [
    {
      id: 'ffd',
      name: 'FFD (First Fit Decreasing)',
      turkishName: 'İlk Uygun Azalan',
      description: 'Parçaları büyükten küçüğe sıralar ve ilk uygun stoğa yerleştirir.',
      complexity: 'O(n²)',
      efficiency: '85-90%',
      speed: 'Çok Hızlı',
      pros: ['Hızlı', 'Basit', 'Güvenilir', 'Deterministik'],
      cons: ['Optimal garanti yok', 'Sıralamaya bağımlı'],
      bestFor: 'Hızlı sonuç gereken durumlar',
      icon: <SpeedIcon />
    },
    {
      id: 'bfd',
      name: 'BFD (Best Fit Decreasing)',
      turkishName: 'En İyi Uygun Azalan',
      description: 'Her parça için minimum atık bırakan stoğu seçer.',
      complexity: 'O(n²)',
      efficiency: '87-92%',
      speed: 'Hızlı',
      pros: ['Daha az atık', 'Daha iyi paketleme', 'Tutarlı sonuçlar'],
      cons: ['FFD\'den biraz yavaş', 'Daha fazla bellek'],
      bestFor: 'Atık minimizasyonu kritik durumlar',
      icon: <TrendingUpIcon />
    },
    {
      id: 'nfd',
      name: 'NFD (Next Fit Decreasing)',
      turkishName: 'Sıradaki Uygun Azalan',
      description: 'Sadece mevcut stoğa bakar, dolunca yenisine geçer.',
      complexity: 'O(n)',
      efficiency: '75-85%',
      speed: 'En Hızlı',
      pros: ['Çok hızlı', 'Minimum bellek', 'Basit implementasyon'],
      cons: ['Düşük verimlilik', 'Daha fazla stok kullanımı'],
      bestFor: 'Çok büyük veri setleri, hız kritik',
      icon: <TimelineIcon />
    },
    {
      id: 'wfd',
      name: 'WFD (Worst Fit Decreasing)',
      turkishName: 'En Kötü Uygun Azalan',
      description: 'En çok boş alan olan stoğa yerleştirir.',
      complexity: 'O(n²)',
      efficiency: '70-80%',
      speed: 'Hızlı',
      pros: ['Dengeli dağılım', 'Büyük parçalar için alan'],
      cons: ['En düşük verimlilik', 'Daha fazla atık'],
      bestFor: 'Değişken boyutlu parçalar',
      icon: <CompareIcon />
    },
    {
      id: 'genetic',
      name: 'Genetic Algorithm',
      turkishName: 'Genetik Algoritma',
      description: 'Evrimsel süreçlerle optimal çözüm arar. Popülasyon tabanlı, çaprazlama ve mutasyon kullanır.',
      complexity: 'O(n²)',
      efficiency: '90-95%',
      speed: 'Orta',
      pros: ['Yüksek kalite', 'Global optimum', 'Çok amaçlı', 'Adaptif'],
      cons: ['Yavaş', 'Stokastik', 'Parametre hassasiyeti'],
      bestFor: 'Kalite kritik, zaman esnek durumlar',
      icon: <PsychologyIcon />
    },
    {
      id: 'simulated-annealing',
      name: 'Simulated Annealing',
      turkishName: 'Benzetilmiş Tavlama',
      description: 'Metalurjik tavlama sürecini simüle eder. Sıcaklık azaldıkça çözüm iyileşir.',
      complexity: 'O(n²)',
      efficiency: '88-93%',
      speed: 'Orta',
      pros: ['Lokal optimumdan kaçar', 'Esnek', 'İyi sonuçlar'],
      cons: ['Parametre ayarı zor', 'Yakınsama yavaş'],
      bestFor: 'Karmaşık kısıtlı problemler',
      icon: <ScienceIcon />
    },
    {
      id: 'branch-and-bound',
      name: 'Branch & Bound',
      turkishName: 'Dal ve Sınır',
      description: 'Sistematik arama ile optimal çözümü garanti eder.',
      complexity: 'O(2^n)',
      efficiency: '95-100%',
      speed: 'Çok Yavaş',
      pros: ['Optimal garanti', 'Kesin sonuç', 'Kanıtlanabilir'],
      cons: ['Çok yavaş', 'Yüksek bellek', 'Ölçeklenemiyor'],
      bestFor: 'Küçük problemler, kesin çözüm gerekli',
      icon: <ArchitectureIcon />
    }
  ];

  const features = [
    {
      title: 'Kerf (Kesim) Genişliği',
      description: 'Her kesimde kaybedilen malzeme miktarı (mm)',
      default: '3.5 mm',
      impact: 'Toplam kullanılabilir uzunluğu azaltır'
    },
    {
      title: 'Başlangıç Güvenlik Payı',
      description: 'Stok başında bırakılan güvenlik mesafesi',
      default: '2.0 mm',
      impact: 'Kesim kalitesini artırır, ilk parça hasarını önler'
    },
    {
      title: 'Bitiş Güvenlik Payı',
      description: 'Stok sonunda bırakılan güvenlik mesafesi',
      default: '2.0 mm',
      impact: 'Son kesim kalitesini korur'
    },
    {
      title: 'Minimum Hurda Uzunluğu',
      description: 'Geri kazanılabilir kabul edilen minimum parça',
      default: '75 mm',
      impact: 'Bu değerin altındaki parçalar atık sayılır'
    },
    {
      title: 'Stok Başına Enerji',
      description: 'Her stok kesimi için harcanan enerji (kWh)',
      default: '0.5 kWh',
      impact: 'Toplam enerji maliyetini etkiler'
    }
  ];

  const optimizationSteps = [
    {
      label: 'Veri Girişi',
      description: 'Kesilecek parçaların boyut ve adetlerini girin'
    },
    {
      label: 'Algoritma Seçimi',
      description: 'İhtiyacınıza uygun algoritmayı seçin'
    },
    {
      label: 'Parametre Ayarları',
      description: 'Kerf, güvenlik payı gibi parametreleri ayarlayın'
    },
    {
      label: 'Optimizasyon',
      description: 'Sistem en iyi kesim planını hesaplar'
    },
    {
      label: 'Sonuç Analizi',
      description: 'Verimlilik, maliyet ve atık raporlarını inceleyin'
    }
  ];

  const metrics = [
    { name: 'Verimlilik', formula: '(Kullanılan / Toplam Stok) × 100', unit: '%' },
    { name: 'Atık', formula: 'Toplam Stok - Kullanılan', unit: 'mm' },
    { name: 'Maliyet', formula: 'Malzeme + Kesim + Kurulum + Atık + Zaman + Enerji', unit: '₺' },
    { name: 'Güven Skoru', formula: 'Verimlilik × Kalite × Tutarlılık', unit: '0-100' }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon color="primary" />
          <Typography variant="h5" fontWeight="bold">
            Optimizasyon Sistemi Kullanım Kılavuzu
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="info tabs">
            <Tab label="Genel Bakış" />
            <Tab label="Algoritmalar" />
            <Tab label="Parametreler" />
            <Tab label="Kullanım Adımları" />
            <Tab label="Metrikler" />
            <Tab label="Simülasyon" icon={<AnimationIcon />} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <AlertTitle>Kurumsal Optimizasyon Sistemi</AlertTitle>
                Bu sistem, alüminyum profil kesim işlemlerinizi optimize ederek malzeme israfını minimize eder,
                verimliliği maksimize eder ve maliyetleri düşürür.
              </Alert>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    <BuildIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Temel Özellikler
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="7 Farklı Optimizasyon Algoritması"
                        secondary="Her senaryo için uygun algoritma"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Gerçek Zamanlı Hesaplama"
                        secondary="Anında sonuç ve görselleştirme"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Çok Amaçlı Optimizasyon"
                        secondary="Verimlilik, maliyet ve zaman dengesi"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Detaylı Raporlama"
                        secondary="Kapsamlı analiz ve öneriler"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    <AutoGraphIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Sistem Avantajları
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><MoneyIcon color="warning" /></ListItemIcon>
                      <ListItemText 
                        primary="%15-30 Maliyet Tasarrufu"
                        secondary="Optimize edilmiş kesim planları"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><EcoIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="%10-20 Atık Azaltımı"
                        secondary="Çevre dostu üretim"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><SpeedIcon color="info" /></ListItemIcon>
                      <ListItemText 
                        primary="%25 Zaman Tasarrufu"
                        secondary="Otomatik plan oluşturma"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><TrendingUpIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="%85-95 Verimlilik"
                        secondary="Endüstri lideri performans"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <Typography variant="body1" paragraph>
                  <strong>Nasıl Çalışır?</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sistem, verdiğiniz parça listesini alır ve seçtiğiniz algoritmaya göre en verimli kesim planını oluşturur.
                  Her algoritma farklı senaryolar için optimize edilmiştir. Hız mı önemli? FFD veya NFD kullanın.
                  Maksimum verimlilik mi gerekli? Genetik Algoritma veya Branch & Bound tercih edin.
                  Sistem, kerf kaybı, güvenlik payları ve malzeme özelliklerini de hesaba katarak gerçekçi sonuçlar üretir.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Optimizasyon Algoritmaları
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Her algoritmanın kendine özgü avantajları vardır. İhtiyacınıza göre seçim yapın.
          </Typography>

          {algorithms.map((algo) => (
            <Accordion 
              key={algo.id}
              expanded={expandedAlgorithm === algo.id}
              onChange={(e, isExpanded) => setExpandedAlgorithm(isExpanded ? algo.id : false)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  {algo.icon}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {algo.turkishName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {algo.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label={algo.complexity} size="small" color="primary" variant="outlined" />
                    <Chip label={algo.efficiency} size="small" color="success" variant="outlined" />
                    <Chip label={algo.speed} size="small" color="info" variant="outlined" />
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" paragraph>
                      {algo.description}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="success.main" gutterBottom>
                      Avantajlar
                    </Typography>
                    <List dense>
                      {algo.pros.map((pro, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon><CheckIcon fontSize="small" color="success" /></ListItemIcon>
                          <ListItemText primary={pro} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="warning.main" gutterBottom>
                      Dezavantajlar
                    </Typography>
                    <List dense>
                      {algo.cons.map((con, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon><CloseIcon fontSize="small" color="warning" /></ListItemIcon>
                          <ListItemText primary={con} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  <Grid item xs={12}>
                    <Alert severity="info" variant="outlined">
                      <strong>En uygun kullanım:</strong> {algo.bestFor}
                    </Alert>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Sistem Parametreleri
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Bu parametreler kesim planının doğruluğunu ve verimliliğini doğrudan etkiler.
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Parametre</TableCell>
                  <TableCell>Açıklama</TableCell>
                  <TableCell>Varsayılan</TableCell>
                  <TableCell>Etkisi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {features.map((feature, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {feature.title}
                      </Typography>
                    </TableCell>
                    <TableCell>{feature.description}</TableCell>
                    <TableCell>
                      <Chip label={feature.default} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {feature.impact}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Alert severity="warning" sx={{ mt: 2 }}>
            <AlertTitle>Önemli</AlertTitle>
            Parametreleri makinenizin özelliklerine ve malzeme tipine göre ayarlayın.
            Yanlış parametreler hatalı kesim planlarına neden olabilir.
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Kullanım Adımları
          </Typography>
          
          <Stepper orientation="vertical" activeStep={-1}>
            {optimizationSteps.map((step, index) => (
              <Step key={index} expanded>
                <StepLabel>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {step.label}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>

          <Paper sx={{ p: 2, mt: 3, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              İpuçları
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="• Büyük veri setleri için önce FFD ile hızlı sonuç alın"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="• Kritik projeler için Genetik Algoritma kullanın"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="• Kerf değerini makinenize göre doğru ayarlayın"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="• Algoritma karşılaştırma özelliğini kullanarak en iyi sonucu bulun"
                />
              </ListItem>
            </List>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            Performans Metrikleri
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Metrik</TableCell>
                  <TableCell>Formül</TableCell>
                  <TableCell>Birim</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {metrics.map((metric, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {metric.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {metric.formula}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={metric.unit} size="small" variant="outlined" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Alert severity="success">
                <AlertTitle>İyi Sonuç Kriterleri</AlertTitle>
                • Verimlilik &gt; %85<br />
                • Atık &lt; %15<br />
                • Güven Skoru &gt; 80
              </Alert>
            </Grid>
            <Grid item xs={12} md={6}>
              <Alert severity="error">
                <AlertTitle>Kötü Sonuç Belirtileri</AlertTitle>
                • Verimlilik &lt; %70<br />
                • Çok fazla stok kullanımı<br />
                • Yüksek maliyet
              </Alert>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ 
              background: 'linear-gradient(45deg, ' + theme.palette.primary.main + ', ' + theme.palette.secondary.main + ')',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}>
              <AnimationIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
              Enterprise Operatör Eğitim Simülasyonu
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Profesyonel profil kesim operatörleri için kapsamlı eğitim platformu. Güvenlik, makine operasyonu ve ileri seviye teknikler.
            </Typography>
          </Box>

          {/* Tab Navigation - Scroll Bar Olmadan */}
          <Box sx={{ mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 48,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderBottom: '2px solid transparent',
                  '&.Mui-selected': {
                    borderBottom: '2px solid ' + theme.palette.primary.main,
                    color: theme.palette.primary.main
                  }
                }
              }}
            >
              <Tab 
                label="📊 Genel Bakış" 
                value="overview"
                icon={<AssessmentIcon />}
                iconPosition="start"
              />
              <Tab 
                label="🛡️ Güvenlik" 
                value="safety"
                icon={<SecurityIcon />}
                iconPosition="start"
              />
              <Tab 
                label="⚙️ Makine" 
                value="machine"
                icon={<BuildIcon />}
                iconPosition="start"
              />
              <Tab 
                label="✂️ Kesim" 
                value="cutting"
                icon={<ContentCutIcon />}
                iconPosition="start"
              />
              <Tab 
                label="📋 Değerlendirme" 
                value="assessment"
                icon={<QuizIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Box>
          
          {/* Tab Content - Scroll Bar Olmadan */}
          <Box sx={{ height: '600px', overflow: 'hidden' }}>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <Grid container spacing={3} sx={{ height: '100%' }}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon color="primary" />
                        Operatör Profili
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
                          {operatorProfile.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">{operatorProfile.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {trainingMode === 'beginner' ? 'Başlangıç Seviyesi' : 
                             trainingMode === 'intermediate' ? 'Orta Seviye' : 'İleri Seviye'}
                          </Typography>
                        </Box>
                      </Box>

                      <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Eğitim Seviyesi</InputLabel>
                        <Select
                          value={trainingMode}
                          onChange={(e) => setTrainingMode(e.target.value as any)}
                          label="Eğitim Seviyesi"
                          disabled={isTrainingActive}
                        >
                          <MenuItem value="beginner">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <SafetyIcon sx={{ color: '#4caf50' }} />
                              <Box>
                                <Typography variant="body2" fontWeight="bold">Başlangıç</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Temel güvenlik ve makine kullanımı
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                          <MenuItem value="intermediate">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PrecisionIcon sx={{ color: '#ff9800' }} />
                              <Box>
                                <Typography variant="body2" fontWeight="bold">Orta Seviye</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Hassas ölçüm ve kesim teknikleri
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                          <MenuItem value="advanced">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EngineeringIcon sx={{ color: '#f44336' }} />
                              <Box>
                                <Typography variant="body2" fontWeight="bold">İleri Seviye</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Karmaşık kesimler ve optimizasyon
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>

                      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                        <Button
                          variant="contained"
                          startIcon={<PlayIcon />}
                          onClick={startTraining}
                          disabled={isTrainingActive}
                          sx={{ flex: 1 }}
                        >
                          Eğitimi Başlat
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<PauseIcon />}
                          onClick={stopTraining}
                          disabled={!isTrainingActive}
                          sx={{ flex: 1 }}
                        >
                          Durdur
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<ReplayIcon />}
                          onClick={resetTraining}
                          sx={{ flex: 1 }}
                        >
                          Sıfırla
                        </Button>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle2" gutterBottom>
                        Performans Metrikleri
                      </Typography>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Hız</Typography>
                          <Typography variant="body2" color="primary.main">
                            {operatorProfile.performance.speed}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={operatorProfile.performance.speed}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Hassasiyet</Typography>
                          <Typography variant="body2" color="success.main">
                            {operatorProfile.performance.accuracy}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={operatorProfile.performance.accuracy}
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            '& .MuiLinearProgress-bar': { bgcolor: '#4caf50' }
                          }}
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Güvenlik</Typography>
                          <Typography variant="body2" color={operatorProfile.performance.safety > 80 ? 'success.main' : 'error.main'}>
                            {operatorProfile.performance.safety}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={operatorProfile.performance.safety}
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            '& .MuiLinearProgress-bar': { bgcolor: operatorProfile.performance.safety > 80 ? '#4caf50' : '#f44336' }
                          }}
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Verimlilik</Typography>
                          <Typography variant="body2" color="info.main">
                            {operatorProfile.performance.efficiency}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={operatorProfile.performance.efficiency}
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            '& .MuiLinearProgress-bar': { bgcolor: '#2196f3' }
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SchoolIcon color="primary" />
                        Eğitim Modülleri
                      </Typography>

                      <Stepper activeStep={currentModule} orientation="vertical" sx={{ height: '100%' }}>
                        {trainingModules[trainingMode].map((module, index) => (
                          <Step key={module.id}>
                            <StepLabel
                              optional={
                                <Typography variant="caption">
                                  {module.duration} dk • {module.points} puan
                                </Typography>
                              }
                            >
                              {module.title}
                            </StepLabel>
                            <StepContent>
                              <Typography variant="body2" sx={{ mb: 2 }}>
                                {module.description}
                              </Typography>
                              
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Gerekli Beceriler:
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                  {module.skills.map((skill) => (
                                    <Chip
                                      key={skill}
                                      label={skill}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                    />
                                  ))}
                                </Box>
                              </Box>

                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  variant="contained"
                                  onClick={() => startModule(module)}
                                  disabled={isTrainingActive && currentModule !== index}
                                >
                                  Başlat
                                </Button>
                                <Button
                                  variant="outlined"
                                  onClick={() => setActiveTab('safety')}
                                >
                                  Detaylar
                                </Button>
                              </Box>
                            </StepContent>
                          </Step>
                        ))}
                      </Stepper>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Safety Tab */}
            {activeTab === 'safety' && (
              <Grid container spacing={3} sx={{ height: '100%' }}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SecurityIcon color="primary" />
                        Güvenlik Ekipmanları
                      </Typography>

                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle1">Kişisel Koruyucu Donanım (KKD)</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={workshopState.safetyGearOn}
                                  onChange={(e) => setWorkshopState(prev => ({ ...prev, safetyGearOn: e.target.checked }))}
                                />
                              }
                              label="Güvenlik Gözlüğü"
                            />
                            <FormControlLabel
                              control={<Switch />}
                              label="İş Eldiveni"
                            />
                            <FormControlLabel
                              control={<Switch />}
                              label="İş Ayakkabısı"
                            />
                            <FormControlLabel
                              control={<Switch />}
                              label="İş Kıyafeti"
                            />
                          </Box>
                        </AccordionDetails>
                      </Accordion>

                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle1">Çalışma Alanı Güvenliği</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <FormControlLabel
                              control={<Switch />}
                              label="Acil Çıkış Yolları Açık"
                            />
                            <FormControlLabel
                              control={<Switch />}
                              label="Yangın Söndürücü Hazır"
                            />
                            <FormControlLabel
                              control={<Switch />}
                              label="İlk Yardım Çantası Erişilebilir"
                            />
                            <FormControlLabel
                              control={<Switch />}
                              label="Çalışma Alanı Temiz"
                            />
                          </Box>
                        </AccordionDetails>
                      </Accordion>

                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle1">Acil Durum Prosedürleri</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Button variant="outlined" color="error" startIcon={<WarningIcon />}>
                              Acil Durdurma Butonu Test Et
                            </Button>
                            <Button variant="outlined" color="warning" startIcon={<InfoIcon />}>
                              Acil Durum Numaraları
                            </Button>
                            <Button variant="outlined" color="info" startIcon={<SecurityIcon />}>
                              Güvenlik Protokolleri
                            </Button>
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SafetyIcon color="primary" />
                        3D Güvenlik Simülasyonu
                      </Typography>

                      <Box sx={{
                        position: 'relative',
                        width: '100%',
                        height: '400px',
                        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                        borderRadius: 2,
                        border: '2px solid #2196f3',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2
                      }}>
                        {/* Operatör Karakteri */}
                        <Box sx={{
                          width: '80px',
                          height: '100px',
                          background: workshopState.safetyGearOn 
                            ? 'linear-gradient(180deg, #4caf50, #2e7d32)' 
                            : 'linear-gradient(180deg, #f44336, #c62828)',
                          borderRadius: '40px 40px 20px 20px',
                          position: 'relative',
                          transition: 'all 0.3s ease',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: '-15px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '50px',
                            height: '25px',
                            background: workshopState.safetyGearOn ? '#4caf50' : '#f44336',
                            borderRadius: '25px 25px 8px 8px',
                            transition: 'all 0.3s ease'
                          }
                        }} />

                        {/* Güvenlik Ekipmanları */}
                        <Box sx={{
                          position: 'absolute',
                          top: '20%',
                          right: '20%',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1
                        }}>
                          <Box sx={{
                            width: '40px',
                            height: '25px',
                            background: '#17a2b8',
                            borderRadius: 2,
                            opacity: workshopState.safetyGearOn ? 1 : 0.3,
                            transition: 'opacity 0.3s ease'
                          }} />
                          <Box sx={{
                            width: '35px',
                            height: '20px',
                            background: '#6f42c1',
                            borderRadius: 2,
                            opacity: workshopState.safetyGearOn ? 1 : 0.3,
                            transition: 'opacity 0.3s ease'
                          }} />
                        </Box>

                        {/* Güvenlik Durumu */}
                        <Box sx={{
                          position: 'absolute',
                          bottom: '20%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: workshopState.safetyGearOn ? 'rgba(76,175,80,0.9)' : 'rgba(244,67,54,0.9)',
                          color: 'white',
                          padding: 2,
                          borderRadius: 2,
                          textAlign: 'center'
                        }}>
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            {workshopState.safetyGearOn ? '✅ Güvenli' : '❌ Güvensiz'}
                          </Typography>
                          <Typography variant="body2">
                            {workshopState.safetyGearOn 
                              ? 'Tüm güvenlik ekipmanları takılı' 
                              : 'Güvenlik ekipmanları eksik'}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Machine Tab */}
            {activeTab === 'machine' && (
              <Grid container spacing={3} sx={{ height: '100%' }}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BuildIcon color="primary" />
                        Makine Kontrolleri
                      </Typography>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Makine Durumu
                        </Typography>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={workshopState.machineOn}
                              onChange={(e) => setWorkshopState(prev => ({ ...prev, machineOn: e.target.checked }))}
                            />
                          }
                          label={workshopState.machineOn ? "Makine Açık" : "Makine Kapalı"}
                        />
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Bıçak Hızı: {workshopState.machineSettings.bladeSpeed} RPM
                        </Typography>
                        <Slider
                          value={workshopState.machineSettings.bladeSpeed}
                          onChange={(_, value) => setWorkshopState(prev => ({
                            ...prev,
                            machineSettings: { ...prev.machineSettings, bladeSpeed: value as number }
                          }))}
                          min={0}
                          max={3000}
                          step={100}
                          disabled={!workshopState.machineOn}
                          sx={{ color: '#f59e0b' }}
                        />
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Kesim Derinliği: {workshopState.machineSettings.cuttingDepth} mm
                        </Typography>
                        <Slider
                          value={workshopState.machineSettings.cuttingDepth}
                          onChange={(_, value) => setWorkshopState(prev => ({
                            ...prev,
                            machineSettings: { ...prev.machineSettings, cuttingDepth: value as number }
                          }))}
                          min={0}
                          max={50}
                          step={1}
                          disabled={!workshopState.machineOn}
                          sx={{ color: '#e53e3e' }}
                        />
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Besleme Hızı: {workshopState.machineSettings.feedRate} mm/min
                        </Typography>
                        <Slider
                          value={workshopState.machineSettings.feedRate}
                          onChange={(_, value) => setWorkshopState(prev => ({
                            ...prev,
                            machineSettings: { ...prev.machineSettings, feedRate: value as number }
                          }))}
                          min={0}
                          max={1000}
                          step={50}
                          disabled={!workshopState.machineOn}
                          sx={{ color: '#60a5fa' }}
                        />
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Soğutma Akışı: {workshopState.machineSettings.coolantFlow}%
                        </Typography>
                        <Slider
                          value={workshopState.machineSettings.coolantFlow}
                          onChange={(_, value) => setWorkshopState(prev => ({
                            ...prev,
                            machineSettings: { ...prev.machineSettings, coolantFlow: value as number }
                          }))}
                          min={0}
                          max={100}
                          step={5}
                          disabled={!workshopState.machineOn}
                          sx={{ color: '#22c55e' }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SettingsIcon color="primary" />
                        3D Makine Simülasyonu
                      </Typography>

                      <Box sx={{
                        position: 'relative',
                        width: '100%',
                        height: '400px',
                        background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                        borderRadius: 2,
                        border: '2px solid #9c27b0',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2
                      }}>
                        {/* Kesim Masası */}
                        <Box sx={{
                          width: '250px',
                          height: '30px',
                          background: 'linear-gradient(90deg, #6c757d, #495057)',
                          borderRadius: 2,
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: '50%',
                            left: '10%',
                            right: '10%',
                            height: '3px',
                            background: 'linear-gradient(90deg, #28a745, #20c997)',
                            borderRadius: 1
                          }
                        }} />

                        {/* Testere Bıçağı */}
                        <Box sx={{
                          width: '8px',
                          height: '80px',
                          background: workshopState.machineOn 
                            ? 'linear-gradient(180deg, #e53e3e, #c53030, #9b2c2c)' 
                            : 'linear-gradient(180deg, #6b7280, #4b5563)',
                          borderRadius: '4px',
                          boxShadow: workshopState.machineOn ? '0 0 20px rgba(229,62,62,0.8)' : 'none',
                          animation: workshopState.machineOn ? 'sawBlade3D 0.1s infinite' : 'none',
                          '@keyframes sawBlade3D': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' }
                          }
                        }} />

                        {/* Makine Durumu */}
                        <Box sx={{
                          position: 'absolute',
                          bottom: '20%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: workshopState.machineOn ? 'rgba(76,175,80,0.9)' : 'rgba(108,117,125,0.9)',
                          color: 'white',
                          padding: 2,
                          borderRadius: 2,
                          textAlign: 'center'
                        }}>
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            {workshopState.machineOn ? '🟢 Çalışıyor' : '🔴 Durdu'}
                          </Typography>
                          <Typography variant="body2">
                            Hız: {workshopState.machineSettings.bladeSpeed} RPM
                          </Typography>
                          <Typography variant="body2">
                            Derinlik: {workshopState.machineSettings.cuttingDepth} mm
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Cutting Tab */}
            {activeTab === 'cutting' && (
              <Grid container spacing={3} sx={{ height: '100%' }}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ContentCutIcon color="primary" />
                        Kesim Parametreleri
                      </Typography>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Malzeme Yüklendi
                        </Typography>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={workshopState.materialLoaded}
                              onChange={(e) => setWorkshopState(prev => ({ ...prev, materialLoaded: e.target.checked }))}
                            />
                          }
                          label={workshopState.materialLoaded ? "Malzeme Hazır" : "Malzeme Yok"}
                        />
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Kesim İşlemi
                        </Typography>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={workshopState.cuttingInProgress}
                              onChange={(e) => setWorkshopState(prev => ({ ...prev, cuttingInProgress: e.target.checked }))}
                              disabled={!workshopState.materialLoaded || !workshopState.machineOn}
                            />
                          }
                          label={workshopState.cuttingInProgress ? "Kesim Devam Ediyor" : "Kesim Bekliyor"}
                        />
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Malzeme Tipi
                        </Typography>
                        <FormControl fullWidth>
                          <InputLabel>Malzeme Seçin</InputLabel>
                          <Select
                            value={workshopState.currentMaterial || ''}
                            onChange={(e) => setWorkshopState(prev => ({ ...prev, currentMaterial: e.target.value }))}
                            label="Malzeme Seçin"
                          >
                            <MenuItem value="aluminum">Alüminyum Profil</MenuItem>
                            <MenuItem value="steel">Çelik Profil</MenuItem>
                            <MenuItem value="plastic">Plastik Profil</MenuItem>
                            <MenuItem value="composite">Kompozit Malzeme</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Kesim Kalitesi
                        </Typography>
                        <Rating
                          value={4}
                          readOnly
                          size="large"
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Mükemmel kesim kalitesi
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AnimationIcon color="primary" />
                        3D Kesim Simülasyonu
                      </Typography>

                      <Box sx={{
                        position: 'relative',
                        width: '100%',
                        height: '400px',
                        background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                        borderRadius: 2,
                        border: '2px solid #ff9800',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2
                      }}>
                        {/* Profil Çubuğu */}
                        <Box sx={{
                          width: '200px',
                          height: '15px',
                          background: workshopState.currentMaterial === 'aluminum' ? 'linear-gradient(90deg, #ffc107, #fd7e14)' :
                                     workshopState.currentMaterial === 'steel' ? 'linear-gradient(90deg, #6c757d, #495057)' :
                                     workshopState.currentMaterial === 'plastic' ? 'linear-gradient(90deg, #17a2b8, #138496)' :
                                     'linear-gradient(90deg, #6f42c1, #5a32a3)',
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          animation: workshopState.cuttingInProgress ? 'materialCut 2s ease-in-out infinite' : 'none',
                          '@keyframes materialCut': {
                            '0%, 100%': { transform: 'translateX(0px)' },
                            '50%': { transform: 'translateX(20px)' }
                          }
                        }} />

                        {/* Kesim Kıvılcımları */}
                        {workshopState.cuttingInProgress && (
                          <Box sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '20px',
                            height: '20px',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: '4px',
                              height: '4px',
                              background: 'radial-gradient(circle, #fbbf24, #f59e0b, transparent)',
                              borderRadius: '50%',
                              animation: 'spark1 0.3s infinite',
                              '@keyframes spark1': {
                                '0%': { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
                                '100%': { transform: 'translate(-50%, -50%) scale(3)', opacity: 0 }
                              }
                            }
                          }} />
                        )}

                        {/* Kesim Durumu */}
                        <Box sx={{
                          position: 'absolute',
                          bottom: '20%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: workshopState.cuttingInProgress ? 'rgba(255,152,0,0.9)' : 'rgba(108,117,125,0.9)',
                          color: 'white',
                          padding: 2,
                          borderRadius: 2,
                          textAlign: 'center'
                        }}>
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            {workshopState.cuttingInProgress ? '✂️ Kesim Devam Ediyor' : '⏸️ Kesim Bekliyor'}
                          </Typography>
                          <Typography variant="body2">
                            Malzeme: {workshopState.currentMaterial || 'Seçilmedi'}
                          </Typography>
                          <Typography variant="body2">
                            Kalite: Mükemmel
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Assessment Tab */}
            {activeTab === 'assessment' && (
              <Grid container spacing={3} sx={{ height: '100%' }}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <QuizIcon color="primary" />
                        Performans Değerlendirmesi
                      </Typography>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Genel Puan: {Math.round(operatorScore)}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(operatorScore, 100)}
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Güvenlik Skoru: {Math.max(100 - safetyViolations * 20, 0)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.max(100 - safetyViolations * 20, 0)}
                          sx={{ 
                            height: 10, 
                            borderRadius: 5,
                            '& .MuiLinearProgress-bar': { bgcolor: safetyViolations === 0 ? '#4caf50' : '#f44336' }
                          }}
                        />
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          İlerleme: {Math.round(trainingProgress)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={trainingProgress}
                          sx={{ 
                            height: 10, 
                            borderRadius: 5,
                            '& .MuiLinearProgress-bar': { bgcolor: '#2196f3' }
                          }}
                        />
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle2" gutterBottom>
                        Sertifikalar
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {operatorProfile.certifications.map((cert, index) => (
                          <Chip
                            key={index}
                            label={cert}
                            color="success"
                            variant="outlined"
                            icon={<CheckIcon />}
                          />
                        ))}
                        {operatorProfile.certifications.length === 0 && (
                          <Typography variant="body2" color="text.secondary">
                            Henüz sertifika alınmadı
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrophyIcon color="primary" />
                        Başarımlar ve Rozetler
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2 }}>
                            <TrophyIcon 
                              sx={{ 
                                fontSize: 40, 
                                color: operatorScore > 50 ? '#ffd700' : '#9e9e9e' 
                              }} 
                            />
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              İlk Ders
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2 }}>
                            <SecurityIcon 
                              sx={{ 
                                fontSize: 40, 
                                color: safetyViolations === 0 ? '#4caf50' : '#9e9e9e' 
                              }} 
                            />
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              Güvenlik Uzmanı
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2 }}>
                            <SpeedIcon 
                              sx={{ 
                                fontSize: 40, 
                                color: trainingProgress > 75 ? '#2196f3' : '#9e9e9e' 
                              }} 
                            />
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              Hızlı Öğrenen
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2 }}>
                            <PrecisionIcon 
                              sx={{ 
                                fontSize: 40, 
                                color: operatorScore > 100 ? '#9c27b0' : '#9e9e9e' 
                              }} 
                            />
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              Profesyonel
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle2" gutterBottom>
                        Eğitim Önerileri
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {safetyViolations > 0 && (
                          <Alert severity="warning">
                            Güvenlik kurallarına daha fazla dikkat edin
                          </Alert>
                        )}
                        {operatorScore < 50 && (
                          <Alert severity="info">
                            Temel eğitim modüllerini tekrar edin
                          </Alert>
                        )}
                        {trainingProgress > 80 && (
                          <Alert severity="success">
                            Mükemmel ilerleme! Bir sonraki seviyeye geçebilirsiniz
                          </Alert>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} variant="contained">
          Anladım
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { OptimizationInfoDialog };
export default OptimizationInfoDialog;
