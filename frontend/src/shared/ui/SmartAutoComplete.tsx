/**
 * @fileoverview Smart AutoComplete Component - Modernized
 * @module SmartAutoComplete
 * @version 2.0.0 - Enterprise Grade Modular Design
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Autocomplete,
  TextField,
  Paper,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Tooltip,
  IconButton,
  Popper,
  ClickAwayListener,
  type AutocompleteRenderOptionState,
  type AutocompleteRenderInputParams,
  type AutocompleteOwnerState,
} from "@mui/material";
import {
  TipsAndUpdates as SmartIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

/**
 * Local type definition to avoid conflicts
 */
interface LocalAutoCompleteSuggestion {
  value: string;
  confidence: number;
  preview?: string;
  frequency?: number;
}

/**
 * Smart AutoComplete props interface
 */
interface SmartAutoCompleteProps {
  type: "product" | "size" | "profile" | "color" | "measurement";
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  size?: "small" | "medium";
  productName?: string;
  sizeName?: string;
  showConfidence?: boolean;
  showFrequency?: boolean;
  showPreview?: boolean;
  minConfidence?: number;
  maxSuggestions?: number;
}

/**
 * Confidence utility functions
 */
class ConfidenceUtils {
  /**
   * Get confidence color based on score
   */
  static getColor(confidence: number): string {
    const colorMap = {
      high: "#4caf50", // >= 80
      medium: "#ff9800", // >= 60
      low: "#f44336", // < 60
    };

    return confidence >= 80
      ? colorMap.high
      : confidence >= 60
        ? colorMap.medium
        : colorMap.low;
  }

  /**
   * Get confidence label based on score
   */
  static getLabel(confidence: number): string {
    const labelMap = {
      high: "Yüksek Güven",
      medium: "Orta Güven",
      low: "Düşük Güven",
    };

    return confidence >= 80
      ? labelMap.high
      : confidence >= 60
        ? labelMap.medium
        : labelMap.low;
  }
}

/**
 * Suggestion processing utility
 */
class SuggestionProcessor {
  /**
   * Process and filter suggestions
   */
  static processSuggestions(
    suggestions: unknown[],
    minConfidence: number,
    maxSuggestions: number,
  ): LocalAutoCompleteSuggestion[] {
    return suggestions
      .filter(
        (suggestion): suggestion is Record<string, unknown> =>
          suggestion !== null && typeof suggestion === "object",
      )
      .filter((suggestion) => {
        const confidence = suggestion.confidence;
        return typeof confidence === "number" && confidence >= minConfidence;
      })
      .slice(0, maxSuggestions)
      .map((suggestion) => ({
        value: String(suggestion.value || ""),
        confidence: Number(suggestion.confidence || 0),
        preview:
          typeof suggestion.preview === "string"
            ? suggestion.preview
            : undefined,
        frequency:
          typeof suggestion.frequency === "number"
            ? suggestion.frequency
            : undefined,
      }));
  }

  /**
   * Find most popular suggestion by frequency
   */
  static findMostPopular(
    suggestions: LocalAutoCompleteSuggestion[],
  ): LocalAutoCompleteSuggestion | null {
    return suggestions.reduce((max, current) => {
      const currentFreq = current.frequency ?? 0;
      const maxFreq = max.frequency ?? 0;
      return currentFreq > maxFreq ? current : max;
    }, suggestions[0] || null);
  }

  /**
   * Get maximum confidence from suggestions
   */
  static getMaxConfidence(suggestions: LocalAutoCompleteSuggestion[]): number {
    return suggestions.length > 0
      ? Math.max(...suggestions.map((s) => s.confidence))
      : 0;
  }
}

/**
 * Stats component for suggestion statistics
 */
