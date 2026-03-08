// Streaming service interface

export type StreamStatus = 'offline' | 'live' | 'replay' | 'scheduled';
export type StreamQuality = '360p' | '480p' | '720p' | '1080p';
export type ChatMessageType = 'chat' | 'system' | 'highlight' | 'moderation';

export interface StreamSource {
  quality: StreamQuality;
  url: string;
  mimeType: string;
}

export interface StreamInfo {
  id: string;
  raceId: string;
  editionId: string;
  title: string;
  description?: string;
  status: StreamStatus;
  scheduledStartTime?: string;
  actualStartTime?: string;
  endTime?: string;
  viewerCount?: number;
  sources: StreamSource[];
  thumbnailUrl?: string;
  chatEnabled: boolean;
  highlightTimestamps: Array<{
    timeSeconds: number;
    label: string;
    runnerId?: string;
  }>;
}

export interface StreamStatusInfo {
  streamId: string;
  status: StreamStatus;
  viewerCount?: number;
  currentTimeSeconds?: number;
  scheduledStartTime?: string;
  actualStartTime?: string;
}

export interface ChatMessage {
  id: string;
  streamId: string;
  userId?: string;
  displayName: string;
  avatarUrl?: string;
  type: ChatMessageType;
  body: string;
  replyToId?: string;
  reactions: Record<string, number>; // emoji -> count
  pinnedAt?: string;
  createdAt: string;
  deletedAt?: string;
}

export interface SendChatMessagePayload {
  body: string;
  replyToId?: string;
}

export interface ChatMessagesResult {
  items: ChatMessage[];
  total: number;
  hasMore: boolean;
  oldestMessageId?: string;
}

export type ChatMessageHandler = (message: ChatMessage) => void;

export interface IStreamingService {
  getStreamInfo(raceId: string, editionId: string): Promise<StreamInfo>;
  getStreamStatus(streamId: string): Promise<StreamStatusInfo>;
  getChatMessages(streamId: string, beforeMessageId?: string, limit?: number): Promise<ChatMessagesResult>;
  sendChatMessage(streamId: string, payload: SendChatMessagePayload): Promise<ChatMessage>;
  subscribeToChatMessages(streamId: string, handler: ChatMessageHandler): () => void;
}
