export interface EmojiData {
  emoji: string;
  name: string;
  category: string;
  keywords: string[];
}

export interface EmojiCategory {
  name: string;
  label: string;
  emojis: EmojiData[];
}

export interface EmojiPickerState {
  isOpen: boolean;
  selectedCategory: string;
  searchTerm: string;
  recentEmojis: string[];
}

export interface EmojiPickerProps {
  isOpen: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
}
