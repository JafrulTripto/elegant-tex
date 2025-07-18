import { EmojiData, EmojiCategory } from '../types/emoji';

// Common emojis organized by category
export const EMOJI_DATA: EmojiCategory[] = [
  {
    name: 'recent',
    label: '🕒 Recent',
    emojis: [] // Will be populated from localStorage
  },
  {
    name: 'smileys',
    label: '😀 Smileys',
    emojis: [
      { emoji: '😀', name: 'grinning face', category: 'smileys', keywords: ['happy', 'smile', 'grin'] },
      { emoji: '😃', name: 'grinning face with big eyes', category: 'smileys', keywords: ['happy', 'smile', 'joy'] },
      { emoji: '😄', name: 'grinning face with smiling eyes', category: 'smileys', keywords: ['happy', 'smile', 'laugh'] },
      { emoji: '😁', name: 'beaming face with smiling eyes', category: 'smileys', keywords: ['happy', 'smile', 'beam'] },
      { emoji: '😆', name: 'grinning squinting face', category: 'smileys', keywords: ['happy', 'laugh', 'squint'] },
      { emoji: '😅', name: 'grinning face with sweat', category: 'smileys', keywords: ['happy', 'sweat', 'relief'] },
      { emoji: '🤣', name: 'rolling on the floor laughing', category: 'smileys', keywords: ['laugh', 'rofl', 'funny'] },
      { emoji: '😂', name: 'face with tears of joy', category: 'smileys', keywords: ['laugh', 'cry', 'tears'] },
      { emoji: '🙂', name: 'slightly smiling face', category: 'smileys', keywords: ['smile', 'slight'] },
      { emoji: '🙃', name: 'upside-down face', category: 'smileys', keywords: ['upside', 'silly'] },
      { emoji: '😉', name: 'winking face', category: 'smileys', keywords: ['wink', 'flirt'] },
      { emoji: '😊', name: 'smiling face with smiling eyes', category: 'smileys', keywords: ['happy', 'smile', 'blush'] },
      { emoji: '😇', name: 'smiling face with halo', category: 'smileys', keywords: ['angel', 'innocent'] },
      { emoji: '🥰', name: 'smiling face with hearts', category: 'smileys', keywords: ['love', 'hearts', 'adore'] },
      { emoji: '😍', name: 'smiling face with heart-eyes', category: 'smileys', keywords: ['love', 'heart', 'eyes'] },
      { emoji: '🤩', name: 'star-struck', category: 'smileys', keywords: ['star', 'struck', 'amazed'] },
      { emoji: '😘', name: 'face blowing a kiss', category: 'smileys', keywords: ['kiss', 'blow'] },
      { emoji: '😗', name: 'kissing face', category: 'smileys', keywords: ['kiss'] },
      { emoji: '☺️', name: 'smiling face', category: 'smileys', keywords: ['smile', 'happy'] },
      { emoji: '😚', name: 'kissing face with closed eyes', category: 'smileys', keywords: ['kiss', 'closed', 'eyes'] },
      { emoji: '😙', name: 'kissing face with smiling eyes', category: 'smileys', keywords: ['kiss', 'smile'] },
      { emoji: '🥲', name: 'smiling face with tear', category: 'smileys', keywords: ['smile', 'tear', 'bittersweet'] },
      { emoji: '😋', name: 'face savoring food', category: 'smileys', keywords: ['yum', 'delicious', 'food'] },
      { emoji: '😛', name: 'face with tongue', category: 'smileys', keywords: ['tongue', 'silly'] },
      { emoji: '😜', name: 'winking face with tongue', category: 'smileys', keywords: ['wink', 'tongue', 'silly'] },
      { emoji: '🤪', name: 'zany face', category: 'smileys', keywords: ['crazy', 'wild', 'silly'] },
      { emoji: '😝', name: 'squinting face with tongue', category: 'smileys', keywords: ['tongue', 'squint', 'silly'] },
      { emoji: '🤑', name: 'money-mouth face', category: 'smileys', keywords: ['money', 'rich', 'dollar'] }
    ]
  },
  {
    name: 'emotions',
    label: '❤️ Emotions',
    emojis: [
      { emoji: '😐', name: 'neutral face', category: 'emotions', keywords: ['neutral', 'meh'] },
      { emoji: '😑', name: 'expressionless face', category: 'emotions', keywords: ['blank', 'expressionless'] },
      { emoji: '😶', name: 'face without mouth', category: 'emotions', keywords: ['quiet', 'silent'] },
      { emoji: '😏', name: 'smirking face', category: 'emotions', keywords: ['smirk', 'sly'] },
      { emoji: '😒', name: 'unamused face', category: 'emotions', keywords: ['unamused', 'bored'] },
      { emoji: '🙄', name: 'face with rolling eyes', category: 'emotions', keywords: ['roll', 'eyes', 'annoyed'] },
      { emoji: '😬', name: 'grimacing face', category: 'emotions', keywords: ['grimace', 'awkward'] },
      { emoji: '🤥', name: 'lying face', category: 'emotions', keywords: ['lie', 'pinocchio'] },
      { emoji: '😔', name: 'pensive face', category: 'emotions', keywords: ['sad', 'pensive'] },
      { emoji: '😕', name: 'confused face', category: 'emotions', keywords: ['confused', 'puzzled'] },
      { emoji: '🙁', name: 'slightly frowning face', category: 'emotions', keywords: ['frown', 'sad'] },
      { emoji: '☹️', name: 'frowning face', category: 'emotions', keywords: ['frown', 'sad'] },
      { emoji: '😣', name: 'persevering face', category: 'emotions', keywords: ['struggle', 'persevere'] },
      { emoji: '😖', name: 'confounded face', category: 'emotions', keywords: ['confused', 'frustrated'] },
      { emoji: '😫', name: 'tired face', category: 'emotions', keywords: ['tired', 'exhausted'] },
      { emoji: '😩', name: 'weary face', category: 'emotions', keywords: ['weary', 'tired'] },
      { emoji: '🥺', name: 'pleading face', category: 'emotions', keywords: ['plead', 'puppy', 'eyes'] },
      { emoji: '😢', name: 'crying face', category: 'emotions', keywords: ['cry', 'sad', 'tear'] },
      { emoji: '😭', name: 'loudly crying face', category: 'emotions', keywords: ['cry', 'sob', 'tears'] },
      { emoji: '😤', name: 'face with steam from nose', category: 'emotions', keywords: ['angry', 'steam', 'mad'] },
      { emoji: '😠', name: 'angry face', category: 'emotions', keywords: ['angry', 'mad'] },
      { emoji: '😡', name: 'pouting face', category: 'emotions', keywords: ['angry', 'rage', 'mad'] },
      { emoji: '🤬', name: 'face with symbols on mouth', category: 'emotions', keywords: ['swear', 'curse', 'angry'] },
      { emoji: '🤯', name: 'exploding head', category: 'emotions', keywords: ['mind', 'blown', 'explode'] },
      { emoji: '😳', name: 'flushed face', category: 'emotions', keywords: ['blush', 'embarrassed'] },
      { emoji: '🥵', name: 'hot face', category: 'emotions', keywords: ['hot', 'heat', 'sweat'] },
      { emoji: '🥶', name: 'cold face', category: 'emotions', keywords: ['cold', 'freeze', 'blue'] },
      { emoji: '😱', name: 'face screaming in fear', category: 'emotions', keywords: ['scream', 'fear', 'shock'] }
    ]
  },
  {
    name: 'gestures',
    label: '👍 Gestures',
    emojis: [
      { emoji: '👍', name: 'thumbs up', category: 'gestures', keywords: ['thumbs', 'up', 'good', 'yes'] },
      { emoji: '👎', name: 'thumbs down', category: 'gestures', keywords: ['thumbs', 'down', 'bad', 'no'] },
      { emoji: '👌', name: 'OK hand', category: 'gestures', keywords: ['ok', 'okay', 'good'] },
      { emoji: '🤌', name: 'pinched fingers', category: 'gestures', keywords: ['pinch', 'italian'] },
      { emoji: '🤏', name: 'pinching hand', category: 'gestures', keywords: ['pinch', 'small'] },
      { emoji: '✌️', name: 'victory hand', category: 'gestures', keywords: ['victory', 'peace', 'two'] },
      { emoji: '🤞', name: 'crossed fingers', category: 'gestures', keywords: ['cross', 'luck', 'hope'] },
      { emoji: '🤟', name: 'love-you gesture', category: 'gestures', keywords: ['love', 'you', 'sign'] },
      { emoji: '🤘', name: 'sign of the horns', category: 'gestures', keywords: ['rock', 'horns'] },
      { emoji: '🤙', name: 'call me hand', category: 'gestures', keywords: ['call', 'phone', 'hang', 'loose'] },
      { emoji: '👈', name: 'backhand index pointing left', category: 'gestures', keywords: ['point', 'left'] },
      { emoji: '👉', name: 'backhand index pointing right', category: 'gestures', keywords: ['point', 'right'] },
      { emoji: '👆', name: 'backhand index pointing up', category: 'gestures', keywords: ['point', 'up'] },
      { emoji: '🖕', name: 'middle finger', category: 'gestures', keywords: ['middle', 'finger', 'rude'] },
      { emoji: '👇', name: 'backhand index pointing down', category: 'gestures', keywords: ['point', 'down'] },
      { emoji: '☝️', name: 'index pointing up', category: 'gestures', keywords: ['point', 'up', 'one'] },
      { emoji: '👋', name: 'waving hand', category: 'gestures', keywords: ['wave', 'hello', 'goodbye'] },
      { emoji: '🤚', name: 'raised back of hand', category: 'gestures', keywords: ['raised', 'back', 'hand'] },
      { emoji: '🖐️', name: 'hand with fingers splayed', category: 'gestures', keywords: ['hand', 'five', 'splayed'] },
      { emoji: '✋', name: 'raised hand', category: 'gestures', keywords: ['hand', 'high', 'five', 'stop'] },
      { emoji: '🖖', name: 'vulcan salute', category: 'gestures', keywords: ['vulcan', 'spock', 'star', 'trek'] },
      { emoji: '👏', name: 'clapping hands', category: 'gestures', keywords: ['clap', 'applause', 'bravo'] },
      { emoji: '🙌', name: 'raising hands', category: 'gestures', keywords: ['raise', 'celebration', 'hooray'] },
      { emoji: '👐', name: 'open hands', category: 'gestures', keywords: ['open', 'hands', 'hug'] },
      { emoji: '🤲', name: 'palms up together', category: 'gestures', keywords: ['palms', 'pray', 'book'] },
      { emoji: '🤝', name: 'handshake', category: 'gestures', keywords: ['handshake', 'deal', 'agreement'] },
      { emoji: '🙏', name: 'folded hands', category: 'gestures', keywords: ['pray', 'thanks', 'please'] }
    ]
  },
  {
    name: 'hearts',
    label: '💖 Hearts',
    emojis: [
      { emoji: '❤️', name: 'red heart', category: 'hearts', keywords: ['love', 'heart', 'red'] },
      { emoji: '🧡', name: 'orange heart', category: 'hearts', keywords: ['love', 'heart', 'orange'] },
      { emoji: '💛', name: 'yellow heart', category: 'hearts', keywords: ['love', 'heart', 'yellow'] },
      { emoji: '💚', name: 'green heart', category: 'hearts', keywords: ['love', 'heart', 'green'] },
      { emoji: '💙', name: 'blue heart', category: 'hearts', keywords: ['love', 'heart', 'blue'] },
      { emoji: '💜', name: 'purple heart', category: 'hearts', keywords: ['love', 'heart', 'purple'] },
      { emoji: '🖤', name: 'black heart', category: 'hearts', keywords: ['love', 'heart', 'black'] },
      { emoji: '🤍', name: 'white heart', category: 'hearts', keywords: ['love', 'heart', 'white'] },
      { emoji: '🤎', name: 'brown heart', category: 'hearts', keywords: ['love', 'heart', 'brown'] },
      { emoji: '💔', name: 'broken heart', category: 'hearts', keywords: ['broken', 'heart', 'sad'] },
      { emoji: '❣️', name: 'heart exclamation', category: 'hearts', keywords: ['heart', 'exclamation'] },
      { emoji: '💕', name: 'two hearts', category: 'hearts', keywords: ['love', 'hearts', 'two'] },
      { emoji: '💞', name: 'revolving hearts', category: 'hearts', keywords: ['love', 'hearts', 'revolving'] },
      { emoji: '💓', name: 'beating heart', category: 'hearts', keywords: ['love', 'heart', 'beating'] },
      { emoji: '💗', name: 'growing heart', category: 'hearts', keywords: ['love', 'heart', 'growing'] },
      { emoji: '💖', name: 'sparkling heart', category: 'hearts', keywords: ['love', 'heart', 'sparkle'] },
      { emoji: '💘', name: 'heart with arrow', category: 'hearts', keywords: ['love', 'heart', 'arrow', 'cupid'] },
      { emoji: '💝', name: 'heart with ribbon', category: 'hearts', keywords: ['love', 'heart', 'gift'] }
    ]
  }
];

