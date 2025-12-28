import { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { ScrollArea } from './ui/scroll-area'
import { 
  MessageCircle, 
  Send, 
  X,
  Phone,
  LogIn
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { useAuth } from '@/contexts/AuthContext'
import { useChat } from '@/hooks/useChat'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ChatWithSellerProps {
  sellerId: string
  sellerName: string
  sellerAvatar?: string
  sellerPhone?: string
  propertyId: string
  propertyTitle: string
  onClose?: () => void
  inline?: boolean
}

export function ChatWithSeller({
  sellerId,
  sellerName,
  sellerAvatar,
  sellerPhone,
  propertyId,
  propertyTitle,
  onClose,
  inline = false
}: ChatWithSellerProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    loading,
    sending,
    sendMessage,
    loadMessages,
    getOrCreateConversation
  } = useChat({ conversationId: conversationId || undefined })

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Start conversation with seller
  const startConversation = async () => {
    if (!user || !sellerId) return

    const convId = await getOrCreateConversation(sellerId, propertyId)
    if (convId) {
      setConversationId(convId)
      await loadMessages(convId)
    }
  }

  // Handle send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId) return

    if (newMessage.length > 1000) {
      toast.error('Tin nhắn không được vượt quá 1000 ký tự')
      return
    }

    const success = await sendMessage(conversationId, newMessage)
    if (success) {
      setNewMessage('')
    } else {
      toast.error('Không thể gửi tin nhắn. Vui lòng thử lại.')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
  }

  // Handle open chat
  const openChat = () => {
    if (!user) {
      setShowLoginPrompt(true)
      return
    }
    setIsOpen(true)
    if (!conversationId) {
      startConversation()
    }
  }

  const closeChat = () => {
    setIsOpen(false)
    onClose?.()
  }

  // Chat content component
  const ChatContent = () => (
    <div className="flex flex-col h-[min(450px,60vh)] max-h-[450px]">
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">
              Đang tải tin nhắn...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Bắt đầu cuộc trò chuyện</p>
              <p className="text-sm mt-1">
                Gửi tin nhắn để liên hệ với {sellerName}
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isMe = message.sender_id === user?.id
              
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
                          ? message.status === 'failed'
                            ? 'bg-red-100 text-red-700 border border-red-200'
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
                        {new Date(message.created_at).toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      {isMe && message.status === 'sending' && (
                        <span className="text-xs text-muted-foreground">Đang gửi...</span>
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
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Input */}
      <div className="p-4 border-t shrink-0">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="flex-1"
            disabled={sending}
            maxLength={1000}
          />
          <Button 
            onClick={handleSendMessage}
            size="icon" 
            disabled={!newMessage.trim() || sending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {newMessage.length > 900 && (
          <p className="text-xs text-muted-foreground mt-1">
            {1000 - newMessage.length} ký tự còn lại
          </p>
        )}
      </div>
    </div>
  )

  // Inline mode - render chat directly
  if (inline) {
    if (!user) {
      return (
        <div className="text-center py-8">
          <LogIn className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium mb-2">Đăng nhập để chat</p>
          <p className="text-sm text-muted-foreground mb-4">
            Vui lòng đăng nhập để bắt đầu cuộc trò chuyện với {sellerName}
          </p>
          <Button onClick={() => setShowLoginPrompt(true)}>
            <LogIn className="h-4 w-4 mr-2" />
            Đăng nhập
          </Button>
        </div>
      )
    }

    // Start conversation on mount for inline mode
    useEffect(() => {
      if (!conversationId) {
        startConversation()
      }
    }, [])

    return <ChatContent />
  }

  // Button + Dialog mode
  return (
    <>
      {/* Chat Button */}
      <Button 
        onClick={openChat}
        className="gap-2"
        variant="outline"
      >
        <MessageCircle className="h-4 w-4" />
        Chat với {sellerName}
      </Button>

      {/* Phone Button (if available) */}
      {sellerPhone && (
        <Button 
          asChild
          variant="outline"
          className="gap-2"
        >
          <a href={`tel:${sellerPhone}`}>
            <Phone className="h-4 w-4" />
            {sellerPhone}
          </a>
        </Button>
      )}

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md p-0">
          <DialogHeader className="px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={sellerAvatar || ''} />
                  <AvatarFallback>{sellerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-sm font-medium">
                    {sellerName}
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    {propertyTitle}
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeChat}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <ChatContent />
        </DialogContent>
      </Dialog>

      {/* Login Prompt Dialog */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đăng nhập để chat</DialogTitle>
            <DialogDescription>
              Bạn cần đăng nhập để có thể trò chuyện với {sellerName}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => {
                setShowLoginPrompt(false)
                window.location.href = '/auth?mode=login'
              }}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Đăng nhập
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowLoginPrompt(false)}
            >
              Hủy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ChatWithSeller
