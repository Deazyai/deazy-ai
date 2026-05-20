export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatHistoryItem {
  role: 'user' | 'model';
  parts: [{ text: string }];
}
