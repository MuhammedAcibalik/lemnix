import React, { useState, useEffect, useRef } from 'react';
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
  ClickAwayListener
} from '@mui/material';
import {
  TipsAndUpdates as SmartIcon,
  Speed as ConfidenceIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useSmartSuggestions, AutoCompleteSuggestion } from '../hooks/useSmartSuggestions';

interface SmartAutoCompleteProps {
  type: 'product' | 'size' | 'profile' | 'color' | 'measurement';
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  // Context for better suggestions
  productName?: string;
  sizeName?: string;
  // UI customization
  showConfidence?: boolean;
  showFrequency?: boolean;
  showPreview?: boolean;
  minConfidence?: number;
  maxSuggestions?: number;
}

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 80) return '#4caf50'; // Green
  if (confidence >= 60) return '#ff9800'; // Orange
  return '#f44336'; // Red
};

const getConfidenceLabel = (confidence: number): string => {
  if (confidence >= 80) return 'Yüksek Güven';
  if (confidence >= 60) return 'Orta Güven';
  return 'Düşük Güven';
};

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
  size = 'medium',
  productName,
  sizeName,
  showConfidence = true,
  showFrequency = false,
  showPreview = true,
  minConfidence = 0,
  maxSuggestions = 8
}) => {
  const {
    autoCompleteSuggestions,
    autoCompleteLoading,
    autoCompleteError,
    getAutoCompleteSuggestions
  } = useSmartSuggestions();
  
  const [inputValue, setInputValue] = useState(value);
  const [open, setOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  
  // Filter suggestions based on confidence and limits
  const filteredSuggestions = autoCompleteSuggestions
    .filter(suggestion => suggestion.confidence >= minConfidence)
    .slice(0, maxSuggestions);
  
  // Update input when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  // Get suggestions when input changes
  useEffect(() => {
    if (inputValue.trim().length >= 1) {
      getAutoCompleteSuggestions(type, inputValue, maxSuggestions, true);
    }
  }, [inputValue, type, maxSuggestions, getAutoCompleteSuggestions]);
  
  const handleInputChange = (event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue.toUpperCase());
  };
  
  const handleChange = (event: React.SyntheticEvent, newValue: string | AutoCompleteSuggestion | null) => {
    const selectedValue = typeof newValue === 'string' ? newValue : (newValue?.value || inputValue);
    onChange(selectedValue.toUpperCase());
    setOpen(false);
  };
  
  const handleRefresh = () => {
    if (inputValue.trim()) {
      getAutoCompleteSuggestions(type, inputValue, maxSuggestions, false);
    }
  };
  
  const renderOption = (props: any, option: AutoCompleteSuggestion) => (
    <Box component="li" {...props} key={option.value}>
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
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
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {showFrequency && (
            <Chip
              label={`${option.frequency}x`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
          
          {showConfidence && (
            <Tooltip title={`${getConfidenceLabel(option.confidence)} (%${Math.round(option.confidence)})`}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: getConfidenceColor(option.confidence)
                }}
              />
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
  
  const renderInput = (params: any) => (
    <Box ref={anchorRef} sx={{ position: 'relative' }}>
      <TextField
        {...params}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <SmartIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            {label}
            {required && <span style={{ color: 'red' }}>*</span>}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {autoCompleteLoading && (
                <CircularProgress size={16} />
              )}
              
              <Tooltip title="Yenile">
                <IconButton
                  size="small"
                  onClick={handleRefresh}
                  disabled={disabled || autoCompleteLoading}
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
              
              {params.InputProps.endAdornment}
            </Box>
          )
        }}
      />
      
      {/* Stats Popper */}
      <Popper
        open={showStats && filteredSuggestions.length > 0}
        anchorEl={anchorRef.current}
        placement="bottom-end"
        sx={{ zIndex: 9999 }}
      >
        <ClickAwayListener onClickAway={() => setShowStats(false)}>
          <Paper sx={{ p: 2, maxWidth: 300 }}>
            <Typography variant="subtitle2" gutterBottom>
              Akıllı Öneri İstatistikleri
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="caption">
                Toplam Öneri: {filteredSuggestions.length}
              </Typography>
              
              {filteredSuggestions.length > 0 && (
                <>
                  <Typography variant="caption">
                    En Yüksek Güven: %{Math.round(Math.max(...filteredSuggestions.map(s => s.confidence)))}
                  </Typography>
                  
                  <Typography variant="caption">
                    En Popüler: {filteredSuggestions.reduce((max, s) => s.frequency > max.frequency ? s : max, filteredSuggestions[0])?.value}
                  </Typography>
                </>
              )}
              
              <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#4caf50' }} />
                  <Typography variant="caption">Yüksek</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ff9800' }} />
                  <Typography variant="caption">Orta</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f44336' }} />
                  <Typography variant="caption">Düşük</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
  
  return (
    <Autocomplete
      freeSolo
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      value={filteredSuggestions.find(s => s.value === value) || null}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={filteredSuggestions}
      getOptionLabel={(option) => typeof option === 'string' ? option : option.value}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      renderOption={renderOption}
      renderInput={renderInput}
      disabled={disabled}
      loading={autoCompleteLoading}
      loadingText="Akıllı öneriler yükleniyor..."
      noOptionsText={
        autoCompleteError 
          ? `Hata: ${typeof autoCompleteError === 'string' ? autoCompleteError : 'Bağlantı sorunu'}` 
          : inputValue.trim().length === 0 
          ? "Yazmaya başlayın..."
          : "Öneri bulunamadı"
      }
      filterOptions={(x) => x} // Don't filter, we handle it in backend
      PaperComponent={({ children, ...other }) => (
        <Paper {...other} sx={{ border: '1px solid', borderColor: 'primary.light' }}>
          {autoCompleteError ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="error">
                {typeof autoCompleteError === 'string' ? autoCompleteError : 'Bağlantı hatası'}
              </Typography>
            </Box>
          ) : (
            children
          )}
        </Paper>
      )}
      sx={{
        '& .MuiAutocomplete-inputRoot': {
          paddingRight: '90px !important' // Make room for our custom buttons
        }
      }}
    />
  );
};
