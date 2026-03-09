import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getService } from '@/services/index'
import { useRaceStore } from '@/stores/race.store'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/layout/PageHeader'
import type { StreamInfo, ChatMessage } from '@/services/interfaces/streaming.service'

function formatViewerCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return count.toString()
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isSystem = message.type === 'system'
  const isHighlight = message.type === 'highlight'

  if (isSystem) {
    return (
      <div className="text-center py-1">
        <span className="text-xs text-text-secondary italic">{message.body}</span>
      </div>
    )
  }

  return (
    <div className={`flex gap-2 py-1.5 px-2 rounded-lg ${isHighlight ? 'bg-accent/10' : 'hover:bg-bg'}`}>
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-xs font-bold text-primary">
          {message.displayName[0]?.toUpperCase()}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold text-text truncate">{message.displayName}</span>
          <span className="text-[10px] text-text-secondary shrink-0">{formatTime(message.createdAt)}</span>
          {isHighlight && <Badge variant="accent" size="sm">Highlight</Badge>}
        </div>
        <p className="text-sm text-text break-words">{message.body}</p>
      </div>
    </div>
  )
}

export function LiveStreamPage() {
  const { raceId } = useParams<{ raceId: string }>()
  const { isLoggedIn, userName } = useAuth()
  const fetchRace = useRaceStore(s => s.fetchRace)
  const race = useRaceStore(s => s.selectedRace)

  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const unsubRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!raceId) return
    fetchRace(raceId)
  }, [raceId, fetchRace])

  useEffect(() => {
    if (!raceId) return
    setIsLoading(true)

    const streaming = getService('streaming')

    const load = async () => {
      try {
        const info = await streaming.getStreamInfo(raceId, '2025')
        setStreamInfo(info)

        const result = await streaming.getChatMessages(info.id, undefined, 50)
        setMessages(result.items)

        unsubRef.current = streaming.subscribeToChatMessages(info.id, (msg) => {
          setMessages(prev => [...prev, msg])
        })
      } catch {
        // Stream may not exist for this race
      } finally {
        setIsLoading(false)
      }
    }

    load()
    return () => {
      if (unsubRef.current) unsubRef.current()
    }
  }, [raceId])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(async () => {
    if (!chatInput.trim() || !streamInfo || isSending) return
    setIsSending(true)
    try {
      const streaming = getService('streaming')
      await streaming.sendChatMessage(streamInfo.id, { body: chatInput.trim() })
      setChatInput('')
    } catch {
      // ignore
    } finally {
      setIsSending(false)
    }
  }, [chatInput, streamInfo, isSending])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-border/40 rounded w-48" />
          <div className="aspect-video bg-border/40 rounded-xl" />
          <div className="h-64 bg-border/40 rounded-xl" />
        </div>
      </div>
    )
  }

  const isLive = streamInfo?.status === 'live'

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <PageHeader
        title={race?.name ? `${race.name} - Live Stream` : 'Live Stream'}
        subtitle={race?.location}
        backLink={raceId ? `/races/${raceId}` : '/'}
        backLabel="Race Details"
        actions={
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {isLive && (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse" />
                <span className="text-sm font-semibold text-danger">LIVE</span>
              </div>
            )}
            {streamInfo?.viewerCount != null && (
              <Badge variant="default">
                {formatViewerCount(streamInfo.viewerCount)} watching
              </Badge>
            )}
            <Link to={raceId ? `/races/${raceId}/live` : '/'}>
              <Button variant="secondary" size="sm">Live Tracking</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden" padding="none">
            <div className="aspect-video bg-text flex items-center justify-center relative">
              {isLive ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
                  <div className="text-center z-10 space-y-4">
                    <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto backdrop-blur-sm">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className="text-white/80 text-sm">Stream player placeholder</p>
                    <p className="text-white/50 text-xs">Video would embed here via YouTube/HLS</p>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-3">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M2 8h20" />
                    <circle cx="12" cy="14" r="2" />
                  </svg>
                  <p className="text-white/60 text-sm">
                    {streamInfo?.status === 'scheduled' ? 'Stream starts soon' : 'Stream offline'}
                  </p>
                  {streamInfo?.scheduledStartTime && (
                    <p className="text-white/40 text-xs">
                      Scheduled: {new Date(streamInfo.scheduledStartTime).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-border">
              <h2 className="font-semibold text-text">{streamInfo?.title || 'Race Coverage'}</h2>
              {streamInfo?.description && (
                <p className="text-sm text-text-secondary mt-1">{streamInfo.description}</p>
              )}
            </div>
          </Card>

          {streamInfo?.highlightTimestamps && streamInfo.highlightTimestamps.length > 0 && (
            <Card className="mt-4">
              <h3 className="text-sm font-semibold text-text mb-3">Highlights</h3>
              <div className="space-y-2">
                {streamInfo.highlightTimestamps.map((hl, i) => (
                  <button
                    key={i}
                    className="flex items-center gap-3 w-full text-left p-2 rounded-lg hover:bg-bg transition-all duration-150 active:scale-[0.98] cursor-pointer"
                  >
                    <span className="text-xs font-mono text-text-secondary bg-border/30 px-2 py-1 rounded">
                      {Math.floor(hl.timeSeconds / 3600)}:{String(Math.floor((hl.timeSeconds % 3600) / 60)).padStart(2, '0')}:{String(hl.timeSeconds % 60).padStart(2, '0')}
                    </span>
                    <span className="text-sm text-text">{hl.label}</span>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Chat Panel */}
        <div className="lg:col-span-1">
          <Card className="flex flex-col h-[400px] lg:h-[600px]" padding="none">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text">Race Chat</h3>
              <Badge variant="default" size="sm">{messages.length} messages</Badge>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
              {messages.map(msg => (
                <ChatMessageBubble key={msg.id} message={msg} />
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t border-border">
              {isLoggedIn ? (
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Chat as ${userName || 'user'}...`}
                    className="flex-1"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSend}
                    loading={isSending}
                    disabled={!chatInput.trim()}
                  >
                    Send
                  </Button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-xs text-text-secondary mb-2">Sign in to join the chat</p>
                  <Link to="/login">
                    <Button variant="secondary" size="sm">Sign In</Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default LiveStreamPage
