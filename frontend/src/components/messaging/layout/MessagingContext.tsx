import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { MessagingAccountDTO, ConversationDTO, MessageDTO, MessageType } from '../../../types/messaging';
import { messagingService } from '../../../services/messaging.service';

interface MessagingContextType {
  // Account management
  accounts: MessagingAccountDTO[];
  selectedAccount: MessagingAccountDTO | null;
  setSelectedAccount: (account: MessagingAccountDTO | null) => void;
  
  // Conversation management
  conversations: ConversationDTO[];
  selectedConversation: ConversationDTO | null;
  setSelectedConversation: (conversation: ConversationDTO | null) => void;
  
  // Message management
  messages: MessageDTO[];
  
  // Loading states
  accountsLoading: boolean;
  conversationsLoading: boolean;
  messagesLoading: boolean;
  
  // Error states
  error: string | null;
  setError: (error: string | null) => void;
  
  // Actions
  refreshAccounts: () => Promise<void>;
  refreshConversations: () => Promise<void>;
  refreshMessages: () => Promise<void>;
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  
  // UI state
  isMobile: boolean;
  activePanel: 'accounts' | 'conversations' | 'messages';
  setActivePanel: (panel: 'accounts' | 'conversations' | 'messages') => void;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};

interface MessagingProviderProps {
  children: React.ReactNode;
}

export const MessagingProvider: React.FC<MessagingProviderProps> = ({ children }) => {
  // State management
  const [accounts, setAccounts] = useState<MessagingAccountDTO[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<MessagingAccountDTO | null>(null);
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDTO | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  
  // Loading states
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activePanel, setActivePanel] = useState<'accounts' | 'conversations' | 'messages'>('accounts');
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Fetch accounts
  const refreshAccounts = useCallback(async () => {
    try {
      setAccountsLoading(true);
      setError(null);
      const accountsData = await messagingService.getUserAccounts();
      setAccounts(accountsData);
      
      // Auto-select first account if none selected
      if (!selectedAccount && accountsData.length > 0) {
        setSelectedAccount(accountsData[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load accounts');
    } finally {
      setAccountsLoading(false);
    }
  }, [selectedAccount]);
  
  // Fetch conversations for selected account
  const refreshConversations = useCallback(async () => {
    if (!selectedAccount) {
      setConversations([]);
      return;
    }
    
    try {
      setConversationsLoading(true);
      setError(null);
      const conversationsData = await messagingService.getAccountConversations(selectedAccount.id);
      setConversations(conversationsData);
      
      // Auto-select first conversation if none selected
      if (!selectedConversation && conversationsData.length > 0) {
        setSelectedConversation(conversationsData[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load conversations');
    } finally {
      setConversationsLoading(false);
    }
  }, [selectedAccount, selectedConversation]);
  
  // Fetch messages for selected conversation
  const refreshMessages = useCallback(async () => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }
    
    try {
      setMessagesLoading(true);
      setError(null);
      const messagesData = await messagingService.getConversationMessages({
        conversationId: selectedConversation.id,
        page: 0,
        size: 50
      });
      setMessages(messagesData.content);
    } catch (err: any) {
      setError(err.message || 'Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  }, [selectedConversation]);
  
  // Send message
  const sendMessage = useCallback(async (content: string, attachments?: File[]) => {
    if (!selectedConversation || !selectedAccount) {
      throw new Error('No conversation or account selected');
    }
    
    try {
      const messageData = await messagingService.sendMessage({
        conversationId: selectedConversation.id,
        content,
        messageType: MessageType.TEXT
      });
      
      // Add the new message to the list
      setMessages(prev => [...prev, messageData]);
      
      // Refresh conversations to update last message
      refreshConversations();
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      throw err;
    }
  }, [selectedConversation, selectedAccount, refreshConversations]);
  
  // Auto-refresh data when selections change
  useEffect(() => {
    refreshAccounts();
  }, []);
  
  useEffect(() => {
    refreshConversations();
  }, [selectedAccount]);
  
  useEffect(() => {
    refreshMessages();
  }, [selectedConversation]);
  
  // Handle account selection
  const handleSetSelectedAccount = useCallback((account: MessagingAccountDTO | null) => {
    setSelectedAccount(account);
    setSelectedConversation(null); // Reset conversation when account changes
    setMessages([]); // Reset messages
    
    if (isMobile) {
      setActivePanel('conversations');
    }
  }, [isMobile]);
  
  // Handle conversation selection
  const handleSetSelectedConversation = useCallback((conversation: ConversationDTO | null) => {
    setSelectedConversation(conversation);
    
    if (isMobile) {
      setActivePanel('messages');
    }
  }, [isMobile]);
  
  const value: MessagingContextType = {
    // Account management
    accounts,
    selectedAccount,
    setSelectedAccount: handleSetSelectedAccount,
    
    // Conversation management
    conversations,
    selectedConversation,
    setSelectedConversation: handleSetSelectedConversation,
    
    // Message management
    messages,
    
    // Loading states
    accountsLoading,
    conversationsLoading,
    messagesLoading,
    
    // Error states
    error,
    setError,
    
    // Actions
    refreshAccounts,
    refreshConversations,
    refreshMessages,
    sendMessage,
    
    // UI state
    isMobile,
    activePanel,
    setActivePanel
  };
  
  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
};
