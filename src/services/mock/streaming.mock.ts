import type {
  IStreamingService,
  StreamInfo,
  StreamStatus,
  StreamStatusInfo,
  ChatMessage,
  ChatMessageType,
  ChatMessagesResult,
  SendChatMessagePayload,
  ChatMessageHandler,
} from '../interfaces/streaming.service'

function delay(): Promise<void> {
  return new Promise(r => setTimeout(r, 50 + Math.random() * 50))
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`
}

// ---------------------------------------------------------------------------
// Static stream config per race
// ---------------------------------------------------------------------------

const STREAM_INFO: Record<string, Omit<StreamInfo, 'raceId' | 'editionId'>> = {
  'leadville-100': {
    id: 'stream-ltc100-2025',
    title: 'Leadville Trail 100 - 2025 Live Coverage',
    description:
      'Live coverage of the Leadville Trail 100 Run, featuring runner tracking, aid station cameras, and race commentary from Leadville, Colorado.',
    status: 'live' as StreamStatus,
    actualStartTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    viewerCount: 14382,
    sources: [
      {
        quality: '1080p',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
        mimeType: 'text/html',
      },
      {
        quality: '720p',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
        mimeType: 'text/html',
      },
      {
        quality: '480p',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
        mimeType: 'text/html',
      },
    ],
    thumbnailUrl: '/images/races/leadville-100.jpg',
    chatEnabled: true,
    highlightTimestamps: [
      { timeSeconds: 420, label: 'Race start - 800 runners depart 6th Street', runnerId: undefined },
      { timeSeconds: 7200, label: 'First runner reaches Mayqueen', runnerId: 'runner-001' },
      { timeSeconds: 18000, label: 'Dani Moreno takes lead at Twin Lakes', runnerId: 'runner-007' },
      { timeSeconds: 21600, label: 'Pack crossing Hope Pass (outbound)', runnerId: undefined },
      { timeSeconds: 27000, label: 'First runner arrives at Winfield turnaround', runnerId: 'runner-001' },
    ],
  },
  'western-states-100': {
    id: 'stream-ws100-2025',
    title: 'Western States 100 - 2025 Live Coverage',
    description:
      'The world\'s oldest 100-mile trail race, live from the Sierra Nevada. Follow the action from Squaw Valley to Auburn.',
    status: 'scheduled' as StreamStatus,
    scheduledStartTime: '2025-06-28T05:00:00-07:00',
    viewerCount: 0,
    sources: [
      {
        quality: '1080p',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        mimeType: 'text/html',
      },
    ],
    thumbnailUrl: '/images/races/western-states.jpg',
    chatEnabled: true,
    highlightTimestamps: [],
  },
  'utmb': {
    id: 'stream-utmb-2025',
    title: 'UTMB Mont-Blanc 2025 - Live',
    description:
      'Live coverage of the Ultra-Trail du Mont-Blanc, circumnavigating the highest peak in the Alps through France, Italy, and Switzerland.',
    status: 'scheduled' as StreamStatus,
    scheduledStartTime: '2025-08-29T18:00:00+02:00',
    viewerCount: 0,
    sources: [
      {
        quality: '1080p',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        mimeType: 'text/html',
      },
    ],
    thumbnailUrl: '/images/races/utmb.jpg',
    chatEnabled: true,
    highlightTimestamps: [],
  },
}

// ---------------------------------------------------------------------------
// Pre-generated chat messages
// ---------------------------------------------------------------------------

const BASE_TIME = Date.now() - 35 * 60 * 1000 // messages start 35 min ago

function makeMessage(
  idx: number,
  streamId: string,
  displayName: string,
  body: string,
  type: ChatMessageType = 'chat',
  reactions: Record<string, number> = {},
): ChatMessage {
  return {
    id: `msg-${streamId}-${idx.toString().padStart(4, '0')}`,
    streamId,
    displayName,
    type,
    body,
    reactions,
    createdAt: new Date(BASE_TIME + idx * 80000).toISOString(),
  }
}

const INITIAL_MESSAGES: ChatMessage[] = [
  makeMessage(1, 'stream-ltc100-2025', 'TrailBlazerTV', '-- LIVE: Leadville Trail 100 is underway! 800 runners on course. --', 'system'),
  makeMessage(2, 'stream-ltc100-2025', 'MountainGoat_99', 'Let\'s GOOO!! First time watching this race, so hyped', 'chat', { '🔥': 12 }),
  makeMessage(3, 'stream-ltc100-2025', 'UltraWatcher', 'Dani Moreno looked incredibly strong at Mayqueen. She\'s running sub-24 pace right now', 'chat', { '💪': 8 }),
  makeMessage(4, 'stream-ltc100-2025', 'ColoradoCrews', 'Anyone else at Twin Lakes right now? So many people here already', 'chat'),
  makeMessage(5, 'stream-ltc100-2025', 'TrailBlazerTV', 'HIGHLIGHT: Lead pack hits Twin Lakes at 7:42 elapsed. Moreno, Zhang, and Kowalski together.', 'highlight', { '🏔': 45, '🔥': 31 }),
  makeMessage(6, 'stream-ltc100-2025', 'HopePassViewer', 'What\'s the weather like at Hope Pass today? Looked ominous on the webcam', 'chat'),
  makeMessage(7, 'stream-ltc100-2025', 'SierraRunner_2024', 'Hope Pass cam shows some clouds but nothing serious. Wind is the issue, probably 25-30mph on the summit', 'chat', { '🌬': 6 }),
  makeMessage(8, 'stream-ltc100-2025', 'CrewChief_LTC', 'Go Sarah!! You\'re absolutely crushing it!! Winfield in under 9 hours is incredible!!', 'chat', { '❤': 22, '🎉': 15 }),
  makeMessage(9, 'stream-ltc100-2025', 'UltraWatcher', '@CrewChief_LTC which bib is Sarah?', 'chat'),
  makeMessage(10, 'stream-ltc100-2025', 'CrewChief_LTC', 'Bib 312! She\'s in 4th woman right now. Dream race so far', 'chat', { '❤': 18 }),
  makeMessage(11, 'stream-ltc100-2025', 'MountainGoat_99', 'Is the Winfield road passable without 4WD this year? First time crewing', 'chat'),
  makeMessage(12, 'stream-ltc100-2025', 'ColoradoCrews', '@MountainGoat_99 technically passable but rough. Shuttle from Twin Lakes is way less stressful', 'chat', { '👍': 9 }),
  makeMessage(13, 'stream-ltc100-2025', 'PacerPete', 'Heading to Twin Lakes to pick up my runner at mile 60. Anyone know current wait times at the aid station?', 'chat'),
  makeMessage(14, 'stream-ltc100-2025', 'TrailBlazerTV', 'Zhang takes the men\'s lead on Hope Pass (inbound). Kowalski 8 minutes back. Drama!', 'highlight', { '😱': 67, '🔥': 54 }),
  makeMessage(15, 'stream-ltc100-2025', 'LTCVet_7x', 'That Hope Pass inbound descent by Zhang is WILD. Absolutely fearless in those conditions', 'chat', { '🤯': 33 }),
  makeMessage(16, 'stream-ltc100-2025', 'HighAltitudeHiker', 'Can someone explain the cutoff system? What happens if runners miss Mayqueen?', 'chat'),
  makeMessage(17, 'stream-ltc100-2025', 'UltraWatcher', '@HighAltitudeHiker Mayqueen inbound cutoff is 26:30 elapsed. If you miss it you\'re pulled. Race has cutoffs at every major station', 'chat', { '👍': 7 }),
  makeMessage(18, 'stream-ltc100-2025', 'RunnerFam_142', 'Alex just came through Twin Lakes looking strong!! Steady and controlled, exactly the plan!', 'chat', { '🙌': 11, '❤': 8 }),
  makeMessage(19, 'stream-ltc100-2025', 'Leadville_Local', 'Downtown Leadville finish line is ELECTRIC right now. Nothing like this town on race night', 'chat', { '🎉': 28 }),
  makeMessage(20, 'stream-ltc100-2025', 'TrailBlazerTV', 'Moreno extends women\'s lead at Twin Lakes inbound. On pace for sub-22 hours if she holds it together.', 'highlight', { '🔥': 89, '🏆': 41 }),
  makeMessage(21, 'stream-ltc100-2025', 'FirstTimeViewer', 'This is the most intense thing I\'ve ever watched. How do people run 100 miles?', 'chat', { '😮': 14 }),
  makeMessage(22, 'stream-ltc100-2025', 'LTCVet_7x', '@FirstTimeViewer One aid station at a time. Seriously. You just go to the next one, never think about the full distance', 'chat', { '❤': 52, '🙏': 23 }),
  makeMessage(23, 'stream-ltc100-2025', 'PacerPete', 'Just picked up my runner at Twin Lakes. She\'s in good spirits and eating well. This is actually happening!', 'chat', { '🎉': 19 }),
  makeMessage(24, 'stream-ltc100-2025', 'SierraRunner_2024', 'For anyone wondering -- the stream cuts out sometimes near May Queen because of cell dead zones. Not your connection.', 'chat', { '👍': 31 }),
  makeMessage(25, 'stream-ltc100-2025', 'MountainGoat_99', 'Zhang just crossed the finish line!! NEW COURSE RECORD?? Someone confirm!', 'chat', { '🤯': 145, '🏆': 98, '🔥': 212 }),
]

// In-memory store per stream (keyed by streamId)
const chatStores: Map<string, ChatMessage[]> = new Map([
  ['stream-ltc100-2025', [...INITIAL_MESSAGES]],
  ['stream-ws100-2025', []],
  ['stream-utmb-2025', []],
])

// Active subscriptions: streamId -> array of handlers
const subscriptions: Map<string, ChatMessageHandler[]> = new Map()

// Simulated chat interval handles
const chatIntervals: Map<string, ReturnType<typeof setInterval>> = new Map()

const BOT_MESSAGES: string[] = [
  'Anyone know if the aid station cameras are switching to Mayqueen soon?',
  'Zhang\'s downhill running is just on another level right now',
  'Go everyone still out there!! Every finisher is a champion today',
  'What\'s the temperature drop expected overnight at this elevation?',
  'The volunteers at this race are absolute legends. So much work goes into this.',
  'First time watching LTC and I\'m already planning to register for next year lol',
  'The cutoff drama at May Queen inbound every year gives me heart attacks',
  'Fun fact: Leadville is the highest incorporated city in the US at 10,152 ft elevation',
  'My favorite part of any 100 is watching runners find their second (or third) wind after a low point',
  'Is the finish line webcam back up? Mine went dark',
  'Shoutout to all the pacers grinding miles 60-100 with their runners right now',
]

const BOT_NAMES = [
  'UltraFan_CO', 'HighCountryRunner', 'SilverLining_44', 'TrailObsessed',
  'MileHigh_Ultra', 'GritAndGranola', 'PacingPerfection', 'AlpineAdmirer',
]

function getOrCreateChatStore(streamId: string): ChatMessage[] {
  if (!chatStores.has(streamId)) {
    chatStores.set(streamId, [])
  }
  return chatStores.get(streamId)!
}

function startChatSimulation(streamId: string): void {
  if (chatIntervals.has(streamId)) return

  const handlers = subscriptions.get(streamId) ?? []

  const intervalId = setInterval(() => {
    const currentHandlers = subscriptions.get(streamId) ?? []
    if (currentHandlers.length === 0) {
      clearInterval(intervalId)
      chatIntervals.delete(streamId)
      return
    }

    const body = BOT_MESSAGES[Math.floor(Math.random() * BOT_MESSAGES.length)]
    const displayName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)]

    const message: ChatMessage = {
      id: generateId('msg'),
      streamId,
      displayName,
      type: 'chat',
      body,
      reactions: {},
      createdAt: new Date().toISOString(),
    }

    const store = getOrCreateChatStore(streamId)
    store.push(message)

    for (const handler of currentHandlers) {
      try {
        handler(message)
      } catch {
        // ignore handler errors
      }
    }
  }, 5000 + Math.random() * 5000)

  chatIntervals.set(streamId, intervalId)

  // keep reference alive
  void handlers
}

function getStreamIdForRace(raceId: string): string {
  const info = STREAM_INFO[raceId]
  return info?.id ?? `stream-${raceId}`
}

export class MockStreamingService implements IStreamingService {
  async getStreamInfo(raceId: string, editionId: string): Promise<StreamInfo> {
    await delay()

    const base = STREAM_INFO[raceId] ?? STREAM_INFO['leadville-100']

    return {
      ...base,
      raceId,
      editionId,
    }
  }

  async getStreamStatus(streamId: string): Promise<StreamStatusInfo> {
    await delay()

    // Find stream info by ID
    const entry = Object.values(STREAM_INFO).find(s => s.id === streamId)

    if (!entry) {
      return {
        streamId,
        status: 'offline',
      }
    }

    const result: StreamStatusInfo = {
      streamId,
      status: entry.status,
    }

    if (entry.status === 'live') {
      result.viewerCount = (entry.viewerCount ?? 10000) + Math.floor(Math.random() * 500 - 250)
      result.currentTimeSeconds = entry.actualStartTime
        ? Math.floor((Date.now() - new Date(entry.actualStartTime).getTime()) / 1000)
        : 0
      result.actualStartTime = entry.actualStartTime
    }

    if (entry.status === 'scheduled') {
      result.scheduledStartTime = entry.scheduledStartTime
    }

    return result
  }

  async getChatMessages(
    streamId: string,
    beforeMessageId?: string,
    limit = 50,
  ): Promise<ChatMessagesResult> {
    await delay()

    const store = getOrCreateChatStore(streamId)

    let items = [...store]

    if (beforeMessageId) {
      const idx = items.findIndex(m => m.id === beforeMessageId)
      if (idx !== -1) {
        items = items.slice(0, idx)
      }
    }

    const total = items.length
    const sliced = items.slice(-limit)

    return {
      items: sliced,
      total,
      hasMore: total > sliced.length,
      oldestMessageId: sliced[0]?.id,
    }
  }

  async sendChatMessage(
    streamId: string,
    payload: SendChatMessagePayload,
  ): Promise<ChatMessage> {
    await delay()

    const message: ChatMessage = {
      id: generateId('msg'),
      streamId,
      displayName: 'You',
      type: 'chat',
      body: payload.body,
      replyToId: payload.replyToId,
      reactions: {},
      createdAt: new Date().toISOString(),
    }

    const store = getOrCreateChatStore(streamId)
    store.push(message)

    // Notify active subscribers
    const handlers = subscriptions.get(streamId) ?? []
    for (const handler of handlers) {
      try {
        handler(message)
      } catch {
        // ignore
      }
    }

    return message
  }

  subscribeToChatMessages(streamId: string, handler: ChatMessageHandler): () => void {
    if (!subscriptions.has(streamId)) {
      subscriptions.set(streamId, [])
    }

    const handlers = subscriptions.get(streamId)!
    handlers.push(handler)

    startChatSimulation(streamId)

    return () => {
      const current = subscriptions.get(streamId) ?? []
      const filtered = current.filter(h => h !== handler)
      subscriptions.set(streamId, filtered)

      if (filtered.length === 0) {
        const interval = chatIntervals.get(streamId)
        if (interval) {
          clearInterval(interval)
          chatIntervals.delete(streamId)
        }
      }
    }
  }
}
