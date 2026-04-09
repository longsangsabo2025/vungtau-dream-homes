import { toast } from 'sonner'
import { CheckCircle2, XCircle, AlertTriangle, Info, Loader2 } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'

interface ToastOptions {
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * Custom toast utilities with consistent styling
 */
export const showToast = {
  success: (options: ToastOptions) => {
    toast.success(options.title, {
      description: options.description,
      duration: options.duration || 4000,
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      action: options.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    })
  },

  error: (options: ToastOptions) => {
    toast.error(options.title, {
      description: options.description,
      duration: options.duration || 6000,
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      action: options.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    })
  },

  warning: (options: ToastOptions) => {
    toast.warning(options.title, {
      description: options.description,
      duration: options.duration || 5000,
      icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
      action: options.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    })
  },

  info: (options: ToastOptions) => {
    toast.info(options.title, {
      description: options.description,
      duration: options.duration || 4000,
      icon: <Info className="h-5 w-5 text-blue-500" />,
      action: options.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    })
  },

  loading: (options: Omit<ToastOptions, 'duration'>) => {
    return toast.loading(options.title, {
      description: options.description,
      icon: <Loader2 className="h-5 w-5 text-primary animate-spin" />,
    })
  },

  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId)
  },

  // Promise wrapper for async operations
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    })
  },
}

// Quick helpers for common actions
export const toastSuccess = (message: string, description?: string) => 
  showToast.success({ title: message, description })

export const toastError = (message: string, description?: string) => 
  showToast.error({ title: message, description })

export const toastWarning = (message: string, description?: string) => 
  showToast.warning({ title: message, description })

export const toastInfo = (message: string, description?: string) => 
  showToast.info({ title: message, description })

// Common toast messages for the app
export const appToast = {
  // Property actions
  propertyCreated: () => showToast.success({
    title: 'Đăng tin thành công!',
    description: 'Tin đăng của bạn đang chờ duyệt.',
  }),
  propertyUpdated: () => showToast.success({
    title: 'Cập nhật thành công!',
    description: 'Thông tin bất động sản đã được lưu.',
  }),
  propertyDeleted: () => showToast.success({
    title: 'Đã xóa tin đăng',
  }),

  // Favorites
  addedToFavorites: () => showToast.success({
    title: 'Đã thêm vào yêu thích',
    description: 'Xem tất cả trong mục Yêu thích của bạn.',
  }),
  removedFromFavorites: () => showToast.info({
    title: 'Đã bỏ yêu thích',
  }),

  // Auth
  loginSuccess: () => showToast.success({
    title: 'Đăng nhập thành công!',
    description: 'Chào mừng bạn quay lại.',
  }),
  logoutSuccess: () => showToast.info({
    title: 'Đã đăng xuất',
  }),
  registerSuccess: () => showToast.success({
    title: 'Đăng ký thành công!',
    description: 'Vui lòng kiểm tra email để xác thực tài khoản.',
  }),

  // Inquiry
  inquirySent: () => showToast.success({
    title: 'Gửi yêu cầu thành công!',
    description: 'Chúng tôi sẽ liên hệ lại sớm nhất.',
  }),
  inquiryRateLimit: () => showToast.warning({
    title: 'Bạn đã gửi yêu cầu rồi',
    description: 'Vui lòng chờ phản hồi hoặc thử lại sau 24 giờ.',
  }),

  // Errors
  networkError: () => showToast.error({
    title: 'Lỗi kết nối',
    description: 'Vui lòng kiểm tra kết nối mạng và thử lại.',
  }),
  serverError: () => showToast.error({
    title: 'Lỗi hệ thống',
    description: 'Đã có lỗi xảy ra, vui lòng thử lại sau.',
  }),
  unauthorized: () => showToast.error({
    title: 'Phiên đăng nhập hết hạn',
    description: 'Vui lòng đăng nhập lại.',
  }),
}

export default showToast
