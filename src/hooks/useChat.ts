import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface ChatMessage {
  id: string
  conversation_id: string
  sender_id: string | null
  content: string
  message_type: 'text' | 'image' | 'file' | 'system'
  is_read: boolean
  is_from_ai: boolean
  metadata: Record<string, unknown>
  created_at: string
  // UI status
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  // Joined data
  sender?: {
    id: string
    full_name: string
    avatar_url: string | null
  }
}

export interface Conversation {
  id: string
  property_id: string | null
  participant_1: string
  participant_2: string | null
  conversation_type: 'user' | 'ai' | 'support'
  last_message_at: string
  created_at: string
  is_flagged?: boolean
  flag_reason?: string
  // Joined data
  property?: {
    id: string
    title: string
    image_url: string | null
  }
  other_user?: {
    id: string
    full_name: string
    avatar_url: string | null
    email: string
  }
  last_message?: string
  unread_count?: number
}

interface UseChatOptions {
  conversationId?: string
  propertyId?: string
  recipientId?: string
}

export function useChat(options: UseChatOptions = {}) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const [typingTimeout, setTypingTimeoutState] = useState<NodeJS.Timeout | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get or create conversation between two users
  const getOrCreateConversation = useCallback(async (
    recipientId: string,
    propertyId?: string
  ): Promise<string | null> => {
    if (!user) return null

    try {
      // First, try to find existing conversation
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('conversation_type', 'user')
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${recipientId}),and(participant_1.eq.${recipientId},participant_2.eq.${user.id})`)
        .maybeSingle()

      if (existing) {
        return existing.id
      }

      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          participant_1: user.id,
          participant_2: recipientId,
          property_id: propertyId || null,
          conversation_type: 'user'
        })
        .select('id')
        .single()

      if (createError) throw createError
      return newConv.id
    } catch (err) {
      console.error('Error getting/creating conversation:', err)
      setError('Không thể tạo cuộc hội thoại')
      return null
    }
  }, [user])

  // Load user's conversations
  const loadConversations = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select(`
          *,
          property:properties(id, title, image_url)
        `)
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('last_message_at', { ascending: false })

      if (fetchError) throw fetchError

      // Get other user info and last message for each conversation
      const conversationsWithDetails = await Promise.all(
        (data || []).map(async (conv) => {
          const otherId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1
          
          // Get other user
          let other_user = null
          if (otherId) {
            const { data: otherData } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url, email')
              .eq('id', otherId)
              .single()
            other_user = otherData
          }

          // Get last message
          const { data: lastMsg } = await supabase
            .from('chat_messages')
            .select('content')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          // Get unread count
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', user.id)

          return {
            ...conv,
            other_user,
            last_message: lastMsg?.content,
            unread_count: count || 0
          }
        })
      )

      setConversations(conversationsWithDetails)
    } catch (err) {
      console.error('Error loading conversations:', err)
      setError('Không thể tải danh sách hội thoại')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!user) return

    setLoading(true)
    try {
      // Get messages without join first
      const { data: messages, error: fetchError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError
      
      // Get unique sender IDs
      const senderIds = [...new Set(messages?.map(m => m.sender_id).filter(Boolean) || [])]
      
      // Get sender profiles
      const { data: profiles } = senderIds.length > 0 
        ? await supabase
            .from('profiles')
            .select('id,full_name,avatar_url')
            .in('id', senderIds)
        : { data: [] }
      
      // Create profiles map
      const profilesMap = (profiles || []).reduce((acc, p) => {
        acc[p.id] = p
        return acc
      }, {})
      
      // Combine messages with sender info
      const messagesWithSender = messages?.map(msg => ({
        ...msg,
        sender: msg.sender_id ? profilesMap[msg.sender_id] : null
      })) || []
      
      setMessages(messagesWithSender)

      // Mark messages as read
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false)

    } catch (err) {
      console.error('Error loading messages:', err)
      setError('Không thể tải tin nhắn')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Send a message with OPTIMISTIC UI
  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    messageType: 'text' | 'image' | 'file' = 'text'
  ) => {
    if (!user || !content.trim()) return false

    // Generate temp ID for optimistic update
    const tempId = `temp-${Date.now()}`
    const optimisticMessage: ChatMessage = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: user.id,
      content: content.trim(),
      message_type: messageType,
      is_read: false,
      is_from_ai: false,
      metadata: {},
      created_at: new Date().toISOString(),
      status: 'sending',
      sender: {
        id: user.id,
        full_name: user.user_metadata?.full_name || 'Bạn',
        avatar_url: user.user_metadata?.avatar_url || null
      }
    }

    // Add optimistic message immediately (instant feedback!)
    setMessages(prev => [...prev, optimisticMessage])
    setSending(true)

    try {
      const { data: newMessage, error: sendError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          message_type: messageType,
          is_read: false,
          is_from_ai: false
        })
        .select('*')
        .single()

      if (sendError) throw sendError
      
      // Get sender profile manually
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('id,full_name,avatar_url')
        .eq('id', user.id)
        .single()
      
      const messageWithSender = {
        ...newMessage,
        sender: senderProfile
      }

      // Update conversation's last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId)

      // Replace optimistic message with real one
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...messageWithSender, status: 'sent' as const } : msg
      ))
      return true
    } catch (err) {
      console.error('Error sending message:', err)
      // Mark message as failed
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, status: 'failed' as const } : msg
      ))
      setError('Không thể gửi tin nhắn')
      return false
    } finally {
      setSending(false)
    }
  }, [user])

  // Broadcast typing indicator
  const sendTypingIndicator = useCallback(async (conversationId: string) => {
    if (!user || !conversationId) return
    
    // Clear existing timeout
    if (typingTimeout) clearTimeout(typingTimeout)
    
    // Broadcast via realtime channel
    await supabase.channel(`typing:${conversationId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: user.id, typing: true }
    })
    
    // Auto-stop typing after 3 seconds
    const timeout = setTimeout(async () => {
      await supabase.channel(`typing:${conversationId}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: user.id, typing: false }
      })
    }, 3000)
    
    setTypingTimeoutState(timeout)
  }, [user, typingTimeout])

  // Retry failed message
  const retryMessage = useCallback(async (messageId: string) => {
    const failedMessage = messages.find(m => m.id === messageId && m.status === 'failed')
    if (!failedMessage) return false
    
    // Remove failed message
    setMessages(prev => prev.filter(m => m.id !== messageId))
    
    // Resend
    return sendMessage(failedMessage.conversation_id, failedMessage.content, failedMessage.message_type)
  }, [messages, sendMessage])

  // Subscribe to real-time updates + typing
  useEffect(() => {
    if (!user || !options.conversationId) return

    const channel: RealtimeChannel = supabase
      .channel(`chat:${options.conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${options.conversationId}`
        },
        async (payload) => {
          // Don't add if it's our own message (already added locally)
          if (payload.new.sender_id === user.id) return

          // Fetch message and sender info separately
          const { data: message } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('id', payload.new.id)
            .single()
            
          if (message && message.sender_id) {
            const { data: sender } = await supabase
              .from('profiles')
              .select('id,full_name,avatar_url')
              .eq('id', message.sender_id)
              .single()
              
            const messageWithSender = {
              ...message,
              sender: sender
            }
            
            setMessages(prev => [...prev, messageWithSender])
            
            // Mark as read immediately
            await supabase
              .from('chat_messages')
              .update({ is_read: true })
              .eq('id', message.id)
          }
        }
      )
      .subscribe()

    // Subscribe to typing indicators
    const typingChannel = supabase
      .channel(`typing:${options.conversationId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.user_id !== user.id) {
          setOtherUserTyping(payload.payload.typing)
          
          // Auto-reset after 4 seconds (in case stop event missed)
          if (payload.payload.typing) {
            setTimeout(() => setOtherUserTyping(false), 4000)
          }
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(typingChannel)
    }
  }, [user, options.conversationId])

  // Initial load
  useEffect(() => {
    if (options.conversationId) {
      loadMessages(options.conversationId)
    } else {
      loadConversations()
    }
  }, [options.conversationId, loadMessages, loadConversations])

  return {
    conversations,
    messages,
    currentConversation,
    setCurrentConversation,
    loading,
    sending,
    error,
    otherUserTyping,
    sendMessage,
    sendTypingIndicator,
    retryMessage,
    loadMessages,
    loadConversations,
    getOrCreateConversation,
    refreshMessages: () => options.conversationId && loadMessages(options.conversationId),
    refreshConversations: loadConversations
  }
}

// Hook for admin to monitor all chats
export function useAdminChat() {
  const { user, isAdmin } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedMessages, setSelectedMessages] = useState<ChatMessage[]>([])
  const [stats, setStats] = useState({
    total_conversations: 0,
    active_today: 0,
    flagged: 0,
    total_messages: 0,
    unread_messages: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load all conversations (admin only)
  const loadAllConversations = useCallback(async (filters?: {
    flaggedOnly?: boolean
    search?: string
    dateFrom?: string
    dateTo?: string
  }) => {
    if (!user || !isAdmin) return

    setLoading(true)
    try {
      let query = supabase
        .from('conversations')
        .select(`
          *,
          property:properties(id, title, location, image_url),
          participant1:profiles!participant_1(id, full_name, email, avatar_url),
          participant2:profiles!participant_2(id, full_name, email, avatar_url)
        `)
        .order('last_message_at', { ascending: false })

      if (filters?.flaggedOnly) {
        query = query.eq('is_flagged', true)
      }

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      // Get message counts and last message for each
      const withDetails = await Promise.all(
        (data || []).map(async (conv) => {
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)

          const { data: lastMsg } = await supabase
            .from('chat_messages')
            .select('content')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          return {
            ...conv,
            message_count: count || 0,
            last_message: lastMsg?.content,
            other_user: conv.participant2 || conv.participant1
          }
        })
      )

      setConversations(withDetails)
    } catch (err) {
      console.error('Error loading conversations:', err)
      setError('Không thể tải danh sách hội thoại')
    } finally {
      setLoading(false)
    }
  }, [user, isAdmin])

  // Load messages for admin view
  const loadConversationMessages = useCallback(async (conversationId: string) => {
    if (!user || !isAdmin) return

    try {
      const { data, error: fetchError } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles!sender_id(id, full_name, avatar_url, email)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError
      setSelectedMessages(data || [])
    } catch (err) {
      console.error('Error loading messages:', err)
    }
  }, [user, isAdmin])

  // Flag/unflag conversation
  const flagConversation = useCallback(async (
    conversationId: string,
    flagged: boolean,
    reason?: string
  ) => {
    if (!user || !isAdmin) return false

    try {
      const { error: updateError } = await supabase
        .from('conversations')
        .update({
          is_flagged: flagged,
          flag_reason: flagged ? reason : null,
          flagged_at: flagged ? new Date().toISOString() : null,
          flagged_by: flagged ? user.id : null
        })
        .eq('id', conversationId)

      if (updateError) throw updateError

      // Update local state
      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId
            ? { ...c, is_flagged: flagged, flag_reason: reason }
            : c
        )
      )

      return true
    } catch (err) {
      console.error('Error flagging conversation:', err)
      return false
    }
  }, [user, isAdmin])

  // Load stats
  const loadStats = useCallback(async () => {
    if (!user || !isAdmin) return

    try {
      // Get total conversations
      const { count: totalConv } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })

      // Get active today
      const { count: activeToday } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .gte('last_message_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      // Get flagged
      const { count: flagged } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('is_flagged', true)

      // Get total messages
      const { count: totalMsg } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })

      // Get unread
      const { count: unread } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)

      setStats({
        total_conversations: totalConv || 0,
        active_today: activeToday || 0,
        flagged: flagged || 0,
        total_messages: totalMsg || 0,
        unread_messages: unread || 0
      })
    } catch (err) {
      console.error('Error loading stats:', err)
    }
  }, [user, isAdmin])

  useEffect(() => {
    if (isAdmin) {
      loadAllConversations()
      loadStats()
    }
  }, [isAdmin, loadAllConversations, loadStats])

  return {
    conversations,
    selectedMessages,
    stats,
    loading,
    error,
    loadAllConversations,
    loadConversationMessages,
    flagConversation,
    loadStats,
    refresh: () => {
      loadAllConversations()
      loadStats()
    }
  }
}

export default useChat
