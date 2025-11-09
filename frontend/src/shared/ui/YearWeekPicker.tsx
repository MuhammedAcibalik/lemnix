/**
 * YearWeekPicker Component
 * Allows users to select week and year for filtering data
 */

import React, { useState, useCallback, useMemo } from "react";
import {
  Box,
  TextField,
  MenuItem,
  IconButton,
  Popover,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import {
  CalendarToday as CalendarTodayIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
} from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";
import { alpha } from "@mui/material/styles";

interface YearWeekPickerProps {
  readonly initialWeek: number;
  readonly initialYear: number;
  readonly onConfirm: (week: number, year: number) => void;
  readonly sx?: Record<string, unknown>;
}

export const YearWeekPicker: React.FC<YearWeekPickerProps> = ({
  initialWeek,
  initialYear,
  onConfirm,
  sx = {},
}) => {
  const ds = useDesignSystem();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(initialWeek);
  const [selectedYear, setSelectedYear] = useState(initialYear);

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const years = useMemo(() => {
    const yearList = [];
    for (let i = currentYear - 2; i <= currentYear + 1; i++) {
      yearList.push(i);
    }
    return yearList;
  }, [currentYear]);

  const weeks = useMemo(() => {
    const weekList = [];
    for (let i = 1; i <= 53; i++) {
      weekList.push(i);
    }
    return weekList;
  }, []);

  const handleOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm(selectedWeek, selectedYear);
    handleClose();
  }, [selectedWeek, selectedYear, onConfirm, handleClose]);

  const handlePreviousWeek = useCallback(() => {
    if (selectedWeek > 1) {
      setSelectedWeek(selectedWeek - 1);
    } else {
      setSelectedWeek(53);
      setSelectedYear(selectedYear - 1);
    }
  }, [selectedWeek, selectedYear]);

  const handleNextWeek = useCallback(() => {
    if (selectedWeek < 53) {
      setSelectedWeek(selectedWeek + 1);
    } else {
      setSelectedWeek(1);
      setSelectedYear(selectedYear + 1);
    }
  }, [selectedWeek, selectedYear]);

  const open = Boolean(anchorEl);

  return (
    <Box sx={sx}>
      <Button
        variant="outlined"
        startIcon={<CalendarTodayIcon />}
        onClick={handleOpen}
        sx={{
          height: ds.componentSizes.button.medium.height,
          borderRadius: `${ds.borderRadius.button}px`,
          borderColor: ds.colors.neutral[300],
          color: ds.colors.text.primary,
          "&:hover": {
            borderColor: ds.colors.primary.main,
            backgroundColor: alpha(ds.colors.primary.main, 0.04),
          },
        }}
      >
        Hafta {initialWeek}, {initialYear}
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            borderRadius: `${ds.borderRadius.lg}px`,
            boxShadow: ds.shadows.soft.lg,
            p: ds.spacing["3"],
            minWidth: 300,
          },
        }}
      >
        <Stack spacing={ds.spacing["3"]}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: ds.typography.fontWeight.semibold,
              color: ds.colors.text.primary,
            }}
          >
            Hafta Seç
          </Typography>
          <Stack direction="row" spacing={ds.spacing["2"]} alignItems="center">
            <TextField
              select
              label="Yıl"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              size="small"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: `${ds.borderRadius.input}px`,
                },
              }}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Hafta"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              size="small"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: `${ds.borderRadius.input}px`,
                },
              }}
            >
              {weeks.map((week) => (
                <MenuItem key={week} value={week}>
                  {week}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack
            direction="row"
            spacing={ds.spacing["1"]}
            justifyContent="center"
          >
            <IconButton
              onClick={handlePreviousWeek}
              size="small"
              sx={{
                color: ds.colors.text.secondary,
                "&:hover": {
                  color: ds.colors.primary.main,
                  backgroundColor: alpha(ds.colors.primary.main, 0.08),
                },
              }}
            >
              <NavigateBeforeIcon />
            </IconButton>
            <Typography
              sx={{
                px: ds.spacing["2"],
                py: ds.spacing["1"],
                fontWeight: ds.typography.fontWeight.medium,
                color: ds.colors.text.primary,
              }}
            >
              Hafta {selectedWeek}, {selectedYear}
            </Typography>
            <IconButton
              onClick={handleNextWeek}
              size="small"
              sx={{
                color: ds.colors.text.secondary,
                "&:hover": {
                  color: ds.colors.primary.main,
                  backgroundColor: alpha(ds.colors.primary.main, 0.08),
                },
              }}
            >
              <NavigateNextIcon />
            </IconButton>
          </Stack>
          <Stack
            direction="row"
            spacing={ds.spacing["2"]}
            justifyContent="flex-end"
          >
            <Button
              onClick={handleClose}
              variant="outlined"
              size="small"
              sx={{
                borderRadius: `${ds.borderRadius.button}px`,
                borderColor: ds.colors.neutral[300],
                color: ds.colors.text.primary,
                "&:hover": {
                  borderColor: ds.colors.primary.main,
                  backgroundColor: alpha(ds.colors.primary.main, 0.04),
                },
              }}
            >
              İptal
            </Button>
            <Button
              onClick={handleConfirm}
              variant="contained"
              size="small"
              sx={{
                borderRadius: `${ds.borderRadius.button}px`,
                background: ds.gradients.primary,
                color: "#ffffff",
                "&:hover": {
                  background: ds.gradients.primary,
                  opacity: 0.9,
                },
              }}
            >
              Uygula
            </Button>
          </Stack>
        </Stack>
      </Popover>
    </Box>
  );
};
