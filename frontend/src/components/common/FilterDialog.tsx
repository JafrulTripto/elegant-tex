import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Tabs,
  Tab,
  IconButton,
  Typography,
  CircularProgress,
  useTheme,
  Badge
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export interface FilterTab {
  label: string;
  icon?: React.ReactElement;
  content: React.ReactNode;
}

interface FilterDialogProps {
  open: boolean;
  onClose: () => void;
  onApplyFilter: () => void;
  onClearFilter: () => void;
  title: string;
  tabs: FilterTab[];
  loading?: boolean;
  activeFilterCount?: number;
}

const FilterDialog: React.FC<FilterDialogProps> = ({
  open,
  onClose,
  onApplyFilter,
  onClearFilter,
  title,
  tabs,
  loading = false,
  activeFilterCount = 0
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: theme.shape.borderRadius }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            {title}
            {activeFilterCount > 0 && (
              <Badge
                badgeContent={activeFilterCount}
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon || undefined}
              iconPosition="start"
              sx={{ 
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 500
              }}
            />
          ))}
        </Tabs>
      </Box>
      
      <DialogContent sx={{ pt: 2 }}>
        {tabs.map((tab, index) => (
          <Box
            key={index}
            role="tabpanel"
            hidden={activeTab !== index}
            id={`filter-tabpanel-${index}`}
            aria-labelledby={`filter-tab-${index}`}
          >
            {activeTab === index && tab.content}
          </Box>
        ))}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClearFilter}
          color="inherit"
          disabled={loading || activeFilterCount === 0}
        >
          Clear Filters
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={onApplyFilter}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterDialog;
