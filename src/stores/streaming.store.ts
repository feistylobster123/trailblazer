import { create } from 'zustand'
import { getService } from '@/services/index'
import type { StreamInfo, ChatMessage } from '@/services/interfaces/streaming.service'

// Holds the active stream id so sendMessage and chat subscriptions target the
// correct stream without callers needing to track it themselves.

interface StreamingState {
  streamInfo: StreamInfo | null
  chatMessages: ChatMessage[]
  isStreamLive: boolean
  chatEnabled: boolean
  isLoading: boolean
  error: string | null

  fetchStreamInfo: (raceId: string, editionId: string) => Promise<void>
  sendMessage: (message: string) => Promise<void>
  subscribeToChatMessages: (streamId: string) => () => void
}

export const useStreamingStore = create<StreamingState>((set, get) => ({
  streamInfo: null,
  chatMessages: [],
  isStreamLive: false,
  chatEnabled: false,
  isLoading: false,
  error: null,

  fetchStreamInfo: async (raceId, editionId) => {
    set({ isLoading: true, error: null })
    try {
      const streaming = getService('streaming')
      const info = await streaming.getStreamInfo(raceId, editionId)
      set({
        streamInfo: info,
        isStreamLive: info.status === 'live',
        chatEnabled: info.chatEnabled,
        isLoading: false,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch stream info'
      set({ error: message, isLoading: false })
    }
  },

  sendMessage: async (message) => {
    const { streamInfo } = get()
    if (!streamInfo) return
    try {
      const streaming = getService('streaming')
      const sent = await streaming.sendChatMessage(streamInfo.id, { body: message })
      // Optimistically append the sent message (the subscription may also deliver
      // it, so de-dupe by id in the handler)
      set((s) => {
        const exists = s.chatMessages.some((m) => m.id === sent.id)
        if (exists) return {}
        return { chatMessages: [...s.chatMessages, sent] }
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send message'
      set({ error: msg })
    }
  },

  subscribeToChatMessages: (streamId) => {
    const streaming = getService('streaming')
    const unsubscribe = streaming.subscribeToChatMessages(streamId, (message) => {
      set((s) => {
        const exists = s.chatMessages.some((m) => m.id === message.id)
        if (exists) return {}
        return { chatMessages: [...s.chatMessages, message] }
      })
    })
    return unsubscribe
  },
}))
