import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2,
  Minimize2,
  Maximize2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Dify.ai Configuration
const DIFY_CONFIG = {
  // Thay bằng API key và App ID từ Dify.ai
  apiBase: import.meta.env.VITE_DIFY_API_BASE || 'https://api.dify.ai/v1',
  apiKey: import.meta.env.VITE_DIFY_API_KEY || '',
  // Fallback to local AI responses if no API key
  useLocalFallback: true,
};

// Local AI responses for demo/fallback
const LOCAL_RESPONSES: Record<string, string[]> = {
  greeting: [
    'Xin chào! 👋 Tôi là trợ lý AI của VungTauLand. Tôi có thể giúp bạn tìm kiếm bất động sản tại Vũng Tàu. Bạn đang tìm kiếm loại hình nào?',
    'Chào bạn! 🏠 Rất vui được hỗ trợ bạn tìm nhà tại Vũng Tàu. Bạn có thể cho tôi biết ngân sách và khu vực mong muốn không?',
  ],
  price: [
    'Về giá bất động sản tại Vũng Tàu:\n\n🏢 **Căn hộ**: 1.5 - 5 tỷ\n🏠 **Nhà phố**: 3 - 15 tỷ\n🏡 **Villa**: 8 - 50 tỷ\n🌴 **Đất nền**: 15 - 100 triệu/m²\n\nBạn quan tâm loại hình nào?',
    'Giá BĐS Vũng Tàu đang tăng trưởng tốt! Tùy khu vực:\n\n📍 Thùy Vân: Cao cấp\n📍 Bãi Sau: Trung - cao\n📍 Bãi Trước: Trung bình\n\nBạn muốn xem tin ở khu vực nào?',
  ],
  location: [
    'Các khu vực hot nhất tại Vũng Tàu:\n\n⭐ **Thùy Vân** - View biển, giá cao\n⭐ **Bãi Sau** - Sầm uất, thuận tiện\n⭐ **Long Hải** - Yên tĩnh, giá tốt\n⭐ **Hồ Tràm** - Resort, nghỉ dưỡng\n\nBạn thích khu vực nào?',
  ],
  search: [
    'Tôi sẽ giúp bạn tìm kiếm! Để có kết quả tốt nhất, hãy cho tôi biết:\n\n1️⃣ Loại BĐS (căn hộ, nhà, đất...)\n2️⃣ Ngân sách\n3️⃣ Khu vực ưa thích\n4️⃣ Số phòng ngủ cần thiết',
    'Bạn có thể truy cập trang **Mua bán** hoặc **Cho thuê** để xem tất cả tin đăng, hoặc cho tôi biết tiêu chí cụ thể để tôi gợi ý phù hợp!',
  ],
  contact: [
    'Để được tư vấn trực tiếp:\n\n📞 **Hotline**: 0909 123 456\n📧 **Email**: contact@vungtauland.store\n📍 **VP**: 123 Thùy Vân, Vũng Tàu\n\nHoặc để lại SĐT, nhân viên sẽ gọi lại trong 5 phút!',
  ],
  default: [
    'Cảm ơn câu hỏi của bạn! Tôi có thể hỗ trợ:\n\n🔍 Tìm kiếm BĐS\n💰 Tư vấn giá\n📍 Thông tin khu vực\n📞 Kết nối với môi giới\n\nBạn cần hỗ trợ gì?',
    'Tôi hiểu! Để tư vấn chi tiết hơn, bạn có thể:\n\n1. Truy cập trang **Liên hệ**\n2. Gọi hotline 0909 123 456\n3. Hoặc mô tả chi tiết hơn nhu cầu của bạn!',
  ],
};

function getLocalResponse(message: string): string {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('chào') || lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
    return LOCAL_RESPONSES.greeting[Math.floor(Math.random() * LOCAL_RESPONSES.greeting.length)];
  }
  if (lowerMsg.includes('giá') || lowerMsg.includes('bao nhiêu') || lowerMsg.includes('tỷ') || lowerMsg.includes('triệu')) {
    return LOCAL_RESPONSES.price[Math.floor(Math.random() * LOCAL_RESPONSES.price.length)];
  }
  if (lowerMsg.includes('khu vực') || lowerMsg.includes('địa điểm') || lowerMsg.includes('ở đâu') || lowerMsg.includes('vị trí')) {
    return LOCAL_RESPONSES.location[Math.floor(Math.random() * LOCAL_RESPONSES.location.length)];
  }
  if (lowerMsg.includes('tìm') || lowerMsg.includes('search') || lowerMsg.includes('muốn mua') || lowerMsg.includes('cần thuê')) {
    return LOCAL_RESPONSES.search[Math.floor(Math.random() * LOCAL_RESPONSES.search.length)];
  }
  if (lowerMsg.includes('liên hệ') || lowerMsg.includes('hotline') || lowerMsg.includes('điện thoại') || lowerMsg.includes('gọi')) {
    return LOCAL_RESPONSES.contact[0];
  }
  
  return LOCAL_RESPONSES.default[Math.floor(Math.random() * LOCAL_RESPONSES.default.length)];
}

