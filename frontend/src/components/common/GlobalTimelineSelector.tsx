import React, { useState } from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CalendarToday } from '@mui/icons-material';
import { useTimeline, TimelineRange } from '../../contexts/TimelineContext';

const GlobalTimelineSelector: React.FC = () => {
  const theme = useTheme();
  const { currentRange, setTimelineRange, presets } = useTimeline();
  
  // Custom date range dialog state
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(currentRange.startDate);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(currentRange.endDate);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const selectedKey = event.target.value;
    
    if (selectedKey === 'custom') {
      setCustomDialogOpen(true);
      return;
    }
    
    const selectedPreset = presets.find(preset => preset.key === selectedKey);
    if (selectedPreset) {
      const newRange = selectedPreset.getValue();
      setTimelineRange(newRange);
    }
  };

  const handleCustomRangeApply = () => {
    if (customStartDate && customEndDate) {
      const customRange: TimelineRange = {
        startDate: customStartDate,
        endDate: customEndDate,
        label: `${customStartDate.toLocaleDateString()} - ${customEndDate.toLocaleDateString()}`,
        preset: 'custom'
      };
      setTimelineRange(customRange);
    }
    setCustomDialogOpen(false);
  };

  const handleCustomRangeCancel = () => {
    setCustomStartDate(currentRange.startDate);
    setCustomEndDate(currentRange.endDate);
    setCustomDialogOpen(false);
  };

  return (
    <>
      <FormControl 
        size="small" 
        sx={{ 
          ml: { xs: 0, sm: 0.5 },
          width: { xs: '100%', sm: 'auto' }
        }}
      >
        <Select
          value={currentRange.preset}
          onChange={handleChange}
          displayEmpty
          startAdornment={
            <CalendarToday 
              sx={{ 
                mr: 0.5, 
                fontSize: { xs: '0.75rem', sm: '0.8rem' } 
              }} 
            />
          }
          sx={{ 
            minWidth: { xs: '100%', sm: 140 },
            height: { xs: 32, sm: 28 },
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
            '& .MuiSelect-select': {
              paddingTop: '2px',
              paddingBottom: '2px',
              paddingRight: '20px',
              paddingLeft: '8px',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
              borderWidth: '1px',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.primary.main,
            },
            '& .MuiSvgIcon-root': {
              fontSize: '1rem',
              right: '4px',
            }
          }}
        >
          {presets.map(preset => (
            <MenuItem 
              key={preset.key} 
              value={preset.key}
              sx={{ 
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                py: 0.5,
                minHeight: 'auto'
              }}
            >
              {preset.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Custom Date Range Dialog */}
      <Dialog 
        open={customDialogOpen} 
        onClose={handleCustomRangeCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Select Custom Date Range</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <DatePicker
                label="Start Date"
                value={customStartDate}
                onChange={(newValue) => setCustomStartDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
              <DatePicker
                label="End Date"
                value={customEndDate}
                onChange={(newValue) => setCustomEndDate(newValue)}
                minDate={customStartDate || undefined}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </Box>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCustomRangeCancel}>Cancel</Button>
          <Button 
            onClick={handleCustomRangeApply} 
            variant="contained"
            disabled={!customStartDate || !customEndDate}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GlobalTimelineSelector;
