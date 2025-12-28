import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { SEO } from '@/components/SEO'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { useChat, Conversation, ChatMessage } from '@/hooks/useChat'
import { cn } from '@/lib/utils'
import { 
  MessageSquare, 
  Send, 
  ArrowLeft,
  Search,
  Phone,
  Home,
  Clock,
  CheckCheck,
  Loader2
} from 'lucide-react'

export default function Messages() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    searchParams.get('conversation') || null
  )
  const [newMessage, setNewMessage] = useState('')

  const {
    conversations,
    messages,
    loading,
    sending,
    loadConversations,
    loadMessages,
    sendMessage
  } = useChat({ conversationId: selectedConversationId || undefined })

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user, loadConversations])

  // Load messages when conversation selected
  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId)
    }
  }, [selectedConversationId, loadMessages])

  // Filter conversations by search
  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      conv.other_user?.full_name?.toLowerCase().includes(searchLower) ||
      conv.property?.title?.toLowerCase().includes(searchLower)
    )
  })

  const selectedConversation = conversations.find(c => c.id === selectedConversationId)

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId) return

    const success = await sendMessage(selectedConversationId, newMessage)
    if (success) {
      setNewMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Hôm qua'
    } else if (diffDays < 7) {
      return d.toLocaleDateString('vi-VN', { weekday: 'short' })
    } else {
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <SEO title="Tin nhắn" />
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Đăng nhập để xem tin nhắn</h2>
              <p className="text-muted-foreground mb-4">
                Bạn cần đăng nhập để xem và gửi tin nhắn
              </p>
              <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Đăng nhập
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO title="Tin nhắn | VungTauLand" />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Tin nhắn</h1>
            <p className="text-muted-foreground">
              {conversations.length} cuộc hội thoại
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)] min-h-[500px]">
          {/* Conversation List */}
          <Card className="lg:col-span-1 flex flex-col">
            <CardHeader className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm hội thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full">
                {loading && conversations.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <MessageSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="font-medium">Chưa có tin nhắn</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Bắt đầu hội thoại từ trang chi tiết bất động sản
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredConversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversationId(conv.id)}
                        className={cn(
                          'w-full p-4 text-left hover:bg-muted/50 transition-colors',
                          selectedConversationId === conv.id && 'bg-muted'
                        )}
                      >
                        <div className="flex gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={conv.other_user?.avatar_url || ''} />
                            <AvatarFallback>
                              {(conv.other_user?.full_name || 'U').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium truncate">
                                {conv.other_user?.full_name || 'Người dùng'}
                              </span>
                              <span className="text-xs text-muted-foreground shrink-0">
                                {formatTime(conv.last_message_at)}
                              </span>
                            </div>
                            {conv.property && (
                              <p className="text-xs text-primary truncate mt-0.5">
                                <Home className="inline h-3 w-3 mr-1" />
                                {conv.property.title}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {conv.last_message || 'Chưa có tin nhắn'}
                            </p>
                            {conv.unread_count > 0 && (
                              <Badge className="mt-1" variant="default">
                                {conv.unread_count} mới
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 flex flex-col">
            {!selectedConversation ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <h3 className="text-lg font-medium">Chọn một cuộc hội thoại</h3>
                  <p className="text-muted-foreground mt-1">
                    Chọn từ danh sách bên trái để xem tin nhắn
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b shrink-0">
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="lg:hidden"
                      onClick={() => setSelectedConversationId(null)}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConversation.other_user?.avatar_url || ''} />
                      <AvatarFallback>
                        {(selectedConversation.other_user?.full_name || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {selectedConversation.other_user?.full_name || 'Người dùng'}
                      </CardTitle>
                      {selectedConversation.property && (
                        <p className="text-xs text-muted-foreground truncate">
                          {selectedConversation.property.title}
                        </p>
                      )}
                    </div>
                    {selectedConversation.other_user?.email && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          // Navigate to property if available
                          if (selectedConversation.property?.id) {
                            navigate(`/property/${selectedConversation.property.id}`)
                          }
                        }}
                      >
                        <Home className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-0 overflow-hidden">
                  <ScrollArea className="h-full p-4">
                    {loading ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="font-medium">Bắt đầu cuộc trò chuyện</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Gửi tin nhắn đầu tiên
                        </p>
                      </div>
                    ) : (
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
                                  <AvatarImage src={message.sender?.avatar_url || selectedConversation.other_user?.avatar_url || ''} />
                                  <AvatarFallback>
                                    {(message.sender?.full_name || selectedConversation.other_user?.full_name || 'U').charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div className={cn(
                                'flex flex-col max-w-[70%]',
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
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(message.created_at).toLocaleTimeString('vi-VN', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                  {isMe && message.is_read && (
                                    <CheckCheck className="h-3 w-3 text-blue-500" />
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>

                {/* Input */}
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
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
