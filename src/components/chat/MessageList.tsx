import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { ScrollArea } from '../ui/scroll-area'
import { MessageCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  is_read?: boolean
  sender?: {
    full_name?: string
    avatar_url?: string
  }
}

interface MessageListProps {
  messages: Message[]
  loading: boolean
  currentUserId?: string
  sellerName: string
  sellerAvatar?: string
  otherUserTyping?: boolean
  onRetryMessage: (messageId: string) => void
}

const MessageList = React.memo(({
  messages,
  loading,
  currentUserId,
  sellerName,
  sellerAvatar,
  otherUserTyping,
  onRetryMessage
}: MessageListProps) => {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = React.useState(true)

  const formatTime = React.useCallback((dateString: string) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }, [])

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (shouldAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, otherUserTyping, shouldAutoScroll])

  // Handle scroll to detect if user manually scrolled up
  const handleScroll = React.useCallback(() => {
    if (!scrollRef.current) return
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50
    setShouldAutoScroll(isAtBottom)
  }, [])

  if (loading) {
    return (
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              <div className="flex flex-col gap-2 flex-1">
                <div className="h-10 bg-gray-200 rounded-2xl animate-pulse max-w-[70%]" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-16" />
              </div>
            </div>
          ))}
          <div className="text-center text-muted-foreground py-4 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải...
          </div>
        </div>
      </ScrollArea>
    )
  }

  if (messages.length === 0) {
    return (
      <ScrollArea className="flex-1 p-4">
        <div className="text-center text-muted-foreground py-8">
          <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Bắt đầu cuộc trò chuyện</p>
          <p className="text-sm mt-1">
            Gửi tin nhắn để liên hệ với {sellerName}
          </p>
        </div>
      </ScrollArea>
    )
  }

  return (
    <div className="relative flex-1">
      <ScrollArea 
        className="h-full p-4" 
        ref={scrollRef}
        onScrollCapture={handleScroll}
      >
        <div className="space-y-4" role="log" aria-live="polite" aria-label="Tin nhắn trò chuyện">
        {messages.map((message) => {
          const isMe = message.sender_id === currentUserId
          const isFailed = message.status === 'failed'
          const isSending = message.status === 'sending'
          
          return (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                isMe && 'flex-row-reverse'
              )}
            >
              {!isMe && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src={message.sender?.avatar_url || sellerAvatar || ''} />
                  <AvatarFallback>
                    {(message.sender?.full_name || sellerName).charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={cn(
                'flex flex-col max-w-[75%]',
                isMe ? 'items-end' : 'items-start'
              )}>
                <div
                  className={cn(
                    'px-4 py-2 rounded-2xl max-w-full break-words',
                    isMe
                      ? isFailed 
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : isSending
                          ? 'bg-primary/70 text-primary-foreground'
                          : 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content.length > 1000 
                      ? message.content.substring(0, 1000) + '...' 
                      : message.content
                    }
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {formatTime(message.created_at)}
                  </span>
                  {isMe && isSending && (
                    <span className="text-xs text-muted-foreground">Đang gửi...</span>
                  )}
                  {isMe && isFailed && (
                    <button 
                      onClick={() => onRetryMessage(message.id)}
                      className="text-xs text-red-500 hover:underline"
                      aria-label="Gửi lại tin nhắn"
                    >
                      Gửi lại
                    </button>
                  )}
                  {isMe && message.status === 'sent' && (
                    <span className="text-xs text-green-500" aria-label="Đã gửi">✓</span>
                  )}
                  {isMe && message.is_read && (
                    <span className="text-xs text-blue-500" aria-label="Đã đọc">✓✓</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        
        {/* Typing indicator */}
        {otherUserTyping && (
          <div className="flex gap-3 items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={sellerAvatar || ''} />
              <AvatarFallback>{sellerName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="bg-muted px-4 py-2 rounded-2xl">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
              </div>
            </div>
          </div>
        )}
      </div>
      </ScrollArea>
      
      {/* Scroll to bottom button */}
      {!shouldAutoScroll && (
        <button
          onClick={() => {
            setShouldAutoScroll(true)
            if (scrollRef.current) {
              scrollRef.current.scrollTop = scrollRef.current.scrollHeight
            }
          }}
          className="absolute bottom-4 right-4 bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:scale-105 transition-transform"
          aria-label="Cuộn xuống cuối"
        >
          ↓
        </button>
      )}
    </div>
  )
})

MessageList.displayName = 'MessageList'

export default MessageList