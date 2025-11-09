/**
 * Profile Management Panel - Main Container
 */

import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
  Upload as UploadIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Link as LinkIcon,
  CalendarToday as CalendarTodayIcon,
} from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";
import { CardV2, ButtonV2 } from "@/shared";
import { ProfileDefinitionsTable } from "./ProfileDefinitionsTable";
import { MappingsTable } from "./MappingsTable";
import { UploadDialog } from "./UploadDialog";
import { useProfileStatistics } from "../model/useProfileManagement";

interface TabPanelProps {
  readonly children?: React.ReactNode;
  readonly index: number;
  readonly value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      sx={{ mt: 0 }}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </Box>
  );
};

export const ProfileManagementPanel: React.FC = () => {
  const ds = useDesignSystem();
  const [tabValue, setTabValue] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const { data: stats, isLoading: statsLoading } = useProfileStatistics();

  const statsCards = useMemo(
    () =>
      stats
        ? [
            {
              id: "totalProfiles",
              label: "Toplam Profil",
              value: stats.totalProfiles,
              icon: (
                <AssignmentIcon
                  sx={{ color: ds.colors.primary.main, fontSize: 28 }}
                />
              ),
              color: ds.colors.primary.main,
            },
            {
              id: "activeProfiles",
              label: "Aktif Profil",
              value: stats.activeProfiles,
              icon: (
                <CheckCircleIcon
                  sx={{ color: ds.colors.success.main, fontSize: 28 }}
                />
              ),
              color: ds.colors.success.main,
            },
            {
              id: "totalMappings",
              label: "Eşleştirme Sayısı",
              value: stats.totalMappings,
              icon: (
                <LinkIcon
                  sx={{ color: ds.colors.warning.main, fontSize: 28 }}
                />
              ),
              color: ds.colors.warning.main,
            },
            {
              id: "uniqueWeeks",
              label: "Hafta Sayısı",
              value: stats.uniqueWeeks,
              icon: (
                <CalendarTodayIcon
                  sx={{ color: ds.colors.info.main, fontSize: 28 }}
                />
              ),
              color: ds.colors.info.main,
            },
          ]
        : [],
    [ds, stats],
  );

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 30000,
        mx: "auto",
        px: { xs: ds.spacing["1"], md: ds.spacing["2"] },
        py: { xs: ds.spacing["1"], md: ds.spacing["1"] },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={ds.spacing["1"]}
        sx={{ mb: ds.spacing["2"] }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: ds.typography.fontWeight.bold,
            background: ds.gradients.primary,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: ds.typography.letterSpacing.tight,
          }}
        >
          Profil Yönetimi
        </Typography>

        <ButtonV2
          variant="primary"
          startIcon={<UploadIcon />}
          size="medium"
          onClick={() => setUploadDialogOpen(true)}
        >
          Excel Yükle
        </ButtonV2>
      </Stack>

      {!statsLoading && statsCards.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(1, minmax(0, 1fr))",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
            },
            gap: ds.spacing["1"],
            mb: ds.spacing["1"],
          }}
        >
          {statsCards.map((card) => (
            <CardV2
              key={card.id}
              variant="glass"
              hoverable
              sx={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                px: ds.spacing["1"],
                py: ds.spacing["1"],
                minHeight: 60,
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: "6px",
                  left: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 22,
                  height: 22,
                  borderRadius: ds.borderRadius.sm,
                  backgroundColor: `${card.color}15`,
                }}
              >
                {React.cloneElement(card.icon, {
                  sx: { ...card.icon.props.sx, fontSize: 14 },
                })}
              </Box>

              <Typography
                variant="h3"
                sx={{
                  fontWeight: ds.typography.fontWeight.bold,
                  fontSize: "1.75rem",
                  lineHeight: 1,
                  color: card.color,
                  mb: "2px",
                  textAlign: "center",
                }}
              >
                {card.value}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  fontSize: "0.8125rem",
                  lineHeight: 1.2,
                  color: ds.colors.text.secondary,
                  fontWeight: ds.typography.fontWeight.medium,
                  textAlign: "center",
                }}
              >
                {card.label}
              </Typography>
            </CardV2>
          ))}
        </Box>
      )}

      {statsLoading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: ds.spacing["2"],
          }}
        >
          <CircularProgress size={20} />
        </Box>
      )}

      <CardV2 variant="outlined" sx={{ p: 0, mt: 0 }}>
        <Box
          sx={{
            borderBottom: `1px solid ${ds.colors.neutral[200]}`,
            px: ds.spacing["1"],
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: ds.typography.fontWeight.medium,
                fontSize: "0.875rem",
                minHeight: 36,
                py: ds.spacing["1"],
              },
              minHeight: 36,
            }}
          >
            <Tab label="Profil Tanımları" />
            <Tab label="Sipariş Eşleştirmeleri" />
          </Tabs>
        </Box>

        <Box sx={{ px: ds.spacing["1"], py: ds.spacing["1"] }}>
          <TabPanel value={tabValue} index={0}>
            <ProfileDefinitionsTable />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <MappingsTable />
          </TabPanel>
        </Box>
      </CardV2>

      <UploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
      />
    </Box>
  );
};
