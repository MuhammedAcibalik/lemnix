import React from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import {
  AutoAwesomeMotion as AutoAwesomeMotionIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Download as DownloadIcon,
  Insights as InsightsIcon,
  LiveHelp as LiveHelpIcon,
  PlayCircle as PlayCircleIcon,
  PrecisionManufacturing as PrecisionManufacturingIcon,
  Shield as ShieldIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import {
  borderRadius,
  colors,
  gradients,
  responsiveSpacing,
  shadows,
  typography
} from '../../theme/designSystem';

interface FeatureCard {
  icon: React.ElementType;
  title: string;
  description: string;
  accent: string;
}

interface Metric {
  value: string;
  label: string;
  detail: string;
}

interface Step {
  title: string;
  description: string;
}

interface Highlight {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface Testimonial {
  quote: string;
  author: string;
  company: string;
  result: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

const featureCards: FeatureCard[] = [
  {
    icon: PrecisionManufacturingIcon,
    title: 'Factory-ready optimization',
    description:
      'Generate optimized cutting plans for multi-profile aluminum jobs in seconds with AI assisted nesting.',
    accent: 'Industrial grade'
  },
  {
    icon: InsightsIcon,
    title: 'Live performance analytics',
    description:
      'Track yield, scrap, spindle utilization, and work center throughput with intuitive dashboards.',
    accent: 'Operational visibility'
  },
  {
    icon: AutoAwesomeMotionIcon,
    title: 'Adaptive scheduling engine',
    description:
      'Recalculate cutting queues instantly as rush orders arrive and keep every machine at peak load.',
    accent: 'Real-time control'
  }
];

const metrics: Metric[] = [
  {
    value: '96%',
    label: 'Material yield',
    detail: 'Average yield achieved across production pilots'
  },
  {
    value: '45 min',
    label: 'Deployment time',
    detail: 'From spreadsheet import to your first optimized run'
  },
  {
    value: '30%',
    label: 'Less waste',
    detail: 'Scrap reduction compared to manual nesting workflows'
  }
];

const processSteps: Step[] = [
  {
    title: 'Upload production orders',
    description: 'Import Excel or API feeds, auto-detect profile families, and validate inventory in seconds.'
  },
  {
    title: 'Pick optimization strategy',
    description: 'Blend heuristics, GPU-accelerated solvers, or custom rule sets to match your production floor.'
  },
  {
    title: 'Execute and monitor',
    description: 'Release cutting plans to operators, monitor execution, and feed results back to ERP automatically.'
  }
];

const highlights: Highlight[] = [
  {
    icon: ShieldIcon,
    title: 'Quality assured plans',
    description: 'Rule-based validation checks eliminate collisions, angle errors, and missing accessories.'
  },
  {
    icon: SpeedIcon,
    title: 'GPU acceleration',
    description: 'Unlock WebGPU powered heuristics for complex, high volume aluminum extrusion workloads.'
  },
  {
    icon: TimelineIcon,
    title: 'Connected operations',
    description: 'Integrate Lemnix with ERP, MES, and shop-floor data collection using modern APIs.'
  }
];

const testimonials: Testimonial[] = [
  {
    quote:
      'Lemnix collapsed our two-day planning cycle into a repeatable one-hour routine. Operators finally trust the data.',
    author: 'Mert Yildiz',
    company: 'Operations Director, AlloyTech',
    result: '12% scrap reduction in the first month'
  },
  {
    quote:
      'The GPU optimization engine handles hundreds of variants without breaking a sweat. Productivity is way up.',
    author: 'Selin Kara',
    company: 'Plant Manager, NovaAlu',
    result: '18% faster order turnaround'
  }
];

const faqs: FAQItem[] = [
  {
    question: 'Can Lemnix work with our existing ERP or MES?',
    answer:
      'Yes. Lemnix ships with REST and file-based connectors for popular ERP and MES platforms, and supports custom adapters.'
  },
  {
    question: 'How quickly can we see ROI?',
    answer:
      'Most teams report measurable yield and throughput gains within the first production week, thanks to guided onboarding.'
  },
  {
    question: 'Do operators need special training?',
    answer:
      'The interface is built for the shop floor. Role-based checklists, visual cut layouts, and alerts keep everything simple.'
  }
];

const integrations = ['Excel import', 'ERP sync', 'MES feedback', 'API webhooks'];

const cardBaseStyles = {
  borderRadius: borderRadius.lg,
  border: `1px solid ${colors.neutral[200]}`,
  background: gradients.card,
  boxShadow: shadows.md,
  height: '100%'
};

export const LandingPage: React.FC = () => {
  return (
    <Box sx={{ backgroundColor: colors.neutral[50], color: colors.neutral[800] }}>
      {/* Top bar */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 999,
          backdropFilter: 'blur(18px)',
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          borderBottom: `1px solid ${colors.neutral[200]}`,
        }}
      >
        <Container maxWidth="lg" sx={{ py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: borderRadius.base,
                background: gradients.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: shadows.lg,
                color: '#fff',
                fontWeight: typography.fontWeight.bold,
              }}
            >
              Lx
            </Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: typography.fontWeight.semibold, letterSpacing: '0.06em', color: colors.primary[900] }}
            >
              LEMNIX
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button variant="text" color="inherit">Product</Button>
            <Button variant="text" color="inherit">Solutions</Button>
            <Button variant="text" color="inherit">Resources</Button>
            <Button variant="contained" sx={{ background: gradients.primary }}>Book a demo</Button>
          </Stack>
        </Container>
      </Box>

      {/* Hero */}
      <Box component="section" sx={{ position: 'relative', overflow: 'hidden', background: gradients.primary, color: '#fff' }}>
        <Container
          maxWidth="lg"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 4, md: 6 },
            py: { xs: 10, md: 14 },
          }}
        >
          <Stack spacing={3}>
            <Chip
              label="Aluminum cutting intelligence"
              icon={<CheckCircleOutlineIcon />}
              sx={{
                alignSelf: 'flex-start',
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#fff',
                borderRadius: borderRadius.base,
                px: 1.5,
                '& .MuiChip-icon': { color: '#fff' }
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.75rem', md: '3.5rem' },
                fontWeight: typography.fontWeight.extrabold,
                lineHeight: 1.05,
              }}
            >
              Cut waste. Accelerate throughput. Orchestrate every extrusion line with Lemnix.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: typography.fontSize.lg, md: typography.fontSize.xl },
                color: 'rgba(255,255,255,0.85)',
                maxWidth: 540,
              }}
            >
              Lemnix combines GPU acceleration, optimization science, and actionable analytics to give aluminum fabricators a connected command center for planning and execution.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayCircleIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontWeight: typography.fontWeight.semibold,
                  background: '#fff',
                  color: colors.primary[900],
                  '&:hover': { background: 'rgba(255,255,255,0.92)' }
                }}
              >
                Watch product tour
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<DownloadIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderColor: 'rgba(255,255,255,0.6)',
                  color: '#fff',
                  '&:hover': { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.12)' }
                }}
              >
                Download brochure
              </Button>
            </Stack>
            <Grid container spacing={3} sx={{ pt: 2 }}>
              {metrics.map((metric) => (
                <Grid item xs={12} sm={4} key={metric.label}>
                  <Stack spacing={0.5}>
                    <Typography variant="h3" sx={{ fontWeight: typography.fontWeight.extrabold }}>
                      {metric.value}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: typography.fontWeight.semibold }}>
                      {metric.label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                      {metric.detail}
                    </Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              position: 'relative',
              p: { xs: 4, md: 5 },
              borderRadius: borderRadius.xl,
              background: 'rgba(15,23,42,0.85)',
              border: '1px solid rgba(148,163,184,0.2)',
              alignSelf: 'center',
              overflow: 'hidden',
              boxShadow: '0 25px 80px rgba(15,23,42,0.45)'
            }}
          >
            <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top, rgba(59,130,246,0.35), transparent 55%)' }} />
            <Stack spacing={3} sx={{ position: 'relative' }}>
              <Typography variant="h5" sx={{ fontWeight: typography.fontWeight.semibold, color: '#fff' }}>
                Command center snapshot
              </Typography>
              <Stack spacing={2.5}>
                {featureCards.map((feature) => (
                  <Box
                    key={feature.title}
                    sx={{
                      display: 'flex',
                      gap: 2,
                      alignItems: 'flex-start',
                      borderRadius: borderRadius.base,
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      p: 2.5,
                      transition: 'transform 220ms ease',
                      '&:hover': { transform: 'translateY(-4px)', backgroundColor: 'rgba(255,255,255,0.1)' }
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: borderRadius.base,
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.35), rgba(59,130,246,0.15))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff'
                      }}
                    >
                      {React.createElement(feature.icon, { fontSize: 'medium' })}
                    </Box>
                    <Stack spacing={0.75}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1" sx={{ fontWeight: typography.fontWeight.semibold, color: '#fff' }}>
                          {feature.title}
                        </Typography>
                        <Chip label={feature.accent} size="small" sx={{ backgroundColor: 'rgba(59,130,246,0.2)', color: '#fff' }} />
                      </Stack>
                      <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.8)' }}>
                        {feature.description}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Paper>
        </Container>
      </Box>

      {/* Highlights */}
      <Box component="section" sx={{ py: responsiveSpacing.section }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={5}>
              <Stack spacing={2.5}>
                <Typography variant="overline" sx={{ letterSpacing: '0.24em', color: colors.primary[700] }}>
                  WHY LEMNIX
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: typography.fontWeight.bold, color: colors.primary[900] }}>
                  End-to-end command of every aluminum cutting cycle
                </Typography>
                <Typography variant="body1" sx={{ color: colors.neutral[600] }}>
                  Lemnix unifies planning, optimization, and execution so production, quality, and supply chain teams can collaborate in real time.
                </Typography>
                <Stack spacing={1.5}>
                  {highlights.map((item) => (
                    <Stack
                      key={item.title}
                      spacing={1}
                      direction="row"
                      sx={{ alignItems: 'flex-start' }}
                    >
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: borderRadius.base,
                          backgroundColor: colors.neutral[100],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: colors.primary[700],
                        }}
                      >
                        {React.createElement(item.icon, { fontSize: 'medium' })}
                      </Box>
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle1" sx={{ fontWeight: typography.fontWeight.semibold }}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.neutral[600] }}>
                          {item.description}
                        </Typography>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={7}>
              <Grid container spacing={3}>
                {featureCards.map((feature) => (
                  <Grid item xs={12} md={6} key={feature.title}>
                    <Paper sx={{ ...cardBaseStyles, p: 3 }}>
                      <Stack spacing={2}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: borderRadius.base,
                            backgroundColor: colors.primary[50],
                            color: colors.primary[700],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {React.createElement(feature.icon, { fontSize: 'medium' })}
                        </Box>
                        <Stack spacing={1}>
                          <Typography variant="h6" sx={{ fontWeight: typography.fontWeight.semibold }}>
                            {feature.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.neutral[600] }}>
                            {feature.description}
                          </Typography>
                        </Stack>
                        <Chip label={feature.accent} size="small" sx={{ alignSelf: 'flex-start', backgroundColor: colors.neutral[100] }} />
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Process */}
      <Box component="section" sx={{ py: responsiveSpacing.section, backgroundColor: '#fff' }}>
        <Container maxWidth="lg">
          <Stack spacing={2.5} sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="overline" sx={{ letterSpacing: '0.2em', color: colors.primary[700] }}>
              HOW IT WORKS
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: typography.fontWeight.bold, color: colors.primary[900] }}>
              Built for planners, operators, and executives alike
            </Typography>
            <Typography variant="body1" sx={{ color: colors.neutral[600], maxWidth: 720, mx: 'auto' }}>
              Deploy Lemnix as a turnkey landing zone that plugs into every stage of your aluminum fabrication workflow.
            </Typography>
          </Stack>
          <Grid container spacing={4}>
            {processSteps.map((step, index) => (
              <Grid item xs={12} md={4} key={step.title}>
                <Paper sx={{ ...cardBaseStyles, p: 4, position: 'relative', overflow: 'hidden' }}>
                  <Typography
                    variant="h4"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 24,
                      color: colors.neutral[200],
                      fontWeight: typography.fontWeight.bold,
                    }}
                  >
                    {index + 1}
                  </Typography>
                  <Stack spacing={1.5}>
                    <Typography variant="h6" sx={{ fontWeight: typography.fontWeight.semibold }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.neutral[600] }}>
                      {step.description}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials and integrations */}
      <Box component="section" sx={{ py: responsiveSpacing.section, backgroundColor: colors.neutral[100] }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <Stack spacing={3}>
                <Typography variant="overline" sx={{ letterSpacing: '0.18em', color: colors.primary[700] }}>
                  CUSTOMER STORIES
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: typography.fontWeight.bold, color: colors.primary[900] }}>
                  Aluminum leaders choose Lemnix to connect the plant floor
                </Typography>
                <Stack spacing={3}>
                  {testimonials.map((testimonial) => (
                    <Paper key={testimonial.author} sx={{ ...cardBaseStyles, p: 3.5, background: '#fff' }}>
                      <Stack spacing={2}>
                        <Typography variant="body1" sx={{ fontSize: typography.fontSize.lg, color: colors.neutral[700] }}>
                          “{testimonial.quote}”
                        </Typography>
                        <Divider flexItem sx={{ borderColor: colors.neutral[200] }} />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: typography.fontWeight.semibold }}>
                              {testimonial.author}
                            </Typography>
                            <Typography variant="caption" sx={{ color: colors.neutral[500] }}>
                              {testimonial.company}
                            </Typography>
                          </Box>
                          <Chip label={testimonial.result} sx={{ backgroundColor: colors.primary[50], color: colors.primary[800] }} />
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper sx={{ ...cardBaseStyles, p: 4, height: '100%' }}>
                <Stack spacing={2.5}>
                  <Typography variant="overline" sx={{ letterSpacing: '0.18em', color: colors.primary[700] }}>
                    CONNECTED STACK
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: typography.fontWeight.bold, color: colors.primary[900] }}>
                    Seamless handshakes with your existing systems
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.neutral[600] }}>
                    Lemnix eliminates re-keying and ensures end-to-end traceability by syncing with the systems you already trust.
                  </Typography>
                  <Stack spacing={1.5}>
                    {integrations.map((item) => (
                      <Stack key={item} direction="row" spacing={1.5} alignItems="center">
                        <CheckCircleOutlineIcon sx={{ color: colors.primary[700] }} />
                        <Typography variant="body2" sx={{ color: colors.neutral[600] }}>
                          {item}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FAQ */}
      <Box component="section" sx={{ py: responsiveSpacing.section, backgroundColor: '#fff' }}>
        <Container maxWidth="lg">
          <Stack spacing={4} alignItems="center" sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="overline" sx={{ letterSpacing: '0.2em', color: colors.primary[700] }}>
              FAQ
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: typography.fontWeight.bold, color: colors.primary[900], maxWidth: 600 }}>
              Everything you need to launch smarter aluminum cutting
            </Typography>
          </Stack>
          <Stack spacing={2.5}>
            {faqs.map((item) => (
              <Paper key={item.question} sx={{ ...cardBaseStyles, p: { xs: 3, md: 3.5 } }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <LiveHelpIcon sx={{ color: colors.primary[700] }} />
                    <Typography variant="h6" sx={{ fontWeight: typography.fontWeight.semibold }}>
                      {item.question}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: colors.neutral[600] }}>
                    {item.answer}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* CTA */}
      <Box component="section" sx={{ py: responsiveSpacing.section, background: gradients.primary, color: '#fff' }}>
        <Container maxWidth="lg">
          <Paper
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: borderRadius.xl,
              background: 'linear-gradient(135deg, rgba(15,23,42,0.82) 0%, rgba(15,23,42,0.92) 100%)',
              border: '1px solid rgba(148,163,184,0.25)',
              boxShadow: '0 30px 60px rgba(15,23,42,0.45)'
            }}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center" justifyContent="space-between">
              <Stack spacing={2} sx={{ maxWidth: 520 }}>
                <Typography variant="h3" sx={{ fontWeight: typography.fontWeight.bold, color: '#fff' }}>
                  Ready to orchestrate every aluminum cut with precision?
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                  Launch Lemnix in your plant with guided onboarding, change management playbooks, and world-class support.
                </Typography>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontWeight: typography.fontWeight.semibold,
                    background: '#fff',
                    color: colors.primary[900],
                    '&:hover': { background: 'rgba(255,255,255,0.92)' }
                  }}
                >
                  Start pilot project
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderColor: 'rgba(255,255,255,0.6)',
                    color: '#fff',
                    '&:hover': { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.12)' }
                  }}
                >
                  Talk to engineering
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ py: 4, backgroundColor: '#0f172a', color: 'rgba(255,255,255,0.72)' }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Typography variant="subtitle2">Copyright {new Date().getFullYear()} Lemnix. All rights reserved.</Typography>
            <Stack direction="row" spacing={3}>
              <Typography variant="body2">Security</Typography>
              <Typography variant="body2">Privacy</Typography>
              <Typography variant="body2">Accessibility</Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