const SuggestionStats: React.FC<{
  suggestions: LocalAutoCompleteSuggestion[];
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}> = ({ suggestions, anchorEl, open, onClose }) => {
  const mostPopular = SuggestionProcessor.findMostPopular(suggestions);
  const maxConfidence = SuggestionProcessor.getMaxConfidence(suggestions);

  return (
    <Popper
      open={open && suggestions.length > 0}
      anchorEl={anchorEl}
      placement="bottom-end"
      sx={{ zIndex: 9999 }}
    >
      <ClickAwayListener onClickAway={onClose}>
        <Paper sx={{ p: 2, maxWidth: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            Akıllı Öneri İstatistikleri
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="caption">
              Toplam Öneri: {suggestions.length}
            </Typography>

            {suggestions.length > 0 && (
              <>
                <Typography variant="caption">
                  En Yüksek Güven: %{Math.round(maxConfidence)}
                </Typography>

                {mostPopular && (
                  <Typography variant="caption">
                    En Popüler: {mostPopular.value}
                  </Typography>
                )}
              </>
            )}

            <Box sx={{ display: "flex", gap: 0.5, mt: 1 }}>
              {[
                { color: "#4caf50", label: "Yüksek" },
                { color: "#ff9800", label: "Orta" },
                { color: "#f44336", label: "Düşük" },
              ].map(({ color, label }) => (
                <Box
                  key={label}
                  sx={{ display: "flex", alignItems: "center", gap: 0.25 }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: color,
                    }}
                  />
                  <Typography variant="caption">{label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
};

/**
 * Smart AutoComplete Component
 *
 * Enterprise-grade autocomplete with AI-powered suggestions
 * Features confidence scoring, frequency tracking, and smart filtering
 */
export const SmartAutoComplete: React.FC<SmartAutoCompleteProps> = ({
  type,
  value,
  onChange,
  label,
  placeholder,
  disabled = false,
  required = false,
  error = false,
  helperText,
  fullWidth = true,
  size = "medium",
  productName,
  sizeName,
  showConfidence = true,
  showFrequency = false,
  showPreview = true,
  minConfidence = 0,
  maxSuggestions = 8,
}) => {
  // Local state instead of incompatible hook
  const [suggestions, setSuggestions] = useState<LocalAutoCompleteSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestionError, setError] = useState<string | null>(null);

  const [inputValue, setInputValue] = useState(value);
  const [open, setOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  // Get appropriate suggestion method based on type
  const getSuggestionMethod = useCallback(() => {
    const methodMap = {
      product: getProductSuggestions,
      size: getSizeSuggestions,
      profile: getProfileSuggestions,
      color: getColorSuggestions,
      measurement: getMeasurementSuggestions,
    };
    return methodMap[type];
  }, [
    type,
    getProductSuggestions,
    getSizeSuggestions,
    getProfileSuggestions,
    getColorSuggestions,
    getMeasurementSuggestions,
  ]);

  // Filter suggestions based on confidence and limits
  const filteredSuggestions = useMemo(
    (): LocalAutoCompleteSuggestion[] =>
      SuggestionProcessor.processSuggestions(
        suggestions,
        minConfidence,
        maxSuggestions,
      ),
    [suggestions, minConfidence, maxSuggestions],
  );

  // Update input when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Get suggestions when input changes
  useEffect(() => {
    if (inputValue.trim().length >= 1) {
      const getSuggestions = getSuggestionMethod();
      getSuggestions(inputValue, maxSuggestions);
    }
  }, [inputValue, maxSuggestions, getSuggestionMethod]);

  const handleInputChange = useCallback(
    (event: React.SyntheticEvent, newInputValue: string) => {
      setInputValue(newInputValue.toUpperCase());
    },
    [],
  );

  const handleChange = useCallback(
    (
      event: React.SyntheticEvent,
      newValue: string | LocalAutoCompleteSuggestion | null,
    ) => {
      const selectedValue =
        typeof newValue === "string" ? newValue : newValue?.value || inputValue;
      onChange(selectedValue.toUpperCase());
      setOpen(false);
    },
    [inputValue, onChange],
  );

  const handleRefresh = useCallback(() => {
    if (inputValue.trim()) {
      const getSuggestions = getSuggestionMethod();
      getSuggestions(inputValue, maxSuggestions);
    }
  }, [inputValue, maxSuggestions, getSuggestionMethod]);

  const renderOption = useCallback(
    (
      props: React.HTMLAttributes<HTMLLIElement> & { key: React.Key },
      option: LocalAutoCompleteSuggestion,
      state: AutocompleteRenderOptionState,
      ownerState: AutocompleteOwnerState<
        LocalAutoCompleteSuggestion,
        false,
        false,
        true
      >,
    ) => (
      <Box component="li" {...props} key={option.value}>
        <Box
          sx={{ display: "flex", alignItems: "center", width: "100%", gap: 1 }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {option.value}
            </Typography>
            {showPreview && option.preview && (
              <Typography variant="caption" color="text.secondary">
                {option.preview}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {showFrequency && option.frequency && (
              <Chip
                label={`${option.frequency}x`}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.7rem", height: 20 }}
              />
            )}

            {showConfidence && (
              <Tooltip
                title={`${ConfidenceUtils.getLabel(option.confidence)} (%${Math.round(option.confidence)})`}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: ConfidenceUtils.getColor(
                      option.confidence,
                    ),
                  }}
                />
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>
    ),
    [showPreview, showFrequency, showConfidence],
  );

  const renderInput = useCallback(
    (params: AutocompleteRenderInputParams) => (
      <Box ref={anchorRef} sx={{ position: "relative" }}>
        <TextField
          {...params}
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <SmartIcon sx={{ fontSize: 16, color: "primary.main" }} />
              {label}
              {required && <span style={{ color: "red" }}>*</span>}
            </Box>
          }
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          fullWidth={fullWidth}
          size={size}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {loading && <CircularProgress size={16} />}

                <Tooltip title="Yenile">
                  <IconButton
                    size="small"
                    onClick={handleRefresh}
                    disabled={disabled || loading}
                  >
                    <RefreshIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Öneri İstatistikleri">
                  <IconButton
                    size="small"
                    onClick={() => setShowStats(!showStats)}
                    disabled={disabled}
                  >
                    <InfoIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>

                {params.InputProps?.endAdornment}
              </Box>
            ),
          }}
        />

        <SuggestionStats
          suggestions={filteredSuggestions}
          anchorEl={anchorRef.current}
          open={showStats}
          onClose={() => setShowStats(false)}
        />
      </Box>
    ),
    [
      loading,
      handleRefresh,
      disabled,
      showStats,
      filteredSuggestions,
      label,
      required,
      placeholder,
      error,
      helperText,
      fullWidth,
      size,
    ],
  );

  return (
    <Autocomplete<LocalAutoCompleteSuggestion, false, false, true>
      freeSolo
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      value={filteredSuggestions.find((s) => s.value === value) ?? null}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={filteredSuggestions}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.value
      }
      isOptionEqualToValue={(option, value) => option.value === value.value}
      renderOption={renderOption}
      renderInput={renderInput}
      disabled={disabled}
      loading={loading}
      loadingText="Akıllı öneriler yükleniyor..."
      noOptionsText={
        suggestionError
          ? `Hata: ${typeof suggestionError === "string" ? suggestionError : "Bağlantı sorunu"}`
          : inputValue.trim().length === 0
            ? "Yazmaya başlayın..."
            : "Öneri bulunamadı"
      }
      filterOptions={(x) => x}
      PaperComponent={({ children, ...other }) => (
        <Paper
          {...other}
          sx={{ border: "1px solid", borderColor: "primary.light" }}
        >
          {suggestionError ? (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="caption" color="error">
                {typeof suggestionError === "string"
                  ? suggestionError
                  : "Bağlantı hatası"}
              </Typography>
            </Box>
          ) : (
            children
          )}
        </Paper>
      )}
      sx={{
        "& .MuiAutocomplete-inputRoot": {
          paddingRight: "90px !important",
        },
      }}
    />
  );
};

export default SmartAutoComplete;
