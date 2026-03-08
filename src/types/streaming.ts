export type StreamInfo = {
  raceId: string
  title: string
  description: string
  embedUrl: string
  isLive: boolean
  startTime: string
  viewerCount: number
  chatEnabled: boolean
}

export type StreamStatus = {
  isLive: boolean
  viewerCount: number
  uptime: number
}

export type ChatMessage = {
  id: string
  userId: string
  userName: string
  userAvatar: string
  message: string
  timestamp: string
  isModerator: boolean
  reactionCounts: Record<string, number>
}
