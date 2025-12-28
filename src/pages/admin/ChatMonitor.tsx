import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { useAdminChat, Conversation, ChatMessage } from '@/hooks/useChat'
import { 
  MessageSquare, 
  Search, 
  Flag, 
  Eye,
  MoreVertical,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  Building2,
  RefreshCw,
  Filter,
  Download,
  X
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const ChatMonitor = () => {
  const {
    conversations,
    selectedMessages,
    stats,
    loading,
    loadAllConversations,
    loadConversationMessages,
    flagConversation,
    refresh
  } = useAdminChat()

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false)
  const [flagDialogOpen, setFlagDialogOpen] = useState(false)
  const [flagReason, setFlagReason] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    // Search filter
    if (searchQuery) {
      const search = searchQuery.toLowerCase()
      const matchesUser = 
        conv.other_user?.full_name?.toLowerCase().includes(search) ||
        conv.other_user?.email?.toLowerCase().includes(search)
      const matchesProperty = conv.property?.title?.toLowerCase().includes(search)
      const matchesMessage = conv.last_message?.toLowerCase().includes(search)
      
      if (!matchesUser && !matchesProperty && !matchesMessage) return false
    }

    // Tab filter
    if (activeTab === 'flagged' && !conv.is_flagged) return false
    if (activeTab === 'today') {
      const lastMsg = new Date(conv.last_message_at)
      const today = new Date()
      if (lastMsg.toDateString() !== today.toDateString()) return false
    }

    return true
  })

  const handleSelectConversation = async (conv: Conversation) => {
    setSelectedConversation(conv)
    await loadConversationMessages(conv.id)
  }

  const handleFlag = async () => {
    if (!selectedConversation) return

    const success = await flagConversation(
      selectedConversation.id,
      !selectedConversation.is_flagged,
      flagReason
    )

    if (success) {
      toast.success(
        selectedConversation.is_flagged 
          ? 'Đã bỏ đánh dấu hội thoại' 
          : 'Đã đánh dấu hội thoại cần xem xét'
      )
      setSelectedConversation(prev => prev ? { ...prev, is_flagged: !prev.is_flagged } : null)
    }
    setFlagDialogOpen(false)
    setFlagReason('')
  }

  const exportConversation = () => {
    if (!selectedConversation || selectedMessages.length === 0) return

    const content = selectedMessages.map(msg => 
      `[${format(new Date(msg.created_at), 'dd/MM/yyyy HH:mm')}] ${msg.sender?.full_name || 'Unknown'}: ${msg.content}`
    ).join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conversation-${selectedConversation.id.slice(0, 8)}.txt`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Đã xuất nội dung hội thoại')
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Giám sát hội thoại</h1>
            <p className="text-muted-foreground">
              Theo dõi tất cả cuộc trò chuyện giữa người mua và người bán
            </p>
          </div>
          <Button onClick={refresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_conversations}</p>
                  <p className="text-sm text-muted-foreground">Tổng hội thoại</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active_today}</p>
                  <p className="text-sm text-muted-foreground">Hoạt động hôm nay</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Flag className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.flagged}</p>
                  <p className="text-sm text-muted-foreground">Cần xem xét</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_messages}</p>
                  <p className="text-sm text-muted-foreground">Tổng tin nhắn</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.unread_messages}</p>
                  <p className="text-sm text-muted-foreground">Chưa đọc</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Danh sách hội thoại</CardTitle>
                <Badge variant="secondary">{filteredConversations.length}</Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                  <TabsTrigger 
                    value="all" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                  >
                    Tất cả
                  </TabsTrigger>
                  <TabsTrigger 
                    value="today"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                  >
                    Hôm nay
                  </TabsTrigger>
                  <TabsTrigger 
                    value="flagged"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                  >
                    Đánh dấu
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <ScrollArea className="h-[500px]">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Đang tải...
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Không có hội thoại nào
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredConversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv)}
                        className={cn(
                          'p-4 cursor-pointer hover:bg-muted/50 transition-colors',
                          selectedConversation?.id === conv.id && 'bg-muted',
                          conv.is_flagged && 'border-l-4 border-l-orange-500'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conv.other_user?.avatar_url || ''} />
                            <AvatarFallback>
                              {conv.other_user?.full_name?.charAt(0) || 'U'}
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
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                <Building2 className="h-3 w-3" />
                                <span className="truncate">{conv.property.title}</span>
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {conv.last_message || 'Chưa có tin nhắn'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {conv.is_flagged && (
                                <Badge variant="destructive" className="text-xs">
                                  <Flag className="h-3 w-3 mr-1" />
                                  Đã đánh dấu
                                </Badge>
                              )}
                              {conv.unread_count > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {conv.unread_count} chưa đọc
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Message View */}
          <Card className="lg:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={selectedConversation.other_user?.avatar_url || ''} />
                        <AvatarFallback>
                          {selectedConversation.other_user?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {selectedConversation.other_user?.full_name || 'Người dùng'}
                        </CardTitle>
                        <CardDescription>
                          {selectedConversation.other_user?.email}
                        </CardDescription>
                      </div>
                      {selectedConversation.is_flagged && (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Đã đánh dấu
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={exportConversation}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Xuất
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setFlagDialogOpen(true)}>
                            <Flag className="h-4 w-4 mr-2" />
                            {selectedConversation.is_flagged ? 'Bỏ đánh dấu' : 'Đánh dấu cần xem xét'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setSelectedConversation(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Property info if available */}
                  {selectedConversation.property && (
                    <div className="mt-3 p-3 bg-muted rounded-lg flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{selectedConversation.property.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Cuộc hội thoại liên quan đến tin đăng này
                        </p>
                      </div>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="p-0">
                  <ScrollArea className="h-[400px] p-4">
                    {selectedMessages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        Chưa có tin nhắn nào
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedMessages.map((msg, index) => {
                          const isFirst = index === 0 || 
                            selectedMessages[index - 1].sender_id !== msg.sender_id
                          
                          return (
                            <div key={msg.id} className="flex gap-3">
                              {isFirst ? (
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={msg.sender?.avatar_url || ''} />
                                  <AvatarFallback>
                                    {msg.sender?.full_name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className="w-8" />
                              )}
                              <div className="flex-1">
                                {isFirst && (
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">
                                      {msg.sender?.full_name || 'Người dùng'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {format(new Date(msg.created_at), 'HH:mm dd/MM/yyyy', { locale: vi })}
                                    </span>
                                    {msg.is_from_ai && (
                                      <Badge variant="secondary" className="text-xs">AI</Badge>
                                    )}
                                  </div>
                                )}
                                <div className="bg-muted p-3 rounded-lg max-w-[80%] inline-block">
                                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </ScrollArea>
                  
                  {/* Admin note */}
                  <div className="p-4 border-t bg-muted/30">
                    <p className="text-xs text-muted-foreground text-center">
                      <Eye className="h-3 w-3 inline mr-1" />
                      Bạn đang xem nội dung hội thoại ở chế độ giám sát (chỉ đọc)
                    </p>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="h-[500px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chọn một hội thoại để xem nội dung</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Flag Dialog */}
      <Dialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedConversation?.is_flagged ? 'Bỏ đánh dấu hội thoại' : 'Đánh dấu hội thoại'}
            </DialogTitle>
            <DialogDescription>
              {selectedConversation?.is_flagged 
                ? 'Xác nhận bỏ đánh dấu hội thoại này?' 
                : 'Nhập lý do đánh dấu hội thoại này để xem xét sau.'}
            </DialogDescription>
          </DialogHeader>
          {!selectedConversation?.is_flagged && (
            <Textarea
              placeholder="Lý do đánh dấu (tùy chọn)..."
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setFlagDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleFlag}>
              {selectedConversation?.is_flagged ? 'Bỏ đánh dấu' : 'Đánh dấu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}

export default ChatMonitor
