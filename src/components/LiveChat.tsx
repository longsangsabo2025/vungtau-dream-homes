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
  Video,
  MoreVertical
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface Message {
  id: string
  text: string
  sender: {
    id: string
    name: string
    avatar?: string
    isAgent: boolean
  }
  timestamp: Date
  isRead: boolean
}

interface LiveChatProps {
  propertyId?: string
  recipientId?: string
  recipientName?: string
  className?: string
}

const LiveChat = ({ propertyId, recipientId, recipientName, className = '' }: LiveChatProps) => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load chat history from database
  useEffect(() => {
    if (!isOpen || !user || historyLoaded) return

    const loadChatHistory = async () => {
      try {
        // Load messages from database
        const { data: dbMessages, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', user.id)
          .eq('message_type', 'live_chat')
          .order('created_at', { ascending: true })
          .limit(50)

        if (error) {
          console.error('Error loading chat history:', error)
        } else if (dbMessages && dbMessages.length > 0) {
          const loadedMessages: Message[] = dbMessages.map(msg => ({
            id: msg.id,
            text: msg.content,
            sender: {
              id: msg.sender_role === 'user' ? user.id : 'agent',
              name: msg.sender_role === 'user' ? (user.email || 'Bạn') : (recipientName || 'Tư vấn viên'),
              isAgent: msg.sender_role !== 'user',
              avatar: msg.sender_role !== 'user' ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' : undefined
            },
            timestamp: new Date(msg.created_at),
            isRead: msg.is_read
          }))
          setMessages(loadedMessages)
          setHistoryLoaded(true)
          return
        }

        // Show welcome message if no history
        setMessages([
          {
            id: '1',
            text: `Xin chào! Tôi là ${recipientName || 'tư vấn viên'}. Tôi có thể giúp gì cho bạn?`,
            sender: {
              id: 'agent1',
              name: recipientName || 'Tư vấn viên',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
              isAgent: true
            },
            timestamp: new Date(),
            isRead: true
          }
        ])
        setHistoryLoaded(true)
      } catch (error) {
        console.error('Error loading chat history:', error)
        // Show default welcome message
        setMessages([
          {
            id: '1',
            text: `Xin chào! Tôi là ${recipientName || 'tư vấn viên'}. Tôi có thể giúp gì cho bạn?`,
            sender: {
              id: 'agent1',
              name: recipientName || 'Tư vấn viên',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
              isAgent: true
            },
            timestamp: new Date(),
            isRead: true
          }
        ])
        setHistoryLoaded(true)
      }
    }

    loadChatHistory()
  }, [isOpen, user, recipientName, historyLoaded])

  // Save message to database
  const saveMessageToDB = async (content: string, senderRole: 'user' | 'agent') => {
    if (!user) return

    try {
      await supabase.from('chat_messages').insert({
        user_id: user.id,
        property_id: propertyId || null,
        recipient_id: recipientId || null,
        content,
        sender_role: senderRole,
        message_type: 'live_chat',
        is_read: false,
        metadata: {}
      })
    } catch (error) {
      console.error('Error saving message:', error)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: {
        id: user.id,
        name: user.email,
        isAgent: false
      },
      timestamp: new Date(),
      isRead: false
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // Save user message to database
    saveMessageToDB(newMessage, 'user')

    // Simulate agent response (in production, this would be a real-time subscription)
    setTimeout(() => {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        const agentResponse = 'Cảm ơn bạn! Tôi sẽ phản hồi sớm nhất có thể.'
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: agentResponse,
          sender: {
            id: 'agent1',
            name: recipientName || 'Tư vấn viên',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
            isAgent: true
          },
          timestamp: new Date(),
          isRead: false
        }
        setMessages(prev => [...prev, agentMessage])
        // Save agent response to database
        saveMessageToDB(agentResponse, 'agent')
      }, 1500)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const markAsRead = () => {
    setUnreadCount(0)
    setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })))
  }

  if (!user) return null

  return (
    <>
      {/* Floating Chat Button - positioned above AI Chatbot */}
      <div className={`fixed bottom-24 right-6 z-40 ${className}`}>
        <Button
          onClick={() => {
            setIsOpen(true)
            markAsRead()
          }}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-blue-600 hover:bg-blue-700"
          aria-label="Chat với chủ nhà"
          title="Chat với chủ nhà"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center p-0"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md h-[600px] p-0 gap-0">
          {!isMinimized && (
            <>
              {/* Chat Header */}
              <DialogHeader className="p-4 pb-2 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" />
                      <AvatarFallback>TV</AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle className="text-sm font-semibold">
                        {recipientName || 'Tư vấn viên'}
                      </DialogTitle>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <DialogDescription className="text-xs">
                          {isOnline ? 'Đang online' : 'Offline'}
                        </DialogDescription>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Video className="h-4 w-4" />
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
                        <DropdownMenuItem onClick={() => toast.success('Đã chặn người dùng')}>
                          Chặn
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success('Đã báo cáo')}>
                          Báo cáo
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </DialogHeader>

              {/* Messages Area */}
              <div className="flex-1 flex flex-col min-h-0">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.sender.id === user?.id ? 'flex-row-reverse' : ''
                        }`}
                      >
                        {message.sender.id !== user?.id && (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src={message.sender.avatar} />
                            <AvatarFallback>
                              {message.sender.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`flex flex-col max-w-[80%] ${
                          message.sender.id === user?.id ? 'items-end' : 'items-start'
                        }`}>
                          <div
                            className={`px-4 py-2 rounded-2xl max-w-full break-words ${
                              message.sender.id === user?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1">
                            {message.timestamp.toLocaleTimeString('vi-VN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" />
                          <AvatarFallback>TV</AvatarFallback>
                        </Avatar>
                        <div className="bg-muted px-4 py-2 rounded-2xl">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      size="icon"
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Minimized State */}
          {isMinimized && (
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" />
                  <AvatarFallback>TV</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {recipientName || 'Tư vấn viên'}
                </span>
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