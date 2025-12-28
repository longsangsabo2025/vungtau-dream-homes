import { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { ScrollArea } from './ui/scroll-area'
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Maximize2,
  Phone,
  MoreVertical,
  ArrowLeft
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useAuth } from '@/contexts/AuthContext'
import { useChat, Conversation } from '@/hooks/useChat'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

interface LiveChatProps {
  propertyId?: string
  recipientId?: string
  recipientName?: string
  recipientAvatar?: string
  className?: string
}

const LiveChat = ({ 
  propertyId, 
  recipientId, 
  recipientName,
  recipientAvatar,
  className = '' 
}: LiveChatProps) => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [showConversationList, setShowConversationList] = useState(!recipientId)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    conversations,
    messages,
    loading,
    sending,
    sendMessage,
    loadMessages,
    loadConversations,
    getOrCreateConversation
  } = useChat({ conversationId: activeConversationId || undefined })

  // Calculate total unread
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Start conversation with specific recipient
  const startConversation = async () => {
    if (!recipientId || !user) return

    const conversationId = await getOrCreateConversation(recipientId, propertyId)
    if (conversationId) {
      setActiveConversationId(conversationId)
      setShowConversationList(false)
      await loadMessages(conversationId)
    }
  }

  // Open existing conversation
  const openConversation = async (conv: Conversation) => {
    setActiveConversationId(conv.id)
    setShowConversationList(false)
    await loadMessages(conv.id)
  }

  // Handle send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversationId) return

    const success = await sendMessage(activeConversationId, newMessage)
    if (success) {
      setNewMessage('')
    } else {
      toast.error('Không thể gửi tin nhắn')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Handle open chat
  const handleOpenChat = () => {
    setIsOpen(true)
    if (recipientId && !activeConversationId) {
      startConversation()
    } else {
      loadConversations()
    }
  }

  // Go back to conversation list
  const goBack = () => {
    setActiveConversationId(null)
    setShowConversationList(true)
    loadConversations()
  }

  if (!user) return null

  // Find current conversation's other user
  const currentConv = conversations.find(c => c.id === activeConversationId)
  const chatPartner = currentConv?.other_user || {
    full_name: recipientName || 'Người dùng',
    avatar_url: recipientAvatar
  }

  return (
    <>
      {/* Floating Chat Button */}
      <div className={`fixed bottom-24 right-6 z-40 ${className}`}>
        <Button
          onClick={handleOpenChat}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-blue-600 hover:bg-blue-700"
          aria-label="Chat"
          title="Nhắn tin"
        >
          <MessageCircle className="h-6 w-6" />
          {totalUnread > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center p-0"
            >
              {totalUnread > 9 ? '9+' : totalUnread}
            </Badge>
          )}
        </Button>
      </div>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md h-[600px] p-0 gap-0 flex flex-col">
          {!isMinimized ? (
            <>
              {/* Chat Header */}
              <DialogHeader className="p-4 pb-2 border-b shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {!showConversationList && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={goBack}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    )}
                    {showConversationList ? (
                      <div>
                        <DialogTitle className="text-sm font-semibold">
                          Tin nhắn
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                          {conversations.length} cuộc hội thoại
                        </DialogDescription>
                      </div>
                    ) : (
                      <>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={chatPartner.avatar_url || ''} />
                          <AvatarFallback>
                            {(chatPartner.full_name || 'U').charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <DialogTitle className="text-sm font-semibold">
                            {chatPartner.full_name}
                          </DialogTitle>
                          <DialogDescription className="text-xs">
                            {currentConv?.property?.title || 'Trò chuyện'}
                          </DialogDescription>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {!showConversationList && (
                      <>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsMinimized(true)}>
                              <Minimize2 className="mr-2 h-4 w-4" />
                              Thu nhỏ
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info('Tính năng đang phát triển')}>
                              Báo cáo
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                </div>
              </DialogHeader>

              {/* Content Area */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {showConversationList ? (
                  /* Conversation List */
                  <ScrollArea className="flex-1">
                    {loading ? (
                      <div className="p-4 text-center text-muted-foreground">
                        Đang tải...
                      </div>
                    ) : conversations.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Chưa có cuộc hội thoại nào</p>
                        <p className="text-sm mt-2">
                          Bắt đầu bằng cách liên hệ với người đăng tin
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {conversations.map((conv) => (
                          <div
                            key={conv.id}
                            onClick={() => openConversation(conv)}
                            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={conv.other_user?.avatar_url || ''} />
                                <AvatarFallback>
                                  {(conv.other_user?.full_name || 'U').charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium truncate">
                                    {conv.other_user?.full_name || conv.other_user?.email || 'Người dùng'}
                                  </p>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(conv.last_message_at), { 
                                      addSuffix: true,
                                      locale: vi 
                                    })}
                                  </span>
                                </div>
                                {conv.property && (
                                  <p className="text-xs text-primary truncate">
                                    {conv.property.title}
                                  </p>
                                )}
                                <p className="text-sm text-muted-foreground truncate">
                                  {conv.last_message || 'Chưa có tin nhắn'}
                                </p>
                              </div>
                              {(conv.unread_count || 0) > 0 && (
                                <Badge variant="destructive" className="ml-2">
                                  {conv.unread_count}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                ) : (
                  /* Messages View */
                  <>
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages.map((message) => {
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
                                  <AvatarImage src={message.sender?.avatar_url || ''} />
                                  <AvatarFallback>
                                    {(message.sender?.full_name || 'U').charAt(0)}
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
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-muted'
                                  )}
                                >
                                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                </div>
                                <span className="text-xs text-muted-foreground mt-1">
                                  {new Date(message.created_at).toLocaleTimeString('vi-VN', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="p-4 border-t shrink-0">
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Nhập tin nhắn..."
                          className="flex-1"
                          disabled={sending}
                        />
                        <Button 
                          onClick={handleSendMessage}
                          size="icon"
                          disabled={!newMessage.trim() || sending}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            /* Minimized State */
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Tin nhắn
                </span>
                {totalUnread > 0 && (
                  <Badge variant="destructive">{totalUnread}</Badge>
                )}
              </div>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setIsMinimized(false)}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default LiveChat
