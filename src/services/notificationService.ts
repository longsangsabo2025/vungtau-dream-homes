/**
 * Push Notification Service for VungTau Dream Homes
 * Handles browser notifications and PWA push notifications
 */

interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
  actions?: NotificationAction[]
  requireInteraction?: boolean
}

class NotificationService {
  private static instance: NotificationService
  private registration: ServiceWorkerRegistration | null = null

  private constructor() {
    this.init()
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  private async init() {
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.ready
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }
  }

  /**
   * Request notification permission from user
   */
  public async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return 'denied'
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission
    }

    return Notification.permission
  }

  /**
   * Show a local notification
   */
  public async showNotification(options: NotificationOptions): Promise<void> {
    const permission = await this.requestPermission()
    
    if (permission !== 'granted') {
      console.warn('Notification permission not granted')
      return
    }

    const notificationOptions: NotificationOptions = {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      ...options,
      data: {
        timestamp: Date.now(),
        url: window.location.origin,
        ...options.data
      }
    }

    if (this.registration && 'showNotification' in this.registration) {
      // Use service worker notification for PWA
      await this.registration.showNotification(options.title, notificationOptions)
    } else {
      // Fallback to browser notification
      new Notification(options.title, notificationOptions)
    }
  }

  /**
   * Show notification for new message
   */
  public async notifyNewMessage(senderName: string, message: string, chatId?: string) {
    await this.showNotification({
      title: `Tin nhắn mới từ ${senderName}`,
      body: message,
      tag: `message-${chatId || 'default'}`,
      requireInteraction: true,
      actions: [
        {
          action: 'reply',
          title: 'Trả lời'
        },
        {
          action: 'mark-read',
          title: 'Đánh dấu đã đọc'
        }
      ],
      data: {
        type: 'message',
        chatId,
        senderName
      }
    })
  }

  /**
   * Show notification for property interest
   */
  public async notifyPropertyInquiry(propertyTitle: string, inquirerName: string) {
    await this.showNotification({
      title: 'Có người quan tâm BĐS của bạn',
      body: `${inquirerName} quan tâm đến "${propertyTitle}"`,
      tag: 'property-inquiry',
      actions: [
        {
          action: 'view-inquiry',
          title: 'Xem chi tiết'
        },
        {
          action: 'contact',
          title: 'Liên hệ ngay'
        }
      ],
      data: {
        type: 'property-inquiry',
        propertyTitle,
        inquirerName
      }
    })
  }

  /**
   * Show notification for price alerts
   */
  public async notifyPriceAlert(propertyTitle: string, oldPrice: number, newPrice: number) {
    const priceChange = newPrice > oldPrice ? 'tăng' : 'giảm'
    const changeAmount = Math.abs(newPrice - oldPrice)
    
    await this.showNotification({
      title: 'Cảnh báo thay đổi giá',
      body: `"${propertyTitle}" đã ${priceChange} giá ${changeAmount.toLocaleString('vi-VN')} VNĐ`,
      tag: 'price-alert',
      actions: [
        {
          action: 'view-property',
          title: 'Xem BĐS'
        },
        {
          action: 'contact-agent',
          title: 'Liên hệ môi giới'
        }
      ],
      data: {
        type: 'price-alert',
        propertyTitle,
        oldPrice,
        newPrice
      }
    })
  }

  /**
   * Show notification for new properties matching saved searches
   */
  public async notifyNewProperty(propertyTitle: string, location: string, price: number) {
    await this.showNotification({
      title: 'BĐS mới phù hợp với tìm kiếm của bạn',
      body: `${propertyTitle} tại ${location} - ${price.toLocaleString('vi-VN')} VNĐ`,
      tag: 'new-property',
      actions: [
        {
          action: 'view-property',
          title: 'Xem ngay'
        },
        {
          action: 'save-favorite',
          title: 'Lưu yêu thích'
        }
      ],
      data: {
        type: 'new-property',
        propertyTitle,
        location,
        price
      }
    })
  }

  /**
   * Show notification for appointment reminders
   */
  public async notifyAppointment(propertyTitle: string, appointmentTime: Date) {
    await this.showNotification({
      title: 'Nhắc lịch xem nhà',
      body: `Bạn có lịch xem "${propertyTitle}" lúc ${appointmentTime.toLocaleString('vi-VN')}`,
      tag: 'appointment-reminder',
      requireInteraction: true,
      actions: [
        {
          action: 'confirm',
          title: 'Xác nhận'
        },
        {
          action: 'reschedule',
          title: 'Dời lịch'
        }
      ],
      data: {
        type: 'appointment',
        propertyTitle,
        appointmentTime: appointmentTime.toISOString()
      }
    })
  }

  /**
   * Clear notifications by tag
   */
  public async clearNotifications(tag?: string) {
    if (this.registration && 'getNotifications' in this.registration) {
      const notifications = await this.registration.getNotifications({ tag })
      notifications.forEach(notification => notification.close())
    }
  }

  /**
   * Handle notification click events
   */
  public handleNotificationClick(event: NotificationEvent) {
    const notification = event.notification
    const data = notification.data

    notification.close()

    // Handle different actions
    if (event.action) {
      switch (event.action) {
        case 'reply':
          // Open chat interface
          this.openChat(data.chatId)
          break
        case 'view-property':
          // Open property detail
          this.openProperty(data.propertyTitle)
          break
        case 'view-inquiry':
          // Open inquiries page
          this.openPage('/admin/inquiries')
          break
        case 'contact':
        case 'contact-agent':
          // Open contact form or chat
          this.openChat()
          break
        default:
          this.openPage('/')
      }
    } else {
      // Handle notification click without action
      switch (data?.type) {
        case 'message':
          this.openChat(data.chatId)
          break
        case 'property-inquiry':
        case 'new-property':
          this.openPage('/')
          break
        default:
          this.openPage('/')
      }
    }
  }

  private openChat(chatId?: string) {
    // Implementation would open chat interface
    console.log('Opening chat:', chatId)
  }

  private openProperty(propertyTitle: string) {
    // Implementation would search and open property
    console.log('Opening property:', propertyTitle)
  }

  private openPage(path: string) {
    if ('clients' in self) {
      // In service worker context
      ;(self as any).clients.openWindow(path)
    } else {
      // In main thread
      window.open(path, '_blank')
    }
  }
}

export default NotificationService

// Export singleton instance
export const notificationService = NotificationService.getInstance()

// Notification action types
export interface NotificationAction {
  action: string
  title: string
  icon?: string
}