const WELCOME_MESSAGE: Message = {
  id: '1',
  role: 'assistant',
  content: 'Xin chào! 👋 Tôi là **VungTau AI** - trợ lý thông minh của VungTauLand. Tôi có thể giúp bạn:\n\n🏠 Tìm kiếm bất động sản\n💰 Tư vấn giá cả\n📍 Thông tin khu vực\n\nBạn cần hỗ trợ gì hôm nay?',
  timestamp: new Date(),
};

export default function AIChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history from database
  useEffect(() => {
    if (!user || historyLoaded) return;
    
    const loadChatHistory = async () => {
      try {
        const { data: chatMessages, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', user.id)
          .eq('message_type', 'ai_chat')
          .order('created_at', { ascending: true })
          .limit(50);

        if (error) {
          console.error('Error loading chat history:', error);
          return;
        }

        if (chatMessages && chatMessages.length > 0) {
          const loadedMessages: Message[] = chatMessages.map(msg => ({
            id: msg.id,
            role: msg.sender_role === 'assistant' ? 'assistant' : 'user',
            content: msg.content,
            timestamp: new Date(msg.created_at),
          }));
          setMessages([WELCOME_MESSAGE, ...loadedMessages]);
        }
        setHistoryLoaded(true);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    loadChatHistory();
  }, [user, historyLoaded]);

  // Save message to database
  const saveMessage = async (content: string, role: 'user' | 'assistant') => {
    if (!user) return;

    try {
      await supabase.from('chat_messages').insert({
        user_id: user.id,
        content,
        sender_role: role,
        message_type: 'ai_chat',
        is_read: true,
        metadata: {}
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const sendToDify = async (message: string): Promise<string> => {
    if (!DIFY_CONFIG.apiKey) {
      // Fallback to local responses
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));
      return getLocalResponse(message);
    }

    try {
      const response = await fetch(`${DIFY_CONFIG.apiBase}/chat-messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DIFY_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {},
          query: message,
          response_mode: 'blocking',
          user: 'vungtauland-user',
        }),
      });

      if (!response.ok) {
        throw new Error('API Error');
      }

      const data = await response.json();
      return data.answer || getLocalResponse(message);
    } catch (error) {
      console.error('Dify API error:', error);
      return getLocalResponse(message);
    }
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Save user message to database
    saveMessage(userMessage.content, 'user');

    try {
      const response = await sendToDify(userMessage.content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Save AI response to database
      saveMessage(response, 'assistant');
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ hotline 0909 123 456.';
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
      }]);
      saveMessage(errorMessage, 'assistant');
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, user]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick action buttons
  const quickActions = [
    { label: '🏠 Tìm nhà', message: 'Tôi muốn tìm nhà ở Vũng Tàu' },
    { label: '💰 Giá BĐS', message: 'Giá bất động sản Vũng Tàu hiện tại?' },
    { label: '📞 Liên hệ', message: 'Tôi muốn liên hệ tư vấn' },
  ];

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-50 gradient-primary hover:scale-110 transition-transform"
        size="icon"
      >
        <div className="relative">
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse" />
        </div>
      </Button>
    );
  }

  return (
    <Card className={cn(
      "fixed bottom-6 right-6 z-50 shadow-2xl border-0 overflow-hidden transition-all duration-300",
      isMinimized 
        ? "w-72 h-14" 
        : "w-[380px] h-[600px] max-h-[80vh]"
    )}>
      {/* Header */}
      <div className="gradient-primary text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-white/30">
              <AvatarImage src="/logo.png" />
              <AvatarFallback className="bg-white/20 text-white">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 rounded-full border-2 border-white" />
          </div>
          {!isMinimized && (
            <div>
              <h3 className="font-semibold flex items-center gap-1">
                VungTau AI
                <Sparkles className="h-4 w-4 text-yellow-300" />
              </h3>
              <p className="text-xs text-white/80">Trợ lý bất động sản</p>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 h-[420px] p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                      message.role === 'user'
                        ? "bg-primary text-white rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    )}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {message.content.split('**').map((part, i) => 
                        i % 2 === 0 ? part : <strong key={i}>{part}</strong>
                      )}
                    </div>
                    <div className={cn(
                      "text-[10px] mt-1",
                      message.role === 'user' ? "text-white/70" : "text-muted-foreground"
                    )}>
                      {message.timestamp.toLocaleTimeString('vi-VN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-secondary">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => {
                    setInput(action.message);
                    setTimeout(() => handleSend(), 100);
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || isLoading}
                size="icon"
                className="gradient-primary"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Powered by VungTauLand AI 🏠
            </p>
          </div>
        </>
      )}
    </Card>
  );
}
