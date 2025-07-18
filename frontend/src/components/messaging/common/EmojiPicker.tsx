import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Typography,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { EmojiPickerProps } from '../../../types/emoji';
import { 
  getEmojiCategories, 
  searchEmojis, 
  addToRecentEmojis 
} from '../../../utils/emojiUtils';

const EmojiPicker: React.FC<EmojiPickerProps> = ({
  isOpen,
  anchorEl,
  onClose,
  onEmojiSelect,
}) => {
  const theme = useTheme();
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState(getEmojiCategories());

  useEffect(() => {
    if (isOpen) {
      setCategories(getEmojiCategories());
    }
  }, [isOpen]);

  const handleEmojiClick = (emoji: string) => {
    addToRecentEmojis(emoji);
    onEmojiSelect(emoji);
    onClose();
  };

  const handleCategoryChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedCategory(newValue);
    setSearchTerm('');
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const getDisplayEmojis = () => {
    if (searchTerm.trim()) {
      return searchEmojis(searchTerm, categories);
    }
    
    const category = categories[selectedCategory];
    return category ? category.emojis : [];
  };

  const displayEmojis = getDisplayEmojis();

  if (!isOpen || !anchorEl) return null;

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'absolute',
        top: anchorEl.offsetTop - 320,
        left: anchorEl.offsetLeft - 280,
        width: 320,
        height: 300,
        borderRadius: 2,
        overflow: 'hidden',
        zIndex: 1300,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Emojis
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Search */}
      <Box sx={{ p: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search emojis..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '0.8rem',
            },
          }}
        />
      </Box>

      {/* Category Tabs */}
      {!searchTerm && (
        <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Tabs
            value={selectedCategory}
            onChange={handleCategoryChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 36,
              '& .MuiTab-root': {
                minHeight: 36,
                fontSize: '0.7rem',
                minWidth: 'auto',
                px: 1,
              },
            }}
          >
            {categories.map((category) => (
              <Tab
                key={category.name}
                label={category.label}
                disabled={category.emojis.length === 0}
              />
            ))}
          </Tabs>
        </Box>
      )}

      {/* Emoji Grid */}
      <Box
        sx={{
          height: searchTerm ? 200 : 164,
          overflow: 'auto',
          p: 1,
        }}
      >
        {displayEmojis.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">
              {searchTerm ? 'No emojis found' : 'No recent emojis'}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gap: 0.5,
            }}
          >
            {displayEmojis.map((emojiData, index) => (
              <IconButton
                key={`${emojiData.emoji}-${index}`}
                onClick={() => handleEmojiClick(emojiData.emoji)}
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: '1.2rem',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
                title={emojiData.name}
              >
                {emojiData.emoji}
              </IconButton>
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default EmojiPicker;