// Utility functions for emoji management
export const getRecentEmojis = (): string[] => {
  try {
    const recent = localStorage.getItem('recentEmojis');
    return recent ? JSON.parse(recent) : [];
  } catch {
    return [];
  }
};

export const addToRecentEmojis = (emoji: string): void => {
  try {
    const recent = getRecentEmojis();
    const filtered = recent.filter(e => e !== emoji);
    const updated = [emoji, ...filtered].slice(0, 20); // Keep only 20 recent emojis
    localStorage.setItem('recentEmojis', JSON.stringify(updated));
  } catch {
    // Silently fail if localStorage is not available
  }
};

export const searchEmojis = (query: string, categories: EmojiCategory[]): EmojiData[] => {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase();
  const results: EmojiData[] = [];
  
  categories.forEach(category => {
    category.emojis.forEach(emojiData => {
      const matchesName = emojiData.name.toLowerCase().includes(searchTerm);
      const matchesKeywords = emojiData.keywords.some(keyword => 
        keyword.toLowerCase().includes(searchTerm)
      );
      
      if (matchesName || matchesKeywords) {
        results.push(emojiData);
      }
    });
  });
  
  return results;
};

export const insertEmojiAtCursor = (
  inputElement: HTMLInputElement | HTMLTextAreaElement,
  emoji: string,
  setValue: (value: string) => void
): void => {
  const start = inputElement.selectionStart || 0;
  const end = inputElement.selectionEnd || 0;
  const currentValue = inputElement.value;
  
  const newValue = currentValue.slice(0, start) + emoji + currentValue.slice(end);
  setValue(newValue);
  
  // Set cursor position after the emoji
  setTimeout(() => {
    const newCursorPosition = start + emoji.length;
    inputElement.setSelectionRange(newCursorPosition, newCursorPosition);
    inputElement.focus();
  }, 0);
};

export const getEmojiCategories = (): EmojiCategory[] => {
  const categories = [...EMOJI_DATA];
  
  // Update recent emojis category
  const recentEmojis = getRecentEmojis();
  if (recentEmojis.length > 0) {
    const recentEmojiData: EmojiData[] = recentEmojis.map(emoji => ({
      emoji,
      name: `recent ${emoji}`,
      category: 'recent',
      keywords: ['recent']
    }));
    
    categories[0] = {
      ...categories[0],
      emojis: recentEmojiData
    };
  }
  
  return categories;
};
